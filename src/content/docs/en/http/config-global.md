---
title: "2.9. Gateway Configuration Interface"
sidebar:
  label: "2.9.1. Global Configuration"
---


The gateway function interface is used to command the gateway to perform specific functions, with base address `/api/config`.

## 2.9.1. Global Configuration Interface {#global-config}

### 2.9.1.1. gateway-info Get Gateway Information {#gateway-info}

This interface has no request parameters.

```http
GET /api/config/gateway-info
```

Response example

```json
{
  "hid": "XXXXXX-XXXXXX-XXXXXX-XXXXXX",
  "uid": "XXXXXX-XXXXXX-XXXXXX-XXXXXX",
  "alias": "iotgw"
}
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| hid | String | (Required) Gateway hardware ID |
| uid | String | (Required) Gateway UID |
| alias | String | (Required) Gateway name |

### 2.9.1.2. settings Get Gateway Global Settings {#settings}

This interface has no request parameters.

```http
GET /api/config/settings
```

Response example

```json
{
  "version": "1.19.3.102",
  "enableLocalCaching": true,
  "enableRemoteService": true,
  "enableLan2Setup": false,
  "timeServerAddress": "ntp1.aliyun.com;ntp2.aliyun.com;ntp3.aliyun.com;ntp4.aliyun.com;"
}
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| version | String | (Required) Settings version |
| enableLocalCaching | Bool | (Required) Enable local caching |
| enableRemoteService | Bool | (Required) Enable remote assistance |
| enableLan2Setup | Bool | (Required) Enable LAN2 setup |
| timeServerAddress | String | (Required) Time server address |

### 2.9.1.3. update-settings Update Gateway Global Settings {#update-settings}

```http
POST /api/config/update-settings
```

Request body example application/json

```json
{
  "enableLocalCaching": true,
  "enableRemoteService": true,
  "enableLan2Setup": false,
  "timeServerAddress": "ntp1.aliyun.com;ntp2.aliyun.com;ntp3.aliyun.com;ntp4.aliyun.com;"
}
```

| Request Parameter | Type | Description |
| --- | --- | --- |
| enableLocalCaching | Bool | Enable local caching |
| enableRemoteService | Bool | Enable remote assistance |
| enableLan2Setup | Bool | Enable LAN2 setup |
| timeServerAddress | String | Time server address |

Response example

```json
{
  "version": "1.19.3.102",
  "enableLocalCaching": true,
  "enableRemoteService": true,
  "enableLan2Setup": false,
  "timeServerAddress": "ntp1.aliyun.com;ntp2.aliyun.com;ntp3.aliyun.com;ntp4.aliyun.com;"
}
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| version | String | (Required) Settings version |
| enableLocalCaching | Bool | (Required) Enable local caching |
| enableRemoteService | Bool | (Required) Enable remote assistance |
| enableLan2Setup | Bool | (Required) Enable LAN2 setup |
| timeServerAddress | String | (Required) Time server address |

### 2.9.1.4. security Get Gateway Global Security Settings {#security}

This interface has no request parameters.

```http
GET /api/config/security
```

Response example

```json
{
  "enable": true,
  "protectedApi": "exact,/cnc/writeOffsetData;exact,/cnc/writePlcData"
}
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| enable | Bool | (Required) Enable global security control |
| protectedApi | String | Protected APIs, i.e. APIs forbidden to all users. Not returned means not set. For the API command format, see [API Command Format](#api-command-format). |

#### API Command Format {#api-command-format}

| API Command Type | exact | prefix |
| --- | --- | --- |
| Description | Specifies a single, exact API address | Specifies all API addresses sharing the given prefix |
| Example | exact,/cnc/writePlcData | prefix,/db |

The API address starts right after `/api`. `prefix,/` represents all API addresses.

Multiple API address commands are separated by `;`.

### 2.9.1.5. update-security Update Global Security Settings {#update-security}

```http
POST /api/config/update-security
```

Request body example application/json

```json
{
  "enable": true,
  "protectedApi": "exact,/cnc/writeOffsetData;exact,/cnc/writePlcData"
}
```

| Request Parameter | Type | Description |
| --- | --- | --- |
| enable | Bool | (Required) Enable global security control |
| protectedApi | String | Protected APIs, i.e. APIs forbidden to all users. For the API command format, see [API Command Format](#api-command-format). |

Response example

```json
{
  "enable": true,
  "protectedApi": "exact,/cnc/writeOffsetData;exact,/cnc/writePlcData"
}
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| enable | Bool | (Required) Enable global security control |
| protectedApi | String | Protected APIs, i.e. APIs forbidden to all users. Not returned means not set. For the API command format, see [API Command Format](#api-command-format). |
