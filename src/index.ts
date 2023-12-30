import OvhEngine, { OvhError } from '@ovh-api/api';
import apiIp from '@ovh-api/ip';
import { ovh, general, embeds } from './conf.json';

const ovhEngine = new OvhEngine({
    appKey: ovh.appKey,
    appSecret: ovh.appSecret,
    consumerKey: ovh.consumerKey
});
const api = {
    ip: apiIp(ovhEngine),   
}

let State = false;


async function SendAlert(Type: boolean) {
    if (Type) {
        State = true;

        console.log("Attack started", new Date().toLocaleString());
        embeds[0].fields[0].value = `<t:${Math.floor(new Date().getTime() / 1000)}:R>`;

        fetch(general.WebhookURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content: null, embeds: [embeds[0]]
            })
        });
    } else {
        State = false;

        console.log("Attack has stopped", new Date().toLocaleString());
        embeds[1].fields[0].value = `<t:${Math.floor(new Date().getTime() / 1000)}:R>`;

        fetch(general.WebhookURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content: null, embeds: [embeds[1]]
            })
        });
    }
}

async function QueryOvhAPI() {
    try {
        const data = await api.ip.$("51.77.68.20/32").mitigation.$("51.77.68.10").$get();
        // Only work while on Auto mitigation.. The API is not well documented and i am unsure how do the responses work when the mode is pernament. Feel free to open Issue!
        switch (data.state) {
            case "creationPending": if (!State) SendAlert(true); break;
            case "ok": if (!State) SendAlert(true); break;
            case "removalPending": SendAlert(false); break;
        }
    } catch (error) {
        if (State) {
            SendAlert(false);
            State = false;
        };


    }

}
setInterval(async () => {
    await QueryOvhAPI();

}, general.interval * 1000);