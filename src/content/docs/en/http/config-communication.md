---
title: "2.9.6. Communication Configuration Interface"
sidebar:
  label: "2.9.6. Communication Configuration"
---


The communication configuration interface is used to get or modify the task configuration. For details on communication configuration, see the Bivrost Gateway Manual [5.6. Communication Configuration](https://docs.bivrost.cn/gateway/usage/communication).

## 2.9.6.1. cloud-settings Get Cloud Platform Settings {#cloud-settings}

This interface takes no request parameters.

```http
GET /api/config/cloud-settings
```

Response example

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

The response parameters are listed in the table below:

#### Cloud Platform Settings Parameters {#cloud-settings-params}

| Parameter | Type | Description |
| --- | --- | --- |
| enable | Bool | Enable the cloud platform. true = on, false = off. |
| serverAddress | String | Server address. Not returned if not set. |
| token | String | Gateway token. Not returned if not set. |
| enableBroadcasting | Bool | Enable broadcasting. true = on, false = off. When enabled, data is broadcast via the cloud platform. |
| enableGatewayLinking | Bool | Enable gateway linking. true = on, false = off. When enabled, data broadcast by the linked gateways specified on the cloud platform is received. |
| gatewayLinks | String | Linked gateways. Not returned if not set. |

## 2.9.6.2. update-cloud-settings Update Cloud Platform Settings {#update-cloud-settings}

Updates the cloud platform settings and returns the updated settings.

```http
POST /api/config/update-cloud-settings
```

Request body example

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

For request parameters, see [Cloud Platform Settings Parameters](#cloud-settings-params).

Response example

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

For response parameters, see [Cloud Platform Settings Parameters](#cloud-settings-params).

## 2.9.6.3. modbus-settings Get MODBUS Settings {#modbus-settings}

This interface takes no request parameters.

```http
GET /api/config/modbus-settings
```

Response example

```json
{
  "enable": false,
  "byte4Order": "DCBA",
  "byte8Order": "HGFEDCBA",
  "encoding": "GBK",
  "reverseString": false
}
```

The response parameters are listed in the table below:

#### MODBUS Settings Parameters {#modbus-settings-params}

| Parameter | Type | Description |
| --- | --- | --- |
| enable | Bool | Enable MODBUS. true = on, false = off. |
| byte4Order | String | 32-bit format. Supported formats include: ABCD, BADC, CDAB, DCBA, etc. |
| byte8Order | String | 64-bit format. Supported formats include: ABCDEFGH, BADCFEHG, GHEFCDAB, HGFEDCBA, etc. |
| encoding | String | Encoding, e.g. ASCII, UTF-8, GBK, etc. |
| reverseString | Bool | Reverse string. true = on, false = off. |

## 2.9.6.4. update-modbus-settings Update MODBUS Settings {#update-modbus-settings}

Updates the MODBUS settings and returns the updated settings.

```http
POST /api/config/update-modbus-settings
```

Request body example

```json
{
  "enable": true,
  "byte4Order": "ABCD",
  "byte8Order": "ABCDEFGH",
  "encoding": "UTF-8",
  "reverseString": true
}
```

For request parameters, see [MODBUS Settings Parameters](#modbus-settings-params).

Response example

```json
{
  "enable": true,
  "byte4Order": "ABCD",
  "byte8Order": "ABCDEFGH",
  "encoding": "UTF-8",
  "reverseString": true
}
```

For response parameters, see [MODBUS Settings Parameters](#modbus-settings-params).

## 2.9.6.5. mqtt-settings Get MQTT Settings {#mqtt-settings}

This interface takes no request parameters.

```http
GET /api/config/mqtt-settings
```

Response example

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

The response parameters are listed in the table below:

#### MQTT Settings Parameters {#mqtt-settings-params}

| Parameter | Type | Description |
| --- | --- | --- |
| enable | Bool | Enable MQTT. true = on, false = off. |
| mode | String | Mode. See [MQTT mode](#mqtt-mode) for details. |
| brokerAddress | String | Server address |
| port | Int32 | Server port |
| clientID | String | Client ID |
| username | String | Username |
| password | String | Password |
| dataReportTopic | String | Data report topic |
| rpcRequestTopic | String | RPC request topic |
| rpcResponseTopic | String | RPC response topic |
| encoding | String | Encoding, e.g. ASCII, UTF-8, GBK, etc. |
| allowAnomynous | Bool | Allow anonymous login. true = on, false = off. |
| arrayToString | Bool | Convert array to string. true = on, false = off. |
| publishOnValueChange | Bool | Write on value change. true = on, false = off. Default is false. |
| publishAllOnValueChange | Bool | Upload all content on change. Effective only when publish-on-value-change is enabled. Default is false, meaning only the changed portion is uploaded when a value changes. |
| timeoutReportingInterval | Int32 | Timeout reporting interval. Effective only when publish-on-value-change is enabled. If the time since the last upload exceeds this interval, data is uploaded once regardless of whether the value changed. Unit: seconds. Default is 0, meaning timeout reporting is disabled. |

#### MQTT mode {#mqtt-mode}

| Option |
| --- |
| Default |
| TB2 |
| Brm |
| IoTDA |
| WisIoT |
| MKT |
| TB |

## 2.9.6.6. update-mqtt-settings Update MQTT Settings {#update-mqtt-settings}

Updates the MQTT settings and returns the updated settings.

```http
POST /api/config/update-mqtt-settings
```

Request body example

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

For request parameters, see [MQTT Settings Parameters](#mqtt-settings-params).

Response example

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

For response parameters, see [MQTT Settings Parameters](#mqtt-settings-params).

## 2.9.6.7. database-settings Get Database Settings {#database-settings}

This interface takes no request parameters.

```http
GET /api/config/database-settings
```

Response example

For an InfluxDB v2.x type database, the response is as follows:

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

For a non-InfluxDB v2.x type database, the response is as follows:

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

The response parameters are listed in the table below:

#### Database Settings Parameters {#database-settings-params}

| Parameter | Type | Description |
| --- | --- | --- |
| enable | Bool | Enable the database. true = on, false = off. |
| type | String | Type. See [Database Types](#database-types) for details. |
| serverAddress | String | Server address |
| port | String | Server port |
| username | String | Username |
| password | String | Password |
| bucket | String | Database bucket. InfluxDB v2.x type only. |
| organization | String | Organization name. InfluxDB v2.x type only. |
| database | String | Database. Non-InfluxDB v2.x types only. |
| storageMode | String | Storage mode. Non-InfluxDB v2.x types only. See [Database Storage Modes](#database-save-modes) for details. |
| dataRetentionPeriod | Int32 | Data retention period (hours). Non-InfluxDB v2.x database types only. |
| loggingModeTypes | String[] | Effective when the storage mode is User Defined. See the `<type>` data classes in [1.2. Data Description](/en/conventions/data-classes/) for details. |
| noActionModeTypes | String[] | Effective when the storage mode is User Defined. See the `<type>` data classes in [1.2. Data Description](/en/conventions/data-classes/) for details. |
| realTimeModeTypes | String[] | Effective when the storage mode is User Defined. See the `<type>` data classes in [1.2. Data Description](/en/conventions/data-classes/) for details. |
| useLocalTime | Bool | Use local time. Non-InfluxDB v2.x types only. |
| enablePrimaryKey | Bool | Enable primary key. Non-InfluxDB v2.x types only. |
| tablePrefix | String | Table prefix |
| writeOnValueChange | Bool | Write on value change. true = on, false = off. |
| timeoutReportingInterval | Int32 | Timeout reporting interval. Effective when write-on-value-change is enabled. If the time since the last write exceeds this interval, data is uploaded once regardless of whether the value changed. Unit: seconds. Default is 0, meaning timeout writing is disabled. |

#### Database Types {#database-types}

| Option |
| --- |
| InfluxDB v2.x |
| MySQL |
| SQL Server |
| Postgre SQL |

#### Database Storage Modes {#database-save-modes}

| Option | Description |
| --- | --- |
| Logging | Logging |
| Real Time | Real time |
| User Defined | User defined |

## 2.9.6.8. update-database-settings Update Database Settings {#update-database-settings}

Updates the database settings and returns the updated settings.

```http
POST /api/config/update-database-settings
```

Request body example

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

For request parameters, see [Database Settings Parameters](#database-settings-params).

Response example

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

For response parameters, see [Database Settings Parameters](#database-settings-params).

## 2.9.6.9. gateway-file-server-settings Get Gateway File Server Settings {#gateway-file-server-settings}

This interface takes no request parameters.

```http
GET /api/config/gateway-file-server-settings
```

Response example

```json
{
  "enable": false,
  "enableFtp": false,
  "enableSmb": false,
  "username": "dncuser",
  "password": "dncuser"
}
```

The response parameters are listed in the table below:

#### Gateway File Server Settings Parameters {#gateway-file-server-settings-params}

| Parameter | Type | Description |
| --- | --- | --- |
| enable | Bool | Enable the gateway file server. true = on, false = off. |
| enableFtp | String | Enable FTP. true = on, false = off. |
| enableSmb | String | Enable shared folder. true = on, false = off. |
| username | String | Username. Read-only, cannot be modified. |
| password | String | Password |

## 2.9.6.10. update-gateway-file-server-settings Update Gateway File Server Settings {#update-gateway-file-server-settings}

Updates the gateway file server settings and returns the updated settings.

```http
POST /api/config/update-gateway-file-server-settings
```

Request body example

```json
{
  "enable": true,
  "enableFtp": true,
  "enableSmb": true,
  "username": "dncuser",
  "password": "password"
}
```

For request parameters, see [Gateway File Server Settings Parameters](#gateway-file-server-settings-params).

Response example

```json
{
  "enable": true,
  "enableFtp": true,
  "enableSmb": true,
  "username": "dncuser",
  "password": "password"
}
```

For response parameters, see [Gateway File Server Settings Parameters](#gateway-file-server-settings-params).

## 2.9.6.11. http-settings Get HTTP Settings {#http-settings}

This interface takes no request parameters.

```http
GET /api/config/http-settings
```

Response example

```json
{
  "enable": true,
  "enableIpWhiteList": true,
  "ipWhiteList": "192.168.100.200;192.168.100.201;"
}
```

The response parameters are listed in the table below:

#### HTTP Settings Parameters {#http-settings-params}

| Parameter | Type | Description |
| --- | --- | --- |
| Enable | Bool | Enable HTTP. true = on, false = off. |
| enableIpWhiteList | Bool | Enable IP whitelist. true = on, false = off. |
| ipWhiteList | String | Whitelist entries (separated by `;`). Not returned if not set. |

## 2.9.6.12. update-http-settings Update HTTP Settings {#update-http-settings}

Updates the HTTP settings and returns the updated settings.

```http
POST /api/config/update-http-settings
```

Request body example

```json
{
  "enable": true,
  "enableIpWhiteList": true,
  "ipWhiteList": "192.168.100.200;192.168.100.201;"
}
```

For request parameters, see [HTTP Settings Parameters](#http-settings-params).

Response example

```json
{
  "enable": true,
  "enableIpWhiteList": true,
  "ipWhiteList": "192.168.100.200;192.168.100.201;"
}
```

For response parameters, see [HTTP Settings Parameters](#http-settings-params).

## 2.9.6.13. hub-settings Get Hub Settings {#hub-settings}

This interface takes no request parameters.

```http
GET /api/config/hub-settings
```

Response example

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

The response parameters are listed in the table below:

#### Hub Settings Parameters {#hub-settings-params}

| Parameter | Type | Description |
| --- | --- | --- |
| enable | Bool | Enable Hub. true = on, false = off. |
| server | String | Server address. Not returned if not set. |
| accessToken | String | Gateway token. Not returned if not set. |
| enableBroadcasting | Bool | Enable broadcasting. true = on, false = off. When enabled, data is broadcast via the Hub. |
| enableGatewayLinking | Bool | Enable gateway linking. true = on, false = off. When enabled, data broadcast by the linked gateways specified under the Hub is received. |
| gatewayLinks | String | Linked gateways. Not returned if not set. |

## 2.9.6.14. update-hub-settings Update Hub Settings {#update-hub-settings}

Updates the Hub settings and returns the updated settings.

```http
POST /api/config/update-hub-settings
```

Request body example

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

For request parameters, see [Hub Settings Parameters](#hub-settings-params).

Response example

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

For response parameters, see [Hub Settings Parameters](#hub-settings-params).

## 2.9.6.15. remote-access Get Remote Access Settings {#remote-access}

This interface takes no request parameters.

```http
GET /api/config/remote-access
```

Response example

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

The response parameters are listed in the table below:

#### Remote Access Settings Parameters {#remote-access-params}

| Parameter | Type | Description |
| --- | --- | --- |
| host | String | Remote server address. |
| hub | String | Site (read-only), defaults to the gateway UID. |
| password | String | Password. |
| bridgeNetwork | String | Bridge network: "LAN1", "LAN2", "" (no bridging). |
| state | String | Connection state (read-only): Connecting, Negotiation, Retry (the above three are all "connecting" states), Auth (authenticating), Established (connected), Idle (not connected) |
| expiration | String | Expiration date (read-only), returned only when state is Established (connected). |

## 2.9.6.16. update-remote-access Update Remote Access Settings {#update-remote-access}

Updates the remote access settings and returns the updated settings.

```http
POST /api/config/update-remote-access
```

Request body example

```json
{
  "host": "serverUrl2",
  "password": "password2",
  "bridgeNetwork": "LAN1"
}
```

For request parameters, see [Remote Access Settings Parameters](#remote-access-params).

Response example

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

For response parameters, see [Remote Access Settings Parameters](#remote-access-params).
