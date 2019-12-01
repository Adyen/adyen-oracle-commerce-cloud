# Adyen Oracle Commerce Cloud
## Requirements
Node.js (min. v8.1.1) with package manager (NPM or Yarn)
## First steps
Create a `occ.config` file inside the `scripts` folder with the following format:
```bash
USERNAME=YOUR_OCC_ADMIN_USERNAME  # USERNAME=john.doe@example.com
PASSWORD=YOUR_OCC_ADMIN_PASSWORD  # PASSWORD=abcd1234
URL=YOUR_OCC_ADMIN_SITE_ADDRESS   # URL=https://ccadmin-abcde.oracleoutsourcing.com
EXTENSION_NAME=ANY_NAME           # EXTENSION_NAME="Adyen Plugin"
```
## Installation
> _You can find the scripts to zip and deploy the client/server inside the `scripts` folder_
### Server Extension
Run `$ npm run deploy:server`  or `$ yarn run deploy:server`
### Client Extension
Run `$ npm run deploy:client` or `$ yarn run deploy:client`


## Client Extension
 You can enable Adyen Plugin under the Payment Gateways, in the Payment Processing Settings.
## Server Extension
 Make sure to set the Generic Payment URL to `/ccstorex/custom/adyen/v1/payments`
