import type { NextApiRequest, NextApiResponse } from 'next'

import pool from '@/db/index.js'
import logger from '@/tools/logger'
import ResponseService from '@/tools/res'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    switch (req.method) {
        case 'GET':
            return getRoles(req, res)
        // case 'POST':
        //     return addMenus(req, res);
        case 'PATCH':
            return updateRoles(req, res)
        // case 'DELETE':
        //     return deleteMenus(req, res);
        default:
            return res.status(405).end(`Method ${req.method} Not Allowed`)
    }
}
const getRoles = async (req: NextApiRequest, res: NextApiResponse) => {
    const {
        searchInfo,
        role_id,
        index,
        pageSize
    }: {
        searchInfo?: string | string[]
        role_id?: string | string[]
        index?: string | string[]
        pageSize?: string | string[]
    } = req.query
    // 处理类型转换和默认值
    const searchValue = typeof searchInfo === 'string' ? searchInfo : ''
    const role_idNum =
        typeof role_id === 'string' && role_id ? parseInt(role_id, 10) : 0
    const pageNum = typeof index === 'string' ? parseInt(index, 10) : 1
    const pageSizeNum =
        typeof pageSize === 'string' ? parseInt(pageSize, 10) : 5
    // 安全处理分页参数
    const offset = (pageNum - 1) * pageSizeNum

    let queryCount = `
        SELECT COUNT(1) AS count
        FROM users u
                 INNER JOIN user_roles ur ON u.id = ur.user_id
                 INNER JOIN roles r ON ur.role_id = r.id
        WHERE (
            u.username LIKE ?
                OR u.full_name LIKE ?
                OR u.id LIKE ?
                OR u.id_number LIKE ?
            )
          AND role_id = ?
    `
    if (role_idNum === 0) {
        queryCount = `
            SELECT COUNT(1) AS count
            FROM users u
                     INNER JOIN user_roles ur ON u.id = ur.user_id
                     INNER JOIN roles r ON ur.role_id = r.id
            WHERE u.username LIKE ?
               OR u.full_name LIKE ?
               OR u.id LIKE ?
               OR u.id_number LIKE ?
        `
    }
    let queryUserRole = `
        SELECT u.id,
               u.username,
               u.full_name,
               u.id_number,
               ur.role_id,
               r.name AS role_name
        FROM users u
                 INNER JOIN user_roles ur ON u.id = ur.user_id
                 INNER JOIN roles r ON ur.role_id = r.id
        WHERE (
            u.username LIKE ?
                OR u.full_name LIKE ?
                OR u.id LIKE ?
                OR u.id_number LIKE ?
            )
          AND role_id = ?
        ORDER BY u.id DESC
        LIMIT ? OFFSET ?
    `
    if (role_idNum === 0) {
        queryUserRole = `
            SELECT u.id,
                   u.username,
                   u.full_name,
                   u.id_number,
                   ur.role_id,
                   r.name AS role_name
            FROM users u
                     INNER JOIN user_roles ur ON u.id = ur.user_id
                     INNER JOIN roles r ON ur.role_id = r.id
            WHERE (
                      u.username LIKE ?
                          OR u.full_name LIKE ?
                          OR u.id LIKE ?
                          OR u.id_number LIKE ?
                      )
            ORDER BY u.id DESC
            LIMIT ? OFFSET ?
        `
    }
    const queryRole = `
        SELECT r.id,
               r.name
        FROM roles r
    `

    try {
        const dataList: (string | number)[] = [
            `%${searchValue}%`,
            `%${searchValue}%`,
            `%${searchValue}%`,
            `%${searchValue}%`
        ]
        if (role_idNum !== 0) {
            dataList.push(role_idNum)
        }
        const [countResult]: any[] = await pool.query(queryCount, [...dataList])
        const [userRolesResult]: any[] = await pool.query(queryUserRole, [
            ...dataList,
            pageSizeNum,
            offset
        ])
        const [roleResult]: any[] = await pool.query(queryRole)
        return ResponseService.success(res, '查询成功', {
            count: countResult[0].count,
            data: userRolesResult,
            role: roleResult
        })
    } catch (error) {
        logger.error('Error fetching Roles:', error)
        return ResponseService.error(res, 400, String(error))
    }
}
const updateRoles = async (req: NextApiRequest, res: NextApiResponse) => {
    const { role_id, user_ids }: { role_id: number; user_ids: number[] } =
        req.body
    const query = `
        UPDATE user_roles
        SET role_id = ?
        WHERE user_id IN (?)
    `
    try {
        const [result]: any[] = await pool.query(query, [role_id, user_ids])
        return ResponseService.success(res, '更新成功', result)
    } catch (error) {
        logger.error('Error fetching Roles:', error)
        return ResponseService.error(res, 400, String(error))
    }
}
