# wow-market-watcher-ui

The WoW Market Watcher is a service that, on a scheduled bases, collects auction house data from Blizzard's API and save it as a time series.
The services exposes a REST API that:

- Allows users to create and manage accounts.
- Query against the database of items, realms, etc
- Create and update watch lists
- Query the time series database

- Site: https://rob893.github.io/wow-market-watcher-ui
- API Repo: https://github.com/rob893/wow-market-watcher

## Local Development

### Prerequisites

- NodeJS 14

### Basic Commands

- `npm i` install dependencies
- `npm start` start local dev server with hot reload
- `npm run build` build project for dev environment
- `npm run build-prod` build project for production environment

## CICD

All CICD is done through Github Actions.
All merges into `master` branch will kick off CICD to build the project and deploy it Github pages
