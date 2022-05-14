
# APCUPS - Power Collector for EmonCMS - WIP

# What does this do? 
The script runs on an interval and gathers data from multiple apcupsd installs using it's network functionality. It then pushes that data as a wattage value up to emonCMS to be tracked. 

# Why did I code it?
I've recently setup home assistant again and wanted to supplement my power usage stats on the "Energy" tab with other devices that arn't natively supported. There was once an apcupsd plugin to use but it didn't support multiple devices, and I couldn't muster up the energy to bother with converting over all my installs to NUT, which has a Home Assistant plugin. 

This little script was also way easier than learning how to write a full blown Home Assistant plugin, plus I get the benefit of the data going to my emonCMS installation too. 

# How to install?

The script expects you've got apcupsd setup and running on a client. It can be windows or linux or whatever apcaccess currently supports but I've only detailed linux instructions below. 

## Clone the repo
`git clone https://github.com/NotExpectedYet/APCUPS-Power---EmonCMS`

## Change into the directory
`cd APCUPS-Power---EmonCMS/`

## Install the dependencies 
`npm ci`

## Create a emonCMS.json containing your emonCMS data. 

## Create a devices.json containing your device list.


## General Issues
1. Can't connect to APC daemon on remote machine.

    This is usually because apc is setup to listen to localhost by default. Look for the NISIP value in your apcupsd.config file and change it to 0.0.0.0. 
2. Can't find where my max watt comes from.

    You can find max watt for APC in your device spec's. Below is a list of spec's for common APC devices.
    - https://www.apc.com/shop/uk/en/products/APC-Back-UPS-1400VA-230V-AVR-IEC-Sockets/P-BX1400UI
    - https://www.apc.com/shop/uk/en/products/APC-Back-UPS-700VA-230V-AVR-IEC-Sockets-To-be-replace-by-BX750MI-/P-BX700UI