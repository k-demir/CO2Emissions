const mongoose = require('mongoose');

var CountrySchema = new mongoose.Schema({
  name: String,
  data: []
});

module.exports = mongoose.model("Country", CountrySchema);
