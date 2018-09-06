const aes = require("aes256");
const { Base64 } = require("js-base64");
const fs = require("fs");
const { sprintf } = require("sprintf-js");
const logger = require("../libs/logger");

/**
 * Generate random key
 */

function generateRandomKey() {
  const key = Base64.encode(new Date().getTime());
  return key;
}
/**
 * Encrypt data
 */
function encryptData(data) {
  const fs = require("fs");

  const keystore = fs.readFileSync(
    sprintf("%s/.metadata/.keystore", process.cwd()),
    { encoding: "utf8", flag: "r" }
  );

  if (!keystore) {
    return { error: "secret key not available" };
  }
  const o = JSON.parse(keystore);

  return { success: "OK", value: aes.encrypt(o.secret, data) };
}
/**
 * Decrypt data
 */
function decryptData(data) {
  const fs = require("fs");

  const keystore = fs.readFileSync(
    sprintf("%s/.metadata/.keystore", process.cwd()),
    { encoding: "utf8", flag: "r" }
  );
  if (!keystore) {
    return { error: "secret key not available" };
  }
  const o = JSON.parse(keystore);

  return { success: "OK", value: aes.decrypt(o.secret, data) };
}
/**
 * Init cipher
 */
function aes256_create() {
  try {
    fs.accessSync(
      sprintf("%s/.metadata/.keystore", process.cwd()),
      fs.constants.F_OK
    );
    return true;
  } catch (e) {
    if (e.code == "ENOENT") {
      const key = {
        secret: generateRandomKey(),
        date: new Date().getTime()
      };
      fs.writeFileSync(
        sprintf("%s/.metadata/.keystore", process.cwd()),
        JSON.stringify(key),
        {
          encoding: "utf8",
          mode: fs.constants.S_IRWXU,
          flag: "w"
        }
      );
      return true;
    } else {
      return false;
    }
  }
}

module.exports.initCipher = () => {
  return aes256_create();
};
module.exports.encrypt = data => {
  return encryptData(data);
};
module.exports.decrypt = data => {
  return decryptData(data);
};
