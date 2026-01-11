// ABOUTME: AI Model API definitions and types
// ABOUTME: Provides CRUD operations for AI model management

import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace AiModelApi {
  export interface AiModel {
    [key: string]: any;
    id: number;
    providerName: string;
    model: string;
    displayName?: string;
    maxTokens?: number;
    inputPrice?: number;
    outputPrice?: number;
    status: 'active' | 'disabled';
    isDefault?: boolean;
    sort?: number;
    allowFallback?: boolean;
    createdAt: string;
    updatedAt: string;
  }

  export interface CreateModelRequest {
    providerName: string;
    model: string;
    displayName?: string;
    maxTokens?: number;
    inputPrice?: number;
    outputPrice?: number;
    status?: 'active' | 'disabled';
    isDefault?: boolean;
    sort?: number;
    allowFallback?: boolean;
  }

  export interface UpdateModelRequest {
    displayName?: string;
    maxTokens?: number;
    inputPrice?: number;
    outputPrice?: number;
    status?: 'active' | 'disabled';
    isDefault?: boolean;
    sort?: number;
    allowFallback?: boolean;
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
async function getModel(id: number) {
  return requestClient.get<AiModelApi.AiModel>(`/v1/ai/models/${id}`);
}

/**
 * 创建 AI Model
 * @param data 创建数据
 */
async function createModel(data: AiModelApi.CreateModelRequest) {
  return requestClient.post<AiModelApi.AiModel>('/v1/ai/models', data);
}

/**
 * 更新 AI Model
 * @param id Model ID
 * @param data 更新数据
 */
async function updateModel(id: number, data: AiModelApi.UpdateModelRequest) {
  return requestClient.put<AiModelApi.AiModel>(`/v1/ai/models/${id}`, data);
}

/**
 * 删除 AI Model
 * @param id Model ID
 */
async function deleteModel(id: number) {
  return requestClient.delete(`/v1/ai/models/${id}`);
}

export { createModel, deleteModel, getModel, getModelList, updateModel };
