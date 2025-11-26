# Discord Bot Configuration Guide

## Environment Variables (.env)

```env
# Discord Bot Token
DISCORD_TOKEN=your_bot_token_here

# Bot Client ID
CLIENT_ID=your_client_id_here

# Command Prefix (untuk future use)
PREFIX=!

# Role Configuration
# Set these to the exact role names in your Discord server
ADMIN_ROLE=admin
MODERATOR_ROLE=moderator
OPERATOR_ROLE=operator
```

## Role Configuration Examples

### Example 1: Standard Setup
```env
ADMIN_ROLE=Admin
MODERATOR_ROLE=Moderator
OPERATOR_ROLE=Helper
```

### Example 2: Custom Names
```env
ADMIN_ROLE=Staff
MODERATOR_ROLE=Moderator
OPERATOR_ROLE=Support
```

### Example 3: Multilevel
```env
ADMIN_ROLE=Owner
MODERATOR_ROLE=Moderator
OPERATOR_ROLE=Trusted Member
```

## How to Get Your Bot Token and Client ID

### 1. Get Bot Token:
   - Go to https://discord.com/developers/applications
   - Click your application
   - Go to "Bot" section
   - Click "Reset Token" 
   - Copy the token to `.env`

### 2. Get Client ID:
   - Go to https://discord.com/developers/applications
   - Click your application
   - Copy "Application ID" from top right
   - Paste to `CLIENT_ID` in `.env`

## How to Setup Roles in Your Server

### Step 1: Create Roles
1. Go to Server Settings → Roles
2. Click "Create Role"
3. Create the following roles:
   - `admin` (or your ADMIN_ROLE name)
   - `moderator` (or your MODERATOR_ROLE name)
   - `operator` (or your OPERATOR_ROLE name)

### Step 2: Set Permissions
- **Admin Role**: All permissions
- **Moderator Role**: Manage Messages, Timeout Members, Manage Roles
- **Operator Role**: Manage Messages

### Step 3: Assign Roles to Members
1. Right-click a member
2. Click "Edit"
3. Add roles to them

## Role-Based Permission System

### Admin Role
- Full access to all commands
- Can kick, ban, warn, mute members
- Can manage roles
- Can clear messages

### Moderator Role
- Access to moderation commands
- Can mute/unmute members
- Can warn members
- Can clear messages

### Operator Role
- Limited access
- Can warn members only

## Important Notes

- Role names are **case-insensitive**
- If a role doesn't exist, admin commands won't work
- Always use the exact role name as it appears in your server
- You can have multiple members with the same role
- Bot requires the roles to be created in the server BEFORE commands can work

## Troubleshooting

### "You need the admin role to use this command"
- Check if role name matches `.env` exactly
- Make sure the role is assigned to your user
- Reload the bot after changing roles

### Bot can't find commands
- Make sure `CLIENT_ID` is correct
- Wait a few seconds after bot restart
- Use `/` to see registered commands

### Role management not working
- Bot role must be ABOVE the role you're trying to manage
- Check bot permissions in server
- Make sure role exists in the server
