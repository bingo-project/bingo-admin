<script lang="ts" setup>
// ABOUTME: AI Provider edit form component
// ABOUTME: Handles update operations for AI providers

import type { AiProviderApi } from '#/api/ai/provider';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { getProvider, updateProvider } from '#/api';
import { $t } from '#/locales';

import { useFormSchema } from '../data';

const emits = defineEmits(['success']);

const providerId = ref<number>();
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
      await updateProvider(providerId.value!, values);
      message.success($t('ui.actionMessage.operationSuccess'));
      emits('success');
      drawerApi.close();
    } finally {
      drawerApi.unlock();
    }
  },
  async onOpenChange(isOpen) {
    if (isOpen) {
      const data = drawerApi.getData<AiProviderApi.AiProvider>();
      formApi.resetForm();
      loading.value = true;

      if (data?.id) {
        providerId.value = data.id;
        try {
          const detail = await getProvider(data.id);
          formApi.setValues({
            displayName: detail.displayName,
            isDefault: detail.isDefault,
            name: detail.name,
            sort: detail.sort,
            status: detail.status,
          });
        } finally {
          loading.value = false;
        }
      } else {
        loading.value = false;
      }
    }
  },
});

const getDrawerTitle = computed(() => {
  return $t('common.edit', $t('ai.provider.name'));
});
</script>
<template>
  <Drawer :title="getDrawerTitle">
    <Form v-if="!loading" />
  </Drawer>
</template>
