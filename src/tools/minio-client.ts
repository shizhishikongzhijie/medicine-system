// lib/minioClient.ts
import { Client } from 'minio'
import type { Readable } from 'stream'

// 从环境变量获取配置（推荐在.env.local中配置）
const minioConfig = {
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: Number(process.env.MINIO_PORT) || 9000,
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
    region: process.env.MINIO_REGION || 'us-east-1'
}

class MinioClient {
    private client: Client

    constructor() {
        this.client = new Client({
            ...minioConfig
        })
    }

    /**
     * 异步上传文件到指定的存储桶中
     *
     * 本函数通过接收文件内容、存储桶名称、对象名称以及内容类型，来实现文件的上传功能
     * 它首先确定文件的大小，然后利用客户端的 putObject 方法将文件上传到指定位置
     * 如果上传成功，它将返回文件的访问URL；如果上传失败，它将抛出一个错误
     *
     * @param bucketName 存储桶名称，用于指定文件上传的目标存储桶
     * @param objectName 对象名称，即文件在存储桶中的路径和名称
     * @param file 文件内容，可以是 Buffer 类型或 Readable 流类型
     * @param contentType 文件的内容类型，默认为 'application/octet-stream'
     * @returns 返回一个 Promise，解析为文件的访问URL
     * @throws 如果文件上传失败，将抛出一个包含错误信息的 Error 对象
     */
    async uploadFile(
        bucketName: string,
        objectName: string,
        file: Buffer | Readable,
        contentType: string = 'application/octet-stream'
    ): Promise<string> {
        try {
            const size = file instanceof Buffer ? file.length : undefined

            await this.client.putObject(
                bucketName,
                objectName,
                file,
                size, // 文件大小（若无法确定流长度可设为 undefined）
                { 'Content-Type': contentType } // 元数据作为第五个参数传入
            )

            return this.getObjectUrl(bucketName, objectName)
        } catch (error:any) {
            throw new Error(`文件上传失败: ${error.message}`)
        }
    }

    /**
     * 生成预签名URL
     *
     * 此方法用于生成一个预签名的URL，以便在指定的时间范围内对指定的存储桶中的对象进行访问
     * 预签名URL允许在没有AWS凭证的情况下临时访问S3对象
     *
     * @param bucketName 存储桶名称，这是对象存储的位置
     * @param objectName 对象名称，即存储桶中的文件名称
     * @param expiry URL的有效期，以秒为单位，默认为7天（604800秒）
     * @returns 返回一个Promise，解析为预签名URL字符串
     * @throws 如果生成预签名URL失败，将抛出一个包含错误信息的Error
     */
    async getPresignedUrl(
        bucketName: string,
        objectName: string,
        expiry: number = 604800
    ): Promise<string> {
        try {
            return await this.client.presignedGetObject(
                bucketName,
                objectName,
                expiry
            )
        } catch (error:any) {
            throw new Error(`生成预签名URL失败: ${error.message}`)
        }
    }

    /**
     * 异步删除指定存储桶中的文件
     *
     * 本函数通过调用客户端的removeObject方法来删除存储桶中的文件如果删除过程中出现异常，
     * 会捕获异常并抛出一个包含错误信息的新错误
     *
     * @param bucketName 存储桶名称，用于指定删除文件所在的存储桶
     * @param objectName 文件名称，用于指定存储桶中待删除的文件
     * @throws {Error} 如果文件删除失败，抛出一个包含错误信息的Error对象
     */
    async deleteFile(bucketName: string, objectName: string): Promise<void> {
        try {
            await this.client.removeObject(bucketName, objectName)
        } catch (error:any) {
            throw new Error(`文件删除失败: ${error.message}`)
        }
    }

    /**
     * 异步获取指定存储桶中的对象列表
     *
     * 此函数通过创建一个Promise来处理获取对象列表的操作，允许调用者使用async/await语法糖来等待操作完成
     * 它依赖于`this.client.listObjects`方法来生成一个对象流，然后监听这个流的'data'、'end'和'error'事件
     * 分别处理接收到的对象信息、流结束的情况以及可能出现的错误
     *
     * @param bucketName 存储桶名称，用于指定要列出对象的存储桶
     * @param prefix 可选参数，指定对象名称的前缀，用于过滤返回的对象列表
     * @returns 返回一个Promise，解析为一个包含对象名称的字符串数组
     */
    async listObjects(bucketName: string, prefix?: string): Promise<string[]> {
        return new Promise((resolve, reject) => {
            const objects: string[] = []
            const stream = this.client.listObjects(bucketName, prefix, true)

            stream.on('data', (obj:any) => objects.push(obj.name))
            stream.on('end', () => resolve(objects))
            stream.on('error', (error) => reject(error))
        })
    }

    /**
     * 生成永久访问URL（需存储桶设置为公开）
     *
     * 此函数生成一个公开访问对象的URL它要求存储桶已经是公开的，以确保任何人可以通过生成的URL直接访问对象
     * 注意：此方法不适用于私有存储桶中的对象，因为这会暴露对象内容给未经授权的用户
     *
     * @param bucketName 存储桶名称，需确保该存储桶已设置为公开
     * @param objectName 对象名称，即存储桶中的文件名
     * @returns 返回一个字符串，表示对象的直接访问URL
     */
    getObjectUrl(bucketName: string, objectName: string): string {
        return `${minioConfig.useSSL ? 'https' : 'http'}://${minioConfig.endPoint}:${minioConfig.port}/${bucketName}/${objectName}`
    }

    /**
     * 异步创建存储桶
     * 如果存储桶已存在，则不进行创建操作
     *
     * @param bucketName 存储桶的名称
     * @returns 无返回值
     * @throws 如果创建存储桶失败，则抛出错误
     */
    async createBucket(bucketName: string): Promise<void> {
        try {
            const exists = await this.client.bucketExists(bucketName)
            if (!exists) {
                await this.client.makeBucket(bucketName, minioConfig.region)
            }
        } catch (error:any) {
            throw new Error(`创建存储桶失败: ${error.message}`)
        }
    }
}

export const minioClient = new MinioClient()
