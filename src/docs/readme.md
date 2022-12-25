# Sourcey
***Discord bot, made for game projects, especially based on Source Engine games***

## Getting started
In order to run project locally:
1. Install the latest stable (LTS version) of nodejs -> https://nodejs.org/
2. Clone/download project to your machine
3. Run `npm i` in project's root directory
4. Create bot application if you don't have on already at https://discord.com/developers/applications
   and get bot token by clicking 'Click to Reveal Token' at the 'Bot' section
5. Place your bot token into `src/config.json` as a value of `General.token`
6. You will also need to have postgresql database setup and running -> https://www.postgresql.org/download/
7. Fill database credentials **(host, port, username, password, database)** in`src/ormconfig.ts`

## Run
Run `npm run start` to start the bot.  
The app will automatically reload if you change any of the source files.

## Build
Run `npm run build` to build the project.  
The build will be stored in the `/dist` directory.

## Test
Run `npm run test` to execute unit tests via Jest.  
Run `npm run "test -cc"` to execute unit tests with code coverage

## */src* structure
- ***/base*** - base classes
- ***/commands*** - available commands
- ***/docs*** - project documentaries
- ***/events*** - available discord events
- ***/models*** - database tables' models
- ***/resources*** - API/Client resources
- ***/utils*** - other scripts/helpers


## Database
As a postgresql database manager TypeORM is being used.

When developing on local machine, make sure to have **synchronize** set to **true** in `src/ormconfig.ts`  
All changes made to models will apply automatically on bot start 

 ### Generate database migrations
```bash
typeorm migration:generate -n migration_file_name
```

 ### Run database migrations
```bash
typeorm migration:run
```

## Configuration
TBA
