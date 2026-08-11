---
title: "2.10. Gateway Function Interfaces"
sidebar:
  label: "2.10.1. Core Service Functions"
---


The gateway function interfaces are used to command the gateway to perform specific functions, including the Gateway service function interfaces and the Core service function interfaces.

## 2.10.1. Core Service Function Interfaces {#core-functions}

Base address **/api/core**.

### 2.10.1.1. info - Get Core Service Information {#info}

This interface has no request parameters.

```http
GET /api/core/info
```

Response example

```json
{
  "version": "1.19.4.18"
}
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| version | String | (Required) Version number |

### 2.10.1.2. license-info - Get License Information {#license-info}

Retrieves license details, including the expiration date, license count, license type, license status, and more. This interface has no request parameters.

```http
GET /api/core/license-info
```

Response example

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

| Response Parameter | Type | Description |
| --- | --- | --- |
| isValid | Bool | (Required) Whether the license is valid; true = valid, false = invalid. |
| license | object | (Required) License details |
| company | String | Name of the company that issued the license. Not returned in the neutralized (white-label) version. |
| product | String | (Required) Name of the product the license applies to. |
| machineCount | Int32 | (Required) Total number of licenses. |
| plcCount | Int32 | Number of PLC licenses. If not returned, the PLC license count equals the total license count. |
| robotCount | Int32 | Number of robot licenses. If not returned, the robot license count equals the total license count. |
| cncCount | Int32 | Number of CNC licenses. If not returned, the CNC license count equals the total license count. |
| laserCount | Int32 | Number of laser cutter licenses. If not returned, the laser cutter license count equals the total license count. |
| featureAppDNC | Bool | (Required) Whether the professional file transfer edition is enabled; true = enabled, false = disabled. |
| licType | String | (Required) License type: Basic = Basic edition, Standard = Standard edition, Full = Extended edition, DNC = DNC edition, PLC = PLC edition. |
| uid | String | (Required) Gateway UID this license applies to. |
| expiration | String | (Required) License expiration date. |

### 2.10.1.3. service-status - Get Service Status {#service-status}

This interface retrieves the status of services including the cloud platform, MODBUS, MQTT, the database, the local cache, and more. This interface has no request parameters.

```http
GET /api/core/service-status
```

Response example

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

| Response Parameter | Type | Description |
| --- | --- | --- |
| mqtt | Int32 | (Required) MQTT status, see [Service Running Status](/en/conventions/variables/#service-running-status). |
| queueSizeMqtt | Int32 | (Required) MQTT queue length |
| modbus | Int32 | (Required) MODBUS status, see [Service Running Status](/en/conventions/variables/#service-running-status). |
| queueSizeModbus | Int32 | (Required) MODBUS queue length |
| tbCloud | Int32 | (Required) Cloud platform status, see [Service Running Status](/en/conventions/variables/#service-running-status). |
| queueSizeTbCloud | Int32 | (Required) Cloud platform queue length |
| localDB | Int32 | (Required) Local cache status, see [Service Running Status](/en/conventions/variables/#service-running-status). |
| queueSizeLocalDB | Int32 | (Required) Local cache queue length |
| writeData | Int32 | (Required) Database status, see [Service Running Status](/en/conventions/variables/#service-running-status). |
| queueSizeWriteData | Int32 | (Required) Database queue length |
| localDBLog | Int32 | (Required) Log database status, see [Service Running Status](/en/conventions/variables/#service-running-status). |
| queueSizeLocalDBLog | Int32 | (Required) Log database queue length |
| hubBroadcasting | Int32 | (Required) Hub broadcast status, see [Service Running Status](/en/conventions/variables/#service-running-status). |
| queueSizeHubBroadcasting | Int32 | (Required) Hub broadcast queue length |
| tbHubBroadcasting | Int32 | (Required) Cloud platform broadcast status, see [Service Running Status](/en/conventions/variables/#service-running-status). |
| queueSizeTbHubBroadcasting | Int32 | (Required) Cloud platform broadcast queue length |
| needRestart | Bool | (Required) Whether the service needs to be restarted to apply the settings |

### 2.10.1.4. upload-license - Upload Gateway License {#upload-license}

Uploads a gateway license as a string stream.

```http
POST /api/core/upload-license
```

Request body example

```json
{
  "base64": "string"
}
```

| Request Parameter | Type | Description |
| --- | --- | --- |
| base64 | String | (Required) Base64-encoded content of the license file. |

The gateway license file should be converted to Base64 string format before uploading; the gateway reads the file content using the Base64 string format.

Response example

```json
{
  "errorCode": 0,
  "errorMsg": "Success"
}
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| errorCode | Int32 | (Required) Error code, 0 indicates success. |
| errorMsg | String | (Required) Error message |

### 2.10.1.5. log-level - Switch the Core Log Level {#log-level}

Switches the log level of the Core service at runtime. It takes effect immediately and does not require a service restart. The switch is not written to the configuration file; after the Core service restarts, the log level configured in the configuration file is restored.

```http
GET /api/core/log-level?level=LEVEL
```

| Request Parameter | Type | Description |
| --- | --- | --- |
| level | String | (Required) Log level, one of: Verbose (0), Debug (1), Information (2), Warning (3), Error (4), Fatal (5). Either the level name or its numeric value can be used. A value outside this range returns GENERAL_API_INVALID_REQUEST. |

Response example

```json
{
  "errorCode": 0,
  "errorMsg": "Success"
}
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| errorCode | Int32 | (Required) Error code, 0 indicates success. |
| errorMsg | String | (Required) Error message |

### 2.10.1.6. need-restart - Flag That a Restart Is Required {#need-restart}

Flags the Core service as needing a restart to apply the settings. Once flagged, the needRestart field returned by [2.10.1.3. service-status - Get Service Status](#service-status) becomes true. This interface only sets the flag; it does not restart the service. This interface has no request parameters.

```http
GET /api/core/need-restart
```

Response example

```json
{
  "errorCode": 0,
  "errorMsg": "Success"
}
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| errorCode | Int32 | (Required) Error code, 0 indicates success. |
| errorMsg | String | (Required) Error message |

### 2.10.1.7. settings - Get the Core Runtime Configuration {#settings}

Retrieves the runtime configuration currently loaded by the Core service. This interface has no request parameters.

```http
GET /api/core/settings
```

Response example

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

| Response Parameter | Type | Description |
| --- | --- | --- |
| logLevel | Int32 | Log level at startup; the values are the same as the numeric level values of [2.10.1.5. log-level - Switch the Core Log Level](#log-level). |
| logFileSize | Int32 | Maximum size of a single log file (bytes). |
| logFileCount | Int32 | Number of log files to retain. |
| coreBaseUrl | String | Listening address of the Core service. |
| gatewayIPEndPoint | String | Address and port of the Gateway service. |
| uid | String | Gateway UID. |
| modbusPort | Int32 | Listening port of the MODBUS service. |
| serial | Object | Serial port usage configuration. |
| coM1 ~ coM6 | String | Usage configuration of serial ports COM1 to COM6; null when not configured. The fields are serialized with camel-case naming, so the actual keys are coM1 to coM6. |
| fileServerDir | String | Root directory of the file server. |
| smbGroup | String | Workgroup the file server share belongs to. |
| vhdDir | String | Virtual disk directory. |
| coreContentDir | String | Data directory of the Core service. |
| gatewayContentDir | String | Data directory of the Gateway service. |
| showCreateCnc | Bool | Whether creating CNC machines is allowed. |
| showCreateLaser | Bool | Whether creating laser cutters is allowed. |
| showCreateRobot | Bool | Whether creating robots is allowed. |
| showCreatePlc | Bool | Whether creating PLCs is allowed. |
| enableInfluxLog | Bool | Whether Influx logging is enabled. |
| enableMqttDefaultCustomAttributes | Bool | Whether custom attributes are included in MQTT output by default. |
| maxAllowedWrapperInstanceCount | Int32 | Maximum number of acquisition process instances. |
| serviceQueueCapacity | Int32 | In-memory capacity limit of a service queue. |
| enableQueueOverflowToDisk | Bool | Whether a queue overflows to disk once its in-memory capacity is full. |
| queueOverflowMemoryCapacity | Int32 | Number of items kept in memory per queue before spilling to disk. |
| queueOverflowStoragePath | String | Storage path for overflow data; when null, the queue-overflow directory under coreContentDir is used. |
| queueOverflowSegmentSize | Int32 | Number of items per overflow segment file. |
| maxQueueOverflowBytes | Int64 | Byte cap of overflow data per queue; writing stops once the cap is reached. |
| queueOverflowDropWarnIntervalMs | Int32 | Minimum interval between drop and disk I/O warnings (milliseconds). |
| taskManagerLaunchingOffset | Int32 | Interval between task launches (milliseconds). |
| fanucRobotAlarmLogCount | Int32 | Number of historical alarm records read from FANUC robots. |
| fanucRobotCurAlarmCount | Int32 | Number of current alarm records read from FANUC robots. |
| fanucRobotUseWebAlarm | Bool | Whether FANUC robot alarms are read over the web interface. |
| mqttMaxBatchSize | Int32 | Maximum number of items sent in a single MQTT batch. |
| tbCloudServiceIgnoreUID | Bool | Whether the cloud platform service ignores the gateway UID. |
| uiPath | String | Deployment path of the web interface. |
| bypassRoutes | String | Hub only. Routes that are passed through without proxying. Core returns null. |
| agents | Object[] | Hub only. List of registered gateway agents. Core returns an empty array. |
| tbCloudAddress | String | Hub only. Cloud platform address. Core returns null. |
| tbCloudUsername | String | Hub only. Cloud platform user name. Core returns null. |
| tbCloudPassword | String | Hub only. Cloud platform password. Core returns null. |
| tbxAddress | String | Hub only. TBX service address. Core returns null. |
| hubContentDir | String | Hub only. Data directory of the Hub service. |

:::note[Note]
The response contains credential fields such as tbCloudUsername and tbCloudPassword. Do not expose this interface to untrusted callers.
:::
