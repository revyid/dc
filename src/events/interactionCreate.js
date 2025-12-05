import { hasAdminRole, hasMinimumRole, getPermissionErrorMessage } from '../utils/permissions.js';
import { trackCommandUsage } from '../utils/devbadge.js';
import { trackCommand } from '../utils/statistics.js';
import { loadGuildSettings, loadGuildRoles, initializeGuildRoles } from '../utils/database.js';
import { autoDetectRoles } from '../utils/roleDetector.js';

export default {
  name: 'interactionCreate',
  async execute(client, interaction) {
    if (interaction.guildId) {
      await Promise.all([
        loadGuildSettings(interaction.guildId).catch(console.error),
        loadGuildRoles(interaction.guildId).catch(async (error) => {
          console.error('Error loading guild roles:', error);

          // Use smart role detection if roles not configured
          if (interaction.guild) {
            const detectedRoles = autoDetectRoles(interaction.guild);
            await initializeGuildRoles(interaction.guildId, detectedRoles);
          }
        })
      ]);
    }

    if (interaction.isChatInputCommand()) {
      if (!interaction.guildId) {
        return interaction.reply({ content: '❌ Commands can only be used in servers.', flags: 64 });
      }

      const command = client.slashCommands.get(interaction.commandName);

      if (!command) {
        return interaction.reply({ content: '❌ Command not found!', flags: 64 });
      }

      try {
        let hasPermission = true;

        // Use hierarchical permission check - higher roles can access lower-level commands
        if (command.adminOnly) {
          // Owner, Co-Owner, AND Admin can use adminOnly commands
          hasPermission = await hasMinimumRole(interaction.member, 'admin');
        } else if (command.moderatorOnly) {
          // Owner, Co-Owner, Admin, AND Moderator can use moderatorOnly commands
          hasPermission = await hasMinimumRole(interaction.member, 'moderator');
        } else if (command.staffOnly) {
          // Owner through Staff can use staffOnly commands
          hasPermission = await hasMinimumRole(interaction.member, 'staff');
        } else if (command.operatorOnly) {
          // Owner through Operator can use operatorOnly commands
          hasPermission = await hasMinimumRole(interaction.member, 'operator');
        } else if (command.minimumRole) {
          hasPermission = await hasMinimumRole(interaction.member, command.minimumRole);
        }

        if (!hasPermission) {
          const roleName = command.adminOnly ? 'Admin'
            : command.moderatorOnly ? 'Moderator'
              : command.staffOnly ? 'Staff'
                : command.operatorOnly ? 'Operator'
                  : 'Required Role';
          await interaction.reply({
            content: getPermissionErrorMessage(roleName),
            flags: 64,
          });
          return;
        }

        await command.execute(interaction, client);
        trackCommandUsage(interaction.guildId, interaction.user.id, interaction.commandName);
        trackCommand(interaction.guildId, interaction.user.id);
      } catch (error) {
        // Ignore Unknown Interaction (10062) and Already Acknowledged (40060) errors
        if (error.code === 10062 || error.code === 40060) return;

        console.error(`Error executing command ${interaction.commandName}:`, error);
        const reply = {
          content: '❌ An error occurred while executing this command.',
          flags: 64,
        };
        try {
          if (interaction.replied || interaction.deferred) {
            await interaction.followUp(reply);
          } else {
            await interaction.reply(reply);
          }
        } catch (replyError) {
          // Ignore errors when sending the error reply
          if (replyError.code !== 10062 && replyError.code !== 40060) {
            console.error('Failed to send error reply:', replyError);
          }
        }
      }
    } else if (interaction.isButton() || interaction.isChannelSelectMenu() || interaction.isStringSelectMenu() || interaction.isModalSubmit()) {
      try {
        if (interaction.message && interaction.message.deletable && !interaction.message.flags.has('Ephemeral')) {
          await interaction.message.delete().catch(() => { });
        }
      } catch (error) { }

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
          await interactionHandler.execute(interaction, client);
        } catch (error) {
          console.error(`Error handling interaction ${interaction.customId}:`, error);
          const reply = {
            content: '❌ An error occurred!',
            flags: 64,
          };
          if (interaction.replied || interaction.deferred) {
            await interaction.followUp(reply);
          } else {
            await interaction.reply(reply);
          }
        }
      }
    }
  },
};
