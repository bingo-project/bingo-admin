// ABOUTME: AI Model module table columns and form schema definitions
// ABOUTME: Provides configuration for model list table and edit forms

import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { AiModelApi } from '#/api';

import { $t } from '#/locales';

export function useFormSchema(isEdit = false): VbenFormSchema[] {
  return [
    {
      component: 'ApiSelect',
      componentProps: {
        api: async () => {
          const { getProviderList } = await import('#/api');
          const providers = await getProviderList();
          return (providers || []).map((provider) => ({
            label: provider.name,
            value: provider.name,
          }));
        },
        disabled: isEdit,
        placeholder: $t('ai.model.providerName'),
      },
      fieldName: 'providerName',
      label: $t('ai.model.providerName'),
      rules: isEdit ? undefined : 'required',
    },
    {
      component: 'Input',
      componentProps: {
        disabled: isEdit,
      },
      fieldName: 'model',
      label: $t('ai.model.name'),
      rules: isEdit ? undefined : 'required',
    },
    {
      component: 'Input',
      fieldName: 'displayName',
      label: $t('ai.model.displayName'),
      rules: isEdit ? undefined : 'required',
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
      component: 'Checkbox',
      componentProps: {},
      defaultValue: false,
      fieldName: 'isDefault',
      label: $t('ai.model.isDefault'),
    },
    {
      component: 'InputNumber',
      fieldName: 'sort',
      label: $t('ai.model.sort'),
    },
    {
      component: 'Checkbox',
      componentProps: {},
      defaultValue: true,
      fieldName: 'allowFallback',
      label: $t('ai.model.allowFallback'),
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
      defaultValue: 'active',
      fieldName: 'status',
      label: $t('ai.model.status'),
    },
  ];
}

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'model',
      label: $t('ai.model.name'),
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
          { label: $t('common.enabled'), value: 'active' },
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
      field: 'model',
      title: $t('ai.model.name'),
      width: 180,
    },
    {
      field: 'displayName',
      minWidth: 200,
      title: $t('ai.model.displayName'),
    },
    {
      field: 'providerName',
      title: $t('ai.model.providerName'),
      width: 120,
    },
    {
      field: 'maxTokens',
      title: $t('ai.model.maxTokens'),
      width: 120,
    },
    {
      field: 'inputPrice',
      title: $t('ai.model.inputPrice'),
      width: 120,
    },
    {
      field: 'outputPrice',
      title: $t('ai.model.outputPrice'),
      width: 120,
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
      title: $t('ai.model.isDefault'),
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
      title: $t('ai.model.status'),
      width: 100,
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'model',
          nameTitle: $t('ai.model.name'),
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          { auth: 'AI:Model:Edit', code: 'edit' },
          { auth: 'AI:Model:Delete', code: 'delete' },
        ],
      },
      field: 'operation',
      fixed: 'right',
      title: $t('ai.model.operation'),
      width: 130,
    },
  ];
}
