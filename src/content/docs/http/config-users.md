---
title: "2.9.2. 用户配置接口"
sidebar:
  label: "2.9.2. 用户配置"
---


## 2.9.2.1. user 获取用户设置 {#user}

此接口无请求参数。

```http
GET /api/config/user
```

返回示例

```json
{
  "id": 0,
  "username": "admin",
  "isAdmin": true
}
```

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| id | Int32 | (必需)数据库标识，详见 [1.1.4. ID 数据库标识](/conventions/identifiers/#db-id) |
| username | String | (必需)用户名 |
| isAdmin | Bool | (必需)是否有管理员权限 |

## 2.9.2.2. users 获取所有用户设置 {#users}

此接口无请求参数。

```http
GET /api/config/users
```

返回示例

```json
[
  {
    "id": 0,
    "username": "admin",
    "isAdmin": true
  },
  {
    "id": 1,
    "username": "user1",
    "isAdmin": false
  }
]
```

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| id | Int32 | (必需)数据库标识，详见 [1.1.4. ID 数据库标识](/conventions/identifiers/#db-id) |
| username | String | (必需)用户名 |
| isAdmin | Bool | (必需)是否有管理员权限 |

## 2.9.2.3. create-user 创建新用户 {#create-user}

新用户的初始密码与用户名相同。

```http
POST /api/config/create-user
```

请求体示例 application/json

```json
{
  "username": "user2",
  "isAdmin": false
}
```

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| username | String | (必需)用户名 |
| isAdmin | Bool | 是否有管理员权限，默认为 true。 |

返回示例

```json
{
  "id": 2,
  "username": "user2",
  "isAdmin": false
}
```

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| id | Int32 | (必需)数据库标识，详见 [1.1.4. ID 数据库标识](/conventions/identifiers/#db-id) |
| username | String | (必需)用户名 |
| isAdmin | Bool | (必需)是否有管理员权限 |

## 2.9.2.4. update-user 修改用户设置 {#update-user}

修改用户名时，密码不会被修改。

```http
POST /api/config/update-user
```

请求体示例 application/json

```json
{
  "id": 2,
  "username": "user2",
  "isAdmin": false
}
```

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| id | Int32 | (必需)数据库标识，详见 [1.1.4. ID 数据库标识](/conventions/identifiers/#db-id) |
| username | String | 用户名，默认不修改。 |
| isAdmin | Bool | 是否有管理员权限，默认不修改。 |

返回示例

```json
{
  "id": 2,
  "username": "user2",
  "isAdmin": false
}
```

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| id | Int32 | (必需)数据库标识，详见 [1.1.4. ID 数据库标识](/conventions/identifiers/#db-id) |
| username | String | (必需)用户名 |
| isAdmin | Bool | (必需)是否有管理员权限 |

## 2.9.2.5. delete-user 删除用户 {#delete-user}

```http
GET /api/config/delete-user
```

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| id | Int32 | (必需)数据库标识，详见 [1.1.4. ID 数据库标识](/conventions/identifiers/#db-id) |

返回示例

```json
{
  "errorCode": 0,
  "errorMsg": "Success"
}
```

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| errorCode | Int32 | (必需)错误码，0 代表成功。 |
| errorMsg | String | (必需)错误内容 |

## 2.9.2.6. user-security 获取用户安全设置 {#user-security}

```http
GET /api/config/user-security
```

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| id | Int32 | (必需)数据库标识，详见 [1.1.4. ID 数据库标识](/conventions/identifiers/#db-id) |

返回示例

```json
{
  "id": 2,
  "secretKey": "sk-XXXXXXXXXX",
  "authorizedApis": "prefix,/cnc;prefix,/db;prefix,/analysis;prefix,/group-analysis;prefix,/config;prefix,/core;prefix,/gateway;prefix,/auth;"
}
```

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| id | Int32 | (必需)数据库标识，详见 [1.1.4. ID 数据库标识](/conventions/identifiers/#db-id) |
| secretKey | String | 密钥，以 "sk-" 前缀开头。未返回代表未设置。 |
| authorizedApis | String | 授权 API，即用户可以使用的 API，未返回代表未设置。API 命令格式参考 [API 命令格式](/http/config-global/#api-command-format)。 |

## 2.9.2.7. update-user-security 修改用户安全设置 {#update-user-security}

```http
POST /api/config/update-user-security
```

请求体示例 application/json

```json
{
  "id": 2,
  "secretKey": "Token",
  "authorizedApis": "prefix,/cnc;prefix,/db;prefix,/analysis;prefix,/group-analysis;prefix,/config;prefix,/core;prefix,/gateway;prefix,/auth;"
}
```

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| id | Int32 | (必需)数据库标识，详见 [1.1.4. ID 数据库标识](/conventions/identifiers/#db-id) |
| secretKey | String | 密钥，以 "sk-" 前缀开头。 |
| authorizedApis | String | 授权 API，即用户可以使用的 API，未返回代表未设置。API 命令格式参考 [API 命令格式](/http/config-global/#api-command-format)。 |

返回示例

```json
{
  "id": 2,
  "secretKey": "Token",
  "authorizedApis": "prefix,/cnc;prefix,/db;prefix,/analysis;prefix,/group-analysis;prefix,/config;prefix,/core;prefix,/gateway;prefix,/auth;"
}
```

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| id | Int32 | (必需)数据库标识，详见 [1.1.4. ID 数据库标识](/conventions/identifiers/#db-id) |
| secretKey | String | 密钥，以 "sk-" 前缀开头。未返回代表未设置。 |
| authorizedApis | String | 授权 API，即用户可以使用的 API，未返回代表未设置。API 命令格式参考 [API 命令格式](/http/config-global/#api-command-format)。 |
