const mongoose = require("mongoose");
const ListSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  }
});
const list = mongoose.model("List", ListSchema);
module.exports = { list };
