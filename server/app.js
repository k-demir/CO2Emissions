const express = require("express");
const mongoose = require('mongoose');
const path = require("path");
require("./fetchData");
const Country = require('./models/country');

const app = express();
const port = process.env.PORT || 3001;

if (process.env.NODE_ENV === 'production') {
	app.use(express.static(path.join(__dirname, '../client/build')));
  mongoose.connect(process.env.MONGODB_URI);
} else {
  mongoose.connect("mongodb://localhost/CO2emissions", {useNewUrlParser: true});
}

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


app.get("/api/countries/:uid", async function(req, res) {
  let ret = [];
  let splitCountries = req.params.uid.split("+");
  for (let i=0; i<splitCountries.length; i++) {
    await Country.findOne({"name": splitCountries[i]}, function(err, country) {
      if (err)
        console.log(err)
      else {
        ret.push(country);
      }
    })
  }
  res.send(ret);
})

app.get("/api/countrylist", (req, res) => {
  Country.find({}, async function(err, countries) {
    if (err)
      console.log(err)
    else {
      let countrylist = []
      for (let i = 0; i < countries.length; i++) {
        countrylist.push(countries[i].name)
      }
      res.send(countrylist);
    }
  })
})

app.get('*', (req, res) => {
	res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

app.listen(port, () => console.log("Server running on port " + port));
