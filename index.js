const { Telegraf } = require('telegraf');
const Telegram = require('telegraf/telegram');
const express = require('express');
const scraper = require('./scraper');
const bodyParser = require('body-parser');
var AWS = require("aws-sdk");
const moment = require('moment-timezone');
const app = express();
var now = new moment().tz("Asia/Singapore");
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


AWS.config.update({
  region: "ap-southeast-1",
  endpoint: "https://dynamodb.ap-southeast-1.amazonaws.com"
});



(async () => {
  // start scraping by logging in
  // TODO:
  // 1. retry scrapping web if login fails, happened before but rare.
  const message = await scraper.scrapWeb(process.env.WEB_LOGIN_URL);
  // retrieve latest telegram sent message
  GetLatestSavedMessageFromDB(function (response) {
    console.log("Scraped messaged: " + message);
    console.log("Latest Telegram msg: " + response);
    if (message == response) {
      //do nothing if message is the same as latest sent telegram message
      console.log("No Sending CAT 1 for this interval");
    }
    else {
      // store msg to db
      SaveMessageToDB(message);
      // sends the new cat 1 info to the channel
      telegram.sendMessage(process.env.CHANNEL_ID, message).catch((err) => console.log(err));
    }
  });


  // process.exit(1);
})();


function GetLatestSavedMessageFromDB(callback) {
  var docClient = new AWS.DynamoDB.DocumentClient();
  var table = "Cat1Again";
  var latestTelegramMsg = '';
  var params = {
    TableName: table,
    KeyConditionExpression: "keyDate = :todayDate and keyDateTime < :currentTime",
    ExpressionAttributeValues: {
      ":todayDate": now.format("DD/MM/YYYY"),
      ":currentTime": now.format("HH:mm:ss")
    },
    ScanIndexForward: false // false for this means results will be in descending order
  };

  docClient.query(params, function (err, data) {
    if (err) {
      console.log(JSON.stringify(err, null, 2));
    } else {
      console.log(data["Items"][0]["keyDateTime"]);
      latestTelegramMsg = data["Items"][0]["message"];
      //console.log("I am here and i have it: "+ latestTelegramMsg);
      return callback(latestTelegramMsg);
    }
  });
}


function SaveMessageToDB(message) {
  var docClient = new AWS.DynamoDB.DocumentClient();
  var table = "Cat1Again";
  var teleMsg = message;
  var params = {
    TableName: table,
    Item: {
      "message": teleMsg,
      "keyDate": now.format("DD/MM/YYYY"),
      "keyDateTime": now.format("HH:mm:ss")
    }
  };

  console.log("Adding a new message to dynamodb...");

  docClient.put(params, function (err, data) {
    if (err) {
      console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
      console.log("Added item:", JSON.stringify(data, null, 2));
    }
  });
}

  //res.send('message was sent');
// });

// const port = process.env.PORT || 3000;
// app.listen(port, () => console.log(`Express server listening on port ${port}`));
