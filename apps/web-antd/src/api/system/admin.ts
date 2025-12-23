// ABOUTME: Admin API definitions and types
// ABOUTME: Provides CRUD operations for admin user management

import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace SystemAdminApi {
  export interface SystemAdmin {
    [key: string]: any;
    avatar?: string;
    createdAt: string;
    email?: string;
    nickname: string;
    phone?: string;
    roleName: string;
    roles: SystemRole[];
    status: 'disabled' | 'enabled';
    updatedAt: string;
    username: string;
  }

  export interface SystemRole {
    description?: string;
    id: number;
    name: string;
    status: 'disabled' | 'enabled';
  }

  export interface CreateAdminRequest {
    avatar?: string;
    email?: string;
    nickname: string;
    password: string;
    phone?: string;
    roleNames?: string[];
    username: string;
  }

  export interface UpdateAdminRequest {
    avatar?: string;
    email?: string;
    nickname?: string;
    phone?: string;
    roleNames?: string[];
    status?: 'disabled' | 'enabled';
  }

  export interface ResetPasswordRequest {
    passwordNew: string;
    passwordOld: string;
  }

  export interface SetRolesRequest {
    roleNames: string[];
  }
}

/**
 * 获取管理员列表
 */
async function getAdminList(params: Recordable<any>) {
  return requestClient.get('/v1/admins', { params });
}

/**
 * 获取管理员详情
 * @param username 用户名
 */
async function getAdmin(username: string) {
  return requestClient.get<SystemAdminApi.SystemAdmin>(
    `/v1/admins/${username}`,
  );
}

/**
 * 创建管理员
 * @param data 管理员数据
 */
async function createAdmin(data: SystemAdminApi.CreateAdminRequest) {
  return requestClient.post<SystemAdminApi.SystemAdmin>('/v1/admins', data);
}

/**
 * 更新管理员
 * @param username 用户名
 * @param data 更新数据
 */
async function updateAdmin(
  username: string,
  data: SystemAdminApi.UpdateAdminRequest,
) {
  return requestClient.put<SystemAdminApi.SystemAdmin>(
    `/v1/admins/${username}`,
    data,
  );
}

/**
 * 删除管理员
 * @param username 用户名
 */
async function deleteAdmin(username: string) {
  return requestClient.delete(`/v1/admins/${username}`);
}

/**
 * 重置管理员密码
 * @param username 用户名
 * @param data 密码数据
 */
async function resetAdminPassword(
  username: string,
  data: SystemAdminApi.ResetPasswordRequest,
) {
  return requestClient.put(`/v1/admins/${username}/change-password`, data);
}

/**
 * 设置管理员角色
 * @param username 用户名
 * @param roleNames 角色名称列表
 */
async function setAdminRoles(username: string, roleNames: string[]) {
  return requestClient.put<SystemAdminApi.SystemAdmin>(
    `/v1/admins/${username}/roles`,
    { roleNames },
  );
}

/**
 * 获取所有角色（用于角色选择）
 */
async function getAllRoles() {
  return requestClient.get<SystemAdminApi.SystemRole[]>('/v1/roles/all');
}

export {
  createAdmin,
  deleteAdmin,
  getAdmin,
  getAdminList,
  getAllRoles,
  resetAdminPassword,
  setAdminRoles,
  updateAdmin,
};
