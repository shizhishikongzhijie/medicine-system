import type { Metadata } from 'next'

import MedicinePage from '@/component/Page/MedicinePage'

// 设置页面标题和描述
export const metadata: Metadata = {
    title: '空之界 - 医药管理系统',
    description: '空之界 - 医药管理系统'
}
const Medicine = () => {
    // 渲染页面内容
    return <MedicinePage />
}
export default Medicine
