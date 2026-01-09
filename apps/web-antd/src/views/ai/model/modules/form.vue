<script lang="ts" setup>
// ABOUTME: AI Model edit form component
// ABOUTME: Handles update operations for AI models

import type { AiModelApi } from '#/api/ai/model';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { getModel, updateModel } from '#/api';
import { $t } from '#/locales';

import { useFormSchema } from '../data';

const emits = defineEmits(['success']);

const modelId = ref<string>();
const loading = ref(false);

const [Form, formApi] = useVbenForm({
  schema: useFormSchema(),
  showDefaultActions: false,
});

const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;

    const values = await formApi.getValues();
    drawerApi.lock();

    try {
      await updateModel(modelId.value!, values);
      emits('success');
      drawerApi.close();
    } finally {
      drawerApi.unlock();
    }
  },
  async onOpenChange(isOpen) {
    if (isOpen) {
      const data = drawerApi.getData<AiModelApi.AiModel>();
      formApi.resetForm();
      loading.value = true;

      if (data?.id) {
        modelId.value = data.id;
        try {
          const detail = await getModel(data.id);
          formApi.setValues({
            contextLength: detail.contextLength,
            displayName: detail.displayName,
            inputPrice: detail.inputPrice,
            maxTokens: detail.maxTokens,
            name: detail.name,
            outputPrice: detail.outputPrice,
            providerName: detail.providerName,
            slug: detail.slug,
            status: detail.status,
          });
        } finally {
          loading.value = false;
        }
      }
    }
  },
});

const getDrawerTitle = computed(() => {
  return $t('common.edit', $t('ai.model.name'));
});
</script>
<template>
  <Drawer :title="getDrawerTitle">
    <Form v-if="!loading" />
  </Drawer>
</template>
