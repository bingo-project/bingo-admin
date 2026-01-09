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

