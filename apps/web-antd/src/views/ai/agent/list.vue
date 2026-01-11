<script lang="ts" setup>
// ABOUTME: AI Agent list page with CRUD operations
// ABOUTME: Displays AI agents with status toggle and action buttons

import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { AiAgentApi } from '#/api';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message, Modal } from 'ant-design-vue';

import { toApiPagination, useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteAgent, getAgentList, updateAgent } from '#/api';
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
          return await getAgentList({
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
  } as VxeTableGridOptions<AiAgentApi.AiAgent>,
});

function onActionClick(e: OnActionClickParams<AiAgentApi.AiAgent>) {
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

async function onStatusChange(newStatus: string, row: AiAgentApi.AiAgent) {
  const status: Record<string, string> = {
    disabled: $t('common.disabled'),
    enabled: $t('common.enabled'),
  };
  try {
    await confirm(
      `${$t('ui.actionMessage.confirmStatusChange', [row.name, status[newStatus]])}`,
      $t('ui.actionTitle.statusChange'),
    );
    await updateAgent(row.id, {
      status: newStatus as 'disabled' | 'enabled',
    });
    message.success($t('ui.actionMessage.operationSuccess'));
    return true;
  } catch {
    return false;
  }
}

function onEdit(row: AiAgentApi.AiAgent) {
  formDrawerApi.setData(row).open();
}

function onDelete(row: AiAgentApi.AiAgent) {
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [row.name]),
    duration: 0,
    key: 'action_process_msg',
  });
  deleteAgent(row.id)
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

function onCreate() {
  formDrawerApi.setData({}).open();
}
</script>
<template>
  <Page auto-content-height>
    <FormDrawer @success="onRefresh" />
    <Grid :table-title="$t('ai.agent.list')">
      <template #toolbar-tools>
        <Button
          v-access:code="'AI:Agent:Create'"
          type="primary"
          @click="onCreate"
        >
          <Plus class="size-5" />
          {{ $t('ui.actionTitle.create', [$t('ai.agent.name')]) }}
        </Button>
      </template>
    </Grid>
  </Page>
</template>
