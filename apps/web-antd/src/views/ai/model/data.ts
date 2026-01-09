// ABOUTME: AI Model module table columns and form schema definitions
// ABOUTME: Provides configuration for model list table and edit forms

import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { AiModelApi } from '#/api';

import { $t } from '#/locales';

export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      componentProps: {
        disabled: true,
      },
      fieldName: 'name',
      label: $t('ai.model.name'),
    },
    {
      component: 'Input',
      componentProps: {
        disabled: true,
      },
      fieldName: 'slug',
      label: $t('ai.model.slug'),
    },
    {
      component: 'Input',
      componentProps: {
        disabled: true,
      },
      fieldName: 'providerName',
      label: $t('ai.model.providerName'),
    },
    {
      component: 'Input',
      fieldName: 'displayName',
      label: $t('ai.model.displayName'),
    },
    {
      component: 'InputNumber',
      fieldName: 'contextLength',
      label: $t('ai.model.contextLength'),
    },
    {
      component: 'InputNumber',
      fieldName: 'maxTokens',
      label: $t('ai.model.maxTokens'),
    },
    {
      component: 'InputNumber',
      componentProps: {
        step: 0.0001,
      },
      fieldName: 'inputPrice',
      label: $t('ai.model.inputPrice'),
    },
    {
      component: 'InputNumber',
      componentProps: {
        step: 0.0001,
      },
      fieldName: 'outputPrice',
      label: $t('ai.model.outputPrice'),
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
      label: $t('ai.model.status'),
    },
  ];
}

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('ai.model.name'),
    },
    {
      component: 'Input',
      fieldName: 'slug',
      label: $t('ai.model.slug'),
    },
    {
      component: 'Input',
      fieldName: 'providerName',
      label: $t('ai.model.providerName'),
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
      label: $t('ai.model.status'),
    },
  ];
}

export function useColumns<T = AiModelApi.AiModel>(
  onActionClick: OnActionClickFn<T>,
  onStatusChange?: (newStatus: any, row: T) => PromiseLike<boolean | undefined>,
): VxeTableGridOptions['columns'] {
  return [
    {
      field: 'name',
      title: $t('ai.model.name'),
      width: 150,
    },
    {
      field: 'slug',
      title: $t('ai.model.slug'),
      width: 150,
    },
    {
      field: 'displayName',
      title: $t('ai.model.displayName'),
      width: 150,
    },
    {
      field: 'providerName',
      title: $t('ai.model.providerName'),
      width: 120,
    },
    {
      cellRender: {
        name: 'CellTag',
        options: [
          { color: 'cyan', label: 'Tech', value: 'tech' },
          { color: 'blue', label: 'General', value: 'general' },
          { color: 'purple', label: 'Creative', value: 'creative' },
          { color: 'orange', label: 'Career', value: 'career' },
        ],
      },
      field: 'category',
      title: $t('ai.model.category'),
      width: 100,
    },
    {
      field: 'contextLength',
      title: $t('ai.model.contextLength'),
      width: 120,
    },
    {
      field: 'maxTokens',
      title: $t('ai.model.maxTokens'),
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
      title: $t('ai.model.status'),
      width: 100,
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'name',
          nameTitle: $t('ai.model.name'),
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [{ auth: 'AI:Model:Edit', code: 'edit' }],
      },
      field: 'operation',
      fixed: 'right',
      title: $t('ai.model.operation'),
      width: 120,
    },
  ];
}
