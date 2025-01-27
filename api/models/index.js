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
const Account = require('./Account');
const AccountNameTrans = require('./AccountNameTrans')

Category.hasMany(SubCategory, {
  foreignKey: "categoryId",
  as: "subcategories"
})

SubCategory.belongsTo(Category, {
  foreignKey: "categoryId",
  as: "category"
})

MstCountry.hasMany(MstCity, {
  foreignKey: "countryId",
  as: "cities"
})

MstCity.belongsTo(MstCountry, {
  foreignKey: "countryId",
  as: "country"
})

MstCountry.hasMany(MstCountryTrans, {
  foreignKey: "countryId", 
  as: "translations", 
})

MstCountryTrans.belongsTo(MstCountry, {
  foreignKey: "countryId",
  as: "country", 
})

Category.hasMany(CategoryTrans, {
  foreignKey: "categoryId",
  as: "translations"
})

CategoryTrans.belongsTo(Category, {
  foreignKey: "categoryId",
  as: "category"
})


SubCategory.hasMany(SubCategoryTrans, {
  foreignKey: "subcategoryId",
  as: "translations"
})

SubCategoryTrans.belongsTo(SubCategory, {
  foreignKey: "subcategoryId",
  as: "subCategory"
})


MstCity.hasMany(MstCityTrans, {
  foreignKey: "cityId",
  as: "translations"
})

MstCityTrans.belongsTo(MstCity, {
  foreignKey: "cityId",
  as: "city"
})

Account.belongsTo(Category, {
  foreignKey: "categoryId",
  as: "category",
});

Account.belongsTo(SubCategory, {
  foreignKey: "subCategoryId",
  as: "subcategory",
});

Account.hasMany(AccountNameTrans, {
  foreignKey: 'accountId', 
  as: 'translations'
});
AccountNameTrans.belongsTo(Account, {
  foreignKey: 'accountId', 
  as: 'account'
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
  SubCategoryTrans,
  Account,
  AccountNameTrans
}
