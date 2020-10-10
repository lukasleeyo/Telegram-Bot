// const { Telegraf } = require('telegraf');
const { Composer } = require('micro-bot');
const bot = new Composer;
const Telegram = require('telegraf/telegram')
const http = require('http');
const express = require('express');

const bodyParser = require('body-parser');


const telegram = new Telegram(process.env.BOT_TOKEN);
// const bot = new Telegraf('1364016845:AAEIYZHp7SD8A2BvDHl5m3r8G-I_QPqtBDA');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.post('/sms', (req, res) => {
  console.log('sms received')

  telegram.sendMessage(process.env.CHANNEL_ID, req.body.Body)



  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());

});

const port = 3000
http.createServer(app).listen(port, () => {
  console.log(`Express server listening on port ${port}`);
});



module.exports = bot;
// bot.launch();
