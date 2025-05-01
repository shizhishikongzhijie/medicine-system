import type { NextApiRequest, NextApiResponse } from 'next'

import type { NotificationUser } from '@/component/Page/NotificationPage/type'
import pool from '@/db/index.js'
import { getUid } from '@/tools/cookie'
import logger from '@/tools/logger'
import { RedisClientInstance } from '@/tools/redis'
import ResponseService from '@/tools/res'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    switch (req.method) {
        case 'GET':
            return getNotifications(req, res)
        case 'POST':
            return addNotifications(req, res)
        case 'PATCH':
            return updateNotifications(req, res)
        // case 'DELETE':
        //     return deleteNotifications(req, res);
        default:
            return res.status(405).end(`Method ${req.method} Not Allowed`)
    }
}
const getNotifications = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const {
            isRead,
            searchInfo,
            index,
            pageSize
        }: {
            isRead?: string | number
            searchInfo?: string | string[]
            index?: string | string[]
            pageSize?: string | string[]
        } = req.query //是否能读 0 可以： 1 不行 如果没有，则是全部的

        // 处理类型转换和默认值
        const searchValue = typeof searchInfo === 'string' ? searchInfo : ''
        const pageNum = typeof index === 'string' ? parseInt(index, 10) : 1
        const pageSizeNum =
            typeof pageSize === 'string' ? parseInt(pageSize, 10) : 5
        // 安全处理分页参数
        const offset = (pageNum - 1) * pageSizeNum
        const uid = await getUid(req, res)
        if (uid === -1) {
            return ResponseService.error(res, 404, '用户未登录')
        }
        const redisKey = `notifications:${uid}`
        await RedisClientInstance.selectDb(1)
        const isHas = await RedisClientInstance.hexists(redisKey, 'not-read')

        if (isRead) {
            //格式化为number
            const isReadNum = Number(isRead)
            if (isReadNum === 0 || isReadNum === 1) {
                //从redis中获取用户未读的记录
                if (isHas) {
                    //有则添加数据
                    let redisResult: number[] | null = []
                    redisResult = await RedisClientInstance.hget(
                        redisKey,
                        'not-read'
                    )
                    const query = `SELECT *
                                   FROM notifications
                                   WHERE is_read = ?`
                    let [result]: any[] = await pool.query(query, [isReadNum])
                    result = result.map((item) => {
                        return {
                            ...item,
                            has_read:
                                redisResult && !redisResult.includes(item.id)
                        }
                    })
                    return ResponseService.success(res, '查询成功', result)
                } else {
                    //没有则增加所有
                    const query = `SELECT *
                                   FROM notifications
                                   WHERE is_read = ?`
                    let [result]: any[] = await pool.query(query, isReadNum)
                    result = result.map((item) => {
                        return {
                            ...item,
                            has_read: true
                        }
                    })
                    return ResponseService.success(res, '查询成功', result)
                }
            } else {
                return ResponseService.error(res, 400, 'isRead参数错误')
            }
        } else {
            const queryCount = `SELECT COUNT(1) AS count
                                FROM notifications
                                WHERE title LIKE ?
                                   OR content LIKE ?`
            const query = `
                SELECT notice.*, u.username AS created_by_name
                FROM notifications notice,
                     users u
                WHERE title LIKE ?
                   OR content LIKE ?
                    AND notice.created_by = u.id
                ORDER BY id DESC
                LIMIT ? OFFSET ?
            `
            const [countResult]: any[] = await pool.query(queryCount, [
                `%${searchValue}%`,
                `%${searchValue}%`
            ])
            const [dataResult]: any[] = await pool.query(query, [
                `%${searchValue}%`,
                `%${searchValue}%`,
                pageSizeNum,
                offset
            ])
            let redisResult: number[] | null = []
            if (isHas) {
                redisResult = await RedisClientInstance.hget(
                    redisKey,
                    'not-read'
                )
            }
            return ResponseService.success(res, '查询成功', {
                count: countResult[0].count,
                data: dataResult.map((item) => {
                    return {
                        ...item,
                        has_read: redisResult && !redisResult.includes(item.id)
                    }
                })
            })
        }
    } catch (error) {
        logger.error('Error fetching Notifications:', error)
        return ResponseService.error(res, 400, String(error))
    }
}
const addNotifications = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const { title, content } = req.body
        if (!title || !content) {
            return ResponseService.error(res, 400, '参数错误')
        } else {
            // 获取当前登录用户的ID
            const uid = await getUid(req, res)

            if (uid === -1) {
                return ResponseService.error(res, 404, '用户未登录')
            }
            const query = `INSERT INTO notifications (title, content, created_by)
                           VALUES (?, ?, ?)`
            const [result]: any[] = await pool.query(query, [
                title,
                content,
                uid
            ])
            //为所有用户增加redis记录通知
            const redisUserQuery = `SELECT id
                                    FROM users`
            const [redisUserResult]: any[] = await pool.query(redisUserQuery)
            for (const user of redisUserResult) {
                const uid = user.id
                await RedisClientInstance.selectDb(1)
                const redisKey = `notifications:${uid}`
                const isHas = await RedisClientInstance.hexists(
                    redisKey,
                    'not-read'
                )
                if (isHas) {
                    //有则添加数据
                    const result = await RedisClientInstance.hget(
                        redisKey,
                        'not-read'
                    )
                    await RedisClientInstance.hset(redisKey, 'not-read', [
                        ...result,
                        result.insertId
                    ])
                } else {
                    //无则增加redis
                    await RedisClientInstance.hset(redisKey, 'not-read', [
                        result.insertId
                    ])
                }
            }
            return ResponseService.success(res, '添加成功', result)
        }
    } catch (error) {
        logger.error('Error fetching Notifications:', error)
        return ResponseService.error(res, 400, String(error))
    }
}

const updateNotifications = async (
    req: NextApiRequest,
    res: NextApiResponse
) => {
    const { title, content, is_read, id }: NotificationUser = req.body
    const query = `UPDATE notifications
                   SET title   = ?,
                       content = ?,
                       is_read = ?
                   WHERE id = ?`
    try {
        const uid = await getUid(req, res)
        if (uid === -1) {
            return ResponseService.error(res, 404, '用户未登录')
        }
        const redisKey = `notifications:${uid}`
        const isHas = await RedisClientInstance.hexists(redisKey, 'not-read')

        const [result]: any[] = await pool.query(query, [
            title,
            content,
            is_read,
            id
        ])
        if (is_read) {
            //展示
            if (isHas) {
                //拥有redis
                const redisResult: number[] | null =
                    await RedisClientInstance.hget(redisKey, 'not-read')
                if (!redisResult?.includes(id)) {
                    await RedisClientInstance.hset(redisKey, 'not-read', [
                        ...(redisResult ?? []),
                        id
                    ])
                }
            } else {
                await RedisClientInstance.hset(redisKey, 'not-read', [id])
            }
        }
        return ResponseService.success(res, '更新成功', result)
    } catch (error) {
        logger.error('Error fetching Notifications:', error)
        return ResponseService.error(res, 400, String(error))
    }
}
