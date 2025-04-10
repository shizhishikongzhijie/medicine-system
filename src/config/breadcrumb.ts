// 定义面包屑路由映射
import {BreadcrumbMap} from "@/component/Layout/type";

export const breadcrumbMap: BreadcrumbMap = {
    '/home': ['首页'],
    '/medicine/medicine': ['药品管理', '药品列表'],
    '/medicine/stock': ['药品管理', '入库记录'],
    '/user': ['首页', '用户管理'],
    '/notification': ['首页', '通知管理'],
    '/log': ['首页', '在线用户日志'],
    '/setting': ['首页', '系统设置'],
    '/menu': ['首页', '菜单管理'],
} as const;