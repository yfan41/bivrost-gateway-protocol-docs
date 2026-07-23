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
  "queueSizeHubBroadcasting": 0,
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
  "Base64": "string"
}
```

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
