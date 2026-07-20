---
title: "2.6. 文件管理接口"
sidebar:
  label: "2.6. 文件管理接口"
---


通过文件管理接口可以连接目标文件服务器，实现读取文件列表，接收、发送、删除、锁定、解锁文件，创建、删除目录等功能。

目前支持文件传输的文件服务器类型有"机台存储器"，"FTP 服务器"，"共享文件夹"等（详见《说明书》[5.3.1.3. 程序传输设置](https://docs.bivrost.cn/gateway/usage/machines#add-machine)），默认为"机台存储器"。部分机床系统可以开启本地 FTP 服务器或共享文件夹的选项以传输文件。而对于部分机台自身存储空间小，或者机台不支持直接访问其存储空间，可以通过外接文件服务器的方式，实现文件传输功能。

大部分文件管理接口都可以补充请求参数 dirAtCNC 或 subDir 以指定机台或文件服务器的目录路径，如不补充 dirAtCNC 或 subDir，则默认在根目录下执行对应文件操作。用户可以指定根目录路径（详见《说明书》[5.3.1.3. 程序传输设置](https://docs.bivrost.cn/gateway/usage/machines#add-machine)）。如用户未指定根目录路径，则使用如下默认根目录路径。

## 各系统型号默认根目录路径 {#default-root-paths}

| 文件服务器类型 | 系统［型号］ | 指定目标目录路径 | 默认根目录路径 |
| --- | --- | --- | --- |
| 机台存储器 | Brother 兄弟［TC 系列］ | X | `/` |
| 机台存储器 | Brother 兄弟［S 系列］ | O | `/` |
| 机台存储器 | Delta 台达［通用型］ | O | `B:\` |
| 机台存储器 | Fagor 法格［所有型号］ | O | `MEMORY` |
| 机台存储器 | Fanuc 发那科［0i-D，0i-F，30i，31i，32i，35i，Power Motion i-A］\* | O | `//CNC_MEM/` |
| 机台存储器 | Fanuc 发那科［除 0i-D，0i-F，30i，31i，32i，35i，Power Motion i-A 以外型号］ | X | 当前机台设定的前台目录，不固定，如`//CNC_MEM/` |
| 机台存储器 | Gsk 广数［980，988］ | O | `/user/NCPROG` |
| 机台存储器 | Haas 哈斯［通用型，MT-CONNECT］ | O | 无 |
| 机台存储器 | Heidenhain 海德汉［TNC640，TNC640 DNC］ | O | `TNC:\nc_prog` |
| 机台存储器 | Heidenhain 海德汉［iTNC530］ | O | `TNC:\` |
| 机台存储器 | Lynuc 铼纳克［所有型号］ | O | `/home/Lynuc/Users/NCFiles` |
| 机台存储器 | Mitsubishi 三菱［所有型号］\*\* | O | `PRG\USER\` |
| 机台存储器 | Mock 模拟机台 | O | `/` |
| 机台存储器 | Okuma 大隈［所有型号］ | O | `MD1` |
| 机台存储器 | Rexroth 力士乐［OPC UA］ | O | `Filesystem/prog` |
| 机台存储器 | Siemens 西门子［通用型］ | O | `/nckfs` |
| 机台存储器 | Siemens 西门子［OPC UA］ | O | `Sinumerik/FileSystem/Part Program` |
| 机台存储器 | Siemens 西门子［810D/840D］ | O | `mpf.dir` |
| 机台存储器 | 其它支持程序传输功能的系统型号 | X | 机台默认存储目录 |
| FTP 服务器 | | O | FTP 服务器根目录 |
| 共享文件夹 | | O | 无 |
| 共享文件夹(Win XP) | | O | 无 |
| 无线传输盒 | | O | `/` |
| 网关文件服务器 | | O | `/` |

O：支持；
X：不支持

\*：FANUC 发那科［0i-F，30i，31i，32i，35i，Power Motion i-A］可以修改目标目录路径为外接 CF 卡，如`//MEMCARD/`。

\*\*：Mitsubishi 三菱［M700 系列,M800 系列］可以修改目标目录路径为外接 CF 卡（M700 系列）或 SD 卡（M800 系列），如 IC1。

## 2.6.1. readProgramList 读取机台文件列表 {#readprogramlist}

```http
GET /api/cnc/readProgramList?machineID=MACHINEID&dirAtCNC=DIRATCNC&subDir=SUBDIR
```

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| machineID | String | (必需)目标机台标识，详见 [1.1.1. machineID 机台标识](/conventions/identifiers/#machineid) |
| dirAtCNC | String | 指定目标目录路径。如未补充该参数，则默认为默认根目录路径。各机台系统型号默认根目录路径见[各系统型号默认根目录路径](#default-root-paths)。 |
| subDir | String | 指定目标子目录路径。如未输入 dirAtCNC，自动将根目录路径与子目录路径拼接为 dirAtCNC。用户可以参考《说明书》[5.3.1.3. 程序传输设置](https://docs.bivrost.cn/gateway/usage/machines#add-machine)修改根目录路径，如未修改，默认根目录路径见[各系统型号默认根目录路径](#default-root-paths)。如 dirAtCNC 与 subDir 同时输入，subDir 被忽略。 |

返回示例

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

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| dirAtCNC | String | (必需)指定目录路径。一般与请求参数中的 dirAtCNC 一致，除非：1. 该设备只有一个未给出具体路径的默认目录存放文件与文件夹，这种情况下返回参数 dirAtCNC 为空；2. 未补充请求参数 dirAtCNC 或请求参数 dirAtCNC 为空，则返回参数 dirAtCNC 为默认根目录路径；3. 请求参数 dirAtCNC 指定的路径存在，但不符合系统路径格式，此时返回参数 dirAtCNC 为自动修正后的路径。 |
| programs | String[] | (必需)指定目录下的程序（文件）列表 |
| subDirs | String[] | (必需)指定目录下的子文件夹列表。部分系统型号无法获取文件夹列表，返回的 subDirs 为空。 |

### 各系统型号读取机台文件列表接口对获取子文件夹列表支持 {#subdir-support}

| 文件服务器类型 | 系统［型号］ | 获取文件列表 | 获取子文件夹列表 |
| --- | --- | --- | --- |
| 机台存储器 | Brother 兄弟［所有型号］ | O | O |
| 机台存储器 | Fagor 法格［所有型号］ | O | X |
| 机台存储器 | Fanuc 发那科［0i-D，0i-F，30i，31i，32i，35i，Power Motion i-A］ | \* | O |
| 机台存储器 | Fanuc 发那科［除 0i-D，0i-F，30i，31i，32i，35i，Power Motion i-A 以外型号］ | O | X |
| 机台存储器 | Heidenhain 海德汉［所有型号］ | O | O |
| 机台存储器 | Lynuc 铼纳克［所有型号］ | O | O |
| 机台存储器 | Mitsubishi 三菱［所有型号］ | O | X |
| 机台存储器 | Mock 模拟机台 | O | O |
| 机台存储器 | Okuma 大隈［所有型号］ | O | O |
| 机台存储器 | Rexroth 力士乐［OPC UA］ | O | O |
| 机台存储器 | Siemens 西门子［所有型号］ | O | O |
| 机台存储器 | 其它支持程序传输功能的系统型号 | O | X |
| FTP 服务器 | | O | O |
| 共享文件夹 | | O | O |
| 共享文件夹(Win XP) | | O | O |
| 无线传输盒 | | O | O |
| 网关文件服务器 | | O | O |

O：支持；　X：不支持

\*：FANUC 发那科［0i-D，0i-F，30i，31i，32i，35i，Power Motion i-A］返回标准 FANUC 程序名（字母 O+数字），自动去除数字左侧的零，如在机床中程序名为 00010，返回 O10。非标准命名程序则与机床上一致，如在机床中程序名为 SAMPLE，返回 SAMPLE。

## 2.6.2. receiveFileStream 接收机台文件(Stream 方式) {#receivefilestream}

此接口可接收文本文件和二进制文件，相比 [2.6.3. receiveFile 接收机台文件](#receivefile)，增加了对 10MB 以上大文件支持。建议用户尽量使用/receiveFileStream 接口。

```http
GET /api/cnc/receiveFileStream?machineID=MACHINEID&fileName=FILENAME&dirAtCNC=DIRATCNC&subDir=SUBDIR
```

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| machineID | String | (必需)目标机台标识，详见 [1.1.1. machineID 机台标识](/conventions/identifiers/#machineid) |
| fileName | String | (必需)目标文件的文件名，参考 [2.6.1. readProgramList 读取机台文件列表](#readprogramlist)或 [2.6.15. readAllPrograms 浏览所有文件](#readallprograms)接口返回的文件名。部分系统型号，如 Gsk 广数，Siemens 西门子等，文件名必须包括文件扩展名。 |
| dirAtCNC | String | 指定目标目录路径。如未补充该参数，则默认为默认根目录路径。各机台系统型号默认根目录路径见[各系统型号默认根目录路径](#default-root-paths)。 |
| subDir | String | 指定目标子目录路径。如未输入 dirAtCNC，自动将根目录路径与子目录路径拼接为 dirAtCNC。用户可以参考《说明书》[5.3.1.3. 程序传输设置](https://docs.bivrost.cn/gateway/usage/machines#add-machine)修改根目录路径，如未修改，默认根目录路径见[各系统型号默认根目录路径](#default-root-paths)。如 dirAtCNC 与 subDir 同时输入，subDir 被忽略。 |

返回示例

目标文件为文本文件，返回体示例 application/octet-stream

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

目标文件为二进制文件，以 binary 格式出现在返回体。

## 2.6.3. receiveFile 接收机台文件 {#receivefile}

此接口可接收文本文件和二进制文件，相比于 [2.6.2. receiveFileStream 接收机台文件(Stream 方式)](#receivefilestream)，此接口不支持 10MB 以上大文件。建议用户尽量使用/receiveFileStream 接口。

```http
GET /api/cnc/receiveFile?machineID=MACHINEID&fileName=FILENAME&dirAtCNC=DIRATCNC&subDir=SUBDIR
```

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| machineID | String | (必需)目标机台标识，详见 [1.1.1. machineID 机台标识](/conventions/identifiers/#machineid) |
| fileName | String | (必需)目标文件的文件名，参考 [2.6.1. readProgramList 读取机台文件列表](#readprogramlist)或 [2.6.15. readAllPrograms 浏览所有文件](#readallprograms)接口返回的文件名。部分系统型号，如 Gsk 广数，Siemens 西门子等，文件名必须包括文件扩展名。 |
| dirAtCNC | String | 指定目标目录路径。如未补充该参数，则默认为默认根目录路径。各机台系统型号默认根目录路径见[各系统型号默认根目录路径](#default-root-paths)。 |
| subDir | String | 指定目标子目录路径。如未输入 dirAtCNC，自动将根目录路径与子目录路径拼接为 dirAtCNC。用户可以参考《说明书》[5.3.1.3. 程序传输设置](https://docs.bivrost.cn/gateway/usage/machines#add-machine)修改根目录路径，如未修改，默认根目录路径见[各系统型号默认根目录路径](#default-root-paths)。如 dirAtCNC 与 subDir 同时输入，subDir 被忽略。 |

返回示例

当文件为文本格式时：

```json
{
  "content": "string",
  "encoding": "us-ascii"
}
```

当文件为二进制格式时：

```json
{
  "base64": "string"
}
```

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| content | String | 文件内容 |
| encoding | String | 原文件的编码 |
| base64 | String | 当文件为二进制格式时，网关将使用 Base64 编码将二进制内容转换成字符串。用户可自行解码获取二进制文件。 |

## 2.6.4. readCurrentProgram 接收机台当前运行的文件 {#readcurrentprogram}

```http
GET /api/cnc/readCurrentProgram?machineID=MACHINEID&dirAtCNC=DIRATCNC&subDir=SUBDIR
```

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| machineID | String | (必需)目标机台标识，machineID 解释见 [1.1. 基本说明](/conventions/identifiers/#machineid)。 |
| dirAtCNC | String | 指定目标目录路径。如未补充该参数，则默认为默认根目录路径。各机台系统型号默认根目录路径见[各系统型号默认根目录路径](#default-root-paths)。 |
| subDir | String | 指定目标子目录路径。如未输入 dirAtCNC，自动将根目录路径与子目录路径拼接为 dirAtCNC。用户可以参考《说明书》[5.3.1.3. 程序传输设置](https://docs.bivrost.cn/gateway/usage/machines#add-machine)修改根目录路径，如未修改，默认根目录路径见[各系统型号默认根目录路径](#default-root-paths)。如 dirAtCNC 与 subDir 同时输入，subDir 被忽略。 |

返回示例

当文件为文本格式时：

```json
{
  "dirAtCNC": "Dir/Prog",
  "fileName": "O9001",
  "content": "string",
  "encoding": "us-ascii"
}
```

当文件为二进制格式时：

```json
{
  "dirAtCNC": "Dir/Prog",
  "fileName": "Program",
  "base64": "string"
}
```

当前没有运行文件时：

```json
{
  "errorCode": 158,
  "errorMsg": "Path is not found.",
  "statusMsg": "No content."
}
```

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| dirAtCNC | String | 机台当前正在运行的文件的目录路径 |
| fileName | String | 机台当前正在运行的文件的文件名 |
| content | String | 文件内容 |
| encoding | String | 原文件的编码 |
| base64 | String | 当文件为二进制格式时，网关将使用 Base64 编码将二进制内容转换成字符串。用户可自行解码获取二进制文件。 |
| errorCode | Int32 | 错误码，0 代表成功。 |
| errorMsg | String | 错误内容 |
| statusMsg | String | 错误详情 |

## 2.6.5. sendFileStream 发送文件至机台(Stream 方式) {#sendfilestream}

此接口可发送文本文件和二进制文件，相比于 [2.6.6. sendFile 发送文件至机台](#sendfile)，增加了对 10MB 以上大文件支持。建议用户尽量使用/sendFileStream 接口。

不支持覆盖同名文件。请先删除同名文件，再发送。

```http
POST /api/cnc/sendFileStream?machineID=MACHINEID&fileName=FILENAME&dirAtCNC=DIRATCNC&subDir=SUBDIR
```

请求示例

目标文件为文本文件，请求体示例 application/octet-stream

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

目标文件为二进制文件，以 binary 格式上传到请求体。

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| machineID | String | (必需)目标机台标识，详见 [1.1.1. machineID 机台标识](/conventions/identifiers/#machineid) |
| fileName | String | 目标文件在机台上的文件名，部分系统型号，如 Gsk 广数，Siemens 西门子等，文件名必须包括文件扩展名，可以参考 [2.6.1. readProgramList 读取机台文件列表](#readprogramlist)或 [2.6.15. readAllPrograms 浏览所有文件](#readallprograms)接口返回的文件名。对于 FANUC 系统，fileName 无效，程序名为 Content 中第一个 `\n` 与第二个 `\n` 之间的内容。如 Content 为 `"%\nO3(ROUGH) \nT1M06\nG92X0.Y0.Z0. …"`，则机床上显示的程序名为 O0003，注释为（ROUGH）；如 Content 为 `"%\<SAMPLE>\nT1M06\nG92X0.Y0.Z0. …"`，则机床上显示的程序名为 SAMPLE。 |
| dirAtCNC | String | 指定目标目录路径。如未补充该参数，则默认为默认根目录路径。各机台系统型号默认根目录路径见[各系统型号默认根目录路径](#default-root-paths)。 |
| subDir | String | 指定目标子目录路径。如未输入 dirAtCNC，自动将根目录路径与子目录路径拼接为 dirAtCNC。用户可以参考《说明书》[5.3.1.3. 程序传输设置](https://docs.bivrost.cn/gateway/usage/machines#add-machine)修改根目录路径，如未修改，默认根目录路径见[各系统型号默认根目录路径](#default-root-paths)。如 dirAtCNC 与 subDir 同时输入，subDir 被忽略。 |

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

## 2.6.6. sendFile 发送文件至机台 {#sendfile}

此接口可发送文本文件和二进制文件，相比于 [2.6.5. sendFileStream 发送文件至机台(Stream 方式)](#sendfilestream)，此接口不支持 10MB 以上大文件。建议用户尽量使用/sendFileStream 接口。

不支持覆盖同名文件。请先删除同名文件，再发送。

```http
POST /api/cnc/sendFile?machineID=MACHINEID&fileName=FILENAME&dirAtCNC=DIRATCNC&subDir=SUBDIR
```

请求体示例 application/json

当文件为文本格式时：

```json
{
  "content": "string",
  "encoding": "us-ascii"
}
```

当文件为二进制格式时：

```json
{
  "base64": "string"
}
```

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| machineID | String | (必需)目标机台标识，详见 [1.1.1. machineID 机台标识](/conventions/identifiers/#machineid) |
| fileName | String | 目标文件在机台上的文件名，部分系统型号，如 Gsk 广数，Siemens 西门子等，文件名必须包括文件扩展名，可以参考 [2.6.1. readProgramList 读取机台文件列表](#readprogramlist)或 [2.6.15. readAllPrograms 浏览所有文件](#readallprograms)接口返回的文件名。对于 FANUC 系统，fileName 无效，程序名为 Content 中第一个 `\n` 与第二个 `\n` 之间的内容。如 Content 为 `"%\nO3(ROUGH) \nT1M06\nG92X0.Y0.Z0. …"`，则机床上显示的程序名为 O0003，注释为（ROUGH）；如 Content 为 `"%\<SAMPLE>\nT1M06\nG92X0.Y0.Z0. …"`，则机床上显示的程序名为 SAMPLE。 |
| dirAtCNC | String | 指定目标目录路径。如未补充该参数，则默认为默认根目录路径。各机台系统型号默认根目录路径见[各系统型号默认根目录路径](#default-root-paths)。 |
| subDir | String | 指定目标子目录路径。如未输入 dirAtCNC，自动将根目录路径与子目录路径拼接为 dirAtCNC。用户可以参考《说明书》[5.3.1.3. 程序传输设置](https://docs.bivrost.cn/gateway/usage/machines#add-machine)修改根目录路径，如未修改，默认根目录路径见[各系统型号默认根目录路径](#default-root-paths)。如 dirAtCNC 与 subDir 同时输入，subDir 被忽略。 |
| content | String | 文件内容。当文件为文本格式时，应使用此参数。当 Content 被定义时，Base64 参数将被忽略。 |
| encoding | String | 原文件的编码。如果不注明，默认使用机台配置中设定编码。 |
| base64 | String | 当文件为二进制格式时，应使用此参数。请使用 Base64 编码将二进制内容转换成字符串后写入此参数。 |

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

## 2.6.7. batchSendFile 批量发送文件至机台 {#batchsendfile}

此接口为 [2.6.6. sendFile 发送文件至机台](#sendfile)的批量版本，通过在请求体中补充目标位置，可以将同一文件以不同的文件名，同时发送至不同机台的不同位置。

不支持覆盖同名文件。请先删除同名文件，再发送。

```http
POST /api/cnc/batchSendFile
```

请求体示例 application/json

当文件为文本格式时：

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

当文件为二进制格式时：

```json
{
  "base64": "string",
  "targets": [
    { "machineID": "1011", "fileName": "sample.NC", "SubDir": "Dir/Prog" }
  ]
}
```

请求参数与 [2.6.6. sendFile 发送文件至机台](#sendfile)中的一致。

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| targets | Array | (必需)发送文件至机台的目标路径 |
| machineID | String | (必需)目标机台标识，详见 [1.1.1. machineID 机台标识](/conventions/identifiers/#machineid) |
| fileName | String | (必需)目标文件在机台上的文件名，部分系统型号，如 Gsk 广数，Siemens 西门子等，文件名必须包括文件扩展名，可以参考 [2.6.1. readProgramList 读取机台文件列表](#readprogramlist)或 [2.6.15. readAllPrograms 浏览所有文件](#readallprograms)接口返回的文件名。对于 FANUC 系统，fileName 无效，程序名为 Content 中第一个 `\n` 与第二个 `\n` 之间的内容。如 Content 为 `"%\nO3(ROUGH) \nT1M06\nG92X0.Y0.Z0. …"`，则机床上显示的程序名为 O0003，注释为（ROUGH）。 |
| dirAtCNC | String | 指定目标目录路径。如未补充该参数，则默认为默认根目录路径。各机台系统型号默认根目录路径见[各系统型号默认根目录路径](#default-root-paths)。 |
| subDir | String | 指定目标子目录路径。如未输入 dirAtCNC，自动将根目录路径与子目录路径拼接为 dirAtCNC。用户可以参考《说明书》[5.3.1.3. 程序传输设置](https://docs.bivrost.cn/gateway/usage/machines#add-machine)修改根目录路径，如未修改，默认根目录路径见[各系统型号默认根目录路径](#default-root-paths)。如 dirAtCNC 与 subDir 同时输入，subDir 被忽略。 |
| content | String | 文件内容。当文件为文本格式时，应使用此参数。当 content 被定义时，Base64 参数将被忽略。 |
| encoding | String | 原文件的编码。如果不注明，默认使用机台配置中设定编码。 |
| base64 | String | 当文件为二进制格式时，应使用此参数。请使用 Base64 编码将二进制内容转换成字符串后写入此参数。 |

返回示例

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

返回体中依次为请求体中的请求的执行结果。

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| errorCode | Int32 | (必需)错误码，0 代表成功。 |
| errorMsg | String | (必需)错误内容 |

## 2.6.8. deleteFile 删除机台文件 {#deletefile}

此接口用于删除机台上的指定文件。

```http
GET /api/cnc/deleteFile?machineID=MACHINEID&fileName=FILENAME&dirAtCNC=DIRATCNC&subDir=SUBDIR
```

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| machineID | String | (必需)目标机台标识，详见 [1.1.1. machineID 机台标识](/conventions/identifiers/#machineid) |
| fileName | String | (必需)目标文件的文件名，参考 [2.6.1. readProgramList 读取机台文件列表](#readprogramlist)或 [2.6.15. readAllPrograms 浏览所有文件](#readallprograms)接口返回的文件名。部分系统型号，如 Gsk 广数，Siemens 西门子等，文件名必须包括文件扩展名。 |
| dirAtCNC | String | 指定目标目录路径。如未补充该参数，则默认为默认根目录路径。各机台系统型号默认根目录路径见[各系统型号默认根目录路径](#default-root-paths)。 |
| subDir | String | 指定目标子目录路径。如未输入 dirAtCNC，自动将根目录路径与子目录路径拼接为 dirAtCNC。用户可以参考《说明书》[5.3.1.3. 程序传输设置](https://docs.bivrost.cn/gateway/usage/machines#add-machine)修改根目录路径，如未修改，默认根目录路径见[各系统型号默认根目录路径](#default-root-paths)。如 dirAtCNC 与 subDir 同时输入，subDir 被忽略。 |

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

## 2.6.9. batchDeleteFile 批量删除机台文件 {#batchdeletefile}

此接口为 [2.6.8. deleteFile 删除机台文件](#deletefile)的批量版本，通过在请求体中补充目标位置，可以一次删除不同机台的不同文件。

```http
POST /api/cnc/batchDeleteFile
```

请求体示例 application/json

```json
[
  { "machineID": "1010", "fileName": "O8000" },
  { "machineID": "1011", "fileName": "sample.NC", "DirAtCNC": "dir1" },
  { "machineID": "1012", "fileName": "sample.NC", "SubDir": "Dir/Prog" }
]
```

请求参数与 [2.6.8. deleteFile 删除机台文件](#deletefile)中的一致。

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| machineID | String | (必需)目标机台标识，详见 [1.1.1. machineID 机台标识](/conventions/identifiers/#machineid) |
| fileName | String | (必需)目标文件的文件名，参考 [2.6.1. readProgramList 读取机台文件列表](#readprogramlist)或 [2.6.15. readAllPrograms 浏览所有文件](#readallprograms)接口返回的文件名。部分系统型号，如 Gsk 广数，Siemens 西门子等，文件名必须包括文件扩展名。 |
| dirAtCNC | String | 指定目标目录路径。如未补充该参数，则默认为默认根目录路径。各机台系统型号默认根目录路径见[各系统型号默认根目录路径](#default-root-paths)。 |
| subDir | String | 指定目标子目录路径。如未输入 dirAtCNC，自动将根目录路径与子目录路径拼接为 dirAtCNC。用户可以参考《说明书》[5.3.1.3. 程序传输设置](https://docs.bivrost.cn/gateway/usage/machines#add-machine)修改根目录路径，如未修改，默认根目录路径见[各系统型号默认根目录路径](#default-root-paths)。如 dirAtCNC 与 subDir 同时输入，subDir 被忽略。 |

返回示例

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

返回体中依次为请求体中的请求的执行结果。

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| errorCode | Int32 | (必需)错误码，0 代表成功。 |
| errorMsg | String | (必需)错误内容 |

## 2.6.10. lockFileByRange 锁定/解锁机台程序编辑 {#lockfilebyrange}

当前仅支持 Mitsubishi 三菱，Fanuc 发那科系统程序号在 8000~8999，9000~9999，以及 8000~9999 三个区间内的编辑锁定/解锁。部分系统在锁定编辑后不可修改，但仍可以从机床端删除。

```http
GET /api/cnc/lockFileByRange?machineID=MACHINEID&isLock=ISLOCK&lockStart=LOCKSTART&lockEnd=LOCKEND
```

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| machineID | String | (必需)目标机台标识，详见 [1.1.1. machineID 机台标识](/conventions/identifiers/#machineid) |
| isLock | Bool | (必需)目标锁定状态 IsLock：true 为锁定，false 为解锁。 |
| lockStart | Int32 | (必需)锁定/解锁区间开始程序号 |
| lockEnd | Int32 | (必需)锁定/解锁区间结束程序号 |

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

## 2.6.11. createDir 创建机台目录 {#createdir}

```http
GET /api/cnc/createDir?machineID=MACHINEID&dirName=DIRNAME&dirAtCNC=DIRATCNC&subDir=SUBDIR
```

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| machineID | String | (必需)目标机台标识，详见 [1.1.1. machineID 机台标识](/conventions/identifiers/#machineid) |
| dirName | String | (必需)要创建的目录名 |
| dirAtCNC | String | 指定目标目录路径。如未补充该参数，则默认为默认根目录路径。各机台系统型号默认根目录路径见[各系统型号默认根目录路径](#default-root-paths)。 |
| subDir | String | 指定目标子目录路径。如未输入 dirAtCNC，自动将根目录路径与子目录路径拼接为 dirAtCNC。用户可以参考《说明书》[5.3.1.3. 程序传输设置](https://docs.bivrost.cn/gateway/usage/machines#add-machine)修改根目录路径，如未修改，默认根目录路径见[各系统型号默认根目录路径](#default-root-paths)。如 dirAtCNC 与 subDir 同时输入，subDir 被忽略。 |

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

当前支持创建机台目录的系统型号参考下表。

### 系统型号对创建/删除机台目录接口的支持 {#dir-support}

| 文件服务器类型 | 系统［型号］ | 创建/删除机台目录 |
| --- | --- | --- |
| 机台存储器 | Brother 兄弟［S 系列］ | O |
| 机台存储器 | Delta 台达［通用型］ | O |
| 机台存储器 | Fanuc 发那科［0i-D，0i-F，30i，31i，32i，35i，Power Motion i-A］ | O |
| 机台存储器 | GSK［所有型号］ | X |
| 机台存储器 | Haas 哈斯［通用型，MT-CONNECT］ | O |
| 机台存储器 | Heidenhain 海德汉［所有型号］ | O |
| 机台存储器 | Mitsubishi 三菱［M70/M700 L，M70/M700 M，M80/M800 L，M80/M800 M］ | \*仅限 CF 卡，SD 卡（路径：IC1） |
| 机台存储器 | Mock 模拟机台 | O |
| 机台存储器 | Okuma 大隈［所有型号］ | O |
| 机台存储器 | Rexroth 力士乐［OPC UA］ | O |
| 机台存储器 | Siemens 西门子［所有型号］ | O |
| 机台存储器 | 其它支持程序传输功能的系统型号 | X |
| FTP 服务器 | | O |
| 共享文件夹 | | O |
| 共享文件夹(Win XP) | | O |
| 无线传输盒 | | O |
| 网关文件服务器 | | O |

O：支持；
X：不支持

## 2.6.12. deleteDir 删除机台目录 {#deletedir}

目前只能删除空的目录。用户需要先删除目录下所有文件与子目录。

```http
GET /api/cnc/deleteDir?machineID=MACHINEID&dirName=DIRNAME&dirAtCNC=DIRATCNC&subDir=SUBDIR
```

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| machineID | String | (必需)目标机台标识，详见 [1.1.1. machineID 机台标识](/conventions/identifiers/#machineid) |
| dirName | String | (必需)要删除的目录名 |
| dirAtCNC | String | 指定目标目录路径。如未补充该参数，则默认为默认根目录路径。各机台系统型号默认根目录路径见[各系统型号默认根目录路径](#default-root-paths)。 |
| subDir | String | 指定目标子目录路径。如未输入 dirAtCNC，自动将根目录路径与子目录路径拼接为 dirAtCNC。用户可以参考《说明书》[5.3.1.3. 程序传输设置](https://docs.bivrost.cn/gateway/usage/machines#add-machine)修改根目录路径，如未修改，默认根目录路径见[各系统型号默认根目录路径](#default-root-paths)。如 dirAtCNC 与 subDir 同时输入，subDir 被忽略。 |

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

当前支持删除机台目录的系统型号参考[系统型号对创建/删除机台目录接口的支持](#dir-support)。

## 2.6.13. backupFiles 备份机台文件 {#backupfiles}

此接口将请求体中指定的文件，或者目录下的所有文件（包括子文件夹与子文件夹下的文件），打包成一个 ZIP 文件，以 Stream 方式返回。ZIP 文件的第一层目录名格式为"BackupFiles_备份日期时间"，第二层目录为各机台根目录，目录名格式为"machineID_machineName"，机台根目录下是各机台对应的指定文件与目录，保留原本的文件夹结构。

```http
POST /api/cnc/backupFiles
```

请求体示例 application/json

```json
[
  { "machineID": "1010", "fileName": "O8000" },
  { "machineID": "1011", "DirAtCNC": "dir1", "includeSubDir": false },
  { "machineID": "1012", "fileName": "sample.NC", "SubDir": "Dir/Prog" }
]
```

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| machineID | String | (必需)目标机台标识，详见 [1.1.1. machineID 机台标识](/conventions/identifiers/#machineid) |
| fileName | String | (必需)目标文件的文件名，参考 [2.6.1. readProgramList 读取机台文件列表](#readprogramlist)或 [2.6.15. readAllPrograms 浏览所有文件](#readallprograms)接口返回的文件名。部分系统型号，如 Gsk 广数，Siemens 西门子等，文件名必须包括文件扩展名。如果未输入 fileName，将备份 dirAtCNC 或 subDir 指定的目录下所有的文件。 |
| dirAtCNC | String | 指定目标目录路径。如未补充该参数，则默认为默认根目录路径。各机台系统型号默认根目录路径见[各系统型号默认根目录路径](#default-root-paths)。 |
| subDir | String | 指定目标子目录路径。如未输入 dirAtCNC，自动将根目录路径与子目录路径拼接为 dirAtCNC。用户可以参考《说明书》[5.3.1.3. 程序传输设置](https://docs.bivrost.cn/gateway/usage/machines#add-machine)修改根目录路径，如未修改，默认根目录路径见[各系统型号默认根目录路径](#default-root-paths)。如 dirAtCNC 与 subDir 同时输入，subDir 被忽略。 |
| includeSubDir | Bool | 未输入 fileName，即下载指定目录下所有文件时，如果此输入量为 true，则下载目录中所有子文件夹下的所有文件。默认为 true。 |

返回体示例 application/octet-stream

```text
PK gx BackupFiles_2024.03.07.12.04.46…
```

返回体中为 Stream 方式传回的 ZIP 文件。

如果请求体中任意请求执行时报错，则会终止任务，并返回该条请求的报错信息，如：

```json
{
  "errorCode": 10003,
  "errorMsg": "Machine ID does not exist.",
  "statusMsg": "Invalid MachineID (1011)"
}
```

## 2.6.14. selectProgram 选择程序 {#selectprogram}

此接口在机床上选择指定的程序为主程序。

```http
GET /api/cnc/selectProgram?machineID=MACHINEID&fileName=FILENAME&dirAtCNC=DIRATCNC&subDir=SUBDIR
```

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| machineID | String | (必需)目标机台标识，详见 [1.1.1. machineID 机台标识](/conventions/identifiers/#machineid) |
| fileName | String | (必需)目标文件的文件名，参考 [2.6.1. readProgramList 读取机台文件列表](#readprogramlist)或 [2.6.15. readAllPrograms 浏览所有文件](#readallprograms)接口返回的文件名。部分系统型号，如 Gsk 广数，Siemens 西门子等，文件名必须包括文件扩展名。 |
| dirAtCNC | String | 指定目标目录路径。如未补充该参数，则默认为默认根目录路径。各机台系统型号默认根目录路径见[各系统型号默认根目录路径](#default-root-paths)。 |
| subDir | String | 指定目标子目录路径。如未输入 dirAtCNC，自动将根目录路径与子目录路径拼接为 dirAtCNC。用户可以参考《说明书》[5.3.1.3. 程序传输设置](https://docs.bivrost.cn/gateway/usage/machines#add-machine)修改根目录路径，如未修改，默认根目录路径见[各系统型号默认根目录路径](#default-root-paths)。如 dirAtCNC 与 subDir 同时输入，subDir 被忽略。 |
| mode | String | 执行模式。仅限 Okuma 大隈，加工中心支持"A"（A 运行），"B"（B 运行），"S"（S 运行）；车床支持"L"（双主轴中的 L 主轴），"R"（单主轴，或双主轴中的 R 主轴）。 |

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

目前接口支持的设备：

| 系统［型号］ | 备注 |
| --- | --- |
| Brother 兄弟［所有型号］ | 必须在自动运行模式或运行中编辑模式下；必须未运行程序。 |
| Fanuc 发那科［0i-D，0i-F，30i，31i，32i，35i，Power Motion i-A］ | 必须在 Auto 或 Edit 模式下。 |
| Gsk 广州数控［980，988］ | 部分版本支持。 |
| Mock 模拟机台 | 总是返回 SUCCESS，但不会改变当前程序。 |
| Okuma 大隈［所有型号］ | 必需补充参数 mode 执行模式。 |
| Syntec 新代 | |

## 2.6.15. readAllPrograms 浏览所有文件 {#readallprograms}

此接口搜索机床指定目录下所有程序文件，返回文件名称和其所在目录路径。

```http
GET /api/cnc/readAllPrograms?machineID=MACHINEID&dirAtCNC=DIRATCNC&subDir=SUBDIR
```

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| machineID | String | (必需)目标机台标识，详见 [1.1.1. machineID 机台标识](/conventions/identifiers/#machineid) |
| dirAtCNC | String | 指定目标目录路径。如未补充该参数，则默认为默认根目录路径。各机台系统型号默认根目录路径见[各系统型号默认根目录路径](#default-root-paths)。 |
| subDir | String | 指定目标子目录路径。如未输入 dirAtCNC，自动将根目录路径与子目录路径拼接为 dirAtCNC。用户可以参考《说明书》[5.3.1.3. 程序传输设置](https://docs.bivrost.cn/gateway/usage/machines#add-machine)修改根目录路径，如未修改，默认根目录路径见[各系统型号默认根目录路径](#default-root-paths)。如 dirAtCNC 与 subDir 同时输入，subDir 被忽略。 |

返回示例

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

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| programs | Object[] | (必需)程序文件对象数组。 |
| fileName | String | 程序文件名。部分系统型号，如 Gsk 广数，Siemens 西门子等，文件名包括文件扩展名。 |
| dirAtCNC | String | 程序文件所在目录路径。 |

## 2.6.16. searchFile 搜索机台文件 {#searchfile}

此接口在指定机台目录下（包括子目录）搜索指定文件名，返回文件所在目录的路径，目录下所有文件（包括搜索目标文件）与子目录。

```http
GET /api/cnc/searchFile?machineID=MACHINEID&fileName=FILENAME&dirAtCNC=DIRATCNC&subDir=SUBDIR
```

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| machineID | String | (必需)目标机台标识，详见 [1.1.1. machineID 机台标识](/conventions/identifiers/#machineid) |
| fileName | String | (必需)目标文件名，参考 [2.6.1. readProgramList 读取机台文件列表](#readprogramlist)或 [2.6.15. readAllPrograms 浏览所有文件](#readallprograms)接口返回的文件名。部分系统型号，如 Gsk 广数，Siemens 西门子等，文件名必须包括文件扩展名。 |
| dirAtCNC | String | 指定目标目录路径。如未补充该参数，则默认为默认根目录路径。各机台系统型号默认根目录路径见[各系统型号默认根目录路径](#default-root-paths)。 |
| subDir | String | 指定目标子目录路径。如未输入 dirAtCNC，自动将根目录路径与子目录路径拼接为 dirAtCNC。用户可以参考《说明书》[5.3.1.3. 程序传输设置](https://docs.bivrost.cn/gateway/usage/machines#add-machine)修改根目录路径，如未修改，默认根目录路径见[各系统型号默认根目录路径](#default-root-paths)。如 dirAtCNC 与 subDir 同时输入，subDir 被忽略。 |

返回示例

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

| 返回参数 | 类型 | 说明 |
| --- | --- | --- |
| dirAtCNC | String | 目标文件所在目录路径。 |
| programs | String[] | 目标文件所在目录的程序（文件）列表 |
| subDirs | String[] | 目标文件所在目录的子文件夹列表 |
