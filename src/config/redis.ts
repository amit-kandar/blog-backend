import * as redis from 'redis';
import logger from './logger';

const redisURL = process.env.REDIS_URL || 'redis://localhost:6379';

// Parse Redis URL
const redisOptions = redisURL.startsWith('redis://')
    ? { url: redisURL }
    : { host: 'localhost', port: 6379 };

// Redis client configuration
const redisClient = redis.createClient(redisOptions);

redisClient.on('connect', () => {
    logger.info('Connected to Redis');
});

redisClient.on('error', (err) => {
    logger.error('Redis error:', err);
});

export default redisClient;