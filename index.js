const ApcAccess = require('apcaccess');
const axios = require('axios');

const devices = require("./devices.json");
const emonCMS = require("./emonCMS.json");
let checkInterval;
const clients = [];

const interval = async (clientIndex) => {
    if(!doesClientExist(clientIndex)){
        createClient();
    }

    try {
        await connectToClient(clientIndex);

        const jsonStatus = await getJsonStatus(clientIndex);

        const calculatedWattage = calculateCurrentWattage(clientIndex, jsonStatus);

        await sendToEmonCMS(clientIndex, calculatedWattage);

        await disconnectFromClient(clientIndex);
    } catch (e) {
        await disconnectFromClient(clientIndex);
        console.error(e);
    }

}

const checkConfigs = () => {
    //TODO
    return true;
}

const createClient = () => {
    const client =  new ApcAccess();
    clients.push(client);
}

const doesClientExist = (clientIndex) => {
    return !!clients[clientIndex]
}

const connectToClient = async (clientIndex) => {
    return clients[clientIndex].connect(devices[clientIndex].ip, devices[clientIndex].port);
}

const getJsonStatus = async (clientIndex) => {
    return clients[clientIndex].getStatusJson()
}

const disconnectFromClient = async (clientIndex) => {
    return clients[clientIndex].disconnect();
}

const calculateCurrentWattage = (clientIndex, {LOADPCT = 0}) => {
    const { MAX_WATT } = devices[clientIndex];

    if(!MAX_WATT){
        console.error("Can't calculate power, no max watt provided in device config")
        return;
    }

    const cleanLOADPCT = LOADPCT.replace("Percent", "");
    const load_pct = parseFloat(cleanLOADPCT)

    return MAX_WATT * 0.01 * load_pct
}

const sendToEmonCMS = async (clientIndex, wattage) => {
    const { name } = devices[clientIndex]

    const node_name = name.replace(" ", "_").toLowerCase();

    const data = JSON.stringify({
        power: wattage
    })

    const emonURL = `${emonCMS.emoncms_url}/input/post?node=${node_name}&fulljson=${data}&apikey=${emonCMS.apikey}`
    console.log("Sending", {node_name, data})
    try{
        await axios.get(emonURL);
        console.log("Sent Data", data)
    }catch(e){
        console.error("Error with data!", e.toString())
    }

}

//Set interval every 10s
checkInterval = setInterval(async function() {
    for(const [index] of devices.entries()){
        await interval(index)
    }
}, emonCMS.collection_interval);

checkConfigs();