interface Districts {
    code: string
    name: string
    parent_code: string
    level: number
    isLeaf?: boolean
}

interface User {
    key?: number
    avatar_path: string
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

export type { Districts, User }
