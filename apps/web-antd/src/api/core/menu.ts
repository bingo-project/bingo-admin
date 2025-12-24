import type { RouteRecordStringComponent } from '@vben/types';

import { requestClient } from '#/api/request';

/** 后端返回的菜单信息 */
interface MenuInfo {
  authCode?: string;
  children?: MenuInfo[];
  component: string;
  createdAt: string;
  hidden: boolean;
  icon: string;
  id: number;
  name: string;
  parentID: number;
  path: string;
  redirect?: string;
  sort: number;
  title: string;
  type?: string;
  updatedAt: string;
}

/**
 * 将后端菜单格式转换为 Vben 路由格式
 */
function transformMenu(menu: MenuInfo): RouteRecordStringComponent {
  const route: RouteRecordStringComponent = {
    component: menu.component,
    meta: {
      hideInMenu: menu.hidden,
      icon: menu.icon,
      order: menu.sort,
      title: menu.title,
    },
    name: menu.name,
    path: menu.path,
  };

  if (menu.redirect) {
    route.redirect = menu.redirect;
  }

  if (menu.children && menu.children.length > 0) {
    route.children = menu.children.map((child: MenuInfo) =>
      transformMenu(child),
    );
  }

  return route;
}

/**
 * 从菜单树中递归提取所有 authCode
 */
function extractAuthCodes(menus: MenuInfo[]): string[] {
  const codes: string[] = [];
  for (const menu of menus) {
    if (menu.authCode) {
      codes.push(menu.authCode);
    }
    if (menu.children && menu.children.length > 0) {
      codes.push(...extractAuthCodes(menu.children));
    }
  }
  return codes;
}

/** getAllMenusApi 返回值类型 */
export interface MenusWithCodes {
  authCodes: string[];
  menus: RouteRecordStringComponent[];
}

/**
 * 获取用户所有菜单
 */
export async function getAllMenusApi(): Promise<MenusWithCodes> {
  const menus = await requestClient.get<MenuInfo[]>('/v1/auth/menus');
  return {
    authCodes: extractAuthCodes(menus),
    menus: menus.map((menu: MenuInfo) => transformMenu(menu)),
  };
}
