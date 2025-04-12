import type { NextApiRequest, NextApiResponse } from 'next'

import pool from '@/db/index.js'
import { getUid } from '@/tools/cookie'
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
        // case 'PATCH':
        //     return updateNotifications(req, res);
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
        if (isRead) {
            //格式化为number
            const isReadNum = Number(isRead)
            if (isReadNum === 0 || isReadNum === 1) {
                const query = `SELECT *
                               FROM notifications
                               WHERE is_read = ?`
                const [result]: any[] = await pool.query(query, isReadNum)
                return ResponseService.success(res, '查询成功', result)
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
            return ResponseService.success(res, '查询成功', {
                count: countResult[0].count,
                data: dataResult
            })
        }
    } catch (error) {
        console.error('Error fetching Notifications:', error)
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
            const uid = getUid(req, res)
            if (!uid) {
                return ResponseService.error(res, 404, '用户未登录')
            }
            const query = `INSERT INTO notifications (title, content, created_by)
                           VALUES (?, ?, ?)`
            const [result]: any[] = await pool.query(query, [
                title,
                content,
                uid
            ])
            return ResponseService.success(res, '添加成功', result)
        }
    } catch (error) {
        console.error('Error fetching Notifications:', error)
    }
}
