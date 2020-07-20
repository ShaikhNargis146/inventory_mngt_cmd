var readline = require('readline');
var inventory = require('./inventory.json');
var utils = require('./utils.js');
rl = readline.createInterface(process.stdin, process.stdout);
var i = 0;
rl.on('line', function (line) {
    let input = line.split(':')
    let inventory_available = JSON.parse(JSON.stringify(inventory));
    let passport;
    if (input.length > 5) {
        passport = input.splice(1, 1)[0];
    }
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
            let isCheaperPriceAvailable = utils.isCheaperPriceAvailable(country, otherCountry, product, passport, inventory_available);
            if (isCheaperPriceAvailable) {
                const cheaperQty = qty - (qty % 10);
                const costlyQty = qty % 10;
                const transportCharges = utils.getTansportaionCharge(cheaperQty, isLocalPassport)
                total_bill +=
                    inventory_available[otherCountry][product].price * cheaperQty + transportCharges;
                total_bill += inventory_available[country][product].price * costlyQty;
                inventory_available[country][product].quantity -= costlyQty;
                inventory_available[otherCountry][product].quantity -= cheaperQty;
            } else if (inventory_available[country][product].quantity >= qty) {
                total_bill += inventory_available[country][product].price * qty;
                inventory_available[country][product].quantity -= qty;
            } else if (
                inventory_available[country][product].quantity + inventory_available[otherCountry][product].quantity >= qty
            ) {
                const transportQty = qty - inventory_available[country][product].quantity;
                const transportationCharges = utils.getTansportaionCharge(transportQty, isLocalPassport)
                total_bill +=
                    inventory_available[country][product].price * inventory_available[country][product].quantity +
                    inventory_available[otherCountry][product].price * transportQty + transportationCharges;
                inventory_available[country][product].quantity = 0;
                inventory_available[otherCountry][product].quantity -= transportQty;
            }
            productCount--;
        }
    }
    return `${total_bill}:${inventory_available["UK"]["Mask"].quantity}:${inventory_available["Germany"]["Mask"].quantity}:${inventory_available["UK"]["Gloves"].quantity}:${inventory_available["Germany"]["Gloves"].quantity}`;

};