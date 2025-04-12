import type { Metadata } from 'next'

import RolePage from '@/component/Page/RolePage'

// 设置页面标题和描述
export const metadata: Metadata = {
    title: '空之界 - 医药管理系统',
    description: '空之界 - 医药管理系统'
}
const Role = () => {
    // 渲染页面内容
    return <RolePage />
}
export default Role
