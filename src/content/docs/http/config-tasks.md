---
title: "2.9.5. 任务配置接口"
sidebar:
  label: "2.9.5. 任务配置"
---


任务配置接口用于获取或修改任务配置。任务配置相关说明可以参考《说明书》[5.5. 任务配置](https://docs.bivrost.cn/gateway/usage/tasks)。

## 2.9.5.1. machine-task-interval-settings 获取机台任务间隔设置 {#machine-task-interval-settings}

此接口无请求参数。

```http
GET /api/config/machine-task-interval-settings
```

返回示例

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

返回参数如下表：

### 机台任务间隔设置参数 {#machine-interval-params}

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| alarm | Int32 | 警报信息间隔(毫秒) |
| machineStatus | Int32 | 机台状态间隔(毫秒) |
| count | Int32 | 加工计数间隔(毫秒) |
| currentToolNo | Int32 | 当前刀号间隔(毫秒) |
| energyConsumption | Int32 | 能耗间隔(毫秒) |
| feedAndSpindle | Int32 | 进给转速数据间隔(毫秒) |
| laserPower | Int32 | 激光功率间隔(毫秒) |
| load | Int32 | 负载数据间隔(毫秒) |
| logHistory | Int32 | 日志历史间隔(毫秒) |
| overload | Int32 | 过载监控间隔(毫秒) |
| plcData | Int32 | PLC 数据间隔(毫秒) |
| position | Int32 | 坐标数据间隔(毫秒) |
| currentProgramBlock | Int32 | 当前程序段间隔(毫秒) |
| programInfo | Int32 | 加工程序信息间隔(毫秒) |
| machineTimeData | Int32 | 机台时间数据间隔(毫秒) |
| toolLife | Int32 | 刀具寿命间隔(毫秒) |
| toolOffset | Int32 | 刀具补偿间隔(毫秒) |
| alarmHistory | Int32 | 警报历史间隔(毫秒) |
| cycleData | Int32 | 节拍数据间隔(毫秒) |
| oee | Int32 | OEE 监控间隔(毫秒) |

## 2.9.5.2. update-machine-task-interval-settings 修改机台任务间隔设置 {#update-machine-task-interval-settings}

修改机台任务间隔设置并返回修改后的设置。

```http
POST /api/config/update-machine-task-interval-settings
```

请求体示例

```json
{
  "alarm": 6000,
  "machineStatus": 8000
}
```

请求参数见[机台任务间隔设置参数](#machine-interval-params)。不在请求体中的参数保持原来数值。

返回示例

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

返回参数见[机台任务间隔设置参数](#machine-interval-params)。

## 2.9.5.3. group-task-interval-settings 获取机组任务间隔设置 {#group-task-interval-settings}

此接口无请求参数。

```http
GET /api/config/group-task-interval-settings
```

返回示例

```json
{
  "count": 5000,
  "oee": 5000,
  "cumulativeStatusTime": 5000
}
```

返回参数如下表：

### 机组任务间隔设置参数 {#group-interval-params}

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| count | Int32 | 加工计数间隔(毫秒) |
| oee | Int32 | OEE 监控间隔(毫秒) |
| cumulativeStatusTime | Int32 | 累计状态时间(毫秒) |

## 2.9.5.4. update-group-task-interval-settings 修改机组任务间隔设置 {#update-group-task-interval-settings}

修改机组任务间隔设置并返回修改后的设置。

```http
POST /api/config/update-group-task-interval-settings
```

请求体示例

```json
{
  "count": 3000,
  "oee": 2000,
  "cumulativeStatusTime": 1000
}
```

请求参数见[机组任务间隔设置参数](#group-interval-params)。

返回示例

```json
{
  "count": 3000,
  "oee": 2000,
  "cumulativeStatusTime": 1000
}
```

返回参数见[机组任务间隔设置参数](#group-interval-params)。

## 2.9.5.5. oee-monitoring-settings 获取 OEE 监控设置 {#oee-monitoring-settings}

此接口无请求参数。

```http
GET /api/config/oee-monitoring-settings
```

返回示例

```json
{
  "monitorMode": "Scheduled Reset",
  "windowSize": 3600,
  "resetTime": "00:00",
  "availabilityMode": "Autorun Time / Total Time",
  "breakTimeInterval": ""
}
```

返回参数如下表：

### OEE 监控设置参数 {#oee-params}

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| monitorMode | String | 监控模式，详见 [monitorMode 监控模式](#monitor-mode)。 |
| windowSize | Int32 | 窗口时间(秒)，实时窗口模式下生效。 |
| resetTime | String | 重置时刻(小时:分钟)，到点重置模式下生效。 |
| availabilityMode | String | 开动率计算方式，详见 [availabilityMode 开动率计算方式](#availability-mode)。 |
| breakTimeInterval | String | 休息时间段(小时:分钟-小时:分钟) |

### monitorMode 监控模式 {#monitor-mode}

| 选项 | 说明 |
| --- | --- |
| Scheduled Reset | 到点重置 |
| Time Window | 实时窗口 |

### availabilityMode 开动率计算方式 {#availability-mode}

| 选项 | 说明 |
| --- | --- |
| Autorun Time / Total Time | 运行时间/总时间 |
| Autorun Time / (Total Time - Off Time) | 运行时间/（总时间-关机时间） |
| Autorun Time / (Total Time - Off Time - Manual Time) | 运行时间/（总时间-关机时间-调机时间） |
| Autorun Time / (Total Time - Break Time) | 运行时间/（总时间-休息时间） |

## 2.9.5.6. update-oee-monitoring-settings 修改 OEE 监控设置 {#update-oee-monitoring-settings}

修改 OEE 监控设置并返回修改后的设置。

```http
POST /api/config/update-oee-monitoring-settings
```

请求体示例

```json
{
  "monitorMode": "Time Window",
  "windowSize": 6000,
  "resetTime": "00:00;22:00;01:00;2:00",
  "availabilityMode": "Autorun Time / (Total Time - Break Time)",
  "breakTimeInterval": "08:00-09:00;11:30-12:30"
}
```

请求参数见 [OEE 监控设置参数](#oee-params)。

返回示例

```json
{
  "monitorMode": "Time Window",
  "windowSize": 6000,
  "resetTime": "00:00;01:00;2:00;22:00;",
  "availabilityMode": "Autorun Time / (Total Time - Break Time)",
  "breakTimeInterval": "08:00-09:00;11:30-12:30;"
}
```

返回参数见 [OEE 监控设置参数](#oee-params)。

## 2.9.5.7. tool-life-monitoring-settings 获取刀具寿命监控设置 {#tool-life-monitoring-settings}

此接口无请求参数。

```http
GET /api/config/tool-life-monitoring-settings
```

返回示例

```json
{
  "enableToolLifeDetails": false
}
```

返回参数如下表：

### 刀具寿命监控设置参数 {#toollife-params}

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| enableToolLifeDetails | Bool | 刀具寿命详情，true=开启，false=关闭。 |

## 2.9.5.8. update-tool-life-monitoring-settings 修改刀具寿命监控设置 {#update-tool-life-monitoring-settings}

修改刀具寿命监控设置并返回修改后的设置。

```http
POST /api/config/update-tool-life-monitoring-settings
```

请求体示例

```json
{
  "enableToolLifeDetails": true
}
```

请求参数见[刀具寿命监控设置参数](#toollife-params)。

返回示例

```json
{
  "enableToolLifeDetails": true
}
```

返回参数见[刀具寿命监控设置参数](#toollife-params)。

## 2.9.5.9. count-monitoring-settings 获取加工计数监控设置 {#count-monitoring-settings}

此接口无请求参数。

```http
GET /api/config/count-monitoring-settings
```

返回示例

```json
{
  "monitorMode": "Time Window",
  "windowSize": 3600,
  "resetTime": "00:00"
}
```

返回参数如下表：

### 加工计数监控设置参数 {#count-params}

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| monitorMode | String | 监控模式，详见 [monitorMode 监控模式](#monitor-mode)。 |
| windowSize | Int32 | 窗口时间(秒)，实时窗口模式下生效。 |
| resetTime | String[] | 重置时刻(小时:分钟)，到点重置模式下生效。 |

## 2.9.5.10. update-count-monitoring-settings 修改加工计数监控设置 {#update-count-monitoring-settings}

修改加工计数监控设置并返回修改后的设置。

```http
POST /api/config/update-count-monitoring-settings
```

请求体示例

```json
{
  "monitorMode": "Scheduled Reset",
  "windowSize": 36000,
  "resetTime": "23:00;3:24;15:28;12:22"
}
```

请求参数见[加工计数监控设置参数](#count-params)。

返回示例

```json
{
  "monitorMode": "Scheduled Reset",
  "windowSize": 36000,
  "resetTime": "3:24;12:22;15:28;23:00;"
}
```

返回参数见[加工计数监控设置参数](#count-params)。

## 2.9.5.11. overload-monitoring-settings 获取过载监控设置 {#overload-monitoring-settings}

此接口无请求参数。

```http
GET /api/config/overload-monitoring-settings
```

返回示例

```json
{
  "spindleLoadUpperLimit": 100.0
}
```

返回参数如下表：

### 过载监控设置参数 {#overload-params}

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| spindleLoadUpperLimit | Float | 主轴负载上限(%) |

## 2.9.5.12. update-overload-monitoring-settings 修改过载监控设置 {#update-overload-monitoring-settings}

修改过载监控设置并返回修改后的设置。

```http
POST /api/config/update-overload-monitoring-settings
```

请求体示例

```json
{
  "spindleLoadUpperLimit": 80.0
}
```

请求参数见[过载监控设置参数](#overload-params)。

返回示例

```json
{
  "spindleLoadUpperLimit": 80.0
}
```

返回参数见[过载监控设置参数](#overload-params)。

## 2.9.5.13. alarm-monitoring-settings 获取警报监控设置 {#alarm-monitoring-settings}

此接口无请求参数。

```http
GET /api/config/alarm-monitoring-settings
```

返回示例

```json
{
  "mininumAlarmLevel": "Warning"
}
```

返回参数如下表：

### 警报监控设置参数 {#alarm-params}

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| mininumAlarmLevel | String | 最低报警级别，详见 [mininumAlarmLevel 最低报警级别](#minimum-alarm-level)。 |
| infoLevel | String | 消息级别关键词，不返回代表未设置 |
| errorLevel | String | 错误级别关键词，不返回代表未设置 |

### mininumAlarmLevel 最低报警级别 {#minimum-alarm-level}

| 选项 | 说明 |
| --- | --- |
| Information | 消息 |
| Warning | 警告 |
| Error | 错误 |

## 2.9.5.14. update-alarm-monitoring-settings 修改警报监控设置 {#update-alarm-monitoring-settings}

修改警报监控设置并返回修改后的设置。

```http
POST /api/config/update-alarm-monitoring-settings
```

请求体示例

```json
{
  "mininumAlarmLevel": "Error",
  "infoLevel": "消息;提示;Inf",
  "errorLevel": "错误;錯誤;Err"
}
```

请求参数见[警报监控设置参数](#alarm-params)。

返回示例

```json
{
  "mininumAlarmLevel": "Error",
  "infoLevel": "消息;提示;Inf",
  "errorLevel": "错误;錯誤;Err"
}
```

返回参数见[警报监控设置参数](#alarm-params)。

## 2.9.5.15. machine-status-monitoring-settings 获取机台状态监控设置 {#machine-status-monitoring-settings}

此接口无请求参数。

```http
GET /api/config/machine-status-monitoring-settings
```

返回示例

```json
{
  "enableStatusDetails": false,
  "enableAdjustedManualStatus": false,
  "maxManualPauseTime": 600,
  "enableStatusConversion": false
}
```

返回参数如下表：

### 机台状态监控设置参数 {#status-params}

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| enableStatusDetails | Bool | 状态详情，true=开启，false=关闭。 |
| enableAdjustedManualStatus | Bool | 调机状态修正，true=开启，false=关闭。 |
| maxManualPauseTime | Int32 | 最长调机暂停时间(秒) |
| enableStatusConversion | Bool | 转换状态，true=开启，false=关闭。 |
| statusConversionSettings | String | 状态转换，不返回代表未设置。 |

## 2.9.5.16. update-machine-status-monitoring-settings 修改机台状态监控设置 {#update-machine-status-monitoring-settings}

修改机台状态监控设置并返回修改后的设置。

```http
POST /api/config/update-machine-status-monitoring-settings
```

请求体示例

```json
{
  "enableStatusDetails": true,
  "enableAdjustedManualStatus": true,
  "maxManualPauseTime": 300,
  "enableStatusConversion": true,
  "statusConversionSettings": "CNCStatus_cncStatus = \"MANUAL_MDI_RUN\" | AUTO_RUN"
}
```

请求参数见[机台状态监控设置参数](#status-params)。

返回示例

```json
{
  "enableStatusDetails": true,
  "enableAdjustedManualStatus": true,
  "maxManualPauseTime": 300,
  "enableStatusConversion": true,
  "statusConversionSettings": "CNCStatus_cncStatus = \"MANUAL_MDI_RUN\" | AUTO_RUN"
}
```

返回参数见[机台状态监控设置参数](#status-params)。
