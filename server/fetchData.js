const rp = require('request-promise');
const mongoose = require('mongoose');
const Country = require('./models/country');
const LastUpdated = require('./models/lastUpdated');


const emissionsUrl = "http://api.worldbank.org/v2/country/indicator/EN.ATM.CO2E.KT?per_page=500&format=json";
const populationsUrl = "http://api.worldbank.org/v2/country/indicator/SP.POP.TOTL?per_page=500&format=json";

var countries = [];

async function fetchData() {
  rp(emissionsUrl).then(async function(body) {
    let parsedBody = JSON.parse(body);

    let lastUpdatedNew = new Date(parsedBody[0].lastupdated);
    let lastUpdatedSaved = await LastUpdated.findOne({});

    if (lastUpdatedSaved === null || lastUpdatedSaved.date === null) {
      await initData();
      await updateEmissions();
      await updatePopulations();
      new LastUpdated({
        date: lastUpdatedNew
      }).save(function(error) {
        if (error)
          console.log(error);
      })
    } else if (lastUpdatedSaved.date.getTime() != lastUpdatedNew.getTime()) {
      await LastUpdated.updateOne({}, {date: lastUpdatedNew});
      await updateEmissions();
      await updatePopulations();
    }
  });
}

async function initData() {
  let pages;

  await rp(emissionsUrl).then(async function(body) {
    let parsedBody = JSON.parse(body);
    pages = parsedBody[0].pages;
  })
  .then(async function() {
    let allCountries = [];

    for (let page = 1; page <= pages; page++) {
      await rp(emissionsUrl + "&page=" + page).then(async function(data) {
        let parsedData = JSON.parse(data);
        for (let i = 0; i < parsedData[1].length; i++) {
          let obj = parsedData[1][i];
          allCountries.push(obj.country.value);
        }

      })
    }
    return allCountries;
  })
  .then(async function(allCountries) {
    countries = allCountries.filter(function(val, idx, self) {
      return self.indexOf(val) === idx;
    })
  })
  .then(async function() {
    for (let country of countries) {
      new Country({
        name: country,
        data: []
      }).save(function(error) {
        if (error)
          console.log(error);
      })
    }
    console.log("Initialization done.")
  })
}

async function updateEmissions() {
  let pages;

  await rp(emissionsUrl).then(async function(body) {
    let parsedBody = JSON.parse(body);
    pages = parsedBody[0].pages;
  })
  .then(async function() {
    for (let page = 1; page <= pages; page++) {
      await rp(emissionsUrl + "&page=" + page).then(async function(data) {
        let parsedData = JSON.parse(data);

        for (let obj of parsedData[1]) {
          await Country.updateOne(
            {"name": obj.country.value},
            {$push: {"data": {year: obj.date, emissions: obj.value, population: null}}}
          );
        }
      });
    }
  });
  console.log("Emissions updated.");
}

async function updatePopulations() {
  let pages;

  await rp(populationsUrl).then(async function(body) {
    let parsedBody = JSON.parse(body);
    pages = parsedBody[0].pages;
  })
  .then(async function() {
    for (let page = 1; page <= pages; page++) {
      await rp(populationsUrl + "&page=" + page).then(async function(data) {
        let parsedData = JSON.parse(data);

        for (let obj of parsedData[1]) {
          await Country.updateOne(
            {"name": obj.country.value, "data.year": obj.date},
            {$set: {"data.$.population": obj.value}}
          );
        }
      });
    }
  });
  console.log("Populations updated.");
}

fetchData();
