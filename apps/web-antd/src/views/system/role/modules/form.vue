<script lang="ts" setup>
import type { DataNode } from 'ant-design-vue/es/tree';

import type { Recordable } from '@vben/types';

import type { SystemRoleApi } from '#/api/system/role';

import { computed, ref } from 'vue';

import { useVbenDrawer, VbenTree } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';

import { Spin } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { getMenuList } from '#/api/system/menu';
import {
  createRole,
  getRoleMenus,
  setRoleMenus,
  updateRole,
} from '#/api/system/role';
import { $t } from '#/locales';

import { useFormSchema } from '../data';

const emits = defineEmits(['success']);

const formData = ref<SystemRoleApi.SystemRole>();

const [Form, formApi] = useVbenForm({
  schema: useFormSchema(),
  showDefaultActions: false,
});

const permissions = ref<DataNode[]>([]);
const loadingPermissions = ref(false);

const roleName = ref<string>();
const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    const menuIds = (values.permissions || []).map(Number);
    drawerApi.lock();

    try {
      if (roleName.value) {
        await updateRole(roleName.value, values);
        await setRoleMenus(roleName.value, menuIds);
      } else {
        await createRole(values);
        if (values.name) {
          await setRoleMenus(values.name, menuIds);
        }
      }
      emits('success');
      drawerApi.close();
    } catch {
      drawerApi.unlock();
    }
  },
  async onOpenChange(isOpen) {
    if (isOpen) {
      const data = drawerApi.getData<SystemRoleApi.SystemRole>();
      formApi.resetForm();

      if (data?.name) {
        formData.value = data;
        roleName.value = data.name;
        formApi.setValues(data);
      } else {
        roleName.value = undefined;
        formData.value = undefined;
      }

      // 先加载菜单树，再加载角色权限
      await loadPermissions();
      if (data?.name) {
        await loadRoleMenus(data.name);
      }
    }
  },
});

async function loadRoleMenus(name: string) {
  loadingPermissions.value = true;
  try {
    const menuIds = await getRoleMenus(name);
    formApi.setFieldValue('permissions', menuIds.map(String));
  } finally {
    loadingPermissions.value = false;
  }
}

async function loadPermissions() {
  if (permissions.value.length > 0) {
    return;
  }
  loadingPermissions.value = true;
  try {
    const res = await getMenuList();
    permissions.value = res as unknown as DataNode[];
  } finally {
    loadingPermissions.value = false;
  }
}

const getDrawerTitle = computed(() => {
  return roleName.value
    ? $t('common.edit', $t('system.role.name'))
    : $t('common.create', $t('system.role.name'));
});

function getNodeClass(node: Recordable<any>) {
  const classes: string[] = [];
  if (node.value?.type === 'button') {
    classes.push('inline-flex');
    if (node.index % 3 >= 1) {
      classes.push('!pl-0');
    }
  }

  return classes.join(' ');
}
</script>
<template>
  <Drawer :title="getDrawerTitle">
    <Form>
      <template #permissions="slotProps">
        <Spin :spinning="loadingPermissions" wrapper-class-name="w-full">
          <VbenTree
            :tree-data="permissions"
            multiple
            bordered
            :default-expanded-level="2"
            :get-node-class="getNodeClass"
            v-bind="slotProps"
            value-field="id"
            label-field="meta.title"
            icon-field="meta.icon"
          >
            <template #node="{ value }">
              <IconifyIcon v-if="value.meta.icon" :icon="value.meta.icon" />
              {{ $t(value.meta.title) }}
            </template>
          </VbenTree>
        </Spin>
      </template>
    </Form>
  </Drawer>
</template>
<style lang="css" scoped>
:deep(.ant-tree-title) {
  .tree-actions {
    display: none;
    margin-left: 20px;
  }
}

:deep(.ant-tree-title:hover) {
  .tree-actions {
    display: flex;
    flex: auto;
    justify-content: flex-end;
    margin-left: 20px;
  }
}
</style>
