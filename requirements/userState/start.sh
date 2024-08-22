#!/bin/bash

python3 -m venv .venv

source .venv/bin/activate

pip install -r requirements.txt

CERTFILE=/etc/ssl/certs/selfsigned.crt
KEYFILE=/etc/ssl/private/selfsigned.key

daphne -e ssl:5000:privateKey=$KEYFILE:certKey=$CERTFILE  userState.asgi:application

