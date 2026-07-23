---
title: "2. HTTP Communication"
sidebar:
  label: "Basic Description and Error Handling"
---


## 2.1. Basics {#basics}

The service runs on the standard HTTP port (port 80). Unless otherwise specified, the base address for requests is **/api/cnc**. A standard request URL has the following format:

```
http://{Gateway IP}/api/cnc/{Interface Name}?MachineID={Target Machine machineID}
```

For example, if the gateway's IP address is 192.168.100.1, and you want to obtain the running status of the main channel of a machine tool connected to this gateway with IP 192.168.1.10 and MachineID 1010 (for an explanation of machineID, see [1.1.1. machineID Machine Identifier](/en/conventions/identifiers/#machineid)), you should use the `/readCNCStatus` interface, and the corresponding request URL is:

```
http://192.168.100.1/api/cnc/readCNCStatus?MachineID=1010
```

All interfaces only accept HTTP data with Content-Type set to application/json.

Except for a few file-related interfaces, most interfaces return HTTP data of type application/json.

All data must be encoded in UTF-8.

In the descriptions below, some interfaces require additional input parameters in the request URL.

## 2.2. Error Handling {#error-handling}

Whenever an error occurs in a request, an error object is returned as follows:

```json
{
  "errorCode": -1,
  "errorMsg": "Unknown error"
}
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| errorCode | Int32 | (Required) Error code, 0 indicates success. |
| errorMsg | String | (Required) Error message |

When the operation succeeds, the corresponding data is returned, and the HTTP status code is 200 in this case.

When an error occurs, an error code is returned, and the HTTP status code is generally 400, 409, 500, etc. Common error codes are as follows:

### Common Error Codes {#error-codes}

| Error Code | Message | Description |
| --- | --- | --- |
| 0 | Success | Operation executed successfully |
| 3 | Machine off or offline | Unable to communicate with the machine tool; the machine tool is powered off or there is a network hardware fault (machine tool network port, switch, network cable, etc.) |
| 7 | No permission | The interface is protected or out of authorization scope, or the authentication information is invalid. |
| 102 | Machine network fault, unable to obtain data | Able to communicate with the machine tool, but unable to obtain data; there is an issue with the machine tool's network settings |
| 125 | Invalid file path | The input file path is invalid |
| 142 | File already exists | A file with the same name already exists in the target directory |
| 143 | File is in use | The file to be operated on is currently in use |
| 144 | File is write-protected | The file to be operated on is write-protected |
| 158 | File does not exist | The target file does not exist in the target directory |
| 10003 | machineID does not exist | The machineID is incorrect, the corresponding machine is not activated, or the gateway service was not restarted after editing the machine's IP or activation status |
| 10006 | Interface not authorized | To use an unauthorized interface, please contact BIVROST |
