---
title: "版本变更历史记录"
sidebar:
  label: "版本变更历史记录"
---


### v1.19.7（2026-07-19）{#v1-19-7}

发布时间：2026-07-19

1. 机台配置新增参数 NetworkErrorAsOffline（网络错误视为离线）。
2. 新增广数 25i 机型支持。
3. 任务后处理新增函数 GetSetBitIndices。
4. 新增网关功能接口 hardware-resources 获取网关硬件资源。

### v1.19.6（2026-07-02）{#v1-19-6}

发布时间：2026-07-02

1. 移除数据类 AlarmHistory 警报历史，AlarmLog 当前警报中失效的字段。
2. CNCStatus 运行状态增加新的细分等待状态，并新增说明列。

### v1.19.5（2026-06-15）{#v1-19-5}

发布时间：2026-06-15

1. 接口 selectProgram 选择程序修改，新增参数 mode 执行模式。

### v1.19.4（2026-02-11）{#v1-19-4}

发布时间：2026-06-05

1. 鉴权方式修改，原 API Key 方式改为 Secret Key 方式。
2. 原机台任务 Cumulative Status Time 累计状态时间合并入 Machine Status 机台状态任务，获取机台状态的同时自动累计时间。
3. Cycle 节拍数据新增变量 LastTotalTime 上次节拍总时间。
4. `/api/analysis/cycle` 机台节拍数据分析接口，`/api/group-analysis/cycle` 机组节拍数据分析接口，新增输出变量 StartTime 节拍开始时间。
5. 机组号由 1-8 扩展到 1-16。
6. 修订支持的 RPC 接口表。
7. Feed 数据类新增 CmdFeed 字段。FeedAndSpindle 数据类新增 CmdFeed 与 CmdSpindle 字段。
8. 《说明书》章节变动，变更相应引用位置。
9. 修改 MODBUS 通讯中从站 ID 相关说明。

### v1.19.3（2025-12-22）{#v1-19-3}

发布时间：2025-12-22

1. 修正错误描述。readCount 读取加工计数接口，返回响应，数据 count 的类型，修正为 Int32。
2. 移除不再使用的数据类 AxialLoad 伺服轴负载类与 SpindleLoad 主轴负载类。如需相关数据，应使用数据类 Load 负载数据。
3. 合并数据类 ToolLife 刀具寿命与 ToolLifeDetails 刀具寿命详情类。
4. 新增鉴权方式与鉴权接口说明。
5. 修订接口分类，文件传输接口更名为文件管理接口。
6. 新增接口：readErrorSummary 读取状态简报，searchFile 搜索机台文件。
7. 新增数据类型 LogHistory 日志历史，新增相应机台任务。
8. 从 MQTT 设置参数中移除已失效参数，UseGatewayAlias 引用网关名，和 KeepAliveInterval 保活周期。
9. 机台配置参数新增 numberOfTasks 启用的任务数，自定义状态相关参数，自定义警报相关参数，自定义加工计数相关参数。
10. 更新刀具补偿数据标签组合表。
11. 更新刀具寿命数据标签组合表。
12. 新增接口 remote-access 获取远程访问设置与 update-remote-access 修改远程访问设置。
13. ReadPlcData 接口，WritePlcData 接口，新增请求参数 Channel（通道号）支持。
14. 修改以下接口：
   - `/api/gateway/wifi`
   - `/api/gateway/update-wifi`
   - `/api/gateway/search-wifi`
   - `/api/config/gateway-info`
   - `/api/config/cloud-settings`
   - `/api/config/update-cloud-settings`
15. 新增接口 `/core/license-info`。

### v1.19.2（2025-06-03）{#v1-19-2}

发布时间：2025-06-03

1. 新增以下接口
   - `/config/batch-delete-machines`
   - `/config/batch-delete-groups`
   - `/analysis/cycle`
   - `/group-analysis/cycle`
2. 原机台任务 alarm 警报信息，拆分为 alarm 当前警报与 alarmHistory 警报历史。
3. 调整部分机台配置接口的变量名与顺序。
4. 移除过载监控设置中的变量 monitorOverloadInterval，在机台任务间隔设置中新增变量 readOverloadInteral 代替。

### v1.19.1（2025-05-14）{#v1-19-1}

发布时间：2025-05-14

1. Fanuc 型号 PMi 改为 Power Motion i-A。
2. 修复失效超链接。
3. 更新刀具寿命数据标签组合表。
4. 新增以下接口
   - `/core/restart`
   - `/config/settings`
   - `/config/update-settings`
   - `/config/update-security`
   - `/config/remote-access`
   - `/config/update-remote-access`
   - `/gateway/alias`
   - `/gateway/update-alias`
   - `/gateway/time`
   - `/gateway/sync-time`
   - `/gateway/time-zone`
   - `/gateway/update-time-zone`
   - `/gateway/system-locale`
   - `/gateway/update-system-locale`
   - `/gateway/lan`
   - `/gateway/update-lan`
   - `/gateway/wifi`
   - `/gateway/update-wifi`
   - `/gateway/search-wifi`
   - `/gateway/connect-wifi`
   - `/gateway/disconnect-wifi`
   - `/gateway/static-routing`
   - `/gateway/update-static-routing`
   - `/gateway/connect-remote-host`
   - `/gateway/disconnect-remote-host`
   - `/gateway/list-file-server-items`
   - `/gateway/delete-file-server-item`
   - `/gateway/network-adapters`
   - `/api/cnc/readLog`
5. 调整部分机台配置接口的变量名与顺序。

### v1.18.8（2024-11-08）{#v1-18-8}

发布时间：2024-11-08

1. 新增机台配置接口中的大量字段。
2. 修正机台配置接口中的 taskEnergy 的拼写错误。
3. 新增获取机台状态监控设置接口的部分字段。

### v1.18.1（2024-06-14）{#v1-18-1}

发布时间：2024-06-14

1. 新增网关功能接口与配置接口。
2. 新增 ID 数据库标识说明。
3. 修正接口 batchDeleteFile 批量删除机台文件内容。

### v1.18.0（2024-04-29）{#v1-18-0}

发布时间：2024-04-29

1. 调整部分文档内容。

### v1.17.6（2024-04-16）{#v1-17-6}

发布时间：2024-04-16

1. 新增 HTTP 接口，RPC 接口：readAllPrograms 浏览所有文件。此接口用于获取指定路径下所有的程序名及其路径，包括子文件夹下的（如果机台支持切换目录）。
2. 新增 MAZAK 马扎克机床刀具补偿刀具寿命相关说明。

### v1.17.5（2024-04-01）{#v1-17-5}

发布时间：2024-04-01

1. 移除 Cycle：节拍数据中不再使用的字段 runningPrgName。
2. CNCStatus：机台状态数据中，新增字段 adjustedStatus。

### v1.17.3（2024-03-29）{#v1-17-3}

发布时间：2024-03-29

1. 移除 Cycle：节拍数据中不再使用的字段 runningPrgName。
2. readPlcData 接口，如果获取的 Double 类型数值为 double.Nan，原先会转为 double.Min 输出，现在支持直接输出 double.Nan。

### v1.17.2（2024-03-19）{#v1-17-2}

发布时间：2024-03-19

1. 新增 HTTP 接口，RPC 接口：selectProgram 选择程序。

### v1.17.1（2024-03-19）{#v1-17-1}

发布时间：2024-03-19

1. 新增 HTTP 接口，RPC 接口：batchReadErrors 批量读取机台连接状态。

### v1.17.0（2024-03-15）{#v1-17-0}

发布时间：2024-03-15

1. 修改批量处理任务接口 batchReadOffsetData，batchReadToolLife，batchReadToolLifeDetails 的返回体，现在如果某条请求失败时，返回体数组对应位置为其错误信息。

### v1.16.5（2024-03-08）{#v1-16-5}

发布时间：2024-03-08

1. HTTP 接口，RPC 接口中的文件传输接口分类，新增接口 batchDeleteFile 批量删除机台文件。

### v1.16.4（2024-03-08）{#v1-16-4}

发布时间：2024-03-08

1. HTTP 接口，RPC 接口中的文件传输接口分类，新增接口 batchSendFile 批量发送文件至机台。

### v1.16.3（2024-03-08）{#v1-16-3}

发布时间：2024-03-08

1. HTTP 接口，RPC 接口中的文件传输接口分类，新增接口 backupFiles 备份机台文件。

### v1.16.2（2024-03-04）{#v1-16-2}

发布时间：2024-03-04

1. HTTP 接口，RPC 接口新增接口分类，历史数据接口，包括 machine 机台历史数据和 group-machine 机组内所有机台历史数据。
2. 数据读写接口中的 readTaskData 读取机台任务数据，batchReadTaskData 批量读取机台任务数据，readGroupTaskData 读取机组任务数据，batchReadGroupTaskData 批量读取机组任务数据，新增返回参数 time 数据的获取时间。
3. MQTT 通讯，新增 MQTT 模式 IoTDA 相关说明。
4. 调整 readPlcData 读取 PLC 数据与 writePlcData 写入 PLC 数据接口相关内容，新增部分支持机床系统说明。

### v1.16.1（2024-02-21）{#v1-16-1}

发布时间：2024-02-21

1. 调整文档内容结构，新增章节《一、重要说明》，将各通讯方式通用的说明内容移入新章节。其它章节序号顺应调整。
2. 新增数据类 AxialLoad：伺服轴负载，LaserPower：激光功率，Offset：刀补数据，SpindleLoad：主轴负载。
3. 部分数据类增加新标签 channel 通道号。

### v1.16.0（2024-01-30）{#v1-16-0}

发布时间：2024-02-05

1. HTTP 接口，RPC 接口，MQTT 与数据库中的机组号 groupNum 被替代为机组标识 groupID。

### v1.15.7（2024-01-20）{#v1-15-7}

发布时间：2024-02-04

1. 修改 Fanuc [0i-D, 0i-F, 30i, 31i, 32i, 35i, PMi]的默认根目录路径为 `//CNC_MEM/`。

### v1.15.5（2024-01-22）{#v1-15-5}

发布时间：2024-02-04

1. 更新文件传输接口支持系统型号相关表格。

### v1.15.3（2023-12-26）{#v1-15-3}

发布时间：2024-02-04

1. 所有文件传输接口新增 subDir 参数支持。
2. HTTP 与 RPC 接口 `/ToolLife` 接口的 rawRemainingCount，rawPrewarningRemainingCount 类型由 Double 改为 Int32。

### v1.15.2（2023-12-18）{#v1-15-2}

发布时间：2024-02-04

1. 新增 HTTP 接口 `/sendFileStream` 和 `/receiveFileStream` 接口以支持大文件传输。

### v1.15.1（2023-12-06）{#v1-15-1}

发布时间：2024-02-02

1. 修订部分说明内容。

### v1.15.0（2023-11-28）{#v1-15-0}

发布时间：2023-11-28

1. 新增 HTTP 与 RPC 接口 `/bathReadGroupTaskData`。
2. `/readPlcData` 接口新增 Siemens 西门子[通用型]对 S7 标签支持的说明。
3. `/readTimeData` 接口新增返回参数 remainingCycleTimeMin 与 remainingCycleTimeMs。
4. 新增了 Kede 科德机床相关说明。
5. `/readProgramInfo`，`/readProgramBlock` 接口说明，新增请求参数 channel 支持。
6. 更正了数据上报报文 type 中 Position 的拼写错误。
7. 修正了文件传输接口中，关键词首字母大写的问题。现在所有接口的关键词首字母均为小写。
8. 修改 Modbus 通讯中轴名称的地址位长度为 2，以支持最多 4 个字符的轴名。
9. 在 MODBUS 通讯与 MQTT 通讯中补充外部 PLC 任务数据相关内容。

### v1.14.0（2023-11-01）{#v1-14-0}

发布时间：2023-11-01

1. 新增 HTTP 与 RPC 接口 `/readTaskData`，`/bathReadTaskData`，`/readGroupTaskData`。
2. 修正接口 `/readTimeData` 中对广数机床能获取到数据的错误描述。补充了新支持设备系统型号的说明。
3. 修改了 `/readPlcData` 与 `/writePlcData` 中请求 area 的格式。
4. 修改章节一、HTTP 通讯中接口说明的格式。
5. 修改章节 3.1. 数据上报报文格式中的内容。

### v1.13.0（2023-10-23）{#v1-13-0}

发布时间：2023-10-23

1. 新增 HTTP 与 RPC 接口 `/batchReadOffsetData`，`/bathReadToolLife`，`/bathReadToolLifeDetails`。

### v1.12.0（2023-09-26）{#v1-12-0}

发布时间：2023-09-26

1. 新增 HTTP 和 RPC 接口 `/readTaskData`，从网关缓存中获取对应任务的最近一次数据。
2. 数据分析接口新增分组间隔支持。所有分析接口输出新增变量 StartTime 和 EndTime。

### v1.11.0（2023-09-06）{#v1-11-0}

发布时间：2023-09-06

1. 调整部分 RPC 数据分析相关接口，使其与 HTTP 相关接口一致。
2. 新增 `/receiveFile` 与 `/sendFile` 接口对二进制文件的支持。

### v1.10.0（2023-08-22）{#v1-10-0}

发布时间：2023-08-22

1. 新增 HTTP 与 RPC 接口 `/readFeed`，适用于 CNC 和激光切割机，获取进给数据。
2. 新增 HTTP 与 RPC 接口 `/readEnergyConsumption`，适用于 CNC，获取能耗数据。
3. 新增 HTTP 与 RPC 接口 `/readLaserPower`，适用于激光切割机，获取激光切割机预设功率与实际功率数据。
4. 新增 MODBUS，MQTT，数据库等通讯方式对激光切割机激光功率数据的支持。
5. 修正 MODBUS 机组数据地址错误。每组数据地址位相差 100 而不是 1000。
6. 新增部分 HTTP 与 RPC 接口对多通道系统的支持。
7. 修改 Modbus 通讯，原 3000 及以后的地址位调整为 1000 及以后。

### v1.9.3（2023-07-10）{#v1-9-3}

发布时间：2023-07-10

1. 移除数据库通讯按机台写入相关内容。旧版本按机台写入模式在新版本中将会以日志模式运行。（说明书）
2. 补充 MQTT 通讯下的 ToolLife 与 ToolLifeDetails 数据类。
3. 新增接口 `/createDir` 与 `/deleteDir`。
4. 新增机台状态 MANUAL_SINGLE_BLOCK（调机状态：单段运行）。

### v1.9.2（2023-06-28）{#v1-9-2}

发布时间：2023-06-28

1. HTTP，MODBUS，MQTT，数据库等通讯方式新增当前刀补号支持。

### v1.9.1（2023-06-25）{#v1-9-1}

发布时间：2023-06-25

1. MQTT 通讯协议修改数据类 Plc 为 PLC。改动后不再兼容旧版本 Plc 数据类。

### v1.9.0（2023-06-21）{#v1-9-0}

发布时间：2023-06-21

1. 改动 MQTT 通讯数据上报报文格式，改动后仍兼容旧版本除 OverLoadS 与 Plc 以外的所有数据类。
2. MQTT 通讯协议新增数据类 AxialOverLoad。
3. MQTT 通讯协议修改数据类 OverLoadS 为 SpindleOverLoad。改动后不再兼容旧版本 OverLoadS 数据类。
4. Modbus 新增地址位，包括快速进给倍率，与第 1 至第 18 轴累计过载时间。
5. Modbus 调整地址位，包括主轴负载，与主轴累计过载时间。

### v1.8.2（2023-06-20）{#v1-8-2}

发布时间：2023-06-20

1. MODBUS，数据库，MQTT 中的 alarmHistory 移除 alarmTime。

### v1.8.1（2023-06-19）{#v1-8-1}

发布时间：2023-06-19

1. 从 `/readAlarm` 接口移除 alarmTime。MODBUS，数据库，MQTT 中的 alarmLog 移除 alarmTime。
2. 现在要获取机台的警报起始时间，可以通过 HTTP 或 RPC 接口 analysis/alarm 获取。或根据 alarmHistory 中警报的激活/解除记录计算时间。

### v1.8.0（2023-05-12）{#v1-8-0}

发布时间：2023-05-12

1. 修正三菱系统 CNC 默认根目录路径。
2. 新增 HTTP 与 RPC 接口 `/readToolLife` 与 `/readToolLifeDetails`，原接口 `/readToolOffset` 中寿命相关变量移入新接口。
3. 修正 `/sendFile` 与 `/receiveFile` 中关键词 content 为 Content。
4. 新增接口 group-analysis/oee，group-analysis/alarm，group-analysis/count，group-analysis/overall，analysis/overall。
5. 接口 `/readProgramInfo` 新增 programStack 变量。
6. 调整 HTTP 通讯各接口顺序，将 HTTP 接口分为状态读写，文件传输，与数据分析三类。

### v1.7.5（2023-03-10）{#v1-7-5}

发布时间：2023-03-10

1. 修改 HTTP 与 RPC 接口 `/readAlarm`，增加输出内容警报级别 alarmLevel。
2. 在 MODBUS，MQTT，数据库中为数据 Alarm 增加变量警报级别。
3. 在 MQTT，数据库中为 AlarmHistory 增加变量警报级别。
4. 在 MODBUS，MQTT，数据库中新增机台累计警报时间，使用前需要激活机台警报信息任务。
5. 在 MODBUS，MQTT，数据库中新增机台节拍数据，使用前需要激活机台节拍数据任务。
6. 修改 HTTP 与 RPC 接口 `/readPlcData` 与 `/writePlcData`，支持部分型号机台以变量名形式读取与写入。
7. 新增 HTTP 接口 `/api/analysis/count`。
8. 新增更多 RPC 接口支持，现在所有 HTTP 接口都有对应的 RPC 接口。

### v1.7.0（2022-12-12）{#v1-7-0}

发布时间：2022-12-12

1. 修改 HTTP 接口 `/writePlcData`，`/writeOffsetData` 等请求体结构。
2. 修改 HTTP 接口 `/readOffsetData` 回复结构。
3. 修改 RPC 接口 `/writePlcData`，`/writeOffsetData`，`/sendFile` 等请求报文结构。

### v1.6.2（2022-12-09）{#v1-6-2}

发布时间：2022-12-09

1. 新增 HTTP 接口 `/writePlcData`。
2. 新增 RPC 接口 `/readPlcData` 与 `/writePlcData`。
3. Modbus，MQTT，数据库通讯新增上传数据变量当前加工计数 CurrentCount 与主轴过载时间 `OverLoadS<i>`。
4. 新增 MQTT 通讯中 PLC 数据对任务命令中设置的标签名的支持。

### v1.6.1（2022-11-11）{#v1-6-1}

发布时间：2022-11-11

1. 修改 HTTP 接口 `/readOffsetData` 与 `/writeOffsetData`，新增可选输入量 ToolNum 以支持西门子机床刀补读写。
2. 修订 RPC 接口说明。

### v1.6.0（2022-10-31）{#v1-6-0}

发布时间：2022-10-31

1. 修改 HTTP 接口 `/readPlcData` 返回结果，原所有数据类型均返回 UInt16 数组，改为按照用户输入的数据类型返回对应数据。
2. 移除 HTTP 接口 `/readPlcData` 对数据类型 Char 的支持。如需获取 Char 数据类型，用户可以获取 Byte 类型数据后自行转换。
3. 修改 HTTP 接口 `/readPlcData` 对 String 类型的支持。当类型为 String 时，Count 表示要读取的数据的最大长度（Byte 数）。
4. 在 HTTP 接口 `/readPlcData` 集成获取机台宏变量（本地变量，公共变量等）支持。
5. 在 MODBUS，MQTT，数据库通讯中，新增机台累计状态时间和机组累计状态时间。
6. 所有 MODBUS 通讯映射地址位长度调整以扩充容量。PLC 数据映射地址由原 4000 改为 20000，长度由原 1000 改为 10000。
7. 新增 MODBUS 通讯对 64 位型格式数据支持。
8. 调整 MQTT 通讯中 PLC 数据标签与内容。
9. 调整 RPC 接口请求与回复格式。
10. 新增 RPC 接口 `/analysisOEE`，`/analysisAlarm`。
11. 新增机台状态 MANUAL_RAPID。

### v1.5.9（2022-09-21）{#v1-5-9}

发布时间：2022-09-21

1. 在 MODBUS，MQTT，数据库通讯中，新增累计警报数。

### v1.5.8（2022-08-17）{#v1-5-8}

发布时间：2022-09-15

1. 新增 HTTP 接口 `/readProgramBlock`。新增该接口对应的 MODBUS，MQTT，以及数据库通讯相关内容。
2. 新增 HTTP 接口 `/api/analysis/alarm`。

### v1.5.7（2022-08-03）{#v1-5-7}

发布时间：2022-08-08

1. HTTP 接口 `/readPlcData` 新增 String 类型数据支持说明。
2. 新增 RPC 接口 `/readCurrentProgram`。
3. 新增数据库通讯相关内容。
4. 修复 MODBUS 输出轴名称错误的问题。

### v1.5.6（2022-07-13）{#v1-5-6}

发布时间：2022-07-27

1. 由于《说明书》改动，修改引用《说明书》位置。
2. 增加程序传输的文件服务器类型的说明。修改了 Fanuc [0i-D, 0i-F, 30i, 31i, 32i, PMi]的默认根目录路径。
3. 修改 HTTP 接口 `/readPlcData` 说明。

### v1.5.5（2022-06-19）{#v1-5-5}

发布时间：2022-06-24

1. 由于《说明书》改动，修改引用《说明书》位置。
2. 修订一、HTTP 通讯中文件传输相关接口的描述。
3. 新增 MQTT 通讯 RPC 接口相关内容 3.3. RPC 接口。

### v1.5.4（2022-06-17）{#v1-5-4}

发布时间：2022-06-17

1. 以下 HTTP 接口名称变动，地址不变：
   - 1.5. CNC 系统时间数据改为机台时间数据；
   - 1.6. CNC 状态改为机台状态；
   - 1.14. CNC 本地程序列表改为机台本地程序列表；
   - 1.15. 接收 CNC 文件改为接收机台文件；
   - 1.16. 发送文件至 CNC 改为发送文件至机台；
   - 1.17. 删除 CNC 本地文件改为删除机台本地文件；
   - 1.18. 锁定/解锁 CNC 本地程序编辑改为锁定/解锁机台本地程序编辑
2. 修订机台 OEE，机组 OEE 相关描述。

### v1.5.3（2022-05-31）{#v1-5-3}

发布时间：2022-05-31

1. 更改 HTTP 接口 `/readPlcData` 的输入量。
2. 新增 CNC 状态"调机：试运行"。

### v1.5.2（2022-05-09）{#v1-5-2}

发布时间：2022-05-09

1. 负载数据 axialLoad 与 spindleLoad 类型由 Int32 变更为 Float。
2. 增加 HTTP 接口 `/readPlcData`，增加 MODBUS 与 MQTT 输出 PLC 数据。
3. 增加 HTTP 接口 `api/analysis/oee`。
4. MQTT 通讯增加引用网关名称相关内容，增加引用自定义机组名称内容。
5. 移除多通道相关内容。

### v1.5.1（2022-04-26）{#v1-5-1}

发布时间：2022-04-26

1. 更改 OEE 监控设置相关说明。

### v1.5.0（2022-04-20）{#v1-5-0}

发布时间：2022-04-20

1. 更改 HTTP 协议中刀补相关的接口。
2. 更改 MQTT 协议报文内容结构。
3. MQTT 协议数据种类原 AxisData 拆分为 FeedAndSpindle，Load，和 Position。
4. MQTT 协议 AlarmHistory 改为警报历史。
5. MQTT 协议 CurrentToolNumber 关键字更改。
6. 新增文件传输相关错误代码。
7. 修订部分文字内容。

### v1.4.3（2022-03-28）{#v1-4-3}

发布时间：2022-03-28

1. 修订部分文字内容。

### v1.4.2（2022-03-15）{#v1-4-2}

发布时间：2022-02-19

1. 修正 MODBUS 与 MQTT 协议部分输出量数据类型。
2. 修正 CNC 状态，CNC 运行状态，警报状态的表述。
3. 增加新的一章，常见问题。
4. 修正常见错误中的部分说明。

### v1.4.1（2022-02-15）{#v1-4-1}

发布时间：2022-02-15

1. 新增 MODBUS 协议与 MQTT 协议 GroupCount，GroupOEE，OEE 等相关输出量。
2. MODBUS 协议输出量分为机台相关数据与机组相关数据。
3. 补充 MQTT 协议说明。
4. 修正 MQTT 协议中 AxisData 部分的错误信息。
5. 新增五、虚拟机床测试。

### v1.3.5（2021-12-27）{#v1-3-5}

发布时间：2021-12-27

1. 所有警报时间结果由精确到秒改为精确到毫秒。
2. 移除 HTTP 接口 ReadPosition 中的 decPoint。
3. 修改 HTTP 接口 ReadProgramList，增加返回量 dirAtCNC 与 subDirs，保留原返回量 programs 结构不变，继承对旧版接口的支持。
4. 新增 Modbus 协议输出地址位 40260 运行程序段顺序号。
5. 新增 Modbus 协议输出地址位 40500 累计产量。
