---
title: "2.7. Data Analysis Interface"
sidebar:
  label: "2.7.1. Machine Data Analysis"
---


The data analysis interface is used to retrieve data analysis for a target machine or machine group within a specified time range.

Before using the data analysis interface, the gateway's local cache switch must be enabled (see the Bivrost Gateway Manual [5.12.2.3. Local Cache](https://docs.bivrost.cn/gateway/usage/settings)), to allow historical machine status data to be saved locally on the gateway.

Using the data analysis interface requires supplying a start timestamp and an end timestamp. The maximum span between the two is 31 days.

The maximum local retention period is 365 days. Therefore, the start time cannot be earlier than 365 days before the current time.

If the current timestamp is earlier than the supplied end timestamp, the current timestamp is automatically used as the end timestamp.

If the gateway has not received machine or machine group data for a period of time (data gap), the data returned by the data analysis interface may differ from the actual data. Common causes of data gaps include: the gateway's local cache not being enabled, the corresponding automatic collection task not being enabled, the gateway losing power, the gateway's network connection being interrupted, and the machine being offline.

## 2.7.1. Machine Data Analysis {#machine-analysis}

Machine data analysis is used to retrieve data analysis for a target machine within a specified time range, with base path `/api/analysis`.

### 2.7.1.1. oee — Machine OEE Data Analysis {#oee}

Retrieves machine OEE statistics for each grouping interval within a specified time range.

```http
GET /api/analysis/oee?machineID=MACHINEID&startUnix=STARTUNIX&endUnix=ENDUNIX&interval=INTERVAL
```

| Request Parameter | Type | Description |
| --- | --- | --- |
| machineID | String | (Required) Target machine identifier, see [1.1.1. machineID Machine Identifier](/en/conventions/identifiers/#machineid) |
| startUnix | Int64 | (Required) Start timestamp [seconds] |
| endUnix | Int64 | (Required) End timestamp [seconds] |
| interval | Int32 | Grouping interval [seconds]. If undefined, there is only a single grouping interval. |

Response example

```json
[
  {
    "machineName": "模拟机台 1",
    "startTime": "2022-04-28T14:30:00Z",
    "endTime": "2022-04-28T15:30:00Z",
    "availability": 83.33333,
    "offTime": 100,
    "waitTime": 200,
    "emergencyTime": 300,
    "autoRunTime": 3000,
    "manualTime": 0.0
  },
  {
    "machineName": "模拟机台 1",
    "startTime": "2022-04-28T15:30:00Z",
    "endTime": "2022-04-28T16:30:00Z",
    "availability": 0.0,
    "offTime": 0,
    "waitTime": 3600,
    "emergencyTime": 0,
    "autoRunTime": 0,
    "manualTime": 0
  }
]
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| machineName | String | (Required) Machine name, set in the "Add/Edit Device" window on the "Machine Configuration" page. |
| startTime | String | (Required) Grouping interval start time (UTC) |
| endTime | String | (Required) Grouping interval end time (UTC) |
| availability | Float | (Required) Availability rate [%] |
| offTime | Int64 | (Required) Off or offline time [seconds] |
| waitTime | Int64 | (Required) Idle time [seconds] |
| emergencyTime | Int64 | (Required) Emergency stop time [seconds] |
| autoRunTime | Int64 | (Required) Auto-run time [seconds] |
| manualTime | Int64 | (Required) Manual setup time [seconds] |

:::note[Note]
For details on machine OEE data, see the Bivrost Gateway Manual [6.1.1. Machine OEE Data](https://docs.bivrost.cn/gateway/reference/glossary#machine-oee). If status data is missing for a period between the start time and end time, the status for that missing period defaults to off or offline.
:::

### 2.7.1.2. alarm — Machine Alarm Data Analysis {#alarm}

Retrieves the machine alarm history within a specified time range.

```http
GET /api/analysis/alarm?machineID=MACHINEID&startUnix=STARTUNIX&endUnix=ENDUNIX
```

| Request Parameter | Type | Description |
| --- | --- | --- |
| machineID | String | (Required) Target machine identifier, see [1.1.1. machineID Machine Identifier](/en/conventions/identifiers/#machineid) |
| startUnix | Int64 | (Required) Start timestamp [seconds] |
| endUnix | Int64 | (Required) End timestamp [seconds] |

Response example

```json
[
  {
    "machineName": "模拟机台 1",
    "startTime": "2023-06-16T16:00:00Z",
    "endTime": "2023-06-16T16:00:10Z",
    "alarmMsg": "00:00 ALARM 1",
    "alarmLevel": "WRN"
  },
  {
    "machineName": "模拟机台 1",
    "startTime": "2023-06-16T16:00:00Z",
    "endTime": "2023-06-16T16:00:10.001Z",
    "alarmMsg": "00:00 ALARM 2",
    "alarmLevel": "WRN"
  },
  {
    "machineName": "模拟机台 1",
    "startTime": "2023-06-16T16:01:00.008Z",
    "endTime": "2023-06-16T16:01:50.019Z",
    "alarmMsg": "00:01 ALARM 1",
    "alarmLevel": "WRN"
  }
]
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| machineName | String | (Required) Machine name, set in the "Add/Edit Device" window on the "Machine Configuration" page. |
| startTime | String | (Required) Alarm start time (UTC) |
| endTime | String | (Required) Alarm end time (UTC) |
| alarmMsg | String | (Required) Alarm message |
| alarmLevel | String | (Required) Alarm level. In descending order of priority: Error (ERR), Warning (WRN), and Info (INF). Users can refer to the Bivrost Gateway Manual [5.5.7. Alarm Monitoring Settings](https://docs.bivrost.cn/gateway/usage/tasks#alarm-monitor) to set alarm levels by keyword and filter out alarms below the minimum alarm level; alarms without a configured level default to the Warning level. |

:::note[Note]
An alarm is recorded from the moment it appears until it is cleared, with its start time, end time, alarm message, and alarm level. If an alarm had already appeared and had not yet been cleared before the start timestamp, the start time of this alarm is taken as the time corresponding to the start timestamp.

If, at the time corresponding to the end timestamp, the alarm has not yet been cleared, the end time of this alarm is taken as the time corresponding to the end timestamp.

If alarm data is missing between the start time and end time, no alarms are assumed to have occurred during that missing period.
:::

### 2.7.1.3. count — Machine Count Data Analysis {#count}

Retrieves the cumulative machining count for each grouping interval within a specified time range.

```http
GET /api/analysis/count?machineID=MACHINEID&startUnix=STARTUNIX&endUnix=ENDUNIX&interval=INTERVAL
```

| Request Parameter | Type | Description |
| --- | --- | --- |
| machineID | String | (Required) Target machine identifier, see [1.1.1. machineID Machine Identifier](/en/conventions/identifiers/#machineid) |
| startUnix | Int64 | (Required) Start timestamp [seconds] |
| endUnix | Int64 | (Required) End timestamp [seconds] |
| interval | Int32 | Grouping interval [seconds]. If undefined, there is only a single grouping interval. |

Response example

```json
[
  {
    "machineName": "模拟机台 1",
    "startTime": "2022-04-28T14:30:00Z",
    "endTime": "2022-04-28T15:30:00Z",
    "count": 96
  },
  {
    "machineName": "模拟机台 1",
    "startTime": "2022-04-28T15:30:00Z",
    "endTime": "2022-04-28T16:30:00Z",
    "count": 0
  }
]
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| machineName | String | (Required) Machine name, set in the "Add/Edit Device" window on the "Machine Configuration" page. |
| startTime | String | (Required) Grouping interval start time (UTC) |
| endTime | String | (Required) Grouping interval end time (UTC) |
| count | Int32 | (Required) Cumulative machining count, the difference between the machine's cumulative machining count `cumulativeCount` at the start and end of the grouping interval |

### 2.7.1.4. overall — Machine Overall Data Analysis {#overall}

Retrieves the combined data for each grouping interval within a specified time range, including data from [2.7.1.1. oee — Machine OEE Data Analysis](#oee) and [2.7.1.3. count — Machine Count Data Analysis](#count).

```http
GET /api/analysis/overall?machineID=MACHINEID&startUnix=STARTUNIX&endUnix=ENDUNIX&interval=INTERVAL
```

| Request Parameter | Type | Description |
| --- | --- | --- |
| machineID | String | (Required) Target machine identifier, see [1.1.1. machineID Machine Identifier](/en/conventions/identifiers/#machineid) |
| startUnix | Int64 | (Required) Start timestamp [seconds] |
| endUnix | Int64 | (Required) End timestamp [seconds] |
| interval | Int32 | Grouping interval [seconds]. If undefined, there is only a single grouping interval. |

Response example

```json
[
  {
    "machineName": "模拟机台 1",
    "startTime": "2022-04-28T14:30:00Z",
    "endTime": "2022-04-28T15:30:00Z",
    "count": 96,
    "availability": 83.33333,
    "offTime": 100,
    "waitTime": 200,
    "emergencyTime": 300,
    "autoRunTime": 3000,
    "manualTime": 0.0
  },
  {
    "machineName": "模拟机台 1",
    "startTime": "2022-04-28T15:30:00Z",
    "endTime": "2022-04-28T16:30:00Z",
    "count": 0,
    "availability": 0.0,
    "offTime": 0,
    "waitTime": 3600,
    "emergencyTime": 0,
    "autoRunTime": 0,
    "manualTime": 0
  }
]
```

### 2.7.1.5. cycle — Machine Cycle Time Data Analysis {#cycle}

Retrieves the machine's cycle time data within a specified time range.

```http
GET /api/analysis/cycle?machineID=MACHINEID&startUnix=STARTUNIX&endUnix=ENDUNIX
```

| Request Parameter | Type | Description |
| --- | --- | --- |
| machineID | String | (Required) Target machine identifier, see [1.1.1. machineID Machine Identifier](/en/conventions/identifiers/#machineid) |
| startUnix | Int64 | (Required) Start timestamp [seconds] |
| endUnix | Int64 | (Required) End timestamp [seconds] |

Response example

```json
[
  {
    "machineName": "模拟机台 1",
    "startTime": "2025-05-23T06:35:44.046Z",
    "endTime": "2025-05-23T06:36:25.046Z",
    "lastCycleTime": 41,
    "mainPrgmName": "O6495",
    "machineID": "1"
  },
  {
    "machineName": "模拟机台 1",
    "startTime": "2025-05-23T06:36:25.072Z",
    "endTime": "2025-05-23T06:36:56.072Z",
    "lastCycleTime": 31,
    "mainPrgmName": "O6495",
    "machineID": "1"
  }
]
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| machineName | String | (Required) Machine name, set in the "Add/Edit Device" window on the "Machine Configuration" page. |
| startTime | String | (Required) Cycle start time (UTC) |
| endTime | String | (Required) Cycle end time (UTC) |
| lastCycleTime | Int32 | (Required) Cycle duration [seconds]; counts only auto-run time. |
| mainPrgmName | String | (Required) Name of the main program executed during the cycle |
