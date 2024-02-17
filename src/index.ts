import { ButtonInteraction, ChatInputCommandInteraction, Client, GuildTextBasedChannel, Interaction, ModalMessageModalSubmitInteraction, Partials } from "discord.js";
import { deployCommands } from "./commands";
import { config } from "./config";
import { executePoll, respondToModal, respondWithModal } from "./poll";

const client = new Client({ 
    intents: ["GuildMessageReactions"],
    partials: [Partials.Reaction]
});

client.on("ready", async () => {
    console.log("\x1b[31mReady!");
    await deployCommands(client);
});

client.on("interactionCreate", async (interaction: Interaction) => {
    if (interaction.isChatInputCommand()) {
        // todo: add handling for more commands if needed in the future

        if (interaction.commandName !== "poll")
            return;

        const i = interaction as ChatInputCommandInteraction;

        if (!interaction.inGuild()) {
            await i.reply({ content: "This command can be only be ran in a guild.", ephemeral: true });
            return;
        }

        const message = i.options.get("message", true).value as string;
        const ping = i.options.get("ping", false)?.value as boolean | null ?? false;
        const channel = i.options.get("channel", false)?.channel ?? interaction.channel ?? await interaction.guild.channels.fetch(interaction.channelId);

        await executePoll(interaction, message, channel as GuildTextBasedChannel, ping);
    }

    if (interaction.isButton()) {
        const i = interaction as ButtonInteraction;
        await respondWithModal(i);
    }

    if (interaction.isModalSubmit()) {
        const i = interaction as ModalMessageModalSubmitInteraction;
        await respondToModal(i);
    }
})

client.login(config.token);