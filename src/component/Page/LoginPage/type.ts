interface User {
    id: number
    username: string
    password: string
    full_name: string
    birth_date: string
    id_number: string
    address_code: string
    created_at: string
    updated_at: string
}
interface UserInfo extends User {
    address: string
}
export type { User, UserInfo }
