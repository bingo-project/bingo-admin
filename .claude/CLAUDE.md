# 项目说明

本项目基于 **Vben Admin v5.5.9** 脚手架构建。

Vben 是一个开箱即用的现代化前端管理模板,提供了完整的权限管理、动态路由、国际化等功能。

官方文档: https://doc.vben.pro

## 技术栈

- **UI 组件**: Ant Design Vue 4.x
- **状态管理**: Pinia
- **构建工具**: pnpm + Vite + Turbo
- **权限**: 动态路由 + 按钮级 RBAC（Vben 内置）
- **国际化**: Vue I18n（Vben 内置）

## 后端 API

API 文档地址：`http://localhost:18080/api/docs/doc.json`

接口说明文档：[docs/backend-api.md](../docs/backend-api.md)

## 路由模式

项目使用**混合路由模式**（accessMode: 'mixed'）:
- 后端控制菜单路由（权限管理）
- 前端静态路由（如个人中心等公开页面）

配置文件：[apps/web-antd/src/preferences.ts](apps/web-antd/src/preferences.ts)

## 项目结构

```
bingo-admin/
├── apps/web-antd/          # 主应用（业务层）
│   └── src/
│       ├── views/          # 业务页面（100% 自定义，不跟进上游）
│       ├── api/            # API 定义
│       └── router/         # 路由配置
├── packages/               # 框架核心（重点跟进上游更新）
├── internal/               # 构建配置（直接同步，基本不改）
└── docs/                   # 项目文档
```

## 分层升级策略

| 层       | 目录                  | 策略                     | 定制程度 |
| -------- | --------------------- | ------------------------ | -------- |
| 业务层   | `apps/web-antd/src/`  | 不跟进，完全自己写       | 100%     |
| 框架层   | `packages/`           | 重点跟进，精准移植       | 10%      |
| 构建层   | `internal/`           | 几乎不改，直接同步       | 0%       |

## 参考源仓库

需要参考演示代码时：
- GitHub: https://github.com/vbenjs/vue-vben-admin/tree/v5.5.9
- 本项目基于 v5.5.9 tag 构建

---

# 前端研发规范

## 1. 列表页面开发规范

### 1.1 文件结构

```
views/模块名/
├── list.vue              # 列表页主文件
├── data.ts               # 表格列配置和表单配置
└── modules/
    └── form.vue          # 编辑表单组件
```

### 1.2 列表页开发流程

参考实现：`apps/web-antd/src/views/system/admin/list.vue`

**关键点**：

1. **使用 `useVbenVxeGrid` 创建表格**
   ```typescript
   const [Grid, gridApi] = useVbenVxeGrid({
     formOptions: {
       schema: useGridFormSchema(),
       submitOnChange: true,
     },
     gridOptions: {
       columns: useColumns(onActionClick, onStatusChange),
       proxyConfig: {
         ajax: {
           query: async ({ page }, formValues) => {
             return await getXxxList({
               ...toApiPagination(page),
               ...formValues,
             });
           },
         },
       },
       toolbarConfig: {
         custom: true,
         export: false,
         refresh: true,
         search: true,
         zoom: true,
       },
     },
   });
   ```

2. **新增按钮使用模板插槽，不使用 `toolbarConfig.actions`**
   ```vue
   <template #toolbar-tools>
     <Button
       v-access:code="'Module:Resource:Create'"
       type="primary"
       @click="onCreate"
     >
       <Plus class="size-5" />
       {{ $t('common.create') }}
     </Button>
   </template>
   ```

3. **表单抽屉使用 `useVbenDrawer`**
   ```typescript
   const [FormDrawer, formDrawerApi] = useVbenDrawer({
     connectedComponent: Form,
     destroyOnClose: true,
   });

   // 编辑时传入数据
   function onEdit(row) {
     formDrawerApi.setData(row).open();
   }

   // 新增时传入空对象
   function onCreate() {
     formDrawerApi.setData({}).open();
   }
   ```

### 1.3 表格列配置规范

在 `data.ts` 中定义列配置：

```typescript
export function useColumns(
  onActionClick: OnActionClickFn<T>,
  onStatusChange?: (newStatus: any, row: T) => PromiseLike<boolean | undefined>,
): VxeTableGridOptions['columns'] {
  return [
    {
      field: 'displayName',
      minWidth: 180,  // 使用 minWidth 让列自动扩展
      title: $t('module.displayName'),
    },
    {
      field: 'name',
      width: 180,  // 固定宽度使用 width
      title: $t('module.name'),
    },
    // ... 其他列
  ];
}
```

**列宽配置策略**：
- **固定宽度列**：使用 `width: number`（如：ID、状态、操作列）
- **弹性列**：使用 `minWidth: number`（如：名称、描述等主要字段）
- **只有一个列使用 `minWidth`**：该列会自动填充剩余空间

### 1.4 操作列配置

```typescript
{
  align: 'center',
  cellRender: {
    attrs: {
      nameField: 'displayName',  // 用于操作确认提示
      nameTitle: $t('module.displayName'),
      onClick: onActionClick,
    },
    name: 'CellOperation',
    options: [
      { auth: 'Module:Resource:Edit', code: 'edit' },
      { auth: 'Module:Resource:Delete', code: 'delete' },
    ],
  },
  field: 'operation',
  fixed: 'right',
  title: $t('module.operation'),
  width: 120,
}
```

---

## 2. API 定义规范

### 2.1 文件结构

```
api/
├── index.ts              # API 统一导出入口
└── 模块名/
    └── resource.ts       # 资源 API 定义
```

### 2.2 API 定义模板

参考实现：`apps/web-antd/src/api/ai/provider.ts`

```typescript
// ABOUTME: 资源 API 定义和类型说明
// ABOUTME: 提供 CRUD 操作

import type { Recordable } from '@vben/types';
import { requestClient } from '#/api/request';

export namespace XxxApi {
  // 列表项类型
  export interface Xxx {
    [key: string]: any;  // 允许扩展字段
    id: number;
    name: string;
    status: 'active' | 'disabled';
    createdAt: string;
    updatedAt: string;
  }

  // 更新请求类型
  export interface UpdateXxxRequest {
    name?: string;
    status?: 'active' | 'disabled';
  }
}

/**
 * 获取列表
 */
async function getXxxList(params?: Recordable<any>) {
  return requestClient.get('/v1/xxx', { params });
}

/**
 * 获取详情
 * @param id 资源 ID
 */
async function getXxx(id: number) {
  return requestClient.get<XxxApi.Xxx>(`/v1/xxx/${id}`);
}

/**
 * 更新资源
 * @param id 资源 ID
 * @param data 更新数据
 */
async function updateXxx(id: number, data: XxxApi.UpdateXxxRequest) {
  return requestClient.put<XxxApi.Xxx>(`/v1/xxx/${id}`, data);
}

export { getXxx, getXxxList, updateXxx };
```

### 2.3 重要规范

1. **类型定义必须与后端 API 文档一致**
   - 从 Swagger 文档获取准确的类型定义
   - 字段名、类型、枚举值必须严格匹配

2. **ID 类型使用 `number`**
   ```typescript
   id: number;  // 不是 string
   ```

3. **状态枚举值**
   - 后端通常是 `active`/`disabled`，不是 `enabled`/`disabled`
   - 务必查看 API 文档确认

4. **API 导出规范**
   ```typescript
   // api/index.ts 中添加模块导出
   export * from './模块名';
   ```

---

## 3. 表单组件开发规范

### 3.1 表单模板

参考实现：`apps/web-antd/src/views/ai/provider/modules/form.vue`

```vue
<script lang="ts" setup>
// ABOUTME: 资源编辑表单组件
// ABOUTME: 处理资源的创建和更新操作

import type { XxxApi } from '#/api/xxx/xxx';
import { computed, ref } from 'vue';
import { useVbenDrawer } from '@vben/common-ui';
import { message } from 'ant-design-vue';
import { useVbenForm } from '#/adapter/form';
import { getXxx, updateXxx } from '#/api';
import { $t } from '#/locales';
import { useFormSchema } from '../data';

const emits = defineEmits(['success']);

const resourceId = ref<number>();
const loading = ref(false);

const [Form, formApi] = useVbenForm({
  schema: useFormSchema(),
  showDefaultActions: false,
});

const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;

    const values = await formApi.getValues();
    drawerApi.lock();

    try {
      await updateXxx(resourceId.value!, values);
      message.success($t('ui.actionMessage.operationSuccess'));
      emits('success');
      drawerApi.close();
    } finally {
      drawerApi.unlock();
    }
  },
  async onOpenChange(isOpen) {
    if (isOpen) {
      const data = drawerApi.getData<XxxApi.Xxx>();
      formApi.resetForm();
      loading.value = true;

      if (data?.id) {
        resourceId.value = data.id;
        try {
          const detail = await getXxx(data.id);
          formApi.setValues({
            // 所有字段都要映射，避免数据丢失
            name: detail.name,
            displayName: detail.displayName,
            status: detail.status,
          });
        } finally {
          loading.value = false;
        }
      } else {
        loading.value = false;
      }
    }
  },
});

const getDrawerTitle = computed(() => {
  return resourceId.value
    ? $t('common.edit', [$t('xxx.resource.name')])
    : $t('common.create', [$t('xxx.resource.name')]);
});
</script>

<template>
  <Drawer :title="getDrawerTitle">
    <Form v-if="!loading" />
  </Drawer>
</template>
```

### 3.2 表单字段配置

在 `data.ts` 中定义表单 schema：

```typescript
export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      componentProps: {
        disabled: true,  // 只读字段
      },
      fieldName: 'name',
      label: $t('xxx.name'),
    },
    {
      component: 'Input',
      fieldName: 'displayName',
      label: $t('xxx.displayName'),
      rules: 'required',
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
      label: $t('xxx.status'),
    },
  ];
}
```

### 3.3 关键注意事项

1. **表单数据回填必须映射所有字段**
   ```typescript
   formApi.setValues({
     // ✅ 正确：所有字段都映射
     name: detail.name,
     displayName: detail.displayName,
     status: detail.status,

     // ❌ 错误：遗漏字段会导致编辑时数据丢失
   });
   ```

2. **处理新增/编辑两种模式**
   ```typescript
   if (data?.id) {
     // 编辑模式：加载详情
     resourceId.value = data.id;
     const detail = await getXxx(data.id);
     formApi.setValues(detail);
   } else {
     // 新增模式：不需要加载数据
     loading.value = false;
   }
   ```

3. **成功提示使用统一文案**
   ```typescript
   message.success($t('ui.actionMessage.operationSuccess'));
   ```

---

## 4. 国际化规范

### 4.1 文件结构

```
locales/
└── langs/
    ├── zh-CN/
    │   ├── common.json    # 通用文本
    │   ├── ui.json        # UI 文本
    │   └── 模块名.json    # 模块文本
    └── en-US/
        ├── common.json
        ├── ui.json
        └── 模块名.json
```

### 4.2 命名规范

```json
{
  "title": "模块标题",
  "resource": {
    "title": "资源名称",
    "list": "资源列表",
    "name": "标识",          // name 用于唯一标识
    "displayName": "显示名称", // displayName 用于显示
    "status": "状态",
    "operation": "操作"
  }
}
```

### 4.3 使用规范

```typescript
// 通用文本
$t('common.create')        // 新增
$t('common.edit')          // 编辑
$t('common.enabled')       // 启用
$t('common.disabled')      // 禁用

// UI 文本
$t('ui.actionMessage.operationSuccess')  // 操作成功
$t('ui.actionTitle.create')              // 新建

// 模块文本
$t('module.resource.name')
```

### 4.4 新增模块翻译步骤

1. 在 `locales/langs/zh-CN/` 创建 `模块名.json`
2. 在 `locales/langs/en-US/` 创建对应的英文翻译
3. 使用 `$t('模块名.key')` 引用

---

## 5. 路由规范

### 5.1 混合路由模式

项目使用 `accessMode: 'mixed'`：
- 后端返回的菜单路由会自动注册
- 前端**不应该**重复定义这些路由

### 5.2 删除冗余路由文件

如果后端已经返回路由配置，删除前端的路由定义文件：

```bash
# ❌ 删除这个文件
router/routes/modules/ai.ts
```

### 5.3 静态路由

只在前端定义不需要权限控制的公开页面（如个人中心）。

---

## 6. 权限控制规范

### 6.1 路由级权限

后端返回的路由已包含权限信息，前端自动处理。

### 6.2 按钮级权限

使用 `v-access:code` 指令：

```vue
<Button
  v-access:code="'AI:Provider:Edit'"
  type="primary"
  @click="onCreate"
>
  {{ $t('common.create') }}
</Button>
```

权限码格式：`模块:资源:操作`

### 6.3 操作列权限

```typescript
{
  cellRender: {
    name: 'CellOperation',
    options: [
      { auth: 'AI:Provider:Edit', code: 'edit' },
      { auth: 'AI:Provider:Delete', code: 'delete' },
    ],
  },
}
```

---

## 7. 常见问题和解决方案

### 7.1 类型错误："The requested module does not export"

**原因**：API 未在 `api/index.ts` 中导出

**解决**：
```typescript
// api/index.ts
export * from './ai';
```

### 7.2 表单数据未回填

**原因**：`formApi.setValues()` 遗漏字段映射

**解决**：确保所有字段都正确映射

### 7.3 列表只占半个屏幕

**原因**：所有列都使用了固定 `width`

**解决**：将一个主要列改为 `minWidth`

### 7.4 新增按钮不显示

**原因**：使用了 `toolbarConfig.actions` 配置方式

**解决**：改用模板插槽 `<template #toolbar-tools>`

### 7.5 状态值不匹配

**原因**：前端使用 `enabled/disabled`，后端使用 `active/disabled`

**解决**：查看 API 文档，使用正确的枚举值

---

## 8. 开发检查清单

开发新的列表页时，检查以下项目：

- [ ] 参考 `system/admin/list.vue` 实现
- [ ] API 类型与后端文档一致
- [ ] API 在 `api/index.ts` 中导出
- [ ] 列宽配置合理（使用 minWidth）
- [ ] 新增按钮使用模板插槽
- [ ] 表单数据回填完整
- [ ] 成功提示使用统一文案
- [ ] 国际化文本完整（中英文）
- [ ] 权限码配置正确
- [ ] 混合路由模式下删除冗余路由文件
- [ ] 状态枚举值与后端一致

