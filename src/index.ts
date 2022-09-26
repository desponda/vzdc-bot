import Discord, { Intents, ThreadChannel, MessageEmbed } from "discord.js";
import fs from "fs";
import path from "path";
import Log from "./lib/Log";
import Client from "./lib/Client";
import cron from "node-cron";
import axios from 'axios'


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

let previouslyOnlineZDCControllers = [];
let guild: Discord.Guild;
Log.info(`MASTER CONTROL PROGRAM ${global.__version}`);
client.loadEvents("./events");
client.loadCommands("./commands");

const ratingMap = { 1: "Observer", 2: "Student 1", 3: "Student 2", 4: "Student 3", 5: "Controller 1", 6: "Controller 2", 7: "Controller 3", 8: "Instructor 1", 9: "Instructor 2",
10: "Instructor 3", 11: "Supervisor", 12: "Admin"}

client.login(config.discord.token);

export { guild };

client.on("ready", async () => {
  Log.info(`Logged in as ${client.user.tag}`);
  client.user.setActivity("Falcon", { type: "WATCHING" });

  const roles = ["Admin"]

  //set role cache for easy referencing
  let rc: roleCache = {};
  guild = client.guilds.cache.first();
  await guild.roles.fetch();
  roles.forEach(async (r) => {
    rc[r] = guild.roles.cache.find((rl) => rl.name === r)?.id;
    console.log(`Role ${r} found with id ${rc[r]}`);
  });
  client.roleCache = rc;

  //set channel cache for easy referencing

  const channels = ["📡staffup"]
  let cc: channelCache = {};
  await guild.channels.fetch();
  channels.forEach(async (c) => {
    cc[c] = guild.channels.cache.find((ch) => ch.name === c)?.id;
    console.log(`Channel ${c} found with id: ${cc[c]}`)
  })

  cron.schedule("*/10 * * * * *", async () => {
    console.log("running online cron")
    let c = await client.channels.cache.get(cc["📡staffup"]) as Discord.TextChannel;
    axios
      .get('https://data.vatsim.net/v3/vatsim-data.json')
      .then(res => {
        let watchedPositions = ['DCA_', 'IAD_', 'BWI_', 'PCT_', 'ADW_', 'DC_C', 'RIC_', 'ROA_', 'ORF_', 'ACY_', 'NGU_',
          'NTU_', 'NHK_', 'RDU_', 'CHO_', 'HGR_', 'LYH_', 'EWN_', 'LWB_', 'ISO_', 'MTN_', 'HEF_',
          'MRB_', 'PHF_', 'SBY_', 'NUI_', 'FAY_', 'ILM_', 'NKT_', 'NCA_', 'NYG_', 'DAA_', 'DOV_',
          'POB_', 'GSB_', 'WAL_', 'CVN_', 'DC_0', 'DC_1', 'DC_2', 'DC_3', 'DC_5', 'DC_N',
          'DC_S', 'DC_E', 'DC_W', 'DC_I', 'JYO_'];
        let onlineControllers = res.data.controllers;
        let onlineZDCControllers = onlineControllers.filter(oc => {
          return watchedPositions.some(wp => oc.callsign.startsWith(wp));
        });

        const onlined = onlineZDCControllers.filter(({ callsign: id1 }) => !previouslyOnlineZDCControllers.some(({ callsign: id2 }) => id2 === id1));
        onlined.forEach(async (oc) => {
          const embed = new MessageEmbed().setColor(0x1a6b28).setTitle(oc.callsign + " - Online").addFields(
            { name: "Facility", value: oc.callsign, inline: true },
            { name: "Name", value: oc.name, inline: true },
            { name: "Rating", value: ratingMap[oc.rating], inline: true })
          c.send({ embeds: [embed] });
        });

        const offlined = previouslyOnlineZDCControllers.filter(({ callsign: id1 }) => !onlineZDCControllers.some(({ callsign: id2 }) => id2 === id1));
        previouslyOnlineZDCControllers = JSON.parse(JSON.stringify(onlineZDCControllers));
        offlined.forEach(async (oc) => {
          const embed = new MessageEmbed().setColor(0xA01013).setTitle(oc.callsign + " - Offline").addFields(
            { name: "Facility", value: oc.callsign, inline: true },
            { name: "Name", value: oc.name, inline: true },
            { name: "Rating", value: ratingMap[oc.rating], inline: true })
          c.send({ embeds: [embed] });
        });
      })
      .catch(error => {
        console.error(error);
      });

  });
});

