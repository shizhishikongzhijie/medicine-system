import React from "react";

interface Notification {
    id: number;
    title: string;
    content: string;
    created_by: number;
    created_at: string;
    is_read: 0 | 1;
}
// 定义 breadcrumbMap 的类型
type BreadcrumbMap = {
    [key: string]: string[];
};

interface LayoutProps {
    children: React.ReactNode,
    menus?: Menus[]
}

interface Menus {
    id: number;
    name: string;
    url: string;
    parentId: number;
}
interface InitNavItems {
    itemKey: string;
    text: string;
    icon?: React.ReactNode;
    items?: InitNavItems[];
}

export type {Notification, BreadcrumbMap, LayoutProps, Menus,InitNavItems}