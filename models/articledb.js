var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var ArticleDbSchema = new Schema({

  title: {
    type: String,
    required: true
  },

  link: {
    type: String,
    required: true
  },

  note: {
    type: Schema.Types.ObjectId,
    ref: "Note"
  }
});


var Articledb = mongoose.model("Articledb", ArticleDbSchema);


module.exports = Articledb;
