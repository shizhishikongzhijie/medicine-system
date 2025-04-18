import type { NextApiRequest, NextApiResponse } from 'next'

import { getUid } from '@/tools/cookie'
import { RedisClientInstance } from '@/tools/redis'
import ResponseService from '@/tools/res'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { id } = req.query || req.body
    if (!id) {
        return ResponseService.error(res, 400, '参数错误')
    }
    const uid = getUid(req, res)
    await RedisClientInstance.selectDb(1)
    const redisKey = `notifications:${uid}`
    try {
        //查看通知
        const isVoild = await RedisClientInstance.exists(redisKey)
        if (isVoild) {
            const result = await RedisClientInstance.hget(redisKey, 'not-read')
            result.filter((item: any) => item !== id)
            await RedisClientInstance.hset(redisKey, 'not-read', result)
        }
        return ResponseService.success(res, '查看成功')
    } catch (error) {
        return ResponseService.error(res, 500, '服务器错误')
    }
}
