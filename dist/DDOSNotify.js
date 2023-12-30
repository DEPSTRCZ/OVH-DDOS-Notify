"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = __importDefault(require("@ovh-api/api"));
const ip_1 = __importDefault(require("@ovh-api/ip"));
const conf_json_1 = require("./conf.json");
const express_1 = __importDefault(require("express"));
const ovhEngine = new api_1.default({
    appKey: conf_json_1.ovh.appKey,
    appSecret: conf_json_1.ovh.appSecret,
    consumerKey: conf_json_1.ovh.consumerKey
});
const api = {
    ip: (0, ip_1.default)(ovhEngine),
};
let State = false;
async function SendAlert(Type) {
    let ChosenEmbed = Type ? 0 : 1;
    State = Type;
    conf_json_1.embeds[ChosenEmbed].fields[0].value = `<t:${Math.floor(new Date().getTime() / 1000)}:R>`;
    console.log("Sending alert", (Type) ? "Attack has started" : "Attack has Ended", new Date().toLocaleString());
    await fetch(conf_json_1.general.WebhookURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            content: (conf_json_1.general.ping.length === 0) ? null : conf_json_1.general.ping, embeds: [conf_json_1.embeds[ChosenEmbed]]
        })
    });
}
async function ExternalAlert() {
    conf_json_1.embeds[2].fields[0].value = `<t:${Math.floor(new Date().getTime() / 1000)}:R>`;
    await fetch(conf_json_1.general.WebhookURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            content: (conf_json_1.general.ping.length === 0) ? null : conf_json_1.general.ping, embeds: [conf_json_1.embeds[2]]
        })
    });
}
async function QueryOvhAPI() {
    try {
        const data = await api.ip.$("51.77.68.20/32").mitigation.$("51.77.68.10").$get();
        switch (data.state) {
            case "creationPending":
                if (!State)
                    SendAlert(true);
                break;
            case "ok":
                if (!State)
                    SendAlert(true);
                break;
            case "removalPending":
                if (State)
                    SendAlert(false);
                break;
        }
    }
    catch (error) {
        if (State) {
            SendAlert(false);
        }
        ;
    }
}
console.log("Started OVH API Monitor");
setInterval(async () => {
    await QueryOvhAPI();
}, conf_json_1.general.interval * 1000);
if (conf_json_1.externalPost.enabled) {
    const app = (0, express_1.default)();
    app.listen(conf_json_1.externalPost.port, () => console.log(`Started ExternalPost Listener @ http://<IP>:${conf_json_1.externalPost.port}/external`));
    app.post('/external', async (req, res) => {
        try {
            const authToken = req.headers.authorization?.split(' ')[1];
            if (!authToken)
                res.status(401).send('Unauthorized');
            if (authToken === conf_json_1.externalPost.token) {
                res.status(200).send('OK');
                await ExternalAlert();
            }
            else {
                res.status(401).send('Unauthorized');
            }
        }
        catch (error) {
            console.log(error);
            res.status(500).send('Internal Server Error');
        }
        ;
    });
}
//# sourceMappingURL=DDOSNotify.js.map