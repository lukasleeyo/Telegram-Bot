const { Telegraf } = require('telegraf');
const Telegram = require('telegraf/telegram');
const express = require('express');
const scraper = require('./scraper');
const bodyParser = require('body-parser');
const app = express();

const telegram = new Telegram(process.env.BOT_TOKEN);
const bot = new Telegraf(process.env.BOT_TOKEN);
// bot.telegram.setWebhook(`${process.env.BOT_DOMAIN}/bot${process.env.BOT_TOKEN}`) // comment this out when hosting on local machine
app.use(bot.webhookCallback(`/bot${process.env.BOT_TOKEN}`));
app.use(bodyParser.urlencoded({ extended: true }));

// TODO:
// 1. anyone can send a post req, so need to authorize request
// 2. for 2 hour periods, every 5 mins, if cat status changed, send msg, else, do nothing.
// at end of 2 hour period, if cat status doesnt change, send msg.
// app.post('/sms', async (req, res) => {


(async () => {
  // start scraping by logging in
  // TODO:
  // 1. retry scrapping web if login fails, happened before but rare.
  const message = await scraper.scrapWeb(process.env.WEB_LOGIN_URL);
  telegram.sendMessage(process.env.CHANNEL_ID, message).catch((err) => console.log(err));
  // process.exit(1);
})();


  //res.send('message was sent');
// });

// const port = process.env.PORT || 3000;
// app.listen(port, () => console.log(`Express server listening on port ${port}`));
