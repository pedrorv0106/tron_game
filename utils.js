const contractAddress = "TKWeF8zjwMQA8TpZQRs5Cj9SXTbargYJFy";

const Utils = {
    tronWeb: false,
    contract: false,

    async setTronWeb(tronWeb) {
        this.tronWeb = tronWeb;
        this.contract = tronWeb.contract().at(contractAddress);
    },
};
