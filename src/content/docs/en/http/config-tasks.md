---
title: "2.9.5. Task Configuration Interface"
sidebar:
  label: "2.9.5. Task Configuration"
---


The task configuration interface is used to retrieve or modify task configuration. For details on task configuration, see the Bivrost Gateway Manual [5.5. Task Configuration](https://docs.bivrost.cn/gateway/usage/tasks).

## 2.9.5.1. machine-task-interval-settings Get Machine Task Interval Settings {#machine-task-interval-settings}

This interface has no request parameters.

```http
GET /api/config/machine-task-interval-settings
```

Response example

```json
{
  "alarm": 5000,
  "machineStatus": 5000,
  "count": 5000,
  "currentToolNo": 5000,
  "energyConsumption": 60000,
  "feedAndSpindle": 5000,
  "laserPower": 5000,
  "load": 5000,
  "logHistory": 5000,
  "overload": 100,
  "plcData": 5000,
  "position": 5000,
  "currentProgramBlock": 5000,
  "programInfo": 5000,
  "machineTimeData": 5000,
  "toolLife": 5000,
  "toolOffset": 5000,
  "alarmHistory": 5000,
  "cycleData": 5000,
  "oee": 5000
}
```

The response parameters are shown in the table below:

### Machine Task Interval Settings Parameters {#machine-interval-params}

| Parameter | Type | Description |
| --- | --- | --- |
| alarm | Int32 | Alarm information interval (milliseconds) |
| machineStatus | Int32 | Machine status interval (milliseconds) |
| count | Int32 | Machining count interval (milliseconds) |
| currentToolNo | Int32 | Current tool number interval (milliseconds) |
| energyConsumption | Int32 | Energy consumption interval (milliseconds) |
| feedAndSpindle | Int32 | Feed rate and spindle speed data interval (milliseconds) |
| laserPower | Int32 | Laser power interval (milliseconds) |
| load | Int32 | Load data interval (milliseconds) |
| logHistory | Int32 | Log history interval (milliseconds) |
| overload | Int32 | Overload monitoring interval (milliseconds) |
| plcData | Int32 | PLC data interval (milliseconds) |
| position | Int32 | Position data interval (milliseconds) |
| currentProgramBlock | Int32 | Current program block interval (milliseconds) |
| programInfo | Int32 | Machining program information interval (milliseconds) |
| machineTimeData | Int32 | Machine time data interval (milliseconds) |
| toolLife | Int32 | Tool life interval (milliseconds) |
| toolOffset | Int32 | Tool offset interval (milliseconds) |
| alarmHistory | Int32 | Alarm history interval (milliseconds) |
| cycleData | Int32 | Cycle time data interval (milliseconds) |
| oee | Int32 | OEE monitoring interval (milliseconds) |

## 2.9.5.2. update-machine-task-interval-settings Modify Machine Task Interval Settings {#update-machine-task-interval-settings}

Modifies the machine task interval settings and returns the updated settings.

```http
POST /api/config/update-machine-task-interval-settings
```

Request body example

```json
{
  "alarm": 6000,
  "machineStatus": 8000
}
```

For request parameters, see [Machine Task Interval Settings Parameters](#machine-interval-params). Parameters not included in the request body retain their original values.

Response example

```json
{
  "alarm": 6000,
  "machineStatus": 8000,
  "count": 5000,
  "currentToolNo": 5000,
  "energyConsumption": 60000,
  "feedAndSpindle": 5000,
  "laserPower": 5000,
  "load": 5000,
  "logHistory": 5000,
  "overload": 100,
  "plcData": 5000,
  "position": 5000,
  "currentProgramBlock": 5000,
  "programInfo": 5000,
  "machineTimeData": 5000,
  "toolLife": 5000,
  "toolOffset": 5000,
  "alarmHistory": 5000,
  "cycleData": 5000,
  "oee": 5000
}
```

For response parameters, see [Machine Task Interval Settings Parameters](#machine-interval-params).

## 2.9.5.3. group-task-interval-settings Get Group Task Interval Settings {#group-task-interval-settings}

This interface has no request parameters.

```http
GET /api/config/group-task-interval-settings
```

Response example

```json
{
  "count": 5000,
  "oee": 5000,
  "cumulativeStatusTime": 5000
}
```

The response parameters are shown in the table below:

### Group Task Interval Settings Parameters {#group-interval-params}

| Parameter | Type | Description |
| --- | --- | --- |
| count | Int32 | Machining count interval (milliseconds) |
| oee | Int32 | OEE monitoring interval (milliseconds) |
| cumulativeStatusTime | Int32 | Cumulative status time (milliseconds) |

## 2.9.5.4. update-group-task-interval-settings Modify Group Task Interval Settings {#update-group-task-interval-settings}

Modifies the group task interval settings and returns the updated settings.

```http
POST /api/config/update-group-task-interval-settings
```

Request body example

```json
{
  "count": 3000,
  "oee": 2000,
  "cumulativeStatusTime": 1000
}
```

For request parameters, see [Group Task Interval Settings Parameters](#group-interval-params).

Response example

```json
{
  "count": 3000,
  "oee": 2000,
  "cumulativeStatusTime": 1000
}
```

For response parameters, see [Group Task Interval Settings Parameters](#group-interval-params).

## 2.9.5.5. oee-monitoring-settings Get OEE Monitoring Settings {#oee-monitoring-settings}

This interface has no request parameters.

```http
GET /api/config/oee-monitoring-settings
```

Response example

```json
{
  "monitorMode": "Scheduled Reset",
  "windowSize": 3600,
  "resetTime": "00:00",
  "availabilityMode": "Autorun Time / Total Time",
  "breakTimeInterval": ""
}
```

The response parameters are shown in the table below:

### OEE Monitoring Settings Parameters {#oee-params}

| Parameter | Type | Description |
| --- | --- | --- |
| monitorMode | String | Monitoring mode; see [monitorMode Monitoring Mode](#monitor-mode) for details. |
| windowSize | Int32 | Window duration (seconds); effective in real-time window mode. |
| resetTime | String | Reset time (hour:minute); effective in scheduled reset mode. |
| availabilityMode | String | Availability rate calculation method; see [availabilityMode Availability Rate Calculation Method](#availability-mode) for details. |
| breakTimeInterval | String | Break time interval (hour:minute-hour:minute) |

### monitorMode Monitoring Mode {#monitor-mode}

| Option | Description |
| --- | --- |
| Scheduled Reset | Scheduled reset |
| Time Window | Real-time window |

### availabilityMode Availability Rate Calculation Method {#availability-mode}

| Option | Description |
| --- | --- |
| Autorun Time / Total Time | Autorun time / total time |
| Autorun Time / (Total Time - Off Time) | Autorun time / (total time - off time) |
| Autorun Time / (Total Time - Off Time - Manual Time) | Autorun time / (total time - off time - manual time) |
| Autorun Time / (Total Time - Break Time) | Autorun time / (total time - break time) |

## 2.9.5.6. update-oee-monitoring-settings Modify OEE Monitoring Settings {#update-oee-monitoring-settings}

Modifies the OEE monitoring settings and returns the updated settings.

```http
POST /api/config/update-oee-monitoring-settings
```

Request body example

```json
{
  "monitorMode": "Time Window",
  "windowSize": 6000,
  "resetTime": "00:00;22:00;01:00;2:00",
  "availabilityMode": "Autorun Time / (Total Time - Break Time)",
  "breakTimeInterval": "08:00-09:00;11:30-12:30"
}
```

For request parameters, see [OEE Monitoring Settings Parameters](#oee-params).

Response example

```json
{
  "monitorMode": "Time Window",
  "windowSize": 6000,
  "resetTime": "00:00;01:00;2:00;22:00;",
  "availabilityMode": "Autorun Time / (Total Time - Break Time)",
  "breakTimeInterval": "08:00-09:00;11:30-12:30;"
}
```

For response parameters, see [OEE Monitoring Settings Parameters](#oee-params).

## 2.9.5.7. tool-life-monitoring-settings Get Tool Life Monitoring Settings {#tool-life-monitoring-settings}

This interface has no request parameters.

```http
GET /api/config/tool-life-monitoring-settings
```

Response example

```json
{
  "enableToolLifeDetails": false
}
```

The response parameters are shown in the table below:

### Tool Life Monitoring Settings Parameters {#toollife-params}

| Parameter | Type | Description |
| --- | --- | --- |
| enableToolLifeDetails | Bool | Tool life details; true = enabled, false = disabled. |

## 2.9.5.8. update-tool-life-monitoring-settings Modify Tool Life Monitoring Settings {#update-tool-life-monitoring-settings}

Modifies the tool life monitoring settings and returns the updated settings.

```http
POST /api/config/update-tool-life-monitoring-settings
```

Request body example

```json
{
  "enableToolLifeDetails": true
}
```

For request parameters, see [Tool Life Monitoring Settings Parameters](#toollife-params).

Response example

```json
{
  "enableToolLifeDetails": true
}
```

For response parameters, see [Tool Life Monitoring Settings Parameters](#toollife-params).

## 2.9.5.9. count-monitoring-settings Get Machining Count Monitoring Settings {#count-monitoring-settings}

This interface has no request parameters.

```http
GET /api/config/count-monitoring-settings
```

Response example

```json
{
  "monitorMode": "Time Window",
  "windowSize": 3600,
  "resetTime": "00:00"
}
```

The response parameters are shown in the table below:

### Machining Count Monitoring Settings Parameters {#count-params}

| Parameter | Type | Description |
| --- | --- | --- |
| monitorMode | String | Monitoring mode; see [monitorMode Monitoring Mode](#monitor-mode) for details. |
| windowSize | Int32 | Window duration (seconds); effective in real-time window mode. |
| resetTime | String[] | Reset time (hour:minute); effective in scheduled reset mode. |

## 2.9.5.10. update-count-monitoring-settings Modify Machining Count Monitoring Settings {#update-count-monitoring-settings}

Modifies the machining count monitoring settings and returns the updated settings.

```http
POST /api/config/update-count-monitoring-settings
```

Request body example

```json
{
  "monitorMode": "Scheduled Reset",
  "windowSize": 36000,
  "resetTime": "23:00;3:24;15:28;12:22"
}
```

For request parameters, see [Machining Count Monitoring Settings Parameters](#count-params).

Response example

```json
{
  "monitorMode": "Scheduled Reset",
  "windowSize": 36000,
  "resetTime": "3:24;12:22;15:28;23:00;"
}
```

For response parameters, see [Machining Count Monitoring Settings Parameters](#count-params).

## 2.9.5.11. overload-monitoring-settings Get Overload Monitoring Settings {#overload-monitoring-settings}

This interface has no request parameters.

```http
GET /api/config/overload-monitoring-settings
```

Response example

```json
{
  "spindleLoadUpperLimit": 100.0
}
```

The response parameters are shown in the table below:

### Overload Monitoring Settings Parameters {#overload-params}

| Parameter | Type | Description |
| --- | --- | --- |
| spindleLoadUpperLimit | Float | Spindle load upper limit (%) |

## 2.9.5.12. update-overload-monitoring-settings Modify Overload Monitoring Settings {#update-overload-monitoring-settings}

Modifies the overload monitoring settings and returns the updated settings.

```http
POST /api/config/update-overload-monitoring-settings
```

Request body example

```json
{
  "spindleLoadUpperLimit": 80.0
}
```

For request parameters, see [Overload Monitoring Settings Parameters](#overload-params).

Response example

```json
{
  "spindleLoadUpperLimit": 80.0
}
```

For response parameters, see [Overload Monitoring Settings Parameters](#overload-params).

## 2.9.5.13. alarm-monitoring-settings Get Alarm Monitoring Settings {#alarm-monitoring-settings}

This interface has no request parameters.

```http
GET /api/config/alarm-monitoring-settings
```

Response example

```json
{
  "mininumAlarmLevel": "Warning"
}
```

The response parameters are shown in the table below:

### Alarm Monitoring Settings Parameters {#alarm-params}

| Parameter | Type | Description |
| --- | --- | --- |
| mininumAlarmLevel | String | Minimum alarm level; see [mininumAlarmLevel Minimum Alarm Level](#minimum-alarm-level) for details. |
| infoLevel | String | Info-level keywords; not returned means not set |
| errorLevel | String | Error-level keywords; not returned means not set |

### mininumAlarmLevel Minimum Alarm Level {#minimum-alarm-level}

| Option | Description |
| --- | --- |
| Information | Information |
| Warning | Warning |
| Error | Error |

## 2.9.5.14. update-alarm-monitoring-settings Modify Alarm Monitoring Settings {#update-alarm-monitoring-settings}

Modifies the alarm monitoring settings and returns the updated settings.

```http
POST /api/config/update-alarm-monitoring-settings
```

Request body example

```json
{
  "mininumAlarmLevel": "Error",
  "infoLevel": "消息;提示;Inf",
  "errorLevel": "错误;錯誤;Err"
}
```

For request parameters, see [Alarm Monitoring Settings Parameters](#alarm-params).

Response example

```json
{
  "mininumAlarmLevel": "Error",
  "infoLevel": "消息;提示;Inf",
  "errorLevel": "错误;錯誤;Err"
}
```

For response parameters, see [Alarm Monitoring Settings Parameters](#alarm-params).

## 2.9.5.15. machine-status-monitoring-settings Get Machine Status Monitoring Settings {#machine-status-monitoring-settings}

This interface has no request parameters.

```http
GET /api/config/machine-status-monitoring-settings
```

Response example

```json
{
  "enableStatusDetails": false,
  "enableAdjustedManualStatus": false,
  "maxManualPauseTime": 600,
  "enableStatusConversion": false
}
```

The response parameters are shown in the table below:

### Machine Status Monitoring Settings Parameters {#status-params}

| Parameter | Type | Description |
| --- | --- | --- |
| enableStatusDetails | Bool | Status details; true = enabled, false = disabled. |
| enableAdjustedManualStatus | Bool | Manual status adjustment; true = enabled, false = disabled. |
| maxManualPauseTime | Int32 | Maximum manual pause time (seconds) |
| enableStatusConversion | Bool | Status conversion; true = enabled, false = disabled. |
| statusConversionSettings | String | Status conversion; not returned means not set. |

## 2.9.5.16. update-machine-status-monitoring-settings Modify Machine Status Monitoring Settings {#update-machine-status-monitoring-settings}

Modifies the machine status monitoring settings and returns the updated settings.

```http
POST /api/config/update-machine-status-monitoring-settings
```

Request body example

```json
{
  "enableStatusDetails": true,
  "enableAdjustedManualStatus": true,
  "maxManualPauseTime": 300,
  "enableStatusConversion": true,
  "statusConversionSettings": "CNCStatus_cncStatus = \"MANUAL_MDI_RUN\" | AUTO_RUN"
}
```

For request parameters, see [Machine Status Monitoring Settings Parameters](#status-params).

Response example

```json
{
  "enableStatusDetails": true,
  "enableAdjustedManualStatus": true,
  "maxManualPauseTime": 300,
  "enableStatusConversion": true,
  "statusConversionSettings": "CNCStatus_cncStatus = \"MANUAL_MDI_RUN\" | AUTO_RUN"
}
```

For response parameters, see [Machine Status Monitoring Settings Parameters](#status-params).
