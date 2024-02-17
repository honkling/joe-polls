import { ChannelType, Client, REST, Routes, SlashCommandBooleanOption, SlashCommandBuilder, SlashCommandChannelOption, SlashCommandStringOption } from "discord.js";

export async function deployCommands(client: Client) {
    const rest = new REST().setToken(client.token);

    await rest.put(
        Routes.applicationCommands(client.application.id),
        { body: [
            new SlashCommandBuilder()
                .setName("poll")
                .setDescription("Run a poll.")
                .addStringOption(new SlashCommandStringOption()
                    .setName("message")
                    .setDescription("The poll message.")
                    .setRequired(true))
                .addChannelOption(new SlashCommandChannelOption()
                    .setName("channel")
                    .setDescription("What channel should the poll be posted in?")
                    .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement, ChannelType.PublicThread, ChannelType.PrivateThread, ChannelType.GuildForum)
                    .setRequired(false))
                .addBooleanOption(new SlashCommandBooleanOption()
                    .setName("ping")
                    .setDescription("Should the bot ping @everyone?")
                    .setRequired(false))
        ] }
    )
}