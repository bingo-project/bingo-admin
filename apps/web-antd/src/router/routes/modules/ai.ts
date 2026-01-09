// ABOUTME: AI module routes configuration
// ABOUTME: Defines routes for AI management pages

import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:sparkles',
      order: 100,
      title: $t('ai.title'),
    },
    name: 'AI',
    path: '/ai',
    children: [
      {
        name: 'AIProvider',
        path: '/ai/provider',
        component: () => import('#/views/ai/provider/list.vue'),
        meta: {
          authority: ['AI:Provider:List'],
          icon: 'lucide:server',
          title: $t('ai.provider.title'),
        },
      },
      {
        name: 'AIModel',
        path: '/ai/model',
        component: () => import('#/views/ai/model/list.vue'),
        meta: {
          authority: ['AI:Model:List'],
          icon: 'lucide:circuit-board',
          title: $t('ai.model.title'),
        },
      },
      {
        name: 'AIQuota',
        path: '/ai/quota',
        component: () => import('#/views/ai/quota/list.vue'),
        meta: {
          authority: ['AI:Quota:List'],
          icon: 'lucide:sliders',
          title: $t('ai.quota.title'),
        },
      },
      {
        name: 'AIAgent',
        path: '/ai/agent',
        component: () => import('#/views/ai/agent/list.vue'),
        meta: {
          authority: ['AI:Agent:List'],
          icon: 'lucide:bot',
          title: $t('ai.agent.title'),
        },
      },
    ],
  },
];

export default routes;
