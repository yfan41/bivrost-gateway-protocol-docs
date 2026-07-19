---
title: "2.9.3. 机台配置接口"
sidebar:
  label: "2.9.3. 机台配置"
---


机台配置接口用于获取、新增、修改，或删除机台配置。机台配置相关说明可以参考《说明书》[5.3. 机台配置](https://gateway.docs.bivrost.cn/usage/machines)。机台的所有配置参数如下表，这些参数在机台配置接口中作为请求参数或返回参数。

## 机台配置参数 {#machine-params}

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| id | Int32 | 数据库标识，详见 [1.1.4. ID 数据库标识](/conventions/identifiers/#db-id) |
| machineType | String | 机台类型，详见 [machineType 对应机台类型](#machine-type) |
| system | String | 系统，范围为英文语言下添加机台窗口中的系统选项 |
| model | String | 型号，范围为英文语言下添加机台窗口中的型号选项 |
| name | String | 机台名 |
| machineID | String | 机台标识，详见 [1.1.1. machineID 机台标识](/conventions/identifiers/#machineid) |
| slaveID | Int32 | 从站标识，详见 [1.1.3. salveID 从站标识](/conventions/identifiers/#slaveid) |
| ip | String | IP 地址 |
| port | Int32 | 端口号，0 代表各设备的默认端口。 |
| isActive | Bool | 激活状态，true=激活，false=未激活 |
| useDefaultMachineID | Bool | 使用默认机台标识 |
| useDefaultSlaveID | Bool | 使用默认从站标识 |
| customAttributes | String | 自定义属性，示例：`{"attribute": value,…}` |
| username | String | 用户名，部分设备需要。 |
| permission | String | 权限，仅 Delta 台达 CNC 系统需要设置，范围：NORMAL，USER_1，USER_2，MACHIN，SYSTEM。默认为 NORMAL。 |
| password | String | 密码，部分设备需要。 |
| version | String | 版本，部分设备需要。 |
| connectionMode | String | 连接方式，部分设备需要。 |
| encoding | String | 编码，如 ASCII，UTF-8，GBK 等。默认为 default 自动获取。 |
| language | String | 警报语言。仅 Siemens 西门子系统需要设置，目前支持 English，Chinese。默认为 Chinese。 |
| numberOfTasks | Int32 | 启用的任务数。只读。 |
| taskAlarm | Bool | 警报信息任务，true=开启，false=关闭。 |
| taskAlarmPrecond | String | 警报信息任务前置条件，未返回代表未设置。 |
| taskAlarmEnableCustomAlarm | Bool | 自定义警报，true=开启，false=关闭。开启后以自定义警报代替默认警报。自定义警报任务执行逻辑：先检查警报状态，如有警报，则获取警报内容。如果此标签为空，则跳过检查警报状态，直接获取警报内容，以是否有警报内容判断警报状态。 |
| taskAlarmCustomAlarmAlarmStatusTag | String | 自定义警报 alarmStaus 标签，填入对应 PLC 数据任务结果标签。 |
| taskAlarmCustomAlarmAlarmMsgTag | String | 自定义警报 alarmMsg 标签，填入对应 PLC 数据任务结果标签。 |
| taskMachineStatus | Bool | 机台状态任务，true=开启，false=关闭。 |
| taskChannelMachineStatus | String | 机台状态任务目标通道，如 "0;1-3"。 |
| taskMachineStatusPrecond | String | 机台状态任务前置条件，未返回代表未设置。 |
| taskMachineStatusEnableAdjustedManual | Bool | 机台状态任务调机状态修正，true=开启，false=关闭。 |
| taskMachineStatusMaxManualPauseTime | Int32 | 机台状态任务最长调机暂停时间(秒)。 |
| taskMachineStatusEnableStatusConversion | Bool | 机台状态任务状态转换，true=开启，false=关闭。 |
| taskMachineStatusStatusConversionSettings | String | 机台状态任务满足条件时转换状态。 |
| taskMachineStatusEnableCustomStatus | Bool | 自定义机台状态任务，true=开启，false=关闭。开启后以自定义状态代替默认状态。 |
| taskMachineStatusCustomStatusCNCStatusTag | String | 自定义状态 cncStatus 标签，填入对应 PLC 数据任务结果标签。 |
| taskMachineStatusCustomStatusAlarmStatusTag | String | 自定义状态 alarmStatus 标签，填入对应 PLC 数据任务结果标签。 |
| taskCount | Bool | 加工计数任务，true=开启，false=关闭。 |
| taskCountPrecond | String | 加工计数任务前置条件，未返回代表未设置。 |
| taskCountEnableCustomCount | Bool | 自定义加工计数任务，true=开启，false=关闭。开启后以自定义加工计数代替默认加工计数。 |
| taskCountCustomCountCountTag | String | 自定义加工计数标签，填入对应 PLC 数据任务结果标签。 |
| taskCurrentToolNo | Bool | 当前刀号任务，true=开启，false=关闭。 |
| taskChannelCurrentToolNo | String | 当前刀号任务目标通道，如 "0;1-3"。 |
| taskCurrentToolNoPrecond | String | 当前刀号任务前置条件，未返回代表未设置。 |
| taskEnergyConsumption | Bool | 能耗任务，true=开启，false=关闭。 |
| taskEnergyConsumptionPrecond | String | 能耗任务前置条件，未返回代表未设置。 |
| taskFeed | Bool | 进给任务，true=开启，false=关闭。 |
| taskChannelFeed | String | 进给任务目标通道，如 "0;1-3"。 |
| taskFeedPrecond | String | 进给任务前置条件，未返回代表未设置。 |
| taskFeedAndSpindle | Bool | 进给转速任务，true=开启，false=关闭。 |
| taskChannelFeedAndSpindle | String | 进给转速任务目标通道，如 "0;1-3"。 |
| taskFeedAndSpindlePrecond | String | 进给转速任务前置条件，未返回代表未设置。 |
| taskLaserPower | Bool | 激光功率任务，true=开启，false=关闭。 |
| taskFeedPrecond | String | 激光功率任务前置条件，未返回代表未设置。 |
| taskLoad | Bool | 负载数据任务，true=开启，false=关闭。 |
| taskChannelLoad | String | 负载数据任务目标通道，如 "0;1-3"。 |
| taskLoadPrecond | String | 负载数据任务前置条件，未返回代表未设置。 |
| taskLogHistory | Bool | 日志历史任务，true=开启，false=关闭。 |
| taskLogHistoryPrecond | String | 日志历史任务前置条件，未返回代表未设置。 |
| taskOverLoad | Bool | 过载监控任务，true=开启，false=关闭。 |
| taskChannelOverLoad | String | 过载监控任务目标通道，如 "0;1-3"。 |
| taskOverLoadPrecond | String | 过载监控任务前置条件，未返回代表未设置。 |
| taskPlcData | Bool | PLC 数据任务，true=开启，false=关闭。 |
| taskPlcDataSettings | String | PLC 数据任务设置 |
| taskPosition | Bool | 坐标数据任务，true=开启，false=关闭。 |
| taskChannelPosition | String | 坐标数据任务目标通道，如 "0;1-3"。 |
| taskPositionPrecond | String | 坐标数据任务前置条件，未返回代表未设置。 |
| taskCurrentProgramBlock | Bool | 当前程序段任务，true=开启，false=关闭。 |
| taskCurrentProgramBlockPrecond | String | 当前程序段任务前置条件，未返回代表未设置。 |
| taskProgramInfo | Bool | 加工程序任务，true=开启，false=关闭。 |
| taskChannelProgramInfo | String | 加工程序任务目标通道，如 "0;1-3"。 |
| taskProgramInfoPrecond | String | 加工程序任务前置条件，未返回代表未设置。 |
| taskMachineTimeData | Bool | 机台时间任务，true=开启，false=关闭。 |
| taskMachineTimeDataPrecond | String | 机台时间任务前置条件，未返回代表未设置。 |
| taskToolLife | Bool | 刀具寿命任务，true=开启，false=关闭。 |
| taskToolLifePrecond | String | 刀具寿命任务前置条件，未返回代表未设置。 |
| taskToolLifeGroupNumIndex | String | 刀具寿命任务目标刀具，{刀组号.组内序号}格式。 |
| taskToolLifeIndex | String | 刀具寿命任务目标刀具，{序号}格式。 |
| taskToolLifeToolNum | String | 刀具寿命任务目标刀具，{刀具号}格式。 |
| taskToolLifeToolNumOffsetNum | String | 刀具寿命任务目标刀具，{刀具号.刀补号}格式。 |
| taskToolOffset | Bool | 刀具补偿任务，true=开启，false=关闭。 |
| taskChannelToolOffset | String | 刀具补偿任务目标通道，如 "0;1-3"。 |
| taskToolOffsetPrecond | String | 刀具补偿任务前置条件，未返回代表未设置。 |
| taskToolOffsetToolNum | String | 刀具补偿任务目标刀具，{刀具号}格式。 |
| taskToolOffsetOffsetNum | String | 刀具补偿任务目标刀具，{刀补号}格式。 |
| taskToolOffsetToolNumOffsetNum | String | 刀具补偿任务目标刀具，{刀具号.刀补号}格式。 |
| taskAlarmHistory | Bool | 警报历史任务，true=开启，false=关闭。 |
| taskAlarmHistoryPrecond | String | 警报历史任务前置条件，未返回代表未设置。 |
| taskCycleData | Bool | 节拍数据任务，true=开启，false=关闭。 |
| taskCycleDataPrecond | String | 节拍数据前置条件，未返回代表未设置。 |
| taskOEE | Bool | OEE 监控任务，true=开启，false=关闭。 |
| taskOEEPrecond | String | OEE 监控任务前置条件，未返回代表未设置。 |
| taskExternalPlcDataSettings | String | 外部 PLC 任务设置 |
| parallelProcessing | Int | 并行任务处理数 |
| fileServerType | String | 文件服务器类型（程序传输），可能的值有 Machine Memory，Shared Folder，Shared Folder (Win XP)，FTP Server，Wireless Disk，Gateway File Server。 |
| fileServerAddress | String | 服务器地址（程序传输）。 |
| fileServerPort | Int32 | 自定义端口（程序传输）。 |
| fileServerUsername | String | 用户名（程序传输）。 |
| fileServerPassword | String | 密码（程序传输）。 |
| fileServerUCode | String | U 码（程序传输）。 |
| fileServerRootDir | String | 根目录（程序传输）。 |
| modbusSlaveID | Int32 | 从站 ID（常规），MODBUS 通讯需要，默认为 1。 |
| modbusByteOrder4 | String | 32 位型格式，MODBUS 通讯需要，范围：DCBA，BADC，ABCD，CDAB。 |
| modbusByteOrder8 | String | 64 位型格式，MODBUS 通讯需要，范围：HGFEDCBA，BADCFEHG，ABCDEFGH，GHEFCDAB。 |
| modbusPLCAddress | Bool | 使用 PLC 地址，MODBUS 通讯需要，true=开启，false=关闭。启用后目标地址位偏移 +1。 |
| modbusReverseString | Bool | 反转字符串，MODBUS 通讯需要，true=开启，false=关闭。 |
| plcRack | Int32 | 机架号，部分设备需要。 |
| plcSlot | Int32 | 槽号，部分设备需要。 |
| plcStation | Int32 | 站号，部分设备需要。 |
| plcCommunicationFormat | String | 通讯格式，部分设备需要。 |
| plcCommunicationType | String | 通讯类型，部分设备需要。 |
| plcTsapSystemOfNumeration | String | TSAP 进制，部分设备需要，范围：Decimal，Hexadecimal。 |
| plcLocalTsap | String | 本地 TSAP，部分设备需要。 |
| plcRemoteTsap | String | 远程 TSAP，部分设备需要。 |
| plcRouter | String | 路由，部分设备需要。 |
| plcDA2 | Int32 | DA2，部分设备需要。 |
| plcSA1 | Int32 | SA1，部分设备需要。 |
| plcSA2 | Int32 | SA2，部分设备需要。 |
| plcGCT | Int32 | GCT，部分设备需要。 |
| plcSID | Int32 | SID，部分设备需要。 |
| plcSumCheck | Bool | 和检验，部分设备需要，true=开启，false=关闭。 |
| plcReverseString | Bool | 反转字符串，部分设备需要，true=开启，false=关闭。 |
| plcAutoRunValue | Int32 | 自动运行状态值，部分设备需要，可能的值有 1，2。默认为 1。 |
| plcUseStation | Bool | 使用站号，部分设备需要，true=开启，false=关闭。 |

:::note[注]
接口仅返回已设置项，如 username，version，connectionMode，各任务的前置条件等参数，在未设置时，不会返回。password 参数无论是否已设置都不会返回。机台的 machineType 参数不同，支持的任务不同，接口仅返回支持任务的相关参数。
:::

## machineType 对应机台类型 {#machine-type}

当前 machineType 支持的类型如下表。

| machineType | 机台类型 |
| --- | --- |
| CNC | CNC |
| LASER | 激光切割机 |
| PLC | PLC |
| ROBOT | 机器人 |

## 2.9.3.1. machine 获取机台配置 {#machine}

```http
GET /api/config/machine?ID=ID&machineID=MACHINEID
```

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| id | Int32 | 数据库标识，详见 [1.1.4. ID 数据库标识](/conventions/identifiers/#db-id) |
| machineID | String | 目标机台标识，详见 [1.1.1. machineID 机台标识](/conventions/identifiers/#machineid)。如 ID 与 machineID 同时输入，machineID 被忽略。 |

返回示例

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

返回参数见[机台配置参数](#machine-params)。

## 2.9.3.2. machines 获取所有机台配置 {#machines}

此接口无请求参数。

```http
GET /api/config/machines
```

返回示例

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

返回参数见[机台配置参数](#machine-params)。

## 2.9.3.3. create-machine 添加机台配置 {#create-machine}

```http
POST /api/config/create-machine
```

请求体示例

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

请求参数见[机台配置参数](#machine-params)。注意请求体中不用设置数据库标识 id，id 由网关自动分配，创建成功后出现在返回体中。

返回示例

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

返回参数见[机台配置参数](#machine-params)。

## 2.9.3.4. update-machine 修改机台配置 {#update-machine}

修改指定机台的配置信息并返回修改后的机台配置信息。

```http
POST /api/config/update-machine
```

请求体示例

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

请求参数见[机台配置参数](#machine-params)。注意：此接口使用 id 作为唯一标识，请求体中必须设置数据库标识 id。机台标识 machineID 可以通过这个接口修改。

返回示例

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

返回参数见[机台配置参数](#machine-params)。

## 2.9.3.5. delete-machine 删除机台配置 {#delete-machine}

```http
GET /api/config/delete-machine?ID=ID&machineID=MACHINEID
```

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| id | Int32 | 数据库标识，详见 [1.1.4. ID 数据库标识](/conventions/identifiers/#db-id) |
| machineID | String | 目标机台标识，详见 [1.1.1. machineID 机台标识](/conventions/identifiers/#machineid)。如 ID 与 machineID 同时输入，machineID 被忽略。 |

返回示例

```json
{
  "errorCode": 0,
  "errorMsg": "Success"
}
```

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| errorCode | Int32 | (必需)错误码，0 代表成功。 |
| errorMsg | String | (必需)错误内容 |

## 2.9.3.6. batch-delete-machines 批量删除机台配置 {#batch-delete-machines}

此接口为 [2.9.3.5. delete-machine 删除机台配置](#delete-machine)的批量版本，通过在请求体中补充数据库 ID，可以一次删除多个机台。

```http
POST /api/config/batch-delete-machines
```

请求体示例 application/json

```json
{
  "ids": [
    2,
    3,
    4
  ]
}
```

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| ids | Int32[] | (必需) 数据库标识，详见 [1.1.4. ID 数据库标识](/conventions/identifiers/#db-id) |

返回示例

```json
{
  "deleted": 3
}
```

返回体中依次为请求体中的请求的执行结果。

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| deleted | Int32 | (必需)删除机台数 |
