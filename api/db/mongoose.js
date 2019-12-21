const mongoose = require("mongoose");

mongoose.Promise = global.Promise;
mongoose
  .connect("mongodb://localhost:27017/TaskManager", {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("mongoose connected to database :)");
  })
  .catch(e => {
    console.log("Error while attempting to connect to MongoDb");
    console.log(e);
  });

module.exports = {
  mongoose
};
