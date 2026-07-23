---
title: "2.9.2. User Configuration API"
sidebar:
  label: "2.9.2. User Configuration"
---


## 2.9.2.1. user — Get user settings {#user}

This API has no request parameters.

```http
GET /api/config/user
```

Response example

```json
{
  "id": 0,
  "username": "admin",
  "isAdmin": true
}
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| id | Int32 | (Required) Database identifier, see [1.1.4. ID Database Identifier](/en/conventions/identifiers/#db-id) |
| username | String | (Required) Username |
| isAdmin | Bool | (Required) Whether the user has administrator privileges |

## 2.9.2.2. users — Get all user settings {#users}

This API has no request parameters.

```http
GET /api/config/users
```

Response example

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

| Response Parameter | Type | Description |
| --- | --- | --- |
| id | Int32 | (Required) Database identifier, see [1.1.4. ID Database Identifier](/en/conventions/identifiers/#db-id) |
| username | String | (Required) Username |
| isAdmin | Bool | (Required) Whether the user has administrator privileges |

## 2.9.2.3. create-user — Create a new user {#create-user}

The new user's initial password is the same as the username.

```http
POST /api/config/create-user
```

Request body example application/json

```json
{
  "username": "user2",
  "isAdmin": false
}
```

| Request Parameter | Type | Description |
| --- | --- | --- |
| username | String | (Required) Username |
| isAdmin | Bool | Whether the user has administrator privileges. Defaults to true. |

Response example

```json
{
  "id": 2,
  "username": "user2",
  "isAdmin": false
}
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| id | Int32 | (Required) Database identifier, see [1.1.4. ID Database Identifier](/en/conventions/identifiers/#db-id) |
| username | String | (Required) Username |
| isAdmin | Bool | (Required) Whether the user has administrator privileges |

## 2.9.2.4. update-user — Update user settings {#update-user}

Changing the username does not change the password.

```http
POST /api/config/update-user
```

Request body example application/json

```json
{
  "id": 2,
  "username": "user2",
  "isAdmin": false
}
```

| Request Parameter | Type | Description |
| --- | --- | --- |
| id | Int32 | (Required) Database identifier, see [1.1.4. ID Database Identifier](/en/conventions/identifiers/#db-id) |
| username | String | Username. Not changed by default. |
| isAdmin | Bool | Whether the user has administrator privileges. Not changed by default. |

Response example

```json
{
  "id": 2,
  "username": "user2",
  "isAdmin": false
}
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| id | Int32 | (Required) Database identifier, see [1.1.4. ID Database Identifier](/en/conventions/identifiers/#db-id) |
| username | String | (Required) Username |
| isAdmin | Bool | (Required) Whether the user has administrator privileges |

## 2.9.2.5. delete-user — Delete a user {#delete-user}

```http
GET /api/config/delete-user
```

| Request Parameter | Type | Description |
| --- | --- | --- |
| id | Int32 | (Required) Database identifier, see [1.1.4. ID Database Identifier](/en/conventions/identifiers/#db-id) |

Response example

```json
{
  "errorCode": 0,
  "errorMsg": "Success"
}
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| errorCode | Int32 | (Required) Error code. 0 indicates success. |
| errorMsg | String | (Required) Error message |

## 2.9.2.6. user-security — Get user security settings {#user-security}

```http
GET /api/config/user-security
```

| Request Parameter | Type | Description |
| --- | --- | --- |
| id | Int32 | (Required) Database identifier, see [1.1.4. ID Database Identifier](/en/conventions/identifiers/#db-id) |

Response example

```json
{
  "id": 2,
  "secretKey": "sk-XXXXXXXXXX",
  "authorizedApis": "prefix,/cnc;prefix,/db;prefix,/analysis;prefix,/group-analysis;prefix,/config;prefix,/core;prefix,/gateway;prefix,/auth;"
}
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| id | Int32 | (Required) Database identifier, see [1.1.4. ID Database Identifier](/en/conventions/identifiers/#db-id) |
| secretKey | String | The secret key, prefixed with "sk-". Not returned if not set. |
| authorizedApis | String | Authorized APIs, i.e. the APIs the user is allowed to use. Not returned if not set. For the API command format, see [API Command Format](/en/http/config-global/#api-command-format). |

## 2.9.2.7. update-user-security — Update user security settings {#update-user-security}

```http
POST /api/config/update-user-security
```

Request body example application/json

```json
{
  "id": 2,
  "secretKey": "Token",
  "authorizedApis": "prefix,/cnc;prefix,/db;prefix,/analysis;prefix,/group-analysis;prefix,/config;prefix,/core;prefix,/gateway;prefix,/auth;"
}
```

| Request Parameter | Type | Description |
| --- | --- | --- |
| id | Int32 | (Required) Database identifier, see [1.1.4. ID Database Identifier](/en/conventions/identifiers/#db-id) |
| secretKey | String | The secret key, prefixed with "sk-". |
| authorizedApis | String | Authorized APIs, i.e. the APIs the user is allowed to use. Not returned if not set. For the API command format, see [API Command Format](/en/http/config-global/#api-command-format). |

Response example

```json
{
  "id": 2,
  "secretKey": "Token",
  "authorizedApis": "prefix,/cnc;prefix,/db;prefix,/analysis;prefix,/group-analysis;prefix,/config;prefix,/core;prefix,/gateway;prefix,/auth;"
}
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| id | Int32 | (Required) Database identifier, see [1.1.4. ID Database Identifier](/en/conventions/identifiers/#db-id) |
| secretKey | String | The secret key, prefixed with "sk-". Not returned if not set. |
| authorizedApis | String | Authorized APIs, i.e. the APIs the user is allowed to use. Not returned if not set. For the API command format, see [API Command Format](/en/http/config-global/#api-command-format). |
