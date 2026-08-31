const BasePlugin = require("./main-original.js");
require("./mimo-extension.js")(BasePlugin);
module.exports = BasePlugin;
