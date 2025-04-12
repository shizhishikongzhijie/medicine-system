import {
    IconBell,
    IconFile,
    IconHome,
    IconInbox,
    IconMenu,
    IconSafe,
    IconSetting,
    IconUser
} from '@douyinfe/semi-icons'

import type { InitNavItems } from '@/component/layout/type'

export const initNavItems: InitNavItems[] = [
    { itemKey: 'Home', text: '首页', icon: <IconHome size="large" /> },
    {
        itemKey: 'MedicineManagement',
        text: '药品管理',
        icon: <IconInbox size="large" />,
        items: [
            { itemKey: 'Medicine', text: '药品列表' },
            { itemKey: 'Stock', text: '入库记录' }
        ]
    },
    { itemKey: 'User', text: '用户管理', icon: <IconUser size="large" /> },
    {
        itemKey: 'RoleManagement',
        text: '角色管理',
        icon: <IconSafe size="large" />,
        items: [
            { itemKey: 'Role', text: '角色列表' },
            { itemKey: 'Permission', text: '权限列表' }
        ]
    },
    { itemKey: 'Menu', text: '菜单管理', icon: <IconMenu size="large" /> },
    {
        itemKey: 'Notification',
        text: '通知管理',
        icon: <IconBell size="large" />
    },
    { itemKey: 'Log', text: '日志管理', icon: <IconFile size="large" /> },
    { itemKey: 'Setting', text: '系统设置', icon: <IconSetting size="large" /> }
] as const
