const crypto = require("crypto");

module.exports = (secret, data) => {
    let signature = crypto.createHmac("sha1", secret).update(data).digest("hex");
    return "sha1=" + signature;
};
