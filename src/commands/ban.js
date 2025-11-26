import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a member from the server')
    .addUserOption(option =>
      option.setName('user').setDescription('User to ban').setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason').setDescription('Reason for ban').setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
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
        content: '❌ You cannot ban yourself.',
        flags: 64,
      });
    }

    if (member.id === client.user.id) {
      return interaction.reply({
        content: '❌ I cannot ban myself.',
        flags: 64,
      });
    }

    if (!member.bannable) {
      return interaction.reply({
        content: '❌ I cannot ban this member. Check my role position.',
        flags: 64,
      });
    }

    try {
      await member.send({
        embeds: [{
          color: 0xc0392b,
          title: '🔴 You have been banned!',
          description: `You were banned from **${interaction.guild.name}**.`,
          fields: [
            { name: 'Reason', value: reason, inline: false },
            { name: 'Banned by', value: interaction.user.tag, inline: false },
          ],
        }],
      }).catch(() => {});

      await member.ban({ reason });
      
      const embed = new EmbedBuilder()
        .setColor(0xc0392b)
        .setTitle('✓ Member Banned')
        .setDescription(`${member.user.tag} has been banned from the server.`)
        .addFields({ name: 'Reason', value: reason, inline: false })
        .setFooter({ text: `By ${interaction.user.username}` });

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Ban command error:', error);
      await interaction.reply({
        content: '❌ Failed to ban member. Please try again.',
        flags: 64,
      });
    }
  },
};

