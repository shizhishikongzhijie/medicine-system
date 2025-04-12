'use client'
import { IconSend } from '@douyinfe/semi-icons'
import { Button, Modal, TabPane, Tabs, Tree } from '@douyinfe/semi-ui'
import type { TreeNodeData, Value } from '@douyinfe/semi-ui/lib/es/tree'
import {
    createRef,
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useRef,
    useState
} from 'react'

import type { RoleMenu } from '@/component/Page/PermissionPage/type'
import { NextAxios } from '@/tools/axios/NextAxios'
import type { ResType } from '@/tools/axios/type'

const PermissionPage = () => {
    const [roleMenus, setRoleMenus] = useState<RoleMenu[]>()

    function convertRolesToTree(roles: RoleMenu[]): TreeNodeData[] {
        return roles.map((role, roleIndex) => {
            // 构建菜单项数组
            const menuItems = role.menu_ids.map((id, index) => ({
                id,
                name: role.menu_names[index],
                parentId: role.menu_parent_ids[index],
                path: role.menu_paths[index]
            }))
            // 创建哈希表并建立父子关系
            const nodeMap = new Map<number, any>()
            const virtualRoot = { children: [] }

            menuItems.forEach((item) => {
                const node: TreeNodeData = { ...item, children: [] }
                nodeMap.set(item.id, node)

                const parent = item.parentId
                    ? nodeMap.get(item.parentId)
                    : virtualRoot
                //(parent?.children ??= []).push(node);
                ;(parent?.children || { ...parent, children: [] }).push(node)
                return parent
            })

            // 递归生成带层级key的树结构
            const generateKeys = (
                nodes: any[],
                parentKey = ''
            ): TreeNodeData[] =>
                nodes.map((node, index) => ({
                    label: node.name,
                    value: node.id,
                    key: parentKey ? `${parentKey}-${index}` : `${index}`,
                    children: generateKeys(
                        node.children,
                        parentKey ? `${parentKey}-${index}` : `${index}`
                    )
                }))
            return generateKeys(virtualRoot.children, `${roleIndex}`)
        })[0]
    }

    const SafeRoleMenuTabs = useCallback(() => {
        let mainMenus: TreeNodeData[] = []
        if (roleMenus) {
            let maxLength = 0
            let maxIndex = 0
            roleMenus.map((item, index) => {
                if (item.menu_ids.length > maxLength) {
                    maxLength = item.menu_ids.length
                    maxIndex = index
                }
            })
            const menus = roleMenus[maxIndex]
            mainMenus = convertRolesToTree([menus])
        }
        return <RoleMenuTabs roleMenus={roleMenus} mainMenus={mainMenus} />
    }, [roleMenus])
    useEffect(() => {
        const fetchRoleMenus = async () => {
            const res: ResType = await NextAxios({
                url: '/api/permission',
                map: 'get'
            })
            if (res.code === 200) {
                setRoleMenus(res.data)
            }
        }
        fetchRoleMenus()
    }, [])
    return (
        <>
            <SafeRoleMenuTabs />
        </>
    )
}
const RoleMenuTabs = ({
    roleMenus,
    mainMenus
}: {
    roleMenus?: RoleMenu[]
    mainMenus?: TreeNodeData[]
}) => {
    const [activeKey, setActiveKey] = useState('0')
    const [isDifferent, setIsDifferent] = useState(false)
    const treeRefs = useRef<any[]>([])
    useEffect(() => {
        treeRefs.current = [] // 清空旧引用
        if (roleMenus) {
            treeRefs.current = roleMenus.map(() => createRef())
        }
    }, [roleMenus])
    const ChangeBtn = useCallback(
        () => (
            <Button
                disabled={!isDifferent}
                onClick={() => {
                    Modal.info({
                        title: '提示',
                        content: '是否要保存修改？',
                        icon: <IconSend />,
                        cancelButtonProps: { theme: 'borderless' },
                        okButtonProps: { theme: 'solid' },
                        onOk: () => {
                            // 保存修改
                        }
                    })
                }}
            >
                确认更改
            </Button>
        ),
        [isDifferent]
    )
    const changeActiveKey = (newKey: string) => {
        if (isDifferent) {
            Modal.info({
                title: '提示',
                content: '修改未保存，是否离开？',
                icon: <IconSend />,
                cancelButtonProps: { theme: 'borderless' },
                okButtonProps: { theme: 'solid' },
                onOk: () => {
                    treeRefs.current[Number(activeKey)].current.reset()
                    setIsDifferent(false)
                    setActiveKey(newKey)
                }
            })
        } else {
            setActiveKey(newKey)
        }
    }
    return (
        <Tabs
            activeKey={activeKey}
            onChange={changeActiveKey}
            tabBarExtraContent={<ChangeBtn />}
        >
            {roleMenus &&
                roleMenus.map((item, index) => (
                    <TabPane
                        key={index}
                        tab={item.role_name}
                        itemKey={String(index)}
                    >
                        <RoleMenuTree
                            ref={treeRefs.current[index]}
                            roleMenus={roleMenus[index]}
                            mainMenus={mainMenus}
                            onSelectChange={(isDifferent) => {
                                if (activeKey === String(index)) {
                                    setIsDifferent(isDifferent)
                                }
                            }}
                        />
                    </TabPane>
                ))}
        </Tabs>
    )
}

interface RoleMenuTreeProps {
    roleMenus?: RoleMenu
    mainMenus?: TreeNodeData[]
    onSelectChange?: (
        isDifferent: boolean,
        value?: {
            initialValue: Value[]
            newValue: Value[]
        }
    ) => void
}

// eslint-disable-next-line react/display-name
const RoleMenuTree = forwardRef(
    ({ roleMenus, mainMenus, onSelectChange }: RoleMenuTreeProps, ref) => {
        const [treeData, setTreeData] = useState<TreeNodeData[]>()
        const [value, setValue] = useState<{
            initialValue: Value[]
            newValue: Value[]
        }>({ initialValue: [], newValue: [] })

        useEffect(() => {
            if (roleMenus && mainMenus) {
                setTreeData(mainMenus)
                setValue({
                    initialValue: roleMenus.menu_ids,
                    newValue: roleMenus.menu_ids
                })
            }
        }, [roleMenus, mainMenus])
        useEffect(() => {
            if (
                value.initialValue.length !== value.newValue.length &&
                value.initialValue.every(
                    (item, index) => item === value.newValue[index]
                )
            ) {
                onSelectChange?.(true, value)
            } else {
                onSelectChange?.(false, value)
            }
        }, [onSelectChange, value])
        useImperativeHandle(ref, () => ({
            reset: () => {
                setValue({
                    initialValue: roleMenus?.menu_ids as Value[],
                    newValue: roleMenus?.menu_ids as Value[]
                })
            }
        }))
        return (
            <Tree
                treeData={treeData}
                multiple
                defaultExpandAll
                value={value.newValue}
                onSelect={(selectedKey: string, selected: boolean) =>
                    console.log(selectedKey, selected)
                }
                onChange={(val) => {
                    // 确保 value 是数组类型
                    const newValue = Array.isArray(val) ? val : [val]
                    setValue({
                        initialValue: value.initialValue as Value[],
                        newValue: newValue as Value[]
                    })
                }}
            />
        )
    }
)
export default PermissionPage
