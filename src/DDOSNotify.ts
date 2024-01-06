import OvhEngine from '@ovh-api/api';
import apiIp from '@ovh-api/ip';
import { ovh, general, embeds, externalPost } from './conf.json';
import Express, {Request, Response} from 'express';

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
    let ChosenEmbed = Type ? 0 : 1; // Get the embed index from the type 0 = Start, 1 = End
    State = Type; // Set the state to the type
    embeds[ChosenEmbed].fields[0].value = `<t:${Math.floor(new Date().getTime() / 1000)}:R>`; // Set the date in the embed to now

    console.log("Sending alert",(Type) ? "Attack has started":"Attack has Ended", new Date().toLocaleString());
    
    await fetch(general.WebhookURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            content: (general.ping.length === 0) ? null: general.ping, embeds: [embeds[ChosenEmbed]]
        })
    });
}

async function ExternalAlert() {
    //Implement how ever you want.
    embeds[2].fields[0].value = `<t:${Math.floor(new Date().getTime() / 1000)}:R>`
    await fetch(general.WebhookURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            content: (general.ping.length === 0) ? null: general.ping, embeds: [embeds[2]]
        })
    });
}

async function QueryOvhAPI() {
    try {
        const data = await api.ip.$(ovh.ipBlock).mitigation.$(ovh.ip).$get();
        
        // Only work while on Auto mitigation.. The API is not well documented and i am unsure how do the responses work when the mode is pernament. Feel free to open Issue!
        switch (data.state) {
            case "creationPending": if (!State) SendAlert(true); break;
            case "ok": if (!State) SendAlert(true); break;
            case "removalPending": if (State) SendAlert(false); break;
        }
    } catch (error) {
        if (State) {
            SendAlert(false);
        };


    }

}

if (!/\//.test(ovh.ipBlock) || ovh.ip === "" || ovh.ipBlock === "" || ovh.appKey === "" || ovh.appSecret === "" || ovh.consumerKey === "" || general.WebhookURL === "") {
    throw new Error("Please fill out the config.json file! \n Or the ip or IpBlock is not valid!");
}
console.log("Started OVH API Monitor");

setInterval(async () => {
    await QueryOvhAPI();
    
}, general.interval * 1000);

if (externalPost.enabled) {
    const app = Express();
    app.listen(externalPost.port, () => console.log(`Started ExternalPost Listener @ http://<IP>:${externalPost.port}/external`));

    app.post('/external', async (req: Request, res: Response) => {
        try {
            const authToken: string | undefined = req.headers.authorization?.split(' ')[1];
        
            if (!authToken) res.status(401).send('Unauthorized');
    
            if (authToken === externalPost.token) {
                res.status(200).send('OK');
                await ExternalAlert();

            } else {
                res.status(401).send('Unauthorized');
            }
        } catch (error) {
            console.log(error);
            res.status(500).send('Internal Server Error');
        };
    });
}