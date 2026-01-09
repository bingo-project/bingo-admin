# Bingo Admin 架构设计

> 基于 Vben Admin v5.5.9

## 技术选型

| 类别         | 选型                   | 备注         |
| ------------ | ---------------------- | ------------ |
| **基础框架** | Vben Admin 5.5.9       | 开箱即用     |
| **UI 组件**  | Ant Design Vue         | 4.x          |
| **构建**     | pnpm + Vite + Turbo    | Vben 自带    |
| **状态管理** | Pinia                  | Vben 自带    |
| **权限**     | 动态路由 + 按钮级 RBAC | Vben 内置    |
| **国际化**   | Vue I18n               | Vben 内置    |
| **主题**     | 多主题切换             | Vben 内置    |
| **多租户**   | 自行扩展               | 参考芋道实现 |

### 选型理由

1. **开箱即用程度最高**：RBAC、动态路由、按钮权限内置
2. **与 C 端统一 Vue 技术栈**：团队技能复用
3. **中文生态友好**：文档、社区活跃
4. **多租户可扩展**：前端改动小，核心逻辑在后端

---

## 分层架构

```
bingo-admin/
├── apps/
│   ├── web-antd/                  # 【业务层】主应用
│   │   └── src/
│   │       ├── views/             # 业务页面（100% 自己写）
│   │       ├── api/               # API 定义
│   │       ├── router/            # 路由配置
│   │       └── ...
│   └── backend-mock/              # Mock 服务（开发阶段保留）
│
├── packages/                      # 【框架层】需要跟进上游更新
│   ├── @core/                     # 核心包
│   │   ├── base/                  # 基础：design、icons、shared、typings
│   │   ├── composables/           # 组合式函数
│   │   ├── preferences/           # 偏好设置系统
│   │   └── ui-kit/                # UI 组件：form、layout、menu、popup、tabs
│   ├── effects/                   # 功能模块
│   │   ├── access/                # 权限控制
│   │   ├── common-ui/             # 通用 UI
│   │   ├── hooks/                 # Hooks
│   │   ├── layouts/               # 布局组件
│   │   ├── plugins/               # 插件
│   │   └── request/               # 请求封装
│   ├── constants/                 # 常量
│   ├── locales/                   # 国际化
│   ├── stores/                    # 状态管理
│   ├── styles/                    # 样式
│   ├── types/                     # 类型定义
│   └── utils/                     # 工具函数
│
├── internal/                      # 【构建层】基本不改，直接同步
│   ├── lint-configs/              # ESLint 配置
│   ├── tailwind-config/           # Tailwind 配置
│   ├── tsconfig/                  # TS 配置
│   └── vite-config/               # Vite 配置
│
└── scripts/                       # 构建脚本
```

---

## 分层升级策略

| 层         | 目录                         | 升级策略           | 定制程度 |
| ---------- | ---------------------------- | ------------------ | -------- |
| **业务层** | `apps/web-antd/src/views/`   | 不跟进，完全自己写 | 100%     |
| **适配层** | `apps/web-antd/src/adapter/` | 按需跟进           | 30%      |
| **框架层** | `packages/`                  | 重点跟进，精准移植 | 10%      |
| **构建层** | `internal/`                  | 几乎不改，直接同步 | 0%       |

---

## 上游同步策略

1. **基于 v5.5.9 tag** 作为起点
2. **前期**（定制较少）：使用 GitHub Sync Fork 功能跟进上游
3. **中后期**（业务代码多）：转为精准移植，只看 changelog 手动 cherry-pick

**参考源仓库**：

```bash
# 需要参考演示代码时
https://github.com/vbenjs/vue-vben-admin/tree/v5.5.9
```

---

## 多租户扩展方案

```typescript
// 登录时选择租户
const tenantId = selectedTenant.id;

// 请求拦截器自动带租户 ID
axios.interceptors.request.use((config) => {
  config.headers['X-Tenant-ID'] = getTenantId();
  return config;
});
```

---

## 参考资料

- [Vben Admin 官方文档](https://doc.vben.pro/)
- [Vue 3 官方文档](https://vuejs.org/)
- [Ant Design Vue](https://antdv.com/)
