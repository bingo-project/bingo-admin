// ABOUTME: AI Agent module table columns and form schema definitions
// ABOUTME: Provides configuration for agent list table and edit forms

import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { AiAgentApi } from '#/api';

import { z } from '#/adapter/form';
import { $t } from '#/locales';

export function useFormSchema(isEdit: boolean): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      componentProps: {
        disabled: isEdit,
      },
      fieldName: 'slug',
      label: $t('ai.agent.slug'),
      rules: z
        .string()
        .min(1, { message: $t('ui.formRules.required') })
        .regex(/^[a-z0-9_]+$/, {
          message: $t('ai.agent.slugFormat'),
        }),
    },
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('ai.agent.name'),
      rules: 'required',
    },
    {
      component: 'Textarea',
      fieldName: 'description',
      label: $t('ai.agent.description'),
    },
    {
      component: 'Input',
      fieldName: 'avatar',
      label: $t('ai.agent.avatar'),
    },
    {
      component: 'Textarea',
      componentProps: {
        rows: 6,
      },
      fieldName: 'prompt',
      label: $t('ai.agent.prompt'),
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        options: [
          { label: $t('ai.agent.category.tech'), value: 'tech' },
          { label: $t('ai.agent.category.general'), value: 'general' },
          { label: $t('ai.agent.category.creative'), value: 'creative' },
          { label: $t('ai.agent.category.career'), value: 'career' },
        ],
      },
      fieldName: 'category',
      label: $t('ai.agent.category.title'),
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'modelName',
      label: $t('ai.agent.modelName'),
    },
    {
      component: 'InputNumber',
      componentProps: {
        max: 2,
        min: 0,
        step: 0.1,
      },
      fieldName: 'temperature',
      label: $t('ai.agent.temperature'),
    },
    {
      component: 'InputNumber',
      componentProps: {
        min: 1,
      },
      fieldName: 'maxTokens',
      label: $t('ai.agent.maxTokens'),
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
      label: $t('ai.agent.status'),
    },
  ];
}

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('ai.agent.name'),
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          { label: $t('ai.agent.category.tech'), value: 'tech' },
          { label: $t('ai.agent.category.general'), value: 'general' },
          { label: $t('ai.agent.category.creative'), value: 'creative' },
          { label: $t('ai.agent.category.career'), value: 'career' },
        ],
      },
      fieldName: 'category',
      label: $t('ai.agent.category.title'),
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
      label: $t('ai.agent.status'),
    },
  ];
}

export function useColumns<T = AiAgentApi.AiAgent>(
  onActionClick: OnActionClickFn<T>,
  onStatusChange?: (newStatus: any, row: T) => PromiseLike<boolean | undefined>,
): VxeTableGridOptions['columns'] {
  return [
    {
      cellRender: {
        name: 'CellAvatar',
      },
      field: 'avatar',
      title: $t('ai.agent.avatar'),
      width: 80,
    },
    {
      field: 'name',
      title: $t('ai.agent.name'),
      width: 150,
    },
    {
      field: 'slug',
      title: $t('ai.agent.slug'),
      width: 150,
    },
    {
      field: 'description',
      title: $t('ai.agent.description'),
      minWidth: 200,
    },
    {
      cellRender: {
        name: 'CellTag',
        options: [
          { color: 'cyan', label: $t('ai.agent.category.tech'), value: 'tech' },
          {
            color: 'blue',
            label: $t('ai.agent.category.general'),
            value: 'general',
          },
          {
            color: 'purple',
            label: $t('ai.agent.category.creative'),
            value: 'creative',
          },
          {
            color: 'orange',
            label: $t('ai.agent.category.career'),
            value: 'career',
          },
        ],
      },
      field: 'category',
      title: $t('ai.agent.category.title'),
      width: 100,
    },
    {
      field: 'modelName',
      title: $t('ai.agent.modelName'),
      width: 120,
    },
    {
      cellRender: {
        name: 'CellTag',
        options: [
          { color: 'blue', label: $t('ai.agent.isSystem'), value: true },
        ],
      },
      field: 'isSystem',
      title: $t('ai.agent.isSystem'),
      width: 100,
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
      title: $t('ai.agent.status'),
      width: 100,
    },
    {
      field: 'createdAt',
      formatter: 'formatDateTime',
      title: $t('ai.agent.createdAt'),
      width: 180,
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'name',
          nameTitle: $t('ai.agent.name'),
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          { auth: 'AI:Agent:Edit', code: 'edit' },
          { auth: 'AI:Agent:Delete', code: 'delete' },
        ],
      },
      field: 'operation',
      fixed: 'right',
      title: $t('ai.agent.operation'),
      width: 150,
    },
  ];
}
