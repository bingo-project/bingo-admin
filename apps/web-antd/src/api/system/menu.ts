import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace SystemMenuApi {
  /** 徽标颜色集合 */
  export const BadgeVariants = [
    'default',
    'destructive',
    'primary',
    'success',
    'warning',
  ] as const;
  /** 徽标类型集合 */
  export const BadgeTypes = ['dot', 'normal'] as const;
  /** 菜单类型集合 */
  export const MenuTypes = [
    'catalog',
    'menu',
    'embedded',
    'link',
    'button',
  ] as const;
  /** 系统菜单 */
  export interface SystemMenu {
    [key: string]: any;
    /** 关联的 API ID 列表 */
    apiIds?: number[];
    /** 后端权限标识 */
    authCode: string;
    /** 子级 */
    children?: SystemMenu[];
    /** 组件 */
    component?: string;
    /** 菜单ID */
    id: string;
    /** 菜单元数据 */
    meta?: {
      /** 激活时显示的图标 */
      activeIcon?: string;
      /** 作为路由时，需要激活的菜单的Path */
      activePath?: string;
      /** 固定在标签栏 */
      affixTab?: boolean;
      /** 在标签栏固定的顺序 */
      affixTabOrder?: number;
      /** 徽标内容(当徽标类型为normal时有效) */
      badge?: string;
      /** 徽标类型 */
      badgeType?: (typeof BadgeTypes)[number];
      /** 徽标颜色 */
      badgeVariants?: (typeof BadgeVariants)[number];
      /** 在菜单中隐藏下级 */
      hideChildrenInMenu?: boolean;
      /** 在面包屑中隐藏 */
      hideInBreadcrumb?: boolean;
      /** 在菜单中隐藏 */
      hideInMenu?: boolean;
      /** 在标签栏中隐藏 */
      hideInTab?: boolean;
      /** 菜单图标 */
      icon?: string;
      /** 内嵌Iframe的URL */
      iframeSrc?: string;
      /** 是否缓存页面 */
      keepAlive?: boolean;
      /** 外链页面的URL */
      link?: string;
      /** 同一个路由最大打开的标签数 */
      maxNumOfOpenTab?: number;
      /** 无需基础布局 */
      noBasicLayout?: boolean;
      /** 是否在新窗口打开 */
      openInNewWindow?: boolean;
      /** 菜单排序 */
      order?: number;
      /** 额外的路由参数 */
      query?: Recordable<any>;
      /** 菜单标题 */
      title?: string;
    };
    /** 菜单名称 */
    name: string;
    /** 路由路径 */
    path: string;
    /** 父级ID */
    pid: string;
    /** 重定向 */
    redirect?: string;
    /** 菜单状态：1-启用 0-禁用 */
    status?: number;
    /** 菜单类型 */
    type: (typeof MenuTypes)[number];
  }
}

/** 后端返回的菜单结构 */
interface BackendMenu {
  apiIds?: number[];
  authCode?: string;
  children?: BackendMenu[];
  component: string;
  hidden: boolean;
  icon: string;
  id: number;
  name: string;
  parentId: number;
  path: string;
  redirect?: string;
  sort: number;
  status?: string;
  title: string;
  type?: string;
}

/**
 * 将后端菜单格式转换为前端期望的格式
 */
function transformMenuData(menu: BackendMenu): SystemMenuApi.SystemMenu {
  const result: SystemMenuApi.SystemMenu = {
    apiIds: menu.apiIds || [],
    authCode: menu.authCode || '',
    component: menu.component,
    id: String(menu.id),
    meta: {
      hideInMenu: menu.hidden,
      icon: menu.icon,
      order: menu.sort,
      title: menu.title,
    },
    name: menu.name,
    path: menu.path,
    pid: String(menu.parentId),
    redirect: menu.redirect,
    status: menu.status === 'enabled' ? 1 : 0,
    type: (menu.type as SystemMenuApi.SystemMenu['type']) || 'menu',
  };

  if (menu.children && menu.children.length > 0) {
    result.children = menu.children.map((child) => transformMenuData(child));
  }

  return result;
}

/**
 * 获取菜单树形数据
 */
async function getMenuList() {
  const data = await requestClient.get<BackendMenu[]>('/v1/menus/tree');
  return data.map((menu) => transformMenuData(menu));
}

/**
 * 获取菜单详情
 * @param id 菜单 ID
 */
async function getMenuDetail(id: string) {
  const data = await requestClient.get<BackendMenu>(`/v1/menus/${id}`);
  return transformMenuData(data);
}

async function isMenuNameExists(
  _name: string,
  _id?: SystemMenuApi.SystemMenu['id'],
) {
  // TODO: 后端暂无此接口，先返回 false
  return false;
}

async function isMenuPathExists(
  _path: string,
  _id?: SystemMenuApi.SystemMenu['id'],
) {
  // TODO: 后端暂无此接口，先返回 false
  return false;
}

/**
 * 创建菜单
 * @param data 菜单数据
 */
async function createMenu(
  data: Omit<SystemMenuApi.SystemMenu, 'children' | 'id'>,
) {
  return requestClient.post('/v1/menus', data);
}

/**
 * 更新菜单
 *
 * @param id 菜单 ID
 * @param data 菜单数据
 */
async function updateMenu(
  id: string,
  data: Omit<SystemMenuApi.SystemMenu, 'children' | 'id'>,
) {
  return requestClient.put(`/v1/menus/${id}`, data);
}

/**
 * 删除菜单
 * @param id 菜单 ID
 */
async function deleteMenu(id: string) {
  return requestClient.delete(`/v1/menus/${id}`);
}

/** API 信息 */
export interface ApiInfo {
  description: string;
  group: string;
  id: number;
  method: string;
  path: string;
}

/** API 分组 */
export interface ApiGroup {
  children: ApiInfo[];
  key: string;
}

/**
 * 获取 API 树形列表（按分组）
 */
async function getApiTree(): Promise<ApiGroup[]> {
  return requestClient.get<ApiGroup[]>('/v1/apis/tree');
}

export {
  createMenu,
  deleteMenu,
  getApiTree,
  getMenuDetail,
  getMenuList,
  isMenuNameExists,
  isMenuPathExists,
  updateMenu,
};
