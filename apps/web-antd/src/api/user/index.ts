// ABOUTME: User API definitions and types
// ABOUTME: Provides CRUD operations for user management

import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace UserApi {
  export interface User {
    [key: string]: any;
    age?: number;
    avatar?: string;
    countryCode: string;
    createdAt: string;
    email?: string;
    gender?: 'female' | 'male' | 'secret';
    googleStatus: string;
    inviteCount: number;
    kycStatus: number; // 0-not verify, 1-pending, 2-verified, 3-failed
    nickname: string;
    payPassword: boolean;
    phone?: string;
    pid?: number;
    status: string; // 'enabled' | 'disabled'
    uid: string;
    updatedAt: string;
    username: string;
  }

  export interface CreateUserRequest {
    age?: number;
    avatar?: string;
    countryCode: string;
    email?: string;
    gender?: 'female' | 'male' | 'secret';
    nickname: string;
    password: string;
    phone?: string;
    pid?: string;
    status?: 'enabled' | 'disabled';
    username: string;
  }

  export interface UpdateUserRequest {
    age?: number;
    avatar?: string;
    email?: string;
    gender?: 'female' | 'male' | 'secret';
    nickname?: string;
    phone?: string;
    status?: 'enabled' | 'disabled';
  }

  export interface ResetPasswordRequest {
    password: string;
  }
}

/**
 * 获取用户列表
 */
async function getUserList(params: Recordable<any>) {
  return requestClient.get('/v1/users', { params });
}

/**
 * 获取用户详情
 * @param uid 用户UID
 */
async function getUser(uid: string) {
  return requestClient.get<UserApi.User>(`/v1/users/${uid}`);
}

/**
 * 创建用户
 * @param data 用户数据
 */
async function createUser(data: UserApi.CreateUserRequest) {
  return requestClient.post<UserApi.User>('/v1/users', data);
}

/**
 * 更新用户
 * @param uid 用户UID
 * @param data 更新数据
 */
async function updateUser(uid: string, data: UserApi.UpdateUserRequest) {
  return requestClient.put<UserApi.User>(
    `/v1/users/${uid}`,
    data,
  );
}

/**
 * 删除用户
 * @param uid 用户UID
 */
async function deleteUser(uid: string) {
  return requestClient.delete(`/v1/users/${uid}`);
}

/**
 * 重置用户密码
 * @param uid 用户UID
 * @param data 密码数据
 */
async function resetUserPassword(
  uid: string,
  data: UserApi.ResetPasswordRequest,
) {
  return requestClient.put(`/v1/users/${uid}/password`, data);
}

export {
  createUser,
  deleteUser,
  getUser,
  getUserList,
  resetUserPassword,
  updateUser,
};
