// ABOUTME: 用户信息 API，获取后端管理员信息并转换为前端 UserInfo 格式
// ABOUTME: 包含角色信息的获取，支持角色切换功能

import type { UserInfo } from '@vben/types';

import { requestClient } from '#/api/request';

/** 角色信息 */
export interface AdminRole {
  description?: string;
  id: number;
  name: string;
  status?: string;
}

/** 后端返回的管理员信息 */
export interface AdminInfo {
  avatar: string;
  createdAt: string;
  email: string;
  nickname: string;
  phone: string;
  role: AdminRole;
  roleName: string;
  roles: AdminRole[];
  status: number;
  updatedAt: string;
  username: string;
}

/**
 * 获取用户信息
 */
export async function getUserInfoApi(): Promise<UserInfo> {
  const adminInfo = await requestClient.get<AdminInfo>('/v1/auth/user-info');

  // 转换为 Vben UserInfo 格式
  return {
    avatar: adminInfo.avatar || '',
    currentRole: adminInfo.role?.name || adminInfo.roleName,
    desc: adminInfo.role?.description || '',
    email: adminInfo.email || '',
    homePath: '/analytics',
    phone: adminInfo.phone || '',
    realName: adminInfo.nickname,
    roles: adminInfo.roles?.map((r) => r.name) || [adminInfo.roleName],
    rolesInfo: adminInfo.roles || [],
    token: '',
    userId: adminInfo.username,
    username: adminInfo.username,
  };
}
