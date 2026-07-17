---
title: "2.9.4. 机组配置接口"
sidebar:
  label: "2.9.4. 机组配置"
---


机组配置接口用于获取、新增、修改，或删除机组配置。机组配置相关说明可以参考《说明书》[5.4. 机组配置](https://docs.bivrost.cn/usage/groups)。机组的所有配置参数如下表，这些参数在机组配置接口中作为请求参数或返回参数。

## 机组配置参数 {#group-params}

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| id | Int32 | 机组数据库标识，详见 [1.1.4. ID 数据库标识](/conventions/identifiers/#db-id) |
| number | Int32 | 机台，有效范围 1~8 |
| useDefaultGroupID | Bool | 使用默认机组标识 |
| groupID | String | 机组标识，详见 [1.1.2. groupID 机组标识](/conventions/identifiers/#groupid) |
| name | String | 机台名 |
| isActive | Bool | 激活状态，true=激活，false=未激活 |
| machines | Object[] | 机组包含的机台信息，详见 [machines 机台列表信息](#group-machines-info)。 |
| enableExternalMachines | Bool | 启用外部机台 |
| externalMachines | String | 外部机台命令 |
| taskCount | Bool | 机组加工计数任务，true=开启，false=关闭。 |
| taskOEE | Bool | 机组 OEE 监控任务，true=开启，false=关闭。 |
| taskCumulativeStatusTime | Bool | 机组累计状态时间任务，true=开启，false=关闭。 |

## machines 机台列表信息 {#group-machines-info}

machines 是机组包含的机台列表，参数如下表所示，注意除了 id, machineID, 和 countMultiplier 产量系数以外，其它参数均为只读参数。用户通过在列表中添加、移除 id 或 machineID 的方式修改机组包含的机台。使用机台配置接口修改机台配置后，机组的机台列表中相应机台信息会同步更新。

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| id | Int32 | 机台数据库标识，详见 [1.1.4. ID 数据库标识](/conventions/identifiers/#db-id)。在列表中添加或移除 id 以添加指定机台到机组或从机组移除。 |
| machineType | String | 机台类型，见[machineType 对应机台类型](/http/config-machines/#machine-type)。 |
| system | String | 系统，同英文语言下添加机台窗口中的系统选项 |
| model | String | 型号，同英文语言下添加机台窗口中的型号选项 |
| name | String | 机台名 |
| machineID | String | 机台标识，详见 [1.1.1. machineID 机台标识](/conventions/identifiers/#machineid)。在列表中添加或移除 machineID 以添加指定机台到机组或从机组移除。如 ID 与 machineID 同时输入，machineID 被忽略。 |
| slaveID | Int32 | 从站标识，详见 [1.1.3. slaveID 从站标识](/conventions/identifiers/#slaveid) |
| ip | String | IP 地址 |
| port | Int32 | 端口号，0 代表各设备的默认端口。 |
| isActive | Bool | 激活状态，true=激活，false=未激活 |
| countMultiplier | Int32 | 产量系数 |

## 2.9.4.1. group 获取机组配置 {#group}

```http
GET /api/config/group?ID=ID&groupID=GROUPID
```

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| id | Int32 | 数据库标识，详见 [1.1.4. ID 数据库标识](/conventions/identifiers/#db-id) |
| groupID | String | 目标机组标识，详见 [1.1.2. groupID 机组标识](/conventions/identifiers/#groupid)。如 ID 与 groupID 同时输入，groupID 被忽略。 |

返回示例

```json
{
  "id": 1,
  "number": 1,
  "useDefaultGroupID": true,
  "groupID": "g1",
  "name": "g1",
  "isActive": true,
  "machines": [
    {
      "id": 4,
      "machineType": "CNC",
      "system": "Mock",
      "model": "General",
      "name": "演示 1",
      "machineID": "1",
      "slaveID": 1,
      "ip": "127.0.0.1",
      "port": 0,
      "isActive": true,
      "countMultiplier": 1
    },
    {
      "id": 5,
      "machineType": "CNC",
      "system": "Mock",
      "model": "General",
      "name": "演示 2",
      "machineID": "2",
      "slaveID": 2,
      "ip": "127.0.0.2",
      "port": 0,
      "isActive": true,
      "countMultiplier": 0
    }
  ],
  "enableExternalMachines": false,
  "taskCount": true,
  "taskOEE": true,
  "taskCumulativeStatusTime": true
}
```

返回参数见[机组配置参数](#group-params)。

## 2.9.4.2. groups 获取所有机组配置 {#groups}

此接口无请求参数。

```http
GET /api/config/groups
```

返回示例

```json
[
  {
    "id": 1,
    "number": 1,
    "useDefaultGroupID": true,
    "groupID": "g1",
    "name": "g1",
    "isActive": true,
    "machines": [
      {
        "id": 4,
        "machineType": "CNC",
        "system": "Mock",
        "model": "General",
        "name": "演示 1",
        "machineID": "1",
        "slaveID": 1,
        "ip": "127.0.0.1",
        "port": 0,
        "isActive": true,
        "countMultiplier": 0
      },
      {
        "id": 5,
        "machineType": "CNC",
        "system": "Mock",
        "model": "General",
        "name": "演示 2",
        "machineID": "2",
        "slaveID": 2,
        "ip": "127.0.0.2",
        "port": 0,
        "isActive": true,
        "countMultiplier": 0
      }
    ],
    "enableExternalMachines": false,
    "taskCount": true,
    "taskOEE": true,
    "taskCumulativeStatusTime": true
  },
  {
    "id": 3,
    "number": 7,
    "useDefaultGroupID": false,
    "groupID": "group7",
    "name": "g7",
    "isActive": true,
    "machines": [
      {
        "id": 6,
        "machineType": "CNC",
        "system": "Mock",
        "model": "General",
        "name": "演示 3",
        "machineID": "3",
        "slaveID": 3,
        "ip": "127.0.0.3",
        "port": 0,
        "isActive": true,
        "countMultiplier": 23
      },
      {
        "id": 7,
        "machineType": "CNC",
        "system": "Mock",
        "model": "General",
        "name": "演示 4",
        "machineID": "4",
        "slaveID": 4,
        "ip": "127.0.0.4",
        "port": 0,
        "isActive": true,
        "countMultiplier": 4
      }
    ],
    "enableExternalMachines": false,
    "taskCount": true,
    "taskOEE": true,
    "taskCumulativeStatusTime": true
  }
]
```

返回参数见[机组配置参数](#group-params)。

## 2.9.4.3. create-group 添加机组配置 {#create-group}

```http
POST /api/config/create-group
```

请求体示例

```json
{
  "number": 7,
  "name": "g7",
  "useDefaultGroupID": false,
  "groupID": "group7",
  "isActive": true,
  "machines": [
    {
      "id": 6,
      "countMultiplier": 23
    },
    {
      "id": 7,
      "machineID": "4",
      "countMultiplier": 4
    }
  ],
  "enableExternalMachines": false,
  "taskCount": true,
  "taskOEE": true,
  "taskCumulativeStatusTime": true
}
```

请求参数见[机组配置参数](#group-params)。注意请求体中不用设置数据库标识 id，id 由网关自动分配，创建成功后出现在返回体中。

返回示例

```json
{
  "id": 3,
  "number": 7,
  "useDefaultGroupID": false,
  "groupID": "group7",
  "name": "g7",
  "isActive": true,
  "machines": [
    {
      "id": 6,
      "machineType": "CNC",
      "system": "Mock",
      "model": "General",
      "name": "演示 3",
      "machineID": "3",
      "slaveID": 3,
      "ip": "127.0.0.3",
      "port": 0,
      "isActive": true,
      "countMultiplier": 23
    },
    {
      "id": 7,
      "machineType": "CNC",
      "system": "Mock",
      "model": "General",
      "name": "演示 4",
      "machineID": "4",
      "slaveID": 4,
      "ip": "127.0.0.4",
      "port": 0,
      "isActive": true,
      "countMultiplier": 4
    }
  ],
  "enableExternalMachines": false,
  "taskCount": true,
  "taskOEE": true,
  "taskCumulativeStatusTime": true
}
```

返回参数见[机组配置参数](#group-params)。

## 2.9.4.4. update-group 修改机组配置 {#update-group}

修改指定机组的配置信息并返回修改后的机组配置信息。

```http
POST /api/config/update-group
```

请求体示例

```json
{
  "id": 3,
  "number": 6,
  "name": "newName",
  "useDefaultGroupID": false,
  "groupID": "newGroupID",
  "isActive": true,
  "machines": [
    {
      "id": 6,
      "countMultiplier": 1
    }
  ],
  "taskCount": false,
  "taskOEE": false,
  "taskCumulativeStatusTime": false
}
```

请求参数见[机组配置参数](#group-params)。注意：此接口使用 id 作为唯一标识，请求体中必须设置数据库标识 id。机组标识 groupID 可以通过这个接口修改。

返回示例

```json
{
  "id": 3,
  "number": 6,
  "useDefaultGroupID": false,
  "groupID": "newGroupID",
  "name": "newName",
  "isActive": true,
  "machines": [
    {
      "id": 6,
      "machineType": "CNC",
      "system": "Mock",
      "model": "General",
      "name": "演示 3",
      "machineID": "3",
      "slaveID": 3,
      "ip": "127.0.0.3",
      "port": 0,
      "isActive": true,
      "countMultiplier": 1
    }
  ],
  "enableExternalMachines": false,
  "taskCount": false,
  "taskOEE": false,
  "taskCumulativeStatusTime": false
}
```

返回参数见[机组配置参数](#group-params)。

## 2.9.4.5. delete-group 删除机组配置 {#delete-group}

```http
GET /api/config/delete-group?ID=ID&groupID=GROUPID
```

| 请求参数 | 类型 | 说明 |
| --- | --- | --- |
| ID | Int32 | 数据库标识，详见 [1.1.4. ID 数据库标识](/conventions/identifiers/#db-id) |
| groupID | String | 目标机组标识，详见 [1.1.2. groupID 机组标识](/conventions/identifiers/#groupid)。如 ID 与 groupID 同时输入，groupID 被忽略。 |

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

## 2.9.4.6. batch-delete-groups 批量删除机组配置 {#batch-delete-groups}

此接口为 [2.9.4.5. delete-group 删除机组配置](#delete-group)的批量版本，通过在请求体中补充数据库 ID，可以一次删除多个机组。

```http
POST /api/config/batch-delete-groups
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
| deleted | Int32 | (必需)删除机组数 |
