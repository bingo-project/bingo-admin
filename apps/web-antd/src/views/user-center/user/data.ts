// ABOUTME: User module table columns and form schema definitions
// ABOUTME: Provides configuration for user list table and edit forms

import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { UserApi } from '#/api';

import { z } from '#/adapter/form';
import { $t } from '#/locales';

export function useFormSchema(isEdit: boolean): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      componentProps: {
        disabled: isEdit,
      },
      fieldName: 'username',
      label: $t('user.list.username'),
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'nickname',
      label: $t('user.list.nickname'),
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: $t('user.list.password'),
      },
      defaultValue: '',
      dependencies: {
        rules: (values) => {
          const minLengthRule = z
            .string()
            .min(
              6,
              $t('ui.formRules.minLength', [$t('user.list.password'), 6]),
            );
          if (!isEdit) {
            return minLengthRule;
          }
          return values.password ? minLengthRule : null;
        },
        triggerFields: ['password'],
      },
      fieldName: 'password',
      help: isEdit ? undefined : $t('user.list.passwordHelp'),
      label: $t('user.list.password'),
    },
    {
      component: 'Input',
      fieldName: 'email',
      label: $t('user.list.email'),
      rules: z.string().email($t('ui.formRules.email')),
    },
    {
      component: 'Input',
      fieldName: 'phone',
      label: $t('user.list.phone'),
    },
    {
      component: 'InputNumber',
      componentProps: {
        max: 130,
        min: 0,
      },
      fieldName: 'age',
      label: $t('user.list.age'),
    },
    {
      component: 'Select',
      componentProps: {
        options: [
          { label: $t('user.list.genderMale'), value: 'male' },
          { label: $t('user.list.genderFemale'), value: 'female' },
          { label: $t('user.list.genderSecret'), value: 'secret' },
        ],
      },
      fieldName: 'gender',
      label: $t('user.list.gender'),
    },
    {
      component: 'Input',
      fieldName: 'countryCode',
      label: $t('user.list.countryCode'),
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'avatar',
      label: $t('user.list.avatar'),
    },
    {
      component: 'RadioGroup',
      componentProps: {
        buttonStyle: 'solid',
        options: [
          { label: $t('common.enabled'), value: 1 },
          { label: $t('common.disabled'), value: 2 },
        ],
        optionType: 'button',
      },
      defaultValue: 1,
      fieldName: 'status',
      label: $t('user.list.status'),
    },
  ];
}

export function useResetPasswordSchema(): VbenFormSchema[] {
  return [
    {
      component: 'InputPassword',
      fieldName: 'password',
      label: $t('user.list.newPassword'),
      rules: z.string().min(
        6,
        $t('ui.formRules.minLength', [$t('user.list.password'), 6]),
      ),
    },
    {
      component: 'InputPassword',
      fieldName: 'confirmPassword',
      label: $t('user.list.confirmPassword'),
      rules: z.string().min(6),
    },
  ];
}

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'keyword',
      label: $t('user.list.keyword'),
      componentProps: {
        placeholder: $t('user.list.keywordPlaceholder'),
      },
    },
    {
      component: 'Input',
      fieldName: 'countryCode',
      label: $t('user.list.countryCode'),
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          { label: $t('common.enabled'), value: 1 },
          { label: $t('common.disabled'), value: 2 },
        ],
      },
      fieldName: 'status',
      label: $t('user.list.status'),
    },
  ];
}

export function useColumns<T = UserApi.User>(
  onActionClick: OnActionClickFn<T>,
  onStatusChange?: (
    newStatus: number,
    row: T,
  ) => PromiseLike<boolean | undefined>,
): VxeTableGridOptions['columns'] {
  return [
    {
      field: 'username',
      fixed: 'left',
      title: $t('user.list.username'),
      width: 120,
    },
    {
      field: 'nickname',
      title: $t('user.list.nickname'),
      width: 120,
    },
    {
      field: 'uid',
      title: $t('user.list.uid'),
      width: 180,
    },
    {
      field: 'email',
      minWidth: 180,
      title: $t('user.list.email'),
    },
    {
      field: 'phone',
      title: $t('user.list.phone'),
      width: 130,
    },
    {
      cellRender: {
        name: 'CellTag',
        options: [
          { label: $t('user.list.genderMale'), value: 'male' },
          { label: $t('user.list.genderFemale'), value: 'female' },
          { label: $t('user.list.genderSecret'), value: 'secret' },
        ],
      },
      field: 'gender',
      title: $t('user.list.gender'),
      width: 80,
    },
    {
      field: 'age',
      title: $t('user.list.age'),
      width: 80,
    },
    {
      field: 'countryCode',
      title: $t('user.list.countryCode'),
      width: 100,
    },
    {
      cellRender: {
        name: 'CellTag',
        options: [
          { color: 'default', label: $t('user.list.kycNotVerify'), value: 0 },
          { color: 'processing', label: $t('user.list.kycPending'), value: 1 },
          { color: 'success', label: $t('user.list.kycVerified'), value: 2 },
          { color: 'error', label: $t('user.list.kycFailed'), value: 3 },
        ],
      },
      field: 'kycStatus',
      title: $t('user.list.kycStatus'),
      width: 100,
    },
    {
      cellRender: {
        name: 'CellTag',
        options: [
          { color: 'success', label: $t('common.yes'), value: true },
          { color: 'default', label: $t('common.no'), value: false },
        ],
      },
      field: 'payPassword',
      title: $t('user.list.payPassword'),
      width: 100,
    },
    {
      field: 'inviteCount',
      title: $t('user.list.inviteCount'),
      width: 100,
    },
    {
      cellRender: {
        attrs: { beforeChange: onStatusChange },
        name: onStatusChange ? 'CellSwitch' : 'CellTag',
        options: [
          { color: 'success', label: $t('common.enabled'), value: 1 },
          { color: 'error', label: $t('common.disabled'), value: 2 },
        ],
        props: {
          checkedChildren: $t('common.enabled'),
          checkedValue: 1,
          unCheckedChildren: $t('common.disabled'),
          unCheckedValue: 2,
        },
      },
      field: 'status',
      title: $t('user.list.status'),
      width: 100,
    },
    {
      field: 'createdAt',
      formatter: 'formatDateTime',
      title: $t('user.list.createdAt'),
      width: 180,
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'username',
          nameTitle: $t('user.list.name'),
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          { auth: 'UserCenter:User:Edit', code: 'edit' },
          {
            auth: 'UserCenter:User:ResetPassword',
            code: 'resetPassword',
            text: $t('user.list.resetPassword'),
          },
          { auth: 'UserCenter:User:Delete', code: 'delete' },
        ],
      },
      field: 'operation',
      fixed: 'right',
      title: $t('user.list.operation'),
      width: 200,
    },
  ];
}
