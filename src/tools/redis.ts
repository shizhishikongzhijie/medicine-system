// utils/redis.ts
import Redis from 'ioredis'

import logger from '@/tools/logger'

class RedisClient {
    private static instance: RedisClient
    private redisClient: Redis

    // 当前使用的数据库索引
    private currentDb: number = 0

    private constructor() {
        // 初始化 Redis 客户端
        this.redisClient = new Redis({
            host: process.env.REDIS_HOST || '127.0.0.1',
            port: parseInt(process.env.REDIS_PORT || '6379'),
            password: process.env.REDIS_PASSWORD || '',
            db: parseInt(process.env.REDIS_DB || '0'), // 默认使用配置文件中的 DB
            connectTimeout: parseInt(
                process.env.REDIS_CONNECT_TIMEOUT || '3000'
            ),
            retryStrategy(times) {
                // 当连接失败时的重试策略
                logger.error('Redis connection error: time out ' + times)
                return Math.min(times * 50, 2000)
            }
        })

        // 监听连接错误
        this.redisClient.on('error', (error) => {
            console.error('Redis connection error:', error)
        })

        // 监听连接成功
        this.redisClient.on('connect', () => {
            console.log(`Connected to Redis (DB ${this.currentDb})`)
        })
    }

    // 单例模式：确保只有一个 Redis 实例
    public static getInstance(): RedisClient {
        if (!RedisClient.instance) {
            RedisClient.instance = new RedisClient()
        }
        return RedisClient.instance
    }

    // 切换数据库
    public async selectDb(dbIndex: number): Promise<void> {
        try {
            await this.redisClient.select(dbIndex)
            this.currentDb = dbIndex
            console.log(`Switched to Redis DB ${dbIndex}`)
        } catch (error) {
            console.error('Error switching Redis DB:', error)
            throw error
        }
    }

    // 设置键值对（支持设置过期时间）
    public async set(key: string, value: any, ttl?: number): Promise<void> {
        try {
            const serializedValue = this.serialize(value)
            if (ttl) {
                await this.redisClient.set(key, serializedValue, 'EX', ttl) // 设置过期时间（秒）
            } else {
                await this.redisClient.set(key, serializedValue)
            }
        } catch (error) {
            console.error('Redis set error:', error)
            throw error
        }
    }

    // 获取键的值并反序列化
    public async get<T = any>(key: string): Promise<T | null> {
        try {
            const value = await this.redisClient.get(key)
            return this.deserialize(value)
        } catch (error) {
            console.error('Redis get error:', error)
            throw error
        }
    }

    // 删除键
    public async del(key: string): Promise<void> {
        try {
            await this.redisClient.del(key)
        } catch (error) {
            console.error('Redis del error:', error)
            throw error
        }
    }

    // 检查键是否存在
    public async exists(key: string): Promise<boolean> {
        try {
            const result = await this.redisClient.exists(key)
            return result === 1
        } catch (error) {
            console.error('Redis exists error:', error)
            throw error
        }
    }

    // 设置哈希字段（支持复杂对象）
    public async hset(key: string, field: string, value: any): Promise<void> {
        try {
            const serializedValue = this.serialize(value)
            await this.redisClient.hset(key, field, serializedValue)
        } catch (error) {
            console.error('Redis hset error:', error)
            throw error
        }
    }

    // 获取哈希字段的值并反序列化
    public async hget<T = any>(key: string, field: string): Promise<T | null> {
        try {
            const value = await this.redisClient.hget(key, field)
            return this.deserialize(value)
        } catch (error) {
            console.error('Redis hget error:', error)
            throw error
        }
    }

    // 在 RedisClient 类中新增 hdel 方法
    public async hdel(key: string, field: string): Promise<void> {
        try {
            await this.redisClient.hdel(key, field)
        } catch (error) {
            console.error('Redis hdel error:', error)
            throw error
        }
    }

    // 检查键是否存在
    public async hexists(key: string, field: string): Promise<boolean> {
        try {
            const result = await this.redisClient.hexists(key, field)
            console.log(`Redis hdel exists ${result}`)
            return result === 1
        } catch (error) {
            console.error('Redis exists error:', error)
            throw error
        }
    }

    // 删除 Redis 客户端连接
    public async quit(): Promise<void> {
        try {
            await this.redisClient.quit()
            console.log('Redis client disconnected')
        } catch (error) {
            console.error('Redis quit error:', error)
            throw error
        }
    }

    // 将值序列化为 JSON 字符串
    private serialize(value: any): string {
        return JSON.stringify(value)
    }

    // 将 JSON 字符串反序列化为原始值
    private deserialize(value: string | null): any {
        if (!value) return null
        try {
            return JSON.parse(value)
        } catch (error) {
            console.error('Error deserializing JSON:', error)
            return value // 返回原始字符串以防解析失败
        }
    }
}

export const RedisClientInstance = RedisClient.getInstance()
