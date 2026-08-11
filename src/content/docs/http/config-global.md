---
title: "2.9. 网关配置接口"
sidebar:
  label: "2.9.1. 全局配置"
---


网关功能接口用于命令网关执行特定功能，基地址 `/api/config`。

## 2.9.1. 全局配置接口 {#global-config}

### 2.9.1.1. gateway-info 获取网关信息 {#gateway-info}

此接口无请求参数。

```http
GET /api/config/gateway-info
```

返回示例

```json
{
  "hid": "XXXXXX-XXXXXX-XXXXXX-XXXXXX",
  "uid": "XXXXXX-XXXXXX-XXXXXX-XXXXXX",
  "alias": "iotgw"
}
```

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| hid | String | (必需)网关硬件 ID |
| uid | String | (必需)网关 UID |
| alias | String | (必需)网关名称 |

### 2.9.1.2. settings 获取网关全局设置 {#settings}

此接口无请求参数。

```http
GET /api/config/settings
```

返回示例

```json
{
  "version": "1.19.3.102",
  "enableLocalCaching": true,
  "enableRemoteService": true,
  "enableLan2Setup": false,
  "timeServerAddress": "ntp1.aliyun.com;ntp2.aliyun.com;ntp3.aliyun.com;ntp4.aliyun.com;"
}
```

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| version | String | (必需)设置版本 |
| enableLocalCaching | Bool | (必需)启用本地缓存 |
| enableRemoteService | Bool | (必需)启用远程协助 |
| enableLan2Setup | Bool | (必需)启用 LAN2 设置 |
| timeServerAddress | String | (必需)时间服务器地址 |

### 2.9.1.3. update-settings 修改网关全局设置 {#update-settings}

```http
POST /api/config/update-settings
```

请求体示例 application/json

```json
{
  "enableLocalCaching": true,
  "enableRemoteService": true,
  "enableLan2Setup": false,
  "timeServerAddress": "ntp1.aliyun.com;ntp2.aliyun.com;ntp3.aliyun.com;ntp4.aliyun.com;"
}
```

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| enableLocalCaching | Bool | 启用本地缓存 |
| enableRemoteService | Bool | 启用远程协助 |
| enableLan2Setup | Bool | 启用 LAN2 设置 |
| timeServerAddress | String | 时间服务器地址 |

返回示例

```json
{
  "version": "1.19.3.102",
  "enableLocalCaching": true,
  "enableRemoteService": true,
  "enableLan2Setup": false,
  "timeServerAddress": "ntp1.aliyun.com;ntp2.aliyun.com;ntp3.aliyun.com;ntp4.aliyun.com;"
}
```

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| version | String | (必需)设置版本 |
| enableLocalCaching | Bool | (必需)启用本地缓存 |
| enableRemoteService | Bool | (必需)启用远程协助 |
| enableLan2Setup | Bool | (必需)启用 LAN2 设置 |
| timeServerAddress | String | (必需)时间服务器地址 |

### 2.9.1.4. security 获取网关全局安全设置 {#security}

此接口无请求参数。

```http
GET /api/config/security
```

返回示例

```json
{
  "enable": true,
  "protectedApi": "exact,/cnc/writeOffsetData;exact,/cnc/writePlcData"
}
```

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| enable | Bool | (必需)启用全局安全控制 |
| protectedApi | String | 受保护 API，即禁止任何用户使用的 API。未返回代表未设置。API 命令格式参考 [API 命令格式](#api-command-format)。 |

#### API 命令格式 {#api-command-format}

| API 命令类型 | exact | prefix |
| --- | --- | --- |
| 说明 | 指定具体一个 API 地址 | 指定有相同前缀的所有 API 地址 |
| 示例 | exact,/cnc/writePlcData | prefix,/db |

API 地址从 `/api` 后开始。`prefix,/` 代表所有的 API 地址。

多条 API 地址命令以 `;` 分隔。

### 2.9.1.5. update-security 修改全局安全设置 {#update-security}

```http
POST /api/config/update-security
```

请求体示例 application/json

```json
{
  "enable": true,
  "protectedApi": "exact,/cnc/writeOffsetData;exact,/cnc/writePlcData"
}
```

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| enable | Bool | (必需)启用全局安全控制 |
| protectedApi | String | 受保护 API，即禁止任何用户使用的 API。API 命令格式参考 [API 命令格式](#api-command-format)。 |

返回示例

```json
{
  "enable": true,
  "protectedApi": "exact,/cnc/writeOffsetData;exact,/cnc/writePlcData"
}
```

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| enable | Bool | (必需)启用全局安全控制 |
| protectedApi | String | 受保护 API，即禁止任何用户使用的 API。未返回代表未设置。API 命令格式参考 [API 命令格式](#api-command-format)。 |

### 2.9.1.6. backup 备份网关配置 {#backup}

导出当前网关配置文件。返回的字符串即 [2.9.1.7. restore 恢复网关配置](#restore) 接口的输入。

此接口无请求参数。

```http
GET /api/config/backup
```

返回示例

```json
{
  "base64": "XXXXXXXXXXXXXXXXXXXX"
}
```

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| base64 | String | (必需)加密后的网关配置文件内容，Base64 编码。 |

读取配置文件失败时返回 GENERAL_CANNOT_ACCESS_CONFIG。

### 2.9.1.7. restore 恢复网关配置 {#restore}

```http
POST /api/config/restore
```

请求体示例 application/json

```json
{
  "base64": "XXXXXXXXXXXXXXXXXXXX"
}
```

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| base64 | String | (必需)备份的网关配置文件内容，即 [2.9.1.6. backup 备份网关配置](#backup) 接口返回的内容。 |

成功时返回空内容。

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

:::note[注]
恢复成功后网关会自动重启以应用新配置。
:::

内容为空或无法解密时返回 GENERAL_API_INVALID_REQUEST，配置文件不可访问时返回 GENERAL_CANNOT_ACCESS_CONFIG。

### 2.9.1.8. reset 重置网关配置 {#reset}

此接口无请求参数。

```http
GET /api/config/reset
```

成功时返回空内容。

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

:::note[注]
此接口会清空所有网关配置（机台、分组、用户、通讯等）并恢复出厂默认设置（仅保留默认账号），操作不可撤销，建议先调用 [2.9.1.6. backup 备份网关配置](#backup) 接口备份配置。
:::
