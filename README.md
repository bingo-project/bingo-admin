# Bingo Admin

基于 [Vben Admin v5.5.9](https://github.com/vbenjs/vue-vben-admin/tree/v5.5.9) 的后台管理系统。

## 技术栈

- **框架**: Vue 3 + Vite + TypeScript
- **UI**: Ant Design Vue 4.x
- **状态管理**: Pinia
- **构建工具**: pnpm + Turbo

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发服务
pnpm dev

# 构建
pnpm build
```

## 项目结构

```
bingo-admin/
├── apps/
│   ├── web-antd/          # 主应用
│   └── backend-mock/      # Mock 服务
├── packages/              # 框架核心包
├── internal/              # 构建配置
└── docs/                  # 项目文档
```

详细架构说明见 [docs/architecture.md](docs/architecture.md)。

## 参考资料

- [Vben Admin 官方文档](https://doc.vben.pro/)
- [Ant Design Vue](https://antdv.com/)
