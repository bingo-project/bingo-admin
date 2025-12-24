<script lang="ts" setup>
// ABOUTME: Admin list page with CRUD operations
// ABOUTME: Displays admin users with status toggle and action buttons

import type { Recordable } from '@vben/types';

import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemAdminApi } from '#/api';

import { onMounted, ref } from 'vue';

import { Page, useVbenDrawer, useVbenModal } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message, Modal } from 'ant-design-vue';

import { toApiPagination, useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteAdmin,
  getAdminList,
  getAllRoles,
  setAdminRoles,
  updateAdmin,
} from '#/api';
import { $t } from '#/locales';

import { type RoleOption, useColumns, useGridFormSchema } from './data';
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

const roleOptions = ref<RoleOption[]>([]);

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
          return await getAdminList({
            ...toApiPagination(page),
            ...formValues,
          });
        },
      },
    },
    rowConfig: {
      keyField: 'username',
    },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      search: true,
      zoom: true,
    },
  } as VxeTableGridOptions<SystemAdminApi.SystemAdmin>,
});

onMounted(async () => {
  try {
    const roles = await getAllRoles();
    roleOptions.value = (roles || []).map((role) => ({
      description: role.description,
      label: role.name,
      value: role.name,
    }));
    gridApi.setGridOptions({
      columns: useColumns(
        onActionClick,
        onStatusChange,
        onRolesChange,
        roleOptions.value,
      ),
    });
  } catch {
    // ignore
  }
});

function onActionClick(e: OnActionClickParams<SystemAdminApi.SystemAdmin>) {
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
  row: SystemAdminApi.SystemAdmin,
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
    await updateAdmin(row.username, {
      status: newStatus as 'disabled' | 'enabled',
    });
    return true;
  } catch {
    return false;
  }
}

async function onRolesChange(
  newRoles: string[],
  row: SystemAdminApi.SystemAdmin,
) {
  try {
    await setAdminRoles(row.username, newRoles);
    row.roles = newRoles.map((name) => ({ name }) as SystemAdminApi.SystemRole);
    message.success('角色设置成功');
    return true;
  } catch {
    return false;
  }
}

function onEdit(row: SystemAdminApi.SystemAdmin) {
  formDrawerApi.setData(row).open();
}

function onResetPassword(row: SystemAdminApi.SystemAdmin) {
  resetPasswordModalApi.setData({ username: row.username }).open();
}

function onDelete(row: SystemAdminApi.SystemAdmin) {
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [row.nickname]),
    duration: 0,
    key: 'action_process_msg',
  });
  deleteAdmin(row.username)
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
    <Grid :table-title="$t('system.admin.list')">
      <template #toolbar-tools>
        <Button
          v-access:code="'System:Admin:Create'"
          type="primary"
          @click="onCreate"
        >
          <Plus class="size-5" />
          {{ $t('ui.actionTitle.create', [$t('system.admin.name')]) }}
        </Button>
      </template>
    </Grid>
  </Page>
</template>
