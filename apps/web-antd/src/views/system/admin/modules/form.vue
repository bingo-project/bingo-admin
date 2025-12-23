<script lang="ts" setup>
// ABOUTME: Admin edit form component with role selection
// ABOUTME: Handles create and update operations for admin users

import type { SystemAdminApi } from '#/api/system/admin';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { createAdmin, updateAdmin } from '#/api/system/admin';
import { $t } from '#/locales';

import { useFormSchema } from '../data';

const emits = defineEmits(['success']);

const username = ref<string>();

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
      if (username.value) {
        const { password, ...rest } = values;
        await updateAdmin(username.value, rest);
      } else {
        const submitData: SystemAdminApi.CreateAdminRequest = {
          ...values,
          nickname: values.nickname,
          password: values.password || values.username,
          username: values.username,
        };
        await createAdmin(submitData);
      }
      emits('success');
      drawerApi.close();
    } finally {
      drawerApi.unlock();
    }
  },
  async onOpenChange(isOpen) {
    if (isOpen) {
      const data = drawerApi.getData<SystemAdminApi.SystemAdmin>();
      formApi.resetForm();

      if (data?.username) {
        username.value = data.username;
        formApi.setState({ schema: useFormSchema(true) });
        formApi.setValues({
          ...data,
          roleNames: data.roles?.map((r) => r.name) || [],
        });
      } else {
        username.value = undefined;
        formApi.setState({ schema: useFormSchema(false) });
      }
    }
  },
});

const getDrawerTitle = computed(() => {
  return username.value
    ? $t('common.edit', $t('system.admin.name'))
    : $t('common.create', $t('system.admin.name'));
});
</script>
<template>
  <Drawer :title="getDrawerTitle">
    <Form />
  </Drawer>
</template>
