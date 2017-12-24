const Twit = require('twit');
const names = require('./names.js');
// const Poloniex = require('./poloniex');
const Bittrex = require('./bittrex');

const API_KEY = '';
const SECRET = '';

/* See Documentation on poloniex.js */
// const polo = new Poloniex(API_KEY, SECRET, 0, 0);
const bittrex = new Bittrex(API_KEY, SECRET);

const T = new Twit({
  consumer_key: '',
  consumer_secret: '',
  access_token: '',
  access_token_secret: ''
});

var stream = T.stream('user', 'officialmcafee');

stream.on('tweet', (tweet) => {
    if (tweet.retweeted || tweet.retweeted_status || tweet.in_reply_to_status_id || tweet.in_reply_to_user_id || tweet.delete) {
      console.log("McAfee just tweeted something but it is a retweet or a reply. Skipping and waiting for another tweet...")
    } else {
      console.log(new Date() + " McAfee just tweeted something!");
      checkTweet(tweet.text);
    }
})

function checkTweet(text){
  text = text.toLowerCase();
  for (var val of names) {
    if (text.includes(val.toLowerCase()) && text.toLowerCase().includes('coin of the day')) {
      console.log("The tweet includes the coin of the day info! Let's get it on..");
      console.log(`He said: ${text}`);
      console.log(`Coin of the day: ${val}`);
      bittrex.checkBalancesandBuy(val.toUpperCase());
    }
  }
}

console.log(new Date() + " Bot running. Waiting for McAfee's tweet.");

// bittrex.printMarkets()

/*
Make sure below is commented out otherwise it will go bad
Test @ works Made Purchase {"orderNumber":"91514514058","resultingTrades":[{"amount":"0.00270000","date":"2017-12-24 ","rate":"0.03711015","total":"0.00010019","tradeID":"","type":"buy"}]}
*/
// let a = 'ltc coin of the day';

checkTweet(a);
