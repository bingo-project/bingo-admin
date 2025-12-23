# 后端 API 接口文档

## 接口定义位置

后端 API 接口定义在 Swagger 文件中：

```
../bingo/api/swagger/admserver/swagger.yaml
../bingo/api/swagger/admserver/swagger.json
```

## 查看方式

### 方式 1: 直接查看 YAML 文件

```bash
cat ../bingo/api/swagger/admserver/swagger.yaml
```

### 方式 2: 使用 Swagger UI

如果后端服务运行中，通常可以访问：

```
http://localhost:8080/swagger/index.html
```

（具体端口根据后端配置而定）

### 方式 3: 在线 Swagger Editor

将 swagger.yaml 内容粘贴到 https://editor.swagger.io/ 查看

## 常用接口

### 认证相关 (Auth)

| 接口                       | 方法 | 说明             |
| -------------------------- | ---- | ---------------- |
| `/v1/auth/login`           | POST | 登录             |
| `/v1/auth/user-info`       | GET  | 获取当前用户信息 |
| `/v1/auth/switch-role`     | PUT  | 切换当前角色     |
| `/v1/auth/menus`           | GET  | 获取当前用户菜单 |
| `/v1/auth/change-password` | PUT  | 修改密码         |

### 角色管理 (Role)

| 接口                     | 方法   | 说明         |
| ------------------------ | ------ | ------------ |
| `/v1/roles`              | GET    | 角色列表     |
| `/v1/roles`              | POST   | 创建角色     |
| `/v1/roles/{name}`       | GET    | 获取角色详情 |
| `/v1/roles/{name}`       | PUT    | 更新角色     |
| `/v1/roles/{name}`       | DELETE | 删除角色     |
| `/v1/roles/{name}/menus` | GET    | 获取角色菜单 |
| `/v1/roles/{name}/menus` | PUT    | 设置角色菜单 |
| `/v1/roles/all`          | GET    | 获取所有角色 |

### 管理员管理 (Admin)

| 接口                      | 方法   | 说明           |
| ------------------------- | ------ | -------------- |
| `/v1/admins`              | GET    | 管理员列表     |
| `/v1/admins`              | POST   | 创建管理员     |
| `/v1/admins/{name}`       | GET    | 获取管理员详情 |
| `/v1/admins/{name}`       | PUT    | 更新管理员     |
| `/v1/admins/{name}`       | DELETE | 删除管理员     |
| `/v1/admins/{name}/roles` | PUT    | 设置管理员角色 |

### 菜单管理 (Menu)

| 接口             | 方法   | 说明         |
| ---------------- | ------ | ------------ |
| `/v1/menus`      | GET    | 菜单列表     |
| `/v1/menus`      | POST   | 创建菜单     |
| `/v1/menus/{id}` | GET    | 获取菜单详情 |
| `/v1/menus/{id}` | PUT    | 更新菜单     |
| `/v1/menus/{id}` | DELETE | 删除菜单     |
| `/v1/menus/tree` | GET    | 获取菜单树   |

## 关键数据结构

### AdminInfo (用户信息)

```typescript
interface AdminInfo {
  avatar: string;
  createdAt: string;
  email: string;
  nickname: string;
  phone: string;
  role: RoleInfo; // 当前激活角色
  roleName: string; // 当前角色名
  roles: RoleInfo[]; // 用户所有角色
  status: number;
  updatedAt: string;
  username: string;
}
```

### RoleInfo (角色信息)

```typescript
interface RoleInfo {
  id: number;
  name: string;
  description: string;
  status: string; // 'enabled' | 'disabled'
  createdAt: string;
  updatedAt: string;
}
```

### SwitchRoleRequest (切换角色请求)

```typescript
interface SwitchRoleRequest {
  roleName: string; // 必填，目标角色名
}
```
