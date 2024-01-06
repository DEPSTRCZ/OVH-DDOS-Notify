# OVH DDOS Notifications

> A simple app that notifies you when your Server/IP is under mitigation. Also supports receiving alerts from a POST request.

## Installing and Running

1. Download the latest version from Releases
2. Extract
3. Download requirements (NodeJS)
4. Download all needed packages `npm i`
5. Run the app `node ./DDOSNotify.js`

## Config
| Section            | Key               | Description                                                                                                      |
|--------------------|-------------------|------------------------------------------------------------------------------------------------------------------|
| **OVH**            | `appKey`          | Application key for OVH API authentication.                                                                      |
|                    | `ip`              | Your OVH IP (Example: 51.75.64.15)
|                    | `ipBlock`         | Your OVH Ip block with that ip. If you have only one IP (51.75.64.15/32)
|                    | `appSecret`       | Application secret for OVH API authentication.                                                                   |
|                    | `consumerKey`     | Consumer key for OVH API authentication.                                                                         |
| **General**        | `WebhookURL`      | Discord Webhook URL                                                                                              |
|                    | `interval`        | Time interval in seconds to query the OVH API                                                                    |
|                    | `ping`            | Here is the bare discord content. You can put anything you want here. For example, ping a role `<@&ID_OF_THE_ROLE>` |
| **ExternalPost**   | `enabled`         | A boolean indicating whether external posting is enabled or not.                                                 |
|                    | `port`            | Port number for the external posting service.                                                                    |
|                    | `token`           | Token for authentication with the external posting service.                                                      |
| **Embeds**         | -                 | An array of Discord embed objects.  See Embed section                                                            |

### Section OVH
OVH API credentials. Get yours at this URL https://www.ovh.com/auth/api/createToken?GET=/me

### Section General
You can learn how to create your own here: https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks.

### Embeds
In the config sample, you will find how they are supposed to look. It is an Array/List of Discord embed objects (More here: https://discordjs.guide/popular-topics/embeds.html#using-an-embed-object).
The embed position matters. Position [0] is when an attack has been detected. Position [1] is when an attack ended. Position [2] is for the ExternalPost endpoint. When a request to that endpoint has been successful, the embed at this position will get sent.

#### Embeds - Date/Time
When customizing your embed, keep in mind that the first field in the embed is reserved for the Discord Timestamp and will get overwritten if anything else is there. Feel free to customize any other field.
```          "fields": [
            {
                "name": "Date",
                "value": ""
            }
```

### ExternalEndpoint
This is a functionality that will send a Webhook notification if enabled. If so, the http://<IP>:${externalPost.port}/external will get active. If a POST request to this URL is sent with the correct authorization header, a notification will get sent.

> 🚧 Be aware this might be insecure if wrongly used. For security, put this under an Https proxy or use it only locally.

--- 
# Contribution
Like this? Or want to make improvements? Simply clone this and do what you need. Then submit a PR.

## Running & Compiling
- Requires NodeJS 
- Download packages `npm i`
- Run the TS file `npm run dev`
- Done? Compile it and use it in production via `npm run build`