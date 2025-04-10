"use client";
import { TabPane, Tabs, Tree } from "@douyinfe/semi-ui";
import type { TreeNodeData, Value } from "@douyinfe/semi-ui/lib/es/tree";
import { useCallback, useEffect, useState } from "react";

import type { RoleMenu } from "@/component/Page/MenuPage/type";
import { NextAxios } from "@/tools/axios/NextAxios";
import type { ResType } from "@/tools/axios/type";

const MenuPage = () => {
  const [roleMenus, setRoleMenus] = useState<RoleMenu[]>();

  function convertRolesToTree(roles: RoleMenu[]): TreeNodeData[] {
    return roles.map((role, roleIndex) => {
      // 构建菜单项数组[4,7](@ref)
      const menuItems = role.menu_ids.map((id, index) => ({
        id,
        name: role.menu_names[index],
        parentId: role.menu_parent_ids[index],
        path: role.menu_paths[index],
      }));
      // 创建哈希表并建立父子关系[1,4](@ref)
      const nodeMap = new Map<number, any>();
      const virtualRoot = { children: [] };

      menuItems.forEach((item) => {
        const node: TreeNodeData = { ...item, children: [] };
        nodeMap.set(item.id, node);

        const parent = item.parentId ? nodeMap.get(item.parentId) : virtualRoot;
        //(parent?.children ??= []).push(node);
        (parent?.children || { ...parent, children: [] }).push(node);
        return parent;
      });

      // 递归生成带层级key的树结构[6,7](@ref)
      const generateKeys = (nodes: any[], parentKey = ""): TreeNodeData[] =>
        nodes.map((node, index) => ({
          label: node.name,
          value: node.id,
          key: parentKey ? `${parentKey}-${index}` : `${index}`,
          children: generateKeys(
            node.children,
            parentKey ? `${parentKey}-${index}` : `${index}`,
          ),
        }));
      return generateKeys(virtualRoot.children, `${roleIndex}`);
    })[0];
  }

  const SafeRoleMenuTabs = useCallback(() => {
    let mainMenus: TreeNodeData[] = [];
    if (roleMenus) {
      let maxLength = 0;
      let maxIndex = 0;
      roleMenus.map((item, index) => {
        if (item.menu_ids.length > maxLength) {
          maxLength = item.menu_ids.length;
          maxIndex = index;
        }
      });
      const menus = roleMenus[maxIndex];
      mainMenus = convertRolesToTree([menus]);
    }
    return <RoleMenuTabs roleMenus={roleMenus} mainMenus={mainMenus} />;
  }, [roleMenus]);
  useEffect(() => {
    const fetchRoleMenus = async () => {
      const res: ResType = await NextAxios({
        url: "/api/menu",
        map: "get",
      });
      if (res.code === 200) {
        setRoleMenus(res.data);
      }
    };
    fetchRoleMenus();
  }, []);
  return (
    <>
      <SafeRoleMenuTabs />
    </>
  );
};
const RoleMenuTabs = ({
  roleMenus,
  mainMenus,
}: {
  roleMenus?: RoleMenu[];
  mainMenus?: TreeNodeData[];
}) => {
  const [activeKey, setActiveKey] = useState("0");
  return (
    <Tabs activeKey={activeKey} onChange={setActiveKey}>
      {roleMenus &&
        roleMenus.map((item, index) => (
          <TabPane key={index} tab={item.role_name} itemKey={String(index)}>
            <RoleMenuTree roleMenus={roleMenus[index]} mainMenus={mainMenus} />
          </TabPane>
        ))}
    </Tabs>
  );
};
const RoleMenuTree = ({
  roleMenus,
  mainMenus,
}: {
  roleMenus?: RoleMenu;
  mainMenus?: TreeNodeData[];
}) => {
  const [treeData, setTreeData] = useState<TreeNodeData[]>();
  const [value, setValue] = useState<{
    initialValue: Value[];
    newValue: Value[];
  }>({ initialValue: [], newValue: [] });

  useEffect(() => {
    if (roleMenus && mainMenus) {
      setTreeData(mainMenus);
      setValue({
        initialValue: roleMenus.menu_ids,
        newValue: roleMenus.menu_ids,
      });
    }
  }, []);
  return (
    <Tree
      treeData={treeData}
      multiple
      defaultExpandAll
      value={value.newValue}
      onSelect={(selectedKey: string, selected: boolean) =>
        console.log(selectedKey, selected)
      }
      onChange={(value) => {
        // 确保 value 是数组类型
        const newValue = Array.isArray(value) ? value : [value];
        setValue({
          initialValue: value as Value[],
          newValue: newValue as Value[],
        });
      }}
    />
  );
};
export default MenuPage;
