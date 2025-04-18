// 定义面包屑路由映射
import type { BreadcrumbMap } from '@/component/layout/type'

export const breadcrumbMap: BreadcrumbMap = {
    '/home': ['首页'],
    '/medicine/medicine': ['药品管理', '药品列表'],
    '/medicine/stock': ['药品管理', '入库记录'],
    '/medicine/supplier': ['药品管理', '供应商列表'],
    '/user': ['首页', '用户管理'],
    '/role/role': ['首页', '角色管理', '角色列表'],
    '/role/permission': ['首页', '角色管理', '权限列表'],
    '/notification': ['首页', '通知管理'],
    '/log': ['首页', '在线用户日志'],
    '/setting': ['首页', '系统设置'],
    '/menu': ['首页', '菜单管理']
} as const
