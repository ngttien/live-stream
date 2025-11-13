const crypto = require('crypto');

/**
 * Generate random string
 */
const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Sleep function
 */
const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Sanitize string
 */
const sanitizeString = (str) => {
  return str.trim().replace(/[<>]/g, '');
};

/**
 * Format duration
 */
const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
};

/**
 * Paginate array
 */
const paginate = (array, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  return {
    data: array.slice(offset, offset + limit),
    page,
    limit,
    total: array.length,
    totalPages: Math.ceil(array.length / limit)
  };
};

/**
 * Check if email is valid
 */
const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Check if username is valid
 */
const isValidUsername = (username) => {
  const regex = /^[a-zA-Z0-9_]{3,30}$/;
  return regex.test(username);
};

/**
 * Generate room ID
 */
const generateRoomId = () => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `room_${timestamp}_${randomStr}`;
};

/**
 * Parse user agent
 */
const parseUserAgent = (userAgent) => {
  const isMobile = /mobile|android|iphone|ipad|ipod/i.test(userAgent);
  const isTablet = /tablet|ipad/i.test(userAgent);
  const isDesktop = !isMobile && !isTablet;

  return { isMobile, isTablet, isDesktop };
};

/**
 * Calculate percentage
 */
const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

/**
 * Truncate string
 */
const truncateString = (str, maxLength = 50) => {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
};

/**
 * Get time ago string
 */
const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);

  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) return interval + (interval === 1 ? ' year ago' : ' years ago');

  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) return interval + (interval === 1 ? ' month ago' : ' months ago');

  interval = Math.floor(seconds / 86400);
  if (interval >= 1) return interval + (interval === 1 ? ' day ago' : ' days ago');

  interval = Math.floor(seconds / 3600);
  if (interval >= 1) return interval + (interval === 1 ? ' hour ago' : ' hours ago');

  interval = Math.floor(seconds / 60);
  if (interval >= 1) return interval + (interval === 1 ? ' minute ago' : ' minutes ago');

  return 'just now';
};

/**
 * Deep clone object
 */
const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Remove duplicates from array
 */
const removeDuplicates = (array, key) => {
  if (!key) {
    return [...new Set(array)];
  }

  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
};

/**
 * Retry async function
 */
const retryAsync = async (fn, maxRetries = 3, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await sleep(delay * (i + 1));
    }
  }
};

// Export all helpers
module.exports = {
  generateRandomString,
  sleep,
  sanitizeString,
  formatDuration,
  paginate,
  isValidEmail,
  isValidUsername,
  generateRoomId,
  parseUserAgent,
  calculatePercentage,
  truncateString,
  timeAgo,
  deepClone,
  removeDuplicates,
  retryAsync
};