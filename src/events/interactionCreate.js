import { hasAdminRole, getPermissionErrorMessage } from '../utils/permissions.js';
import { trackCommandUsage } from '../utils/devbadge.js';
import { trackCommand } from '../utils/statistics.js';

export default {
  name: 'interactionCreate',
  execute(client, interaction) {
    if (interaction.isChatInputCommand()) {
      // Only process commands from guilds
      if (!interaction.guildId) {
        return interaction.reply({ content: '❌ Commands can only be used in servers.', flags: 64 });
      }

      const command = client.slashCommands.get(interaction.commandName);

      if (!command) {
        return interaction.reply({ content: '❌ Command not found!', flags: 64 });
      }

      try {
        let requiredRole = null;

        if (command.adminOnly) {
          requiredRole = process.env.ADMIN_ROLE;
        } else if (command.moderatorOnly) {
          requiredRole = process.env.MODERATOR_ROLE;
        } else if (command.operatorOnly) {
          requiredRole = process.env.OPERATOR_ROLE;
        }

        if (requiredRole && !hasAdminRole(interaction.member, command.adminOnly ? 'admin' : command.moderatorOnly ? 'moderator' : 'operator')) {
          return interaction.reply({
            content: getPermissionErrorMessage(requiredRole),
            flags: 64,
          });
        }

        command.execute(interaction, client);

        // Track command usage for Active Developer Badge
        trackCommandUsage(interaction.guildId, interaction.user.id, interaction.commandName);

        // Track command statistics for analytics
        trackCommand(interaction.guildId, interaction.user.id);
      } catch (error) {
        console.error(`Error executing command ${interaction.commandName}:`, error);
        interaction.reply({
          content: '❌ An error occurred while executing this command.',
          flags: 64,
        });
      }
    } else if (interaction.isButton()) {
      let interactionHandler = client.interactions.get(interaction.customId);

      if (!interactionHandler) {
        for (const handler of client.interactions.values()) {
          if (handler.customId instanceof RegExp && handler.customId.test(interaction.customId)) {
            interactionHandler = handler;
            break;
          }
        }
      }

      if (interactionHandler) {
        try {
          interactionHandler.execute(interaction, client);
        } catch (error) {
          console.error(`Error handling interaction ${interaction.customId}:`, error);
          interaction.reply({
            content: '❌ An error occurred!',
            flags: 64,
          });
        }
      }
    } else if (interaction.isChannelSelectMenu()) {
      const customId = interaction.customId;
      let interactionHandler = client.interactions.get(customId);

      if (!interactionHandler) {
        const prefix = customId.split('_')[0];
        const handlers = {
          'select_welcome_channel': client.interactions.get('select_welcome_channel'),
          'select_goodbye_channel': client.interactions.get('select_goodbye_channel'),
          'select_logs_channel': client.interactions.get('select_logs_channel'),
        };
        interactionHandler = handlers[customId];
      }

      if (interactionHandler) {
        try {
          interactionHandler.execute(interaction, client);
        } catch (error) {
          console.error(`Error handling channel select menu ${customId}:`, error);
          interaction.reply({
            content: '❌ An error occurred!',
            flags: 64,
          });
        }
      }
    } else if (interaction.isStringSelectMenu()) {
      const interactionHandler = client.interactions.get(interaction.customId);

      if (interactionHandler) {
        try {
          interactionHandler.execute(interaction, client);
        } catch (error) {
          console.error(`Error handling select menu ${interaction.customId}:`, error);
          interaction.reply({
            content: '❌ An error occurred!',
            flags: 64,
          });
        }
      }
    } else if (interaction.isModalSubmit()) {
      const customId = interaction.customId;
      let interactionHandler = client.interactions.get(customId);

      if (!interactionHandler) {
        const handlers = {
          'modal_prefix': client.interactions.get('modal_prefix'),
          'modal_warnings': client.interactions.get('modal_warnings'),
        };
        interactionHandler = handlers[customId];
      }

      if (interactionHandler) {
        try {
          interactionHandler.execute(interaction, client);
        } catch (error) {
          console.error(`Error handling modal ${customId}:`, error);
          interaction.reply({
            content: '❌ An error occurred!',
            flags: 64,
          });
        }
      }
    }
  },
};

