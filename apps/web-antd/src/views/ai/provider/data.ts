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
      componentProps: {
        disabled: true,
      },
      fieldName: 'slug',
      label: $t('ai.provider.slug'),
    },
    {
      component: 'Input',
      fieldName: 'baseUrl',
      label: $t('ai.provider.baseUrl'),
      rules: 'required',
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
      fieldName: 'status',
      label: $t('ai.provider.status'),
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
          { label: $t('common.enabled'), value: 'enabled' },
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
      field: 'name',
      title: $t('ai.provider.name'),
      width: 150,
    },
    {
      field: 'slug',
      title: $t('ai.provider.slug'),
      width: 150,
    },
    {
      field: 'baseUrl',
      title: $t('ai.provider.baseUrl'),
      minWidth: 250,
    },
    {
      cellRender: {
        name: 'CellTag',
        options: [
          {
            color: 'success',
            label: $t('ai.provider.healthStatus.healthy'),
            value: 'healthy',
          },
          {
            color: 'error',
            label: $t('ai.provider.healthStatus.unhealthy'),
            value: 'unhealthy',
          },
          {
            color: 'default',
            label: $t('ai.provider.healthStatus.unknown'),
            value: 'unknown',
          },
        ],
      },
      field: 'healthStatus',
      title: $t('ai.provider.healthStatus.title'),
      width: 120,
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
      title: $t('ai.provider.status'),
      width: 100,
    },
    {
      field: 'lastCheckAt',
      formatter: 'formatDateTime',
      title: $t('ai.provider.lastCheckAt'),
      width: 180,
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'name',
          nameTitle: $t('ai.provider.name'),
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
