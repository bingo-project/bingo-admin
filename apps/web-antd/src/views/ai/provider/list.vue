<script lang="ts" setup>
// ABOUTME: AI Provider list page with edit operations
// ABOUTME: Displays AI providers with status toggle and action buttons

import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { AiProviderApi } from '#/api';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, Modal } from 'ant-design-vue';

import { toApiPagination, useVbenVxeGrid } from '#/adapter/vxe-table';
import { getProviderList, updateProvider } from '#/api';
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
    columns: useColumns(onActionClick, onStatusChange),
    height: 'auto',
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return await getProviderList({
            ...toApiPagination(page),
            ...formValues,
          });
        },
      },
    },
    rowConfig: {
      keyField: 'id',
    },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      search: true,
      zoom: true,
    },
  } as VxeTableGridOptions<AiProviderApi.AiProvider>,
});

function onActionClick(e: OnActionClickParams<AiProviderApi.AiProvider>) {
  switch (e.code) {
    case 'edit': {
      onEdit(e.row);
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

async function onStatusChange(
  newStatus: string,
  row: AiProviderApi.AiProvider,
) {
  const status: Record<string, string> = {
    active: $t('common.enabled'),
    disabled: $t('common.disabled'),
  };
  try {
    await confirm(
      `${$t('ui.actionMessage.confirmStatusChange', [row.displayName, status[newStatus]])}`,
      $t('ui.actionTitle.statusChange'),
    );
    await updateProvider(row.id, {
      status: newStatus as 'active' | 'disabled',
    });
    message.success($t('ui.actionMessage.operationSuccess'));
    return true;
  } catch {
    return false;
  }
}

function onEdit(row: AiProviderApi.AiProvider) {
  formDrawerApi.setData(row).open();
}

function onCreate() {
  formDrawerApi.setData({}).open();
}

function onRefresh() {
  gridApi.query();
}
</script>
<template>
  <Page auto-content-height>
    <FormDrawer @success="onRefresh" />
    <Grid :table-title="$t('ai.provider.list')">
      <template #toolbar-tools>
        <Button
          v-access:code="'AI:Provider:Edit'"
          type="primary"
          @click="onCreate"
        >
          <Plus class="size-5" />
          {{ $t('common.create') }}
        </Button>
      </template>
    </Grid>
  </Page>
</template>
