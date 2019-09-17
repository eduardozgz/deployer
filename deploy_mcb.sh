#!/bin/bash

cd ~/member-counter-bot/
git fetch
git pull
sudo systemctl restart member-counter-bot