class Utils {
    static isLocalPassport(country, passport) {
        return passport &&
            ((passport[0] === "B" && !isNaN(passport.substring(1, 4)) && /^[A-Z]+$/.test(passport.substring(4, 6)) && /^[A-Z0-9]+$/.test(passport.substring(6)) && country === "UK") ||
                (passport[0] === "A" && /^[A-Z]+$/.test(passport.substring(1, 3)) && /^[A-Z0-9]+$/.test(passport.substring(3)) && country === "Germany"))
    }
    static getTansportaionCharge(qty, isLocal) {
        return Math.ceil(qty / 10) * ((isLocal && 320) || 400);
    }
    static isCheaperPriceAvailable = (country, otherCountry, item, passport, inventory) => {
        var cheapPriceCountry = inventory[country][item].price > inventory[otherCountry][item].price ? otherCountry : country;
        let isLocal = this.isLocalPassport(cheapPriceCountry, passport)
        return (
            cheapPriceCountry == otherCountry &&
            inventory[country][item].price -
            inventory[cheapPriceCountry][item].price > ((isLocal && 32) || 40)
        );
    };

}


module.exports = Utils;