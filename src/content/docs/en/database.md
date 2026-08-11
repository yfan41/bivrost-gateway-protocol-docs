---
title: "5. Database Communication"
sidebar:
  label: "5. Database Communication"
---


After enabling database communication and turning on the automatic data collection task for the target machine/group (see the Bivrost Gateway Manual [5.3.1.2. Task Settings](https://docs.bivrost.cn/gateway/usage/machines#task-settings), and [5.4.1.2. Group Task Settings](https://docs.bivrost.cn/gateway/usage/groups#group-tasks)), the gateway will automatically write the data collection task results to the specified database. Currently supported database types include InfluxDB v2.x, MySQL, SQL Server, PostgreSQL, and others. Refer to the Bivrost Gateway Manual [5.6.4. Database Configuration](https://docs.bivrost.cn/gateway/usage/communication#database) for instructions on configuring the database service.

Database table names take the form [table prefix][data class], where the table prefix is set on the gateway's communication configuration page (see the Bivrost Gateway Manual [5.6.4. Database Configuration](https://docs.bivrost.cn/gateway/usage/communication#database)); the table name is the same as the `type` of the data class used in MQTT communication (see [1.2. Data Description](/en/conventions/data-classes/)). The table below shows the names of each database table (using a MySQL database with no table prefix set and log storage mode as an example):

| Table Name | Data Class |
| --- | --- |
| alarmhistory | [AlarmHistory](/en/conventions/data-classes/#alarmhistory) |
| alarmlog | [AlarmLog](/en/conventions/data-classes/#alarmlog) |
| axialoverload | [AxialOverload](/en/conventions/data-classes/#axialoverload) |
| cncstatus | [CNCStatus](/en/conventions/data-classes/#cncstatus) |
| count | [Count](/en/conventions/data-classes/#count) |
| currenttoolnumber | [CurrentToolNumber](/en/conventions/data-classes/#currenttoolnumber) |
| cycle | [Cycle](/en/conventions/data-classes/#cycle) |
| energyconsum | [EnergyConsum](/en/conventions/data-classes/#energyconsum) |
| feed | [Feed](/en/conventions/data-classes/#feed) |
| feedandspindle | [FeedAndSpindle](/en/conventions/data-classes/#feedandspindle) |
| groupcount | [GroupCount](/en/conventions/data-classes/#groupcount) |
| groupcumulativetime | [GroupCumulativeTime](/en/conventions/data-classes/#groupcumulativetime) |
| groupoee | [GroupOEE](/en/conventions/data-classes/#groupoee) |
| laserpower | [LaserPower](/en/conventions/data-classes/#laserpower) |
| load | [Load](/en/conventions/data-classes/#load) |
| loghistory | [LogHistory](/en/conventions/data-classes/#loghistory) |
| machine | — (Machine information table) |
| oee | [OEE](/en/conventions/data-classes/#oee) |
| offset | [Offset](/en/conventions/data-classes/#offset) |
| plc | [PLC](/en/conventions/data-classes/#plc) |
| position | [Position](/en/conventions/data-classes/#position) |
| programblock | [ProgramBlock](/en/conventions/data-classes/#programblock) |
| programinfo | [ProgramInfo](/en/conventions/data-classes/#programinfo) |
| spindleoverload | [SpindleOverload](/en/conventions/data-classes/#spindleoverload) |
| timedata | [TimeData](/en/conventions/data-classes/#timedata) |
| toollife | [ToolLife](/en/conventions/data-classes/#toollife) |

The fields in each database table are the same as the tags and fields of the corresponding data class `type` (see [1.2. Data Description](/en/conventions/data-classes/)). The table below shows the fields of the `cncStatus` table (using a MySQL database with no table prefix set and log storage mode as an example):

| # | Name | Data Type | Length/Decimal Point |
| --- | --- | --- | --- |
| 1 | cncStatus | TEXT | |
| 2 | adjustedStatus | TEXT | |
| 3 | alarmStatus | TEXT | |
| 4 | alarmLevel | TEXT | |
| 5 | offTime | BIGINT | 20 |
| 6 | waitTime | BIGINT | 20 |
| 7 | emergencyTime | BIGINT | 20 |
| 8 | autoRunTime | BIGINT | 20 |
| 9 | manualTime | BIGINT | 20 |
| 10 | channel | VARCHAR | 128 |
| 11 | machineID | VARCHAR | 128 |
| 12 | time | DATETIME | 3 |
| 13 | uid | VARCHAR | 128 |

:::note[Note]
The table above does not include an `id` primary key column. An auto-increment `id` primary key column is created as the first column only when the "Enable primary key" option is switched on in the database configuration (off by default); its SQL data type depends on the database type: `bigint` for MySQL and SQL Server, `bigserial` for PostgreSQL, and `integer` for SQLite.
:::
