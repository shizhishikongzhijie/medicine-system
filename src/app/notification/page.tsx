import {Metadata} from "next";
import NotificationPage from "@/component/Page/NotificationPage";

// 设置页面标题和描述
export const metadata: Metadata = {
    title: "空之界 - 医药管理系统",
    description: "空之界 - 医药管理系统",
};
const Notification = () => {
    // 渲染页面内容
    return <NotificationPage />
};export default Notification;