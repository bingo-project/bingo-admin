// ABOUTME: AI Model API definitions and types
// ABOUTME: Provides CRUD operations for AI model management

import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace AiModelApi {
  export interface AiModel {
    [key: string]: any;
    id: string;
    providerId: string;
    providerName: string;
    name: string;
    slug: string;
    displayName?: string;
    contextLength?: number;
    maxTokens?: number;
    inputPrice?: number;
    outputPrice?: number;
    status: 'disabled' | 'enabled';
    createdAt: string;
    updatedAt: string;
  }

  export interface UpdateModelRequest {
    displayName?: string;
    contextLength?: number;
    maxTokens?: number;
    inputPrice?: number;
    outputPrice?: number;
    status?: 'disabled' | 'enabled';
  }
}

/**
 * 获取 AI Model 列表
 */
async function getModelList(params?: Recordable<any>) {
  return requestClient.get('/v1/ai/models', { params });
}

/**
 * 获取 AI Model 详情
 * @param id Model ID
 */
async function getModel(id: string) {
  return requestClient.get<AiModelApi.AiModel>(`/v1/ai/models/${id}`);
}

/**
 * 更新 AI Model
 * @param id Model ID
 * @param data 更新数据
 */
async function updateModel(id: string, data: AiModelApi.UpdateModelRequest) {
  return requestClient.put<AiModelApi.AiModel>(
    `/v1/ai/models/${id}`,
    data,
  );
}

export {
  getModel,
  getModelList,
  updateModel,
};
