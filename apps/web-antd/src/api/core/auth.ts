import { baseRequestClient, requestClient } from '#/api/request';

export namespace AuthApi {
  /** 登录接口参数 */
  export interface LoginParams {
    password?: string;
    username?: string;
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
