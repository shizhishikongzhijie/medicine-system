import {Metadata} from "next";

import MenuPage from "@/component/Page/MenuPage";

// 设置页面标题和描述
export const metadata: Metadata = {
    title: "空之界 - 医药管理系统",
    description: "空之界 - 医药管理系统",
};
const Menu = () => {
    // 渲染页面内容
    return <MenuPage/>
};
export default Menu;