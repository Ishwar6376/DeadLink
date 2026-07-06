import { Redis } from 'ioredis';

let redisClient: Redis;
let isRedisConnected = false;

const inMemoryCache = new Map<string, { value: string, expiry: number | null }>();


setInterval(() => {
    const now = Date.now();
    for (const [key, data] of inMemoryCache.entries()) {
        if (data.expiry && now > data.expiry) {
            inMemoryCache.delete(key);
        }
    }
}, 60000).unref();
const redis_host = process.env.REDIS_HOST;
const redis_port = process.env.REDIS_PORT;
const redis_password = process.env.REDIS_PASSWORD;
const redis_username = process.env.REDIS_USERNAME;


console.log(redis_host,redis_port,redis_password,redis_username);


export const redis = {
    async connect(): Promise<boolean> {
        try {
            redisClient = new Redis({
                host: redis_host,
                port: redis_port ? parseInt(redis_port, 10) : undefined,
                username: redis_username,
                password: redis_password,
                lazyConnect: true
            });
            
            // Attach error listener to prevent Node.js "Unhandled error event" crashes
            redisClient.on('error', (err) => {
                console.warn("[ioredis] connection error:", err.message);
            });

            await redisClient.connect();
            isRedisConnected = true;
            return true;
        } catch (err) {
            console.warn("Redis connection failed. Falling back to in-memory RAM cache.", err);
            isRedisConnected = false;
            
            // Stop ioredis from continuously retrying in the background
            if (redisClient) {
                redisClient.disconnect();
            }
            
            return false;
        }
    },
    async get(key: string): Promise<string | null> {
        if (isRedisConnected) {
            try {
                return await redisClient.get(key);
            } catch (err) {
                console.error("Redis get error:", err);
            }
        }
        const data = inMemoryCache.get(key);
        if (data) {
            if (data.expiry && Date.now() > data.expiry) {
                inMemoryCache.delete(key);
                return null;
            }
            return data.value;
        }
        return null;
    },
    async set(key: string, value: string): Promise<void> {
        if (isRedisConnected) {
            try {
                await redisClient.set(key, value);
                return;
            } catch (err) {
                console.error("Redis set error:", err);
            }
        }
        inMemoryCache.set(key, { value, expiry: null });
    },
    async expire(key: string, ttlSeconds: number): Promise<void> {
        if (isRedisConnected) {
            try {
                await redisClient.expire(key, ttlSeconds);
                return;
            } catch (err) {
                console.error("Redis expire error:", err);
            }
        }
        const data = inMemoryCache.get(key);
        if (data) {
            data.expiry = Date.now() + (ttlSeconds * 1000);
            inMemoryCache.set(key, data);
        }
    },
    async del(key: string): Promise<void> {
        if (isRedisConnected) {
            try {
                await redisClient.del(key);
                return;
            } catch (err) {
                console.error("Redis del error:", err);
            }
        }
        inMemoryCache.delete(key);
    }
};
