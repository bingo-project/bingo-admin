<script lang="ts" setup>
// ABOUTME: AI Model list page with edit operations
// ABOUTME: Displays AI models with status toggle and action buttons

import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { AiModelApi } from '#/api';

import { Page, useVbenDrawer } from '@vben/common-ui';

import { message, Modal } from 'ant-design-vue';

import { toApiPagination, useVbenVxeGrid } from '#/adapter/vxe-table';
import { getModelList, updateModel } from '#/api';
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
          return await getModelList({
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
  } as VxeTableGridOptions<AiModelApi.AiModel>,
});

function onActionClick(e: OnActionClickParams<AiModelApi.AiModel>) {
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
  row: AiModelApi.AiModel,
) {
  const status: Record<string, string> = {
    disabled: $t('common.disabled'),
    enabled: $t('common.enabled'),
  };
  try {
    await confirm(
      `${$t('ui.actionMessage.confirmStatusChange', [row.name, status[newStatus]])}`,
      $t('ui.actionTitle.statusChange'),
    );
    await updateModel(row.id, {
      status: newStatus as 'disabled' | 'enabled',
    });
    return true;
  } catch {
    return false;
  }
}

function onEdit(row: AiModelApi.AiModel) {
  formDrawerApi.setData(row).open();
}

function onRefresh() {
  gridApi.query();
}
</script>
<template>
  <Page auto-content-height>
    <FormDrawer @success="onRefresh" />
    <Grid :table-title="$t('ai.model.list')" />
  </Page>
</template>
