'use client'
import { IconBell, IconHelpCircle, IconSemiLogo } from '@douyinfe/semi-icons'
import { Avatar, Badge, Breadcrumb, Button, Layout, Nav, Popover } from '@douyinfe/semi-ui'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'

import { NotificationPopover, ThemeButton } from '@/component'
import type { InitNavItems, LayoutProps, Notification } from '@/component/layout/type'
import { BREADCRUMB_MAP, INIT_NAV_ITEMS, ROUTER_MAP } from '@/config'
import { updateUserData } from '@/reducer/userSlice'
import type { AppDispatch } from '@/store'
import { NextAxios } from '@/tools/axios/NextAxios'
import type { ResType } from '@/tools/axios/type'

const CustomLayout: React.FC<LayoutProps> = ({ children, menus, user }) => {
    const { Header, Footer, Sider, Content } = Layout
    const router = useRouter()
    const pathname = usePathname() // 获取当前路径名
    const LinkRef = useRef<string>()
    const [navItems, setNavItems] = useState<InitNavItems[]>(INIT_NAV_ITEMS)
    const [selectedKey, setSelectedKey] = useState('Home')
    const [notification, setNotification] = useState<Notification[]>()
    const dispatch = useDispatch<AppDispatch>()

    useEffect(() => {
        //console.log("menus: " + JSON.stringify(menus));
        if (pathname && pathname.startsWith('/login')) {
            return
        }
        if (user) {
            dispatch(updateUserData(user))
        }
        //更改菜单（初始化）
        if (menus) {
            setNavItems((prevState) => {
                // 如果 menus 或 prevState 为空，直接返回原始状态
                if (
                    !menus ||
                    !Array.isArray(menus) ||
                    !prevState ||
                    !Array.isArray(prevState)
                ) {
                    return prevState
                }
                // 将 menus 转换为 Map 以提高查找效率
                const menuMap = new Map(menus.map((menu) => [menu.name, menu]))

                return prevState.map((item) => {
                    // 检查 item.text 是否存在于 menuMap 中
                    if (menuMap.has(item.text)) {
                        return item // 如果存在，保留原 item
                    }
                    return item // 如果不存在，仍然返回原 item（根据需求调整）
                })
            })
        }
        const fetchData = async () => {
            const newRes: ResType = await NextAxios({
                map: 'get',
                url: `/api/notifications`,
                data: {
                    isRead: 0
                }
            })
            if (newRes.code == 200) {
                // 如果未读通知数量大于0，则显示红点
                if (newRes.data.length > 0) {
                    setNotification(newRes.data)
                }
            }
        }
        fetchData()
    }, [menus, pathname])
    useEffect(() => {
        // 设置选中的菜单项基于当前路径
        for (const [key, value] of Object.entries(ROUTER_MAP)) {
            if (value === pathname) {
                setSelectedKey(key)
                break
            }
        }
    }, [pathname]) // 仅当路由准备好时触发

    const logoutHandle = () => {
        NextAxios({
            map: 'get',
            url: '/api/logout'
        }).then((res) => {
            if (res.code == 200) {
                NextAxios({
                    map: 'patch',
                    url: '/api/log'
                }).then((res) => {
                    if (res.code == 200) {
                        router.push('/login')
                    }
                })
            }
        })
    }
    // useEffect(() => {
    //     const prefetchLinks = () => {
    //         const paths = [
    //             '/medicine/medicine',
    //             '/medicine/stock',
    //             '/medicine/supplier',
    //             '/user',
    //             '/role/role',
    //             '/role/permission',
    //             '/notification',
    //             '/log',
    //             '/setting',
    //             '/menu'
    //         ];
    //
    //         paths.forEach(path => {
    //             const link = document.createElement('link');
    //             link.rel = 'prefetch';
    //             link.href = path;
    //             document.head.appendChild(link);
    //         });
    //     };
    //
    //     window.addEventListener('load', prefetchLinks);
    //
    //     return () => {
    //         window.removeEventListener('load', prefetchLinks);
    //     };
    // }, []);

    return (
        <Layout
            style={{
                // border: '1px solid var(--semi-color-border)',
                height: '100%'
            }}
        >
            {/*<link rel="prefetch" href="/medicine/medicine" />*/}
            {/*<link rel="prefetch" href="/medicine/stock" />*/}
            {/*<link rel="prefetch" href="/medicine/supplier" />*/}
            {/*<link rel="prefetch" href="/user" />*/}
            {/*<link rel="prefetch" href="/role/role" />*/}
            {/*<link rel="prefetch" href="/role/permission" />*/}
            {/*<link rel="prefetch" href="/notification" />*/}
            {/*<link rel="prefetch" href="/log" />*/}
            {/*<link rel="prefetch" href="/setting" />*/}
            {/*<link rel="prefetch" href="/menu"/>*/}
            <Header style={{ backgroundColor: 'var(--semi-color-bg-1)' }}>
                <Nav mode="horizontal" defaultSelectedKeys={['Home']}>
                    <Nav.Header>
                        <IconSemiLogo
                            style={{ height: '36px', fontSize: 36 }}
                        />
                    </Nav.Header>
                    <span
                        style={{
                            color: 'var(--semi-color-text-2)'
                        }}
                    >
                        <span
                            style={{
                                marginRight: '24px',
                                color: 'var(--semi-color-text-0)',
                                fontWeight: '600'
                            }}
                        >
                            医院管理系统
                        </span>
                    </span>
                    {pathname && pathname.startsWith('/login') ? (
                        <></>
                    ) : (
                        <Nav.Footer>
                            <ThemeButton />
                            <Popover
                                content={
                                    <NotificationPopover
                                        dataSource={notification}
                                        setData={setNotification}
                                    />
                                }
                                position={'bottomRight'}
                            >
                                <Button
                                    theme="borderless"
                                    icon={
                                        notification &&
                                        notification.filter(
                                            (item) => !item.has_read
                                        ).length > 0 ? (
                                            <Badge dot>
                                                <IconBell size="large" />
                                            </Badge>
                                        ) : (
                                            <IconBell size="large" />
                                        )
                                    }
                                    style={{
                                        color: 'var(--semi-color-text-2)',
                                        marginRight: '12px'
                                    }}
                                />
                            </Popover>
                            <Button
                                theme="borderless"
                                icon={<IconHelpCircle size="large" />}
                                style={{
                                    color: 'var(--semi-color-text-2)',
                                    marginRight: '12px'
                                }}
                            />
                            <Popover
                                content={
                                    <Button onClick={logoutHandle}>
                                        退出登录
                                    </Button>
                                }
                            >
                                <Avatar color="orange" size="small">
                                    时之世
                                </Avatar>
                            </Popover>
                        </Nav.Footer>
                    )}
                </Nav>
            </Header>
            {pathname && pathname.startsWith('/login') ? (
                <>{children}</>
            ) : (
                <Layout style={{ height: 'calc(100% - 60px)' }}>
                    <Sider
                        style={{ backgroundColor: 'var(--semi-color-bg-1)' }}
                    >
                        <Nav
                            style={{ maxWidth: 220, height: '100%' }}
                            defaultSelectedKeys={['Home']}
                            selectedKeys={[selectedKey]}
                            items={navItems}
                            onSelect={(item) => {
                                LinkRef.current = item.itemKey as string
                                console.log(LinkRef.current)
                            }}
                            renderWrapper={({
                                itemElement,
                                isSubNav,
                                isInSubNav,
                                props
                            }) => {
                                if (
                                    props.itemKey &&
                                    props.itemKey in ROUTER_MAP
                                ) {
                                    return (
                                        <Link
                                            style={{ textDecoration: 'none' }}
                                            href={
                                                ROUTER_MAP[
                                                    props.itemKey as keyof typeof ROUTER_MAP
                                                ]
                                            }
                                            prefetch
                                        >
                                            {itemElement}
                                        </Link>
                                    )
                                } else {
                                    return <div>{itemElement}</div>
                                }
                            }}
                            footer={{
                                collapseButton: true
                            }}
                        />
                    </Sider>
                    <Content
                        style={{
                            padding: '24px',
                            backgroundColor: 'var(--semi-color-bg-0)',
                            overflow: 'auto'
                        }}
                    >
                        <Breadcrumb
                            style={{
                                marginBottom: '24px'
                            }}
                            routes={
                                pathname && BREADCRUMB_MAP[pathname]
                                    ? BREADCRUMB_MAP[pathname]
                                    : []
                            }
                        />
                        <div
                            style={{
                                borderRadius: '10px',
                                border: '1px solid var(--semi-color-border)',
                                minHeight: '376px',
                                padding: '32px'
                            }}
                        >
                            {children}
                        </div>
                    </Content>
                </Layout>
            )}
            {/*<Footer*/}
            {/*    style={{*/}
            {/*        display: 'flex',*/}
            {/*        justifyContent: 'space-between',*/}
            {/*        padding: '20px',*/}
            {/*        color: 'var(--semi-color-text-2)',*/}
            {/*        backgroundColor: 'rgba(var(--semi-grey-0), 1)',*/}
            {/*    }}*/}
            {/*>*/}
            {/*    <span*/}
            {/*        style={{*/}
            {/*            display: 'flex',*/}
            {/*            alignItems: 'center',*/}
            {/*        }}*/}
            {/*    >*/}
            {/*        <IconBytedanceLogo size="large" style={{marginRight: '8px'}}/>*/}
            {/*        <span>Copyright © 2023 ByteDance. All Rights Reserved. </span>*/}
            {/*    </span>*/}
            {/*    <span>*/}
            {/*        <span style={{marginRight: '24px'}}>平台客服</span>*/}
            {/*        <span>反馈建议</span>*/}
            {/*    </span>*/}
            {/*</Footer>*/}
        </Layout>
    )
}

export default CustomLayout
