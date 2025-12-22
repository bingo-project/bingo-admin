import type { UserInfo } from '@vben/types';

import { requestClient } from '#/api/request';

/** 后端返回的管理员信息 */
interface AdminInfo {
  avatar: string;
  createdAt: string;
  email: string;
  nickname: string;
  phone: string;
  role: { description: string; id: number; name: string };
  roleName: string;
  roles: Array<{ description: string; id: number; name: string }>;
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
    desc: adminInfo.role?.description || '',
    homePath: '/analytics',
    realName: adminInfo.nickname,
    roles: adminInfo.roles?.map((r) => r.name) || [adminInfo.roleName],
    token: '',
    userId: adminInfo.username,
    username: adminInfo.username,
  };
}
