#!/bin/bash

cd ~/member-counter-bot/
git fetch
git pull
sudo /bin/systemctl restart member-counter-bot