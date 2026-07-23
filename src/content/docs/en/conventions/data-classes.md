---
title: "1.2. Data Description"
sidebar:
  label: "1.2. Data Description"
---


The `<type>` data classes are listed in the table below:

| No. | type | Description |
| --- | --- | --- |
| 1 | AlarmHistory | Alarm history |
| 2 | AlarmLog | Current alarm |
| 3 | AxialOverload | Servo axis overload data |
| 4 | CNCStatus | Machine status |
| 5 | Count | Machining count |
| 6 | CurrentToolNumber | Current tool number |
| 7 | Cycle | Cycle time data |
| 8 | EnergyConsum | Energy consumption data |
| 9 | Feed | Feed data |
| 10 | FeedAndSpindle | Feed and spindle override data |
| 11 | GroupCount | Group machining count |
| 12 | GroupCumulativeTime | Group cumulative status time |
| 13 | GroupOEE | Group OEE data |
| 14 | LaserPower | Laser power |
| 15 | Load | Load data |
| 16 | LogHistory | Log history |
| 17 | OEE | Machine OEE data |
| 18 | Offset | Tool offset data |
| 19 | PLC | PLC data |
| 20 | Position | Position data |
| 21 | ProgramBlock | Program block |
| 22 | ProgramInfo | Current program |
| 23 | SpindleOverload | Spindle overload data |
| 24 | TimeData | Machine time data |
| 25 | ToolLife | Tool life data |

The `<field>` data fields and `<tag>` data tags for each data class are listed below. If a data class does not list `<tag>` data tags, that data class does not require data tags.

## 1.2.1. AlarmHistory: Alarm History {#alarmhistory}

Alarm history `<field>` data fields:

| Field | Type | Description |
| --- | --- | --- |
| alarmActive | Bool | true: alarm active; false: alarm cleared |
| alarmLevel | String | Alarm level |
| alarmMsg | String | Alarm message |

The cumulative alarm count is the number of alarms accumulated since the gateway began automatically collecting data from this device. This value is stored in the gateway, bound to the machineID machine identifier, and is never reset.

## 1.2.2. AlarmLog: Current Alarm {#alarmlog}

Current alarm `<field>` data fields:

| Field | Type | Description |
| --- | --- | --- |
| alarmLevel | String[] | Alarm level |
| alarmMsg | String[] | Alarm message |
| alarmTime | String[] | Alarm time |

## 1.2.3. AxialOverload: Servo Axis Overload Data {#axialoverload}

Servo axis overload data `<field>` data fields:

| Field | Type | Description |
| --- | --- | --- |
| cumulativeTime | UInt32 | Cumulative overload time [ms] |

The cumulative axis overload time is the axis overload time accumulated since the gateway began automatically collecting data from this device. This value is stored in the gateway, bound to the machineID machine identifier, and is never reset.

Servo axis overload data `<tag>` data tags:

| No. | Tag | Type | Abbreviation | Description |
| --- | --- | --- | --- | --- |
| 1 | axisNo | Int32 | A | Axis number |

## 1.2.4. CNCStatus: Machine Status {#cncstatus}

Machine status `<field>` data fields:

| Field | Type | Description |
| --- | --- | --- |
| alarmStatus | String | Alarm status, see [Alarm Status](/en/conventions/variables/#alarm-status), [Alarm Level](/en/conventions/variables/#alarm-level) |
| alarmLevel | String | Alarm level. If there are multiple alarms, the highest level among them is used. If there is no alarm, this field is not returned. See [Alarm Level](/en/conventions/variables/#alarm-level) for details. |
| cncStatus | String | CNC running status, see [Running Status](/en/conventions/variables/#cnc-status) |
| adjustedStatus | String | Adjusted CNC running status. If status adjustment is enabled (see the Bivrost Gateway Manual [5.5.8. Machine Status Monitoring Settings](https://docs.bivrost.cn/gateway/usage/tasks#status-monitor) for details), the adjusted machine status is obtained according to the configured rules. If status adjustment is not enabled, this field has the same value as cncStatus. In calculations involving machine status, such as OEE and cumulative status time, adjustedStatus takes priority for determining status. |
| mode | String | \*Operating mode, varies by system model |
| programStatus | String | \*Program status, varies by system model |
| emergencyStatus | String | \*Emergency stop status, see [Emergency Stop Status](/en/conventions/variables/#emergency-status) |
| dryRunStatus | String | \*Dry run status, see [Dry Run Status](/en/conventions/variables/#dryrun-status) |
| OffTime | UInt32 | Cumulative off time [s] |
| WaitTime | UInt32 | Cumulative wait time [s] |
| EmergencyTime | UInt32 | Cumulative emergency stop time [s] |
| AutoRunTime | UInt32 | Cumulative auto run time [s] |
| ManualTime | UInt32 | Cumulative manual (setup) time [s] |

The cumulative status times are the times accumulated for each status since the gateway began automatically collecting data from this device. These values are stored in the gateway, bound to the machineID machine identifier, and are never reset.

\*: Status details are returned in the following cases:

1. Using the [2.5.1.3. readCNCStatusDetails - Read Machine Status Details](/en/http/direct-read/#readcncstatusdetails), [2.5.2.1. readTaskData - Read Machine Task Data](/en/http/cached-read/#readtaskdata), or [2.5.2.2. batchReadTaskData - Batch Read Machine Task Data](/en/http/cached-read/#batchreadtaskdata) API.
2. The machine status task is enabled, and status details are enabled in Task Configuration - Machine Status Monitoring Settings; the machine status task then returns these fields.

Machine status `<tag>` data tags:

| No. | Tag | Type | Abbreviation | Description |
| --- | --- | --- | --- | --- |
| 1 | channel | Int32 | C | Channel number; if absent, represents the default channel |

## 1.2.5. Count: Machining Count {#count}

Machining count `<field>` data fields:

| Field | Type | Description |
| --- | --- | --- |
| count | Int32 | Current number of workpieces machined, as recorded by the machine system |
| cumulativeCount | UInt32 | Cumulative machining count |
| currentCount | Int32 | Current production output |

The cumulative machining count is the machining count accumulated since the gateway began automatically collecting data from this device. This value is stored in the gateway, bound to the machineID machine identifier, and is never reset. Current production output is the production count for the machine within the monitoring period.

## 1.2.6. CurrentToolNumber: Current Tool Number {#currenttoolnumber}

Current tool number `<field>` data fields:

| Field | Type | Description |
| --- | --- | --- |
| toolNumber | String | Current tool number |
| toolOffsetNum | String | Current tool offset number |

Current tool number `<tag>` data tags:

| No. | Tag | Type | Abbreviation | Description |
| --- | --- | --- | --- | --- |
| 1 | channel | Int32 | C | Channel number; if absent, represents the default channel |

## 1.2.7. Cycle: Cycle Time Data {#cycle}

Cycle time data `<field>` data fields:

| Field | Type | Description |
| --- | --- | --- |
| lastCycleTime | Int64 | Last cycle time [s], monitored by the gateway's machine cycle time data task. If the first cycle has not yet ended after the gateway restarts, this value is 0. The definition of "last cycle time" here is the same as the last cycle time in [1.2.24. TimeData: Machine Time Data](#timedata); the difference is that the former is computed by the gateway and is supported by all machines that can report production count and status, whereas the latter is provided by the machine itself and is only supported by some machines. |
| lastTotalTime | Int64 | Total time from the end of the last cycle to the end of this cycle [s], including non-running time. |
| mainPrgmName | String | Main program name of the last cycle |
| deltaCount | Int32 | Change in count between the previous and current cycle. When this value is greater than 1, the cycle time equals the running time during this count change divided by the count change value. |

## 1.2.8. EnergyConsum: Energy Consumption Data {#energyconsum}

Energy consumption data `<field>` data fields:

| Field | Type | Description |
| --- | --- | --- |
| allServoAxes | Double | Energy consumption of all servo axes [Wh] |
| coolantPump | Double | Coolant pump energy consumption [Wh] |
| ctsPump | Double | CTS pump [Wh] |
| chipFlusherPump | Double | Chip flusher pump [Wh] |
| cyclonePump | Double | Cyclone filter pump [Wh] |
| system24V | Double | 24V system [Wh] |
| ncControl | Double | NC control [Wh] |
| lcdBacklight | Double | LCD backlight [Wh] |
| chipConveyor | Double | Chip conveyor [Wh] |
| screwConveyor | Double | Screw conveyor [Wh] |
| autoLubrication | Double | Automatic lubrication device (or automatic greasing device) [Wh] |
| spindleCoolingFan | Double | Spindle cooling fan [Wh] |
| servoControl | Double | Servo control [Wh] |

Currently, this data class is only supported on some newer Brother machine models.

## 1.2.9. Feed: Feed Data {#feed}

Feed data `<field>` data fields:

| Field | Type | Description |
| --- | --- | --- |
| actFeed | Float | Actual feed rate |
| cmdFeed | Float | Commanded feed rate |
| overFeed | Float | Feed override [%] |
| overRapid | Float | Rapid feed override [%] |

Feed data `<tag>` data tags:

| No. | Tag | Type | Abbreviation | Description |
| --- | --- | --- | --- | --- |
| 1 | channel | Int32 | C | Channel number; if absent, represents the default channel |

## 1.2.10. FeedAndSpindle: Feed and Spindle Override Data {#feedandspindle}

Feed and spindle override data `<field>` data fields:

| Field | Type | Description |
| --- | --- | --- |
| actFeed | Float | Actual feed rate |
| actSpindle | Float | Actual speed of the first spindle |
| cmdFeed | Float | Commanded feed rate |
| cmdSpindle | Float | Commanded speed of the first spindle |
| overFeed | Float | Feed override [%] |
| overRapid | Float | Rapid feed override [%] |
| overSpindle | Float | Speed override of the first spindle [%] |

Feed and spindle override data `<tag>` data tags:

| No. | Tag | Type | Abbreviation | Description |
| --- | --- | --- | --- | --- |
| 1 | channel | Int32 | C | Channel number; if absent, represents the default channel |

## 1.2.11. GroupCount: Group Machining Count {#groupcount}

Group machining count `<field>` data fields:

| Field | Type | Description |
| --- | --- | --- |
| cumulativeCount | UInt32 | Group cumulative machining count, i.e., the machining count accumulated since the gateway began automatically collecting data from this group of devices. See the Bivrost Gateway Manual [6.1.3. Group Machining Count](https://docs.bivrost.cn/gateway/reference/glossary#group-count) for details. |

## 1.2.12. GroupCumulativeTime: Group Cumulative Status Time {#groupcumulativetime}

Group cumulative status time `<field>` data fields:

| Field | Type | Description |
| --- | --- | --- |
| OffTime | UInt32 | Cumulative off time [s] |
| WaitTime | UInt32 | Cumulative wait time [s] |
| EmergencyTime | UInt32 | Cumulative emergency stop time [s] |
| AutoRunTime | UInt32 | Cumulative auto run time [s] |
| ManualTime | UInt32 | Cumulative manual (setup) time [s] |

The cumulative status times are the sums of each status time, accumulated since the gateway began automatically collecting data from this group, across all devices in the group.

## 1.2.13. GroupOEE: Group OEE {#groupoee}

Group OEE `<field>` data fields:

| Field | Type | Description |
| --- | --- | --- |
| autoRunCount | Int32 | Number of machines currently in auto run within the group |
| autoRunTime | Int64 | Group auto run time [s] |
| availability | Float | Group availability [%] |
| emergencyCount | Int32 | Number of machines currently in emergency stop within the group |
| emergencyTime | Int64 | Group emergency stop time [s] |
| manualCount | Int32 | Number of machines currently in manual (setup) mode within the group |
| manualTime | Int64 | Group manual (setup) time [s] |
| offCount | Int32 | Number of machines currently off within the group |
| offTime | Int64 | Group off time [s] |
| waitCount | Int32 | Number of machines currently waiting within the group |
| waitTime | Int64 | Group wait time [s] |

The group status times here are the sums of each status time, within the monitoring period, for all active machines in the group. Group availability is the availability of the group within the monitoring period. See the Bivrost Gateway Manual [6.1.2. Group OEE Data](https://docs.bivrost.cn/gateway/reference/glossary#group-oee) for details.

## 1.2.14. LaserPower: Laser Power {#laserpower}

Laser power `<field>` data fields:

| Field | Type | Description |
| --- | --- | --- |
| preset | Float | Preset power [%] |
| actual | Float | Actual power [%] |

## 1.2.15. Load: Load Data {#load}

Load data `<field>` data fields:

| Field | Type | Description |
| --- | --- | --- |
| axialLoad | Float[] | Servo axis load [%], corresponding in order to the servo axis names in axisName from [1.2.20. Position: Position Data](#position). |
| spindleLoad | Float[] | Spindle load [%], corresponding in order to the first spindle, second spindle, etc. |

Load data `<tag>` data tags:

| No. | Tag | Type | Abbreviation | Description |
| --- | --- | --- | --- | --- |
| 1 | channel | Int32 | C | Channel number; if absent, represents the default channel |

## 1.2.16. LogHistory: Log History {#loghistory}

Log history `<field>` data fields:

| Field | Type | Description |
| --- | --- | --- |
| msg | String | Log content |

## 1.2.17. OEE: Machine OEE Data {#oee}

Machine OEE `<field>` data fields:

| Field | Type | Description |
| --- | --- | --- |
| autoRunTime | Int64 | Auto run time [s] |
| availability | Float | Machine availability [%] |
| emergencyTime | Int64 | Emergency stop time [s] |
| manualTime | Int64 | Manual (setup) time [s] |
| offTime | Int64 | Off time [s] |
| waitTime | Int64 | Wait time [s] |

:::note[Note]
The machine status times here are the status times for the machine within the monitoring period. Machine availability is the availability of the machine within the monitoring period. See the Bivrost Gateway Manual [6.1.1. Machine OEE Data](https://docs.bivrost.cn/gateway/reference/glossary#machine-oee) for details.
:::

## 1.2.18. Offset: Tool Offset Data {#offset}

Tool offset data `<field>` data fields:

| Field | Type | Description |
| --- | --- | --- |
| toolName | String | Tool name |
| toolType | String | Tool type |
| lengthUnit | String | Tool offset length unit |
| toolNose | Int32 | (Imaginary) tool nose position / tool edge type |
| lengthWear | Double | Length wear |
| radiuWear | Double | Radius wear |
| lengthGeom | Double | Length geometry |
| radiusGeom | Double | Radius geometry |
| wearX | Double | Length X wear |
| wearY | Double | Length Y wear |
| wearZ | Double | Length Z wear |
| wearR | Double | Radius wear |
| geomX | Double | Length X |
| geomY | Double | Length Y |
| geomZ | Double | Length Z |
| geomR | Double | Radius |

:::note[Note]
The table lists the common tool offset data fields, which are generally sufficient for most use cases. Some machines support additional, less common data fields that are not described individually here. **When adding a new machine type for the first time, it is recommended to test which fields can be read.** If you need to obtain a field that exists on the machine but is not currently supported, please contact customer support.
:::

Tool offset data `<tag>` data tags:

| No. | Tag | Type | Abbreviation | Description |
| --- | --- | --- | --- | --- |
| 1 | toolNum | Int32 | T | Tool number |
| 2 | offsetNum | Int32 | O | Offset number |
| 3 | channel | Int32 | C | Channel number; if absent, represents the default channel |

The combination of data tags depends on the machine's control system; the tag combinations required by different systems are as follows (tool offset data tag combinations):

| System Model | toolNum (tool number) | offsetNum (offset number) |
| --- | --- | --- |
| Bosunman 博尚 | X | O |
| Brother 兄弟 | X | O |
| Delta 台达 | X | O |
| Fagor 法格 | X | O |
| Fanuc 发那科 | X | O |
| GSK 广数 | X | O |
| Heidenhain 海德汉 | O; "T" column in tool table | X |
| Haas 哈斯 | X | O |
| Kede 科德 | X | O |
| Knd 凯恩帝 | X | O |
| Lynuc 铼纳克 | X | O |
| Mazak 马扎克 [Smart, Smooth] | X | O |
| Mitsubishi 三菱 | X | O |
| Mock 模拟机台 | O | O |
| Okuma 大隈 [P200L, P300L] | X | O; "NO." column |
| Okuma 大隈 [P300S(LP)] | O; "TNo" column in the tool data setting table | O; calculated from the "ENo" and "PNo" columns in the tool data setting table: offsetNum = (ENo-1)\*20+PNo; if there is no "ENo" column, then offsetNum = PNo |
| Okuma 大隈 [P200M, P300M, P300S(MP)] | X | O; "NO." column in the tool length compensation / tool radius compensation table |
| Siemens 西门子 | O; "Position" column in tool table | O; "D" column in tool table |
| Syntec 新代 | X | O |

O: required;

X: not required.

If an output quantity has the same name as a tag, the output result will also appear in the tag, but this result does not serve an identifying purpose.

## 1.2.19. PLC: PLC Data {#plc}

PLC data includes external PLC data.

PLC data `<field>` data fields:

| Field | Type | Description |
| --- | --- | --- |
| data | Object[] | PLC data other than String type. |
| msg | String | String-type PLC data. |
| pArray | Object[] | Array data obtained through post-processing |
| pInt64 | Int64 | Int64 data obtained through post-processing |
| pDouble | Double | Double data obtained through post-processing |
| pString | String | String data obtained through post-processing |
| pBool | Bool | Bool data obtained through post-processing |

PLC data `<tag>` data tags:

| No. | Tag | Type | Abbreviation | Description |
| --- | --- | --- | --- | --- |
| 1 | channel | Int32 | C | Channel number; if absent, represents the default channel |
| 2 | tag | String | T | Tag name or sequence number |

If a tag is defined in the PLC task command (see the Bivrost Gateway Manual [6.2.1. PLC Data Task](https://docs.bivrost.cn/gateway/reference/command-format#plc-task) for details), tag takes the value defined in the command; for example, if the tag in the PLC command is "Temperature Data 1", then tag is "T Temperature Data 1". If no tag is defined in the PLC task command, tag is T + sequence number, with the sequence number starting from 0. For example, if no tag is defined in the first PLC task command, its sequence number is 0 and tag is T0. When there are multiple PLC acquisition commands, the sequence number accumulates based on the reply data length specified by each command.

If the sequence number of the previous PLC task command is x, then the sequence number of the next one is:

x + the data length obtained by the previous task

Here, data length refers to the number of corresponding 16-bit units for the data.

The main parameters of a PLC task command are: area, start address, data count, and data type.

If the data type is String:

Data length = (data count + 1) / 2, with the result rounded down.

For example:

PLC command `DB1,1,11,String`, data length = (11 + 1) / 2, rounded down to 6.

If the data type is not String:

Data length = single data length \* data count, where:

Single data length = (bit count of the single data type + 15) / 16, with the result rounded down.

For example:

PLC command `M,100,5,Bit0`, single data length = (1 + 15) / 16, rounded down to 1. Data length = 1 \* 5 = 5.

PLC command `R,100,5,Byte`, single data length = (8 + 15) / 16, rounded down to 1. Data length = 1 \* 5 = 5.

PLC command `R,100,5,Int16`, single data length = (16 + 15) / 16, rounded down to 1. Data length = 1 \* 5 = 5.

PLC command `R,100,5,Int32`, single data length = (32 + 15) / 16, rounded down to 2. Data length = 2 \* 5 = 10.

PLC command `R,100,5,Float`, single data length = (32 + 15) / 16, rounded down to 2. Data length = 2 \* 5 = 10.

PLC command `R,100,5,Double`, single data length = (64 + 15) / 16, rounded down to 4. Data length = 4 \* 5 = 20.

The sequence number of the first external PLC task continues numbering after the sequence number of the last PLC task.

## 1.2.20. Position: Position Data {#position}

Position data `<field>` data fields:

| Field | Type | Description |
| --- | --- | --- |
| axisName | String[] | Axis names, e.g. ["x", "y", "z"] |
| abs | Float[] | Absolute coordinates, corresponding in order to the axis names in axisName |
| dist | Float[] | Remaining distance, corresponding in order to the axis names in axisName |
| mach | Float[] | Machine coordinates, corresponding in order to the axis names in axisName |
| rel | Float[] | Relative coordinates, corresponding in order to the axis names in axisName |
| unit | String[] | Axis coordinate unit |

Position data `<tag>` data tags:

| No. | Tag | Type | Abbreviation | Description |
| --- | --- | --- | --- | --- |
| 1 | channel | Int32 | C | Channel number; if absent, represents the default channel |

## 1.2.21. ProgramBlock: Program Block {#programblock}

Program block `<field>` data fields:

| Field | Type | Description |
| --- | --- | --- |
| currentBlock | String | Content of the currently running program block |

Program block `<tag>` data tags:

| No. | Tag | Type | Abbreviation | Description |
| --- | --- | --- | --- | --- |
| 1 | channel | Int32 | C | Channel number; if absent, represents the default channel |

## 1.2.22. ProgramInfo: Current Program {#programinfo}

Current program `<field>` data fields:

| Field | Type | Description |
| --- | --- | --- |
| mainPrgmName | String | Current main program name |
| programSeqNum | String | Sequence number of the currently executing subprogram block |
| runningPrgName | String | Name of the currently executing subprogram |
| programStack | String | Program stack, only supported on Siemens 西门子 [OPC UA] |

Current program `<tag>` data tags:

| No. | Tag | Type | Abbreviation | Description |
| --- | --- | --- | --- | --- |
| 1 | channel | Int32 | C | Channel number; if absent, represents the default channel |

## 1.2.23. SpindleOverLoad: Spindle Overload Data {#spindleoverload}

Spindle overload data `<field>` data fields:

| Field | Type | Description |
| --- | --- | --- |
| cumulativeTime | UInt32 | Cumulative spindle overload time [ms] |

The cumulative spindle overload time is the spindle overload time accumulated since the gateway began automatically collecting data from this device. This value is stored in the gateway, bound to the machineID machine identifier, and is never reset.

Spindle overload data `<tag>` data tags:

| No. | Tag | Type | Abbreviation | Description |
| --- | --- | --- | --- | --- |
| 1 | spindleNo | Int32 | S | Spindle number |
| 2 | channel | Int32 | C | Channel number; if absent, represents the default channel |

## 1.2.24. TimeData: Machine Time Data {#timedata}

Machine time data `<field>` data fields:

| Field | Type | Description |
| --- | --- | --- |
| cumulativePowerOnTimeMin | Int32 | Cumulative power-on time 1 [minutes] |
| cumulativePowerOnTimeMs | Int32 | Cumulative power-on time 2 [ms] |
| powerOnTimeMin | Int32 | Current power-on time 1 [minutes] |
| powerOnTimeMs | Int32 | Current power-on time 2 [ms] |
| cumulativeOperatingTimeMin | Int32 | Cumulative operating time 1 [minutes] |
| cumulativeOperatingTimeMs | Int32 | Cumulative operating time 2 [ms] |
| operatingTimeMin | Int32 | Current operating time 1 [minutes] |
| operatingTimeMs | Int32 | Current operating time 2 [ms] |
| cumulativeCuttingTimeMin | Int32 | Cumulative machining (cutting) time 1 [minutes] |
| cumulativeCuttingTimeMs | Int32 | Cumulative machining (cutting) time 2 [ms] |
| cuttingTimeMin | Int32 | Current machining (cutting) time 1 [minutes] |
| cuttingTimeMs | Int32 | Current machining (cutting) time 2 [ms] |
| lastCycleTimeMin | Int32 | Last cycle time 1 [minutes] |
| lastCycleTimeMs | Int32 | Last cycle time 2 [ms] |
| currentCycleTimeMin | Int32 | Current cycle time 1 [minutes] |
| currentCycleTimeMs | Int32 | Current cycle time 2 [ms] |
| currentCuttingTimeMin | Int32 | Current cutting time 1 [minutes] |
| currentCuttingTimeMs | Int32 | Current cutting time 2 [ms] |

The time data supported by each system model is shown in the table below, where:

O (shown as ✅ in the table below): time data supported by the machine. Each time value is stored as two Int32 values: time 1 is the portion exceeding 1 minute, in minutes; time 2 is the portion under 1 minute, in milliseconds. The actual time value is the sum of time 1 and time 2 after converting them to the same unit. For example:

```
cumulativeOperatingTimeMin = 6683, cumulative operating time 1
cumulativeOperatingTimeMs = 13328, cumulative operating time 2
cumulative operating time = [cumulative operating time 1]*60*1000+[cumulative operating time 2]
             = 6683*60*1000+13328
             = 400993328 ms
```

\*: For some Siemens systems, the cumulative operating time, cumulative machining (cutting) time, and current machining (cutting) time obtained are always 0, because although the corresponding variables exist in the system, the system does not actually write any value to them.

Some time data can be manually reset to zero on the machine control system.

Time data supported by each system model (✅ = supported, blank = not supported):

| System Model | Cumulative Power-On Time | Current Power-On Time | Cumulative Operating Time | Current Operating Time | Cumulative Machining (Cutting) Time | Current Machining (Cutting) Time | Last Cycle Time | Current Cycle Time | Current Workpiece Cutting Time | Remaining Cycle Time |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Description | Total accumulated power-on time | Power-on time counted from this power-on | Total accumulated auto run time | Time in the current auto run state | Total accumulated cutting time | Cutting time in the current auto run state | Cycle time of the previous workpiece | Elapsed cycle time of the current workpiece | Elapsed cutting time of the current workpiece | Remaining time of the current cycle |
| Bosunman 博尚 [DF Series] |  |  |  | ✅ |  |  |  | ✅ |  |  |
| Bosunman 博尚 [BSK Series] | ✅ | ✅ | ✅ | ✅ |  |  |  | ✅ |  |  |
| Brother 兄弟 [General] | ✅ |  | ✅ | ✅ |  |  |  |  |  |  |
| Brother 兄弟 [S Series] | ✅ |  | ✅ | ✅ |  |  |  | ✅ | ✅ |  |
| Delta 台达 |  |  | ✅ | ✅ |  |  |  |  |  |  |
| Dmg Mori 德玛吉森精机 [730BM] |  |  |  |  |  |  |  |  |  |  |
| Dmg Mori 德玛吉森精机 [OPC UA] | ✅ |  | ✅ |  |  |  |  | ✅ |  |  |
| Fagor 法格 [8035, 8040, 8055] |  |  |  |  |  |  |  | ✅ |  |  |
| Fagor 法格 [8060, 8065, 8070] |  | ✅ |  |  |  |  |  | ✅ |  |  |
| Fanuc 发那科 | ✅ |  | ✅ |  | ✅ |  |  | ✅ (must be reset at the end of the program to clear) |  |  |
| Gsk 广州数控 |  |  |  | ✅ |  | ✅ |  |  |  |  |
| Haas 哈斯 [General, Serial] | ✅ |  | ✅ |  |  |  | ✅ | ✅ |  |  |
| Haas 哈斯 [MT-CONNECT] |  |  |  |  |  |  | ✅ | ✅ |  | ✅ |
| Heidenhain 海德汉 | ✅ |  | ✅ |  |  |  |  |  |  |  |
| Hnc 华中数控 |  |  |  |  |  |  |  |  |  |  |
| Jingdiao 北京精雕 |  |  | ✅ | ✅ |  | ✅ |  | ✅ |  |  |
| Kede 科德 |  | ✅ |  |  |  |  |  | ✅ |  | ✅ |
| Knd 凯恩帝 |  |  | ✅ | ✅ |  |  |  |  |  |  |
| Lnc 宝元 |  |  |  |  | ✅ |  |  | ✅ |  |  |
| Lynuc 铼纳克 |  |  |  | ✅ |  | ✅ |  | ✅ |  |  |
| Mazak 马扎克 [MT-CONNECT] | ✅ |  | ✅ |  | ✅ |  |  |  |  |  |
| Mazak 马扎克 [Smart, Smooth] | ✅ | ✅ | ✅ | ✅ | ✅ |  |  |  |  |  |
| Mitsubishi 三菱 | ✅ |  | ✅ |  | ✅ |  |  | ✅ |  |  |
| Mock 模拟机台 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |  |
| Okuma 大隈 | ✅ |  | ✅ |  | ✅ |  |  |  |  |  |
| Rexroth 力士乐 [OPC UA] |  |  |  | ✅ |  |  |  | ✅ |  |  |
| Siemens 西门子 | ✅ | ✅ |  | ✅ | ✅ |  |  | ✅ |  |  |
| Syntec 新代 | ✅ | ✅ |  | ✅ (auto run time of the current program) | ✅ |  | ✅ | ✅ |  |  |

## 1.2.25. ToolLife: Tool Life Data {#toollife}

Tool life data `<field>` data fields:

**Common Data**

| Field | Type | Description |
| --- | --- | --- |
| timeLimit | Int32 | Life limit [s], maximum available time |
| currentTime | Int32 | Current life [s], time already used |
| prewarningTime | Int32 | Prewarning life [s]; an alarm is raised when the current life reaches this value |
| countLimit | Int32 | Life limit [count], maximum available count |
| currentCount | Int32 | Current life [count], count already used |
| prewarningCount | Int32 | Prewarning life [count]; an alarm is raised when the current life reaches this value |
| wearLimit | Int32 | Life limit [machine's default length unit], maximum allowable wear |
| currentWear | Int32 | Current life [machine's default length unit], current wear amount |
| prewarningWear | Int32 | Prewarning life [machine's default length unit]; an alarm is raised when the current life reaches this value |

**Raw Data**

| Field | Type | Description |
| --- | --- | --- |
| rawToolLifeType | String | Tool life type |
| rawToolLifeUnit | String | Time unit, hereinafter abbreviated as [time] |
| rawToolLifeStatus | String | Tool life status |
| rawTimeLimit | Double | Life limit [time] |
| rawTimeLimit1 | Double | Maximum tool life [time], Heidenhain only |
| rawTimeLimit1 | Double | Maximum life of the called tool [time], Heidenhain only |
| rawCurrentTime | Double | Current life [time] |
| rawOverTime | Double | Tool life exceeded [time], Heidenhain only |
| rawRemainingTime | Double | Remaining life [time] |
| rawPrewarningRemainingTime | Double | Prewarning remaining life [time] |
| rawRemainingCount | Int32 | Remaining life [count] |
| rawPrewarningRemainingCount | Int32 | Prewarning remaining life [count] |
| rawRemainingWear | Double | Remaining life [machine's default length unit] |
| rawPrewarningRemainingWear | Double | Prewarning remaining life [machine's default length unit] |
| inventoryNum | String | Tool identification code, Heidenhain only |

For the meaning of each field, see the examples in [2.5.1.21. readToolLife - Read Tool Life](/en/http/direct-toollife/#readtoollife) and [2.5.1.22. readToolLifeDetails - Read Tool Life Details](/en/http/direct-toollife/#readtoollifedetails).

Raw data is returned in the following cases:

1. Using the [2.5.1.22. readToolLifeDetails - Read Tool Life Details](/en/http/direct-toollife/#readtoollifedetails), [2.5.1.24. batchReadToolLifeDetails - Batch Read Tool Life Details](/en/http/direct-toollife/#batchreadtoollifedetails), [2.5.2.1. readTaskData - Read Machine Task Data](/en/http/cached-read/#readtaskdata), or [2.5.2.2. batchReadTaskData - Batch Read Machine Task Data](/en/http/cached-read/#batchreadtaskdata) API.
2. The tool life task is enabled, and tool life details are enabled in Task Configuration - Tool Life Monitoring Settings; the tool life task then returns these fields.

Tool life data `<tag>` data tags:

| No. | Tag | Type | Abbreviation | Description |
| --- | --- | --- | --- | --- |
| 1 | toolGroupNum | Int32 | G | Tool group number |
| 2 | toolNum | Int32 | T | Tool number |
| 3 | toolOffsetNum | Int32 | O | Offset number |
| 4 | toolIndex | Int32 | I | Sequence number |

The combination of data tags depends on the machine's control system; the tag combinations required by different systems are as follows (tool life data tag combinations):

| System Model | toolGroupNum (tool group number) | toolIndex (index within group) | toolNum (tool number) | toolOffsetNum (offset number) |
| --- | --- | --- | --- | --- |
| Brother 兄弟 | X | X | O | X |
| Fanuc 发那科 | O | O | X | X |
| Gsk 广数 | O | O | X | X |
| Heidenhain 海德汉 | X | X | O | X |
| Kede 科德 | X | X | O | X |
| Lynuc 铼纳克 | X | X | O | X |
| Mazak 马扎克 [Smart, Smooth] | X | X | O; "TNo" column | X |
| Mock 模拟机台 | X | X | O | O |
| Okuma 大隈 [P200L, P300L] | X | X | O; "TOOL" column | X |
| Okuma 大隈 [P300S(LP)] | X | X | O; "TNo" column | O; "ENo" column; if there is no "ENo", then offsetNum = 1 |
| Okuma 大隈 [P200M, P300M, P300S(MP)] | X | X | O; "TOOL NO." column | X |
| Siemens 西门子 | X | X | O; "Position" column in tool table | O; "D" column in tool table |
| Syntec 新代 | X | X | O | X |

O: required;

X: not required.

If an output quantity has the same name as a tag, the output result will also appear in the tag, but this result does not serve an identifying purpose. For example, for Fanuc tool life, the tags toolGroupNum and toolIndex are used to identify the tool, while the tag toolNum is an output quantity; in this case, the result of toolNum will appear in the tag.

Life types supported by each system model (tool life types):

| System Model | Count | Time | Wear |
| --- | --- | --- | --- |
| Brother 兄弟 | O | O | X |
| Fanuc 发那科 | O | O | X |
| Gsk 广数 | O | O | X |
| Heidenhain 海德汉 | X | O | X |
| Kede 科德 | O | O | O |
| Lynuc 铼纳克 | O | O | X |
| Mock 模拟机台 | O; ToolNum 1~10 | O; ToolNum 11~20 | O; ToolNum 21~30 |
| Okuma 大隈 | O | O | O |
| Siemens 西门子 | O | O | O |
| Syntec 新代 | O | O | X |

O: supported;

X: not supported.
