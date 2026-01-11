<script lang="ts" setup>
// ABOUTME: AI Model form component for create and edit
// ABOUTME: Handles create and update operations for AI models

import type { AiModelApi } from '#/api';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { createModel, getModel, updateModel } from '#/api';
import { $t } from '#/locales';

import { useFormSchema } from '../data';

const emits = defineEmits(['success']);

const isEdit = ref(false);
const loading = ref(false);
const resourceId = ref<number>();

const [Form, formApi] = useVbenForm({
  schema: computed(() => useFormSchema(isEdit.value)),
  showDefaultActions: false,
});

const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;

    const values = await formApi.getValues();
    drawerApi.lock();

    try {
      if (isEdit.value) {
        await updateModel(resourceId.value!, values);
      } else {
        await createModel(values);
      }
      message.success($t('ui.actionMessage.operationSuccess'));
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
        isEdit.value = true;
        resourceId.value = data.id;
        try {
          const detail = await getModel(data.id);
          formApi.setValues({
            allowFallback: detail.allowFallback,
            displayName: detail.displayName,
            inputPrice: detail.inputPrice,
            isDefault: detail.isDefault,
            maxTokens: detail.maxTokens,
            model: detail.model,
            outputPrice: detail.outputPrice,
            providerName: detail.providerName,
            sort: detail.sort,
            status: detail.status,
          });
        } finally {
          loading.value = false;
        }
      } else {
        isEdit.value = false;
        loading.value = false;
      }
    }
  },
});

const getDrawerTitle = computed(() => {
  return isEdit.value
    ? $t('ui.actionTitle.edit', [$t('ai.model.name')])
    : $t('ui.actionTitle.create', [$t('ai.model.name')]);
});
</script>
<template>
  <Drawer :title="getDrawerTitle">
    <Form v-if="!loading" />
  </Drawer>
</template>
