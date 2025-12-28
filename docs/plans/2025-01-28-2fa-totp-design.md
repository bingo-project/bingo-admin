# 2FA TOTP 功能设计

## 概述

为 bingo-admin 添加两步验证（2FA）功能，包括：
1. 安全设置页面 - TOTP 启用/禁用
2. 登录流程改造 - 处理 TOTP 二次验证
3. 角色管理 - 配置角色是否强制要求 TOTP
4. 切换角色 - 切换到需要 TOTP 的角色时验证

## API 端点

| 端点 | 方法 | 用途 |
|------|------|------|
| `/v1/auth/security/totp/status` | GET | 获取当前 TOTP 启用状态 |
| `/v1/auth/security/totp/setup` | POST | 获取 secret 和 otpauthUrl |
| `/v1/auth/security/totp/enable` | POST | 启用 TOTP（需要 code） |
| `/v1/auth/security/totp/disable` | POST | 禁用 TOTP（需要 totpCode，预留 verifyCode） |
| `/v1/auth/login/totp` | POST | TOTP 二次登录验证（需要 code + totpToken） |

### 类型定义

```typescript
// TOTP 状态
interface TOTPStatusResponse {
  enabled: boolean;
}

// TOTP 设置（生成 QR 码）
interface TOTPSetupResponse {
  secret: string;
  otpauthUrl: string;
}

// 启用 TOTP
interface TOTPEnableRequest {
  code: string;  // 6 位验证码
}

// 禁用 TOTP
interface TOTPDisableRequest {
  totpCode: string;      // TOTP 验证码
  verifyCode?: string;   // 邮箱验证码（预留）
}

// 登录返回（已有，需更新类型）
interface LoginResult {
  accessToken: string;
  expiresAt: string;
  requireTotp?: boolean;   // 是否需要 TOTP 验证
  totpToken?: string;      // 两步登录临时 Token
}

// TOTP 登录
interface TOTPLoginRequest {
  code: string;       // TOTP 验证码
  totpToken: string;  // 临时 Token
}

// 切换角色（更新）
interface SwitchRoleParams {
  roleName: string;
  totpCode?: string;  // 切换到需要 TOTP 的角色时必填
}

// 角色信息（更新）
interface SystemRole {
  // ... 现有字段
  requireTotp: boolean;  // 是否强制要求 TOTP
}
```

## 登录流程

```
用户输入密码登录
       ↓
  后端返回结果
       ↓
 requireTotp = true? ──否──→ 正常进入系统
       ↓ 是
 保存 totpToken 到 sessionStorage
       ↓
跳转 /auth/totp-login
       ↓
用户输入 6 位验证码
       ↓
调用 /v1/auth/login/totp
       ↓
  获取真正的 accessToken
       ↓
   进入系统
```

## 切换角色流程

```
用户点击切换角色
       ↓
 目标角色 requireTotp = true? ──否──→ 直接切换
       ↓ 是
 弹出 Modal 输入 TOTP 验证码
       ↓
调用 /v1/auth/switch-role (带 totpCode)
       ↓
   切换成功
```

## 文件变更

### 新增文件

1. `apps/web-antd/src/views/_core/authentication/totp-login.vue`
   - TOTP 二次验证页面
   - 简洁 UI：标题 + 说明 + 6 位验证码输入 + 确认按钮
   - 从 sessionStorage 获取 totpToken

### 修改文件

1. `apps/web-antd/src/api/core/auth.ts`
   - 更新 `LoginResult` 类型，添加 `requireTotp` 和 `totpToken`
   - 更新 `SwitchRoleParams` 类型，添加可选的 `totpCode`
   - 新增 `getTotpStatusApi()` - 获取 TOTP 状态
   - 新增 `getTotpSetupApi()` - 获取 TOTP 设置信息
   - 新增 `enableTotpApi(code)` - 启用 TOTP
   - 新增 `disableTotpApi(totpCode, verifyCode?)` - 禁用 TOTP
   - 新增 `totpLoginApi(code, totpToken)` - TOTP 登录验证

2. `apps/web-antd/src/store/auth.ts`
   - `authLogin` 函数处理 `requireTotp` 返回
   - 新增 `totpLogin` 函数处理二次验证
   - `switchRole` 函数支持传入 `totpCode`
   - 使用 sessionStorage 暂存 totpToken

3. `apps/web-antd/src/views/_core/profile/security-setting.vue`
   - 重写为真实的 TOTP 管理功能
   - 显示当前状态（已启用/未启用）
   - 启用/禁用按钮 + Modal 弹窗

4. `apps/web-antd/src/router/routes/core.ts`
   - 添加 `/auth/totp-login` 路由

5. `apps/web-antd/src/api/system/role.ts`
   - `SystemRole` 类型添加 `requireTotp` 字段

6. `apps/web-antd/src/views/system/role/data.ts`
   - 表单 schema 增加 `requireTotp` Switch 组件
   - 列表 columns 增加 TOTP 要求列

7. 用户下拉菜单组件（切换角色处）
   - 切换角色前检查目标角色 `requireTotp`
   - 若需要，弹出 Modal 输入验证码

## UI 设计

### 安全设置页面

单个 Card 组件：
- 左侧：图标 + 标题（两步验证）+ 描述
- 右侧：状态标签（已启用/未启用）+ 操作按钮

### 启用 TOTP Modal

1. 步骤说明：下载身份验证器应用
2. QR 码展示 + 密钥文本（可复制）
3. 验证码输入框
4. 取消/确认按钮

### 禁用 TOTP Modal

1. 警告说明
2. TOTP 验证码输入框
3. 预留：邮箱验证码输入框（暂时隐藏）
4. 取消/确认按钮

### TOTP 登录页面

- 居中卡片布局
- 标题：两步验证
- 说明文字
- 6 位验证码输入框
- 确认按钮
- 返回登录链接

### 角色表单

在状态字段后增加：
- 字段名：requireTotp
- 组件：Switch
- 标签：强制两步验证
- 默认值：false

### 角色列表

在状态列后增加：
- 字段名：requireTotp
- 标题：两步验证
- 渲染：Tag（是/否）

### 切换角色 TOTP 验证 Modal

- 标题：验证身份
- 说明：切换到此角色需要两步验证
- 6 位验证码输入框
- 取消/确认按钮

## 实施步骤

1. 添加 TOTP 相关 API 函数（auth.ts）
2. 修改 store 登录逻辑，支持 TOTP（auth.ts）
3. 创建 TOTP 登录页面（totp-login.vue）
4. 添加路由配置（core.ts）
5. 重写安全设置页面（security-setting.vue）
6. 更新角色 API 类型（role.ts）
7. 更新角色表单和列表（role/data.ts）
8. 更新切换角色逻辑，支持 TOTP 验证
9. 测试完整流程
