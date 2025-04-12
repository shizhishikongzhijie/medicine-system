import type { NextApiRequest, NextApiResponse } from 'next'

import type { UserTokenType } from '@/tools/axios/type'
import jwtService from '@/tools/jwt'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { refreshToken } = req.body
    if (!refreshToken)
        return res.status(400).json({ message: 'Refresh token is required' })
    //创建jwt
    if (jwtService.isTokenExpired(refreshToken))
        return res.status(304).json({ message: 'Refresh token is expired' })
    const user: UserTokenType = jwtService.verifyToken(refreshToken)
    console.log(user)
    return res.status(200).json({
        accessToken: jwtService.generateToken(
            {
                id: user.id,
                username: user.username
            },
            {
                expiresIn: '7d'
            }
        )
    })
}
