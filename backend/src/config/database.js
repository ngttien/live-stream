const { Pool } = require('pg')
const logger = require('../utils/logger')

// Parse DATABASE_URL if it exists
let poolConfig = {}

if (process.env.DATABASE_URL) {
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: false
    } : false,
  }
} else {
  // Fallback to individual parameters
  poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'livestream_db',
  }
}

const pool = new Pool({
  ...poolConfig,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
})

// Connection event handlers
pool.on('connect', () => {
  logger.info('New database connection established')
})

pool.on('error', (err) => {
  logger.error('Unexpected database error:', err.message)

  // Don't exit process, just log the error
  if (err.code === 'ECONNREFUSED') {
    logger.error('Make sure PostgreSQL is running on the correct host and port')
    logger.error(`   Current connection: ${process.env.DATABASE_URL || 'localhost:5432'}`)
  }
})

// Test connection function
const testConnection = async () => {
  try {
    const client = await pool.connect()
    const result = await client.query('SELECT NOW()')
    client.release()
    logger.info(`Database connection verified at ${result.rows[0].now}`)
    return true
  } catch (error) {
    logger.error('Database connection test failed:', error.message)
    return false
  }
}

// Query helper with error handling
const query = async (text, params) => {
  const start = Date.now()
  try {
    const result = await pool.query(text, params)
    const duration = Date.now() - start

    if (process.env.NODE_ENV === 'development') {
      logger.debug('Executed query', {
        text: text.substring(0, 100),
        duration,
        rows: result.rowCount
      })
    }

    return result
  } catch (error) {
    logger.error('Query error:', {
      text: text.substring(0, 100),
      error: error.message
    })
    throw error
  }
}

// Transaction helper
const transaction = async (callback) => {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

module.exports = {
  query,
  transaction,
  pool,
  testConnection
}