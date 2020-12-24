import Discord from "discord.js";
import Client from "../lib/Client";
import Log from "../lib/Log";

export default function (client: Client, message: Discord.Message) {
  if (message.author.bot) return;

  if (message.channel.type === "dm") {
    // Only respond to version DMs, ignore the rest
    if (message.content.toLowerCase() === "version") {
      message.author.send(`MASTER CONTROL PROGRAM VERSION ${global.__version} BY DANIEL A. HAWTON. END OF LINE.`);
    }
    return;
  }

  const prefixRegex = new RegExp(`^(<@!?${client.user.id}>)\\s*`);
  if (prefixRegex.test(message.content)) {
    const [, match] = message.content.match(prefixRegex);
    const args = message.content.slice(match.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();
    const msg = message.content.slice(match.length).trim();
    let command = client.commands.get(msg) || client.commands.get(cmd); // If command not found as match, try single word command
    if (command) {
      if (!command.checkPermissions(message)) {
        message.channel.send("YOU DO NOT HAVE ACCESS TO THIS REQUEST. END OF LINE.")
      } else {
        command.handle(message, args);
      }
    } else {
      message.channel.send(`<@${message.author.id}> I DON'T KNOW HOW TO DO THAT. END OF LINE.`);
    }
  }
};
