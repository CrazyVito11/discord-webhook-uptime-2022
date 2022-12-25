import axios from 'axios';

export function sendDomainGoneOfflineNotification(domain, error) {
    const roleMention = domain.roleIdToMention ? `<@&${domain.roleIdToMention}> ` : null;

    axios.post(domain.discordWebhookUrl, {
        content: roleMention,
        embeds: [
            {
                "type": "rich",
                "title": `Domain \"${domain.name}\" is DOWN!`,
                "description": `The following URL returned "${error.code}" when we tried to access it!`,
                "color": 0xff0000,
                "fields": [
                    {
                        "name": `URL`,
                        "value": domain.url
                    },
                    {
                        "name": `Down since`,
                        "value": domain.unavailableStartTimestamp
                    }
                ]
            }
        ]
    })
         .catch(() => {
             console.error(`Unable to trigger the webhook for ${domain.name}`);
         });
}

export function sendDomainBackOnlineNotification(domain) {
    const roleMention         = domain.roleIdToMention ? `<@&${domain.roleIdToMention}> ` : null;
    const difference          = Math.abs(new Date() - domain.unavailableStartTimestamp);
    const differenceInMinutes = ((difference / 1000) / 60).toFixed(1);

    axios.post(domain.discordWebhookUrl, {
        content: roleMention,
        embeds: [
            {
                "type": "rich",
                "title": `Domain \"${domain.name}\" is back up!`,
                "description": `The following URL has gone back up and should be accessable again.`,
                "color": 0x00ff00,
                "fields": [
                    {
                        "name": `URL`,
                        "value": domain.url
                    },
                    {
                        "name": `Down for`,
                        "value": `${differenceInMinutes} minute(s)`
                    }
                ]
            }
        ]
    })
         .catch(() => {
             console.error(`Unable to trigger the webhook for ${domain.name}`);
         });
}
