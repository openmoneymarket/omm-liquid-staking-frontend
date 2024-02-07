#!/bin/bash

if [[ $VERCEL_ENV == "production"  ]] ; then
  npm run build:prod
else
  npm run build:dev
fi
