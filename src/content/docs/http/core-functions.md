---
title: "2.10. 网关功能接口"
sidebar:
  label: "2.10.1. Core 服务功能"
---


网关功能接口用于命令网关执行特定功能，包括 Gateway 服务功能接口和 Core 服务功能接口。

## 2.10.1. Core 服务功能接口 {#core-functions}

基地址 **/api/core**。

### 2.10.1.1. info 获取 Core 服务信息 {#info}

此接口无请求参数。

```http
GET /api/core/info
```

返回示例

```json
{
  "version": "1.19.4.18"
}
```

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| version | String | (必需)版本号 |

### 2.10.1.2. license-info 获取许可信息 {#license-info}

获取许可详情，包括截至日期、许可数量、许可类型、许可状态等。此接口无请求参数。

```http
GET /api/core/license-info
```

返回示例

```json
{
  "isValid": true,
  "license": {
    "company": "Bivrost",
    "product": "IoT Gateway",
    "machineCount": 255,
    "plcCount": 40,
    "robotCount": 60,
    "cncCount": 150,
    "laserCount": 5,
    "featureAppDNC": true,
    "licType": "Full",
    "uid": "XXXXXX-XXXXXX-XXXXXX-XXXXXX",
    "expiration": "2999-12-31T23:59:59"
  }
}
```

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| isValid | Bool | (必需)许可是否有效，true=有效，false=无效。 |
| license | object | (必需)许可详情 |
| company | String | 授权该许可的公司名称。中性化版本不返回。 |
| product | String | (必需)许可对应的产品名称。 |
| machineCount | Int32 | (必需)许可总数。 |
| plcCount | Int32 | PLC 许可数。如不返回，PLC 许可数为许可总数。 |
| robotCount | Int32 | 机器人许可数。如不返回，机器人许可数为许可总数。 |
| cncCount | Int32 | CNC 许可数。如不返回，CNC 许可数为许可总数。 |
| laserCount | Int32 | 激光切割机许可数。如不返回，激光切割机许可数为许可总数。 |
| featureAppDNC | Bool | (必需)是否启用文件传输专业版，true=启用，false=不启用。 |
| licType | String | (必需)许可类型，Basic=基础版，Standard=标准版，Full=扩展版，DNC=DNC 版，PLC=PLC 版。 |
| uid | String | (必需)许可对应的网关 UID。 |
| expiration | String | (必需)截止有效期。 |

### 2.10.1.3. service-status 获取服务状态 {#service-status}

此接口获取包括云平台、MODBUS、MQTT、数据库、本地缓存等服务状态，此接口无请求参数。

```http
GET /api/core/service-status
```

返回示例

```json
{
  "mqtt": 3,
  "queueSizeMqtt": 9,
  "modbus": 0,
  "queueSizeModbus": 0,
  "tbCloud": 0,
  "queueSizeTbCloud": 0,
  "localDB": 3,
  "queueSizeLocalDB": 0,
  "writeData": 2,
  "queueSizeWriteData": 0,
  "localDBLog": 0,
  "queueSizeLocalDBLog": 0,
  "hubBroadcasting": 2,
  "queueSizeHubBroadcasting": 0,
  "tbHubBroadcasting": 0,
  "queueSizeHubBroadcasting": 0,
  "needRestart": false
}
```

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| mqtt | Int32 | (必需)MQTT 状态，参考[服务运行状态](/conventions/variables/#service-running-status)。 |
| queueSizeMqtt | Int32 | (必需)MQTT 队列长度 |
| modbus | Int32 | (必需)MODBUS 状态，参考[服务运行状态](/conventions/variables/#service-running-status)。 |
| queueSizeModbus | Int32 | (必需)MODBUS 队列长度 |
| tbCloud | Int32 | (必需)云平台状态，参考[服务运行状态](/conventions/variables/#service-running-status)。 |
| queueSizeTbCloud | Int32 | (必需)云平台队列长度 |
| localDB | Int32 | (必需)本地缓存状态，参考[服务运行状态](/conventions/variables/#service-running-status)。 |
| queueSizeLocalDB | Int32 | (必需)本地缓存队列长度 |
| writeData | Int32 | (必需)数据库状态，参考[服务运行状态](/conventions/variables/#service-running-status)。 |
| queueSizeWriteData | Int32 | (必需)数据库队列长度 |
| localDBLog | Int32 | (必需)日志数据库状态，参考[服务运行状态](/conventions/variables/#service-running-status)。 |
| queueSizeLocalDBLog | Int32 | (必需)日志数据库队列长度 |
| hubBroadcasting | Int32 | (必需)hub 广播状态，参考[服务运行状态](/conventions/variables/#service-running-status)。 |
| queueSizeHubBroadcasting | Int32 | (必需)hub 广播队列长度 |
| tbHubBroadcasting | Int32 | (必需)云平台广播状态，参考[服务运行状态](/conventions/variables/#service-running-status)。 |
| queueSizeTbHubBroadcasting | Int32 | (必需)云平台广播队列长度 |
| needRestart | Bool | (必需)需要重启服务以应用设置 |

### 2.10.1.4. upload-license 上传网关许可 {#upload-license}

以字符串流的形式上传网关许可。

```http
POST /api/core/upload-license
```

请求体示例

```json
{
  "Base64": "string"
}
```

网关许可文件应在上传前转换为 Base64 字符串格式，网关将使用 Base64 字符串格式读取文件内容。

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
