import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a member from the server')
    .addUserOption(option =>
      option.setName('user').setDescription('User to kick').setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason').setDescription('Reason for kick').setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
  adminOnly: true,
  async execute(interaction, client) {
    const member = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!member) {
      return interaction.reply({
        content: '❌ Member not found.',
        flags: 64,
      });
    }

    if (member.id === interaction.user.id) {
      return interaction.reply({
        content: '❌ You cannot kick yourself.',
        flags: 64,
      });
    }

    if (member.id === client.user.id) {
      return interaction.reply({
        content: '❌ I cannot kick myself.',
        flags: 64,
      });
    }

    if (!member.kickable) {
      return interaction.reply({
        content: '❌ I cannot kick this member. Check my role position.',
        flags: 64,
      });
    }

    try {
      await member.send({
        embeds: [{
          color: 0xe74c3c,
          title: '🔴 You have been kicked!',
          description: `You were kicked from **${interaction.guild.name}**.`,
          fields: [
            { name: 'Reason', value: reason, inline: false },
            { name: 'Kicked by', value: interaction.user.tag, inline: false },
          ],
        }],
      }).catch(() => {});

      await member.kick(reason);
      
      const embed = new EmbedBuilder()
        .setColor(0xe74c3c)
        .setTitle('✓ Member Kicked')
        .setDescription(`${member.user.tag} has been kicked from the server.`)
        .addFields({ name: 'Reason', value: reason, inline: false })
        .setFooter({ text: `By ${interaction.user.username}` });

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Kick command error:', error);
      await interaction.reply({
        content: '❌ Failed to kick member. Please try again.',
        flags: 64,
      });
    }
  },
};


