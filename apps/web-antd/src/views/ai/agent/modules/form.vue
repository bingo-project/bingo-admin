<script lang="ts" setup>
// ABOUTME: AI Agent edit form component
// ABOUTME: Handles create and update operations for AI agents

import type { AiAgentApi } from '#/api/ai/agent';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { createAgent, getAgent, updateAgent } from '#/api';
import { $t } from '#/locales';

import { useFormSchema } from '../data';

const emits = defineEmits(['success']);

const agentId = ref<string>();
const loading = ref(false);

const [Form, formApi] = useVbenForm({
  schema: useFormSchema(false),
  showDefaultActions: false,
});

const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;

    const values = await formApi.getValues();
    drawerApi.lock();

    try {
      if (agentId.value) {
        await updateAgent(agentId.value, values);
      } else {
        const submitData: AiAgentApi.CreateAgentRequest = {
          ...values,
          name: values.name,
          prompt: values.prompt,
          slug: values.slug,
        };
        await createAgent(submitData);
      }
      emits('success');
      drawerApi.close();
    } finally {
      drawerApi.unlock();
    }
  },
  async onOpenChange(isOpen) {
    if (isOpen) {
      const data = drawerApi.getData<AiAgentApi.AiAgent>();
      formApi.resetForm();
      loading.value = true;

      if (data?.id) {
        agentId.value = data.id;
        formApi.setState({ schema: useFormSchema(true) });
        try {
          const detail = await getAgent(data.id);
          formApi.setValues({
            avatar: detail.avatar,
            category: detail.category,
            description: detail.description,
            maxTokens: detail.maxTokens,
            modelName: detail.modelName,
            name: detail.name,
            prompt: detail.prompt,
            slug: detail.slug,
            status: detail.status,
            temperature: detail.temperature,
          });
        } finally {
          loading.value = false;
        }
      } else {
        agentId.value = undefined;
        formApi.setState({ schema: useFormSchema(false) });
        loading.value = false;
      }
    }
  },
});

const getDrawerTitle = computed(() => {
  return agentId.value
    ? $t('common.edit', $t('ai.agent.name'))
    : $t('common.create', $t('ai.agent.name'));
});
</script>
<template>
  <Drawer :title="getDrawerTitle">
    <Form v-if="!loading" />
  </Drawer>
</template>
