import 'dotenv/config' // Load environment variables.
import { createServer } from 'http'
import {  Client, GatewayIntentBits, Partials } from 'discord.js'
import Akinator from './Akinator.js'
const INTENTS = Object.values(GatewayIntentBits);
const PARTIALS = Object.values(Partials);
const client = new Client({
    intents: INTENTS,
    allowedMentions: {
        parse: ["users"]
    },
    partials: PARTIALS,
    retryLimit: 3
});

client.login(process.env.token)


client.on('ready', async () => {
    console.log(client.user.tag+' İsmi ile giriş yaptım.')

    // Set bot activity.
    client.user.setActivity("/akinator")

    const commands = [{
        name: 'akinator',
        description: 'Akinator Oyunu! 🧞',

    }]

    // Deploy Global /slash commands
    await client.application.commands.set(commands)
})

client.on('interactionCreate', async (ctx) => {
    if (!ctx.isCommand()) return
    if (ctx.commandName !== 'akinator') return

    await ctx.deferReply()

    const language = "tr"
    const game = new Akinator(language)

    await game.start()
    await ctx.editReply({
        components: [game.component],
        embeds: [game.embed]
    })
    const filter = intercation => intercation.user.id === ctx.user.id
    const channel = await client.channels.fetch(ctx.channelId)

    while (!game.ended) try {
        await game.ask(channel, filter)
        if (!game.ended) await ctx.editReply({ embeds: [game.embed], components: [game.component] })
    } catch (err) {
        if (err instanceof Error) console.error(err)
        return await ctx.editReply({
            components: [],
            embeds: [],
            content: 'Bu komut zaman aşımına uğradı.'
        })
    }

    await game.stop()
    await ctx.editReply({ components: [], embeds: [game.embed] })
})
