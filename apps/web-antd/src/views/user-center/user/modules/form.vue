<script lang="ts" setup>
// ABOUTME: User edit form component
// ABOUTME: Handles create and update operations for users

import type { UserApi } from '#/api';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { createUser, getUser, updateUser } from '#/api';
import { $t } from '#/locales';

import { useFormSchema } from '../data';

const emits = defineEmits(['success']);

const loading = ref(false);
const uid = ref<string>();

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
      if (uid.value) {
        const { password, ...rest } = values;
        await updateUser(uid.value, rest);
      } else {
        const submitData: UserApi.CreateUserRequest = {
          ...values,
          nickname: values.nickname,
          password: values.password || values.username,
          username: values.username,
        };
        await createUser(submitData);
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
      const data = drawerApi.getData<UserApi.SystemUser>();
      formApi.resetForm();
      loading.value = true;

      if (data?.uid) {
        uid.value = data.uid;
        formApi.setState({ schema: useFormSchema(true) });
        try {
          const detail = await getUser(data.uid);
          formApi.setValues({
            age: detail.age,
            avatar: detail.avatar,
            countryCode: detail.countryCode,
            email: detail.email,
            gender: detail.gender,
            nickname: detail.nickname,
            phone: detail.phone,
            status: detail.status,
            username: detail.username,
          });
        } finally {
          loading.value = false;
        }
      } else {
        uid.value = undefined;
        formApi.setState({ schema: useFormSchema(false) });
        loading.value = false;
      }
    }
  },
});

const getDrawerTitle = computed(() => {
  return uid.value
    ? $t('common.edit', $t('user.list.name'))
    : $t('common.create', $t('user.list.name'));
});
</script>
<template>
  <Drawer :title="getDrawerTitle">
    <Form v-if="!loading" />
  </Drawer>
</template>
