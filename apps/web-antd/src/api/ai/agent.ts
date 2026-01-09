// ABOUTME: AI Agent API definitions and types
// ABOUTME: Provides CRUD operations for AI agent management

import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace AiAgentApi {
  export interface AiAgent {
    [key: string]: any;
    id: string;
    name: string;
    slug: string;
    description?: string;
    avatar?: string;
    prompt: string;
    category: 'career' | 'creative' | 'general' | 'tech';
    modelName?: string;
    temperature?: number;
    maxTokens?: number;
    status: 'disabled' | 'enabled';
    isSystem: boolean;
    createdAt: string;
    updatedAt: string;
  }

  export interface CreateAgentRequest {
    name: string;
    slug: string;
    description?: string;
    avatar?: string;
    prompt: string;
    category: 'career' | 'creative' | 'general' | 'tech';
    modelName?: string;
    temperature?: number;
    maxTokens?: number;
    status?: 'disabled' | 'enabled';
  }

  export interface UpdateAgentRequest {
    name?: string;
    description?: string;
    avatar?: string;
    prompt?: string;
    category?: 'career' | 'creative' | 'general' | 'tech';
    modelName?: string;
    temperature?: number;
    maxTokens?: number;
    status?: 'disabled' | 'enabled';
  }
}

/**
 * 获取 AI Agent 列表
 */
async function getAgentList(params?: Recordable<any>) {
  return requestClient.get('/v1/ai/agents', { params });
}

/**
 * 获取 AI Agent 详情
 * @param id Agent ID
 */
async function getAgent(id: string) {
  return requestClient.get<AiAgentApi.AiAgent>(`/v1/ai/agents/${id}`);
}

/**
 * 创建 AI Agent
 * @param data Agent 数据
 */
async function createAgent(data: AiAgentApi.CreateAgentRequest) {
  return requestClient.post<AiAgentApi.AiAgent>('/v1/ai/agents', data);
}

/**
 * 更新 AI Agent
 * @param id Agent ID
 * @param data 更新数据
 */
async function updateAgent(id: string, data: AiAgentApi.UpdateAgentRequest) {
  return requestClient.put<AiAgentApi.AiAgent>(`/v1/ai/agents/${id}`, data);
}

/**
 * 删除 AI Agent
 * @param id Agent ID
 */
async function deleteAgent(id: string) {
  return requestClient.delete(`/v1/ai/agents/${id}`);
}

export { createAgent, deleteAgent, getAgent, getAgentList, updateAgent };
