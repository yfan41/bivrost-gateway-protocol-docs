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
  "queueSizeTbHubBroadcasting": 0,
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
  "base64": "string"
}
```

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| base64 | String | (必需)许可文件的 Base64 编码内容。 |

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

### 2.10.1.5. log-level 切换 Core 日志级别 {#log-level}

在运行时切换 Core 服务的日志级别，立即生效，无需重启服务。此切换不会写入配置文件，Core 服务重启后恢复为配置文件中的日志级别。

```http
GET /api/core/log-level?level=LEVEL
```

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| level | String | (必需)日志级别，范围：Verbose（0）、Debug（1）、Information（2）、Warning（3）、Error（4）、Fatal（5），可使用级别名称或对应数值。取值不在范围内时返回 GENERAL_API_INVALID_REQUEST。 |

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

### 2.10.1.6. need-restart 标记需要重启 {#need-restart}

将 Core 服务标记为需要重启以应用设置，标记后[2.10.1.3. service-status 获取服务状态](#service-status)返回的 needRestart 变为 true。此接口只置位标记，不会重启服务。此接口无请求参数。

```http
GET /api/core/need-restart
```

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

### 2.10.1.7. settings 获取 Core 运行配置 {#settings}

获取 Core 服务当前加载的运行配置。此接口无请求参数。

```http
GET /api/core/settings
```

返回示例

```json
{
  "logLevel": 2,
  "logFileSize": 10000000,
  "logFileCount": 60,
  "coreBaseUrl": "http://localhost:18100",
  "gatewayIPEndPoint": "127.0.0.1:18101",
  "uid": "XXXXXX-XXXXXX-XXXXXX-XXXXXX",
  "modbusPort": 502,
  "serial": {
    "coM1": "LOCAL,COM1",
    "coM2": null,
    "coM3": null,
    "coM4": null,
    "coM5": null,
    "coM6": null
  },
  "fileServerDir": "E:\\dnc",
  "smbGroup": "dcom",
  "vhdDir": "C:\\iotgw\\vhd",
  "coreContentDir": "C:\\iotgw\\core",
  "gatewayContentDir": "C:\\iotgw\\gateway",
  "showCreateCnc": true,
  "showCreateLaser": true,
  "showCreateRobot": true,
  "showCreatePlc": true,
  "enableInfluxLog": false,
  "enableMqttDefaultCustomAttributes": false,
  "maxAllowedWrapperInstanceCount": 3,
  "serviceQueueCapacity": 100000,
  "enableQueueOverflowToDisk": true,
  "queueOverflowMemoryCapacity": 1000,
  "queueOverflowStoragePath": null,
  "queueOverflowSegmentSize": 5000,
  "maxQueueOverflowBytes": 2147483648,
  "queueOverflowDropWarnIntervalMs": 5000,
  "taskManagerLaunchingOffset": 100,
  "fanucRobotAlarmLogCount": 10,
  "fanucRobotCurAlarmCount": 10,
  "fanucRobotUseWebAlarm": false,
  "mqttMaxBatchSize": 1000,
  "tbCloudServiceIgnoreUID": false,
  "uiPath": "/app/gateway",
  "bypassRoutes": null,
  "agents": [],
  "tbCloudAddress": null,
  "tbCloudUsername": null,
  "tbCloudPassword": null,
  "tbxAddress": null,
  "hubContentDir": "C:\\iotgw\\core\\"
}
```

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| logLevel | Int32 | 启动时的日志级别，取值同 [2.10.1.5. log-level 切换 Core 日志级别](#log-level)的 level 数值。 |
| logFileSize | Int32 | 单个日志文件的大小上限（字节）。 |
| logFileCount | Int32 | 日志文件保留数量。 |
| coreBaseUrl | String | Core 服务的监听地址。 |
| gatewayIPEndPoint | String | Gateway 服务的地址与端口。 |
| uid | String | 网关 UID。 |
| modbusPort | Int32 | MODBUS 服务监听端口。 |
| serial | Object | 串口用途配置。 |
| coM1 ~ coM6 | String | 串口 COM1~COM6 的用途配置，未配置时为 null。字段按驼峰规则序列化，实际键名为 coM1~coM6。 |
| fileServerDir | String | 文件服务器根目录。 |
| smbGroup | String | 文件服务器共享所属的工作组。 |
| vhdDir | String | 虚拟磁盘目录。 |
| coreContentDir | String | Core 服务数据目录。 |
| gatewayContentDir | String | Gateway 服务数据目录。 |
| showCreateCnc | Bool | 是否允许新建 CNC 机台。 |
| showCreateLaser | Bool | 是否允许新建激光切割机。 |
| showCreateRobot | Bool | 是否允许新建机器人。 |
| showCreatePlc | Bool | 是否允许新建 PLC。 |
| enableInfluxLog | Bool | 是否启用 Influx 日志。 |
| enableMqttDefaultCustomAttributes | Bool | 是否在 MQTT 输出中默认附带自定义属性。 |
| maxAllowedWrapperInstanceCount | Int32 | 采集进程实例数量上限。 |
| serviceQueueCapacity | Int32 | 服务队列的内存容量上限。 |
| enableQueueOverflowToDisk | Bool | 队列写满内存后是否溢出到磁盘。 |
| queueOverflowMemoryCapacity | Int32 | 溢出前每个队列在内存中保留的条目数。 |
| queueOverflowStoragePath | String | 溢出数据的存放路径，为 null 时使用 coreContentDir 下的 queue-overflow 目录。 |
| queueOverflowSegmentSize | Int32 | 每个溢出分段文件的条目数。 |
| maxQueueOverflowBytes | Int64 | 每个队列的溢出数据字节上限，达到上限后停止写入。 |
| queueOverflowDropWarnIntervalMs | Int32 | 丢弃与磁盘读写告警的最小间隔（毫秒）。 |
| taskManagerLaunchingOffset | Int32 | 任务启动的间隔（毫秒）。 |
| fanucRobotAlarmLogCount | Int32 | FANUC 机器人读取的历史警报条数。 |
| fanucRobotCurAlarmCount | Int32 | FANUC 机器人读取的当前警报条数。 |
| fanucRobotUseWebAlarm | Bool | FANUC 机器人是否通过 Web 方式读取警报。 |
| mqttMaxBatchSize | Int32 | MQTT 单次批量发送的最大条数。 |
| tbCloudServiceIgnoreUID | Bool | 云平台服务是否忽略网关 UID。 |
| uiPath | String | 网页界面的部署路径。 |
| bypassRoutes | String | Hub 专用，无需代理直接放行的路由。Core 返回 null。 |
| agents | Object[] | Hub 专用，已注册的网关代理列表。Core 返回空数组。 |
| tbCloudAddress | String | Hub 专用，云平台地址。Core 返回 null。 |
| tbCloudUsername | String | Hub 专用，云平台账号。Core 返回 null。 |
| tbCloudPassword | String | Hub 专用，云平台密码。Core 返回 null。 |
| tbxAddress | String | Hub 专用，TBX 服务地址。Core 返回 null。 |
| hubContentDir | String | Hub 专用，Hub 服务数据目录。 |

:::note[注]
返回内容包含 tbCloudUsername、tbCloudPassword 等凭据字段，请勿将此接口开放给不受信任的调用方。
:::
