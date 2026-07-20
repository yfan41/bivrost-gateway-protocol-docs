---
title: "五、数据库通讯"
sidebar:
  label: "五、数据库通讯"
---


启用数据库通讯，并开启目标机台/机组的自动采集任务（详见《说明书》[5.3.1.2. 任务设置](https://docs.bivrost.cn/gateway/usage/machines#task-settings)，以及 [5.4.1.2. 机组任务设置](https://docs.bivrost.cn/gateway/usage/groups#group-tasks)）后，网关将自动采集任务结果写入到指定数据库。当前支持的数据库类型包括：InfluxDB v2.x，MySQL，SQL Server，PostgreSQL 等。用户可以参照《说明书》[5.6.4. 数据库配置](https://docs.bivrost.cn/gateway/usage/communication#database)的说明配置数据库服务。

数据库表名为[表前缀][数据类]的形式，其中表前缀在网关通讯配置页设置，详见《说明书》[5.6.4. 数据库配置](https://docs.bivrost.cn/gateway/usage/communication#database)；数据表名称与 MQTT 通讯中的数据类 type 相同（详见 [1.2. 数据说明](/conventions/data-classes/)）；如下表所示（以未设置表前缀、保存模式为日志模式的 MySQL 数据库为例），数据库各表名：

| 表名 | 数据类 |
| --- | --- |
| alarmhistory | [AlarmHistory](/conventions/data-classes/#alarmhistory) |
| alarmlog | [AlarmLog](/conventions/data-classes/#alarmlog) |
| cncstatus | [CNCStatus](/conventions/data-classes/#cncstatus) |
| count | [Count](/conventions/data-classes/#count) |
| currenttoolnumber | [CurrentToolNumber](/conventions/data-classes/#currenttoolnumber) |
| cycle | [Cycle](/conventions/data-classes/#cycle) |
| energyconsum | [EnergyConsum](/conventions/data-classes/#energyconsum) |
| feedandspindle | [FeedAndSpindle](/conventions/data-classes/#feedandspindle) |
| groupcount | [GroupCount](/conventions/data-classes/#groupcount) |
| groupcumulativetime | [GroupCumulativeTime](/conventions/data-classes/#groupcumulativetime) |
| groupoee | [GroupOEE](/conventions/data-classes/#groupoee) |
| load | [Load](/conventions/data-classes/#load) |
| loghistory | [LogHistory](/conventions/data-classes/#loghistory) |
| machine | —（机台信息表） |
| oee | [OEE](/conventions/data-classes/#oee) |
| offset | [Offset](/conventions/data-classes/#offset) |
| plc | [PLC](/conventions/data-classes/#plc) |
| position | [Position](/conventions/data-classes/#position) |
| programblock | [ProgramBlock](/conventions/data-classes/#programblock) |
| programinfo | [ProgramInfo](/conventions/data-classes/#programinfo) |
| timedata | [TimeData](/conventions/data-classes/#timedata) |
| toollife | [ToolLife](/conventions/data-classes/#toollife) |

数据库各表中的字段与对应数据类 type 中的数据标签 tag 和数据字段 field 相同（详见 [1.2. 数据说明](/conventions/data-classes/)），如下表所示（以未设置表前缀、保存模式为日志模式的 MySQL 数据库为例），表 cncStatus 的表字段：

| # | 名称 | 数据类型 | 长度/长度点 |
| --- | --- | --- | --- |
| 1 | id | BIGINT | 20 |
| 2 | cncStatus | TEXT | |
| 3 | adjustedStatus | TEXT | |
| 4 | alarmStatus | TEXT | |
| 5 | alarmLevel | TEXT | |
| 6 | offTime | BIGINT | 20 |
| 7 | waitTime | BIGINT | 20 |
| 8 | emergencyTime | BIGINT | 20 |
| 9 | autoRunTime | BIGINT | 20 |
| 10 | manualTime | BIGINT | 20 |
| 11 | channel | VARCHAR | 128 |
| 12 | machineID | VARCHAR | 128 |
| 13 | time | DATETIME | 3 |
| 14 | uid | VARCHAR | 128 |
