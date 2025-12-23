# 角色切换功能实现计划

## 概述

在右上角头像下拉菜单中添加角色切换功能：

- 用户名下方显示当前角色
- 多角色用户可点击切换到其他角色
- 单角色用户显示角色名但不可切换
- 切换后软刷新：重新获取用户信息和菜单，动态更新路由

## 文件修改清单

| 序号 | 文件 | 修改类型 | 说明 |
| --- | --- | --- | --- |
| 1 | `apps/web-antd/src/api/core/auth.ts` | 修改 | 添加切换角色 API |
| 2 | `apps/web-antd/src/api/core/user.ts` | 修改 | 扩展返回的用户信息，包含当前角色 |
| 3 | `packages/types/src/user.ts` | 修改 | 扩展 UserInfo 类型 |
| 4 | `apps/web-antd/src/store/auth.ts` | 修改 | 添加切换角色和刷新权限方法 |
| 5 | `packages/effects/layouts/src/widgets/user-dropdown/user-dropdown.vue` | 修改 | 添加角色显示和切换 UI |
| 6 | `apps/web-antd/src/layouts/basic.vue` | 修改 | 传递角色数据，处理切换事件 |

---

## 任务 1: 添加切换角色 API

**文件**: `apps/web-antd/src/api/core/auth.ts`

**改动说明**: 添加 `switchRoleApi` 函数调用后端切换角色接口

```typescript
// 在文件末尾添加

/** 切换角色请求参数 */
export interface SwitchRoleParams {
  roleName: string;
}

/**
 * 切换当前角色
 * @param data 包含目标角色名
 * @returns 更新后的用户信息
 */
export async function switchRoleApi(data: SwitchRoleParams) {
  return requestClient.put<AdminInfo>('/v1/auth/switch-role', data);
}
```

**注意**: 需要从 user.ts 导入或在此文件定义 AdminInfo 类型。

**验证**:

- TypeScript 编译无错误
- 可以在浏览器控制台手动调用测试

---

## 任务 2: 扩展用户信息 API 返回值

**文件**: `apps/web-antd/src/api/core/user.ts`

**改动说明**:

1. 导出 AdminInfo 和 AdminRole 类型供其他模块使用
2. 修改 getUserInfoApi 返回值，包含当前角色信息

```typescript
// ABOUTME: 用户信息 API，获取和转换后端管理员信息为前端 UserInfo 格式
// ABOUTME: 包含角色信息的获取和转换逻辑

import type { UserInfo } from '@vben/types';

import { requestClient } from '#/api/request';

/** 角色信息 */
export interface AdminRole {
  description: string;
  id: number;
  name: string;
  status?: string;
}

/** 后端返回的管理员信息 */
export interface AdminInfo {
  avatar: string;
  createdAt: string;
  email: string;
  nickname: string;
  phone: string;
  role: AdminRole; // 当前激活角色
  roleName: string; // 当前角色名
  roles: AdminRole[]; // 用户所有角色
  status: number;
  updatedAt: string;
  username: string;
}

/**
 * 获取用户信息
 */
export async function getUserInfoApi(): Promise<UserInfo> {
  const adminInfo = await requestClient.get<AdminInfo>('/v1/auth/user-info');

  // 转换为 Vben UserInfo 格式
  return {
    avatar: adminInfo.avatar || '',
    currentRole: adminInfo.role?.name || adminInfo.roleName,
    desc: adminInfo.role?.description || '',
    homePath: '/analytics',
    realName: adminInfo.nickname,
    roles: adminInfo.roles?.map((r) => r.name) || [adminInfo.roleName],
    // 保留完整角色信息供角色切换使用
    rolesInfo: adminInfo.roles || [],
    token: '',
    userId: adminInfo.username,
    username: adminInfo.username,
  };
}
```

**验证**:

- TypeScript 编译无错误
- 登录后检查 userStore.userInfo 包含 currentRole 和 rolesInfo

---

## 任务 3: 扩展 UserInfo 类型定义

**文件**: `packages/types/src/user.ts`

**改动说明**: 添加 currentRole 和 rolesInfo 字段

```typescript
import type { BasicUserInfo } from '@vben-core/typings';

/** 角色详细信息 */
export interface RoleInfo {
  description: string;
  id: number;
  name: string;
  status?: string;
}

/** 用户信息 */
interface UserInfo extends BasicUserInfo {
  /**
   * 当前激活的角色名
   */
  currentRole?: string;
  /**
   * 用户描述
   */
  desc: string;
  /**
   * 首页地址
   */
  homePath: string;
  /**
   * 角色详细信息列表（用于角色切换）
   */
  rolesInfo?: RoleInfo[];
  /**
   * accessToken
   */
  token: string;
}

export type { RoleInfo, UserInfo };
```

**验证**:

- TypeScript 编译无错误
- IDE 中 UserInfo 类型提示包含新字段

---

## 任务 4: 添加切换角色 Store 方法

**文件**: `apps/web-antd/src/store/auth.ts`

**改动说明**: 添加 `switchRole` 方法，实现切换角色和刷新权限

```typescript
// 在 import 部分添加
import { switchRoleApi } from '#/api';

// 在 useAuthStore 的 return 之前添加以下方法

/**
 * 切换用户角色
 * @param roleName 目标角色名
 */
async function switchRole(roleName: string) {
  try {
    // 1. 调用后端切换角色接口
    await switchRoleApi({ roleName });

    // 2. 重新获取用户信息
    const userInfo = await fetchUserInfo();

    // 3. 重置权限检查标志，触发重新生成路由
    accessStore.setIsAccessChecked(false);

    // 4. 检查当前路由是否仍有权限访问
    const currentPath = router.currentRoute.value.path;
    const userRoles = userInfo.roles ?? [];

    // 5. 重新导航以触发路由守卫刷新权限
    // 如果当前页面无权限，路由守卫会自动处理跳转
    await router.replace({
      path: currentPath,
    });

    notification.success({
      description: `已切换到角色: ${roleName}`,
      duration: 2,
      message: '角色切换成功',
    });

    return userInfo;
  } catch (error) {
    notification.error({
      description: '请稍后重试',
      duration: 3,
      message: '角色切换失败',
    });
    throw error;
  }
}

// 在 return 中添加 switchRole
return {
  $reset,
  authLogin,
  fetchUserInfo,
  loginLoading,
  logout,
  switchRole, // 新增
};
```

**验证**:

- TypeScript 编译无错误
- 可以在控制台调用 `useAuthStore().switchRole('admin')` 测试

---

## 任务 5: 修改 UserDropdown 组件

**文件**: `packages/effects/layouts/src/widgets/user-dropdown/user-dropdown.vue`

**改动说明**:

1. 添加角色相关 props
2. 在用户名下方显示当前角色
3. 多角色时显示可切换的角色列表

### 5.1 修改 Props 接口

```typescript
// 在 Props interface 中添加

interface RoleItem {
  /** 角色描述 */
  description?: string;
  /** 角色名称 */
  name: string;
}

interface Props {
  // ... 现有 props ...

  /**
   * 当前角色名称
   */
  currentRole?: string;
  /**
   * 用户拥有的所有角色
   */
  roles?: RoleItem[];
}
```

### 5.2 添加默认值和计算属性

```typescript
const props = withDefaults(defineProps<Props>(), {
  // ... 现有默认值 ...
  currentRole: '',
  roles: () => [],
});

const emit = defineEmits<{
  logout: [];
  switchRole: [roleName: string]; // 新增
}>();

// 计算是否可切换角色（多于一个角色）
const canSwitchRole = computed(() => props.roles.length > 1);
```

### 5.3 添加切换角色处理函数

```typescript
function handleSwitchRole(roleName: string) {
  if (roleName !== props.currentRole) {
    emit('switchRole', roleName);
    openPopover.value = false;
  }
}
```

### 5.4 修改模板 - 用户信息区域

在 `<DropdownMenuLabel>` 中，用户名下方添加角色显示：

```vue
<DropdownMenuLabel class="flex items-center p-3">
  <VbenAvatar
    :alt="text"
    :src="avatar"
    class="size-12"
    dot
    dot-class="bottom-0 right-1 border-2 size-4 bg-green-500"
  />
  <div class="ml-2 w-full">
    <div
      v-if="tagText || text || $slots.tagText"
      class="text-foreground mb-1 flex items-center text-sm font-medium"
    >
      {{ text }}
      <slot name="tagText">
        <Badge v-if="tagText" class="ml-2 text-green-400">
          {{ tagText }}
        </Badge>
      </slot>
    </div>
    <!-- 当前角色显示 -->
    <div v-if="currentRole" class="text-muted-foreground text-xs font-normal">
      {{ currentRole }}
    </div>
    <div v-else class="text-muted-foreground text-xs font-normal">
      {{ description }}
    </div>
  </div>
</DropdownMenuLabel>
```

### 5.5 修改模板 - 角色切换菜单

在自定义菜单项之后、锁屏之前添加角色切换区域：

```vue
<!-- 自定义菜单项 -->
<DropdownMenuItem
  v-for="menu in menus"
  :key="menu.text"
  class="mx-1 flex cursor-pointer items-center rounded-sm py-1 leading-8"
  @click="menu.handler"
>
  <VbenIcon :icon="menu.icon" class="mr-2 size-4" />
  {{ menu.text }}
</DropdownMenuItem>

<!-- 角色切换区域 -->
<template v-if="roles.length > 0">
  <DropdownMenuSeparator />
  <DropdownMenuLabel
    class="text-muted-foreground px-2 py-1.5 text-xs font-normal"
  >
    {{ $t('ui.widgets.switchRole', '切换角色') }}
  </DropdownMenuLabel>
  <DropdownMenuRadioGroup :model-value="currentRole">
    <DropdownMenuRadioItem
      v-for="role in roles"
      :key="role.name"
      :value="role.name"
      :disabled="!canSwitchRole"
      class="mx-1 cursor-pointer"
      @click="handleSwitchRole(role.name)"
    >
      <span>{{ role.name }}</span>
      <span v-if="role.description" class="text-muted-foreground ml-2 text-xs">
        {{ role.description }}
      </span>
    </DropdownMenuRadioItem>
  </DropdownMenuRadioGroup>
</template>

<DropdownMenuSeparator />
<!-- 锁屏 -->
```

### 5.6 导入新组件

```typescript
import {
  // ... 现有导入 ...
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@vben-core/shadcn-ui';
```

**验证**:

- TypeScript 编译无错误
- 组件渲染正确
- 单角色时显示角色名但不可点击
- 多角色时可点击切换

---

## 任务 6: 集成到布局组件

**文件**: `apps/web-antd/src/layouts/basic.vue`

**改动说明**: 传递角色数据到 UserDropdown，处理切换事件

### 6.1 添加计算属性

```typescript
// 在 script setup 中添加

const currentRole = computed(() => {
  return userStore.userInfo?.currentRole || '';
});

const roles = computed(() => {
  return (
    userStore.userInfo?.rolesInfo?.map((r) => ({
      description: r.description,
      name: r.name,
    })) || []
  );
});

async function handleSwitchRole(roleName: string) {
  await authStore.switchRole(roleName);
}
```

### 6.2 修改模板

```vue
<template #user-dropdown>
  <UserDropdown
    :avatar
    :current-role="currentRole"
    :menus
    :roles
    :text="userStore.userInfo?.realName"
    :description="userStore.userInfo?.desc"
    @logout="handleLogout"
    @switch-role="handleSwitchRole"
  />
</template>
```

**验证**:

- TypeScript 编译无错误
- 登录后下拉菜单显示当前角色
- 点击其他角色可切换
- 切换后菜单刷新

---

## 任务 7: 添加国际化文本（可选）

**文件**: `packages/locales/src/langs/zh-CN/ui.json` 和 `packages/locales/src/langs/en-US/ui.json`

**改动说明**: 添加角色切换相关文本

```json
// zh-CN/ui.json - 在 widgets 下添加
{
  "widgets": {
    "switchRole": "切换角色",
    "switchRoleSuccess": "角色切换成功",
    "switchRoleFailed": "角色切换失败"
  }
}

// en-US/ui.json
{
  "widgets": {
    "switchRole": "Switch Role",
    "switchRoleSuccess": "Role switched successfully",
    "switchRoleFailed": "Failed to switch role"
  }
}
```

---

## 任务 8: 导出 API 函数

**文件**: `apps/web-antd/src/api/index.ts`

**改动说明**: 确保 switchRoleApi 被导出

```typescript
// 检查是否已有此行，如无则添加
export * from './core/auth';
```

---

## 测试验证步骤

### 功能测试

1. **登录测试**
   - 使用多角色账号登录
   - 验证下拉菜单显示当前角色

2. **角色切换测试**
   - 点击其他角色
   - 验证提示"角色切换成功"
   - 验证菜单根据新角色权限刷新
   - 验证当前角色显示更新

3. **单角色测试**
   - 使用单角色账号登录
   - 验证显示角色名
   - 验证无法点击切换

4. **权限刷新测试**
   - 切换到权限较少的角色
   - 验证菜单项减少
   - 如果当前页面无权限，验证跳转到首页

5. **边界情况**
   - 切换角色 API 失败时的错误处理
   - 快速连续切换的处理

### 构建验证

```bash
# 类型检查
pnpm typecheck

# 构建
pnpm build

# 开发模式测试
pnpm dev
```

---

## 依赖关系

```
任务 3 (类型定义)
    ↓
任务 1 (API) + 任务 2 (用户API)
    ↓
任务 4 (Store)
    ↓
任务 5 (组件)
    ↓
任务 6 (布局集成)
    ↓
任务 7 (国际化) - 可选
任务 8 (导出) - 确认
```

建议按此顺序执行。

---

## 风险和注意事项

1. **上游同步**: 修改了 packages 中的 UserDropdown，需要在 CHANGELOG 或文档中记录，便于后续上游同步时处理冲突

2. **权限边界**: 切换角色后如果当前页面无权限，路由守卫会处理，但可能需要更友好的提示

3. **并发切换**: 如果用户快速连续点击切换，需要考虑加 loading 状态防止重复请求
