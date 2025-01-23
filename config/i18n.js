const i18n = require('i18n');
const path = require("path");

i18n.configure({
  locales: ['en', 'de'], // setup some locales - other locales default to en silently
  directory: path.join(__dirname, 'locales'), // translation files are in this directory
  defaultLocale: "en", // default locale
  autoReload: true, // reload locale files if they are changed
  syncFiles: true, // if you want to reload the locale files
  objectNotation: true, // allows to use nested translation keys
  register: global, // registers the i18n function globally
});

module.exports = i18n;