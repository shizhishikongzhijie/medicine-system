import {Metadata} from "next";
import UserPage from "@/component/Page/UserPage";

// 设置页面标题和描述
export const metadata: Metadata = {
    title: "空之界 - 医药管理系统",
    description: "空之界 - 医药管理系统",
};
const Medicine = () => {
    // 渲染页面内容
    return <UserPage />
};
export default Medicine;