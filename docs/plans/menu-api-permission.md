# 菜单-API 权限关联方案

## 背景

当前系统中，菜单权限和 API 权限是分开管理的：

- 菜单权限：`/v1/roles/{name}/menus` - 控制前端页面/按钮显示
- API 权限：`/v1/roles/{name}/apis` - 控制后端接口访问（Casbin）

问题：角色配置时只能设置菜单权限，无法设置 API 权限，导致两者可能不一致。

## 方案

将菜单扩展到按钮级别，每个按钮关联对应的 API ID。配置角色菜单权限时，自动同步关联的 API 权限到 Casbin。

```
菜单权限（含按钮） → 控制前端 UI 显示/隐藏
       ↓ 自动关联
API 权限（Casbin） → 控制后端接口访问
```

## 现状分析

### 前端已支持字段

| 字段       | 状态     | 说明                     |
| ---------- | -------- | ------------------------ |
| `type`     | ✅ 已有  | 菜单类型                 |
| `authCode` | ✅ 已有  | 权限标识（按钮类型必填） |
| `apiIds`   | ✅ 已实现 | 关联的 API ID 列表       |

### 前端菜单类型定义

| 值         | 说明             | 是否需要关联 API                 |
| ---------- | ---------------- | -------------------------------- |
| `catalog`  | 目录，用于分组   | 否                               |
| `menu`     | 菜单，对应页面   | 可选（如页面加载需要的列表 API） |
| `button`   | 按钮，页面内操作 | 是                               |
| `embedded` | 内嵌页面         | 否                               |
| `link`     | 外链             | 否                               |

## 后端改动

### 1. 菜单表新增字段

| 字段       | 类型     | 说明                           | 示例               |
| ---------- | -------- | ------------------------------ | ------------------ |
| `type`     | string   | 菜单类型（如已有则跳过）       | `catalog` / `menu` / `button` / `embedded` / `link` |
| `authCode` | string   | 权限标识（如已有则跳过）       | `System:User:Create` |
| `apiIds`   | []int    | **新增** - 关联的 API ID 列表  | `[1, 2, 3]`        |

### 2. 菜单接口调整

#### CreateMenuRequest / UpdateMenuRequest 扩展

```go
type CreateMenuRequest struct {
    // ... 原有字段 ...

    Type     string `json:"type" binding:"omitempty,oneof=catalog menu button embedded link"`
    AuthCode string `json:"authCode" binding:"omitempty,max=100"`
    ApiIds   []int  `json:"apiIds" binding:"omitempty"`  // 新增
}
```

#### MenuInfo 响应扩展

```go
type MenuInfo struct {
    // ... 原有字段 ...

    Type     string `json:"type"`
    AuthCode string `json:"authCode"`
    ApiIds   []int  `json:"apiIds"`  // 新增
}
```

### 3. 角色权限保存逻辑调整

#### 设置角色菜单权限 `PUT /v1/roles/{name}/menus`

```go
func SetRoleMenus(roleName string, menuIds []int) error {
    // 1. 保存菜单权限（原有逻辑）
    if err := saveRoleMenus(roleName, menuIds); err != nil {
        return err
    }

    // 2. 提取关联的 API IDs
    apiIds := extractApiIdsFromMenus(menuIds)

    // 3. 根据 API ID 获取 API 信息，同步到 Casbin
    if err := syncRoleApisByIds(roleName, apiIds); err != nil {
        return err
    }

    return nil
}

func extractApiIdsFromMenus(menuIds []int) []int {
    var apiIds []int
    menus := getMenusByIds(menuIds)
    for _, menu := range menus {
        if len(menu.ApiIds) > 0 {
            apiIds = append(apiIds, menu.ApiIds...)
        }
    }
    return unique(apiIds)
}

func syncRoleApisByIds(roleName string, apiIds []int) error {
    // 清除角色原有 API 权限
    enforcer.DeletePermissionsForUser(roleName)

    // 根据 ID 获取 API 信息
    apis := getApisByIds(apiIds)

    // 添加新的 API 权限
    for _, api := range apis {
        enforcer.AddPermissionForUser(roleName, api.Path, api.Method)
    }

    return nil
}
```

### 4. 数据库迁移

```sql
-- 菜单表添加 apiIds 字段（type 和 auth_code 如已有则跳过）
-- 如果 type 字段不存在：
ALTER TABLE menus ADD COLUMN type VARCHAR(20) DEFAULT 'menu' COMMENT '菜单类型: catalog/menu/button/embedded/link';

-- 如果 auth_code 字段不存在：
ALTER TABLE menus ADD COLUMN auth_code VARCHAR(100) DEFAULT '' COMMENT '权限标识';

-- 新增 api_ids 字段（必须添加）
ALTER TABLE menus ADD COLUMN api_ids JSON COMMENT '关联的 API ID 列表';

-- 添加索引（如有需要）
CREATE INDEX idx_menus_type ON menus(type);
CREATE INDEX idx_menus_auth_code ON menus(auth_code);
```

## 前端改动（已完成）

### 1. 菜单管理页面

- ✅ 当 `type` 为 `menu` 或 `button` 时，显示 `apiIds` 多选组件
- ✅ 从 `/v1/apis/tree` 获取可选的 API 列表
- ✅ 选中后存储 API ID 数组

### 2. 按钮权限控制

使用 Vben 的权限指令（已支持）：

```vue
<template>
  <a-button v-auth="'System:User:Create'">新增</a-button>
  <a-button v-auth="'System:User:Delete'">删除</a-button>
</template>
```

## 数据示例

### 菜单树结构

```json
{
  "id": 1,
  "title": "系统管理",
  "type": "catalog",
  "path": "/system",
  "children": [
    {
      "id": 2,
      "title": "用户管理",
      "type": "menu",
      "path": "/system/user",
      "authCode": "System:User:List",
      "apiIds": [1],
      "children": [
        {
          "id": 3,
          "title": "新增",
          "type": "button",
          "authCode": "System:User:Create",
          "apiIds": [2]
        },
        {
          "id": 4,
          "title": "编辑",
          "type": "button",
          "authCode": "System:User:Update",
          "apiIds": [3]
        },
        {
          "id": 5,
          "title": "删除",
          "type": "button",
          "authCode": "System:User:Delete",
          "apiIds": [4]
        }
      ]
    }
  ]
}
```

## 实施步骤

1. ✅ **前端**：菜单管理页面支持 apiIds 编辑
2. ⏳ **后端**：菜单表添加 apiIds 字段，更新 CRUD 接口
3. ⏳ **后端**：修改 `SetRoleMenus` 逻辑，自动同步 API 权限到 Casbin
4. ⏳ **前端**：角色权限配置展示按钮节点（可选）
