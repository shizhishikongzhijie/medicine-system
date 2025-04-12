interface ResType {
    code?: number
    message?: string
    error?: string
    data?: any
}
interface UserTokenType {
    id: number
    username: string
    iat: number
    exp: number
}
export type { ResType, UserTokenType }
