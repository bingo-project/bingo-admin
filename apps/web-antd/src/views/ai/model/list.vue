<script lang="ts" setup>
// ABOUTME: AI Model list page with CRUD operations
// ABOUTME: Displays AI models with status toggle and action buttons

import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { AiModelApi } from '#/api';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message, Modal } from 'ant-design-vue';

import { toApiPagination, useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteModel, getModelList, updateModel } from '#/api';
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
    case 'delete': {
      onDelete(e.row);
      break;
    }
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

async function onStatusChange(newStatus: string, row: AiModelApi.AiModel) {
  const status: Record<string, string> = {
    active: $t('common.enabled'),
    disabled: $t('common.disabled'),
  };
  try {
    await confirm(
      `${$t('ui.actionMessage.confirmStatusChange', [row.name, status[newStatus]])}`,
      $t('ui.actionTitle.statusChange'),
    );
    await updateModel(row.id, {
      status: newStatus as 'active' | 'disabled',
    });
    message.success($t('ui.actionMessage.operationSuccess'));
    return true;
  } catch {
    return false;
  }
}

function onEdit(row: AiModelApi.AiModel) {
  formDrawerApi.setData(row).open();
}

function onCreate() {
  formDrawerApi.setData({}).open();
}

function onDelete(row: AiModelApi.AiModel) {
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [row.name]),
    duration: 0,
    key: 'action_process_msg',
  });
  deleteModel(row.id)
    .then(() => {
      message.success({
        content: $t('ui.actionMessage.deleteSuccess', [row.name]),
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
    <Grid :table-title="$t('ai.model.list')">
      <template #toolbar-tools>
        <Button
          v-access:code="'AI:Model:Create'"
          type="primary"
          @click="onCreate"
        >
          <Plus class="size-5" />
          {{ $t('ui.actionTitle.create', [$t('ai.model.name')]) }}
        </Button>
      </template>
    </Grid>
  </Page>
</template>
