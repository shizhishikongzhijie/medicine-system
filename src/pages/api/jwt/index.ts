import type { NextApiRequest, NextApiResponse } from 'next'

import jwtService from '@/tools/jwt'
import logger from '@/tools/logger'
import ResponseService from '@/tools/res'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    switch (req.method) {
        case 'GET':
            return getJwt(req, res)
        // case 'PATCH':
        //     return updateUserInfo(req, res);
        // case 'DELETE':
        //     return deleteJwt(req, res);
        default:
            return ResponseService.error(
                res,
                405,
                `Method ${req.method} Not Allowed`
            )
    }
}

async function getJwt(req: NextApiRequest, res: NextApiResponse) {
    try {
        const token = req.query.token as string | undefined
        if (!token) {
            return ResponseService.error(res, 400, 'Token is required')
        }
        if (!jwtService.isTokenExpired(token)) {
            const value = jwtService.verifyToken(token)
            if (!value) {
                return ResponseService.error(res, 404, 'Token not found')
            }
            return ResponseService.success(res, 'Success', value)
        } else {
            return ResponseService.error(res, 404, 'Token not found')
        }
    } catch (e) {
        logger.error(e)
        return ResponseService.error(res, 500, 'Internal Server Error')
    }
}
