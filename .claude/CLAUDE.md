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

## 1. 参考实现

开发新功能前，先参考这些已实现的标准页面：
- 管理员列表：[apps/web-antd/src/views/system/admin/list.vue](apps/web-antd/src/views/system/admin/list.vue)
- 角色列表：[apps/web-antd/src/views/system/role/list.vue](apps/web-antd/src/views/system/role/list.vue)
- AI 服务商：[apps/web-antd/src/views/ai/provider/](apps/web-antd/src/views/ai/provider/)

## 2. 文件结构

```
views/模块名/
├── list.vue              # 列表页主文件
├── data.ts               # 表格列配置和表单配置
└── modules/
    ├── form.vue          # 编辑表单组件
    └── *.vue             # 其他弹窗组件（如需要）
```

## 3. 列表页关键代码（list.vue）

**初始化顺序**：
```typescript
// 1. 表单抽屉
const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
});

// 2. 表格
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
    rowConfig: {
      keyField: 'id',  // 主键字段：id/username/name 等
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

**新增按钮（使用模板插槽）**：
```vue
<template #toolbar-tools>
  <Button v-access:code="'Xxx:Xxx:Create'" type="primary" @click="onCreate">
    <Plus class="size-5" />
    {{ $t('common.create') }}
  </Button>
</template>
```

**删除操作（带消息提示）**：
```typescript
function onDelete(row: XxxApi.Xxx) {
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [row.name]),
    duration: 0,
    key: 'action_process_msg',
  });
  deleteXxx(row.id)
    .then(() => {
      message.success({
        content: $t('ui.actionMessage.deleteSuccess', [row.name]),
        key: 'action_process_msg',
      });
      onRefresh();
    })
    .catch(() => hideLoading());
}
```

**状态切换（带确认）**：
```typescript
function confirm(content: string, title: string) {
  return new Promise((resolve, reject) => {
    Modal.confirm({
      content,
      onCancel: () => reject(new Error('已取消')),
      onOk: () => resolve(true),
      title,
    });
  });
}

async function onStatusChange(newStatus: string, row: XxxApi.Xxx) {
  try {
    await confirm('确认要修改状态吗？', '状态切换');
    await updateXxx(row.id, { status: newStatus });
    return true;
  } catch {
    return false;
  }
}
```

## 4. 列配置关键代码（data.ts）

**列宽配置**：
```typescript
return [
  { field: 'name', title: $t('xxx.name'), width: 180 },        // 固定宽度
  { field: 'displayName', minWidth: 200, title: $t('xxx.displayName') },  // 弹性列（自动填充）
  { field: 'status', title: $t('xxx.status'), width: 100 },
  { field: 'operation', title: $t('xxx.operation'), width: 130, fixed: 'right' },
];
```

**列宽规则**：
- 固定宽度列使用 `width: number`
- 弹性列使用 `minWidth: number`（只能有一列，会自动填充剩余空间）
- 操作列使用 `fixed: 'right'`

**状态切换列**：
```typescript
{
  cellRender: {
    attrs: { beforeChange: onStatusChange },
    name: onStatusChange ? 'CellSwitch' : 'CellTag',
    options: [
      { color: 'success', label: $t('common.enabled'), value: 'enabled' },
      { color: 'error', label: $t('common.disabled'), value: 'disabled' },
    ],
  },
  field: 'status',
  title: $t('xxx.status'),
  width: 100,
}
```

**操作列**：
```typescript
{
  align: 'center',
  cellRender: {
    attrs: { nameField: 'name', nameTitle: $t('xxx.name'), onClick: onActionClick },
    name: 'CellOperation',
    options: [
      { auth: 'Xxx:Xxx:Edit', code: 'edit' },
      { auth: 'Xxx:Xxx:Delete', code: 'delete' },
    ],
  },
  field: 'operation',
  fixed: 'right',
  title: $t('xxx.operation'),
  width: 130,
}
```

## 5. 表单组件关键代码（modules/form.vue）

**数据回填（必须映射所有字段）**：
```typescript
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
}
```

**提交处理（防止重复提交）**：
```typescript
async onConfirm() {
  const { valid } = await formApi.validate();
  if (!valid) return;

  const values = await formApi.getValues();
  drawerApi.lock();  // 锁定按钮

  try {
    await updateXxx(resourceId.value!, values);
    message.success($t('ui.actionMessage.operationSuccess'));
    emits('success');
    drawerApi.close();
  } finally {
    drawerApi.unlock();  // 无论成功失败都解锁
  }
}
```

**Loading 状态**：
```vue
<template>
  <Drawer :title="getDrawerTitle">
    <Form v-if="!loading" />  <!-- 避免数据未加载时闪烁 -->
  </Drawer>
</template>
```

## 6. API 定义规范

**类型定义**：
```typescript
export namespace XxxApi {
  export interface Xxx {
    [key: string]: any;
    id: number;  // 使用 number，不是 string
    name: string;
    status: 'active' | 'disabled';  // 注意：通常是 active/disabled，不是 enabled/disabled
    createdAt: string;
    updatedAt: string;
  }

  export interface UpdateXxxRequest {
    name?: string;
    status?: 'active' | 'disabled';
  }
}
```

**重要**：
- 类型定义必须与后端 API 文档一致
- ID 类型使用 `number`（不是 `string`）
- 状态枚举值要确认（通常是 `active`/`disabled`）
- 在 `api/index.ts` 中添加 `export * from './模块名';`

## 7. 国际化

**文件结构**：
```
locales/
└── langs/
    ├── zh-CN/
    │   ├── common.json
    │   ├── ui.json
    │   └── 模块名.json
    └── en-US/
        ├── common.json
        ├── ui.json
        └── 模块名.json
```

**命名规范**：
```json
{
  "title": "模块标题",
  "resource": {
    "name": "标识",          // name 用于唯一标识
    "displayName": "显示名称", // displayName 用于显示
    "status": "状态",
    "operation": "操作"
  }
}
```

## 8. 路由

项目使用混合路由模式，后端返回的菜单路由会自动注册。

**不要**在前端重复定义这些路由，删除 `router/routes/modules/` 下的冗余文件。

## 9. 权限控制

**按钮级权限**：
```vue
<Button v-access:code="'AI:Provider:Edit'" type="primary">
  {{ $t('common.create') }}
</Button>
```

权限码格式：`模块:资源:操作`

**操作列权限**：
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

## 10. 常见问题

| 问题                     | 原因                               | 解决方案                                |
| ------------------------ | ---------------------------------- | --------------------------------------- |
| 类型错误："does not export" | API 未在 `api/index.ts` 中导出     | 添加 `export * from './模块名';`        |
| 表单数据未回填           | `formApi.setValues()` 遗漏字段     | 确保所有字段都正确映射                  |
| 列表只占半个屏幕         | 所有列都使用了固定 `width`         | 将一个主要列改为 `minWidth`             |
| 新增按钮不显示           | 使用了 `toolbarConfig.actions`     | 改用模板插槽 `<template #toolbar-tools>` |
| 状态值不匹配             | 前后端枚举值不一致                 | 查看 API 文档，使用正确的枚举值         |

## 11. 开发检查清单

开发新的列表页时：

- [ ] 参考 `system/admin/list.vue` 或 `system/role/list.vue` 实现
- [ ] API 类型与后端文档一致
- [ ] API 在 `api/index.ts` 中导出
- [ ] 列宽配置合理（使用 `minWidth` 让表格填满屏幕）
- [ ] 新增按钮使用模板插槽 `<template #toolbar-tools>`
- [ ] 表单数据回填完整（所有字段都映射）
- [ ] 成功提示使用统一文案 `message.success($t('ui.actionMessage.operationSuccess'))`
- [ ] 国际化文本完整（中英文）
- [ ] 权限码配置正确
- [ ] 混合路由模式下删除冗余路由文件
- [ ] 状态枚举值与后端一致
- [ ] 主键字段 `keyField` 配置正确（可能是 `id`/`username`/`name`）

