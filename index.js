require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

let lastPollMessage = null; // Store the last poll message

const emojiList = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.content.startsWith('!poll')) {
        const args = message.content.slice(5).trim().split(';');
        const pollQuestion = args[0];
        const pollOptions = args.slice(1);

        if (pollOptions.length < 2) {
            return message.reply('Please provide at least two options for the poll.');
        }

        let pollEmbed = new EmbedBuilder()
            .setTitle("📊 " + pollQuestion)
            .setDescription(pollOptions.map((option, index) => `${emojiList[index]} ${option}`).join('\n'))
            .setColor(0x00ff00);

        const pollMessage = await message.channel.send({ embeds: [pollEmbed] });

        for (let i = 0; i < pollOptions.length && i < emojiList.length; i++) {
            await pollMessage.react(emojiList[i]);
        }

        lastPollMessage = pollMessage; // Store the poll message
    }

    if (message.content.toLowerCase() === '!view') {
        if (!lastPollMessage) {
            return message.reply('No recent poll found.');
        }

        const fetchedMessage = await lastPollMessage.fetch();
        const reactions = fetchedMessage.reactions.cache;

        let results = [];
        reactions.each((reaction) => {
            if (emojiList.includes(reaction.emoji.name)) {
                results.push(`${reaction.emoji.name}: ${reaction.count - 1}`); // Subtract 1 to exclude the bot's reaction
            }
        });

        const resultEmbed = new EmbedBuilder()
            .setTitle('Poll Results')
            .setDescription(results.join('\n'))
            .setColor(0x0000ff);

        message.channel.send({ embeds: [resultEmbed] });
    }
});

client.login(process.env.DISCORD_TOKEN);