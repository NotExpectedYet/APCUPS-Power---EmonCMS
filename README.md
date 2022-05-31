
# APCUPS - Power Collector for EmonCMS - WIP

# What does this do? 
The script runs on an interval and gathers data from multiple apcupsd installs using it's network functionality. It then pushes that data as a wattage value up to emonCMS to be tracked. 

# Why did I code it?
I've recently setup home assistant again and wanted to supplement my power usage stats on the "Energy" tab with other devices that arn't natively supported. There was once an apcupsd plugin to use but it didn't support multiple devices, and I couldn't muster up the energy to bother with converting over all my installs to NUT, which has a Home Assistant plugin. 

This little script was also way easier than learning how to write a full blown Home Assistant plugin, plus I get the benefit of the data going to my emonCMS installation too. 

# How to install?

The script expects you've got apcupsd setup and running on a client and is outside the scope of this readme.

## Clone the repo
`git clone https://github.com/NotExpectedYet/APCUPS-Power---EmonCMS`

## Change into the directory
`cd APCUPS-Power---EmonCMS/`

## Install the dependencies 
`npm ci`

## Create a emonCMS.json containing your emonCMS data. 
Copy the emonCMS_sample.json to emonCMS.json and fill in your data. 
```json
{
    "emoncms_url": "http://10.50.0.100", /* Your device url, inc http/https */
    "apikey": "2aff5cf3ff9201ea847950ef8d33cebc", /* Your devices read/write api key */
    "collection_interval": 5000 /* The collection interval for gathering the data. Default's to 5000 */
}
```

## Create a devices.json containing your device list.
Copy the devices_sample.json to devices.json and fill in your devices data.
```json
[
    {
        "name": "UPS1", /* UPS Name, this will be send without spaces and lower case to emon as your device name */
        "ip": "10.50.1.2", /* IP address of apcupsd instance, no http/https */
        "port": 3551, /* Port of apcupsd instance, defaults to 3551 */
        "MAX_POWER": 700 /* Max power of your device, details below of how to find this out. */
    }, /* Make sure each curly bracket has a , on the end before the next one */
    {
        "name": "UPS2",
        "ip": "10.50.1.3",
        "port": 3551,
        "MAX_POWER": 390
    } /* No comma on the last device */
]
```
## Install the service
`npm install -g pm2`

## Start the service
`pm2 start ecosystem.config.js`

## Check you are recieving data in your emoncms instance. 
You should now be able to go to /input/view in emonCMS and see your new devices.

These will not be logged by default so you'll need to create the "Log to feed" and "Power to kWh" logs yourself. These are the same as your emon Tx or other devices. 

## General Issues
1. Can't connect to APC daemon on remote machine.

    This is usually because apc is setup to listen to localhost by default. Look for the NISIP value in your apcupsd.config file and change it to 0.0.0.0. 
2. Can't find where my max watt comes from.

    You can find max watt for APC in your device spec's. Below is a list of spec's for common APC devices.
    - https://www.apc.com/shop/uk/en/products/APC-Back-UPS-1400VA-230V-AVR-IEC-Sockets/P-BX1400UI
    - https://www.apc.com/shop/uk/en/products/APC-Back-UPS-700VA-230V-AVR-IEC-Sockets-To-be-replace-by-BX750MI-/P-BX700UI

## TODO
 - [x] Allow collection of data from multiple devices
 - [x] Allow sending of data to single emoncms system
 - [ ] Add in checks for data verification for devices/emoncms json files.
 - [x] Disconnect from the device if axios errors out
