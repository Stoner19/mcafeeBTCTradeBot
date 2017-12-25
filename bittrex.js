/*
 API_KEY = the api key you recieve from the exchange poloniex;
 SECRET = the secret you recieve from the exchange poloniex;
 buyAmount = the amount of BTC you want to spend on the coin that was just tweeted about (min 0.000001);
 markup = incase another bot gets a request in faster and clears the book, this lets you send a buy with a markup. Reccomended @ should be 1.01 - 1.05;
 */

class bittrex {
    constructor(API_KEY, SECRET, buyAmount = 0.001, markup = 0.02) {
        this.buyAmount = buyAmount;
        this.bittrex  = require('node-bittrex-api');
        this.bittrex.options({
            'apikey' : API_KEY,
            'apisecret' : SECRET
        });
        this.markup = markup; //should be .01 - .05; ##IMPORTANT##
    }

    checkBalancesandBuy(val) {
        const that = this;
        this.bittrex.getbalance({ currency : 'BTC' }, function( data, err ) {
            const currencyPair = `BTC-${val}`;
            if (err) {
                console.log("Balance retrieval error: " + err.message);
            }
            if (data) {
                if (data.result.Balance >= that.buyAmount) {
                    that.bittrex.getorderbook({ market : currencyPair, type : "sell"}, function( data, err ) {
                        if (err) {
                            console.log("Order book error: " + err.message)
                        }
                        if (data) {
                            const highestAsk = data.result[0].Rate;
                            const buyPrice = highestAsk*that.markup;
                            that.buy(buyPrice, currencyPair, val);
                        }
                    });
                } else {
                    console.log("insufficient BTC")
                }
            }
        });
    }

    buy(buyPrice, currencyPair, currency) {
        const that = this;
        const amount = this.buyAmount / buyPrice;
        console.log("===== PLACING LIMIT BUY ORDER =====");
        console.log(currencyPair);
        console.log(new Date() + ` Placed order for ${amount} of ${currency} for total of ${this.buyAmount} BTC`);
        this.bittrex.buylimit({market : currencyPair, quantity : amount, rate : buyPrice}, function ( data, err ) {
            if (err) {
                console.log("Order LIMIT BUY error: " + err.message);
            }
            if (data) {
                console.log("Buy order ID: " + data.result.uuid);
                that.checkOrderAndSell(data.result.uuid,  buyPrice, currencyPair, currency);
            }
        });
    }

    checkOrderAndSell(uuid, buyPrice, currencyPair, currency) {
        const that = this;
        this.bittrex.getorder( { uuid : uuid }, function (data, err) {
            if (err) {
                console.log("Order status error: " + err.message);
            }
            if (data) {
                if (data.result.IsOpen === true) {
                    setTimeout(function() {that.checkOrderAndSell(uuid)}, 3000);
                } else {
                    that.checkBalanceAndSell( buyPrice, currencyPair, currency)
                }
            }
        })
    }

    checkBalanceAndSell(buyPrice, currencyPair, currency) {
        const that = this;
        var sellAmount = 0;
        this.bittrex.getbalance({ currency : currency }, function( data, err ) {
            if (err) {
                console.log("Balance retrieval error: " + err.message);
            }
            if (data) {
                sellAmount = data.result.Balance/2;
                that.sell(currencyPair, sellAmount, buyPrice)
            }
        });
    }

    sell(currencyPair, sellAmount, buyPrice) {
        this.bittrex.selllimit({market : currencyPair, quantity : sellAmount, rate : buyPrice*1.5}, function ( data, err ) {
            if (err) {
                console.log("Order LIMIT SELL error: " + err.message);
            }
            if (data) {
                console.log(`Placed sell order for 50% profit (at ${buyPrice*1.5}). ID: ${data.result.uuid}`);
            }
        });
        this.bittrex.selllimit({market : currencyPair, quantity : sellAmount, rate : buyPrice*1.7}, function ( data, err ) {
            if (err) {
                console.log("Order LIMIT SELL error: " + err.message);
            }
            if (data) {
                console.log(`Placed sell order for 70% profit (at ${buyPrice*1.7}). ID: ${data.result.uuid}`);
            }
        });
    }

    printMarkets() {
        this.bittrex.getmarkets(function(data, err) {
            var currencies = "";
            for (var val of data.result) {
                if (val.BaseCurrency === "BTC") {
                    currencies += '"' + val.MarketCurrency + '",'
                }
            }
            console.log(currencies)
        });
    }
}

module.exports = bittrex;
