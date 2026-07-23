---
title: "2.9.3. Machine Configuration Interface"
sidebar:
  label: "2.9.3. Machine Configuration"
---


The machine configuration interface is used to retrieve, add, modify, or delete machine configurations. For more information on machine configuration, see the Bivrost Gateway Manual [5.3. Machine Configuration](https://docs.bivrost.cn/gateway/usage/machines). All configuration parameters for a machine are listed in the table below; these parameters are used as request or response parameters in the machine configuration interface.

## Machine Configuration Parameters {#machine-params}

| Parameter | Type | Description |
| --- | --- | --- |
| id | Int32 | Database identifier. See [1.1.4. ID Database Identifier](/en/conventions/identifiers/#db-id) |
| machineType | String | Machine type. See [machineType Machine Type Mapping](#machine-type) |
| system | String | System. The value range corresponds to the System options in the Add Machine window under the English UI language. |
| model | String | Model. The value range corresponds to the Model options in the Add Machine window under the English UI language. |
| name | String | Machine name |
| machineID | String | Machine identifier. See [1.1.1. machineID Machine Identifier](/en/conventions/identifiers/#machineid) |
| slaveID | Int32 | Slave identifier. See [1.1.3. slaveID Slave Identifier](/en/conventions/identifiers/#slaveid) |
| ip | String | IP address |
| port | Int32 | Port number. 0 represents each device's default port. |
| isActive | Bool | Activation status. true = active, false = inactive |
| useDefaultMachineID | Bool | Use default machine identifier |
| useDefaultSlaveID | Bool | Use default slave identifier |
| customAttributes | String | Custom attributes. Example: `{"attribute": value,…}` |
| username | String | Username. Required for some devices. |
| permission | String | Permission. Only required for Delta CNC systems. Range: NORMAL, USER_1, USER_2, MACHIN, SYSTEM. Default is NORMAL. |
| password | String | Password. Required for some devices. |
| version | String | Version. Required for some devices. |
| connectionMode | String | Connection mode. Required for some devices. |
| encoding | String | Encoding, e.g. ASCII, UTF-8, GBK, etc. Default is "default" (auto-detect). |
| language | String | Alarm language. Only required for Siemens systems; currently supports English and Chinese. Default is Chinese. |
| numberOfTasks | Int32 | Number of enabled tasks. Read-only. |
| taskAlarm | Bool | Alarm information task. true = enabled, false = disabled. |
| taskAlarmPrecond | String | Precondition for the alarm information task. Not returned if not set. |
| taskAlarmEnableCustomAlarm | Bool | Custom alarm. true = enabled, false = disabled. When enabled, the custom alarm replaces the default alarm. Custom alarm task execution logic: first check the alarm status; if there is an alarm, retrieve the alarm content. If this tag is empty, skip checking the alarm status and retrieve the alarm content directly, determining the alarm status by whether alarm content is present. |
| taskAlarmCustomAlarmAlarmStatusTag | String | Custom alarm alarmStatus tag. Enter the corresponding PLC data task result tag. |
| taskAlarmCustomAlarmAlarmMsgTag | String | Custom alarm alarmMsg tag. Enter the corresponding PLC data task result tag. |
| taskMachineStatus | Bool | Machine status task. true = enabled, false = disabled. |
| taskChannelMachineStatus | String | Target channel for the machine status task, e.g. "0;1-3". |
| taskMachineStatusPrecond | String | Precondition for the machine status task. Not returned if not set. |
| taskMachineStatusEnableAdjustedManual | Bool | Machine status task setup-status correction. true = enabled, false = disabled. |
| taskMachineStatusMaxManualPauseTime | Int32 | Maximum setup-pause time for the machine status task (seconds). |
| taskMachineStatusEnableStatusConversion | Bool | Machine status task status conversion. true = enabled, false = disabled. |
| taskMachineStatusStatusConversionSettings | String | Status to convert to when the machine status task's condition is met. |
| taskMachineStatusEnableCustomStatus | Bool | Custom machine status task. true = enabled, false = disabled. When enabled, the custom status replaces the default status. |
| taskMachineStatusCustomStatusCNCStatusTag | String | Custom status cncStatus tag. Enter the corresponding PLC data task result tag. |
| taskMachineStatusCustomStatusAlarmStatusTag | String | Custom status alarmStatus tag. Enter the corresponding PLC data task result tag. |
| taskCount | Bool | Machining count task. true = enabled, false = disabled. |
| taskCountPrecond | String | Precondition for the machining count task. Not returned if not set. |
| taskCountEnableCustomCount | Bool | Custom machining count task. true = enabled, false = disabled. When enabled, the custom machining count replaces the default machining count. |
| taskCountCustomCountCountTag | String | Custom machining count tag. Enter the corresponding PLC data task result tag. |
| taskCurrentToolNo | Bool | Current tool number task. true = enabled, false = disabled. |
| taskChannelCurrentToolNo | String | Target channel for the current tool number task, e.g. "0;1-3". |
| taskCurrentToolNoPrecond | String | Precondition for the current tool number task. Not returned if not set. |
| taskEnergyConsumption | Bool | Energy consumption task. true = enabled, false = disabled. |
| taskEnergyConsumptionPrecond | String | Precondition for the energy consumption task. Not returned if not set. |
| taskFeed | Bool | Feed rate task. true = enabled, false = disabled. |
| taskChannelFeed | String | Target channel for the feed rate task, e.g. "0;1-3". |
| taskFeedPrecond | String | Precondition for the feed rate task. Not returned if not set. |
| taskFeedAndSpindle | Bool | Feed rate and spindle speed task. true = enabled, false = disabled. |
| taskChannelFeedAndSpindle | String | Target channel for the feed rate and spindle speed task, e.g. "0;1-3". |
| taskFeedAndSpindlePrecond | String | Precondition for the feed rate and spindle speed task. Not returned if not set. |
| taskLaserPower | Bool | Laser power task. true = enabled, false = disabled. |
| taskFeedPrecond | String | Precondition for the laser power task. Not returned if not set. |
| taskLoad | Bool | Load data task. true = enabled, false = disabled. |
| taskChannelLoad | String | Target channel for the load data task, e.g. "0;1-3". |
| taskLoadPrecond | String | Precondition for the load data task. Not returned if not set. |
| taskLogHistory | Bool | Log history task. true = enabled, false = disabled. |
| taskLogHistoryPrecond | String | Precondition for the log history task. Not returned if not set. |
| taskOverLoad | Bool | Overload monitoring task. true = enabled, false = disabled. |
| taskChannelOverLoad | String | Target channel for the overload monitoring task, e.g. "0;1-3". |
| taskOverLoadPrecond | String | Precondition for the overload monitoring task. Not returned if not set. |
| taskPlcData | Bool | PLC data task. true = enabled, false = disabled. |
| taskPlcDataSettings | String | PLC data task settings |
| taskPosition | Bool | Position data task. true = enabled, false = disabled. |
| taskChannelPosition | String | Target channel for the position data task, e.g. "0;1-3". |
| taskPositionPrecond | String | Precondition for the position data task. Not returned if not set. |
| taskCurrentProgramBlock | Bool | Current program block task. true = enabled, false = disabled. |
| taskCurrentProgramBlockPrecond | String | Precondition for the current program block task. Not returned if not set. |
| taskProgramInfo | Bool | Machining program task. true = enabled, false = disabled. |
| taskChannelProgramInfo | String | Target channel for the machining program task, e.g. "0;1-3". |
| taskProgramInfoPrecond | String | Precondition for the machining program task. Not returned if not set. |
| taskMachineTimeData | Bool | Machine time task. true = enabled, false = disabled. |
| taskMachineTimeDataPrecond | String | Precondition for the machine time task. Not returned if not set. |
| taskToolLife | Bool | Tool life task. true = enabled, false = disabled. |
| taskToolLifePrecond | String | Precondition for the tool life task. Not returned if not set. |
| taskToolLifeGroupNumIndex | String | Target tool for the tool life task, in {tool group number.index within group} format. |
| taskToolLifeIndex | String | Target tool for the tool life task, in {index} format. |
| taskToolLifeToolNum | String | Target tool for the tool life task, in {tool number} format. |
| taskToolLifeToolNumOffsetNum | String | Target tool for the tool life task, in {tool number.offset number} format. |
| taskToolOffset | Bool | Tool offset task. true = enabled, false = disabled. |
| taskChannelToolOffset | String | Target channel for the tool offset task, e.g. "0;1-3". |
| taskToolOffsetPrecond | String | Precondition for the tool offset task. Not returned if not set. |
| taskToolOffsetToolNum | String | Target tool for the tool offset task, in {tool number} format. |
| taskToolOffsetOffsetNum | String | Target tool for the tool offset task, in {offset number} format. |
| taskToolOffsetToolNumOffsetNum | String | Target tool for the tool offset task, in {tool number.offset number} format. |
| taskAlarmHistory | Bool | Alarm history task. true = enabled, false = disabled. |
| taskAlarmHistoryPrecond | String | Precondition for the alarm history task. Not returned if not set. |
| taskCycleData | Bool | Cycle time data task. true = enabled, false = disabled. |
| taskCycleDataPrecond | String | Precondition for the cycle time data task. Not returned if not set. |
| taskOEE | Bool | OEE monitoring task. true = enabled, false = disabled. |
| taskOEEPrecond | String | Precondition for the OEE monitoring task. Not returned if not set. |
| taskExternalPlcDataSettings | String | External PLC task settings |
| parallelProcessing | Int | Number of parallel task processes |
| fileServerType | String | File server type (program transfer). Possible values: Machine Memory, Shared Folder, Shared Folder (Win XP), FTP Server, Wireless Disk, Gateway File Server. |
| fileServerAddress | String | Server address (program transfer). |
| fileServerPort | Int32 | Custom port (program transfer). |
| fileServerUsername | String | Username (program transfer). |
| fileServerPassword | String | Password (program transfer). |
| fileServerUCode | String | U code (program transfer). |
| fileServerRootDir | String | Root directory (program transfer). |
| modbusSlaveID | Int32 | Slave ID (general). Required for MODBUS communication. Default is 1. |
| modbusByteOrder4 | String | 32-bit format. Required for MODBUS communication. Range: DCBA, BADC, ABCD, CDAB. |
| modbusByteOrder8 | String | 64-bit format. Required for MODBUS communication. Range: HGFEDCBA, BADCFEHG, ABCDEFGH, GHEFCDAB. |
| modbusPLCAddress | Bool | Use PLC address. Required for MODBUS communication. true = enabled, false = disabled. When enabled, the target address is offset by +1. |
| modbusReverseString | Bool | Reverse string. Required for MODBUS communication. true = enabled, false = disabled. |
| plcRack | Int32 | Rack number. Required for some devices. |
| plcSlot | Int32 | Slot number. Required for some devices. |
| plcStation | Int32 | Station number. Required for some devices. |
| plcCommunicationFormat | String | Communication format. Required for some devices. |
| plcCommunicationType | String | Communication type. Required for some devices. |
| plcTsapSystemOfNumeration | String | TSAP numeral system. Required for some devices. Range: Decimal, Hexadecimal. |
| plcLocalTsap | String | Local TSAP. Required for some devices. |
| plcRemoteTsap | String | Remote TSAP. Required for some devices. |
| plcRouter | String | Router. Required for some devices. |
| plcDA2 | Int32 | DA2. Required for some devices. |
| plcSA1 | Int32 | SA1. Required for some devices. |
| plcSA2 | Int32 | SA2. Required for some devices. |
| plcGCT | Int32 | GCT. Required for some devices. |
| plcSID | Int32 | SID. Required for some devices. |
| plcSumCheck | Bool | Checksum. Required for some devices. true = enabled, false = disabled. |
| plcReverseString | Bool | Reverse string. Required for some devices. true = enabled, false = disabled. |
| plcAutoRunValue | Int32 | Auto-run status value. Required for some devices. Possible values: 1, 2. Default is 1. |
| plcUseStation | Bool | Use station number. Required for some devices. true = enabled, false = disabled. |

:::note[Note]
The interface only returns parameters that have been set. Parameters such as username, version, connectionMode, and the precondition of each task are not returned when not set. The password parameter is never returned, regardless of whether it has been set. Different machineType values support different tasks, and the interface only returns the parameters relevant to the tasks supported by the machine.
:::

## machineType Machine Type Mapping {#machine-type}

The types currently supported by machineType are listed in the table below.

| machineType | Machine Type |
| --- | --- |
| CNC | CNC |
| LASER | Laser cutting machine |
| PLC | PLC |
| ROBOT | Robot |

## 2.9.3.1. machine Get Machine Configuration {#machine}

```http
GET /api/config/machine?ID=ID&machineID=MACHINEID
```

| Request Parameter | Type | Description |
| --- | --- | --- |
| id | Int32 | Database identifier. See [1.1.4. ID Database Identifier](/en/conventions/identifiers/#db-id) |
| machineID | String | Target machine identifier. See [1.1.1. machineID Machine Identifier](/en/conventions/identifiers/#machineid). If both ID and machineID are provided, machineID is ignored. |

Response example

```json
{
  "id": 1,
  "machineType": "CNC",
  "system": "Mock",
  "model": "General",
  "name": "演示 1",
  "useDefaultMachineID": true,
  "machineID": "1",
  "useDefaultSlaveID": true,
  "slaveID": 1,
  "customAttributes": "",
  "encoding": "Default",
  "ip": "127.0.0.1",
  "port": 0,
  "isActive": true,
  "numberOfTasks": 20,
  "taskAlarm": true,
  "taskAlarmEnableCustomAlarm": false,
  "taskMachineStatus": true,
  "taskChannelMachineStatus": "0",
  "taskMachineStatusEnableAdjustedManual": false,
  "taskMachineStatusMaxManualPauseTime": 600,
  "taskMachineStatusEnableStatusConversion": false,
  "taskMachineStatusEnableCustomStatus": false,
  "taskCount": true,
  "taskCountEnableCustomCount": false,
  "taskCountPrecond": "CNCStatus_cncStatus = \"AUTO_RUN\" and Load_spindleLoad[0] > 50",
  "taskCurrentToolNo": true,
  "taskChannelCurrentToolNo": "0",
  "taskEnergyConsumption": true,
  "taskFeedAndSpindle": true,
  "taskChannelFeedAndSpindle": "0",
  "taskLoad": true,
  "taskChannelLoad": "0",
  "taskLogHistory": true,
  "taskOverLoad": true,
  "taskChannelOverLoad": "0",
  "taskPlcData": true,
  "taskPlcDataSettings": "R,0,10,Int16;Y,0,3,Bit0",
  "taskPosition": true,
  "taskChannelPosition": "0",
  "taskCurrentProgramBlock": true,
  "taskChannelCurrentProgramBlock": "0",
  "taskProgramInfo": true,
  "taskChannelProgramInfo": "0",
  "taskMachineTimeData": true,
  "taskToolLife": true,
  "taskToolOffset": true,
  "taskChannelToolOffset": "0",
  "taskToolOffsetToolNumOffsetNum": "1.2;3-5.1;7-9.1-3",
  "taskAlarmHistory": true,
  "taskCycleData": true,
  "taskOEE": true,
  "parallelProcessing": 1,
  "fileServerType": "Machine Memory",
  "fileServerRootDir": ""
}
```

See [Machine Configuration Parameters](#machine-params) for the response parameters.

## 2.9.3.2. machines Get All Machine Configurations {#machines}

This interface has no request parameters.

```http
GET /api/config/machines
```

Response example

```json
[
  {
    "id": 1,
    "machineType": "CNC",
    "system": "Mock",
    "model": "General",
    "name": "演示 1",
    "useDefaultMachineID": true,
    "machineID": "1",
    "useDefaultSlaveID": true,
    "slaveID": 1,
    "customAttributes": "",
    "encoding": "Default",
    "ip": "127.0.0.1",
    "port": 0,
    "isActive": true,
    "numberOfTasks": 20,
    "taskAlarm": true,
    "taskAlarmEnableCustomAlarm": false,
    "taskMachineStatus": true,
    "taskChannelMachineStatus": "0",
    "taskMachineStatusEnableAdjustedManual": false,
    "taskMachineStatusMaxManualPauseTime": 600,
    "taskMachineStatusEnableStatusConversion": false,
    "taskMachineStatusEnableCustomStatus": false,
    "taskCount": true,
    "taskCountEnableCustomCount": false,
    "taskCountPrecond": "CNCStatus_cncStatus = \"AUTO_RUN\" and Load_spindleLoad[0] > 50",
    "taskCurrentToolNo": true,
    "taskChannelCurrentToolNo": "0",
    "taskEnergyConsumption": true,
    "taskFeedAndSpindle": true,
    "taskChannelFeedAndSpindle": "0",
    "taskLoad": true,
    "taskChannelLoad": "0",
    "taskLogHistory": true,
    "taskOverLoad": true,
    "taskChannelOverLoad": "0",
    "taskPlcData": true,
    "taskPlcDataSettings": "R,0,10,Int16;Y,0,3,Bit0",
    "taskPosition": true,
    "taskChannelPosition": "0",
    "taskCurrentProgramBlock": true,
    "taskChannelCurrentProgramBlock": "0",
    "taskProgramInfo": true,
    "taskChannelProgramInfo": "0",
    "taskMachineTimeData": true,
    "taskToolLife": true,
    "taskToolOffset": true,
    "taskChannelToolOffset": "0",
    "taskToolOffsetToolNumOffsetNum": "1.2;3-5.1;7-9.1-3",
    "taskAlarmHistory": true,
    "taskCycleData": true,
    "taskOEE": true,
    "parallelProcessing": 1,
    "fileServerType": "Machine Memory",
    "fileServerRootDir": ""
  },
  {
    "id": 2,
    "machineType": "PLC",
    "system": "Standard Protocols",
    "model": "Modbus TCP",
    "name": "2",
    "useDefaultMachineID": true,
    "machineID": "2",
    "useDefaultSlaveID": true,
    "slaveID": 2,
    "customAttributes": "",
    "encoding": "Default",
    "ip": "127.0.0.2",
    "port": 0,
    "isActive": true,
    "numberOfTasks": 2,
    "taskAlarm": false,
    "taskAlarmEnableCustomAlarm": false,
    "taskMachineStatus": false,
    "taskChannelMachineStatus": "0",
    "taskMachineStatusEnableAdjustedManual": false,
    "taskMachineStatusMaxManualPauseTime": 600,
    "taskMachineStatusEnableStatusConversion": false,
    "taskMachineStatusEnableCustomStatus": false,
    "taskCount": false,
    "taskCountEnableCustomCount": false,
    "taskPlcData": true,
    "taskPlcDataSettings": "4x,100,2,Int32;0x,100,10,Bit0;",
    "taskAlarmHistory": false,
    "taskOEE": false,
    "parallelProcessing": 1,
    "modbusSlaveID": 1,
    "modbusByteOrder4": "DCBA",
    "modbusByteOrder8": "HGFEDCBA",
    "modbusPLCAddress": false,
    "modbusReverseString": false
  }
]
```

See [Machine Configuration Parameters](#machine-params) for the response parameters.

## 2.9.3.3. create-machine Add Machine Configuration {#create-machine}

```http
POST /api/config/create-machine
```

Request body example

```json
{
  "machineType": "PLC",
  "system": "Standard Protocols",
  "model": "Modbus TCP",
  "name": "150",
  "useDefaultMachineID": false,
  "machineID": "M150",
  "useDefaultSlaveID": true,
  "ip": "127.0.0.150",
  "isActive": true,
  "taskPlcData": true,
  "taskPlcDataSettings": "4x,100,2,Int32;0x,100,10,Bit0;"
}
```

See [Machine Configuration Parameters](#machine-params) for the request parameters. Note that the database identifier id does not need to be set in the request body; it is automatically assigned by the gateway and appears in the response body after successful creation.

Response example

```json
{
  "id": 21,
  "machineType": "PLC",
  "system": "Standard Protocols",
  "model": "Modbus TCP",
  "name": "150",
  "useDefaultMachineID": false,
  "machineID": "M150",
  "useDefaultSlaveID": true,
  "slaveID": 150,
  "customAttributes": "",
  "encoding": "Default",
  "ip": "127.0.0.150",
  "port": 0,
  "isActive": true,
  "numberOfTasks": 2,
  "taskAlarm": false,
  "taskAlarmEnableCustomAlarm": false,
  "taskMachineStatus": false,
  "taskChannelMachineStatus": "0",
  "taskMachineStatusEnableAdjustedManual": false,
  "taskMachineStatusMaxManualPauseTime": 600,
  "taskMachineStatusEnableStatusConversion": false,
  "taskMachineStatusEnableCustomStatus": false,
  "taskCount": false,
  "taskCountEnableCustomCount": false,
  "taskPlcData": true,
  "taskPlcDataSettings": "4x,100,2,Int32;0x,100,10,Bit0;",
  "taskAlarmHistory": false,
  "taskOEE": false,
  "parallelProcessing": 1,
  "modbusSlaveID": 1,
  "modbusByteOrder4": "DCBA",
  "modbusByteOrder8": "HGFEDCBA",
  "modbusPLCAddress": false,
  "modbusReverseString": false
}
```

See [Machine Configuration Parameters](#machine-params) for the response parameters.

## 2.9.3.4. update-machine Modify Machine Configuration {#update-machine}

Modifies the configuration of the specified machine and returns the updated machine configuration.

```http
POST /api/config/update-machine
```

Request body example

```json
{
  "id": 21,
  "name": "newName",
  "useDefaultMachineID": false,
  "machineID": "newMachineID",
  "useDefaultSlaveID": false,
  "slaveID": 192,
  "ip": "127.0.0.192",
  "port": 6000,
  "isActive": false,
  "taskPlcData": false
}
```

See [Machine Configuration Parameters](#machine-params) for the request parameters. Note: this interface uses id as the unique identifier, so the database identifier id must be set in the request body. The machine identifier machineID can be modified through this interface.

Response example

```json
{
  "id": 21,
  "machineType": "PLC",
  "system": "Standard Protocols",
  "model": "Modbus TCP",
  "name": "newName",
  "useDefaultMachineID": false,
  "machineID": "newMachineID",
  "useDefaultSlaveID": true,
  "slaveID": 192,
  "customAttributes": "",
  "encoding": "Default",
  "ip": "127.0.0.150",
  "port": 6000,
  "isActive": false,
  "numberOfTasks": 0,
  "taskAlarm": false,
  "taskAlarmEnableCustomAlarm": false,
  "taskMachineStatus": false,
  "taskChannelMachineStatus": "0",
  "taskMachineStatusEnableAdjustedManual": false,
  "taskMachineStatusMaxManualPauseTime": 600,
  "taskMachineStatusEnableStatusConversion": false,
  "taskMachineStatusEnableCustomStatus": false,
  "taskCount": false,
  "taskCountEnableCustomCount": false,
  "taskPlcData": false,
  "taskPlcDataSettings": "4x,100,2,Int32;0x,100,10,Bit0;",
  "taskAlarmHistory": false,
  "taskOEE": false,
  "parallelProcessing": 1,
  "modbusSlaveID": 1,
  "modbusByteOrder4": "DCBA",
  "modbusByteOrder8": "HGFEDCBA",
  "modbusPLCAddress": false,
  "modbusReverseString": false
}
```

See [Machine Configuration Parameters](#machine-params) for the response parameters.

## 2.9.3.5. delete-machine Delete Machine Configuration {#delete-machine}

```http
GET /api/config/delete-machine?ID=ID&machineID=MACHINEID
```

| Request Parameter | Type | Description |
| --- | --- | --- |
| id | Int32 | Database identifier. See [1.1.4. ID Database Identifier](/en/conventions/identifiers/#db-id) |
| machineID | String | Target machine identifier. See [1.1.1. machineID Machine Identifier](/en/conventions/identifiers/#machineid). If both ID and machineID are provided, machineID is ignored. |

Response example

```json
{
  "errorCode": 0,
  "errorMsg": "Success"
}
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| errorCode | Int32 | (Required) Error code. 0 indicates success. |
| errorMsg | String | (Required) Error message |

## 2.9.3.6. batch-delete-machines Batch Delete Machine Configurations {#batch-delete-machines}

This interface is the batch version of [2.9.3.5. delete-machine Delete Machine Configuration](#delete-machine). By including database IDs in the request body, multiple machines can be deleted at once.

```http
POST /api/config/batch-delete-machines
```

Request body example application/json

```json
{
  "ids": [
    2,
    3,
    4
  ]
}
```

| Request Parameter | Type | Description |
| --- | --- | --- |
| ids | Int32[] | (Required) Database identifiers. See [1.1.4. ID Database Identifier](/en/conventions/identifiers/#db-id) |

Response example

```json
{
  "deleted": 3
}
```

The response body reflects the execution result corresponding to the request, in the order given in the request body.

| Response Parameter | Type | Description |
| --- | --- | --- |
| deleted | Int32 | (Required) Number of machines deleted |
