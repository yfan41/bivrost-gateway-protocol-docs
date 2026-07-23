---
title: "Version Change History"
sidebar:
  label: "Version Change History"
---


### v1.19.7 (2026-07-19) {#v1-19-7}

Release date: 2026-07-19

1. Added parameter NetworkErrorAsOffline (treat network errors as offline) to machine configuration.
2. Added support for the GSK 25i machine model.
3. Added function GetSetBitIndices to task post-processing.
4. Added gateway function interface hardware-resources to retrieve gateway hardware resources.

### v1.19.6 (2026-07-02) {#v1-19-6}

Release date: 2026-07-02

1. Removed deprecated fields from the AlarmHistory (alarm history) and AlarmLog (current alarms) data classes.
2. Added new detailed waiting sub-statuses to the CNCStatus running status, and added a Description column.

### v1.19.5 (2026-06-15) {#v1-19-5}

Release date: 2026-06-15

1. Modified the selectProgram interface; added parameter mode (execution mode).

### v1.19.4 (2026-02-11) {#v1-19-4}

Release date: 2026-06-05

1. Changed the authentication method; the original API Key method was replaced with the Secret Key method.
2. The original Cumulative Status Time machine task was merged into the Machine Status task; cumulative time is now tracked automatically when retrieving machine status.
3. Added variable LastTotalTime (previous cycle total time) to Cycle data.
4. Added output variable StartTime (cycle start time) to the `/api/analysis/cycle` machine cycle data analysis interface and the `/api/group-analysis/cycle` group cycle data analysis interface.
5. Expanded the group number range from 1-8 to 1-16.
6. Revised the table of supported RPC interfaces.
7. Added field CmdFeed to the Feed data class. Added fields CmdFeed and CmdSpindle to the FeedAndSpindle data class.
8. Updated corresponding reference locations due to chapter changes in the Bivrost Gateway Manual.
9. Updated the description of slave ID in MODBUS communication.

### v1.19.3 (2025-12-22) {#v1-19-3}

Release date: 2025-12-22

1. Fixed an incorrect description. For the readCount (read machining count) interface, corrected the type of the count field in the response to Int32.
2. Removed the deprecated data classes AxialLoad (servo axis load) and SpindleLoad (spindle load). Use the Load data class for this data instead.
3. Merged the ToolLife (tool life) and ToolLifeDetails (tool life details) data classes.
4. Added description of the authentication method and authentication interface.
5. Revised the interface categorization; renamed the file transfer interfaces to file management interfaces.
6. Added interfaces: readErrorSummary (read status summary) and searchFile (search machine files).
7. Added data type LogHistory (log history) and the corresponding machine task.
8. Removed deprecated parameters from the MQTT settings: UseGatewayAlias (use gateway alias) and KeepAliveInterval (keep-alive period).
9. Added parameters to machine configuration: numberOfTasks (number of enabled tasks), custom status parameters, custom alarm parameters, and custom machining count parameters.
10. Updated the tool offset data tag combination table.
11. Updated the tool life data tag combination table.
12. Added interfaces remote-access (get remote access settings) and update-remote-access (update remote access settings).
13. Added support for request parameter Channel (channel number) to the ReadPlcData and WritePlcData interfaces.
14. Modified the following interfaces:
   - `/api/gateway/wifi`
   - `/api/gateway/update-wifi`
   - `/api/gateway/search-wifi`
   - `/api/config/gateway-info`
   - `/api/config/cloud-settings`
   - `/api/config/update-cloud-settings`
15. Added interface `/core/license-info`.

### v1.19.2 (2025-06-03) {#v1-19-2}

Release date: 2025-06-03

1. Added the following interfaces
   - `/config/batch-delete-machines`
   - `/config/batch-delete-groups`
   - `/analysis/cycle`
   - `/group-analysis/cycle`
2. Split the original alarm machine task (alarm information) into alarm (current alarms) and alarmHistory (alarm history).
3. Adjusted variable names and order for some machine configuration interfaces.
4. Removed the variable monitorOverloadInterval from overload monitoring settings; added the variable readOverloadInteral to the machine task interval settings as a replacement.

### v1.19.1 (2025-05-14) {#v1-19-1}

Release date: 2025-05-14

1. Renamed Fanuc model PMi to Power Motion i-A.
2. Fixed broken hyperlinks.
3. Updated the tool life data tag combination table.
4. Added the following interfaces
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
5. Adjusted variable names and order for some machine configuration interfaces.

### v1.18.8 (2024-11-08) {#v1-18-8}

Release date: 2024-11-08

1. Added a large number of fields to the machine configuration interface.
2. Fixed a spelling error for taskEnergy in the machine configuration interface.
3. Added some fields to the get machine status monitoring settings interface.

### v1.18.1 (2024-06-14) {#v1-18-1}

Release date: 2024-06-14

1. Added gateway function interfaces and configuration interfaces.
2. Added description of the ID database identifier.
3. Fixed content of the batchDeleteFile (batch delete machine files) interface.

### v1.18.0 (2024-04-29) {#v1-18-0}

Release date: 2024-04-29

1. Adjusted some documentation content.

### v1.17.6 (2024-04-16) {#v1-17-6}

Release date: 2024-04-16

1. Added HTTP interface and RPC interface: readAllPrograms (browse all files). This interface retrieves all program names and their paths under a specified path, including those in subfolders (if the machine supports directory switching).
2. Added description of tool offset and tool life for MAZAK machines.

### v1.17.5 (2024-04-01) {#v1-17-5}

Release date: 2024-04-01

1. Removed the deprecated field runningPrgName from Cycle (cycle data).
2. Added field adjustedStatus to CNCStatus (machine status data).

### v1.17.3 (2024-03-29) {#v1-17-3}

Release date: 2024-03-29

1. Removed the deprecated field runningPrgName from Cycle (cycle data).
2. For the readPlcData interface, if a retrieved Double value is double.NaN, it was previously converted to double.Min for output; it can now be output directly as double.NaN.

### v1.17.2 (2024-03-19) {#v1-17-2}

Release date: 2024-03-19

1. Added HTTP interface and RPC interface: selectProgram (select program).

### v1.17.1 (2024-03-19) {#v1-17-1}

Release date: 2024-03-19

1. Added HTTP interface and RPC interface: batchReadErrors (batch read machine connection status).

### v1.17.0 (2024-03-15) {#v1-17-0}

Release date: 2024-03-15

1. Modified the response body of the batch processing interfaces batchReadOffsetData, batchReadToolLife, and batchReadToolLifeDetails: if an individual request fails, the corresponding position in the response array now contains its error information.

### v1.16.5 (2024-03-08) {#v1-16-5}

Release date: 2024-03-08

1. Added interface batchDeleteFile (batch delete machine files) to the file transfer interface category of the HTTP and RPC interfaces.

### v1.16.4 (2024-03-08) {#v1-16-4}

Release date: 2024-03-08

1. Added interface batchSendFile (batch send files to machine) to the file transfer interface category of the HTTP and RPC interfaces.

### v1.16.3 (2024-03-08) {#v1-16-3}

Release date: 2024-03-08

1. Added interface backupFiles (back up machine files) to the file transfer interface category of the HTTP and RPC interfaces.

### v1.16.2 (2024-03-04) {#v1-16-2}

Release date: 2024-03-04

1. Added a new interface category to the HTTP and RPC interfaces: historical data interfaces, including machine (machine historical data) and group-machine (historical data for all machines in a group).
2. Added response parameter time (data retrieval time) to the data read/write interfaces readTaskData (read machine task data), batchReadTaskData (batch read machine task data), readGroupTaskData (read group task data), and batchReadGroupTaskData (batch read group task data).
3. Added description of the IoTDA MQTT mode to MQTT communication.
4. Adjusted content related to the readPlcData (read PLC data) and writePlcData (write PLC data) interfaces; added descriptions for some supported CNC system models.

### v1.16.1 (2024-02-21) {#v1-16-1}

Release date: 2024-02-21

1. Restructured the document content; added the chapter "1. Important Notes" and moved descriptions common to all communication methods into the new chapter. Other chapter numbers were adjusted accordingly.
2. Added data classes AxialLoad (servo axis load), LaserPower (laser power), Offset (tool offset data), and SpindleLoad (spindle load).
3. Added new tag channel (channel number) to some data classes.

### v1.16.0 (2024-01-30) {#v1-16-0}

Release date: 2024-02-05

1. Replaced groupNum (group number) with groupID (group identifier) in the HTTP interfaces, RPC interfaces, MQTT, and database.

### v1.15.7 (2024-01-20) {#v1-15-7}

Release date: 2024-02-04

1. Changed the default root directory path for Fanuc [0i-D, 0i-F, 30i, 31i, 32i, 35i, PMi] to `//CNC_MEM/`.

### v1.15.5 (2024-01-22) {#v1-15-5}

Release date: 2024-02-04

1. Updated the table of system models supported by the file transfer interfaces.

### v1.15.3 (2023-12-26) {#v1-15-3}

Release date: 2024-02-04

1. Added support for the subDir parameter to all file transfer interfaces.
2. Changed the types of rawRemainingCount and rawPrewarningRemainingCount in the HTTP and RPC `/ToolLife` interface from Double to Int32.

### v1.15.2 (2023-12-18) {#v1-15-2}

Release date: 2024-02-04

1. Added HTTP interfaces `/sendFileStream` and `/receiveFileStream` to support large file transfers.

### v1.15.1 (2023-12-06) {#v1-15-1}

Release date: 2024-02-02

1. Revised some descriptive content.

### v1.15.0 (2023-11-28) {#v1-15-0}

Release date: 2023-11-28

1. Added HTTP and RPC interface `/bathReadGroupTaskData`.
2. Added description of S7 tag support for Siemens [generic] to the `/readPlcData` interface.
3. Added response parameters remainingCycleTimeMin and remainingCycleTimeMs to the `/readTimeData` interface.
4. Added description related to Kede machines.
5. Added support for request parameter channel to the `/readProgramInfo` and `/readProgramBlock` interface descriptions.
6. Corrected a spelling error for Position in the type field of the data reporting message.
7. Fixed capitalization of keywords in the file transfer interfaces; keyword initials are now all lowercase across all interfaces.
8. Changed the address length of axis names in Modbus communication to 2, to support axis names up to 4 characters long.
9. Added content related to external PLC task data to MODBUS communication and MQTT communication.

### v1.14.0 (2023-11-01) {#v1-14-0}

Release date: 2023-11-01

1. Added HTTP and RPC interfaces `/readTaskData`, `/bathReadTaskData`, and `/readGroupTaskData`.
2. Fixed an incorrect description of the data obtainable for GSK machines in the `/readTimeData` interface. Added descriptions for newly supported device system models.
3. Changed the format of the request parameter area in `/readPlcData` and `/writePlcData`.
4. Changed the format of the interface descriptions in Chapter I, HTTP Communication.
5. Changed content in section 3.1. Data Reporting Message Format.

### v1.13.0 (2023-10-23) {#v1-13-0}

Release date: 2023-10-23

1. Added HTTP and RPC interfaces `/batchReadOffsetData`, `/bathReadToolLife`, and `/bathReadToolLifeDetails`.

### v1.12.0 (2023-09-26) {#v1-12-0}

Release date: 2023-09-26

1. Added HTTP and RPC interface `/readTaskData`, which retrieves the most recent data for the corresponding task from the gateway cache.
2. Added support for grouping intervals to the data analysis interfaces. Added output variables StartTime and EndTime to all analysis interfaces.

### v1.11.0 (2023-09-06) {#v1-11-0}

Release date: 2023-09-06

1. Adjusted some RPC data analysis interfaces to align with the corresponding HTTP interfaces.
2. Added support for binary files to the `/receiveFile` and `/sendFile` interfaces.

### v1.10.0 (2023-08-22) {#v1-10-0}

Release date: 2023-08-22

1. Added HTTP and RPC interface `/readFeed`, applicable to CNC machines and laser cutting machines, to retrieve feed data.
2. Added HTTP and RPC interface `/readEnergyConsumption`, applicable to CNC machines, to retrieve energy consumption data.
3. Added HTTP and RPC interface `/readLaserPower`, applicable to laser cutting machines, to retrieve preset power and actual power data for laser cutting machines.
4. Added support for laser cutting machine laser power data to MODBUS, MQTT, database, and other communication methods.
5. Fixed an address error for group data in MODBUS; the address offset between groups is 100, not 1000.
6. Added support for multi-channel systems to some HTTP and RPC interfaces.
7. Changed Modbus communication: address positions previously at 3000 and above were adjusted to 1000 and above.

### v1.9.3 (2023-07-10) {#v1-9-3}

Release date: 2023-07-10

1. Removed content related to per-machine write mode in database communication. In the new version, the old per-machine write mode operates as log mode. (Bivrost Gateway Manual)
2. Added the ToolLife and ToolLifeDetails data classes under MQTT communication.
3. Added interfaces `/createDir` and `/deleteDir`.
4. Added machine status MANUAL_SINGLE_BLOCK (setup status: single block execution).

### v1.9.2 (2023-06-28) {#v1-9-2}

Release date: 2023-06-28

1. Added support for the current tool offset number to HTTP, MODBUS, MQTT, database, and other communication methods.

### v1.9.1 (2023-06-25) {#v1-9-1}

Release date: 2023-06-25

1. Changed the MQTT communication protocol data class Plc to PLC. This change is not backward compatible with the old Plc data class.

### v1.9.0 (2023-06-21) {#v1-9-0}

Release date: 2023-06-21

1. Changed the MQTT communication data reporting message format. After this change, all data classes except OverLoadS and Plc remain backward compatible with the old version.
2. Added data class AxialOverLoad to the MQTT communication protocol.
3. Changed the MQTT communication protocol data class OverLoadS to SpindleOverLoad. This change is not backward compatible with the old OverLoadS data class.
4. Added address positions to Modbus, including rapid feed override and cumulative overload time for axes 1 through 18.
5. Adjusted address positions in Modbus, including spindle load and spindle cumulative overload time.

### v1.8.2 (2023-06-20) {#v1-8-2}

Release date: 2023-06-20

1. Removed alarmTime from alarmHistory in MODBUS, database, and MQTT.

### v1.8.1 (2023-06-19) {#v1-8-1}

Release date: 2023-06-19

1. Removed alarmTime from the `/readAlarm` interface. Removed alarmTime from alarmLog in MODBUS, database, and MQTT.
2. To obtain a machine's alarm start time, use the HTTP or RPC interface analysis/alarm, or calculate the time from the alarm activation/clearance records in alarmHistory.

### v1.8.0 (2023-05-12) {#v1-8-0}

Release date: 2023-05-12

1. Fixed the default root directory path for Mitsubishi system CNC.
2. Added HTTP and RPC interfaces `/readToolLife` and `/readToolLifeDetails`; tool-life-related variables from the original `/readToolOffset` interface were moved to the new interfaces.
3. Fixed keyword content to Content in `/sendFile` and `/receiveFile`.
4. Added interfaces group-analysis/oee, group-analysis/alarm, group-analysis/count, group-analysis/overall, and analysis/overall.
5. Added variable programStack to the `/readProgramInfo` interface.
6. Reordered the HTTP communication interfaces, dividing HTTP interfaces into three categories: status read/write, file transfer, and data analysis.

### v1.7.5 (2023-03-10) {#v1-7-5}

Release date: 2023-03-10

1. Modified the HTTP and RPC interface `/readAlarm`, adding output field alarmLevel (alarm level).
2. Added an alarm level variable to the Alarm data in MODBUS, MQTT, and the database.
3. Added an alarm level variable to AlarmHistory in MQTT and the database.
4. Added machine cumulative alarm time to MODBUS, MQTT, and the database; the machine alarm information task must be activated before use.
5. Added machine cycle data to MODBUS, MQTT, and the database; the machine cycle data task must be activated before use.
6. Modified the HTTP and RPC interfaces `/readPlcData` and `/writePlcData`, adding support for reading and writing by variable name on some machine models.
7. Added HTTP interface `/api/analysis/count`.
8. Added more RPC interface support; now every HTTP interface has a corresponding RPC interface.

### v1.7.0 (2022-12-12) {#v1-7-0}

Release date: 2022-12-12

1. Changed the request body structure of HTTP interfaces `/writePlcData`, `/writeOffsetData`, and others.
2. Changed the response structure of the HTTP interface `/readOffsetData`.
3. Changed the request message structure of RPC interfaces `/writePlcData`, `/writeOffsetData`, `/sendFile`, and others.

### v1.6.2 (2022-12-09) {#v1-6-2}

Release date: 2022-12-09

1. Added HTTP interface `/writePlcData`.
2. Added RPC interfaces `/readPlcData` and `/writePlcData`.
3. Added upload data variables CurrentCount (current machining count) and spindle overload time `OverLoadS<i>` to Modbus, MQTT, and database communication.
4. Added support in MQTT communication for PLC data to use tag names configured in the task command.

### v1.6.1 (2022-11-11) {#v1-6-1}

Release date: 2022-11-11

1. Modified the HTTP interfaces `/readOffsetData` and `/writeOffsetData`, adding optional input ToolNum to support tool offset read/write on Siemens machines.
2. Revised the RPC interface descriptions.

### v1.6.0 (2022-10-31) {#v1-6-0}

Release date: 2022-10-31

1. Changed the return result of the HTTP interface `/readPlcData`: previously all data types returned a UInt16 array; now the data is returned according to the data type specified by the user.
2. Removed support for the Char data type from the HTTP interface `/readPlcData`. To obtain Char data, users can retrieve Byte data and convert it themselves.
3. Changed support for the String type in the HTTP interface `/readPlcData`. When the type is String, Count represents the maximum length (in bytes) of the data to read.
4. Integrated support for retrieving machine macro variables (local variables, common variables, etc.) into the HTTP interface `/readPlcData`.
5. Added machine cumulative status time and group cumulative status time to MODBUS, MQTT, and database communication.
6. Adjusted the address length of all MODBUS communication mappings to expand capacity. The PLC data mapping address was changed from 4000 to 20000, and its length from 1000 to 10000.
7. Added support for 64-bit format data to MODBUS communication.
8. Adjusted the PLC data tags and content in MQTT communication.
9. Adjusted the RPC interface request and response formats.
10. Added RPC interfaces `/analysisOEE` and `/analysisAlarm`.
11. Added machine status MANUAL_RAPID.

### v1.5.9 (2022-09-21) {#v1-5-9}

Release date: 2022-09-21

1. Added cumulative alarm count to MODBUS, MQTT, and database communication.

### v1.5.8 (2022-08-17) {#v1-5-8}

Release date: 2022-09-15

1. Added HTTP interface `/readProgramBlock`. Added corresponding content for this interface to MODBUS, MQTT, and database communication.
2. Added HTTP interface `/api/analysis/alarm`.

### v1.5.7 (2022-08-03) {#v1-5-7}

Release date: 2022-08-08

1. Added description of String type data support to the HTTP interface `/readPlcData`.
2. Added RPC interface `/readCurrentProgram`.
3. Added content related to database communication.
4. Fixed an issue with incorrect axis name output in MODBUS.

### v1.5.6 (2022-07-13) {#v1-5-6}

Release date: 2022-07-27

1. Updated references to the Bivrost Gateway Manual due to changes in the manual.
2. Added description of the file server type for program transfer. Changed the default root directory path for Fanuc [0i-D, 0i-F, 30i, 31i, 32i, PMi].
3. Updated the description of the HTTP interface `/readPlcData`.

### v1.5.5 (2022-06-19) {#v1-5-5}

Release date: 2022-06-24

1. Updated references to the Bivrost Gateway Manual due to changes in the manual.
2. Revised the description of file transfer interfaces in Chapter I, HTTP Communication.
3. Added content on RPC interfaces for MQTT communication, section 3.3. RPC Interface.

### v1.5.4 (2022-06-17) {#v1-5-4}

Release date: 2022-06-17

1. The following HTTP interface names changed while their addresses remained the same:
   - 1.5. CNC System Time Data renamed to Machine Time Data;
   - 1.6. CNC Status renamed to Machine Status;
   - 1.14. CNC Local Program List renamed to Machine Local Program List;
   - 1.15. Receive CNC File renamed to Receive Machine File;
   - 1.16. Send File to CNC renamed to Send File to Machine;
   - 1.17. Delete CNC Local File renamed to Delete Machine Local File;
   - 1.18. Lock/Unlock CNC Local Program Editing renamed to Lock/Unlock Machine Local Program Editing
2. Revised the description of machine OEE and group OEE.

### v1.5.3 (2022-05-31) {#v1-5-3}

Release date: 2022-05-31

1. Changed the input parameters of the HTTP interface `/readPlcData`.
2. Added CNC status "Setup: Trial Run".

### v1.5.2 (2022-05-09) {#v1-5-2}

Release date: 2022-05-09

1. Changed the type of load data axialLoad and spindleLoad from Int32 to Float.
2. Added HTTP interface `/readPlcData`; added PLC data output to MODBUS and MQTT.
3. Added HTTP interface `api/analysis/oee`.
4. Added content for referencing the gateway name and custom group name to MQTT communication.
5. Removed content related to multi-channel systems.

### v1.5.1 (2022-04-26) {#v1-5-1}

Release date: 2022-04-26

1. Changed the description of OEE monitoring settings.

### v1.5.0 (2022-04-20) {#v1-5-0}

Release date: 2022-04-20

1. Changed the tool-offset-related interfaces in the HTTP protocol.
2. Changed the message content structure of the MQTT protocol.
3. Split the MQTT protocol data type AxisData into FeedAndSpindle, Load, and Position.
4. MQTT protocol: renamed AlarmHistory to Alarm History.
5. MQTT protocol: changed keyword CurrentToolNumber.
6. Added error codes related to file transfer.
7. Revised some text content.

### v1.4.3 (2022-03-28) {#v1-4-3}

Release date: 2022-03-28

1. Revised some text content.

### v1.4.2 (2022-03-15) {#v1-4-2}

Release date: 2022-02-19

1. Fixed the data types of some output values in the MODBUS and MQTT protocols.
2. Fixed the wording of CNC status, CNC running status, and alarm status.
3. Added a new chapter, Frequently Asked Questions.
4. Fixed some descriptions in Common Errors.

### v1.4.1 (2022-02-15) {#v1-4-1}

Release date: 2022-02-15

1. Added output values GroupCount, GroupOEE, OEE, and others to the MODBUS and MQTT protocols.
2. Divided MODBUS protocol output values into machine-related data and group-related data.
3. Added supplementary description to the MQTT protocol.
4. Fixed incorrect information in the AxisData section of the MQTT protocol.
5. Added Chapter V, Virtual Machine Tool Testing.

### v1.3.5 (2021-12-27) {#v1-3-5}

Release date: 2021-12-27

1. Changed all alarm time results from second precision to millisecond precision.
2. Removed decPoint from the HTTP interface ReadPosition.
3. Modified the HTTP interface ReadProgramList, adding response values dirAtCNC and subDirs, while keeping the original programs response structure unchanged to maintain backward compatibility with the old interface.
4. Added Modbus protocol output address 40260, running program block sequence number.
5. Added Modbus protocol output address 40500, cumulative production count.
