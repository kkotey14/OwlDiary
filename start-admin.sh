#!/bin/sh
set -e

printf "Admin email: "
read ADMIN_EMAIL

printf "Admin password: "
stty -echo
read ADMIN_PASSWORD
stty echo
printf "\n"

printf "Admin name (optional): "
read ADMIN_NAME

if [ -z "$ADMIN_EMAIL" ] || [ -z "$ADMIN_PASSWORD" ]; then
  echo "Admin email and password are required."
  exit 1
fi

export ADMIN_EMAIL
export ADMIN_PASSWORD
export ADMIN_NAME

echo "Starting server with admin bootstrap..."
exec npm run server
