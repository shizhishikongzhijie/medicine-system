import type { NextApiRequest, NextApiResponse } from 'next'
import { collectDefaultMetrics, register } from 'prom-client'

// 收集默认指标（如 CPU、内存）
collectDefaultMetrics({ register })

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    res.setHeader('Content-Type', register.contentType)
    res.send(await register.metrics())
}
