---
title: "3. MODBUS Communication"
sidebar:
  label: "3. MODBUS Communication"
---


After enabling MODBUS communication and turning on the automatic data collection task for the target machine/group (see the Bivrost Gateway Manual [5.3.1.2. Task Settings](https://docs.bivrost.cn/gateway/usage/machines#task-settings) and [5.4.1.2. Group Task Settings](https://docs.bivrost.cn/gateway/usage/groups#group-tasks)), the gateway stores the automatic data collection task results in the corresponding register addresses based on the MODBUS protocol. The MODBUS communication address is `<Gateway IP>`, and the port is 502. To use MODBUS communication, the machine tool must have a slave ID configured (see the Bivrost Gateway Manual [5.3.1.5. Advanced Settings](https://docs.bivrost.cn/gateway/usage/machines#advanced-settings)); by default, the last segment of the IP address is used as the slave ID. For example, if the machine tool's IP is 192.168.100.2, its default slave ID is 2. The slave ID cannot be set to 0 (0 is reserved for the gateway), and the slave IDs of all machine tools connected under the same gateway (default: the last segment of the IP) must be unique from one another; otherwise data identification errors will occur. Users can configure the MODBUS service by following the instructions in the Bivrost Gateway Manual [5.6.2. MODBUS Configuration](https://docs.bivrost.cn/gateway/usage/communication#modbus).

:::note[Note]
The gateway's MODBUS server register addresses are 0-based. If the client uses 1-based addressing, add 1 to the corresponding address.
:::

## 3.1. Machine-Related Data {#machine-data}

The MODBUS data addresses are as follows:

| Address | Name | Data Type | Unit | Remarks |
| --- | --- | --- | --- | --- |
| 400010 | Connection status | UInt16 | - | 1-Connected;2-Disconnected;3-Error |
| 400011 | Alarm count | UInt16 | count | Current number of alarms |
| 400012 | CNC operating status | Int16 | - | Current operating status code, see [Operating Status](/en/conventions/variables/#cnc-status) |
| 400013 | Cumulative alarm count | UInt32 | count | |
| 400015 | Cumulative alarm time | UInt32 | seconds | |
| 400040~400075 | Axis 1 to Axis 18 name | String(4) | - | Converted to a 4-byte array (2 register addresses) using the encoding set in the MODBUS configuration. |
| 400100 | Machining count | UInt32 | pieces | Machining count obtained from the machine tool's system |
| 400102 | Spindle override | Float | % | Spindle speed override |
| 400104 | Actual spindle speed | Float | same as machine setting | |
| 400106 | Feed override | Float | % | Feed rate override |
| 400108 | Actual feed rate | Float | same as machine setting | |
| 400110~400115 | Spindle 1 to Spindle 3 load | Float | % | |
| 400120 | Rapid feed override | Float | % | |
| 400122 | Commanded feed rate | Float | same as machine setting | |
| 400124 | Commanded spindle speed | Float | same as machine setting | |
| 400172 | Cumulative power-on time 1 | Int32 | minutes | See [1.2.24. TimeData: Machine Time Data](/en/conventions/data-classes/#timedata) for how the time is calculated. If the value is -2147483648, it indicates the machine tool's system model does not support this time data. |
| 400174 | Cumulative power-on time 2 | Int32 | milliseconds | |
| 400176 | Current power-on time 1 | Int32 | minutes | |
| 400178 | Current power-on time 2 | Int32 | milliseconds | |
| 400180 | Cumulative running time 1 | Int32 | minutes | |
| 400182 | Cumulative running time 2 | Int32 | milliseconds | |
| 400184 | Current running time 1 | Int32 | minutes | |
| 400186 | Current running time 2 | Int32 | milliseconds | |
| 400188 | Cumulative machining time 1 | Int32 | minutes | |
| 400190 | Cumulative machining time 2 | Int32 | milliseconds | |
| 400192 | Current machining time 1 | Int32 | minutes | |
| 400194 | Current machining time 2 | Int32 | milliseconds | |
| 400196 | Last cycle time 1 | Int32 | minutes | |
| 400198 | Last cycle time 2 | Int32 | milliseconds | |
| 400200 | Current cycle time 1 | Int32 | minutes | |
| 400202 | Current cycle time 2 | Int32 | milliseconds | |
| 400204 | Current cutting time 1 | Int32 | minutes | |
| 400206 | Current cutting time 2 | Int32 | milliseconds | |
| 400208 | Remaining cycle time 1 | Int32 | minutes | |
| 400210 | Remaining cycle time 2 | Int32 | milliseconds | |
| 400220 | Current tool number | String(16) | - | Converted to a 16-byte array (8 register addresses) using the encoding set in the MODBUS configuration. |
| 400228 | Running program name | String(32) | - | Name of the currently executing subprogram |
| 400244 | Main program name | String(32) | - | Name of the current main program |
| 400260 | Running program block sequence number | String(16) | - | Sequence number of the currently executing subprogram block |
| 400268 | Current program block | String(70) | - | Content of the currently running program block |
| 400498 | Current machining count | UInt32 | pieces | Machining count within the current monitoring period |
| 400500 | Cumulative machining count | UInt32 | pieces | |
| 400502 | Shutdown time | UInt32 | seconds | |
| 400504 | Emergency stop time | UInt32 | seconds | |
| 400506 | Standby time | UInt32 | seconds | |
| 400508 | Automatic running time | UInt32 | seconds | |
| 400510 | Setup time | UInt32 | seconds | |
| 400512 | Machine monitored utilization rate | Float | % | |
| 400520 | Cumulative shutdown time | UInt32 | seconds | |
| 400522 | Cumulative emergency stop time | UInt32 | seconds | |
| 400524 | Cumulative standby time | UInt32 | seconds | |
| 400526 | Cumulative automatic running time | UInt32 | seconds | |
| 400528 | Cumulative setup time | UInt32 | seconds | |
| 400546 | Last takt time | UInt32 | seconds | |
| 400600 | Program stack | String(128) | - | Converted to a 128-byte array (64 register addresses) using the encoding set in the MODBUS configuration. |
| 400664 | Current tool offset number | String(16) | - | |
| 400900 | Preset power | Float | % | Preset power of the laser cutting machine |
| 400902 | Actual power | Float | % | Actual power of the laser cutting machine |
| 401100~401135 | Axis 1 to Axis 18 load | Float | % | |
| 401136~401171 | Axis 1 to Axis 18 machine coordinate | Float | same as machine setting | |
| 401172~401207 | Axis 1 to Axis 18 relative coordinate | Float | same as machine setting | |
| 401208~401243 | Axis 1 to Axis 18 remaining distance | Float | same as machine setting | |
| 401244~401279 | Axis 1 to Axis 18 absolute coordinate | Float | same as machine setting | |
| 401400~401405 | Spindle 1 to Spindle 3 cumulative overload time | UInt32 | milliseconds | |
| 401410~401445 | Axis 1 to Axis 18 cumulative overload time | UInt32 | milliseconds | |
| 405000 | Alarm 1 | String(200) | - | Includes alarm content, time, and level |
| 405100 | Alarm 2 | String(200) | - | Same as above |
| 405200 | Alarm 3 | String(200) | - | Same as above |
| 405300 | Alarm 4 | String(200) | - | Same as above |
| 405400 | Alarm 5 | String(200) | - | Same as above |
| 420000~429999 | PLC data bits 1 to 10000 | UInt16 | - | PLC task data and external PLC task data, with PLC task data first followed by external PLC task data, arranged in task order. 32-bit data, 64-bit data, and String-type data are converted to UInt16 using the method set in the MODBUS configuration. |

:::note[Note 1]
The cumulative alarm count and cumulative machining count are the accumulated alarm count and machining count since the gateway started automatically collecting data from this device. These two values are stored in the gateway, bound to the `machineID` (i.e., the last two segments of the machine tool's IP address), and are never reset.
:::

:::note[Note 2]
400502-400510: the machine's state times are the durations of each state within the monitoring period. 400512: the machine's utilization rate is the utilization rate within the monitoring period. See the Bivrost Gateway Manual [6.1.1. Machine OEE Data](https://docs.bivrost.cn/gateway/reference/glossary#machine-oee) for details.
:::

:::note[Note 3]
`String(200)` means this string is converted to a 200-byte array using the configured encoding (see the Bivrost Gateway Manual [5.6.2. MODBUS Configuration](https://docs.bivrost.cn/gateway/usage/communication#modbus)), which corresponds to 100 MODBUS register addresses (UInt16).
:::

:::note[Note 4]
The last takt time is monitored by the gateway's machine takt data task. If the gateway restarts and the first takt cycle has not yet finished, this value is 0. The last takt time is defined the same way as the last cycle time, but the former is calculated by the gateway and is supported by any machine whose output and status can be tracked, while the latter is provided by the machine tool itself and is only supported by some machines.
:::

## 3.2. Group-Related Data {#group-data}

Group-related data is stored uniformly under slave ID 0. The data addresses are as follows:

| Address | Name | Data Type | Unit | Remarks |
| --- | --- | --- | --- | --- |
| 400100 | Group 1 cumulative machining count | UInt32 | pieces | |
| 400102 | Current number of shut-down machines in Group 1 | Int16 | units | |
| 400103 | Current number of emergency-stopped machines in Group 1 | Int16 | units | |
| 400104 | Current number of standby machines in Group 1 | Int16 | units | |
| 400105 | Current number of automatically running machines in Group 1 | Int16 | units | |
| 400106 | Current number of machines in setup in Group 1 | Int16 | units | |
| 400110 | Group 1 shutdown time | UInt32 | seconds | |
| 400112 | Group 1 emergency stop time | UInt32 | seconds | |
| 400114 | Group 1 standby time | UInt32 | seconds | |
| 400116 | Group 1 automatic running time | UInt32 | seconds | |
| 400118 | Group 1 setup time | UInt32 | seconds | |
| 400120 | Group 1 monitored utilization rate | Float | % | |
| 400130 | Group 1 cumulative shutdown time | UInt32 | seconds | |
| 400132 | Group 1 cumulative emergency stop time | UInt32 | seconds | |
| 400134 | Group 1 cumulative standby time | UInt32 | seconds | |
| 400136 | Group 1 cumulative automatic running time | UInt32 | seconds | |
| 400138 | Group 1 cumulative setup time | UInt32 | seconds | |
| 400200~400299 | Group 2 (corresponding addresses are Group 1's addresses + 100) | | | |
| …… | | | | |
| 401600~401699 | Group 16 (corresponding addresses are Group 1's addresses + 1500) | | | |

:::note[Note 1]
400100: the group's cumulative machining count is the accumulated machining count since the gateway started automatically collecting data from this group of devices. See the Bivrost Gateway Manual [6.1.3. Group Machining Count](https://docs.bivrost.cn/gateway/reference/glossary#group-count) for details.
:::

:::note[Note 2]
400110-400118: the group's state times are the durations of each state, within the monitoring period, for all active machines in the group. 400120: the group's monitored utilization rate is the group's utilization rate within the monitoring period. See the Bivrost Gateway Manual [6.1.2. Group OEE Data](https://docs.bivrost.cn/gateway/reference/glossary#group-oee) for details.
:::
