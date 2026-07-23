---
title: "2.3. Authentication Methods"
sidebar:
  label: "2.3–2.4. Authentication"
---


When security control is enabled in the gateway settings (enabled by default), users must provide authentication information to use protected APIs. If security control is turned off, authentication can be skipped and all endpoints can be used directly.

![Security control and protected APIs on the settings page](/img/protocol/auth/security-control.png)

The gateway supports the following two authentication methods: the JWT method and the secret key method.

## 2.3.1. JWT Method {#jwt}

The user logs in with a username and password via the authentication endpoint `/api/auth/login` to obtain a JWT token for that user. The token is valid for 24 hours; once it expires, the user must log in again to obtain a new token. Include `Authorization: Bearer <token>` in the request header to use the protected APIs available to that user's permissions. If the logged-in user has administrator privileges, all endpoints except protected APIs can be used.

## 2.3.2. Secret Key Method {#secret-key}

Generate a secret key on the gateway's Settings > Manage Users > User Security Settings page; the secret key is valid permanently. Include `Authorization: Bearer <secret key>` in the request header to use the protected APIs available to that user's permissions. If the logged-in user has administrator privileges, all endpoints except protected APIs can be used.

![User security settings dialog](/img/protocol/auth/user-security.png)

## 2.4. Authentication Endpoints {#auth-api}

Base address for authentication endpoints: **/api/auth/**.

### 2.4.1. login {#login}

```http
POST /api/auth/login
```

Example request body, application/json

```json
{
  "username": "username",
  "password": "password"
}
```

| Request Parameter | Type | Description |
| --- | --- | --- |
| username | String | (Required) Username |
| password | String | (Required) Password |

Example response

```json
{
  "token": "a2JhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9eyJ1bmlxdWV.bmFtZSI6ImFkbWluIiwibmFtZWlkIjoiMSA2LCJpYXQiOjE3NTEyNzMyMDYsImlzcyI6IjElMktVQOctMVRPU0pINC0xV1h"
}
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| token | String | (Required) User token. Valid for 24 hours; once it expires, log in again to obtain a new token. |

### 2.4.2. change-password {#change-password}

This endpoint is only available under the JWT authentication method.

```http
POST /api/auth/change-password
```

Example request body, application/json

```json
{
  "currentPassword": "currentPassword",
  "newPassword": "newPassword"
}
```

| Request Parameter | Type | Description |
| --- | --- | --- |
| username | String | (Required) Username |
| password | String | (Required) Password |

Example response

```json
{
  "errorCode": 0,
  "errorMsg": "Success"
}
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| errorCode | Int32 | (Required) Error code; 0 indicates success. |
| errorMsg | String | (Required) Error message |
