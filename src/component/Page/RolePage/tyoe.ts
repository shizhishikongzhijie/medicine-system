interface UserRole {
    id: number
    username: string
    full_name: string
    id_number: string
    role_id: number
    role_name: string
}
interface Role {
    id: number
    name: string
}
export type { Role, UserRole }
