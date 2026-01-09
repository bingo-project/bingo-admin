// ABOUTME: AI Provider module table columns and form schema definitions
// ABOUTME: Provides configuration for provider list table and edit forms

import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { AiProviderApi } from '#/api';

import { $t } from '#/locales';

export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      componentProps: {
        disabled: true,
      },
      fieldName: 'name',
      label: $t('ai.provider.name'),
    },
    {
      component: 'Input',
      fieldName: 'displayName',
      label: $t('ai.provider.displayName'),
      rules: 'required',
    },
    {
      component: 'InputNumber',
      fieldName: 'sort',
      label: $t('ai.provider.sort'),
    },
    {
      component: 'RadioGroup',
      componentProps: {
        buttonStyle: 'solid',
        options: [
          { label: $t('common.enabled'), value: 'active' },
          { label: $t('common.disabled'), value: 'disabled' },
        ],
        optionType: 'button',
      },
      fieldName: 'status',
      label: $t('ai.provider.status'),
    },
    {
      component: 'Switch',
      fieldName: 'isDefault',
      label: $t('ai.provider.isDefault'),
    },
  ];
}

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('ai.provider.name'),
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          { label: $t('common.enabled'), value: 'active' },
          { label: $t('common.disabled'), value: 'disabled' },
        ],
      },
      fieldName: 'status',
      label: $t('ai.provider.status'),
    },
  ];
}

export function useColumns<T = AiProviderApi.AiProvider>(
  onActionClick: OnActionClickFn<T>,
  onStatusChange?: (newStatus: any, row: T) => PromiseLike<boolean | undefined>,
): VxeTableGridOptions['columns'] {
  return [
    {
      field: 'displayName',
      minWidth: 180,
      title: $t('ai.provider.displayName'),
    },
    {
      field: 'name',
      width: 180,
      title: $t('ai.provider.name'),
    },
    {
      field: 'sort',
      width: 100,
      title: $t('ai.provider.sort'),
    },
    {
      cellRender: {
        name: 'CellTag',
        options: [
          {
            color: 'processing',
            label: $t('common.yes'),
            value: true,
          },
          {
            color: 'default',
            label: $t('common.no'),
            value: false,
          },
        ],
      },
      field: 'isDefault',
      title: $t('ai.provider.isDefault'),
      width: 100,
    },
    {
      cellRender: {
        attrs: { beforeChange: onStatusChange },
        name: onStatusChange ? 'CellSwitch' : 'CellTag',
        options: [
          { color: 'success', label: $t('common.enabled'), value: 'active' },
          { color: 'error', label: $t('common.disabled'), value: 'disabled' },
        ],
        props: {
          checkedChildren: $t('common.enabled'),
          checkedValue: 'active',
          unCheckedChildren: $t('common.disabled'),
          unCheckedValue: 'disabled',
        },
      },
      field: 'status',
      title: $t('ai.provider.status'),
      width: 100,
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'displayName',
          nameTitle: $t('ai.provider.displayName'),
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [{ auth: 'AI:Provider:Edit', code: 'edit' }],
      },
      field: 'operation',
      fixed: 'right',
      title: $t('ai.provider.operation'),
      width: 120,
    },
  ];
}
