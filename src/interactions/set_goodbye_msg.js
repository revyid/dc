import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder } from 'discord.js';
import { setGuildSetting, loadGuildSettings, getGuildSettings } from '../utils/database.js';

export default {
  customId: 'set_goodbye_msg',
  async execute(interaction) {
    try {
      const modal = new ModalBuilder()
        .setCustomId('modal_goodbye_msg')
        .setTitle('Customize Goodbye Message');

      const messageInput = new TextInputBuilder()
        .setCustomId('goodbye_msg_input')
        .setLabel('Goodbye Message ({user}, {guild}, {memberSince})')
        .setStyle(TextInputStyle.Paragraph)
        .setMaxLength(500)
        .setMinLength(10)
        .setRequired(true)
        .setPlaceholder('{user} has left {guild}. They were a member since {memberSince}');

      const row = new ActionRowBuilder().addComponents(messageInput);
      modal.addComponents(row);

      await interaction.showModal(modal);
    } catch (error) {
      console.error('Set goodbye message error:', error);
    }
  },
};

export const goodbyeModalHandler = {
  customId: 'modal_goodbye_msg',
  async execute(interaction) {
    try {
      const message = interaction.fields.getTextInputValue('goodbye_msg_input');
      await setGuildSetting(interaction.guildId, { goodbye_message: message });
      await loadGuildSettings(interaction.guildId);

      const embed = new EmbedBuilder()
        .setColor('Orange')
        .setTitle('✅ Goodbye Message Updated')
        .setDescription(`Preview:\n\n${message.replace('{user}', interaction.user.toString()).replace('{guild}', interaction.guild.name).replace('{memberSince}', new Date().toLocaleDateString('id-ID'))}`)
        .setFooter({ text: 'Variables: {user}, {guild}, {memberSince}' });

      await interaction.reply({ embeds: [embed], flags: 64 });
    } catch (error) {
      console.error('Goodbye message modal error:', error);
    }
  },
};
