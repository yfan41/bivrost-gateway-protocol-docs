---
title: "2.3. 鉴权方式"
sidebar:
  label: "2.3–2.4. 鉴权"
---


在网关设置中，启用安全控制（默认启用）后，用户必须提供鉴权信息才能使用授权 API。如关闭安全控制，则可跳过用户鉴权，直接使用所有接口；但如果同时启用了 IP 白名单，请求来源 IP 仍必须在白名单内（`/api/auth/login`、`/api/misc/product-details` 及使用 JWT 鉴权的请求除外），详见 [2.3.3. IP 白名单](#ip-white-list)。

![设置页中的安全控制与受保护 API](/img/protocol/auth/security-control.png)

网关支持以下两种鉴权方式：JWT 方式与密钥方式。

## 2.3.1. JWT 方式 {#jwt}

用户使用鉴权接口 `/api/auth/login`，以用户名密码登录后，获取对应用户的 JWT token。Token 的有效期为 24 小时，过期后需再次登录获取新 token。请求时在 Header 里带 `Authorization: Bearer <token>`，可使用该用户权限下的授权 API。如登录用户有管理员权限，可使用除受保护 API 以外的所有接口。

## 2.3.2. 密钥方式 {#secret-key}

在网关的设置-管理用户-用户安全设置界面，生成密钥，密钥永久有效。请求时在 Header 里带 `Authorization: Bearer <密钥>`，可使用该用户权限下的授权 API。如登录用户有管理员权限，可使用除受保护 API 以外的所有接口。

![用户安全设置对话框](/img/protocol/auth/user-security.png)

## 2.3.3. IP 白名单 {#ip-white-list}

IP 白名单是独立于安全控制之外的第二道访问控制。启用 HTTP 服务并开启 IP 白名单后，所有 `/api` 请求的来源 IP 必须在白名单内，否则返回 HTTP 401，errorCode 为 7，errorMsg 为 `IP not in white list.`。

以下请求不受 IP 白名单限制：

- `/api/auth/login` 登录接口；
- `/api/misc/product-details` 产品信息接口；
- 使用 JWT 方式鉴权（`Authorization: Bearer <token>`）的请求。

使用密钥方式鉴权的请求仍需通过 IP 白名单校验。

白名单的开关与地址列表见 [2.9.2. 通讯设置](/http/config-communication/)中的 enableIpWhiteList 与 ipWhiteList 参数。

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
| currentPassword | String | (必需)当前密码 |
| newPassword | String | (必需)新密码 |

用户名取自请求头中的 JWT token（`Authorization: Bearer <token>`），不在请求体中传递。

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
