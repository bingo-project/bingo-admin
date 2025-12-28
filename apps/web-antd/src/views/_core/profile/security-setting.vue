<!-- ABOUTME: 安全设置页面，包含 TOTP 两步验证管理 -->
<!-- ABOUTME: 用户可以启用/禁用 TOTP，查看 QR 码和密钥 -->
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

import { ProfileSecuritySetting } from '@vben/common-ui';
import { CircleAlert, CircleCheckBig, Copy, LockKeyhole } from '@vben/icons';
import { $t } from '@vben/locales';

import {
  Button,
  Card,
  Input,
  message,
  Modal,
  Space,
  Spin,
  Tag,
  Typography,
} from 'ant-design-vue';

import {
  disableTotpApi,
  enableTotpApi,
  getTotpSetupApi,
  getTotpStatusApi,
  type AuthApi,
} from '#/api';

// 原有的安全设置表单
const formSchema = computed(() => {
  return [
    {
      value: true,
      fieldName: 'accountPassword',
      label: '账户密码',
      description: '当前密码强度：强',
    },
    {
      value: true,
      fieldName: 'securityPhone',
      label: '密保手机',
      description: '已绑定手机：138****8293',
    },
    {
      value: true,
      fieldName: 'securityQuestion',
      label: '密保问题',
      description: '未设置密保问题，密保问题可有效保护账户安全',
    },
    {
      value: true,
      fieldName: 'securityEmail',
      label: '备用邮箱',
      description: '已绑定邮箱：ant***sign.com',
    },
  ];
});

// TOTP 相关状态
const loading = ref(false);
const totpEnabled = ref(false);

// 启用 TOTP 相关
const enableModalVisible = ref(false);
const setupData = ref<AuthApi.TOTPSetupResponse | null>(null);
const enableCode = ref('');
const enabling = ref(false);

// 禁用 TOTP 相关
const disableModalVisible = ref(false);
const disableCode = ref('');
const disabling = ref(false);

onMounted(() => {
  loadTotpStatus();
});

async function loadTotpStatus() {
  loading.value = true;
  try {
    const res = await getTotpStatusApi();
    totpEnabled.value = res.enabled;
  } catch {
    // 错误由请求拦截器处理
  } finally {
    loading.value = false;
  }
}

async function handleEnableClick() {
  try {
    const res = await getTotpSetupApi();
    setupData.value = res;
    enableCode.value = '';
    enableModalVisible.value = true;
  } catch {
    // 错误由请求拦截器处理
  }
}

async function handleEnableConfirm() {
  if (enableCode.value.length !== 6) {
    message.warning($t('common.profile.security.totp.codeTip'));
    return;
  }

  enabling.value = true;
  try {
    await enableTotpApi({ code: enableCode.value });
    message.success($t('common.profile.security.totp.enableSuccess'));
    enableModalVisible.value = false;
    totpEnabled.value = true;
  } catch {
    // 错误由请求拦截器处理
  } finally {
    enabling.value = false;
  }
}

function handleDisableClick() {
  disableCode.value = '';
  disableModalVisible.value = true;
}

async function handleDisableConfirm() {
  if (disableCode.value.length !== 6) {
    message.warning($t('common.profile.security.totp.codeTip'));
    return;
  }

  disabling.value = true;
  try {
    await disableTotpApi({ totpCode: disableCode.value });
    message.success($t('common.profile.security.totp.disableSuccess'));
    disableModalVisible.value = false;
    totpEnabled.value = false;
  } catch {
    // 错误由请求拦截器处理
  } finally {
    disabling.value = false;
  }
}

function copySecret() {
  if (setupData.value?.secret) {
    navigator.clipboard.writeText(setupData.value.secret);
    message.success($t('common.profile.security.totp.copied'));
  }
}

function getQrCodeUrl(otpauthUrl: string) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauthUrl)}`;
}
</script>

<template>
  <div class="space-y-6">
    <!-- TOTP 两步验证卡片 -->
    <Spin :spinning="loading">
      <Card>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div
              class="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
            >
              <LockKeyhole class="text-primary size-6" />
            </div>
            <div>
              <Typography.Title :level="5" class="!mb-1">
                {{ $t('common.profile.security.totp.title') }}
              </Typography.Title>
              <Typography.Text type="secondary">
                {{ $t('common.profile.security.totp.description') }}
              </Typography.Text>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <Tag v-if="totpEnabled" color="success">
              <template #icon>
                <CircleCheckBig class="size-3" />
              </template>
              {{ $t('common.profile.security.totp.enabled') }}
            </Tag>
            <Tag v-else color="warning">
              <template #icon>
                <CircleAlert class="size-3" />
              </template>
              {{ $t('common.profile.security.totp.disabled') }}
            </Tag>
            <Button v-if="totpEnabled" danger @click="handleDisableClick">
              {{ $t('common.profile.security.totp.disableBtn') }}
            </Button>
            <Button v-else type="primary" @click="handleEnableClick">
              {{ $t('common.profile.security.totp.enableBtn') }}
            </Button>
          </div>
        </div>
      </Card>
    </Spin>

    <!-- 原有的安全设置 -->
    <ProfileSecuritySetting :form-schema="formSchema" />
  </div>

  <!-- 启用 TOTP 弹窗 -->
  <Modal
    v-model:open="enableModalVisible"
    :title="$t('common.profile.security.totp.enableTitle')"
    :confirm-loading="enabling"
    :ok-text="$t('common.profile.security.totp.confirm')"
    :cancel-text="$t('common.cancel')"
    width="480px"
    @ok="handleEnableConfirm"
  >
    <div class="flex flex-col gap-6 py-4">
      <!-- 步骤 1 -->
      <div>
        <Typography.Text strong>
          {{ $t('common.profile.security.totp.step1') }}
        </Typography.Text>
        <Typography.Paragraph type="secondary" class="!mb-0 !mt-1">
          {{ $t('common.profile.security.totp.step1Desc') }}
        </Typography.Paragraph>
      </div>

      <!-- 步骤 2 -->
      <div>
        <Typography.Text strong>
          {{ $t('common.profile.security.totp.step2') }}
        </Typography.Text>
        <Typography.Paragraph type="secondary" class="!mb-4 !mt-1">
          {{ $t('common.profile.security.totp.step2Desc') }}
        </Typography.Paragraph>

        <div v-if="setupData" class="flex flex-col items-center gap-4">
          <div class="rounded-lg border bg-white p-4">
            <img
              :src="getQrCodeUrl(setupData.otpauthUrl)"
              alt="QR Code"
              class="h-48 w-48"
            />
          </div>

          <div class="w-full">
            <Typography.Text type="secondary">
              {{ $t('common.profile.security.totp.secretKey') }}
            </Typography.Text>
            <div class="mt-1 flex items-center gap-2">
              <code
                class="text-foreground bg-muted flex-1 rounded border px-3 py-2 font-mono text-sm"
              >
                {{ setupData.secret }}
              </code>
              <Button size="small" @click="copySecret">
                <template #icon>
                  <Copy class="size-3" />
                </template>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <!-- 步骤 3 -->
      <div>
        <Typography.Text strong>
          {{ $t('common.profile.security.totp.step3') }}
        </Typography.Text>
        <Typography.Paragraph type="secondary" class="!mb-2 !mt-1">
          {{ $t('common.profile.security.totp.step3Desc') }}
        </Typography.Paragraph>
        <Input
          v-model:value="enableCode"
          :maxlength="6"
          :placeholder="$t('common.profile.security.totp.codePlaceholder')"
          size="large"
          class="text-center tracking-widest"
        />
      </div>
    </div>
  </Modal>

  <!-- 禁用 TOTP 弹窗 -->
  <Modal
    v-model:open="disableModalVisible"
    :title="$t('common.profile.security.totp.disableTitle')"
    :confirm-loading="disabling"
    :ok-text="$t('common.profile.security.totp.confirmDisable')"
    :cancel-text="$t('common.cancel')"
    :ok-button-props="{ danger: true }"
    width="400px"
    @ok="handleDisableConfirm"
  >
    <div class="py-4">
      <Typography.Paragraph type="secondary">
        {{ $t('common.profile.security.totp.disableDesc') }}
      </Typography.Paragraph>
      <Space direction="vertical" class="w-full">
        <Typography.Text>
          {{ $t('common.profile.security.totp.enterCode') }}
        </Typography.Text>
        <Input
          v-model:value="disableCode"
          :maxlength="6"
          :placeholder="$t('common.profile.security.totp.codePlaceholder')"
          size="large"
          class="text-center tracking-widest"
        />
      </Space>
    </div>
  </Modal>
</template>
