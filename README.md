# Adyen Oracle Commerce Cloud
[![Build Status](https://travis-ci.org/Adyen/adyen-oracle-commerce-cloud.svg?branch=main)](https://travis-ci.org/Adyen/adyen-oracle-commerce-cloud)
[![Coverage Status](https://coveralls.io/repos/github/Adyen/adyen-oracle-commerce-cloud/badge.svg?branch=main)](https://coveralls.io/github/Adyen/adyen-oracle-commerce-cloud?branch=main)
![GitHub tag (latest SemVer)](https://img.shields.io/github/v/tag/Adyen/adyen-oracle-commerce-cloud).   
  
Plugin for Oracle Commerce Cloud to allow merchants to use Adyen as payment platform.
## Requirements
Node.js (min. v10) with package manager (NPM or Yarn)
## Installation
### Create a config file
Edit the [`occ.config`](./scripts/occ.config) file inside the [`scripts`](./scripts) with your credentials:
```bash
USERNAME=YOUR_OCC_ADMIN_USERNAME  # USERNAME=john.doe@example.com
PASSWORD=YOUR_OCC_ADMIN_PASSWORD  # PASSWORD=abcd1234
URL=YOUR_OCC_ADMIN_SITE_ADDRESS   # URL=https://ccadmin-abcde.oracleoutsourcing.com
EXTENSION_NAME=ANY_NAME           # EXTENSION_NAME="Adyen Plugin"
```
### Install Dependencies
Run `$ npm install`  or `$ yarn` to install all dependencies
> _You can find the scripts to zip and deploy the client/server inside the `scripts` folder_
#### Server Extension
Run `$ npm run deploy:server`  or `$ yarn run deploy:server`
#### Client Extension
Run `$ npm run deploy:client` or `$ yarn run deploy:client`

## Usage
### Client Extension
 You can enable Adyen Plugin under the Payment Gateways, in the Payment Processing Settings.
### Server Extension
 Make sure to set the Generic Payment URL to `/ccstorex/custom/adyen/v1/payments`

## Documentation
- https://docs.adyen.com/plugins/oracle-commerce-cloud

## Support
  If you have a feature request, or spotted a bug or a technical problem, create a GitHub issue. For other questions, contact our [support team](https://support.adyen.com/hc/en-us/requests/new?ticket_form_id=360000705420).

## Contributing
We strongly encourage you to join us in contributing to this repository so everyone can benefit from:
- New features and functionality
- Resolved bug fixes and issues
- Any general improvements
Read our contribution guidelines to find out how.

## Licence
MIT license. For more information, see the LICENSE file.
