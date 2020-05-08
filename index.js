var ApcAccess = require('apcaccess');
var client = new ApcAccess();
const axios = require('axios');

let emonCMS = "http://192.168.1.214/emoncms/input/"
let apiKey = "apikey=c368e687c015eee0b792c07acfbf469b"
let nodeName = "PrinterUPS1"

//Set interval every 10s
setInterval(function() {



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
