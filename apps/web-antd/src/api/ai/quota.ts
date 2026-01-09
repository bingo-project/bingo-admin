// ABOUTME: AI Quota API definitions and types
// ABOUTME: Provides CRUD operations for AI quota management

import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace AiQuotaApi {
  export interface AiQuota {
    [key: string]: any;
    uid: number;
    username?: string;
    nickname?: string;
    dailyLimit: number;
    dailyUsed: number;
    totalLimit: number;
    totalUsed: number;
    resetAt?: string;
    createdAt: string;
    updatedAt: string;
  }

  export interface UpdateQuotaRequest {
    dailyLimit?: number;
    totalLimit?: number;
  }
}

/**
 * 获取 AI Quota 列表
 */
async function getQuotaList(params?: Recordable<any>) {
  return requestClient.get('/v1/ai/quotas', { params });
}

/**
 * 获取用户 AI Quota 详情
 * @param uid User ID
 */
async function getQuota(uid: number) {
  return requestClient.get<AiQuotaApi.AiQuota>(`/v1/ai/quotas/${uid}`);
}

/**
 * 更新用户 AI Quota
 * @param uid User ID
 * @param data 更新数据
 */
async function updateQuota(uid: number, data: AiQuotaApi.UpdateQuotaRequest) {
  return requestClient.put<AiQuotaApi.AiQuota>(
    `/v1/ai/quotas/${uid}`,
    data,
  );
}

/**
 * 重置用户日配额
 * @param uid User ID
 */
async function resetDailyQuota(uid: number) {
  return requestClient.post(`/v1/ai/quotas/${uid}/reset-daily`);
}

export {
  getQuota,
  getQuotaList,
  resetDailyQuota,
  updateQuota,
};
