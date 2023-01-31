## Installation

#### Clone this respository

As it says, clone into a location of your choice.

#### Install node.js

Go to **[Node.js](https://nodejs.org/en/)** to install the Node.js runtime for your system.

After installation, you should see something similar to the following after typing `npm` into your Terminal/Command Prompt.

```zsh
➜  Development npm -i
npm <command>

Usage:

npm install        install all the dependencies in your project
```

#### Install packages

Run `npm install` in your Terminal within the project directory. If successful, it should show:

```zsh
/opt/homebrew/bin/npm install

up to date, audited 329 packages in 3s

35 packages are looking for funding
  run `npm fund` for details

2 moderate severity vulnerabilities

To address all issues, run:
  npm audit fix

Run `npm audit` for details.

Process finished with exit code 0
```

#### Create configuration files

Within the `config` folder there is a file called [sample.json](https://github.com/redditmhoc/whip-discord-bot/blob/b83185562a4e2154bb84d7b885860ee92862f117/config/sample.json). Values WITH_PLACEHOLDER_VALUES will need to be replaced.

Duplicate this file within the `config` folder with a new name `default.json`. **Do not publish this file or commit this file to a Git repository.**

For a new deployment:

1. Get a Discord bot client ID and token by following [this page.](https://discordjs.guide/preparations/setting-up-a-bot-application.html) Put the client ID and token into the `bot` section of the config.
2. Create a new Reddit account to be used for sending whip messages. Put its username and password into `botUsername` and `botPassword` in the `reddit` section of the config. Then [here](https://old.reddit.com/prefs/apps/), create a new application with the type 'script'. Put its client ID and secret into the config.
3. Enter the ID for the Discord server (guild) this bot is based in, the logging channel ID, and the whip messages channel ID, into the `guild` section. To get these IDs enable developer mode in your Discord client and right click on the server and channels.
4. *(Optional) Get an Octokit [API key](https://github.com/octokit/octokit.js/#authentication) to display version information.*

#### Import MP list.

Create a .json file to list all of your MPs, so it is easy to import them into the bot when first starting. Place it into the project directory.

The contents need to be as so:

```json
{ "usernames": [
  "username1",
  "username3",
  "username3"
]}
```

Then in the project directory within your Terminal, run the command `node dbImport.js --force`. This will create a database for the bot and import the MP list.

If successful, it should show:

```zsh
➜  solidarity-whip-bot git:(main) ✗ node dbImport.js --force
Found 3 MPs
Imported username1
Imported username2
Imported username3
Database synced!
```

#### Run the bot

You can now run the bot with the command `node app.js`. 

```zsh
➜  solidarity-whip-bot git:(main) ✗ node app.js
Ready! Logged in as BOT USERNAME#0000
```
