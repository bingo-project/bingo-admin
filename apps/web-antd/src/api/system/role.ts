import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace SystemRoleApi {
  export interface SystemRole {
    [key: string]: any;
    id: string;
    name: string;
    permissions: string[];
    remark?: string;
    status: 0 | 1;
  }
}

/**
 * 获取角色列表数据
 */
async function getRoleList(params: Recordable<any>) {
  return requestClient.get('/v1/roles', { params });
}

/**
 * 创建角色
 * @param data 角色数据
 */
async function createRole(data: Omit<SystemRoleApi.SystemRole, 'id'>) {
  return requestClient.post('/v1/roles', data);
}

/**
 * 更新角色
 *
 * @param name 角色名称
 * @param data 角色数据
 */
async function updateRole(
  name: string,
  data: Omit<SystemRoleApi.SystemRole, 'id'>,
) {
  return requestClient.put(`/v1/roles/${name}`, data);
}

/**
 * 删除角色
 * @param name 角色名称
 */
async function deleteRole(name: string) {
  return requestClient.delete(`/v1/roles/${name}`);
}

export { createRole, deleteRole, getRoleList, updateRole };
