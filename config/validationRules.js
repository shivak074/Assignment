const validationRules = {
  User: {
    name: "required|string|min:3|max:30",
    email: "required|email",
    password: 'required|string|regex:/^(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,16}$/',
    country: "required|string|max:30",
    city: "required|string|max:30",
    companyName: "string|max:64"
  },
  Admin: {
    name: "required|string|min:3|max:30",
    email: "required|email",
    password: 'required|string|regex:/^(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,16}$/',
  },
  Login:{
    email: "required|email",
    password: 'required|string|regex:/^(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,16}$/',
  },
  TransController: {
    translations: "required|array",
    "translations.*.name": "required|string|min:3|max:100",
    "translations.*.lang": "required|string|min:2|max:10"
  },
  AccountController: {
    categoryId: "required|string",
    subCategoryId: "required|string",
    description: "string|max:100",
    translations: "required|array",
    "translations.*.name": "required|string|min:3|max:30",
    "translations.*.lang": "required|string|min:2|max:10"
  }
};

module.exports = {
  validationRules
};
