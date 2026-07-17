---
title: "2.3. 鉴权方式"
sidebar:
  label: "2.3–2.4. 鉴权"
---


在网关设置中，启用安全控制（默认启用）后，用户必须提供鉴权信息才能使用授权 API。如关闭安全控制，则可跳过鉴权，直接使用所有接口。

![设置页中的安全控制与受保护 API](/img/protocol/auth/security-control.png)

网关支持以下两种鉴权方式：JWT 方式与密钥方式。

## 2.3.1. JWT 方式 {#jwt}

用户使用鉴权接口 `/api/auth/login`，以用户名密码登录后，获取对应用户的 JWT token。Token 的有效期为 24 小时，过期后需再次登录获取新 token。请求时在 Header 里带 `Authorization: Bearer <token>`，可使用该用户权限下的授权 API。如登录用户有管理员权限，可使用除受保护 API 以外的所有接口。

## 2.3.2. 密钥方式 {#secret-key}

在网关的设置-管理用户-用户安全设置界面，生成密钥，密钥永久有效。请求时在 Header 里带 `Authorization: Bearer <密钥>`，可使用该用户权限下的授权 API。如登录用户有管理员权限，可使用除受保护 API 以外的所有接口。

![用户安全设置对话框](/img/protocol/auth/user-security.png)

## 2.4. 鉴权接口 {#auth-api}

鉴权接口基地址 **/api/auth/**。

### 2.4.1. login 登录 {#login}

```http
POST /api/auth/login
```

请求体示例 application/json

```json
{
  "username": "username",
  "password": "password"
}
```

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| username | String | (必需)用户名 |
| password | String | (必需)密码 |

返回示例

```json
{
  "token": "a2JhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9eyJ1bmlxdWV.bmFtZSI6ImFkbWluIiwibmFtZWlkIjoiMSA2LCJpYXQiOjE3NTEyNzMyMDYsImlzcyI6IjElMktVQOctMVRPU0pINC0xV1h"
}
```

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| token | String | (必需) 用户令牌。有效时间为 24 小时，过期后需再次登录获取新令牌。 |

### 2.4.2. change-password 修改密码 {#change-password}

此接口仅限 JWT 鉴权方式下使用。

```http
POST /api/auth/change-password
```

请求体示例 application/json

```json
{
  "currentPassword": "currentPassword",
  "newPassword": "newPassword"
}
```

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| username | String | (必需)用户名 |
| password | String | (必需)密码 |

返回示例

```json
{
  "errorCode": 0,
  "errorMsg": "Success"
}
```

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| errorCode | Int32 | (必需)错误代码，0 代表成功。 |
| errorMsg | String | (必需)错误内容 |
