import devices from "./devices";
import emonCMS from "./emon";
const ApcAccess = require('apcaccess');
const axios = require('axios');

const interval = () => {

}

const createClient = () => {

}

const doesClientExist = () => {

}

const getJsonStatus = (clientIndex) => {

}

const calculateCurrentWattage = ({NOMPOWER: undefined, LOADPCT: 0}) => {

}

const sendToEmonCMS = () => {

}

//Set interval every 10s
setInterval(function() {
    const client = new ApcAccess();

client.connect('localhost', 3551)
  .then(function() {
    return client.getStatusJson();
  })
  .then(async function(result) {
    let currentWattage = parseFloat(result.NOMPOWER) * 0.01 *  parseFloat(result.LOADPCT)
    let data = {
		"power": currentWattage
	}
    data = JSON.stringify(data)
    let url = `${emonCMS}post?node=${nodeName}&fulljson=${data}&${apiKey}`

    axios.get(url)
  	.then(response => {
  	})
  	.catch(error => {
    		console.log(error);
  	});
    return client.disconnect();
  })
  .then(function() {
    console.log('Disconnected');
  })
  .catch(function(err) {
    console.log(err);
  })  
}, 10000); 
