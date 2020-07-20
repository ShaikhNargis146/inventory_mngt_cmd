var readline = require('readline');
var inventory = require('./inventory.json');
var utils = require('./utils.js');
//to read I/O from CMD
rl = readline.createInterface(process.stdin, process.stdout);
var i = 0;
//for each line entered on CMD do the following
rl.on('line', function (line) {
    let input = line.split(':')
    let inventory_available = JSON.parse(JSON.stringify(inventory));
    let passport;
    if (input.length > 5) {//passport available
        passport = input.splice(1, 1)[0];
    }
    //calculate the price and left over inventory and is generic for n number of products(if its added in inventory)
    const output = getPriceWithinventory_left(inventory_available, input.splice(0, 1)[0], input, passport);
    console.log(
        `OUTPUT ${i}: ${output}`
    );
    rl.setPrompt(`INPUT ${++i}: `);
    rl.prompt();
}).on('close', function () {
    console.log('Have a great day!');
    process.exit(0);
});
rl.setPrompt(`INPUT ${++i}: `);
rl.prompt();

const getPriceWithinventory_left = (inventory_available, country, input, passport) => {
    var otherCountry = country == 'UK' ? 'Germany' : 'UK'
    let isLocalPassport = utils.isLocalPassport(otherCountry, passport);
    var i = 0;
    let total_bill = 0
    var productCount = input.length / 2
    while (productCount > 0) {
        let product = input[productCount * 2 - 2];
        let qty = input[productCount * 2 - 1];
        if (inventory_available[country][product].quantity + inventory_available[otherCountry][product].quantity < qty) {
            inventory_available = JSON.parse(JSON.stringify(inventory));
            return `OUT_OF_STOCK:${inventory_available["UK"]["Mask"].quantity}:${inventory_available["Germany"]["Mask"].quantity}:${inventory_available["UK"]["Gloves"].quantity}:${inventory_available["Germany"]["Gloves"].quantity}`;
        } else {
            if (utils.isCheaperPriceAvailable(country, otherCountry, product, passport, inventory_available)) {//if cheaper price available from other country
                const cheaperQty = qty - (qty % 10);
                const costlyQty = qty % 10;
                total_bill +=
                    inventory_available[otherCountry][product].price * cheaperQty + utils.getTansportaionCharge(cheaperQty, isLocalPassport);
                total_bill += inventory_available[country][product].price * costlyQty;
                inventory_available[country][product].quantity -= costlyQty;
                inventory_available[otherCountry][product].quantity -= cheaperQty;
            } else if (inventory_available[country][product].quantity >= qty) {//if inventory is sufficient in this country and its cheapest
                total_bill += inventory_available[country][product].price * qty;
                inventory_available[country][product].quantity -= qty;
            } else if (
                inventory_available[country][product].quantity + inventory_available[otherCountry][product].quantity >= qty
            ) {// if quantity is greater than th current country inventory and product needs to be imported
                const transportQty = qty - inventory_available[country][product].quantity;
                total_bill +=
                    inventory_available[country][product].price * inventory_available[country][product].quantity +
                    inventory_available[otherCountry][product].price * transportQty + utils.getTansportaionCharge(transportQty, isLocalPassport);
                inventory_available[country][product].quantity = 0;
                inventory_available[otherCountry][product].quantity -= transportQty;
            }
            productCount--;
        }
    }
    return `${total_bill}:${inventory_available["UK"]["Mask"].quantity}:${inventory_available["Germany"]["Mask"].quantity}:${inventory_available["UK"]["Gloves"].quantity}:${inventory_available["Germany"]["Gloves"].quantity}`;

};