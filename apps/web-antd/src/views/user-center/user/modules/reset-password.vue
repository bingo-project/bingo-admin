<script lang="ts" setup>
// ABOUTME: User reset password component
// ABOUTME: Handles password reset operation for users

import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { resetUserPassword } from '#/api';
import { $t } from '#/locales';

import { useResetPasswordSchema } from '../data';

const emits = defineEmits(['success']);

const uid = ref<string>();
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

    if (values.password !== values.confirmPassword) {
      message.error($t('user.list.passwordMismatch'));
      return;
    }

    modalApi.lock();

    try {
      await resetUserPassword(uid.value!, { password: values.password });
      message.success($t('ui.actionMessage.operationSuccess'));
      emits('success');
      modalApi.close();
    } finally {
      modalApi.unlock();
    }
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = modalApi.getData<{ uid: string; username: string }>();
      formApi.resetForm();
      uid.value = data?.uid;
      username.value = data?.username;
    }
  },
});
</script>
<template>
  <Modal :title="$t('user.list.resetPasswordTitle')">
    <Form />
  </Modal>
</template>
