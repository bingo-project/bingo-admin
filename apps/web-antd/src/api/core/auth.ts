// ABOUTME: 认证相关 API，包括登录、登出、刷新 Token、切换角色
// ABOUTME: 切换角色 API 用于多角色用户在不同角色间切换权限视角

import type { AdminInfo } from './user';

import { baseRequestClient, requestClient } from '#/api/request';

export namespace AuthApi {
  /** 登录接口参数 */
  export interface LoginParams {
    account?: string;
    password?: string;
  }

  /** 登录接口返回值 */
  export interface LoginResult {
    accessToken: string;
    expiresAt: string;
  }

  export interface RefreshTokenResult {
    data: string;
    status: number;
  }
}

/**
 * 登录
 */
export async function loginApi(data: AuthApi.LoginParams) {
  return requestClient.post<AuthApi.LoginResult>('/v1/auth/login', data);
}

/**
 * 刷新accessToken
 * 后端暂不支持 refresh token，保留接口定义
 */
export async function refreshTokenApi() {
  return baseRequestClient.post<AuthApi.RefreshTokenResult>(
    '/v1/auth/refresh',
    {
      withCredentials: true,
    },
  );
}

/**
 * 退出登录
 * 后端无 logout 接口，前端直接清除 token 即可
 */
export async function logoutApi() {
  // 后端无 logout 接口，直接返回
}

/**
 * 获取用户权限码
 * 后端在 user-info 中返回角色信息，这里返回角色名作为权限码
 */
export async function getAccessCodesApi(): Promise<string[]> {
  // 权限码从 user-info 中获取，这里先返回空数组
  // 实际权限码会在 store/auth.ts 中从用户信息提取
  return [];
}

/** 切换角色请求参数 */
export interface SwitchRoleParams {
  roleName: string;
}

/**
 * 切换当前角色
 * @param data 包含目标角色名
 * @returns 更新后的用户信息
 */
export async function switchRoleApi(data: SwitchRoleParams) {
  return requestClient.put<AdminInfo>('/v1/auth/switch-role', data);
}

/** 修改密码请求参数 */
export interface ChangePasswordParams {
  passwordOld: string;
  passwordNew: string;
}

/**
 * 修改密码
 * @param data 旧密码和新密码
 */
export async function changePasswordApi(data: ChangePasswordParams) {
  return requestClient.put<void>('/v1/auth/change-password', data);
}

/** 更新个人信息请求参数 */
export interface UpdateProfileParams {
  nickname?: string;
  email?: string;
  phone?: string;
}

/**
 * 更新个人信息
 * @param username 当前用户名
 * @param data 更新的字段（nickname、email、phone）
 * @returns 更新后的用户信息
 */
export async function updateProfileApi(
  username: string,
  data: UpdateProfileParams,
) {
  return requestClient.put<AdminInfo>(`/v1/admins/${username}`, data);
}
