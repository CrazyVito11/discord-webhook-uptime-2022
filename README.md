# discord-webhook-uptime-2022
Triggers a Discord webhook if a certain URL has gone down

## Example service
**discord-webhook-uptime-2022.service**
```
[Unit]
After=network-online.target
Wants=network-online.target systemd-networkd-wait-online.service
Description="Service to launch the discord-webhook-uptime application to monitor specific URLs"

StartLimitIntervalSec=300
StartLimitBurst=5


[Service]
WorkingDirectory=/home/pi/projects/discord-webhook-uptime-2022/
ExecStartPre=/bin/bash -c 'until host discord.com; do sleep 1; done; sleep 10'
ExecStart=/home/pi/projects/discord-webhook-uptime-2022/start_service.sh
Restart=on-failure
RestartSec=10s

[Install]
WantedBy=default.target
```

**start_service.sh**
```shell
#!/bin/bash
echo "Changing node version with NVM..."
. /home/pi/.nvm/nvm.sh;
nvm use
echo "Starting script..."
node main.js
```