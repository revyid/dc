import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder } from 'discord.js';
import { setGuildSetting, loadGuildSettings, getGuildSettings } from '../utils/database.js';

export default {
  customId: 'set_welcome_msg',
  async execute(interaction) {
    try {
      const modal = new ModalBuilder()
        .setCustomId('modal_welcome_msg')
        .setTitle('Customize Welcome Message');

      const messageInput = new TextInputBuilder()
        .setCustomId('welcome_msg_input')
        .setLabel('Welcome Message ({user}, {guild}, {count})')
        .setStyle(TextInputStyle.Paragraph)
        .setMaxLength(500)
        .setMinLength(10)
        .setRequired(true)
        .setPlaceholder('Welcome to {guild}, {user}! You are member #{count}');

      const row = new ActionRowBuilder().addComponents(messageInput);
      modal.addComponents(row);

      await interaction.showModal(modal);
    } catch (error) {
      console.error('Set welcome message error:', error);
    }
  },
};

export const welcomeModalHandler = {
  customId: 'modal_welcome_msg',
  async execute(interaction) {
    try {
      const message = interaction.fields.getTextInputValue('welcome_msg_input');
      await setGuildSetting(interaction.guildId, { welcome_message: message });
      await loadGuildSettings(interaction.guildId);

      const embed = new EmbedBuilder()
        .setColor('Green')
        .setTitle('✅ Welcome Message Updated')
        .setDescription(`Preview:\n\n${message.replace('{user}', interaction.user.toString()).replace('{guild}', interaction.guild.name).replace('{count}', interaction.guild.memberCount)}`)
        .setFooter({ text: 'Variables: {user}, {guild}, {count}' });

      await interaction.reply({ embeds: [embed], flags: 64 });
    } catch (error) {
      console.error('Welcome message modal error:', error);
    }
  },
};
