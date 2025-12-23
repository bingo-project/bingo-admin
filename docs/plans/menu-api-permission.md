# 菜单-API 权限关联方案

## 背景

当前系统中，菜单权限和 API 权限是分开管理的：

- 菜单权限：`/v1/roles/{name}/menus` - 控制前端页面/按钮显示
- API 权限：`/v1/roles/{name}/apis` - 控制后端接口访问（Casbin）

问题：角色配置时只能设置菜单权限，无法设置 API 权限，导致两者可能不一致。

## 方案

将菜单扩展到按钮级别，每个按钮关联对应的 API。配置角色菜单权限时，自动同步关联的 API 权限到 Casbin。

```
菜单权限（含按钮） → 控制前端 UI 显示/隐藏
       ↓ 自动关联
API 权限（Casbin） → 控制后端接口访问
```

## 现状分析

### 前端已有字段

前端菜单管理已支持以下字段：

| 字段       | 状态    | 说明                     |
| ---------- | ------- | ------------------------ |
| `type`     | ✅ 已有 | 菜单类型                 |
| `authCode` | ✅ 已有 | 权限标识（按钮类型必填） |
| `apis`     | ❌ 缺少 | 关联的 API 列表          |

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

只需新增 `apis` 字段（`type` 和 `authCode` 如果后端已有则无需添加）：

| 字段 | 类型 | 说明 | 示例 |
| --- | --- | --- | --- |
| `type` | string | 菜单类型（如已有则跳过） | `catalog` / `menu` / `button` / `embedded` / `link` |
| `authCode` | string | 权限标识（如已有则跳过） | `System:User:Create` |
| `apis` | []string | **新增** - 关联的 API 列表 | `["POST\|/v1/users", "GET\|/v1/users/:name"]` |

#### apis 字段格式

格式：`METHOD|/path/:param`

- 分隔符使用 `|`（避免与路径参数 `:name` 冲突）
- 路径参数使用 Gin 风格 `:param`
- 支持通配符（由 Casbin 处理匹配）

示例：

```json
{
  "apis": [
    "POST|/v1/users",
    "GET|/v1/users/:name",
    "PUT|/v1/users/:name",
    "DELETE|/v1/users/:name"
  ]
}
```

#### authCode 权限标识格式

格式：`Module:Resource:Action`

| 示例                 | 说明                       |
| -------------------- | -------------------------- |
| `System:User:List`   | 系统模块-用户资源-列表操作 |
| `System:User:Create` | 系统模块-用户资源-创建操作 |
| `System:User:Update` | 系统模块-用户资源-更新操作 |
| `System:User:Delete` | 系统模块-用户资源-删除操作 |

### 2. 菜单接口调整

#### CreateMenuRequest 扩展

```go
type CreateMenuRequest struct {
    // ... 原有字段 ...

    Type     string   `json:"type" binding:"omitempty,oneof=catalog menu button embedded link"`
    AuthCode string   `json:"authCode" binding:"omitempty,max=100"`
    Apis     []string `json:"apis" binding:"omitempty,dive,max=255"`  // 新增
}
```

#### UpdateMenuRequest 扩展

```go
type UpdateMenuRequest struct {
    // ... 原有字段 ...

    Type     string   `json:"type" binding:"omitempty,oneof=catalog menu button embedded link"`
    AuthCode string   `json:"authCode" binding:"omitempty,max=100"`
    Apis     []string `json:"apis" binding:"omitempty,dive,max=255"`  // 新增
}
```

#### MenuInfo 响应扩展

```go
type MenuInfo struct {
    // ... 原有字段 ...

    Type     string   `json:"type"`
    AuthCode string   `json:"authCode"`
    Apis     []string `json:"apis"`  // 新增
}
```

### 3. 角色权限保存逻辑调整

#### 设置角色菜单权限 `PUT /v1/roles/{name}/menus`

修改逻辑：

```go
func SetRoleMenus(roleName string, menuIds []int) error {
    // 1. 保存菜单权限（原有逻辑）
    if err := saveRoleMenus(roleName, menuIds); err != nil {
        return err
    }

    // 2. 提取关联的 APIs
    apis := extractApisFromMenus(menuIds)

    // 3. 同步到 Casbin
    if err := syncRoleApis(roleName, apis); err != nil {
        return err
    }

    return nil
}

func extractApisFromMenus(menuIds []int) []string {
    var apis []string
    menus := getMenusByIds(menuIds)
    for _, menu := range menus {
        if len(menu.Apis) > 0 {
            apis = append(apis, menu.Apis...)
        }
    }
    // 去重
    return unique(apis)
}

func syncRoleApis(roleName string, apis []string) error {
    // 清除角色原有 API 权限
    enforcer.DeletePermissionsForUser(roleName)

    // 添加新的 API 权限
    for _, api := range apis {
        parts := strings.SplitN(api, "|", 2)
        if len(parts) == 2 {
            method, path := parts[0], parts[1]
            enforcer.AddPermissionForUser(roleName, path, method)
        }
    }

    return nil
}
```

### 4. 数据库迁移

```sql
-- 菜单表添加 apis 字段（type 和 auth_code 如已有则跳过）
-- 如果 type 字段不存在：
ALTER TABLE menus ADD COLUMN type VARCHAR(20) DEFAULT 'menu' COMMENT '菜单类型: catalog/menu/button/embedded/link';

-- 如果 auth_code 字段不存在：
ALTER TABLE menus ADD COLUMN auth_code VARCHAR(100) DEFAULT '' COMMENT '权限标识';

-- 新增 apis 字段（必须添加）
ALTER TABLE menus ADD COLUMN apis JSON COMMENT '关联的API列表';

-- 添加索引（如有需要）
CREATE INDEX idx_menus_type ON menus(type);
CREATE INDEX idx_menus_auth_code ON menus(auth_code);
```

## 前端改动

### 1. 菜单管理页面

现有页面已支持 `type` 和 `authCode`，只需新增：

- 当 `type` 为 `menu` 或 `button` 时，显示 `apis` 多选组件
- 从 `/v1/apis/tree` 获取可选的 API 列表
- 选中后格式化为 `METHOD|/path` 存储

### 2. 角色权限配置

- 菜单树展示时包含按钮类型节点
- 勾选按钮时显示其关联的 API（只读提示，让管理员了解授予了哪些接口权限）

### 3. 按钮权限控制

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
      "apis": ["GET|/v1/admins"],
      "children": [
        {
          "id": 3,
          "title": "新增",
          "type": "button",
          "authCode": "System:User:Create",
          "apis": ["POST|/v1/admins"]
        },
        {
          "id": 4,
          "title": "编辑",
          "type": "button",
          "authCode": "System:User:Update",
          "apis": ["PUT|/v1/admins/:name"]
        },
        {
          "id": 5,
          "title": "删除",
          "type": "button",
          "authCode": "System:User:Delete",
          "apis": ["DELETE|/v1/admins/:name"]
        }
      ]
    }
  ]
}
```

## 实施步骤

1. **后端**：菜单表添加字段，更新 CRUD 接口
2. **后端**：修改 `SetRoleMenus` 逻辑，自动同步 API 权限
3. **前端**：菜单管理页面支持 type/authCode/apis 编辑
4. **前端**：角色权限配置展示按钮节点
5. **数据迁移**：为现有菜单补充 type 字段默认值
