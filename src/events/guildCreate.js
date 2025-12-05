import { initializeGuildRoles } from '../utils/database.js';
import { autoDetectRoles } from '../utils/roleDetector.js';
import { repairGuildDatabase } from '../utils/databaseValidator.js';

export default {
    name: 'guildCreate',
    async execute(client, guild) {
        console.log(`\n🆕 Joined new guild: ${guild.name} (${guild.id})`);

        // Use smart role detection with emoji support
        console.log('  📍 Scanning for roles...');
        const detectedRoles = autoDetectRoles(guild);

        // Initialize guild with detected roles
        await initializeGuildRoles(guild.id, detectedRoles);

        // Also run full database repair to ensure all structures exist
        await repairGuildDatabase(guild.id, guild);

        console.log(`  ✅ Guild database initialized with ${Object.keys(detectedRoles).length} auto-detected roles`);
    },
};
