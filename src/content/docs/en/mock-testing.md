---
title: "6. Mock Machine Testing"
sidebar:
  label: "6. Mock Machine Testing"
---


If you need to quickly test the communication protocol without an actual machine tool connected, you can add a mock machine in the **Machine Configuration** section of the gateway management page, setting its local IP to 127.0.0.X. Its machine ID and slave ID default to X, where X can be set from 1 to 255 (see the Bivrost Gateway Manual [5.3. Machine Configuration](https://docs.bivrost.cn/gateway/usage/machines)). Activate the machine and enable its auto-collection option. Restart the service on the home page, and you can then test the HTTP protocol. To test additional communication protocols, enable the corresponding communication method and configure its parameters in the **Communication Configuration** section of the gateway management page, then restart the service on the home page to test it. In actual use, please delete the mock machine to avoid slave ID conflicts.
