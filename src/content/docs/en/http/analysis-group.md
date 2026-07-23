---
title: "2.7.2. Machine Group Data Analysis"
sidebar:
  label: "2.7.2. Machine Group Data Analysis"
---


Machine group data analysis is used to retrieve data analysis for a target machine or machine group within a specified time range. Base address: `/api/group-analysis`. It requires the group identifier variable groupID in place of the machine identifier machineID.

## 2.7.2.1. oee Machine Group OEE Data Analysis {#oee}

Retrieves the OEE data of all machines in the machine group, for each grouping interval, within the specified time range.

```http
GET /api/group-analysis/oee?groupID=GROUPID&startUnix=STARTUNIX&endUnix=ENDUNIX&interval=INTERVAL
```

| Request Parameter | Type | Description |
| --- | --- | --- |
| groupID | String | (Required) Target group identifier. See [1.1.2. groupID Group Identifier](/en/conventions/identifiers/#groupid) |
| startUnix | Int64 | (Required) Start timestamp [seconds] |
| endUnix | Int64 | (Required) End timestamp [seconds] |
| interval | Int32 | Grouping interval [seconds]. If undefined, there is only a single grouping interval. |

Response example

```json
[
  {
    "machineID": "1010",
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
    "machineID": "1010",
    "machineName": "模拟机台 1",
    "startTime": "2022-04-28T15:30:00Z",
    "endTime": "2022-04-28T16:30:00Z",
    "availability": 0.0,
    "offTime": 0,
    "waitTime": 3600,
    "emergencyTime": 0,
    "autoRunTime": 0,
    "manualTime": 0
  },
  {
    "machineID": "1011",
    "machineName": "模拟机台 2",
    "startTime": "2022-04-28T14:30:00Z",
    "endTime": "2022-04-28T15:30:00Z",
    "availability": 80.55556,
    "offTime": 150,
    "waitTime": 250,
    "emergencyTime": 300,
    "autoRunTime": 2900,
    "manualTime": 0.0
  },
  {
    "machineID": "1011",
    "machineName": "模拟机台 2",
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
| machineID | String | (Required) Machine machineID. See [1.1.1. machineID Machine Identifier](/en/conventions/identifiers/#machineid) |
| machineName | String | (Required) Machine name, configured in the "Add/Edit Device" dialog on the "Machine Configuration" page. |
| startTime | String | (Required) Start time of the grouping interval |
| endTime | String | (Required) End time of the grouping interval |
| availability | Float | (Required) Availability [%] |
| offTime | Int64 | (Required) Off or offline time [seconds] |
| waitTime | Int64 | (Required) Standby time [seconds] |
| emergencyTime | Int64 | (Required) Emergency stop time [seconds] |
| autoRunTime | Int64 | (Required) Auto-run time [seconds] |
| manualTime | Int64 | (Required) Manual setup/adjustment time [seconds] |

## 2.7.2.2. alarm Machine Group Alarm Data Analysis {#alarm}

Retrieves the alarm history of all machines in the machine group within the specified time range.

```http
GET /api/group-analysis/alarm?groupID=GROUPID&startUnix=STARTUNIX&endUnix=ENDUNIX
```

| Request Parameter | Type | Description |
| --- | --- | --- |
| groupID | String | (Required) Target group identifier. See [1.1.2. groupID Group Identifier](/en/conventions/identifiers/#groupid) |
| startUnix | Int64 | (Required) Start timestamp [seconds] |
| endUnix | Int64 | (Required) End timestamp [seconds] |

Response example

```json
[
  {
    "machineID": "1010",
    "machineName": "模拟机台 1",
    "startTime": "2023-06-16T16:00:00Z",
    "endTime": "2023-06-16T16:00:10Z",
    "alarmMsg": "00:00 ALARM 1",
    "alarmLevel": "WRN"
  },
  {
    "machineID": "1010",
    "machineName": "模拟机台 1",
    "startTime": "2023-06-17T15:59:48.105Z",
    "endTime": "2023-06-17T16:00:00Z",
    "alarmMsg": "23:59 ALARM 2",
    "alarmLevel": "WRN"
  },
  {
    "machineID": "1011",
    "machineName": "模拟机台 2",
    "startTime": "2023-06-16T16:00:00.399Z",
    "endTime": "2023-06-16T16:00:30.395Z",
    "alarmMsg": "00:00 ALARM 1",
    "alarmLevel": "WRN"
  },
  {
    "machineID": "1010",
    "machineName": "模拟机台 1",
    "startTime": "2023-06-16T16:01:00.008Z",
    "endTime": "2023-06-16T16:01:50.019Z",
    "alarmMsg": "00:01 ALARM 1",
    "alarmLevel": "WRN"
  },
  {
    "machineID": "1014",
    "machineName": "模拟机台 5",
    "startTime": "2023-06-17T15:59:06.702Z",
    "endTime": "2023-06-17T15:59:16.7Z",
    "alarmMsg": "23:59 ALARM 2",
    "alarmLevel": "WRN"
  }
]
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| machineID | String | (Required) Target machine identifier. See [1.1.1. machineID Machine Identifier](/en/conventions/identifiers/#machineid) |
| machineName | String | (Required) Machine name, configured in the "Add/Edit Device" dialog on the "Machine Configuration" page. |
| startTime | String | (Required) Alarm start time (UTC) |
| endTime | String | (Required) Alarm end time (UTC) |
| alarmMsg | String | (Required) Alarm message |
| alarmLevel | String | (Required) Alarm level. If there are no alarms, an empty Array is returned. Levels are, from highest to lowest priority, Error (ERR), Warning (WRN), and Info (INF). Users can refer to the Bivrost Gateway Manual [5.5.7. Alarm Monitor Settings](https://docs.bivrost.cn/gateway/usage/tasks#alarm-monitor) to set alarm levels by keyword and filter out alarms below the minimum alarm level; alarms without a configured level default to Warning. |

## 2.7.2.3. count Machine Group Count Data Analysis {#count}

Retrieves the count data of all machines in the machine group, for each grouping interval, within the specified time range.

```http
GET /api/group-analysis/count?groupID=GROUPID&startUnix=STARTUNIX&endUnix=ENDUNIX&interval=INTERVAL
```

| Request Parameter | Type | Description |
| --- | --- | --- |
| groupID | String | (Required) Target group identifier. See [1.1.2. groupID Group Identifier](/en/conventions/identifiers/#groupid) |
| startUnix | Int64 | (Required) Start timestamp [seconds] |
| endUnix | Int64 | (Required) End timestamp [seconds] |
| interval | Int32 | Grouping interval [seconds]. If undefined, there is only a single grouping interval. |

Response example

```json
[
  {
    "machineID": "1010",
    "machineName": "模拟机台 1",
    "startTime": "2022-04-28T14:30:00Z",
    "endTime": "2022-04-28T15:30:00Z",
    "count": 96
  },
  {
    "machineID": "1010",
    "machineName": "模拟机台 1",
    "startTime": "2022-04-28T15:30:00Z",
    "endTime": "2022-04-28T16:30:00Z",
    "machineName": "模拟机台 1",
    "count": 0
  },
  {
    "machineID": "1010",
    "machineName": "模拟机台 1",
    "startTime": "2022-04-28T14:30:00Z",
    "endTime": "2022-04-28T15:30:00Z",
    "machineName": "模拟机台 2",
    "count": 52
  },
  {
    "machineID": "1010",
    "machineName": "模拟机台 1",
    "startTime": "2022-04-28T15:30:00Z",
    "endTime": "2022-04-28T16:30:00Z",
    "machineName": "模拟机台 2",
    "count": 0
  }
]
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| machineID | String | (Required) Machine machineID. See [1.1.1. machineID Machine Identifier](/en/conventions/identifiers/#machineid) |
| machineName | String | (Required) Machine name, configured in the "Add/Edit Device" dialog on the "Machine Configuration" page. |
| startTime | String | (Required) Start time of the grouping interval |
| endTime | String | (Required) End time of the grouping interval |
| count | Int32 | (Required) Cumulative machining count, the difference between the machine's cumulative machining count `cumulativeCount` at the start and end of the specified time range |

## 2.7.2.4. overall Machine Group Overall Data Analysis {#overall}

Retrieves the overall data of all machines in the machine group, for each grouping interval, within the specified time range.

```http
GET /api/group-analysis/overall?groupID=GROUPID&startUnix=STARTUNIX&endUnix=ENDUNIX&interval=INTERVAL
```

| Request Parameter | Type | Description |
| --- | --- | --- |
| groupID | String | (Required) Target group identifier. See [1.1.2. groupID Group Identifier](/en/conventions/identifiers/#groupid) |
| startUnix | Int64 | (Required) Start timestamp [seconds] |
| endUnix | Int64 | (Required) End timestamp [seconds] |
| interval | Int32 | Grouping interval [seconds]. If undefined, there is only a single grouping interval. |

Response example

```json
[
  {
    "machineID": "1010",
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
    "machineID": "1010",
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
  },
  {
    "machineID": "1011",
    "machineName": "模拟机台 2",
    "startTime": "2022-04-28T14:30:00Z",
    "endTime": "2022-04-28T15:30:00Z",
    "count": 52,
    "availability": 80.55556,
    "offTime": 150,
    "waitTime": 250,
    "emergencyTime": 300,
    "autoRunTime": 2900,
    "manualTime": 0.0
  },
  {
    "machineID": "1011",
    "machineName": "模拟机台 2",
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

| Response Parameter | Type | Description |
| --- | --- | --- |
| machineID | String | (Required) Machine machineID. See [1.1.1. machineID Machine Identifier](/en/conventions/identifiers/#machineid) |
| machineName | String | (Required) Machine name, configured in the "Add/Edit Device" dialog on the "Machine Configuration" page. |
| startTime | String | (Required) Start time of the grouping interval |
| endTime | String | (Required) End time of the grouping interval |
| count | Int32 | (Required) Cumulative machining count, the difference between the machine's cumulative machining count `cumulativeCount` at the start and end of the specified time range |
| availability | Float | (Required) Availability [%] |
| offTime | Int64 | (Required) Off or offline time [seconds] |
| waitTime | Int64 | (Required) Standby time [seconds] |
| emergencyTime | Int64 | (Required) Emergency stop time [seconds] |
| autoRunTime | Int64 | (Required) Auto-run time [seconds] |
| manualTime | Int64 | (Required) Manual setup/adjustment time [seconds] |

## 2.7.2.5. cycle Machine Group Cycle Time Data Analysis {#cycle}

Retrieves the overall data of all machines in the machine group, for each grouping interval, within the specified time range.

```http
GET /api/group-analysis/cycle?groupID=GROUPID&startUnix=STARTUNIX&endUnix=ENDUNIX
```

| Request Parameter | Type | Description |
| --- | --- | --- |
| groupID | String | (Required) Target group identifier. See [1.1.2. groupID Group Identifier](/en/conventions/identifiers/#groupid) |
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
  },
  {
    "machineName": "模拟机台 2",
    "startTime": "2025-05-23T07:51:50.777Z",
    "endTime": "2025-05-23T07:52:10.777Z",
    "lastCycleTime": 20,
    "mainPrgmName": "O2228",
    "machineID": "2"
  },
  {
    "machineName": "模拟机台 2",
    "startTime": "2025-05-23T07:52:10.842Z",
    "endTime": "2025-05-23T07:52:30.842Z",
    "lastCycleTime": 20,
    "mainPrgmName": "O2228",
    "machineID": "2"
  }
]
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| machineID | String | (Required) Machine machineID. See [1.1.1. machineID Machine Identifier](/en/conventions/identifiers/#machineid) |
| machineName | String | (Required) Machine name, configured in the "Add/Edit Device" dialog on the "Machine Configuration" page. |
| startTime | String | (Required) Cycle start time (UTC) |
| endTime | String | (Required) Cycle end time (UTC) |
| lastCycleTime | Int32 | (Required) Cycle duration [seconds]; only auto-run time is counted. |
| mainPrgmName | String | (Required) Name of the main program executed during the cycle |
