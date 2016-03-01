// So each country array has the following information:
// [
//    Country name,
//    iso2 code,
//    International dial code,
//    Format (if available),
//    Order (if >1 country with same dial code),
//    Area codes (if >1 country with same dial code)
// ]
var _ = require('lodash');

var allCountries = [
    [
        "Беларусь",
        "by",
        "375"
    ],
    [
        "Азербайджан",
        "az",
        "994"
    ],
    [
        "Индия",
        "in",
        "91"
    ],
    [
        "Россия",
        "ru",
        "7",
        "+. ... ... .. .."
    ],
    [
        "Казахстан",
        "kz",
        "77",
        "+.. ... ... .. .."
    ],
    [
        "Украина",
        "ua",
        "380"
    ],
    [
        "Великобритания",
        "gb",
        "44"
    ],
    [
        "Грузия",
        "ge",
        "9955"
    ],
    [
        "Литва",
        "lt",
        "370"
    ],
    [
        "Таджикистан",
        "tj",
        "992"
    ],
    [
        "Таиланд",
        "th",
        "66"
    ],
    [
        "Узбекистан",
        "uz",
        "998"
    ],
    [
        "Панама",
        "pa",
        "507"
    ],
    [
        "Армения",
        "am",
        "374"
    ],
    [
        "Япония",
        "jp",
        "81"
    ],
    [
        "США",
        "us",
        "1"
    ],
    [
        "Латвия",
        "lv",
        "371"
    ],
    [
        "Турция",
        "tr",
        "90"
    ],
    [
        "Молдавия",
        "md",
        "373"
    ],
    [
        "Израиль",
        "il",
        "972"
    ],
    [
        "Вьетнам",
        "vn",
        "84"
    ],
    [
        "Эстония",
        "ee",
        "372"
    ],
    [
        "Южная Корея",
        "kr",
        "82"
    ],
    [
        "Кыргызстан",
        "kg",
        "996"
    ]
];

// we will build this in the loop below
var allCountryCodes = {};
var addCountryCode = function(iso2, dialCode, priority) {
if (!(dialCode in allCountryCodes)) {
  allCountryCodes[dialCode] = [];
}
var index = priority || 0;
allCountryCodes[dialCode][index] = iso2;
};

// loop over all of the countries above
// allCountries2 = _.map(allCountries, function(country) {
//   return {
//     name: country[0],
//     iso2: country[1],
//     dialCode: country[2],
//     format: country[3],
//     hasAreaCodes: country.length > 4
//   }
// });

for (var i = 0; i < allCountries.length; i++) {
    // countries
    var c = allCountries[i];
    allCountries[i] = {
      name: c[0],
      iso2: c[1],
      dialCode: c[2],
      priority: c[4] || 0
    };
    // format
    if (c[3]) {
      allCountries[i].format = c[3];
    }

    // area codes
    if (c[5]) {
        allCountries[i].hasAreaCodes = true;
        for (var j = 0; j < c[5].length; j++) {
            // full dial code is country code + dial code
            var dialCode = c[2] + c[5][j];
            addCountryCode(c[1], dialCode);
        }
    }

    // dial codes
    addCountryCode(c[1], c[2], c[4]);
}

module.exports = {
            allCountries: allCountries,
            allCountryCodes: allCountryCodes
        };
