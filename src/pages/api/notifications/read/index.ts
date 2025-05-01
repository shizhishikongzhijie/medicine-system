import type { NextApiRequest, NextApiResponse } from 'next'

import { getUid } from '@/tools/cookie'
import { RedisClientInstance } from '@/tools/redis'
import ResponseService from '@/tools/res'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { id } = req.body
    if (!id) {
        return ResponseService.error(res, 400, '参数错误')
    }
    const uid = await getUid(req, res)
    const redisKey = `notifications:${uid}`
    try {
        //查看通知
        await RedisClientInstance.selectDb(1)
        const isHas = await RedisClientInstance.hexists(redisKey, 'not-read')
        console.log('isHas:' + isHas)
        if (isHas) {
            let result: number[] | null = await RedisClientInstance.hget(
                redisKey,
                'not-read'
            )
            result = result?.filter((item: any) => item !== id) || []
            console.log(`result 类型是数组: ${Array.isArray(result)} ${result}`) // 修复行
            //if (result.length === 0) {
            //    console.log('删除成功')
            //    await RedisClientInstance.hdel(redisKey, 'not-read')
            //} else {
            await RedisClientInstance.hset(redisKey, 'not-read', [...result])
            //}
        }
        return ResponseService.success(res, '查看成功')
    } catch (error) {
        return ResponseService.error(res, 500, '服务器错误')
    }
}
