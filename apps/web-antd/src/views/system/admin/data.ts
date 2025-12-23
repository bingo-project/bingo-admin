// ABOUTME: Admin module table columns and form schema definitions
// ABOUTME: Provides configuration for admin list table and edit forms

import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemAdminApi } from '#/api';

import { h } from 'vue';

import { getAllRoles } from '#/api';
import { $t } from '#/locales';

export function useFormSchema(isEdit: boolean): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      componentProps: {
        disabled: isEdit,
      },
      fieldName: 'username',
      label: $t('system.admin.username'),
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'nickname',
      label: $t('system.admin.nickname'),
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: $t('system.admin.username'),
      },
      defaultValue: '',
      dependencies: {
        rules: (values) => {
          if (!isEdit) {
            return 'required';
          }
          return values.password ? 'required' : null;
        },
        triggerFields: ['password'],
      },
      fieldName: 'password',
      help: isEdit ? undefined : `默认与用户名一致`,
      label: $t('system.admin.password'),
    },
    {
      component: 'Input',
      fieldName: 'email',
      label: $t('system.admin.email'),
    },
    {
      component: 'Input',
      fieldName: 'phone',
      label: $t('system.admin.phone'),
    },
    {
      component: 'ApiSelect',
      componentProps: {
        api: async () => {
          const roles = await getAllRoles();
          return (roles || []).map((role) => ({
            description: role.description,
            label: role.name,
            value: role.name,
          }));
        },
        class: 'w-full',
        mode: 'multiple',
        optionLabelProp: 'label',
        placeholder: '请选择角色',
      },
      fieldName: 'roleNames',
      label: $t('system.admin.roles'),
      renderComponentContent: () => ({
        option: ({ description, label }: { description: string; label: string }) => {
          return h('div', { class: 'flex items-center justify-between w-full' }, [
            h('span', {}, label),
            description
              ? h('span', { class: 'text-gray-400 text-xs' }, description)
              : null,
          ]);
        },
      }),
    },
    {
      component: 'RadioGroup',
      componentProps: {
        buttonStyle: 'solid',
        options: [
          { label: $t('common.enabled'), value: 'enabled' },
          { label: $t('common.disabled'), value: 'disabled' },
        ],
        optionType: 'button',
      },
      defaultValue: 'enabled',
      fieldName: 'status',
      label: $t('system.admin.status'),
    },
  ];
}

export function useResetPasswordSchema(): VbenFormSchema[] {
  return [
    {
      component: 'InputPassword',
      fieldName: 'passwordNew',
      label: $t('system.admin.password'),
      rules: 'required',
    },
    {
      component: 'InputPassword',
      fieldName: 'confirmPassword',
      label: $t('system.admin.confirmPassword'),
      rules: 'required',
    },
  ];
}

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'username',
      label: $t('system.admin.username'),
    },
    {
      component: 'Input',
      fieldName: 'nickname',
      label: $t('system.admin.nickname'),
    },
    {
      component: 'Input',
      fieldName: 'email',
      label: $t('system.admin.email'),
    },
    {
      component: 'Input',
      fieldName: 'phone',
      label: $t('system.admin.phone'),
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          { label: $t('common.enabled'), value: 'enabled' },
          { label: $t('common.disabled'), value: 'disabled' },
        ],
      },
      fieldName: 'status',
      label: $t('system.admin.status'),
    },
  ];
}

export interface RoleOption {
  description?: string;
  label: string;
  value: string;
}

export function useColumns<T = SystemAdminApi.SystemAdmin>(
  onActionClick: OnActionClickFn<T>,
  onStatusChange?: (newStatus: any, row: T) => PromiseLike<boolean | undefined>,
  onRolesChange?: (
    newRoles: string[],
    row: T,
  ) => PromiseLike<boolean | undefined>,
  roleOptions?: RoleOption[],
): VxeTableGridOptions['columns'] {
  return [
    {
      field: 'username',
      title: $t('system.admin.username'),
      width: 120,
    },
    {
      field: 'nickname',
      title: $t('system.admin.nickname'),
      width: 120,
    },
    {
      field: 'email',
      minWidth: 180,
      title: $t('system.admin.email'),
    },
    {
      field: 'phone',
      title: $t('system.admin.phone'),
      width: 130,
    },
    {
      cellRender: {
        attrs: {
          onChange: onRolesChange,
        },
        name: onRolesChange ? 'CellTagsEdit' : 'CellTags',
        options: roleOptions,
        props: {
          color: 'processing',
          nameField: 'name',
        },
      },
      field: 'roles',
      minWidth: 150,
      title: $t('system.admin.roles'),
    },
    {
      cellRender: {
        attrs: { beforeChange: onStatusChange },
        name: onStatusChange ? 'CellSwitch' : 'CellTag',
        options: [
          { color: 'success', label: $t('common.enabled'), value: 'enabled' },
          { color: 'error', label: $t('common.disabled'), value: 'disabled' },
        ],
        props: {
          checkedChildren: $t('common.enabled'),
          checkedValue: 'enabled',
          unCheckedChildren: $t('common.disabled'),
          unCheckedValue: 'disabled',
        },
      },
      field: 'status',
      title: $t('system.admin.status'),
      width: 100,
    },
    {
      field: 'createdAt',
      formatter: 'formatDateTime',
      title: $t('system.admin.createdAt'),
      width: 180,
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'username',
          nameTitle: $t('system.admin.name'),
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          {
            code: 'edit',
            text: $t('common.edit'),
          },
          {
            code: 'resetPassword',
            text: $t('system.admin.resetPassword'),
          },
          {
            code: 'delete',
            text: $t('common.delete'),
          },
        ],
      },
      field: 'operation',
      fixed: 'right',
      title: $t('system.admin.operation'),
      width: 200,
    },
  ];
}
