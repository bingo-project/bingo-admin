// ABOUTME: AI Quota module table columns and form schema definitions
// ABOUTME: Provides configuration for quota list table and edit forms

import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { AiQuotaApi } from '#/api';

import { $t } from '#/locales';

export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      componentProps: {
        disabled: true,
      },
      fieldName: 'username',
      label: $t('ai.quota.username'),
    },
    {
      component: 'Input',
      componentProps: {
        disabled: true,
      },
      fieldName: 'nickname',
      label: $t('ai.quota.nickname'),
    },
    {
      component: 'InputNumber',
      componentProps: {
        min: 0,
      },
      fieldName: 'dailyLimit',
      label: $t('ai.quota.dailyLimit'),
      rules: 'required',
    },
    {
      component: 'InputNumber',
      componentProps: {
        min: 0,
      },
      fieldName: 'totalLimit',
      label: $t('ai.quota.totalLimit'),
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        disabled: true,
      },
      fieldName: 'dailyUsed',
      label: $t('ai.quota.dailyUsed'),
    },
    {
      component: 'Input',
      componentProps: {
        disabled: true,
      },
      fieldName: 'totalUsed',
      label: $t('ai.quota.totalUsed'),
    },
  ];
}

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'username',
      label: $t('ai.quota.username'),
    },
    {
      component: 'Input',
      fieldName: 'nickname',
      label: $t('ai.quota.nickname'),
    },
  ];
}

export function useColumns<T = AiQuotaApi.AiQuota>(
  onActionClick: OnActionClickFn<T>,
): VxeTableGridOptions['columns'] {
  return [
    {
      field: 'uid',
      title: $t('ai.quota.uid'),
      width: 100,
    },
    {
      field: 'username',
      title: $t('ai.quota.username'),
      width: 150,
    },
    {
      field: 'nickname',
      title: $t('ai.quota.nickname'),
      width: 150,
    },
    {
      cellRender: {
        name: 'CellProgress',
        props: {
          maxField: 'dailyLimit',
          valueField: 'dailyUsed',
        },
      },
      field: 'dailyUsed',
      title: $t('ai.quota.dailyQuota'),
      minWidth: 200,
    },
    {
      cellRender: {
        name: 'CellProgress',
        props: {
          maxField: 'totalLimit',
          valueField: 'totalUsed',
        },
      },
      field: 'totalUsed',
      title: $t('ai.quota.totalQuota'),
      minWidth: 200,
    },
    {
      field: 'resetAt',
      formatter: 'formatDateTime',
      title: $t('ai.quota.resetAt'),
      width: 180,
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'username',
          nameTitle: $t('ai.quota.name'),
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          { auth: 'AI:Quota:Edit', code: 'edit' },
          {
            auth: 'AI:Quota:ResetDaily',
            code: 'resetDaily',
            text: $t('ai.quota.resetDaily'),
          },
        ],
      },
      field: 'operation',
      fixed: 'right',
      title: $t('ai.quota.operation'),
      width: 180,
    },
  ];
}
