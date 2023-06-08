import { Listener } from '@sapphire/framework';
import { ActivityType, Client } from 'discord.js';

export class ReadyListener extends Listener {
  public constructor(context: Listener.Context, options: Listener.Options) {
    super(context, {
      ...options,
      once: true,
      event: 'ready'
    });
  }

  public async run(client: Client) {
    const { username, id } = client.user!;
    this.container.logger.info(`Successfully logged in as ${username} (${id})`);

    await client.user?.setPresence({
        activities: [{
            name: 'Cha Cha Cha',
            type: ActivityType.Listening,    
        }]
    });
  }
}
