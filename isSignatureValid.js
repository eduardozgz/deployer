const crypto = require("crypto");

module.exports = (signature, secret, data) => {
  const computedSignature = `sha1=${crypto.createHmac("sha1", secret).update(data).digest("hex")}`;
  return signature === computedSignature;
};
