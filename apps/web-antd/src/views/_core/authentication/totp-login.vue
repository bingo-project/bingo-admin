<!-- ABOUTME: TOTP 两步验证登录页面 -->
<!-- ABOUTME: 用户输入 6 位验证码完成二次验证 -->
<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { $t } from '@vben/locales';

import { Button, Form, FormItem, Input, message } from 'ant-design-vue';

import { useAuthStore } from '#/store';

defineOptions({ name: 'TotpLogin' });

const router = useRouter();
const authStore = useAuthStore();

const code = ref('');
const submitting = ref(false);

async function handleSubmit() {
  if (code.value.length !== 6) {
    message.warning($t('authentication.totpCodeTip'));
    return;
  }

  submitting.value = true;
  try {
    const result = await authStore.totpLogin(code.value);
    if (!result) {
      code.value = '';
    }
  } catch {
    code.value = '';
  } finally {
    submitting.value = false;
  }
}

function handleBackToLogin() {
  sessionStorage.removeItem('totp_token');
  router.push('/auth/login');
}
</script>

<template>
  <div class="flex min-h-full flex-col justify-center">
    <!-- 标题 -->
    <div class="mb-7 sm:mx-auto sm:w-full sm:max-w-md">
      <h2
        class="text-foreground mb-3 text-3xl font-bold leading-9 tracking-tight lg:text-4xl"
      >
        {{ $t('authentication.totpTitle') }}
      </h2>
      <p class="text-muted-foreground lg:text-md text-sm">
        {{ $t('authentication.totpSubtitle') }}
      </p>
    </div>

    <Form class="mt-6" @keydown.enter.prevent="handleSubmit">
      <FormItem>
        <Input
          v-model:value="code"
          :maxlength="6"
          :placeholder="$t('authentication.totpCodeTip')"
          size="large"
          autocomplete="one-time-code"
          class="text-center text-xl tracking-widest"
        />
      </FormItem>

      <FormItem>
        <Button
          :loading="submitting || authStore.loginLoading"
          block
          size="large"
          type="primary"
          @click="handleSubmit"
        >
          {{
            submitting || authStore.loginLoading
              ? $t('authentication.totpVerifying')
              : $t('authentication.totpVerify')
          }}
        </Button>
      </FormItem>

      <div class="text-center">
        <a
          class="text-muted-foreground hover:text-primary cursor-pointer text-sm"
          @click="handleBackToLogin"
        >
          {{ $t('authentication.totpBackToLogin') }}
        </a>
      </div>
    </Form>
  </div>
</template>
