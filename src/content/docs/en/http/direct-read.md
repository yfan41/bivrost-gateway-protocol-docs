---
title: "2.5. Data Read/Write Interface"
sidebar:
  label: "2.5.1. Direct Read/Write · Status and Data"
---


The data read/write interface lets you read or write machine data, or read machine group data, through the gateway. The data read/write interface is divided into two categories: direct read/write and cached read.

## 2.5.1. Direct Read/Write {#direct}

When using direct read/write interfaces, the gateway communicates with the target machine immediately to retrieve or write data.

### 2.5.1.1. readAlarm - Read Alarm Information {#readalarm}

```http
GET /api/cnc/readAlarm?machineID=MACHINEID
```

| Request Parameter | Type | Description |
| --- | --- | --- |
| machineID | String | (Required) Target machine identifier, see [1.1.1. machineID Machine Identifier](/en/conventions/identifiers/#machineid) |

Response Example

```json
{
  "alarmMsg": [
    "警报 1",
    "警报 2"],
  "alarmLevel": [
    "WRN",
    "WRN"]
}
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| alarmMsg | String[] | (Required) The machine's current alarm content. If there is no alarm, an empty Array is returned. |
| alarmLevel | String[] | (Required) Alarm level, corresponding in order to the alarm content. If there is no alarm, an empty Array is returned. See [Alarm Level](/en/conventions/variables/#alarm-level). |

:::note[Note]
Starting from version 1.8.1, the alarm timestamp has been removed. To obtain the start time of a machine alarm, use the interface [2.7.1.2. alarm - Machine Alarm Data Analysis](/en/http/analysis-machine/#alarm).
:::

### 2.5.1.2. readCNCStatus - Read Machine Status {#readcncstatus}

```http
GET /api/cnc/readCNCStatus?machineID=MACHINEID&channel=CHANNEL
```

| Request Parameter | Type | Description |
| --- | --- | --- |
| machineID | String | (Required) Target machine identifier, see [1.1.1. machineID Machine Identifier](/en/conventions/identifiers/#machineid) |
| channel | Int32 | Machine channel number. If not specified, it defaults to 0, i.e. the main channel |

Response Example

```json
{
  "cncStatus": "MANUAL_EDIT",
  "alarmStatus": "ALARM",
  "alarmLevel": "WRN",
  "channel": 2
}
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| cncStatus | String | (Required) Running status, see [Running Status](/en/conventions/variables/#cnc-status) |
| alarmStatus | String | (Required) Alarm status, see [Alarm Status](/en/conventions/variables/#alarm-status) |
| alarmLevel | String | Alarm level. If there are multiple alarms, the highest level among them is taken. If there is no alarm, this field is not returned. See [Alarm Level](/en/conventions/variables/#alarm-level) |
| channel | Int32 | Machine channel number, present only when `channel` is included in the request and is not 0 |

The adjusted running status `adjustedStatus`, cumulative shutdown time `offTime`, cumulative standby time `waitTime`, cumulative emergency-stop time `emergencyTime`, cumulative auto-run time `autoRunTime`, cumulative manual-adjustment time `ManualTime`, and other values derived by the gateway's post-processing are not currently supported over HTTP. Once an automatic collection task has been enabled, these can be obtained through the interface [2.5.2.1. readTaskData - Read Machine Task Data](/en/http/cached-read/#readtaskdata) or [2.5.2.2. batchReadTaskData - Batch Read Machine Task Data](/en/http/cached-read/#batchreadtaskdata), or via MODBUS, MQTT, database, or other means.

### 2.5.1.3. readCNCStatusDetails - Read Machine Status Details {#readcncstatusdetails}

In addition to the same general machine status data returned by [2.5.1.2. readCNCStatus - Read Machine Status](#readcncstatus), this interface also returns raw, machine-specific data.

```http
GET /api/cnc/readCNCStatusDetails?machineID=MACHINEID&channel=CHANNEL
```

| Request Parameter | Type | Description |
| --- | --- | --- |
| machineID | String | (Required) Target machine identifier, see [1.1.1. machineID Machine Identifier](/en/conventions/identifiers/#machineid) |
| channel | Int32 | Machine channel number. If not specified, it defaults to 0, i.e. the main channel |

Response Example

```json
{
  "mode": "AUTO_RUN",
  "programStatus": "RUNNING",
  "emergencyStatus": "NOT_EMG",
  "dryRunStatus": "DRY_RUN",
  "cncStatus": "AUTO_RUN",
  "alarmStatus": "ALARM",
  "alarmLevel": "WRN",
  "channel": 2
}
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| mode | String | Operating mode |
| programStatus | String | Program status |
| emergencyStatus | String | Emergency-stop status, see [Emergency-Stop Status](/en/conventions/variables/#emergency-status) |
| dryRunStatus | String | Dry-run status, see [Dry-Run Status](/en/conventions/variables/#dryrun-status) |
| cncStatus | String | (Required) Running status, see [Running Status](/en/conventions/variables/#cnc-status) |
| alarmStatus | String | (Required) Alarm status, see [Alarm Status](/en/conventions/variables/#alarm-status) |
| alarmLevel | String | Alarm level. If there are multiple alarms, the highest level among them is taken. If there is no alarm, this field is not returned. See [Alarm Level](/en/conventions/variables/#alarm-level) |
| channel | Int32 | Machine channel number, present only when `channel` is included in the request and is not 0 |

The adjusted running status `adjustedStatus`, cumulative shutdown time `offTime`, cumulative standby time `waitTime`, cumulative emergency-stop time `emergencyTime`, cumulative auto-run time `autoRunTime`, cumulative manual-adjustment time `ManualTime`, and other values derived by the gateway's post-processing are not currently supported over HTTP. Once an automatic collection task has been enabled, these can be obtained through the interface [2.5.2.1. readTaskData - Read Machine Task Data](/en/http/cached-read/#readtaskdata) or [2.5.2.2. batchReadTaskData - Batch Read Machine Task Data](/en/http/cached-read/#batchreadtaskdata), or via MODBUS, MQTT, database, or other means.

### 2.5.1.4. readCount - Read Machining Count {#readcount}

```http
GET /api/cnc/readCount?machineID=MACHINEID
```

| Request Parameter | Type | Description |
| --- | --- | --- |
| machineID | String | (Required) Target machine identifier, see [1.1.1. machineID Machine Identifier](/en/conventions/identifiers/#machineid) |

Response Example

```json
{
  "count": 1052
}
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| count | Int32 | (Required) Machining count obtained from the machine's control system |

The cumulative machining count `cumulativeCount` computed by the gateway, and the machining count `currentCount` for the current monitoring window, are not currently supported over HTTP. Once an automatic collection task has been enabled, these can be obtained through the interface [2.5.2.1. readTaskData - Read Machine Task Data](/en/http/cached-read/#readtaskdata) or [2.5.2.2. batchReadTaskData - Batch Read Machine Task Data](/en/http/cached-read/#batchreadtaskdata), or via MODBUS, MQTT, database, or other means.

### 2.5.1.5. readCurrentToolNumber - Read Current Tool Number {#readcurrenttoolnumber}

```http
GET /api/cnc/readCurrentToolNumber?machineID=MACHINEID&channel=CHANNEL
```

| Request Parameter | Type | Description |
| --- | --- | --- |
| machineID | String | (Required) Target machine identifier, see [1.1.1. machineID Machine Identifier](/en/conventions/identifiers/#machineid) |
| channel | Int32 | Machine channel number. If not specified, it defaults to 0, i.e. the main channel |

Response Example

```json
{
  "toolNumber": "6",
  "toolOffsetNum": "6",
  "channel": 2
}
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| toolNumber | String | (Required) Current tool number |
| toolOffsetNum | String | Current tool offset number |
| channel | Int32 | Machine channel number, present only when `channel` is included in the request and is not 0 |

### 2.5.1.6. readEnergyConsum - Read Energy Consumption Data {#readenergyconsum}

Currently supported for some newer Brother machine models and simulated machines only.

```http
GET /api/cnc/readEnergyConsum?machineID=MACHINEID
```

| Request Parameter | Type | Description |
| --- | --- | --- |
| machineID | String | (Required) Target machine identifier, see [1.1.1. machineID Machine Identifier](/en/conventions/identifiers/#machineid) |

Response Example

```json
{
  "allServoAxes": 127144.0,
  "coolantPump": 41577.0,
  "ctsPump": 6507.0,
  "chipFlusherPump": 0.0,
  "cyclonePump": 0.0,
  "system24V": 46270.0,
  "ncControl": 10099.0,
  "lcdBacklight": 2884.0,
  "chipConveyor": 0.0,
  "screwConveyor": 0.0,
  "autoLubrication": 239.0,
  "spindleCoolingFan": 7212.0,
  "servoControl": 23806.0
}
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| allServoAxes | Double | Energy consumption of all servo axes [Wh] |
| coolantPump | Double | Coolant pump energy consumption [Wh] |
| ctsPump | Double | CTS pump energy consumption [Wh] |
| chipFlusherPump | Double | Chip flusher pump energy consumption [Wh] |
| cyclonePump | Double | Cyclone filter pump energy consumption [Wh] |
| system24V | Double | 24V system energy consumption [Wh] |
| ncControl | Double | NC control energy consumption [Wh] |
| lcdBacklight | Double | LCD backlight energy consumption [Wh] |
| chipConveyor | Double | Chip conveyor energy consumption [Wh] |
| screwConveyor | Double | Screw conveyor energy consumption [Wh] |
| autoLubrication | Double | Automatic lubrication device (or automatic greasing device) energy consumption [Wh] |
| spindleCoolingFan | Double | Spindle cooling fan energy consumption [Wh] |
| servoControl | Double | Servo control energy consumption [Wh] |

### 2.5.1.7. readFeed - Read Feed Data {#readfeed}

Laser cutting/welding machines only.

```http
GET /api/cnc/readFeed?machineID=MACHINEID&channel=CHANNEL
```

| Request Parameter | Type | Description |
| --- | --- | --- |
| machineID | String | (Required) Target machine identifier, see [1.1.1. machineID Machine Identifier](/en/conventions/identifiers/#machineid) |
| channel | Int32 | Machine channel number. If not specified, it defaults to 0, i.e. the main channel |

Response Example

```json
{
  "overFeed": 100.0,
  "actFeed": 80.0,
  "cmdFeed": 80.0,
  "overRapid": 100.0,
  "channel": 2
}
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| overFeed | Float | Feed override [%] |
| actFeed | Float | Actual feed rate |
| cmdFeed | Float | Commanded feed rate |
| overRapid | Float | Rapid traverse override [%] |
| channel | Int32 | Machine channel number, present only when `channel` is included in the request and is not 0 |

### 2.5.1.8. readFeedAndSpindle - Read Feed and Spindle Speed Data {#readfeedandspindle}

CNC machines only.

```http
GET /api/cnc/readFeedAndSpindle?machineID=MACHINEID&channel=CHANNEL
```

| Request Parameter | Type | Description |
| --- | --- | --- |
| machineID | String | (Required) Target machine identifier, see [1.1.1. machineID Machine Identifier](/en/conventions/identifiers/#machineid) |
| channel | Int32 | Machine channel number. If not specified, it defaults to 0, i.e. the main channel |

Response Example

```json
{
  "overSpindle": 150.0,
  "actSpindle": 3000.0,
  "cmdSpindle": 3000.0,
  "overFeed": 100.0,
  "actFeed": 80.0,
  "cmdFeed": 80.0,
  "overRapid": 100.0,
  "channel": 2
}
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| overSpindle | Float | Spindle speed override [%] |
| actSpindle | Float | Actual spindle speed |
| cmdSpindle | Float | Commanded spindle speed |
| overFeed | Float | Feed override [%] |
| actFeed | Float | Actual feed rate |
| cmdFeed | Float | Commanded feed rate |
| overRapid | Float | Rapid traverse override [%] |
| channel | Int32 | Machine channel number, present only when `channel` is included in the request and is not 0 |

When there are multiple spindles, only the speed data of the first spindle is returned.

### 2.5.1.9. readLaserPower - Read Laser Power {#readlaserpower}

Laser cutting/welding machines only.

```http
GET /api/cnc/readLaserPower?machineID=MACHINEID
```

| Request Parameter | Type | Description |
| --- | --- | --- |
| machineID | String | (Required) Target machine identifier, see [1.1.1. machineID Machine Identifier](/en/conventions/identifiers/#machineid) |

Response Example

```json
{
  "preset": 100.0,
  "actual": 100.0
}
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| preset | Float | Preset power [%] |
| actual | Float | Actual power [%] |

### 2.5.1.10. readLoad - Read Load Data {#readload}

CNC machines only.

```http
GET /api/cnc/readLoad?machineID=MACHINEID&channel=CHANNEL
```

| Request Parameter | Type | Description |
| --- | --- | --- |
| machineID | String | (Required) Target machine identifier, see [1.1.1. machineID Machine Identifier](/en/conventions/identifiers/#machineid) |
| channel | Int32 | Machine channel number. If not specified, it defaults to 0, i.e. the main channel |

Response Example

```json
{
  "spindleLoad": [
      100.0,
      0.0],
  "axialLoad": [
      50.1,
      12.4,
      0.0],
  "channel": 2
}
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| spindleLoad | Float[] | Spindle load [%] |
| axialLoad | Float[] | Servo axis load [%] |
| channel | Int32 | Machine channel number, present only when `channel` is included in the request and is not 0 |

When there are multiple spindles, the entries in the spindle load data correspond in order to the first spindle, second spindle, and so on. The servo axis load values correspond one-to-one, in order, with the `axisName` values returned by [2.5.1.15. readPosition - Read Position Data](/en/http/direct-offset-plc/#readposition).

### 2.5.1.11. readLog - Read Log Information {#readlog}

Currently supported for Fanuc robots, ABB robots, and simulated machines.

```http
GET /api/cnc/readLog?machineID=MACHINEID
```

| Request Parameter | Type | Description |
| --- | --- | --- |
| machineID | String | (Required) Target machine identifier, see [1.1.1. machineID Machine Identifier](/en/conventions/identifiers/#machineid) |
| type | String | Type, possible values: Alarm (alarm log), Operation (operation log), Default (default), defaults to Default. ABB robots support Operation; Fanuc robots support Alarm; simulated machines support all types, and Default is equivalent to Operation. |
| count | Int32 | Number of log entries. Retrieves the specified number of most recent log entries; defaults to 0, meaning all logs are retrieved. |

Response Example (ABB robot, Operation)

```json
{
  "msgs": [
    "{\"SeqNo\":\"79\",\"Type\":\"I  \",\"Code\":\"10011\",\"Title\":\" 电机上电(ON) 状态\",\"Date\":\"2025-04-02 T 10:54:40\",\"Description\":\"系统处于电机上电 (ON) 状态。\",\"Args\":[]}",
    "{\"SeqNo\":\"78\",\"Type\":\"I  \",\"Code\":\"10010\",\"Title\":\" 电机下电 (OFF) 状态\",\"Date\":\"2025-04-02 T 10:54:39\",\"Description\":\"系统处于电机下电 (OFF) 状态。从手动模式切换至自动模式，或者程序执行过程中电机上电 (ON) 电路被打开后，系统就会进入此状态。\",\"Args\":[]}"]
}
```

Response Example (Fanuc robot, Alarm)

```json
{
  "msgs": [
    "{\"AlarmID\":24,\"AlarmNumber\":212,\"CauseAlarmID\":0,\"CauseAlarmNumber\":0,\"Severity\":38,\"Time\":\"2025-06-26T04:04:46\",\"AlarmMessage\":\"SYST-212 需要应用 DCS 参数\",\"CauseAlarmMessage\":\"\",\"SeverityMessage\":\"STOP.G\"}",
    "{\"AlarmID\":0,\"AlarmNumber\":0,\"CauseAlarmID\":0,\"CauseAlarmNumber\":0,\"Severity\":0,\"Time\":\"2025-06-26T04:04:46\",\"AlarmMessage\":\"重置\",\"CauseAlarmMessage\":\"\",\"SeverityMessage\":\"\"}"]
}
```

Response Example (simulated machine, Operation)

```json
{
  "msgs": [
    "2025-07-07 13:24:45 Status: WAIT",
    "2025-07-07 13:24:45 Machine power on"]
}
```

Response Example (simulated machine, Alarm)

```json
{
  "msgs": [
    "2025-07-07 13:25:05 Alarm: 102 ALARM 2, 13:25",
    "2025-07-07 13:25:05 Alarm: 101 ALARM 1, 13:25"
  ]
}
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| msgs | String[] | (Required) Log content. Note: the log content format differs between machine types. |
