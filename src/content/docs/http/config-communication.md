---
title: "2.9.6. 通讯配置接口"
sidebar:
  label: "2.9.6. 通讯配置"
---


通讯配置接口用于获取或修改任务配置。通讯配置相关说明可以参考《说明书》[5.6. 通讯配置](https://gateway.docs.bivrost.cn/usage/communication)。

## 2.9.6.1. cloud-settings 获取云平台设置 {#cloud-settings}

此接口无请求参数。

```http
GET /api/config/cloud-settings
```

返回示例

```json
{
  "enable": false,
  "serverAddress": "severAddress",
  "token": "tokenABCDEFG",
  "enableBroadcasting": false,
  "enableGatewayLinking": false,
  "gatewayLinks": "uid1,token1;uid2,token2;"
}
```

返回参数如下表：

#### 云平台设置参数 {#cloud-settings-params}

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| enable | Bool | 启用云平台，true=开启，false=关闭。 |
| serverAddress | String | 服务器地址。不返回代表未设置。 |
| token | String | 网关令牌。不返回代表未设置。 |
| enableBroadcasting | Bool | 启用广播，true=开启，false=关闭。启用后通过云平台广播数据。 |
| enableGatewayLinking | Bool | 启用网关关联，true=开启，false=关闭。启用后接收云平台下指定关联网关广播的数据。 |
| gatewayLinks | String | 关联的网关。不返回代表未设置。 |

## 2.9.6.2. update-cloud-settings 修改云平台设置 {#update-cloud-settings}

修改云平台设置并返回修改后的设置。

```http
POST /api/config/update-cloud-settings
```

请求体示例

```json
{
  "enable": true,
  "serverAddress": "severAddress",
  "token": "tokenABCDEFG",
  "enableBroadcasting": true,
  "enableGatewayLinking": true,
  "gatewayLinks": "uid1,token1;uid2,token2;"
}
```

请求参数见[云平台设置参数](#cloud-settings-params)。

返回示例

```json
{
  "enable": true,
  "serverAddress": "severAddress",
  "token": "tokenABCDEFG",
  "enableBroadcasting": true,
  "enableGatewayLinking": true,
  "gatewayLinks": "uid1,token1;uid2,token2;"
}
```

返回参数见[云平台设置参数](#cloud-settings-params)。

## 2.9.6.3. modbus-settings 获取 MODBUS 设置 {#modbus-settings}

此接口无请求参数。

```http
GET /api/config/modbus-settings
```

返回示例

```json
{
  "enable": false,
  "byte4Order": "DCBA",
  "byte8Order": "HGFEDCBA",
  "encoding": "GBK",
  "reverseString": false
}
```

返回参数如下表：

#### MODBUS 设置参数 {#modbus-settings-params}

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| enable | Bool | 启用 MODBUS，true=开启，false=关闭。 |
| byte4Order | String | 32 位型格式，支持：ABCD，BADC，CDAB，DCBA 等格式。 |
| byte8Order | String | 64 位型格式，支持：ABCDEFGH，BADCFEHG，GHEFCDAB，HGFEDCBA 等格式。 |
| encoding | String | 编码，如 ASCII，UTF-8，GBK 等。 |
| reverseString | Bool | 反转字符串，true=开启，false=关闭。 |

## 2.9.6.4. update-modbus-settings 修改 MODBUS 设置 {#update-modbus-settings}

修改 MODBUS 设置并返回修改后的设置。

```http
POST /api/config/update-modbus-settings
```

请求体示例

```json
{
  "enable": true,
  "byte4Order": "ABCD",
  "byte8Order": "ABCDEFGH",
  "encoding": "UTF-8",
  "reverseString": true
}
```

请求参数见 [MODBUS 设置参数](#modbus-settings-params)。

返回示例

```json
{
  "enable": true,
  "byte4Order": "ABCD",
  "byte8Order": "ABCDEFGH",
  "encoding": "UTF-8",
  "reverseString": true
}
```

返回参数见 [MODBUS 设置参数](#modbus-settings-params)。

## 2.9.6.5. mqtt-settings 获取 MQTT 设置 {#mqtt-settings}

此接口无请求参数。

```http
GET /api/config/mqtt-settings
```

返回示例

```json
{
  "enable": false,
  "mode": "Default",
  "brokerAddress": "brokerAddress",
  "port": 1111,
  "clientID": "client",
  "username": "username",
  "password": "password",
  "dataReportTopic": "topic1",
  "rpcRequestTopic": "rpcReq",
  "rcResponseTopic": "rpcRes",
  "encoding": "GBK",
  "allowAnomynous": false,
  "arrayToString": false,
  "publishOnValueChange": false,
  "publishAllOnValueChange": false,
  "timeoutReportingInterval": 0
}
```

返回参数如下表：

#### MQTT 设置参数 {#mqtt-settings-params}

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| enable | Bool | 启用 MQTT，true=开启，false=关闭。 |
| mode | String | 模式，详见 [MQTT mode 模式](#mqtt-mode) |
| brokerAddress | String | 服务器地址 |
| port | Int32 | 服务器端口 |
| clientID | String | 客户端 ID |
| username | String | 用户名 |
| password | String | 密码 |
| dataReportTopic | String | 数据上报主题 |
| rpcRequestTopic | String | RPC 请求主题 |
| rpcResponseTopic | String | RPC 回复主题 |
| encoding | String | 编码，如 ASCII，UTF-8，GBK 等。 |
| allowAnomynous | Bool | 匿名登录，true=开启，false=关闭。 |
| arrayToString | Bool | 数组转字符串，true=开启，false=关闭。 |
| publishOnValueChange | Bool | 变化值写入，true=开启，false=关闭。默认为 false。 |
| publishAllOnValueChange | Bool | 变化时上传全部内容，true=开启，false=关闭。启用变化值上传时有效，默认为 false，即值变化时，仅上传变化的部分。 |
| timeoutReportingInterval | Int32 | 超时上报间隔。启用变化值上传时有效。如果上次上传时间到现在超过此时间，则不管值是否变化都上传一次。单位：秒。默认为 0，即关闭超时上报。 |

#### MQTT mode 模式 {#mqtt-mode}

| 选项 |
| --- |
| Default |
| TB2 |
| Brm |
| IoTDA |
| WisIoT |
| MKT |
| TB |

## 2.9.6.6. update-mqtt-settings 修改 MQTT 设置 {#update-mqtt-settings}

修改 MQTT 设置并返回修改后的设置。

```http
POST /api/config/update-mqtt-settings
```

请求体示例

```json
{
  "enable": true,
  "mode": "IoTDA",
  "brokerAddress": "brokerAddress2",
  "port": 2222,
  "clientID": "client2",
  "username": "username2",
  "password": "password2",
  "dataReportTopic": "topic2",
  "rpcRequestTopic": "rpcReq",
  "rpcResponseTopic": "rpcRes",
  "encoding": "UTF-8",
  "allowAnomynous": true,
  "arrayToString": true,
  "publishOnValueChange": true,
  "publishAllOnValueChange": false,
  "timeoutReportingInterval": 0
}
```

请求参数见 [MQTT 设置参数](#mqtt-settings-params)。

返回示例

```json
{
  "enable": true,
  "mode": "IoTDA",
  "brokerAddress": "brokerAddress2",
  "port": 2222,
  "clientID": "client2",
  "username": "username2",
  "password": "password2",
  "dataReportTopic": "topic2",
  "rpcRequestTopic": "rpcReq",
  "rpcResponseTopic": "rpcRes",
  "encoding": "UTF-8",
  "allowAnomynous": true,
  "arrayToString": true,
  "publishOnValueChange": true,
  "publishAllOnValueChange": false,
  "timeoutReportingInterval": 0
}
```

返回参数见 [MQTT 设置参数](#mqtt-settings-params)。

## 2.9.6.7. database-settings 获取数据库设置 {#database-settings}

此接口无请求参数。

```http
GET /api/config/database-settings
```

返回示例

InfluxDB v2.x 类型数据库返回如下：

```json
{
  "enable": true,
  "type": "InfluxDB v2.x",
  "serverAddress": "192.168.100.101",
  "port": "12345",
  "username": "username",
  "password": "password",
  "bucket": "Bucket",
  "tablePrefix": "Prefix",
  "organization": "Organization",
  "writeOnValueChange": true,
  "timeoutReportingInterval": 0
}
```

非 InfluxDB v2.x 类型数据库返回如下：

```json
{
  "enable": true,
  "type": "MySQL",
  "serverAddress": "192.168.100.101",
  "port": "12345",
  "username": "username",
  "password": "password",
  "database": "Database",
  "tablePrefix": "Prefix",
  "storageMode": "User Defined",
  "useLocalTime": false,
  "enablePrimaryKey": false,
  "writeOnValueChange": false,
  "timeoutReportingInterval": 0,
  "loggingModeTypes": [
    "AlarmHistory",
    "AxialOverload",
    "CNCStatus",
    "Count",
    "CurrentToolNumber",
    "Cycle",
    "EnergyConsum",
    "Feed",
    "FeedAndSpindle",
    "GroupCount",
    "GroupCumulativeTime",
    "LaserPower",
    "Load",
    "LogHistory",
    "Offset",
    "PLC",
    "Position",
    "ProgramBlock",
    "ProgramInfo",
    "SpindleOverload",
    "TimeData",
    "ToolLife"
  ],
  "realTimeModeTypes": [
    "AlarmLog",
    "GroupOEE",
    "OEE"
  ]
}
```

返回参数如下表：

#### 数据库设置参数 {#database-settings-params}

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| enable | Bool | 启用数据库，true=开启，false=关闭。 |
| type | String | 类型，详见[数据库类型](#database-types) |
| serverAddress | String | 服务器地址 |
| port | String | 服务器端口 |
| username | String | 用户名 |
| password | String | 密码 |
| bucket | String | 数据库，限 InfluxDB v2.x 类型 |
| organization | String | 机构名，限 InfluxDB v2.x 类型 |
| database | String | 数据库，限非 InfluxDB v2.x 类型 |
| storageMode | String | 保存模式，限非 InfluxDB v2.x 类型，详见[数据库保存模式](#database-save-modes) |
| dataRetentionPeriod | Int32 | 数据保留期限（小时），限非 InfluxDB v2.x 数据库类型。 |
| loggingModeTypes | String[] | 保存模式为 User Defined 时有效，详见 [1.2. 数据说明](/conventions/data-classes/)中的 `<type>` 数据类。 |
| noActionModeTypes | String[] | 保存模式为 User Defined 时有效，详见 [1.2. 数据说明](/conventions/data-classes/)中的 `<type>` 数据类。 |
| realTimeModeTypes | String[] | 保存模式为 User Defined 时有效，详见 [1.2. 数据说明](/conventions/data-classes/)中的 `<type>` 数据类。 |
| useLocalTime | Bool | 使用本地时间，限非 InfluxDB v2.x 类型 |
| enablePrimaryKey | Bool | 启用主键，限非 InfluxDB v2.x 类型 |
| tablePrefix | String | 表前缀 |
| writeOnValueChange | Bool | 变化值写入，true=开启，false=关闭。 |
| timeoutReportingInterval | Int32 | 超时上报间隔。启用变化值写入时有效。如果上次写入时间到现在超过此时间，则不管值是否变化都上传一次。单位：秒。默认为 0，即关闭超时写入。 |

#### 数据库类型 {#database-types}

| 选项 |
| --- |
| InfluxDB v2.x |
| MySQL |
| SQL Server |
| Postgre SQL |

#### 数据库保存模式 {#database-save-modes}

| 选项 | 说明 |
| --- | --- |
| Logging | 日志 |
| Real Time | 实时 |
| User Defined | 自定义 |

## 2.9.6.8. update-database-settings 修改数据库设置 {#update-database-settings}

修改数据库设置并返回修改后的设置。

```http
POST /api/config/update-database-settings
```

请求体示例

```json
{
  "enable": true,
  "type": "SQL Server",
  "serverAddress": "192.168.100.201",
  "port": "23456",
  "username": "username2",
  "password": "password2",
  "database": "Database2",
  "tablePrefix": "Prefix2",
  "storageMode": "Real Time",
  "useLocalTime": true,
  "enablePrimaryKey": true,
  "writeOnValueChange": true,
  "timeoutReportingInterval": 60
}
```

请求参数见[数据库设置参数](#database-settings-params)。

返回示例

```json
{
  "enable": true,
  "type": "SQL Server",
  "serverAddress": "192.168.100.201",
  "port": "23456",
  "username": "username2",
  "password": "password2",
  "database": "Database2",
  "tablePrefix": "Prefix2",
  "storageMode": "Real Time",
  "useLocalTime": true,
  "enablePrimaryKey": true,
  "writeOnValueChange": true,
  "timeoutReportingInterval": 60,
  "loggingModeTypes": [
    "AlarmHistory",
    "AxialOverload",
    "CNCStatus",
    "Count",
    "CurrentToolNumber",
    "Cycle",
    "EnergyConsum",
    "Feed",
    "FeedAndSpindle",
    "GroupCount",
    "GroupCumulativeTime",
    "LaserPower",
    "Load",
    "LogHistory",
    "Offset",
    "PLC",
    "Position",
    "ProgramBlock",
    "ProgramInfo",
    "SpindleOverload",
    "TimeData",
    "ToolLife"
  ],
  "realTimeModeTypes": [
    "AlarmLog",
    "GroupOEE",
    "OEE"
  ]
}
```

返回参数见[数据库设置参数](#database-settings-params)。

## 2.9.6.9. gateway-file-server-settings 获取网关文件服务器设置 {#gateway-file-server-settings}

此接口无请求参数。

```http
GET /api/config/gateway-file-server-settings
```

返回示例

```json
{
  "enable": false,
  "enableFtp": false,
  "enableSmb": false,
  "username": "dncuser",
  "password": "dncuser"
}
```

返回参数如下表：

#### 网关文件服务器设置参数 {#gateway-file-server-settings-params}

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| enable | Bool | 启用网关文件服务器，true=开启，false=关闭。 |
| enableFtp | String | 启用 FTP，true=开启，false=关闭。 |
| enableSmb | String | 启用共享文件夹，true=开启，false=关闭。 |
| username | String | 用户名，只读，不可修改。 |
| password | String | 密码 |

## 2.9.6.10. update-gateway-file-server-settings 修改网关文件服务器设置 {#update-gateway-file-server-settings}

修改网关文件服务器设置并返回修改后的设置。

```http
POST /api/config/update-gateway-file-server-settings
```

请求体示例

```json
{
  "enable": true,
  "enableFtp": true,
  "enableSmb": true,
  "username": "dncuser",
  "password": "password"
}
```

请求参数见[网关文件服务器设置参数](#gateway-file-server-settings-params)。

返回示例

```json
{
  "enable": true,
  "enableFtp": true,
  "enableSmb": true,
  "username": "dncuser",
  "password": "password"
}
```

返回参数见[网关文件服务器设置参数](#gateway-file-server-settings-params)。

## 2.9.6.11. http-settings 获取 HTTP 设置 {#http-settings}

此接口无请求参数。

```http
GET /api/config/http-settings
```

返回示例

```json
{
  "enable": true,
  "enableIpWhiteList": true,
  "ipWhiteList": "192.168.100.200;192.168.100.201;"
}
```

返回参数如下表：

#### HTTP 设置参数 {#http-settings-params}

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| Enable | Bool | 启用 HTTP，true=开启，false=关闭。 |
| enableIpWhiteList | Bool | 启用 IP 白名单，true=开启，false=关闭。 |
| ipWhiteList | String | 白名单列表（以 ; 分隔）。未返回代表未设置。 |

## 2.9.6.12. update-http-settings 修改 HTTP 设置 {#update-http-settings}

修改 HTTP 设置并返回修改后的设置。

```http
POST /api/config/update-http-settings
```

请求体示例

```json
{
  "enable": true,
  "enableIpWhiteList": true,
  "ipWhiteList": "192.168.100.200;192.168.100.201;"
}
```

请求参数见 [HTTP 设置参数](#http-settings-params)。

返回示例

```json
{
  "enable": true,
  "enableIpWhiteList": true,
  "ipWhiteList": "192.168.100.200;192.168.100.201;"
}
```

返回参数见 [HTTP 设置参数](#http-settings-params)。

## 2.9.6.13. hub-settings 获取 Hub 设置 {#hub-settings}

此接口无请求参数。

```http
GET /api/config/hub-settings
```

返回示例

```json
{
  "enable": false,
  "server": "serverAddress",
  "accessToken": "accessToken",
  "enableBroadcasting": false,
  "enableGatewayLinking": false,
  "gatewayLinks": "uid1,token1;uid2,token2;"
}
```

返回参数如下表：

#### Hub 设置参数 {#hub-settings-params}

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| enable | Bool | 启用 Hub，true=开启，false=关闭。 |
| server | String | 服务器地址。不返回代表未设置。 |
| accessToken | String | 网关令牌。不返回代表未设置。 |
| enableBroadcasting | Bool | 启用广播，true=开启，false=关闭。启用后通过 Hub 广播数据。 |
| enableGatewayLinking | Bool | 启用网关关联，true=开启，false=关闭。启用后接收 Hub 下指定关联网关广播的数据。 |
| gatewayLinks | String | 关联的网关。不返回代表未设置。 |

## 2.9.6.14. update-hub-settings 修改 Hub 设置 {#update-hub-settings}

修改 Hub 设置并返回修改后的设置。

```http
POST /api/config/update-hub-settings
```

请求体示例

```json
{
  "enable": true,
  "server": "serverAddress",
  "accessToken": "accessToken",
  "enableBroadcasting": true,
  "enableGatewayLinking": false,
  "gatewayLinks": "uid1,token1;uid2,token2;"
}
```

请求参数见 [Hub 设置参数](#hub-settings-params)。

返回示例

```json
{
  "enable": true,
  "server": "serverAddress",
  "accessToken": "accessToken",
  "enableBroadcasting": true,
  "enableGatewayLinking": false,
  "gatewayLinks": "uid1,token1;uid2,token2;"
}
```

返回参数见 [Hub 设置参数](#hub-settings-params)。

## 2.9.6.15. remote-access 获取远程访问设置 {#remote-access}

此接口无请求参数。

```http
GET /api/config/remote-access
```

返回示例

```json
{
  "host": "serverUrl",
  "hub": "XXXXXX-XXXXXX-XXXXXX-XXXXXX",
  "password": "password",
  "bridgeNetwork": "LAN1",
  "state": "Established",
  "expiration": "2999-12-31T23:59:59"
}
```

返回参数如下表：

#### 远程访问设置参数 {#remote-access-params}

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| host | String | 远程服务器地址。 |
| hub | String | 站点（只读），默认为网关 UID。 |
| password | String | 密码。 |
| bridgeNetwork | String | 桥接网络："LAN1"，"LAN2"，""（无桥接）。 |
| state | String | 连接状态（只读）：Connecting，Negotiation，Retry（以上三种状态均为连接中状态），Auth（验证中），Established（已连接），Idle（未连接） |
| expiration | String | 截止日期（只读），仅当 state 为 Established（已连接）状态时返回。 |

## 2.9.6.16. update-remote-access 修改远程访问设置 {#update-remote-access}

修改远程访问设置并返回修改后的设置。

```http
POST /api/config/update-remote-access
```

请求体示例

```json
{
  "host": "serverUrl2",
  "password": "password2",
  "bridgeNetwork": "LAN1"
}
```

请求参数见[远程访问设置参数](#remote-access-params)。

返回示例

```json
{
  "host": "serverUrl2",
  "hub": "XXXXXX-XXXXXX-XXXXXX-XXXXXX",
  "password": "password2",
  "bridgeNetwork": "LAN1",
  "state": "Established",
  "expiration": "2999-12-31T23:59:59"
}
```

返回参数见[远程访问设置参数](#remote-access-params)。
