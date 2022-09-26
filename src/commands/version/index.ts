import Command from "../Command";
import Discord from "discord.js";

export default class VersionCommand extends Command {
  constructor(client: Discord.Client) {
    super(client, {
      command: "request version information",
      alias: "version",
      description: "vZDC Operator Version information",
      roles: [
        "everyone"
      ]
    });
  }

  handle(message: Discord.Message, args: string[]): void {
    message.channel.send(`vZDC OPERATOR PROGRAM VERSION ${global.__version} BY DANIEL ESPONDA. END OF LINE.`);
  }
}