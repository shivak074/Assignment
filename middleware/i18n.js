const i18n = require('i18n');

const languageSelect = (req, res, next) => {
  const lang = req.headers["accept-language"];

  if (lang && i18n.getLocales().includes(lang)) {
    i18n.setLocale(lang);
  } else {
    i18n.setLocale("en");
  }
  next();
};

module.exports = languageSelect;
