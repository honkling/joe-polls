import { ActionRowBuilder, ButtonBuilder, EmbedBuilder, ModalActionRowComponentBuilder, ModalBuilder, TextInputBuilder } from "@discordjs/builders";
import { ButtonInteraction, ButtonStyle, ChatInputCommandInteraction, GuildTextBasedChannel, ModalMessageModalSubmitInteraction, TextInputStyle, User } from "discord.js"

const emojilib = require("emojilib");
const interactions = new Map<User, [string, GuildTextBasedChannel, boolean]>();
const emojis = [
    "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "zero",
    ..."abcdefghijklmnopqrst".split("").map((c) => `regional_indicator_${c}`)
].map((name: string) => [name, Object.entries(emojilib).find(([, names]: [_: string, names: string[]]) => names.includes(name) && names.includes("numbers"))]);

export async function executePoll(
    interaction: ChatInputCommandInteraction,
    message: string,
    channel: GuildTextBasedChannel,
    ping: boolean
) {
    const user = interaction.user;

    const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(new ButtonBuilder()
            .setCustomId("no_question")
            .setStyle(ButtonStyle.Secondary)
            .setLabel("No"))
        .addComponents(new ButtonBuilder()
            .setCustomId("yes_question")
            .setStyle(ButtonStyle.Primary)
            .setLabel("Yes"));
    
    interactions.set(user, [message, channel, ping]);
    await interaction.reply({ content: "Is this a yes/no question?", ephemeral: true, components: [row] });
}

export async function respondWithModal(interaction: ButtonInteraction) {
    const { user, customId } = interaction;

    if (!interactions.has(user))
        return;

    const [message, channel, ping] = interactions.get(user);

    if (customId === "yes_question") {
        await sendPoll(user, message, channel, ping, ["Yes", "No"]);
        await interaction.reply({ content: "Created poll." });
        interactions.delete(user);
        return;
    }

    const modal = new ModalBuilder()
        .setCustomId("choices")
        .setTitle("Choices")
        .addComponents(new ActionRowBuilder<ModalActionRowComponentBuilder>()
            .addComponents(new TextInputBuilder()
                .setCustomId("choices_input")
                .setLabel("Provide choices.")
                .setPlaceholder("Please provide choices, separated by line breaks.")
                .setStyle(TextInputStyle.Paragraph)));

    await interaction.showModal(modal);
}

export async function respondToModal(interaction: ModalMessageModalSubmitInteraction) {
    const { user, customId } = interaction;

    if (customId !== "choices" || !interactions.has(user))
        return;

    const [message, channel, ping] = interactions.get(user);
    const choices = interaction.fields.getTextInputValue("choices_input").split("\n");
    interactions.delete(user);

    if (choices.length > 20) {
        await interaction.reply({ content: "Due to Discord restrictions, there may not be more than 20 choices in a poll.", ephemeral: true });
        return;
    }

    await interaction.reply({ content: "Created poll." });
    await sendPoll(user, message, channel, ping, choices);
}

export async function sendPoll(
    user: User,
    message: string,
    channel: GuildTextBasedChannel,
    ping: boolean,
    choices: string[]
) {
    const indexedChoices = choices.map((c, i) => `:${emojis[i][0]}: ${c}`);
    const embed = new EmbedBuilder()
        .setAuthor({ name: `Created by ${user.username}`, iconURL: user.displayAvatarURL() })
        .setColor(0x55FF55)
        .setTitle("Poll")
        .setDescription(message)
        .addFields({ name: "Choices", value: indexedChoices.join("\n") });

    const sentMessage = await channel.send({ content: ping ? "<@&1124870561391190016>" : "", embeds: [embed] });
    
    for (let i = 0; i < choices.length; i++) {
        const emoji = emojis[i][1][0];
        sentMessage.react(emoji);
    }
}
