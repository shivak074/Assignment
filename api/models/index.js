const Admin = require("./Admin")
const User = require("./User")
const Category = require("./Category")
const SubCategory = require("./SubCategory")
const MstCountry = require("./MstCountry")
const MstCity = require("./MstCity")
const MstCountryTrans = require("./MstCountryTrans")
const MstCityTrans = require("./MstCityTrans")
const CategoryTrans = require("./CategoryTrans")
const SubCategoryTrans = require("./SubCategoryTrans")

Category.hasMany(SubCategory, {
  foreignKey: "categoryId",
  as: "subcategories",
});

SubCategory.belongsTo(Category, {
  foreignKey: "categoryId",
  as: "category",
});

MstCountry.hasMany(MstCity, {
  foreignKey: "countryId",
  as: "cities",
});

MstCity.belongsTo(MstCountry, {
  foreignKey: "countryId",
  as: "country",
});

module.exports = {
  Admin,
  User,
  Category,
  SubCategory,
  MstCountry,
  MstCity,
  MstCountryTrans,
  MstCityTrans,
  CategoryTrans,
  SubCategoryTrans
}
