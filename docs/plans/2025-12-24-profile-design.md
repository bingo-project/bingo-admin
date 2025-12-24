# 个人中心功能设计

## 概述

在头像下拉菜单中添加「个人中心」入口，点击后跳转到独立的个人中心页面，用户可以修改基本信息和密码。

## 实现方式

基础代码从 vben main 分支（`../vue-vben-admin`）复制，**保持与模板代码一致**，便于后续升级。

### 复制来源

| 源文件（vben main） | 目标文件（bingo-admin） | 说明 |
|---------------------|------------------------|------|
| `playground/src/views/_core/profile/*` | `apps/web-antd/src/views/_core/profile/*` | 页面组件，保持一致 |
| `playground/src/layouts/basic.vue` | `apps/web-antd/src/layouts/basic.vue` | 菜单入口，合并差异 |
| `playground/src/router/routes/modules/vben.ts` | `apps/web-antd/src/router/routes/modules/vben.ts` | 路由配置，添加 Profile |
| `playground/src/locales/langs/*/page.json` | `apps/web-antd/src/locales/langs/*/page.json` | 国际化 |

### 注意事项

- 页面组件（profile/*）直接复制，保持与 vben 一致
- 只在业务逻辑处（API 调用、表单提交）做必要的适配
- 通用 UI 组件（`@vben/common-ui` 中的 Profile 组件）已在 packages 中，无需复制

## 功能范围

### 第一期（本次实现）

| Tab | 功能 | 后端接口 |
|-----|------|---------|
| 基本设置 | 修改 nickname、email、phone | PUT `/v1/admins/{username}` |
| 修改密码 | 旧密码 + 新密码 + 确认密码 | PUT `/v1/auth/change-password` |

**注意**：基本设置只允许更新 nickname、email、phone，不允许更新角色。

### 后续迭代（暂不实现）

- 安全设置
- 通知设置
- 头像上传

## 页面布局

参考 vben main 分支的 profile 实现：

```
+------------------+----------------------------------------+
|                  |                                        |
|    [Avatar]      |                                        |
|    昵称          |           Tab 内容区域                  |
|    用户名        |                                        |
|                  |                                        |
|  +-----------+   |                                        |
|  | 基本设置  |   |                                        |
|  +-----------+   |                                        |
|  | 修改密码  |   |                                        |
|  +-----------+   |                                        |
|                  |                                        |
+------------------+----------------------------------------+
     1/6 宽度                    5/6 宽度
```

## 文件结构

```
apps/web-antd/src/
├── api/core/
│   └── auth.ts                    # 添加 changePassword API
├── layouts/
│   └── basic.vue                  # 添加个人中心菜单项
├── locales/langs/
│   ├── zh-CN/page.json            # 添加 profile 国际化
│   └── en-US/page.json            # 添加 profile 国际化
├── router/routes/modules/
│   └── vben.ts                    # 添加 Profile 路由
└── views/_core/profile/
    ├── index.vue                  # 主页面
    ├── base-setting.vue           # 基本信息设置
    └── password-setting.vue       # 修改密码
```

## API 设计

### 修改密码

```typescript
interface ChangePasswordParams {
  passwordOld: string;  // 旧密码，6-18 位
  passwordNew: string;  // 新密码，6-18 位
}

// PUT /v1/auth/change-password
async function changePasswordApi(data: ChangePasswordParams): Promise<void>
```

### 更新个人信息

复用现有 admin API，但只传递允许的字段：

```typescript
interface UpdateProfileParams {
  nickname?: string;
  email?: string;
  phone?: string;
}

// PUT /v1/admins/{username}
async function updateProfileApi(username: string, data: UpdateProfileParams): Promise<AdminInfo>
```

## 表单字段

### 基本设置

| 字段 | 组件 | 验证规则 |
|------|------|---------|
| nickname | Input | 必填，2-20 字符 |
| email | Input | 选填，邮箱格式 |
| phone | Input | 选填 |

### 修改密码

| 字段 | 组件 | 验证规则 |
|------|------|---------|
| passwordOld | VbenInputPassword | 必填，6-18 字符 |
| passwordNew | VbenInputPassword | 必填，6-18 字符，密码强度显示 |
| confirmPassword | VbenInputPassword | 必填，与新密码一致 |

## 路由配置

```typescript
{
  name: 'Profile',
  path: '/profile',
  component: () => import('#/views/_core/profile/index.vue'),
  meta: {
    icon: 'lucide:user',
    hideInMenu: true,
    title: $t('page.auth.profile'),
  },
}
```

## 实现步骤

### 阶段一：复制模板代码并提交

1. 从 vben main 分支复制 profile 相关文件
2. 复制国际化配置
3. **提交原始文件**（保持与 vben 一致，便于后续升级时对比）

### 阶段二：业务适配

4. 添加 API 方法（changePassword、updateProfile）
5. 修改 base-setting.vue 适配后端接口（只允许修改 nickname、email、phone）
6. 修改 password-setting.vue 适配后端接口
7. 添加路由配置
8. 修改 basic.vue 添加个人中心菜单项
9. 提交业务适配代码
