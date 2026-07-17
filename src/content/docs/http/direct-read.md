---
title: "2.5. 数据读写接口"
sidebar:
  label: "2.5.1. 直接读写 · 状态与数据"
---


通过数据读写接口可以通过网关读取、写入机台数据，或读取机组数据。数据读写接口分为两类，直接读写与缓存读取。

## 2.5.1. 直接读写 {#direct}

使用直接读写类接口，网关会立刻与目标机台通讯，获取或写入数据。

### 2.5.1.1. readAlarm 读取警报信息 {#readalarm}

```http
GET /api/cnc/readAlarm?machineID=MACHINEID
```

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| machineID | String | (必需)目标机台标识，详见 [1.1.1. machineID 机台标识](/conventions/identifiers/#machineid) |

返回示例

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

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| alarmMsg | String[] | (必需)机台当前警报内容。如无警报，返回空 Array。 |
| alarmLevel | String[] | (必需)警报级别，与警报内容按顺序对应。如无警报，返回空 Array。详见[警报级别](/conventions/variables/#alarm-level)。 |

:::note[注]
从 1.8.1 版本开始，警报时间被移除。如需获取机台警报的起始时间，可使用接口 [2.7.1.2. alarm 机台警报数据分析](/http/analysis-machine/#alarm)。
:::

### 2.5.1.2. readCNCStatus 读取机台状态 {#readcncstatus}

```http
GET /api/cnc/readCNCStatus?machineID=MACHINEID&channel=CHANNEL
```

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| machineID | String | (必需)目标机台标识，详见 [1.1.1. machineID 机台标识](/conventions/identifiers/#machineid) |
| channel | Int32 | 机台通道号，如不补充则默认为 0，即主通道 |

返回示例

```json
{
  "cncStatus": "MANUAL_EDIT",
  "alarmStatus": "ALARM",
  "alarmLevel": "WRN",
  "channel": 2
}
```

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| cncStatus | String | (必需)运行状态，详见[运行状态](/conventions/variables/#cnc-status) |
| alarmStatus | String | (必需)警报状态，详见[警报状态](/conventions/variables/#alarm-status) |
| alarmLevel | String | 警报级别，如有多个警报，取这些警报中的最高级别。如无警报，则不返回。详见[警报级别](/conventions/variables/#alarm-level) |
| channel | Int32 | 机台通道号，仅当请求中补充 channel 且不为 0 时出现 |

由网关后处理得到的修正运行状态 adjustedStatus，累计关机时间 offTime，累计待机时间 waitTime，累计急停时间 emergencyTime，累计自动运行时间 autoRunTime，累计调机时间 ManualTime 等，暂不支持 HTTP 协议。需要在开启自动采集任务后，通过接口 [2.5.2.1. readTaskData 读取机台任务数据](/http/cached-read/#readtaskdata)或 [2.5.2.2. batchReadTaskData 批量读取机台任务数据](/http/cached-read/#batchreadtaskdata)，或通过 MODBUS，MQTT，数据库等方式获取。

### 2.5.1.3. readCNCStatusDetails 读取机台状态详情 {#readcncstatusdetails}

此接口除了读取到与 [2.5.1.2. readCNCStatus 读取机台状态](#readcncstatus)相同的通用机台状态数据，还能获取到不通用的原始数据。

```http
GET /api/cnc/readCNCStatusDetails?machineID=MACHINEID&channel=CHANNEL
```

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| machineID | String | (必需)目标机台标识，详见 [1.1.1. machineID 机台标识](/conventions/identifiers/#machineid) |
| channel | Int32 | 机台通道号，如不补充则默认为 0，即主通道 |

返回示例

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

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| mode | String | 运行模式 |
| programStatus | String | 程序状态 |
| emergencyStatus | String | 急停状态，见[急停状态](/conventions/variables/#emergency-status) |
| dryRunStatus | String | 试运行状态，见[试运行状态](/conventions/variables/#dryrun-status) |
| cncStatus | String | (必需)运行状态，详见[运行状态](/conventions/variables/#cnc-status) |
| alarmStatus | String | (必需)警报状态，详见[警报状态](/conventions/variables/#alarm-status) |
| alarmLevel | String | 警报级别，如有多个警报，取这些警报中的最高级别。如无警报，则不返回。详见[警报级别](/conventions/variables/#alarm-level) |
| channel | Int32 | 机台通道号，仅当请求中补充 channel 且不为 0 时出现 |

由网关后处理得到的修正运行状态 adjustedStatus，累计关机时间 offTime，累计待机时间 waitTime，累计急停时间 emergencyTime，累计自动运行时间 autoRunTime，累计调机时间 ManualTime 等，暂不支持 HTTP 协议。需要在开启自动采集任务后，通过接口 [2.5.2.1. readTaskData 读取机台任务数据](/http/cached-read/#readtaskdata)或 [2.5.2.2. batchReadTaskData 批量读取机台任务数据](/http/cached-read/#batchreadtaskdata)，或通过 MODBUS，MQTT，数据库等方式获取。

### 2.5.1.4. readCount 读取加工计数 {#readcount}

```http
GET /api/cnc/readCount?machineID=MACHINEID
```

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| machineID | String | (必需)目标机台标识，详见 [1.1.1. machineID 机台标识](/conventions/identifiers/#machineid) |

返回示例

```json
{
  "count": 1052
}
```

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| count | Int32 | (必需)从机台系统获取的加工计数 |

由网关统计生成的机台累计加工计数 cumulativeCount，与当前监控时间内的加工计数 currentCount 暂不支持 HTTP 协议。需要在开启自动采集任务后，通过接口 [2.5.2.1. readTaskData 读取机台任务数据](/http/cached-read/#readtaskdata)或 [2.5.2.2. batchReadTaskData 批量读取机台任务数据](/http/cached-read/#batchreadtaskdata)，或通过 MODBUS，MQTT，数据库等方式获取。

### 2.5.1.5. readCurrentToolNumber 读取当前刀号 {#readcurrenttoolnumber}

```http
GET /api/cnc/readCurrentToolNumber?machineID=MACHINEID&channel=CHANNEL
```

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| machineID | String | (必需)目标机台标识，详见 [1.1.1. machineID 机台标识](/conventions/identifiers/#machineid) |
| channel | Int32 | 机台通道号，如不补充则默认为 0，即主通道 |

返回示例

```json
{
  "toolNumber": "6",
  "toolOffsetNum": "6",
  "channel": 2
}
```

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| toolNumber | String | (必需)当前刀号 |
| toolOffsetNum | String | 当前刀补号 |
| channel | Int32 | 机台通道号，仅当请求中补充 channel 且不为 0 时出现 |

### 2.5.1.6. readEnergyConsum 读取能耗数据 {#readenergyconsum}

目前支持部分新款 Brother 兄弟机型和模拟机台。

```http
GET /api/cnc/readEnergyConsum?machineID=MACHINEID
```

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| machineID | String | (必需)目标机台标识，详见 [1.1.1. machineID 机台标识](/conventions/identifiers/#machineid) |

返回示例

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

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| allServoAxes | Double | 所有伺服轴能耗[Wh] |
| coolantPump | Double | 冷却液泵能耗[Wh] |
| ctsPump | Double | CTS 泵能耗[Wh] |
| chipFlusherPump | Double | 切屑冲洗器泵能耗[Wh] |
| cyclonePump | Double | 离心式过滤器用泵能耗[Wh] |
| system24V | Double | 24V 系统能耗[Wh] |
| ncControl | Double | NC 控制能耗[Wh] |
| lcdBacklight | Double | LCD 背光能耗[Wh] |
| chipConveyor | Double | 排屑器能耗[Wh] |
| screwConveyor | Double | 螺旋排屑器能耗[Wh] |
| autoLubrication | Double | 自动注油设备（或自动注脂设备）能耗[Wh] |
| spindleCoolingFan | Double | 主轴冷却风扇能耗[Wh] |
| servoControl | Double | 伺服控制能耗[Wh] |

### 2.5.1.7. readFeed 读取进给数据 {#readfeed}

仅限激光切割机/焊接机。

```http
GET /api/cnc/readFeed?machineID=MACHINEID&channel=CHANNEL
```

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| machineID | String | (必需)目标机台标识，详见 [1.1.1. machineID 机台标识](/conventions/identifiers/#machineid) |
| channel | Int32 | 机台通道号，如不补充则默认为 0，即主通道 |

返回示例

```json
{
  "overFeed": 100.0,
  "actFeed": 80.0,
  "cmdFeed": 80.0,
  "overRapid": 100.0,
  "channel": 2
}
```

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| overFeed | Float | 进给倍率[%] |
| actFeed | Float | 实际进给速率 |
| cmdFeed | Float | 指令进给速率 |
| overRapid | Float | 快速倍率[%] |
| channel | Int32 | 机台通道号，仅当请求中补充 channel 且不为 0 时出现 |

### 2.5.1.8. readFeedAndSpindle 读取进给转速数据 {#readfeedandspindle}

仅限 CNC。

```http
GET /api/cnc/readFeedAndSpindle?machineID=MACHINEID&channel=CHANNEL
```

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| machineID | String | (必需)目标机台标识，详见 [1.1.1. machineID 机台标识](/conventions/identifiers/#machineid) |
| channel | Int32 | 机台通道号，如不补充则默认为 0，即主通道 |

返回示例

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

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| overSpindle | Float | 主轴转速倍率[%] |
| actSpindle | Float | 实际主轴转速 |
| cmdSpindle | Float | 指令主轴转速 |
| overFeed | Float | 进给倍率[%] |
| actFeed | Float | 实际进给速率 |
| cmdFeed | Float | 指令进给速率 |
| overRapid | Float | 快速倍率[%] |
| channel | Int32 | 机台通道号，仅当请求中补充 channel 且不为 0 时出现 |

当有多个主轴时，仅返回第一主轴转速数据。

### 2.5.1.9. readLaserPower 读取激光功率 {#readlaserpower}

仅限激光切割机/焊接机。

```http
GET /api/cnc/readLaserPower?machineID=MACHINEID
```

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| machineID | String | (必需)目标机台标识，详见 [1.1.1. machineID 机台标识](/conventions/identifiers/#machineid) |

返回示例

```json
{
  "preset": 100.0,
  "actual": 100.0
}
```

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| preset | Float | 预设功率[%] |
| actual | Float | 实际功率[%] |

### 2.5.1.10. readLoad 读取负载数据 {#readload}

仅限 CNC。

```http
GET /api/cnc/readLoad?machineID=MACHINEID&channel=CHANNEL
```

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| machineID | String | (必需)目标机台标识，详见 [1.1.1. machineID 机台标识](/conventions/identifiers/#machineid) |
| channel | Int32 | 机台通道号，如不补充则默认为 0，即主通道 |

返回示例

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

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| spindleLoad | Float[] | 主轴负载[%] |
| axialLoad | Float[] | 伺服轴负载[%] |
| channel | Int32 | 机台通道号，仅当请求中补充 channel 且不为 0 时出现 |

当有多个主轴时，主轴负载中数据对应依次为第一主轴，第二主轴。伺服轴负载与 [2.5.1.15. readPosition 读取坐标数据](/http/direct-offset-plc/#readposition)返回的 axisName 按顺序一一对应。

### 2.5.1.11. readLog 读取日志信息 {#readlog}

目前支持 Fanuc 机器人，ABB 机器人，模拟机台。

```http
GET /api/cnc/readLog?machineID=MACHINEID
```

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| machineID | String | (必需)目标机台标识，详见 [1.1.1. machineID 机台标识](/conventions/identifiers/#machineid) |
| type | String | 类型，范围：Alarm(警报日志)，Operation(操作日志)，Default（默认），默认为 Default。ABB 机器人支持 Operation；Fanuc 机器人支持 Alarm；模拟机台支持所有类型，Default 等同 Operation。 |
| count | Int32 | 日志数量，获取最新的指定数量的日志内容，默认为 0，即获取所有日志。 |

返回示例（ABB 机器人 Operation）

```json
{
  "msgs": [
    "{\"SeqNo\":\"79\",\"Type\":\"I  \",\"Code\":\"10011\",\"Title\":\" 电机上电(ON) 状态\",\"Date\":\"2025-04-02 T 10:54:40\",\"Description\":\"系统处于电机上电 (ON) 状态。\",\"Args\":[]}",
    "{\"SeqNo\":\"78\",\"Type\":\"I  \",\"Code\":\"10010\",\"Title\":\" 电机下电 (OFF) 状态\",\"Date\":\"2025-04-02 T 10:54:39\",\"Description\":\"系统处于电机下电 (OFF) 状态。从手动模式切换至自动模式，或者程序执行过程中电机上电 (ON) 电路被打开后，系统就会进入此状态。\",\"Args\":[]}"]
}
```

返回示例（Fanuc 机器人 Alarm）

```json
{
  "msgs": [
    "{\"AlarmID\":24,\"AlarmNumber\":212,\"CauseAlarmID\":0,\"CauseAlarmNumber\":0,\"Severity\":38,\"Time\":\"2025-06-26T04:04:46\",\"AlarmMessage\":\"SYST-212 需要应用 DCS 参数\",\"CauseAlarmMessage\":\"\",\"SeverityMessage\":\"STOP.G\"}",
    "{\"AlarmID\":0,\"AlarmNumber\":0,\"CauseAlarmID\":0,\"CauseAlarmNumber\":0,\"Severity\":0,\"Time\":\"2025-06-26T04:04:46\",\"AlarmMessage\":\"重置\",\"CauseAlarmMessage\":\"\",\"SeverityMessage\":\"\"}"]
}
```

返回示例（模拟机台 Operation）

```json
{
  "msgs": [
    "2025-07-07 13:24:45 Status: WAIT",
    "2025-07-07 13:24:45 Machine power on"]
}
```

返回示例（模拟机台 Alarm）

```json
{
  "msgs": [
    "2025-07-07 13:25:05 Alarm: 102 ALARM 2, 13:25",
    "2025-07-07 13:25:05 Alarm: 101 ALARM 1, 13:25"
  ]
}
```

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| msgs | String[] | (必需)日志内容。注：不同机台的日志内容格式不同。 |
