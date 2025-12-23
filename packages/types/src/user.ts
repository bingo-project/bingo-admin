// ABOUTME: 用户信息类型定义，扩展自 BasicUserInfo
// ABOUTME: 包含角色相关信息用于角色切换功能

import type { BasicUserInfo } from '@vben-core/typings';

/** 角色详细信息 */
export interface RoleInfo {
  /** 角色描述 */
  description?: string;
  /** 角色 ID */
  id: number;
  /** 角色名称 */
  name: string;
  /** 角色状态 */
  status?: string;
}

/** 用户信息 */
interface UserInfo extends BasicUserInfo {
  /**
   * 当前激活的角色名
   */
  currentRole?: string;
  /**
   * 用户描述
   */
  desc: string;
  /**
   * 首页地址
   */
  homePath: string;
  /**
   * 角色详细信息列表（用于角色切换）
   */
  rolesInfo?: RoleInfo[];
  /**
   * accessToken
   */
  token: string;
}

export type { UserInfo };
