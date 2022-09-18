import Discord, { Intents } from "discord.js";
import fs from "fs";
import path from "path";
import Log from "./lib/Log";
import Client from "./lib/Client";
//import cron from "node-cron";


if (!fs.existsSync(path.resolve("config.json"))) {
  Log.error("Config not found");
  process.exit(1);
}

global.__version = "1.2.0";
global.__basedir = __dirname;

const config: Config = JSON.parse(fs.readFileSync(path.resolve("config.json")).toString());

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.DIRECT_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MEMBERS,
  ],
  partials: [
    'CHANNEL',
  ],
});

let guild: Discord.Guild;
Log.info(`MASTER CONTROL PROGRAM ${global.__version}`);

client.on("ready", async () => {
  Log.info(`Logged in as ${client.user.tag}`);
  client.user.setActivity("Falcon", { type: "WATCHING" });
  const roles = ["Admin"]
  let rc: roleCache = {};
  roles.forEach(async (r) => {
    rc[r] = guild.roles.cache.find((rl) => rl.name === r)?.id;
    console.log(`Role ${r} found with id ${rc[r]}`);
  });
  client.roleCache = rc;

  //cron.schedule("*/5 * * * *", async () => {
  
//  });
});

client.loadEvents("./events");
client.loadCommands("./commands");

client.login(config.discord.token);

export { guild };
