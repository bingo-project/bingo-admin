<script setup lang="ts">
import type { VbenFormSchema } from '#/adapter/form';

import { computed, onMounted, ref } from 'vue';

import { ProfileBaseSetting } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';

import { message } from 'ant-design-vue';

import { getUserInfoApi, updateProfileApi } from '#/api';
import { useAuthStore } from '#/store';

const profileBaseSettingRef = ref();
const userStore = useUserStore();
const authStore = useAuthStore();

const formSchema = computed((): VbenFormSchema[] => {
  return [
    {
      fieldName: 'realName',
      component: 'Input',
      label: '昵称',
      rules: 'required',
    },
    {
      fieldName: 'username',
      component: 'Input',
      label: '用户名',
      componentProps: {
        disabled: true,
      },
    },
    {
      fieldName: 'email',
      component: 'Input',
      label: '邮箱',
    },
    {
      fieldName: 'phone',
      component: 'Input',
      label: '手机号',
    },
  ];
});

onMounted(async () => {
  const data = await getUserInfoApi();
  profileBaseSettingRef.value.getFormApi().setValues(data);
});

async function handleSubmit(values: Record<string, any>) {
  const username = userStore.userInfo?.username;
  if (!username) {
    message.error('用户信息获取失败');
    return;
  }

  await updateProfileApi(username, {
    nickname: values.realName,
    email: values.email,
    phone: values.phone,
  });

  // 更新本地用户信息
  await authStore.fetchUserInfo();

  message.success('基本信息更新成功');
}
</script>
<template>
  <ProfileBaseSetting
    ref="profileBaseSettingRef"
    :form-schema="formSchema"
    @submit="handleSubmit"
  />
</template>
