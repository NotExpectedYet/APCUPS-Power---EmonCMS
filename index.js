const ApcAccess = require('apcaccess');
const axios = require('axios');

let devices = null;
let emonCMS = null;
let checkInterval = null;
const clients = [];

const interval = async (clientIndex) => {
    if(!checkForConfigs()){
        // No configs... kill the service
        clearInterval(checkInterval);
        checkInterval = null;
    }


    if(!doesClientExist(clientIndex)){
        createClient();
    }

    await connectToClient(clientIndex);
    console.log(clientIndex)
    const jsonStatus = await getJsonStatus(clientIndex);

    const calculatedWattage = calculateCurrentWattage(clientIndex, jsonStatus)

    console.log(calculatedWattage)

    await disconnectFromClient(clientIndex);


}

const checkForConfigs = () => {
    let devicesConfig = null;
    let emonCMSConfig = null;
    try{
        devicesConfig = require("./devices.json");
        emonCMSConfig = emonCMSConfig("./emonCMS.json");
    }catch(e){
        console.error(e.toString())
    }

    if(!devicesConfig || !emonCMS){
        return false;
    }

    devices = devicesConfig;
    emonCMS = emonCMSConfig;

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
    return clients[clientIndex].connect(clients[clientIndex].ip, clients[clientIndex].port);
}

const getJsonStatus = async (clientIndex) => {
    return clients[clientIndex].getStatusJson()
}

const disconnectFromClient = async (clientIndex) => {
    return clients[clientIndex].disconnect();
}

const calculateCurrentWattage = (clientIndex, {NOMPOWER = undefined, LOADPCT = 0}) => {
    console.log(clientIndex)
    let nominal_power = 0;
    console.log(NOMPOWER)
    if(!NOMPOWER){
        console.log(clients[clientIndex])
        nominal_power = clients[clientIndex].NOMPOWER;
    }else{
        nominal_power = parseFloat(NOMPOWER)
    }
    const cleanLOADPCT = LOADPCT.replace("Percent", "");
    console.log(cleanLOADPCT)
    const load_pct = parseFloat(cleanLOADPCT)

    console.log(load_pct, nominal_power)

    let currentWattage = nominal_power * 0.01 * load_pct
    return JSON.stringify({
		"power": currentWattage
	})
}

const sendToEmonCMS = () => {

}

//Set interval every 10s
checkInterval = setInterval(async function() {
    for(const [index] of devices.entries()){
        await interval(index)
    }

//     const client = new ApcAccess();
//
// client.connect('localhost', 3551)
//   .then(function() {
//     return client.getStatusJson();
//   })
//   .then(async function(result) {
//
//     data = JSON.stringify(data)
//     let url = `${emonCMS}post?node=${nodeName}&fulljson=${data}&${apiKey}`
//
//     axios.get(url)
//   	.then(response => {
//   	})
//   	.catch(error => {
//     		console.log(error);
//   	});
//     return client.disconnect();
//   })
//   .then(function() {
//     console.log('Disconnected');
//   })
//   .catch(function(err) {
//     console.log(err);
//  })
}, emonCMS.collection_interval);
