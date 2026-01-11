<script lang="ts" setup>
// ABOUTME: User list page with CRUD operations
// ABOUTME: Displays users with status toggle and action buttons

import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { UserApi } from '#/api';

import { Page, useVbenDrawer, useVbenModal } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message, Modal } from 'ant-design-vue';

import { toApiPagination, useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteUser, getUserList, updateUser } from '#/api';
import { $t } from '#/locales';

import { useColumns, useGridFormSchema } from './data';
import Form from './modules/form.vue';
import ResetPassword from './modules/reset-password.vue';

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
});

const [ResetPasswordModal, resetPasswordModalApi] = useVbenModal({
  connectedComponent: ResetPassword,
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
          return await getUserList({
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
  } as VxeTableGridOptions<UserApi.User>,
});

function onActionClick(e: OnActionClickParams<UserApi.User>) {
  switch (e.code) {
    case 'delete': {
      onDelete(e.row);
      break;
    }
    case 'edit': {
      onEdit(e.row);
      break;
    }
    case 'resetPassword': {
      onResetPassword(e.row);
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
  row: UserApi.User,
) {
  const status: Recordable<string> = {
    disabled: $t('common.disabled'),
    enabled: $t('common.enabled'),
  };
  try {
    await confirm(
      `${$t('ui.actionMessage.confirmStatusChange', [row.nickname, status[newStatus]])}`,
      $t('ui.actionTitle.statusChange'),
    );
    await updateUser(row.uid, {
      status: newStatus as 'disabled' | 'enabled',
    });
    message.success($t('ui.actionMessage.operationSuccess'));
    return true;
  } catch {
    return false;
  }
}

function onEdit(row: UserApi.User) {
  formDrawerApi.setData(row).open();
}

function onResetPassword(row: UserApi.User) {
  resetPasswordModalApi.setData({ uid: row.uid, username: row.username }).open();
}

function onDelete(row: UserApi.User) {
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [row.nickname]),
    duration: 0,
    key: 'action_process_msg',
  });
  deleteUser(row.uid)
    .then(() => {
      message.success({
        content: $t('ui.actionMessage.deleteSuccess', [row.nickname]),
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
    <ResetPasswordModal @success="onRefresh" />
    <Grid :table-title="$t('user.list.list')">
      <template #toolbar-tools>
        <Button
          v-access:code="'UserCenter:User:Create'"
          type="primary"
          @click="onCreate"
        >
          <Plus class="size-5" />
          {{ $t('ui.actionTitle.create', [$t('user.list.name')]) }}
        </Button>
      </template>
    </Grid>
  </Page>
</template>
