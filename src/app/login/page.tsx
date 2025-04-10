import {Metadata} from "next";

import LoginPage from "@/component/Page/LoginPage";

// 设置页面标题和描述
export const metadata: Metadata = {
    title: "空之界 - 医药管理系统",
    description: "空之界 - 医药管理系统",
};
const Login = () => {
    // 渲染页面内容
    return <LoginPage />
};
export default Login;