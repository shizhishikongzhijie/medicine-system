import type {NextApiRequest, NextApiResponse} from 'next';

import logger from "@/tools/logger";
import {RedisClientInstance} from "@/tools/redis";
import ResponseService from "@/tools/res";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case 'GET':
            return getRedis(req, res);
        // case 'PATCH':
        //     return updateUserInfo(req, res);
        case 'DELETE':
            return deleteRedis(req, res);
        default:
            return ResponseService.error(res, 405, `Method ${req.method} Not Allowed`);
    }
}
const getRedis = async (req: NextApiRequest, res: NextApiResponse) => {
    const key = req.query.key as string | undefined;
    const db = req.query.db as number | undefined;
    // 检查 key 是否为 undefined 或空字符串
    if (key === undefined || key === '' || db === undefined) {
        logger.error('Key is required');
        return ResponseService.error(res, 400, 'Key is required');
    }

    try {
        await RedisClientInstance.selectDb(db);
        const isVoild = await RedisClientInstance.exists(key);
        if (!isVoild) {
            return ResponseService.error(res, 404, 'Key not found');
        }
        const result = await RedisClientInstance.get(key); // 确保传递给 Redis 的键为字符串
        return ResponseService.success(res, "查询成功", {key: key, value: result});
    } catch (error) {
        logger.error('Error fetching Redis data:', error);
        return ResponseService.error(res, 500, 'Internal Server Error');
    }
}
const deleteRedis = async (req: NextApiRequest, res: NextApiResponse) => {
    const key = req.query.key as string | undefined;
    const db = req.query.db as number | undefined;
    // 检查 key 是否为 undefined 或空字符串
    if (key === undefined || key === '' || db === undefined) {
        logger.error('Key is required');
        return ResponseService.error(res, 400, 'Key is required');
    }

    try {
        await RedisClientInstance.selectDb(db);
        await RedisClientInstance.del(key); // 确保传递给 Redis 的键为字符串
        return ResponseService.success(res, "删除成功", {key});
    } catch (error) {
        logger.error('Error fetching Redis data:', error);
        return ResponseService.error(res, 500, 'Internal Server Error');
    }
}