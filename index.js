const ApcAccess = require('apcaccess');
const axios = require('axios');

const devices = require("./devices.json");
const emonCMS = require("./emonCMS.json");
let checkInterval = null;
const clients = [];

const interval = async (clientIndex) => {
    if(!doesClientExist(clientIndex)){
        createClient();
    }

    await connectToClient(clientIndex);

    const jsonStatus = await getJsonStatus(clientIndex);

    const calculatedWattage = calculateCurrentWattage(clientIndex, jsonStatus);
    console.log("HLLO")
    await sendToEmonCMS(clientIndex, calculatedWattage);
    console.log("SEND")
    await disconnectFromClient(clientIndex);
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
    console.log(node_name)
    const data = JSON.stringify({
        power: wattage
    })
    console.log(data)
    const emonURL = `${emonCMS.emoncms_url}/input/post?node=${node_name}&fulljson=${data}&apikey=${emonCMS.apikey}`
    console.log(emonURL)
    try{
        const request = await axios.get(emonURL);
        console.log(request)
        console.log(request.ok)
    }catch(e){
        console.error(e)
    }

}

//Set interval every 10s
checkInterval = setInterval(async function() {
    for(const [index] of devices.entries()){
        await interval(index)
    }
}, emonCMS.collection_interval);

checkConfigs();