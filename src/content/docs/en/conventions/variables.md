---
title: "1.3. Variable Definitions"
sidebar:
  label: "1.3. Variable Definitions"
---


## 1.3.1. Machine Status {#machine-status}

### 1.3.1.1. CNCStatus: Running Status {#cnc-status}

:::note[Note]
The variable is named CNCStatus, but it is not limited to CNC machines — it also applies to the status of equipment such as robots and laser cutters.
:::

Running status:

| Status Code | Return String | Running Status | Description |
| --- | --- | --- | --- |
| 0 | OFF | Powered off or offline |  |
| 1 | EMERGENCY | Emergency stop | Emergency stop button pressed |
| 2 | WAIT | Standby: general standby | 1. In Automatic (including Remote Automatic) mode, the program is not running and the specific status cannot be identified; 2. Unrecognized operating mode |
| 3 | WAIT_HOLD | Standby: program paused | Program paused state in Automatic (including Remote Automatic) mode |
| 4 | WAIT_STOP | Standby: program stopped | Program stopped state in Automatic (including Remote Automatic) mode |
| 5 | WAIT_IDLE | Standby: idle | Idle or ready state in Automatic mode or Remote Automatic mode |
| 10 | AUTO_RUN | Automatic running | Program running in Automatic mode |
| 11 | AUTO_RUN_REMOTE | Remote automatic running | Program running in Remote Automatic mode |
| 20 | MANUAL | Setup: general setup | Non-automatic state; the specific setup status cannot be identified |
| 21 | MANUAL_EDIT | Setup: program editing |  |
| 22 | MANUAL_MDI | Setup: manual data input |  |
| 23 | MANUAL_HANDLE | Setup: manual handwheel feed |  |
| 24 | MANUAL_HANDLE_TCH | Setup: manual handwheel feed teaching |  |
| 25 | MANUAL_JOG | Setup: manual jog feed |  |
| 26 | MANUAL_JOG_TCH | Setup: manual jog feed teaching |  |
| 27 | MANUAL_INC | Setup: incremental feed/step |  |
| 28 | MANUAL_REF | Setup: return to reference point |  |
| 29 | MANUAL_REMOTE | Setup: remote |  |
| 30 | MANUAL_MSTR | Setup: tool retract/repositioning |  |
| 31 | MANUAL_DRY_RUN | Setup: dry run |  |
| 32 | MANUAL_RAPID | Setup: rapid positioning |  |
| 33 | MANUAL_SINGLE_BLOCK | Setup: single block operation |  |
| 34 | MANUAL_MDI_RUN | Setup: running program in MDI mode |  |
| 35 | MANUAL_HOLD | Setup: paused | Paused in non-automatic (including remote automatic) mode |

:::note[Note]
The status code is used only for MODBUS communication.
:::

### 1.3.1.2. AlarmStatus: Alarm Status {#alarm-status}

| Return String | Alarm Status |
| --- | --- |
| ALARM | Alarm present |
| NO_ALARM | No alarm |

### 1.3.1.3. EmergencyStatus: Emergency Stop Status {#emergency-status}

| Return String | Emergency Stop Status |
| --- | --- |
| EMG | Emergency stop |
| NOT_EMG | Not emergency stop |

### 1.3.1.4. DryRunStatus: Dry Run Status {#dryrun-status}

| Return String | Dry Run Status |
| --- | --- |
| DRY_RUN | Dry run |
| NOT_DRY_RUN | Not dry run |

## 1.3.2. Alarm Information {#alarm-info}

### 1.3.2.1. AlarmLevel: Alarm Level {#alarm-level}

Alarm levels, in descending order of priority, are Error (ERR), Warning (WRN), and Message (INF). Users can refer to the Bivrost Gateway Manual [5.5.7. Alarm Monitor Settings](https://docs.bivrost.cn/gateway/usage/tasks#alarm-monitor) to set alarm levels by keyword and filter out alarms below the minimum alarm level. Alarms with no configured level default to the WRN (Warning) level.

| Return String | Alarm Level |
| --- | --- |
| ERR | Error |
| WRN | Warning |
| INF | Message |

## 1.3.3. Service Information {#service-info}

### 1.3.3.1. ServiceRunningStatus: Service Running Status {#service-running-status}

Running status of each gateway service.

| Return Int32 | Running Status |
| --- | --- |
| 0 | Disabled |
| 1 | Initiated |
| 2 | Ready |
| 3 | Running |
| 4 | Delayed |
| 5 | Error |
