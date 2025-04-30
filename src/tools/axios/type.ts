interface ResType {
    code?: number
    message?: string
    error?: string
    data?: any
}
interface UserTokenType {
    id: number
    username: string
    role_id: number
    iat: number
    exp: number
}
export type { ResType, UserTokenType }
