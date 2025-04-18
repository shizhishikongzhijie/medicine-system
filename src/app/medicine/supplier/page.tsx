import type { Metadata } from 'next'

import SupplierPage from '@/component/Page/SupplierPage'

// 设置页面标题和描述
export const metadata: Metadata = {
    title: '空之界 - 医药管理系统',
    description: '空之界 - 医药管理系统'
}
const Supplier = () => {
    // 渲染页面内容
    return <SupplierPage />
}
export default Supplier
