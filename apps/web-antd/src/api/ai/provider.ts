// ABOUTME: AI Provider API definitions and types
// ABOUTME: Provides CRUD operations for AI provider management

import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace AiProviderApi {
  export interface AiProvider {
    [key: string]: any;
    id: number;
    name: string;
    displayName: string;
    status: 'active' | 'disabled';
    isDefault: boolean;
    sort: number;
    createdAt: string;
    updatedAt: string;
  }

  export interface UpdateProviderRequest {
    displayName?: string;
    status?: 'active' | 'disabled';
    isDefault?: boolean;
    sort?: number;
  }
}

/**
 * 获取 AI Provider 列表
 */
async function getProviderList(params?: Recordable<any>) {
  return requestClient.get('/v1/ai/providers', { params });
}

/**
 * 获取 AI Provider 详情
 * @param id Provider ID
 */
async function getProvider(id: number) {
  return requestClient.get<AiProviderApi.AiProvider>(`/v1/ai/providers/${id}`);
}

/**
 * 更新 AI Provider
 * @param id Provider ID
 * @param data 更新数据
 */
async function updateProvider(
  id: number,
  data: AiProviderApi.UpdateProviderRequest,
) {
  return requestClient.put<AiProviderApi.AiProvider>(
    `/v1/ai/providers/${id}`,
    data,
  );
}

export { getProvider, getProviderList, updateProvider };
