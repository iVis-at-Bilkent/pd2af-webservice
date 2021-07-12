#!/usr/bin/env bash

# update
echo "Updating pd2af webservice..."
git fetch --all
git reset --hard origin/main

# build
echo -e "\nBuilding npm..."
npm update

# restart service
echo -e "\nRestarting server..."
sudo pm2 restart pd2af-webservice.js
echo "Done!"
