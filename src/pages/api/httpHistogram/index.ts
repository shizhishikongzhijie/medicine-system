import type { NextApiRequest, NextApiResponse } from 'next'

import { httpRequestDurationMicroseconds } from '@/tools/httpRequestDurationMicroseconds'
import ResponseService from '@/tools/res'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { method, route, status, duration } = req.body
    httpRequestDurationMicroseconds
        .labels({
            method: method,
            route: route,
            status: status
        })
        .observe(duration)
    return ResponseService.success(
        res,
        'Successfully recorded HTTP request duration',
        200
    )
}
