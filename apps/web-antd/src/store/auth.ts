// ABOUTME: 认证状态管理，处理登录、登出、获取用户信息、TOTP 两步验证
// ABOUTME: 包含角色切换功能，切换后刷新用户权限和菜单

import type { Recordable, UserInfo } from '@vben/types';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { LOGIN_PATH } from '@vben/constants';
import { preferences } from '@vben/preferences';
import { resetAllStores, useAccessStore, useUserStore } from '@vben/stores';

import { message, notification } from 'ant-design-vue';
import { defineStore } from 'pinia';

import {
  getAccessCodesApi,
  getUserInfoApi,
  loginApi,
  logoutApi,
  switchRoleApi,
  totpLoginApi,
} from '#/api';
import { $t } from '#/locales';

const TOTP_TOKEN_KEY = 'totp_token';

export const useAuthStore = defineStore('auth', () => {
  const accessStore = useAccessStore();
  const userStore = useUserStore();
  const router = useRouter();

  const loginLoading = ref(false);

  /**
   * 异步处理登录操作
   * Asynchronously handle the login process
   * @param params 登录表单数据
   * @returns 包含 userInfo 和 requireTotp 的对象
   */
  async function authLogin(
    params: Recordable<any>,
    onSuccess?: () => Promise<void> | void,
  ) {
    let userInfo: null | UserInfo = null;
    try {
      loginLoading.value = true;
      const loginResult = await loginApi(params);

      // 检查是否需要 TOTP 验证
      if (loginResult.requireTotp && loginResult.totpToken) {
        // 保存 totpToken 到 sessionStorage
        sessionStorage.setItem(TOTP_TOKEN_KEY, loginResult.totpToken);
        // 跳转到 TOTP 验证页面
        await router.push('/auth/totp-login');
        return { userInfo: null, requireTotp: true };
      }

      // 正常登录流程
      if (loginResult.accessToken) {
        userInfo = await handleLoginSuccess(loginResult.accessToken, onSuccess);
      }
    } finally {
      loginLoading.value = false;
    }

    return { userInfo, requireTotp: false };
  }

  /**
   * TOTP 二次验证登录
   * @param code 6 位验证码
   */
  async function totpLogin(code: string) {
    const totpToken = sessionStorage.getItem(TOTP_TOKEN_KEY);
    if (!totpToken) {
      message.error($t('authentication.totpTokenExpired'));
      await router.push(LOGIN_PATH);
      return null;
    }

    try {
      loginLoading.value = true;
      const loginResult = await totpLoginApi({ code, totpToken });

      if (loginResult.accessToken) {
        // 清除 totpToken
        sessionStorage.removeItem(TOTP_TOKEN_KEY);
        return await handleLoginSuccess(loginResult.accessToken);
      }
      return null;
    } finally {
      loginLoading.value = false;
    }
  }

  /**
   * 处理登录成功后的通用逻辑
   */
  async function handleLoginSuccess(
    accessToken: string,
    onSuccess?: () => Promise<void> | void,
  ) {
    accessStore.setAccessToken(accessToken);

    // 获取用户信息并存储到 accessStore 中
    const [fetchUserInfoResult, accessCodes] = await Promise.all([
      fetchUserInfo(),
      getAccessCodesApi(),
    ]);

    const userInfo = fetchUserInfoResult;

    userStore.setUserInfo(userInfo);
    accessStore.setAccessCodes(accessCodes);

    if (accessStore.loginExpired) {
      accessStore.setLoginExpired(false);
    } else {
      onSuccess
        ? await onSuccess?.()
        : await router.push(
            userInfo.homePath || preferences.app.defaultHomePath,
          );
    }

    if (userInfo?.realName) {
      notification.success({
        description: `${$t('authentication.loginSuccessDesc')}:${userInfo?.realName}`,
        duration: 3,
        message: $t('authentication.loginSuccess'),
      });
    }

    return userInfo;
  }

  async function logout(redirect: boolean = true) {
    try {
      await logoutApi();
    } catch {
      // 不做任何处理
    }
    resetAllStores();
    accessStore.setLoginExpired(false);

    // 回登录页带上当前路由地址
    await router.replace({
      path: LOGIN_PATH,
      query: redirect
        ? {
            redirect: encodeURIComponent(router.currentRoute.value.fullPath),
          }
        : {},
    });
  }

  async function fetchUserInfo() {
    let userInfo: null | UserInfo = null;
    userInfo = await getUserInfoApi();
    userStore.setUserInfo(userInfo);
    return userInfo;
  }

  /**
   * 切换用户角色
   * @param roleName 目标角色名
   * @param totpCode TOTP 验证码（切换到需要 TOTP 的角色时必填）
   */
  async function switchRole(roleName: string, totpCode?: string) {
    try {
      // 1. 调用后端切换角色接口
      await switchRoleApi({ roleName, totpCode });

      // 2. 重新获取用户信息
      const userInfo = await fetchUserInfo();

      // 3. 重置权限检查标志，触发重新生成路由
      accessStore.setIsAccessChecked(false);

      // 4. 重新导航以触发路由守卫刷新权限
      const currentPath = router.currentRoute.value.path;
      await router.replace({ path: currentPath });

      message.success(`已切换到角色: ${roleName}`);

      return userInfo;
    } catch (error) {
      // 错误由请求拦截器处理
      throw error;
    }
  }

  function $reset() {
    loginLoading.value = false;
  }

  return {
    $reset,
    authLogin,
    fetchUserInfo,
    loginLoading,
    logout,
    switchRole,
    totpLogin,
  };
});
