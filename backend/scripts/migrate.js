// File: backend/scripts/migrate.js
const fs = require('fs');
const path = require('path');
const db = require('../src/config/database');
const logger = require('../src/utils/logger');

async function runMigration() {
  try {
    logger.info('Starting database migration...');

    // Read schema file
    const schemaPath = path.join(__dirname, '../db/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Split by semicolons and execute each statement
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      logger.info(`Executing statement ${i + 1}/${statements.length}`);
      
      try {
        await db.query(statement);
      } catch (error) {
        // Ignore errors for IF NOT EXISTS and CREATE OR REPLACE
        if (!error.message.includes('already exists')) {
          throw error;
        }
      }
    }

    logger.info('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();