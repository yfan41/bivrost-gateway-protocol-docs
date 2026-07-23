---
title: "2.6. File Management Interface"
sidebar:
  label: "2.6. File Management Interface"
---


The file management interface can connect to a target file server, enabling reading of file lists, receiving, sending, deleting, locking, and unlocking files, creating and deleting directories, and other functions.

The file server types currently supported for file transfer include "machine storage", "FTP server", "shared folder", etc. (see the Bivrost Gateway Manual [5.3.1.3. Program Transfer Settings](https://docs.bivrost.cn/gateway/usage/machines#add-machine)), with "machine storage" as the default. Some CNC systems can enable a local FTP server or shared folder option for file transfer. For machines with limited local storage, or machines that do not support direct access to their storage space, an external file server can be used to enable file transfer.

Most file management interfaces accept an additional request parameter, dirAtCNC or subDir, to specify the directory path on the machine or file server. If neither dirAtCNC nor subDir is supplied, the corresponding file operation is performed in the root directory by default. Users can specify a root directory path (see the Bivrost Gateway Manual [5.3.1.3. Program Transfer Settings](https://docs.bivrost.cn/gateway/usage/machines#add-machine)). If the user has not specified a root directory path, the following default root directory paths are used.

## Default Root Directory Paths by System Model {#default-root-paths}

| File Server Type | System [Model] | Target Directory Path Supported | Default Root Directory Path |
| --- | --- | --- | --- |
| Machine storage | Brother [TC series] | X | `/` |
| Machine storage | Brother [S series] | O | `/` |
| Machine storage | Delta [general] | O | `B:\` |
| Machine storage | Fagor [all models] | O | `MEMORY` |
| Machine storage | Fanuc [0i-D, 0i-F, 30i, 31i, 32i, 35i, Power Motion i-A]\* | O | `//CNC_MEM/` |
| Machine storage | Fanuc [models other than 0i-D, 0i-F, 30i, 31i, 32i, 35i, Power Motion i-A] | X | The current foreground directory configured on the machine, not fixed, e.g. `//CNC_MEM/` |
| Machine storage | Gsk [980, 988] | O | `/user/NCPROG` |
| Machine storage | Haas [general, MT-CONNECT] | O | None |
| Machine storage | Heidenhain [TNC640, TNC640 DNC] | O | `TNC:\nc_prog` |
| Machine storage | Heidenhain [iTNC530] | O | `TNC:\` |
| Machine storage | Lynuc [all models] | O | `/home/Lynuc/Users/NCFiles` |
| Machine storage | Mitsubishi [all models]\*\* | O | `PRG\USER\` |
| Machine storage | Mock machine | O | `/` |
| Machine storage | Okuma [all models] | O | `MD1` |
| Machine storage | Rexroth [OPC UA] | O | `Filesystem/prog` |
| Machine storage | Siemens [general] | O | `/nckfs` |
| Machine storage | Siemens [OPC UA] | O | `Sinumerik/FileSystem/Part Program` |
| Machine storage | Siemens [810D/840D] | O | `mpf.dir` |
| Machine storage | Other system models supporting program transfer | X | Machine's default storage directory |
| FTP server | | O | FTP server root directory |
| Shared folder | | O | None |
| Shared folder (Win XP) | | O | None |
| Wireless transfer box | | O | `/` |
| Gateway file server | | O | `/` |

O: Supported;
X: Not supported

\*: For FANUC [0i-F, 30i, 31i, 32i, 35i, Power Motion i-A], the target directory path can be changed to an external CF card, e.g. `//MEMCARD/`.

\*\*: For Mitsubishi [M700 series, M800 series], the target directory path can be changed to an external CF card (M700 series) or SD card (M800 series), e.g. IC1.

## 2.6.1. readProgramList — Read Machine File List {#readprogramlist}

```http
GET /api/cnc/readProgramList?machineID=MACHINEID&dirAtCNC=DIRATCNC&subDir=SUBDIR
```

| Request Parameter | Type | Description |
| --- | --- | --- |
| machineID | String | (Required) Target machine identifier, see [1.1.1. machineID Machine Identifier](/en/conventions/identifiers/#machineid) |
| dirAtCNC | String | Specifies the target directory path. If this parameter is not supplied, the default root directory path is used. See [Default Root Directory Paths by System Model](#default-root-paths) for each system model's default root directory path. |
| subDir | String | Specifies the target subdirectory path. If dirAtCNC is not provided, the root directory path and subdirectory path are automatically concatenated to form dirAtCNC. Users can refer to the Bivrost Gateway Manual [5.3.1.3. Program Transfer Settings](https://docs.bivrost.cn/gateway/usage/machines#add-machine) to modify the root directory path; if it has not been modified, see [Default Root Directory Paths by System Model](#default-root-paths) for the default root directory path. If dirAtCNC and subDir are both supplied, subDir is ignored. |

Response example

```json
{
  "dirAtCNC": "Dir/Prog",
  "programs": [
    "1111",
    "2322",
    "3222"
  ],
  "subDirs": [
    "dir1",
    "dir2"
  ]
}
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| dirAtCNC | String | (Required) Specifies the directory path. Generally matches the dirAtCNC in the request parameters, except: 1. If the device has only one default directory (with no specific path given) for storing files and folders, the returned dirAtCNC is empty; 2. If the request parameter dirAtCNC is not supplied or is empty, the returned dirAtCNC is the default root directory path; 3. If the path specified by the request parameter dirAtCNC exists but does not conform to the system's path format, the returned dirAtCNC is the automatically corrected path. |
| programs | String[] | (Required) List of programs (files) in the specified directory |
| subDirs | String[] | (Required) List of subfolders in the specified directory. For some system models, the subfolder list cannot be retrieved, and the returned subDirs is empty. |

### Support for Retrieving the Subfolder List in the Read Machine File List Interface by System Model {#subdir-support}

| File Server Type | System [Model] | Retrieve File List | Retrieve Subfolder List |
| --- | --- | --- | --- |
| Machine storage | Brother [all models] | O | O |
| Machine storage | Fagor [all models] | O | X |
| Machine storage | Fanuc [0i-D, 0i-F, 30i, 31i, 32i, 35i, Power Motion i-A] | \* | O |
| Machine storage | Fanuc [models other than 0i-D, 0i-F, 30i, 31i, 32i, 35i, Power Motion i-A] | O | X |
| Machine storage | Heidenhain [all models] | O | O |
| Machine storage | Lynuc [all models] | O | O |
| Machine storage | Mitsubishi [all models] | O | X |
| Machine storage | Mock machine | O | O |
| Machine storage | Okuma [all models] | O | O |
| Machine storage | Rexroth [OPC UA] | O | O |
| Machine storage | Siemens [all models] | O | O |
| Machine storage | Other system models supporting program transfer | O | X |
| FTP server | | O | O |
| Shared folder | | O | O |
| Shared folder (Win XP) | | O | O |
| Wireless transfer box | | O | O |
| Gateway file server | | O | O |

O: Supported;　X: Not supported

\*: FANUC [0i-D, 0i-F, 30i, 31i, 32i, 35i, Power Motion i-A] returns the standard FANUC program name (letter O + number), automatically stripping leading zeros from the number. For example, if the program name on the machine is 00010, it is returned as O10. For non-standard named programs, the name is returned as-is from the machine, e.g. if the program name is SAMPLE, it is returned as SAMPLE.

## 2.6.2. receiveFileStream — Receive Machine File (Stream Mode) {#receivefilestream}

This interface can receive both text files and binary files. Compared to [2.6.3. receiveFile — Receive Machine File](#receivefile), it additionally supports files larger than 10MB. Users are recommended to use the /receiveFileStream interface whenever possible.

```http
GET /api/cnc/receiveFileStream?machineID=MACHINEID&fileName=FILENAME&dirAtCNC=DIRATCNC&subDir=SUBDIR
```

| Request Parameter | Type | Description |
| --- | --- | --- |
| machineID | String | (Required) Target machine identifier, see [1.1.1. machineID Machine Identifier](/en/conventions/identifiers/#machineid) |
| fileName | String | (Required) File name of the target file, refer to the file name returned by [2.6.1. readProgramList — Read Machine File List](#readprogramlist) or [2.6.15. readAllPrograms — Browse All Files](#readallprograms). For some system models, such as Gsk and Siemens, the file name must include the file extension. |
| dirAtCNC | String | Specifies the target directory path. If this parameter is not supplied, the default root directory path is used. See [Default Root Directory Paths by System Model](#default-root-paths) for each system model's default root directory path. |
| subDir | String | Specifies the target subdirectory path. If dirAtCNC is not provided, the root directory path and subdirectory path are automatically concatenated to form dirAtCNC. Users can refer to the Bivrost Gateway Manual [5.3.1.3. Program Transfer Settings](https://docs.bivrost.cn/gateway/usage/machines#add-machine) to modify the root directory path; if it has not been modified, see [Default Root Directory Paths by System Model](#default-root-paths) for the default root directory path. If dirAtCNC and subDir are both supplied, subDir is ignored. |

Response example

If the target file is a text file, the response body example is application/octet-stream

```text
%
O0001
G21 G90 G40
T01 M06
G90 G0 G54 X12.64 Y88.0 s2546
G43 H01 Z15.0 M8
G81 G98 Z-20. R1.F200.
x70.
X85.
x170.
G80
G00 x100. Y200
G28 G91 z0 M9
M30
%
```

If the target file is a binary file, it is returned in binary format in the response body.

## 2.6.3. receiveFile — Receive Machine File {#receivefile}

This interface can receive both text files and binary files. Compared to [2.6.2. receiveFileStream — Receive Machine File (Stream Mode)](#receivefilestream), this interface does not support files larger than 10MB. Users are recommended to use the /receiveFileStream interface whenever possible.

```http
GET /api/cnc/receiveFile?machineID=MACHINEID&fileName=FILENAME&dirAtCNC=DIRATCNC&subDir=SUBDIR
```

| Request Parameter | Type | Description |
| --- | --- | --- |
| machineID | String | (Required) Target machine identifier, see [1.1.1. machineID Machine Identifier](/en/conventions/identifiers/#machineid) |
| fileName | String | (Required) File name of the target file, refer to the file name returned by [2.6.1. readProgramList — Read Machine File List](#readprogramlist) or [2.6.15. readAllPrograms — Browse All Files](#readallprograms). For some system models, such as Gsk and Siemens, the file name must include the file extension. |
| dirAtCNC | String | Specifies the target directory path. If this parameter is not supplied, the default root directory path is used. See [Default Root Directory Paths by System Model](#default-root-paths) for each system model's default root directory path. |
| subDir | String | Specifies the target subdirectory path. If dirAtCNC is not provided, the root directory path and subdirectory path are automatically concatenated to form dirAtCNC. Users can refer to the Bivrost Gateway Manual [5.3.1.3. Program Transfer Settings](https://docs.bivrost.cn/gateway/usage/machines#add-machine) to modify the root directory path; if it has not been modified, see [Default Root Directory Paths by System Model](#default-root-paths) for the default root directory path. If dirAtCNC and subDir are both supplied, subDir is ignored. |

Response example

When the file is in text format:

```json
{
  "content": "string",
  "encoding": "us-ascii"
}
```

When the file is in binary format:

```json
{
  "base64": "string"
}
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| content | String | File content |
| encoding | String | Original file encoding |
| base64 | String | When the file is in binary format, the gateway uses Base64 encoding to convert the binary content into a string. Users can decode it themselves to obtain the binary file. |

## 2.6.4. readCurrentProgram — Receive the Machine's Currently Running File {#readcurrentprogram}

```http
GET /api/cnc/readCurrentProgram?machineID=MACHINEID&dirAtCNC=DIRATCNC&subDir=SUBDIR
```

| Request Parameter | Type | Description |
| --- | --- | --- |
| machineID | String | (Required) Target machine identifier, see [1.1. Basic Description](/en/conventions/identifiers/#machineid) for an explanation of machineID. |
| dirAtCNC | String | Specifies the target directory path. If this parameter is not supplied, the default root directory path is used. See [Default Root Directory Paths by System Model](#default-root-paths) for each system model's default root directory path. |
| subDir | String | Specifies the target subdirectory path. If dirAtCNC is not provided, the root directory path and subdirectory path are automatically concatenated to form dirAtCNC. Users can refer to the Bivrost Gateway Manual [5.3.1.3. Program Transfer Settings](https://docs.bivrost.cn/gateway/usage/machines#add-machine) to modify the root directory path; if it has not been modified, see [Default Root Directory Paths by System Model](#default-root-paths) for the default root directory path. If dirAtCNC and subDir are both supplied, subDir is ignored. |

Response example

When the file is in text format:

```json
{
  "dirAtCNC": "Dir/Prog",
  "fileName": "O9001",
  "content": "string",
  "encoding": "us-ascii"
}
```

When the file is in binary format:

```json
{
  "dirAtCNC": "Dir/Prog",
  "fileName": "Program",
  "base64": "string"
}
```

When there is no file currently running:

```json
{
  "errorCode": 158,
  "errorMsg": "Path is not found.",
  "statusMsg": "No content."
}
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| dirAtCNC | String | Directory path of the file currently running on the machine |
| fileName | String | File name of the file currently running on the machine |
| content | String | File content |
| encoding | String | Original file encoding |
| base64 | String | When the file is in binary format, the gateway uses Base64 encoding to convert the binary content into a string. Users can decode it themselves to obtain the binary file. |
| errorCode | Int32 | Error code, 0 indicates success. |
| errorMsg | String | Error message |
| statusMsg | String | Error details |

## 2.6.5. sendFileStream — Send File to Machine (Stream Mode) {#sendfilestream}

This interface can send both text files and binary files. Compared to [2.6.6. sendFile — Send File to Machine](#sendfile), it additionally supports files larger than 10MB. Users are recommended to use the /sendFileStream interface whenever possible.

Overwriting a file with the same name is not supported. Please delete the file with the same name first, then send.

```http
POST /api/cnc/sendFileStream?machineID=MACHINEID&fileName=FILENAME&dirAtCNC=DIRATCNC&subDir=SUBDIR
```

Request example

If the target file is a text file, the request body example is application/octet-stream

```text
%
O0001
G21 G90 G40
T01 M06
G90 G0 G54 X12.64 Y88.0 s2546
G43 H01 Z15.0 M8
G81 G98 Z-20. R1.F200.
x70.
X85.
x100.
x170.
X185.
x200.
G80
G00 x100. Y200
G28 G91 z0 M9
M30
%
```

If the target file is a binary file, it is uploaded to the request body in binary format.

| Request Parameter | Type | Description |
| --- | --- | --- |
| machineID | String | (Required) Target machine identifier, see [1.1.1. machineID Machine Identifier](/en/conventions/identifiers/#machineid) |
| fileName | String | File name of the target file on the machine. For some system models, such as Gsk and Siemens, the file name must include the file extension; refer to the file name returned by [2.6.1. readProgramList — Read Machine File List](#readprogramlist) or [2.6.15. readAllPrograms — Browse All Files](#readallprograms). For FANUC systems, fileName is not used; the program name is taken from the content between the first `\n` and the second `\n` in Content. For example, if Content is `"%\nO3(ROUGH) \nT1M06\nG92X0.Y0.Z0. …"`, the program name displayed on the machine will be O0003, with comment (ROUGH); if Content is `"%\<SAMPLE>\nT1M06\nG92X0.Y0.Z0. …"`, the program name displayed on the machine will be SAMPLE. |
| dirAtCNC | String | Specifies the target directory path. If this parameter is not supplied, the default root directory path is used. See [Default Root Directory Paths by System Model](#default-root-paths) for each system model's default root directory path. |
| subDir | String | Specifies the target subdirectory path. If dirAtCNC is not provided, the root directory path and subdirectory path are automatically concatenated to form dirAtCNC. Users can refer to the Bivrost Gateway Manual [5.3.1.3. Program Transfer Settings](https://docs.bivrost.cn/gateway/usage/machines#add-machine) to modify the root directory path; if it has not been modified, see [Default Root Directory Paths by System Model](#default-root-paths) for the default root directory path. If dirAtCNC and subDir are both supplied, subDir is ignored. |

Response example

```json
{
  "errorCode": 0,
  "errorMsg": "Success"
}
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| errorCode | Int32 | (Required) Error code, 0 indicates success. |
| errorMsg | String | (Required) Error message |

## 2.6.6. sendFile — Send File to Machine {#sendfile}

This interface can send both text files and binary files. Compared to [2.6.5. sendFileStream — Send File to Machine (Stream Mode)](#sendfilestream), this interface does not support files larger than 10MB. Users are recommended to use the /sendFileStream interface whenever possible.

Overwriting a file with the same name is not supported. Please delete the file with the same name first, then send.

```http
POST /api/cnc/sendFile?machineID=MACHINEID&fileName=FILENAME&dirAtCNC=DIRATCNC&subDir=SUBDIR
```

Request body example application/json

When the file is in text format:

```json
{
  "content": "string",
  "encoding": "us-ascii"
}
```

When the file is in binary format:

```json
{
  "base64": "string"
}
```

| Request Parameter | Type | Description |
| --- | --- | --- |
| machineID | String | (Required) Target machine identifier, see [1.1.1. machineID Machine Identifier](/en/conventions/identifiers/#machineid) |
| fileName | String | File name of the target file on the machine. For some system models, such as Gsk and Siemens, the file name must include the file extension; refer to the file name returned by [2.6.1. readProgramList — Read Machine File List](#readprogramlist) or [2.6.15. readAllPrograms — Browse All Files](#readallprograms). For FANUC systems, fileName is not used; the program name is taken from the content between the first `\n` and the second `\n` in Content. For example, if Content is `"%\nO3(ROUGH) \nT1M06\nG92X0.Y0.Z0. …"`, the program name displayed on the machine will be O0003, with comment (ROUGH); if Content is `"%\<SAMPLE>\nT1M06\nG92X0.Y0.Z0. …"`, the program name displayed on the machine will be SAMPLE. |
| dirAtCNC | String | Specifies the target directory path. If this parameter is not supplied, the default root directory path is used. See [Default Root Directory Paths by System Model](#default-root-paths) for each system model's default root directory path. |
| subDir | String | Specifies the target subdirectory path. If dirAtCNC is not provided, the root directory path and subdirectory path are automatically concatenated to form dirAtCNC. Users can refer to the Bivrost Gateway Manual [5.3.1.3. Program Transfer Settings](https://docs.bivrost.cn/gateway/usage/machines#add-machine) to modify the root directory path; if it has not been modified, see [Default Root Directory Paths by System Model](#default-root-paths) for the default root directory path. If dirAtCNC and subDir are both supplied, subDir is ignored. |
| content | String | File content. Use this parameter when the file is in text format. When Content is defined, the Base64 parameter is ignored. |
| encoding | String | Original file encoding. If not specified, the encoding configured on the machine is used by default. |
| base64 | String | Use this parameter when the file is in binary format. Encode the binary content as a string using Base64 encoding before writing it into this parameter. |

Response example

```json
{
  "errorCode": 0,
  "errorMsg": "Success"
}
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| errorCode | Int32 | (Required) Error code, 0 indicates success. |
| errorMsg | String | (Required) Error message |

## 2.6.7. batchSendFile — Batch Send Files to Machines {#batchsendfile}

This interface is a batch version of [2.6.6. sendFile — Send File to Machine](#sendfile). By supplying target locations in the request body, the same file can be sent, under different file names, to different locations on different machines simultaneously.

Overwriting a file with the same name is not supported. Please delete the file with the same name first, then send.

```http
POST /api/cnc/batchSendFile
```

Request body example application/json

When the file is in text format:

```json
{
  "content": "string",
  "encoding": "us-ascii",
  "targets": [
    { "machineID": "1010", "fileName": "O8000" },
    { "machineID": "1011", "fileName": "sample.NC", "DirAtCNC": "dir1" },
    { "machineID": "1012", "fileName": "sample.NC", "SubDir": "Dir/Prog" }
  ]
}
```

When the file is in binary format:

```json
{
  "base64": "string",
  "targets": [
    { "machineID": "1011", "fileName": "sample.NC", "SubDir": "Dir/Prog" }
  ]
}
```

The request parameters match those in [2.6.6. sendFile — Send File to Machine](#sendfile).

| Request Parameter | Type | Description |
| --- | --- | --- |
| targets | Array | (Required) Target paths for sending the file to machines |
| machineID | String | (Required) Target machine identifier, see [1.1.1. machineID Machine Identifier](/en/conventions/identifiers/#machineid) |
| fileName | String | (Required) File name of the target file on the machine. For some system models, such as Gsk and Siemens, the file name must include the file extension; refer to the file name returned by [2.6.1. readProgramList — Read Machine File List](#readprogramlist) or [2.6.15. readAllPrograms — Browse All Files](#readallprograms). For FANUC systems, fileName is not used; the program name is taken from the content between the first `\n` and the second `\n` in Content. For example, if Content is `"%\nO3(ROUGH) \nT1M06\nG92X0.Y0.Z0. …"`, the program name displayed on the machine will be O0003, with comment (ROUGH). |
| dirAtCNC | String | Specifies the target directory path. If this parameter is not supplied, the default root directory path is used. See [Default Root Directory Paths by System Model](#default-root-paths) for each system model's default root directory path. |
| subDir | String | Specifies the target subdirectory path. If dirAtCNC is not provided, the root directory path and subdirectory path are automatically concatenated to form dirAtCNC. Users can refer to the Bivrost Gateway Manual [5.3.1.3. Program Transfer Settings](https://docs.bivrost.cn/gateway/usage/machines#add-machine) to modify the root directory path; if it has not been modified, see [Default Root Directory Paths by System Model](#default-root-paths) for the default root directory path. If dirAtCNC and subDir are both supplied, subDir is ignored. |
| content | String | File content. Use this parameter when the file is in text format. When content is defined, the Base64 parameter is ignored. |
| encoding | String | Original file encoding. If not specified, the encoding configured on the machine is used by default. |
| base64 | String | Use this parameter when the file is in binary format. Encode the binary content as a string using Base64 encoding before writing it into this parameter. |

Response example

```json
[
  {
    "errorCode": 0,
    "errorMsg": "Success"
  },
  {
    "errorCode": 10003,
    "errorMsg": "Machine ID does not exist."
  },
  {
    "errorCode": 142,
    "errorMsg": "Path exists."
  }
]
```

The response body contains the execution results for each request in the request body, in order.

| Response Parameter | Type | Description |
| --- | --- | --- |
| errorCode | Int32 | (Required) Error code, 0 indicates success. |
| errorMsg | String | (Required) Error message |

## 2.6.8. deleteFile — Delete Machine File {#deletefile}

This interface deletes the specified file on the machine.

```http
GET /api/cnc/deleteFile?machineID=MACHINEID&fileName=FILENAME&dirAtCNC=DIRATCNC&subDir=SUBDIR
```

| Request Parameter | Type | Description |
| --- | --- | --- |
| machineID | String | (Required) Target machine identifier, see [1.1.1. machineID Machine Identifier](/en/conventions/identifiers/#machineid) |
| fileName | String | (Required) File name of the target file, refer to the file name returned by [2.6.1. readProgramList — Read Machine File List](#readprogramlist) or [2.6.15. readAllPrograms — Browse All Files](#readallprograms). For some system models, such as Gsk and Siemens, the file name must include the file extension. |
| dirAtCNC | String | Specifies the target directory path. If this parameter is not supplied, the default root directory path is used. See [Default Root Directory Paths by System Model](#default-root-paths) for each system model's default root directory path. |
| subDir | String | Specifies the target subdirectory path. If dirAtCNC is not provided, the root directory path and subdirectory path are automatically concatenated to form dirAtCNC. Users can refer to the Bivrost Gateway Manual [5.3.1.3. Program Transfer Settings](https://docs.bivrost.cn/gateway/usage/machines#add-machine) to modify the root directory path; if it has not been modified, see [Default Root Directory Paths by System Model](#default-root-paths) for the default root directory path. If dirAtCNC and subDir are both supplied, subDir is ignored. |

Response example

```json
{
  "errorCode": 0,
  "errorMsg": "Success"
}
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| errorCode | Int32 | (Required) Error code, 0 indicates success. |
| errorMsg | String | (Required) Error message |

## 2.6.9. batchDeleteFile — Batch Delete Machine Files {#batchdeletefile}

This interface is a batch version of [2.6.8. deleteFile — Delete Machine File](#deletefile). By supplying target locations in the request body, different files on different machines can be deleted in a single call.

```http
POST /api/cnc/batchDeleteFile
```

Request body example application/json

```json
[
  { "machineID": "1010", "fileName": "O8000" },
  { "machineID": "1011", "fileName": "sample.NC", "DirAtCNC": "dir1" },
  { "machineID": "1012", "fileName": "sample.NC", "SubDir": "Dir/Prog" }
]
```

The request parameters match those in [2.6.8. deleteFile — Delete Machine File](#deletefile).

| Request Parameter | Type | Description |
| --- | --- | --- |
| machineID | String | (Required) Target machine identifier, see [1.1.1. machineID Machine Identifier](/en/conventions/identifiers/#machineid) |
| fileName | String | (Required) File name of the target file, refer to the file name returned by [2.6.1. readProgramList — Read Machine File List](#readprogramlist) or [2.6.15. readAllPrograms — Browse All Files](#readallprograms). For some system models, such as Gsk and Siemens, the file name must include the file extension. |
| dirAtCNC | String | Specifies the target directory path. If this parameter is not supplied, the default root directory path is used. See [Default Root Directory Paths by System Model](#default-root-paths) for each system model's default root directory path. |
| subDir | String | Specifies the target subdirectory path. If dirAtCNC is not provided, the root directory path and subdirectory path are automatically concatenated to form dirAtCNC. Users can refer to the Bivrost Gateway Manual [5.3.1.3. Program Transfer Settings](https://docs.bivrost.cn/gateway/usage/machines#add-machine) to modify the root directory path; if it has not been modified, see [Default Root Directory Paths by System Model](#default-root-paths) for the default root directory path. If dirAtCNC and subDir are both supplied, subDir is ignored. |

Response example

```json
[
  {
    "errorCode": 0,
    "errorMsg": "Success"
  },
  {
    "errorCode": 10003,
    "errorMsg": "Machine ID does not exist."
  },
  {
    "errorCode": 158,
    "errorMsg": "Path is not found."
  }
]
```

The response body contains the execution results for each request in the request body, in order.

| Response Parameter | Type | Description |
| --- | --- | --- |
| errorCode | Int32 | (Required) Error code, 0 indicates success. |
| errorMsg | String | (Required) Error message |

## 2.6.10. lockFileByRange — Lock/Unlock Machine Program Editing {#lockfilebyrange}

Currently, this only supports Mitsubishi and Fanuc systems, for locking/unlocking editing of program numbers within the ranges 8000-8999, 9000-9999, and 8000-9999. On some systems, a locked program cannot be edited but can still be deleted from the machine.

```http
GET /api/cnc/lockFileByRange?machineID=MACHINEID&isLock=ISLOCK&lockStart=LOCKSTART&lockEnd=LOCKEND
```

| Request Parameter | Type | Description |
| --- | --- | --- |
| machineID | String | (Required) Target machine identifier, see [1.1.1. machineID Machine Identifier](/en/conventions/identifiers/#machineid) |
| isLock | Bool | (Required) Target lock state. IsLock: true to lock, false to unlock. |
| lockStart | Int32 | (Required) Starting program number of the lock/unlock range |
| lockEnd | Int32 | (Required) Ending program number of the lock/unlock range |

Response example

```json
{
  "errorCode": 0,
  "errorMsg": "Success"
}
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| errorCode | Int32 | (Required) Error code, 0 indicates success. |
| errorMsg | String | (Required) Error message |

## 2.6.11. createDir — Create Machine Directory {#createdir}

```http
GET /api/cnc/createDir?machineID=MACHINEID&dirName=DIRNAME&dirAtCNC=DIRATCNC&subDir=SUBDIR
```

| Request Parameter | Type | Description |
| --- | --- | --- |
| machineID | String | (Required) Target machine identifier, see [1.1.1. machineID Machine Identifier](/en/conventions/identifiers/#machineid) |
| dirName | String | (Required) Name of the directory to create |
| dirAtCNC | String | Specifies the target directory path. If this parameter is not supplied, the default root directory path is used. See [Default Root Directory Paths by System Model](#default-root-paths) for each system model's default root directory path. |
| subDir | String | Specifies the target subdirectory path. If dirAtCNC is not provided, the root directory path and subdirectory path are automatically concatenated to form dirAtCNC. Users can refer to the Bivrost Gateway Manual [5.3.1.3. Program Transfer Settings](https://docs.bivrost.cn/gateway/usage/machines#add-machine) to modify the root directory path; if it has not been modified, see [Default Root Directory Paths by System Model](#default-root-paths) for the default root directory path. If dirAtCNC and subDir are both supplied, subDir is ignored. |

Response example

```json
{
  "errorCode": 0,
  "errorMsg": "Success"
}
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| errorCode | Int32 | (Required) Error code, 0 indicates success. |
| errorMsg | String | (Required) Error message |

The system models that currently support creating machine directories are listed in the table below.

### System Model Support for the Create/Delete Machine Directory Interfaces {#dir-support}

| File Server Type | System [Model] | Create/Delete Machine Directory |
| --- | --- | --- |
| Machine storage | Brother [S series] | O |
| Machine storage | Delta [general] | O |
| Machine storage | Fanuc [0i-D, 0i-F, 30i, 31i, 32i, 35i, Power Motion i-A] | O |
| Machine storage | GSK [all models] | X |
| Machine storage | Haas [general, MT-CONNECT] | O |
| Machine storage | Heidenhain [all models] | O |
| Machine storage | Mitsubishi [M70/M700 L, M70/M700 M, M80/M800 L, M80/M800 M] | \*CF card and SD card only (path: IC1) |
| Machine storage | Mock machine | O |
| Machine storage | Okuma [all models] | O |
| Machine storage | Rexroth [OPC UA] | O |
| Machine storage | Siemens [all models] | O |
| Machine storage | Other system models supporting program transfer | X |
| FTP server | | O |
| Shared folder | | O |
| Shared folder (Win XP) | | O |
| Wireless transfer box | | O |
| Gateway file server | | O |

O: Supported;
X: Not supported

## 2.6.12. deleteDir — Delete Machine Directory {#deletedir}

Currently, only empty directories can be deleted. Users must first delete all files and subdirectories within the directory.

```http
GET /api/cnc/deleteDir?machineID=MACHINEID&dirName=DIRNAME&dirAtCNC=DIRATCNC&subDir=SUBDIR
```

| Request Parameter | Type | Description |
| --- | --- | --- |
| machineID | String | (Required) Target machine identifier, see [1.1.1. machineID Machine Identifier](/en/conventions/identifiers/#machineid) |
| dirName | String | (Required) Name of the directory to delete |
| dirAtCNC | String | Specifies the target directory path. If this parameter is not supplied, the default root directory path is used. See [Default Root Directory Paths by System Model](#default-root-paths) for each system model's default root directory path. |
| subDir | String | Specifies the target subdirectory path. If dirAtCNC is not provided, the root directory path and subdirectory path are automatically concatenated to form dirAtCNC. Users can refer to the Bivrost Gateway Manual [5.3.1.3. Program Transfer Settings](https://docs.bivrost.cn/gateway/usage/machines#add-machine) to modify the root directory path; if it has not been modified, see [Default Root Directory Paths by System Model](#default-root-paths) for the default root directory path. If dirAtCNC and subDir are both supplied, subDir is ignored. |

Response example

```json
{
  "errorCode": 0,
  "errorMsg": "Success"
}
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| errorCode | Int32 | (Required) Error code, 0 indicates success. |
| errorMsg | String | (Required) Error message |

The system models currently supporting the deletion of machine directories are the same as those listed in [System Model Support for the Create/Delete Machine Directory Interfaces](#dir-support).

## 2.6.13. backupFiles — Back Up Machine Files {#backupfiles}

This interface packages the files specified in the request body, or all files within a directory (including subfolders and the files within them), into a single ZIP file and returns it via Stream. The top-level directory name in the ZIP file follows the format "BackupFiles_backup date and time"; the second-level directories are the root directories for each machine, named in the format "machineID_machineName"; under each machine's root directory are the specified files and directories for that machine, preserving the original folder structure.

```http
POST /api/cnc/backupFiles
```

Request body example application/json

```json
[
  { "machineID": "1010", "fileName": "O8000" },
  { "machineID": "1011", "DirAtCNC": "dir1", "includeSubDir": false },
  { "machineID": "1012", "fileName": "sample.NC", "SubDir": "Dir/Prog" }
]
```

| Request Parameter | Type | Description |
| --- | --- | --- |
| machineID | String | (Required) Target machine identifier, see [1.1.1. machineID Machine Identifier](/en/conventions/identifiers/#machineid) |
| fileName | String | (Required) File name of the target file, refer to the file name returned by [2.6.1. readProgramList — Read Machine File List](#readprogramlist) or [2.6.15. readAllPrograms — Browse All Files](#readallprograms). For some system models, such as Gsk and Siemens, the file name must include the file extension. If fileName is not supplied, all files under the directory specified by dirAtCNC or subDir will be backed up. |
| dirAtCNC | String | Specifies the target directory path. If this parameter is not supplied, the default root directory path is used. See [Default Root Directory Paths by System Model](#default-root-paths) for each system model's default root directory path. |
| subDir | String | Specifies the target subdirectory path. If dirAtCNC is not provided, the root directory path and subdirectory path are automatically concatenated to form dirAtCNC. Users can refer to the Bivrost Gateway Manual [5.3.1.3. Program Transfer Settings](https://docs.bivrost.cn/gateway/usage/machines#add-machine) to modify the root directory path; if it has not been modified, see [Default Root Directory Paths by System Model](#default-root-paths) for the default root directory path. If dirAtCNC and subDir are both supplied, subDir is ignored. |
| includeSubDir | Bool | When fileName is not supplied, i.e. when downloading all files under the specified directory, if this value is true, all files under all subfolders of the directory are also downloaded. Defaults to true. |

Response body example application/octet-stream

```text
PK gx BackupFiles_2024.03.07.12.04.46…
```

The response body is the ZIP file returned via Stream.

If any request in the request body fails during execution, the task is terminated and the error information for that request is returned, for example:

```json
{
  "errorCode": 10003,
  "errorMsg": "Machine ID does not exist.",
  "statusMsg": "Invalid MachineID (1011)"
}
```

## 2.6.14. selectProgram — Select Program {#selectprogram}

This interface selects the specified program as the main program on the machine.

```http
GET /api/cnc/selectProgram?machineID=MACHINEID&fileName=FILENAME&dirAtCNC=DIRATCNC&subDir=SUBDIR
```

| Request Parameter | Type | Description |
| --- | --- | --- |
| machineID | String | (Required) Target machine identifier, see [1.1.1. machineID Machine Identifier](/en/conventions/identifiers/#machineid) |
| fileName | String | (Required) File name of the target file, refer to the file name returned by [2.6.1. readProgramList — Read Machine File List](#readprogramlist) or [2.6.15. readAllPrograms — Browse All Files](#readallprograms). For some system models, such as Gsk and Siemens, the file name must include the file extension. |
| dirAtCNC | String | Specifies the target directory path. If this parameter is not supplied, the default root directory path is used. See [Default Root Directory Paths by System Model](#default-root-paths) for each system model's default root directory path. |
| subDir | String | Specifies the target subdirectory path. If dirAtCNC is not provided, the root directory path and subdirectory path are automatically concatenated to form dirAtCNC. Users can refer to the Bivrost Gateway Manual [5.3.1.3. Program Transfer Settings](https://docs.bivrost.cn/gateway/usage/machines#add-machine) to modify the root directory path; if it has not been modified, see [Default Root Directory Paths by System Model](#default-root-paths) for the default root directory path. If dirAtCNC and subDir are both supplied, subDir is ignored. |
| mode | String | Execution mode. Okuma only: for machining centers, "A" (A run), "B" (B run), "S" (S run) are supported; for lathes, "L" (the L spindle of dual spindles) and "R" (single spindle, or the R spindle of dual spindles) are supported. |

Response example

```json
{
  "errorCode": 0,
  "errorMsg": "Success"
}
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| errorCode | Int32 | (Required) Error code, 0 indicates success. |
| errorMsg | String | (Required) Error message |

Devices currently supported by this interface:

| System [Model] | Notes |
| --- | --- |
| Brother [all models] | Must be in automatic run mode or background edit mode; no program may currently be running. |
| Fanuc [0i-D, 0i-F, 30i, 31i, 32i, 35i, Power Motion i-A] | Must be in Auto or Edit mode. |
| Gsk [980, 988] | Supported on some versions. |
| Mock machine | Always returns SUCCESS, but does not change the current program. |
| Okuma [all models] | The mode execution mode parameter must be supplied. |
| Syntec | |

## 2.6.15. readAllPrograms — Browse All Files {#readallprograms}

This interface searches all program files under the specified directory on the machine and returns the file names along with their directory paths.

```http
GET /api/cnc/readAllPrograms?machineID=MACHINEID&dirAtCNC=DIRATCNC&subDir=SUBDIR
```

| Request Parameter | Type | Description |
| --- | --- | --- |
| machineID | String | (Required) Target machine identifier, see [1.1.1. machineID Machine Identifier](/en/conventions/identifiers/#machineid) |
| dirAtCNC | String | Specifies the target directory path. If this parameter is not supplied, the default root directory path is used. See [Default Root Directory Paths by System Model](#default-root-paths) for each system model's default root directory path. |
| subDir | String | Specifies the target subdirectory path. If dirAtCNC is not provided, the root directory path and subdirectory path are automatically concatenated to form dirAtCNC. Users can refer to the Bivrost Gateway Manual [5.3.1.3. Program Transfer Settings](https://docs.bivrost.cn/gateway/usage/machines#add-machine) to modify the root directory path; if it has not been modified, see [Default Root Directory Paths by System Model](#default-root-paths) for the default root directory path. If dirAtCNC and subDir are both supplied, subDir is ignored. |

Response example

```json
{
  "programs": [
    {
      "dirAtCNC": "/",
      "fileName": "SAMPLE"
    },
    {
      "dirAtCNC": "1",
      "fileName": "sample1.nc"
    },
    {
      "dirAtCNC": "1/1",
      "fileName": "sample2.nc"
    }
  ]
}
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| programs | Object[] | (Required) Array of program file objects. |
| fileName | String | Program file name. For some system models, such as Gsk and Siemens, the file name includes the file extension. |
| dirAtCNC | String | Directory path of the program file. |

## 2.6.16. searchFile — Search Machine Files {#searchfile}

This interface searches for the specified file name under the specified machine directory (including subdirectories), and returns the path of the directory containing the file, along with all files (including the matched file) and subdirectories in that directory.

```http
GET /api/cnc/searchFile?machineID=MACHINEID&fileName=FILENAME&dirAtCNC=DIRATCNC&subDir=SUBDIR
```

| Request Parameter | Type | Description |
| --- | --- | --- |
| machineID | String | (Required) Target machine identifier, see [1.1.1. machineID Machine Identifier](/en/conventions/identifiers/#machineid) |
| fileName | String | (Required) Target file name, refer to the file name returned by [2.6.1. readProgramList — Read Machine File List](#readprogramlist) or [2.6.15. readAllPrograms — Browse All Files](#readallprograms). For some system models, such as Gsk and Siemens, the file name must include the file extension. |
| dirAtCNC | String | Specifies the target directory path. If this parameter is not supplied, the default root directory path is used. See [Default Root Directory Paths by System Model](#default-root-paths) for each system model's default root directory path. |
| subDir | String | Specifies the target subdirectory path. If dirAtCNC is not provided, the root directory path and subdirectory path are automatically concatenated to form dirAtCNC. Users can refer to the Bivrost Gateway Manual [5.3.1.3. Program Transfer Settings](https://docs.bivrost.cn/gateway/usage/machines#add-machine) to modify the root directory path; if it has not been modified, see [Default Root Directory Paths by System Model](#default-root-paths) for the default root directory path. If dirAtCNC and subDir are both supplied, subDir is ignored. |

Response example

```json
{
  "dirAtCNC": "Dir/Prog",
  "programs": [
    "1111",
    "2322",
    "3222"
  ],
  "subDirs": [
    "dir1",
    "dir2"
  ]
}
```

| Response Parameter | Type | Description |
| --- | --- | --- |
| dirAtCNC | String | Directory path containing the target file. |
| programs | String[] | List of programs (files) in the directory containing the target file |
| subDirs | String[] | List of subfolders in the directory containing the target file |
