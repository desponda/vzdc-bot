import Discord, { MessageEmbed } from "discord.js";
import Client from "../../lib/Client";
import Command from "../Command";

export default class HelpCommand extends Command {
  constructor(client: Discord.Client) {
    super(client, {
      command: "help",
      description: "Shows vZDC Operator Help",
      roles: [
        "everyone"
      ]
    });
  }

  async handle(message: Discord.Message, args: string[]) {
    const embed = new MessageEmbed();
    embed
      .setTitle("vZDC OPERATOR HELP")
      .setDescription("PREFIX: TAG MASTER CONTROL PROGRAM")
      .setFooter({ text: "END OF LINE."})
      .setColor(message.guild.me.displayHexColor);
    const commands = [];
    (message.client as Client).commands.forEach(cmd => {
      try {
      commands.push(`\`${cmd.command}\` - ${cmd.description}`);
      } catch(e) {
        console.log("could not push message")
      }
    });
    embed.addField("Commands", commands.join("\n"));
    message.channel.send({ embeds: [embed]}).catch(error =>{
      console.log(error)
    });

  }
}