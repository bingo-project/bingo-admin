<script lang="ts" setup>
// ABOUTME: AI Quota list page with edit operations
// ABOUTME: Displays user AI quotas with action buttons

import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { AiQuotaApi } from '#/api';

import { Page, useVbenDrawer } from '@vben/common-ui';

import { message, Modal } from 'ant-design-vue';

import { toApiPagination, useVbenVxeGrid } from '#/adapter/vxe-table';
import { getQuotaList, resetDailyQuota } from '#/api';
import { $t } from '#/locales';

import { useColumns, useGridFormSchema } from './data';
import Form from './modules/form.vue';

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
});

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useGridFormSchema(),
    submitOnChange: true,
  },
  gridOptions: {
    columns: useColumns(onActionClick),
    height: 'auto',
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return await getQuotaList({
            ...toApiPagination(page),
            ...formValues,
          });
        },
      },
    },
    rowConfig: {
      keyField: 'uid',
    },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      search: true,
      zoom: true,
    },
  } as VxeTableGridOptions<AiQuotaApi.AiQuota>,
});

function onActionClick(e: OnActionClickParams<AiQuotaApi.AiQuota>) {
  switch (e.code) {
    case 'edit': {
      onEdit(e.row);
      break;
    }
    case 'resetDaily': {
      onResetDaily(e.row);
      break;
    }
  }
}

function confirm(content: string, title: string) {
  return new Promise((resolve, reject) => {
    Modal.confirm({
      content,
      onCancel() {
        reject(new Error('已取消'));
      },
      onOk() {
        resolve(true);
      },
      title,
    });
  });
}

function onEdit(row: AiQuotaApi.AiQuota) {
  formDrawerApi.setData(row).open();
}

function onResetDaily(row: AiQuotaApi.AiQuota) {
  const hideLoading = message.loading({
    content: $t('ai.quota.resettingDaily', [row.nickname || row.username]),
    duration: 0,
    key: 'action_process_msg',
  });
  confirm(
    `${$t('ai.quota.confirmResetDaily', [row.nickname || row.username])}`,
    $t('ai.quota.resetDaily'),
  )
    .then(() => resetDailyQuota(row.uid))
    .then(() => {
      message.success({
        content: $t('ai.quota.resetSuccess', [row.nickname || row.username]),
        key: 'action_process_msg',
      });
      onRefresh();
    })
    .catch(() => {
      hideLoading();
    });
}

function onRefresh() {
  gridApi.query();
}
</script>
<template>
  <Page auto-content-height>
    <FormDrawer @success="onRefresh" />
    <Grid :table-title="$t('ai.quota.list')" />
  </Page>
</template>
