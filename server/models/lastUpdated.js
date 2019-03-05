const mongoose = require('mongoose');

var LastUpdatedSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: null
  }
});

module.exports = mongoose.model("LastUpdated", LastUpdatedSchema);
