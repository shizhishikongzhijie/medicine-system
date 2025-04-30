'use server'
import type { NextApiRequest, NextApiResponse } from 'next'
import { parseCookies, setCookie } from 'nookies'

import type { UserTokenType } from '@/tools/axios/type'
import jwtService from '@/tools/jwt'
import logger from '@/tools/logger'

export async function getUid(req: NextApiRequest, res: NextApiResponse) {
    const cookies = parseCookies({ req })
    let token = cookies.AccessToken
    let uid: number = -1
    // 检查请求的 cookies 中是否包含 'AccessToken'，如果没有则尝试从 'RefreshToken' 中获取
    if (!token) {
        token = cookies.RefreshToken
        //更新AccessToken
        setCookie({ res }, 'AccessToken', token, {
            maxAge: process.env.EXPIRATION_TIME_ACCESS_TOKEN,
            path: '/',
            httpOnly: false, // 确保这个不是 true，否则 JavaScript 无法访问
            secure: false // 根据环境变量决定是否开启安全属性
        })
    }
    if (token && !jwtService.isTokenExpired(token)) {
        try {
            const user: UserTokenType = jwtService.verifyToken(token) // 验证 Token
            uid = user.id
            logger.info('Token 验证成功: 用户信息:', user) // 示例：打印用户信息（根据需求使用）
        } catch (error) {
            logger.error('Token 验证失败:', error)
        }
    }
    return uid
}
