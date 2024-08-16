const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const { Client, GatewayIntentBits, Events } = require('discord.js');
const app = express();
const port = 3000;


const DISCORD_TOKEN = ''; 
const SERVER_ID = '968252087341310012'; 

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMembers
    ]
});


let logs = [];


client.once(Events.ClientReady, () => {
    console.log(`Logado como ${client.user.tag}`);
});


const isServer = (guild) => guild.id === SERVER_ID;


client.on(Events.MessageCreate, message => {
    if (isServer(message.guild) && !message.author.bot) {
        logs.push({
            user: message.author.username,
            date: message.createdAt.toISOString().split('T')[0],
            time: message.createdAt.toTimeString().split(' ')[0],
            type: 'Mensagem',
            details: `Mensagem: ${message.content} em ${message.channel.name}`
        });
    }
});


client.on(Events.MessageDelete, message => {
    if (isServer(message.guild) && !message.author.bot) {
        logs.push({
            user: message.author.username,
            date: new Date().toISOString().split('T')[0],
            time: new Date().toTimeString().split(' ')[0],
            type: 'Mensagem Deletada',
            details: `Mensagem deletada em ${message.channel.name}`
        });
    }
});


client.on(Events.VoiceStateUpdate, (oldState, newState) => {
    if (isServer(newState.guild)) {
        const user = newState.member.user.tag;
        if (oldState.channelId === null && newState.channelId !== null) {
            logs.push({
                user,
                date: new Date().toISOString().split('T')[0],
                time: new Date().toTimeString().split(' ')[0],
                type: 'Entrada em Chamada',
                details: `Entrou na chamada de voz ${newState.channel.name}`
            });
        } else if (oldState.channelId !== null && newState.channelId === null) {
            logs.push({
                user,
                date: new Date().toISOString().split('T')[0],
                time: new Date().toTimeString().split(' ')[0],
                type: 'Saída de Chamada',
                details: `Saiu da chamada de voz ${oldState.channel.name}`
            });
        }
    }
});


client.on(Events.ChannelCreate, channel => {
    if (isServer(channel.guild)) {
        logs.push({
            user: 'Sistema',
            date: new Date().toISOString().split('T')[0],
            time: new Date().toTimeString().split(' ')[0],
            type: 'Canal Criado',
            details: `Canal criado: ${channel.name} (${channel.type})`
        });
    }
});

client.on(Events.ChannelDelete, channel => {
    if (isServer(channel.guild)) {
        logs.push({
            user: 'Sistema',
            date: new Date().toISOString().split('T')[0],
            time: new Date().toTimeString().split(' ')[0],
            type: 'Canal Excluído',
            details: `Canal excluído: ${channel.name} (${channel.type})`
        });
    }
});


client.on(Events.GuildMemberUpdate, (oldMember, newMember) => {
    if (isServer(newMember.guild)) {
        oldMember.roles.cache.forEach(role => {
            if (!newMember.roles.cache.has(role.id)) {
                logs.push({
                    user: newMember.user.tag,
                    date: new Date().toISOString().split('T')[0],
                    time: new Date().toTimeString().split(' ')[0],
                    type: 'Cargo Removido',
                    details: `Cargo removido: ${role.name} para ${newMember.user.tag}`
                });
            }
        });

        newMember.roles.cache.forEach(role => {
            if (!oldMember.roles.cache.has(role.id)) {
                logs.push({
                    user: newMember.user.tag,
                    date: new Date().toISOString().split('T')[0],
                    time: new Date().toTimeString().split(' ')[0],
                    type: 'Cargo Adicionado',
                    details: `Cargo adicionado: ${role.name} para ${newMember.user.tag}`
                });
            }
        });
    }
});


app.use(session({
    secret: '3avDn1729bTCMrgTZ-KEzSKXWea9-ZkY', 
    resave: false,
    saveUninitialized: true
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));


app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === '1234') {
        req.session.loggedIn = true;
        res.redirect('/logs.html');
    } else {
        res.redirect('/index.html?error=invalid');
    }
});


const checkAuth = (req, res, next) => {
    if (req.session.loggedIn) {
        next();
    } else {
        res.redirect('/index.html');
    }
};


app.get('/logs.html', checkAuth, (req, res) => {
    res.sendFile(__dirname + '/public/logs.html');
});


app.get('/api/logs/:type', checkAuth, (req, res) => {
    const type = req.params.type;
    const filteredLogs = logs.filter(log => log.type === type || type === 'all');
    res.json(filteredLogs);
});


client.login(DISCORD_TOKEN);
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
