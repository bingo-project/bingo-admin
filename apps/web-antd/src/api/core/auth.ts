// ABOUTME: 认证相关 API，包括登录、登出、刷新 Token、切换角色、TOTP 两步验证
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
    /** 是否需要 TOTP 验证 */
    requireTotp?: boolean;
    /** 两步登录临时 Token */
    totpToken?: string;
  }

  export interface RefreshTokenResult {
    data: string;
    status: number;
  }

  /** TOTP 状态响应 */
  export interface TOTPStatusResponse {
    enabled: boolean;
  }

  /** TOTP 设置响应 */
  export interface TOTPSetupResponse {
    secret: string;
    otpauthUrl: string;
  }

  /** TOTP 登录请求参数 */
  export interface TOTPLoginParams {
    code: string;
    totpToken: string;
  }

  /** 启用 TOTP 请求参数 */
  export interface TOTPEnableParams {
    code: string;
  }

  /** 禁用 TOTP 请求参数 */
  export interface TOTPDisableParams {
    totpCode: string;
    verifyCode?: string;
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
  /** 切换到需要 TOTP 的角色时必填 */
  totpCode?: string;
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

/**
 * TOTP 二次登录验证
 * @param data TOTP 验证码和临时 Token
 * @returns 登录结果
 */
export async function totpLoginApi(data: AuthApi.TOTPLoginParams) {
  return requestClient.post<AuthApi.LoginResult>('/v1/auth/login/totp', data);
}

/**
 * 获取 TOTP 状态
 * @returns TOTP 是否已启用
 */
export async function getTotpStatusApi() {
  return requestClient.get<AuthApi.TOTPStatusResponse>(
    '/v1/auth/security/totp/status',
  );
}

/**
 * 获取 TOTP 设置信息（生成 QR 码）
 * @returns secret 和 otpauthUrl
 */
export async function getTotpSetupApi() {
  return requestClient.post<AuthApi.TOTPSetupResponse>(
    '/v1/auth/security/totp/setup',
  );
}

/**
 * 启用 TOTP
 * @param data 6 位验证码
 */
export async function enableTotpApi(data: AuthApi.TOTPEnableParams) {
  return requestClient.post<void>('/v1/auth/security/totp/enable', data);
}

/**
 * 禁用 TOTP
 * @param data TOTP 验证码（预留邮箱验证码）
 */
export async function disableTotpApi(data: AuthApi.TOTPDisableParams) {
  return requestClient.post<void>('/v1/auth/security/totp/disable', data);
}
