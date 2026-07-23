---
title: "2.9.4. Group Configuration API"
sidebar:
  label: "2.9.4. Group Configuration"
---


The group configuration API is used to retrieve, add, modify, or delete group configurations. For details on group configuration, see the Bivrost Gateway Manual [5.4. Group Configuration](https://docs.bivrost.cn/gateway/usage/groups). All configuration parameters for a group are listed in the table below; these parameters are used as request parameters or response parameters in the group configuration API.

## Group configuration parameters {#group-params}

| Parameter | Type | Description |
| --- | --- | --- |
| id | Int32 | Group database identifier, see [1.1.4. ID Database Identifier](/en/conventions/identifiers/#db-id) |
| number | Int32 | Machine number, valid range 1-8 |
| useDefaultGroupID | Bool | Use the default group ID |
| groupID | String | Group identifier, see [1.1.2. groupID Group Identifier](/en/conventions/identifiers/#groupid) |
| name | String | Machine name |
| isActive | Bool | Active status, true = active, false = inactive |
| machines | Object[] | Information about the machines included in the group, see [machines Machine List Information](#group-machines-info). |
| enableExternalMachines | Bool | Enable external machines |
| externalMachines | String | External machine command |
| taskCount | Bool | Group production count task, true = enabled, false = disabled. |
| taskOEE | Bool | Group OEE monitoring task, true = enabled, false = disabled. |
| taskCumulativeStatusTime | Bool | Group cumulative status time task, true = enabled, false = disabled. |

## machines Machine list information {#group-machines-info}

machines is the list of machines included in the group, with the parameters shown in the table below. Note that except for id, machineID, and the countMultiplier production coefficient, all other parameters are read-only. Users modify the machines included in a group by adding or removing an id or machineID in the list. After modifying a machine's configuration via the machine configuration API, the corresponding machine information in the group's machine list is updated accordingly.

| Parameter | Type | Description |
| --- | --- | --- |
| id | Int32 | Machine database identifier, see [1.1.4. ID Database Identifier](/en/conventions/identifiers/#db-id). Add or remove an id in the list to add the specified machine to the group or remove it from the group. |
| machineType | String | Machine type, see [machineType Corresponding Machine Types](/en/http/config-machines/#machine-type). |
| system | String | System, same as the system option in the Add Machine dialog under the English UI language |
| model | String | Model, same as the model option in the Add Machine dialog under the English UI language |
| name | String | Machine name |
| machineID | String | Machine identifier, see [1.1.1. machineID Machine Identifier](/en/conventions/identifiers/#machineid). Add or remove a machineID in the list to add the specified machine to the group or remove it from the group. If both ID and machineID are supplied, machineID is ignored. |
| slaveID | Int32 | Slave identifier, see [1.1.3. slaveID Slave Identifier](/en/conventions/identifiers/#slaveid) |
| ip | String | IP address |
| port | Int32 | Port number, 0 indicates the default port for the given device. |
| isActive | Bool | Active status, true = active, false = inactive |
| countMultiplier | Int32 | Production coefficient |

## 2.9.4.1. group Get group configuration {#group}

```http
GET /api/config/group?ID=ID&groupID=GROUPID
```

| Request Parameter | Type | Description |
| --- | --- | --- |
| id | Int32 | Database identifier, see [1.1.4. ID Database Identifier](/en/conventions/identifiers/#db-id) |
| groupID | String | Target group identifier, see [1.1.2. groupID Group Identifier](/en/conventions/identifiers/#groupid). If both ID and groupID are supplied, groupID is ignored. |

Response example

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

For response parameters, see [Group Configuration Parameters](#group-params).

## 2.9.4.2. groups Get all group configurations {#groups}

This API has no request parameters.

```http
GET /api/config/groups
```

Response example

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

For response parameters, see [Group Configuration Parameters](#group-params).

## 2.9.4.3. create-group Add group configuration {#create-group}

```http
POST /api/config/create-group
```

Request body example

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

For request parameters, see [Group Configuration Parameters](#group-params). Note that the database identifier id does not need to be set in the request body; it is automatically assigned by the gateway and appears in the response body after successful creation.

Response example

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

For response parameters, see [Group Configuration Parameters](#group-params).

## 2.9.4.4. update-group Modify group configuration {#update-group}

Modifies the configuration information of the specified group and returns the updated group configuration information.

```http
POST /api/config/update-group
```

Request body example

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

For request parameters, see [Group Configuration Parameters](#group-params). Note: this API uses id as the unique identifier, and the database identifier id must be set in the request body. The group identifier groupID can be modified through this API.

Response example

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

For response parameters, see [Group Configuration Parameters](#group-params).

## 2.9.4.5. delete-group Delete group configuration {#delete-group}

```http
GET /api/config/delete-group?ID=ID&groupID=GROUPID
```

| Request Parameter | Type | Description |
| --- | --- | --- |
| ID | Int32 | Database identifier, see [1.1.4. ID Database Identifier](/en/conventions/identifiers/#db-id) |
| groupID | String | Target group identifier, see [1.1.2. groupID Group Identifier](/en/conventions/identifiers/#groupid). If both ID and groupID are supplied, groupID is ignored. |

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

## 2.9.4.6. batch-delete-groups Batch delete group configurations {#batch-delete-groups}

This API is the batch version of [2.9.4.5. delete-group Delete Group Configuration](#delete-group); by supplying database IDs in the request body, multiple groups can be deleted at once.

```http
POST /api/config/batch-delete-groups
```

Request body example application/json

```json
{
  "ids": [
    2,
    3,
    4
  ]
}
```

| Request Parameter | Type | Description |
| --- | --- | --- |
| ids | Int32[] | (Required) Database identifiers, see [1.1.4. ID Database Identifier](/en/conventions/identifiers/#db-id) |

Response example

```json
{
  "deleted": 3
}
```

The response body contains the execution results corresponding, in order, to the requests in the request body.

| Response Parameter | Type | Description |
| --- | --- | --- |
| deleted | Int32 | (Required) Number of groups deleted |
