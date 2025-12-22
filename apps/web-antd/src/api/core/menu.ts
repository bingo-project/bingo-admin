import type { RouteRecordStringComponent } from '@vben/types';

import { requestClient } from '#/api/request';

/** 后端返回的菜单信息 */
interface MenuInfo {
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
 * 获取用户所有菜单
 */
export async function getAllMenusApi(): Promise<RouteRecordStringComponent[]> {
  const menus = await requestClient.get<MenuInfo[]>('/v1/auth/menus');
  return menus.map((menu: MenuInfo) => transformMenu(menu));
}
