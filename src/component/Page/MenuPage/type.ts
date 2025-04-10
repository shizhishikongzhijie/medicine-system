interface RoleMenu {
    role_id: number,
    role_name: string,
    menu_names: string[],
    menu_ids: number[],
    menu_paths: string[],
    menu_parent_ids: (number | null)[];
}

export type {RoleMenu}