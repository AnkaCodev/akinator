import { EmbedBuilder, ButtonStyle, ButtonBuilder, ActionRowBuilder } from 'discord.js'
import { Aki } from 'aki-api'

const emojis = ['👍', '👎', '❔', '🤔', '🙄', '❌']


class Akinator {
    constructor(region = 'en') {
        this.api = new Aki({ region })
    }

    get answers() {
        return this.api.answers
    }

    get question() {
        return this.api.question
    }

    get score() {
        return this.api.currentStep
    }

    get ended() {
        return this.api.progress >= 70 || this.api.currentStep >= 78
    }

    async start() {
        await this.api.start()
    }

    async stop() {
        await this.api.win()
    }

    async ask(channel, filter) {
        const collector = channel.createMessageComponentCollector({ filter, time: 30_000 })
        return new Promise((resolve, reject) => {
            collector
                .on('collect', async ctx => {
                    await ctx.deferUpdate()

                    const answer = Number(ctx.customId)

                    await this.api.step(answer)

                    collector.stop()
                })
                .on('end', (_, reason) => {
                    if (reason === 'time') {
                        reject()
                    } else {
                        resolve()
                    }
                })
        })
    }

    get embed() {
        if (this.ended) {
            const someone = this.answers[0]
            return new EmbedBuilder()
                .setTitle('Bu senin seçtiğin karakter mi?')
                .setDescription(`**${someone.name}**\n${someone.description}`)
                .setImage(someone.absolute_picture_path)
                .setColor('Yellow')
        }

        return new EmbedBuilder()
            .setTitle("Akinator - Soru Menüsü!")
            .setDescription(`**${this.score + 1}. ${this.question}**`)
            .setColor('Yellow')
            .setFooter({ text: 'Sorulara Yanıt Vermek İçin 30 Saniyen Var.' })
    }

    get component() {
        const row = new ActionRowBuilder()

        const buttons = this.answers.map((answer, index) => {
            return new ButtonBuilder()
                .setEmoji(emojis[index])
                .setLabel(answer)
                .setStyle(ButtonStyle.Secondary)
                .setCustomId(index.toString())
        })

        row.addComponents(buttons)

        return row
    }
}

export default Akinator
