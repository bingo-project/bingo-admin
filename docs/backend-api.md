# 后端 API 接口文档

## API 文档地址

后端服务运行时访问：
- Swagger UI: `http://localhost:18080/api/docs/index.html`
- Swagger JSON: `http://localhost:18080/api/docs/doc.json`

## 前端 API 定义位置

前端 API 定义在 `apps/web-antd/src/api/` 目录下。

## 关键接口分类

### 认证相关 (Auth)
- 登录、获取用户信息、切换角色、获取菜单、修改密码

### 权限管理
- **角色**: 增删改查、菜单关联
- **管理员**: 增删改查、角色关联
- **菜单**: 增删改查、树形结构、隐藏状态
- **API**: 增删改查、树形分组

## 重要数据结构说明

### AdminInfo (用户信息)
- `role`: 当前激活角色
- `roles`: 用户所有角色列表
- `roleName`: 当前角色名

### 菜单数据
- `/v1/menus/tree` 返回数据不包含 `apiIds`
- `/v1/menus/{id}` 详情包含 `apiIds`（关联的 API ID 列表）
- `status` 为字符串类型：`"enabled"` 或 `"disabled"`
- `parentId` 为父级菜单 ID
