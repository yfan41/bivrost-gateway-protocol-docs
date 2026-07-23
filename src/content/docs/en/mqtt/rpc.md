---
title: "4.2. RPC Interface"
sidebar:
  label: "4.2. RPC Interface"
---


The gateway supports an RPC interface based on the MQTT protocol. Users must configure the RPC request topic and RPC reply topic on the gateway management page; see the Bivrost Gateway Manual [5.6.3. MQTT Configuration](https://docs.bivrost.cn/gateway/usage/communication#mqtt) for details. Once this is configured, the gateway listens on the RPC request topic and publishes the result of the RPC request to the RPC reply topic. The RPC interface data encoding is the encoding configured in the MQTT settings.

If you need to embed the RPC request identifier in the topic, use the wildcard `${request_id}` at the position where the identifier should be embedded.

For example, in the examples in this section, the RPC request topic is set to `request/${request_id}` and the RPC reply topic is set to `response/${request_id}`. With this configuration, when the gateway receives a request on `request/24`, it publishes the execution result to the topic `response/24`.

It is recommended to place `${request_id}` at the end of the topic. If `${request_id}` needs to be placed in the middle of the topic, it must be preceded by `/` as a separator.

The gateway's MQTT protocol supports multiple message modes, including Default, MKT, Brm, TB, TB2, and others.

## RPC Request Message Format {#request-format}

Data formats for RPC requests in the different modes:

### Default/MKT/Brm Mode {#request-default}

```json
{
  "id": <request_id>,
  "method": "<method>",
  "params": <params>
}
```

### TB/TB2 Mode {#request-tb}

```json
{
  "device": "<deviceName>",
  "data": {
    "id": "<request_id>",
    "method": "<method>",
    "params": <params>
  }
}
```

### WisIoT/IoTDA Mode {#request-wisiot-iotda}

Not yet supported.

Where `<request_id>` is the request identifier; `<method>` is the RPC command; `<params>` is the input parameters of the RPC command; `<deviceName>` is the machine name.

:::note[Note]
In TB mode, the parameter "machineID" in `<params>` does not need to be provided; the machine is instead specified by `<deviceName>`.
:::

## RPC Reply Message Format {#reply-format}

Message formats for RPC replies in the different modes:

### Default/MKT/Brm Mode {#reply-default}

```json
{
  "id": <request_id>,
  "data": <response>
}
```

### TB/TB2 Mode {#reply-tb}

```json
{
  "device": "<deviceName>",
  "id": <request_id>,
  "data": <response>
}
```

### WisIoT/IoTDA Mode {#reply-wisiot-iotda}

Not yet supported.

Where `<response>` is the return result of the RPC command; `<deviceName>` is the machine name; `<request_id>` is the custom request identifier.

## Supported RPC Commands {#commands}

The gateway currently supports the following RPC commands:

### Data Read/Write Interface - Direct Read/Write, Prefix /cnc/ {#commands-cnc-direct}

| RPC Command | Description |
| --- | --- |
| readAlarm | Read alarm information |
| readCNCStatus | Read machine status |
| readCNCStatusDetails | Read machine status details |
| readCount | Read machining count |
| readCurrentToolNumber | Read current tool number |
| readEnergyConsumption | Read energy consumption data |
| readFeed | Read feed rate data |
| readFeedAndSpindle | Read feed rate and spindle speed data |
| readLaserPower | Read laser power |
| readLoad | Read load data |
| readLog | Read log information |
| readOffsetData | Read tool offset data |
| batchReadOffsetData | Batch read tool offset data |
| writeOffsetData | Write tool offset data |
| readPosition | Read position data |
| readProgramBlock | Read current program block |
| readProgramInfo | Read current program information |
| readPlcData | Read PLC data |
| writePlcData | Write PLC data |
| readTimeData | Read machine time data |
| readToolLife | Read tool life |
| batchReadToolLife | Batch read tool life |
| readToolLifeDetails | Read tool life details |
| batchReadToolLifeDetails | Batch read tool life details |

### Data Read/Write Interface - Cached Read, Prefix /cnc/ {#commands-cnc-cached}

| RPC Command | Description |
| --- | --- |
| readTaskData | Read machine task data |
| batchReadTaskData | Batch read machine task data |
| readGroupTaskData | Read machine group task data |
| batchReadGroupTaskData | Batch read machine group task data |
| batchReadErrors | Batch read machine connection status |
| readErrorSummary | Read status summary |

### File Management Interface, Prefix /cnc/ {#commands-cnc-files}

| RPC Command | Description |
| --- | --- |
| readProgramList | Read machine file list |
| receiveFile | Receive file from machine |
| readCurrentProgram | Receive the file currently running on the machine |
| sendFile | Send file to machine |
| batchSendFile | Batch send files to machine |
| deleteFile | Delete machine file |
| lockFileByRange | Lock/unlock machine program editing |
| createDir | Create machine directory |
| deleteDir | Delete machine directory |
| selectProgram | Select program |
| readAllPrograms | Browse all files |
| searchFile | Search machine files |

### Machine Data Analysis Interface, Prefix /analysis/ {#commands-analysis}

| RPC Command | Description |
| --- | --- |
| oee | Machine OEE data analysis |
| alarm | Machine alarm data analysis |
| count | Machine count data analysis |
| overall | Machine overall data analysis |
| cycle | Machine cycle time data analysis |

### Machine Group Data Analysis Interface, Prefix /group-analysis/ {#commands-group-analysis}

| RPC Command | Description |
| --- | --- |
| oee | Machine group OEE data analysis |
| alarm | Machine group alarm data analysis |
| count | Machine group count data analysis |
| overall | Machine group overall data analysis |
| cycle | Machine group cycle time data analysis |

### Historical Data Interface, Prefix /db/ {#commands-db}

| RPC Command | Description |
| --- | --- |
| machine | Machine historical data |
| group-machine | Historical data for all machines in the machine group |
| query | Query historical data |

### Global Configuration Interface, Prefix /config/ {#commands-config-global}

| RPC Command | Description |
| --- | --- |
| gateway-info | Get gateway information |
| settings | Get gateway global settings |
| update-settings | Modify gateway global settings |
| security | Get gateway global security settings |
| update-security | Modify gateway global security settings |

### User Configuration Interface, Prefix /config/ {#commands-config-users}

| RPC Command | Description |
| --- | --- |
| user | Get user settings |
| users | Get all user settings |
| create-user | Create new user |
| update-user | Modify user settings |
| delete-user | Delete user |
| user-security | Get user security settings |
| update-user-security | Modify user security settings |

### Machine Configuration Interface, Prefix /config/ {#commands-config-machines}

| RPC Command | Description |
| --- | --- |
| machine | Get machine configuration |
| machines | Get all machine configurations |
| create-machine | Add machine configuration |
| update-machine | Modify machine configuration |
| delete-machine | Delete machine configuration |
| batch-delete-machine | Batch delete machine configurations |

### Machine Group Configuration Interface, Prefix /config/ {#commands-config-groups}

| RPC Command | Description |
| --- | --- |
| group | Get machine group configuration |
| groups | Get all machine group configurations |
| create-group | Add machine group configuration |
| update-group | Modify machine group configuration |
| delete-group | Delete machine group configuration |
| batch-delete-group | Batch delete machine group configurations |

### Task Configuration Interface, Prefix /config/ {#commands-config-tasks}

| RPC Command | Description |
| --- | --- |
| machine-task-interval-settings | Get machine task interval settings |
| update-machine-task-interval-settings | Modify machine task interval settings |
| group-task-interval-settings | Get machine group task interval settings |
| update-group-task-interval-settings | Modify machine group task interval settings |
| oee-monitoring-settings | Get OEE monitoring settings |
| update-oee-monitoring-settings | Modify OEE monitoring settings |
| tool-life-monitoring-settings | Get tool life monitoring settings |
| update-tool-life-monitoring-settings | Modify tool life monitoring settings |
| count-monitoring-settings | Get machining count monitoring settings |
| update-count-monitoring-settings | Modify machining count monitoring settings |
| overload-monitoring-settings | Get overload monitoring settings |
| update-overload-monitoring-settings | Modify overload monitoring settings |
| alarm-monitoring-settings | Get alarm monitoring settings |
| update-alarm-monitoring-settings | Modify alarm monitoring settings |
| machine-status-monitoring-settings | Get machine status monitoring settings |
| update-machine-status-monitoring-settings | Modify machine status monitoring settings |

### Communication Configuration Interface, Prefix /config/ {#commands-config-communication}

| RPC Command | Description |
| --- | --- |
| cloud-settings | Get cloud platform settings |
| update-cloud-settings | Modify cloud platform settings |
| modbus-settings | Get MODBUS settings |
| update-modbus-settings | Modify MODBUS settings |
| mqtt-settings | Get MQTT settings |
| update-mqtt-settings | Modify MQTT settings |
| database-settings | Get database settings |
| update-database-settings | Modify database settings |
| gateway-file-server-settings | Get gateway file server settings |
| update-gateway-file-server-settings | Modify gateway file server settings |
| http-settings | Get HTTP settings |
| update-http-settings | Modify HTTP settings |
| hub-settings | Get Hub settings |
| update-hub-settings | Modify Hub settings |
| remote-access | Get remote access settings |
| update-remote-access | Modify remote access settings |

### Core Service Function Interface, Prefix /core/ {#commands-core}

| RPC Command | Description |
| --- | --- |
| info | Get Core service information |
| license-info | Get license information |
| service-status | Get service status |
| upload-license | Upload gateway license |

### Gateway Service Function Interface, Prefix /gateway/ {#commands-gateway}

| RPC Command | Description |
| --- | --- |
| alias | Get gateway name |
| update-alias | Modify gateway name |
| reboot | Reboot gateway hardware |
| restart | Restart all services |
| restart-service | Restart Core service |
| shut-down | Shut down gateway |
| internet-connection | Get gateway network status |
| hardware-resources | Get gateway hardware resources |
| time | Get gateway current time |
| sync-time | Sync gateway time |
| time-zone | Get gateway time zone |
| time-zones | Get time zone options |
| update-time-zone | Modify gateway time zone |
| network-adapters | Get gateway network adapter list |
| lan | Get wired network settings |
| update-lan | Modify gateway wired network settings |
| wifi | Get wireless network settings |
| update-wifi | Modify wireless network settings |
| search-wifi | Search for wireless networks |
| connect-wifi | Connect to wireless network |
| disconnect-wifi | Disconnect wireless network |
| static-routing | Get static routing settings |
| update-static-routing | Modify static routing settings |
| connect-remote-host | Connect to remote server |
| disconnect-remote-host | Disconnect from remote server |
| file-server-items | Get gateway file server list |
| delete-file-server-item | Delete gateway file server item |

Except for the authentication interface and some file management interfaces, RPC commands correspond one-to-one with the corresponding interfaces in [II. HTTP Communication](/en/http/); input parameters and return results can be found in the interface descriptions in [II. HTTP Communication](/en/http/).

## Examples {#rpc-examples}

### Example 1: sendFile - Send File to Machine {#example-sendfile}

In Default mode, to send the ASCII-encoded file content "fileContent" to the Dir/Prog directory of the machine with machineID 1010 and save it as 2222, use the request topic: "request/1", where 1 is the custom request identifier. The request message, including the RPC command and parameters, is as follows:

```json
{
  "method": "sendFile",
  "params": {
    "machineID": "1010",
    "fileName": "2222",
    "dirAtCNC": "Dir/Prog",
    "data": {
      "content": "fileContent",
      "encoding": "us-ascii"
    }
  }
}
```

Where machineID, fileName, and dirAtCNC are the request parameters in the URL of the HTTP interface [2.6.6. sendFile - Send File to Machine](/en/http/file-management/#sendfile), embedded directly in the "params" field. The POST request body should be embedded in the "data" field within "params".

Reply topic "response/1"; the reply message is as follows:

```json
{
  "errorCode": 0,
  "errorMsg": "Success"
}
```

### Example 2: writeOffsetData - Write Tool Offset Data {#example-writeoffsetdata}

In Default mode, to write tool offset data for offset number 1, use the request topic: "request/2", where 2 is the custom request identifier. The request message, including the RPC command and parameters, is as follows:

```json
{
  "method": "writeOffsetData",
  "params": {
    "machineID": "1010",
    "offsetNum": 1,
    "data": {
      "toolNose": 3,
      "lengthWear": 0.0001,
      "radiusWear": 0.03,
      "lengthGeom": 0.0,
      "radiusGeom": 0.002
    }
  }
}
```

Where machineID and offsetNum are parameters in the URL of the HTTP interface [2.5.1.14. writeOffsetData - Write Tool Offset Data](/en/http/direct-offset-plc/#writeoffsetdata), embedded directly in the "params" field. The POST request body should be embedded in the "data" field within "params".

Reply topic "response/2"; the reply message is as follows:

```json
{
  "errorCode": 0,
  "errorMsg": "Success"
}
```
