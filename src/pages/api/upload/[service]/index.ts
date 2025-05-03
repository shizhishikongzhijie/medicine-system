import Busboy from 'busboy'
import type { NextApiRequest, NextApiResponse } from 'next'
import path from 'path'

import { getUid } from '@/tools/cookie'
import logger from '@/tools/logger'
import { minioClient } from '@/tools/minio-client'
import ResponseService from '@/tools/res'

export const config = {
    api: {
        bodyParser: false // 允许处理原始请求体
    }
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return ResponseService.error(res, 405, 'Method Not Allowed')
    }
    // 如果后续会用到 type，可以做类型断言或使用可选解构
    const { service } = req.query
    if (!service) {
        return ResponseService.error(
            res,
            400,
            'Missing service in query parameters'
        )
    }

    const uid = await getUid(req, res)
    if (uid === -1) {
        return ResponseService.error(res, 404, '用户未登录')
    }
    const busboy = Busboy({ headers: req.headers })

    busboy.on('file', async (name, file, info) => {
        // 获取文件后缀
        const { filename, encoding, mimeType } = info
        logger.info({
            filename: filename,
            encoding: encoding,
            mimeType: mimeType
        })
        const ext = path.extname(filename).toLowerCase()
        const newFilename = `${uid}-${Date.now()}${ext}`
        console.log({ filename: filename, newFilename: newFilename })
        const result = await minioClient.uploadFile(
            'image',
            newFilename,
            file,
            mimeType
        )
        return ResponseService.success(res, result)
    })

    busboy.on('error', (err: any) => {
        logger.error('文件上传失败:', err)
        return ResponseService.error(res, 500, 'Failed to upload file')
    })

    req.pipe(busboy) // 将请求管道化到 busboy 进行处理
}
