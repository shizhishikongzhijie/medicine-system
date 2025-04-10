import type { Metadata } from 'next'

import StockPage from '@/component/Page/StockPage'

// 设置页面标题和描述
export const metadata: Metadata = {
    title: '空之界 - 医药管理系统',
    description: '空之界 - 医药管理系统'
}
const Stock = () => {
    // 渲染页面内容
    return <StockPage />
}
export default Stock
