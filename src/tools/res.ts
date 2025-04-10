import type { NextApiResponse } from 'next'

/**
 * 响应工具类
 */
class ResponseService {
    /**
     * 成功响应（status 和 code 都是 200）
     * @param res - Next.js 的响应对象
     * @param message - 可选的消息
     * @param data - 可选的数据
     */
    public static success<T = any>(
        res: NextApiResponse,
        message?: string,
        data?: T
    ): void {
        this.sendResponse(res, 200, 200, message, data)
    }

    /**
     * 信息响应（status 是 200，code 是自定义值）
     * @param res - Next.js 的响应对象
     * @param code - 自定义状态码
     * @param message - 可选的消息
     * @param data - 可选的数据
     */
    public static info<T = any>(
        res: NextApiResponse,
        code: number,
        message?: string,
        data?: T
    ): void {
        if (code === 200) {
            throw new Error(
                'For "info" method, the code should not be 200. Use "success" instead.'
            )
        }
        this.sendResponse(res, 200, code, message, data)
    }

    /**
     * 错误响应
     * @param res - Next.js 的响应对象
     * @param status - HTTP 状态码
     * @param error - 错误信息
     * @param data - 可选的数据
     * @param message - 可选的消息
     */
    public static error<T = any>(
        res: NextApiResponse,
        status: number,
        error: string,
        data?: T,
        message?: string
    ): void {
        if (status < 400) {
            throw new Error(
                'For "error" method, the status should be 400 or above.'
            )
        }
        return res.status(status).json({
            code: status,
            error,
            message,
            data
        })
    }

    /**
     * 通用响应方法
     * @param res - Next.js 的响应对象
     * @param status - HTTP 状态码
     * @param code - 自定义状态码
     * @param message - 可选的消息
     * @param data - 可选的数据
     */
    private static sendResponse<T>(
        res: NextApiResponse,
        status: number,
        code: number,
        message?: string,
        data?: T
    ): void {
        return res.status(status).json({
            code,
            message,
            data
        })
    }
}

export default ResponseService
