<script lang="ts" setup>
// ABOUTME: AI Quota edit form component
// ABOUTME: Handles update operations for user AI quotas

import type { AiQuotaApi } from '#/api/ai/quota';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { getQuota, updateQuota } from '#/api';
import { $t } from '#/locales';

import { useFormSchema } from '../data';

const emits = defineEmits(['success']);

const uid = ref<number>();
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
      await updateQuota(uid.value!, {
        dailyLimit: values.dailyLimit,
        totalLimit: values.totalLimit,
      });
      emits('success');
      drawerApi.close();
    } finally {
      drawerApi.unlock();
    }
  },
  async onOpenChange(isOpen) {
    if (isOpen) {
      const data = drawerApi.getData<AiQuotaApi.AiQuota>();
      formApi.resetForm();
      loading.value = true;

      if (data?.uid) {
        uid.value = data.uid;
        try {
          const detail = await getQuota(data.uid);
          formApi.setValues({
            dailyLimit: detail.dailyLimit,
            dailyUsed: detail.dailyUsed,
            nickname: detail.nickname,
            totalLimit: detail.totalLimit,
            totalUsed: detail.totalUsed,
            username: detail.username,
          });
        } finally {
          loading.value = false;
        }
      }
    }
  },
});

const getDrawerTitle = computed(() => {
  return $t('ai.quota.editQuota');
});
</script>
<template>
  <Drawer :title="getDrawerTitle">
    <Form v-if="!loading" />
  </Drawer>
</template>
