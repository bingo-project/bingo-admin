<script lang="ts" setup>
// ABOUTME: Reset password modal component for admin users
// ABOUTME: Allows resetting password with default value same as username

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { resetAdminPassword } from '#/api/system/admin';
import { $t } from '#/locales';

import { useResetPasswordSchema } from '../data';

const emits = defineEmits(['success']);

const username = ref<string>();

const [Form, formApi] = useVbenForm({
  schema: useResetPasswordSchema(),
  showDefaultActions: false,
});

const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;

    const values = await formApi.getValues();

    if (values.passwordNew !== values.confirmPassword) {
      message.error($t('system.admin.passwordMismatch'));
      return;
    }

    if (!username.value) return;

    modalApi.lock();
    try {
      await resetAdminPassword(username.value, {
        passwordNew: values.passwordNew,
        passwordOld: username.value,
      });
      message.success($t('system.admin.resetPasswordSuccess'));
      emits('success');
      modalApi.close();
    } finally {
      modalApi.unlock();
    }
  },
  async onOpenChange(isOpen) {
    if (isOpen) {
      const data = modalApi.getData<{ username: string }>();
      formApi.resetForm();

      if (data?.username) {
        username.value = data.username;
        formApi.setValues({
          confirmPassword: data.username,
          passwordNew: data.username,
        });
      }
    }
  },
});

const getModalTitle = computed(() => {
  return `${$t('system.admin.resetPasswordTitle')} - ${username.value}`;
});
</script>
<template>
  <Modal :title="getModalTitle">
    <Form />
  </Modal>
</template>
