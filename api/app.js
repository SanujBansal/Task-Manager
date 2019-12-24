const express = require("express");
const mongoose = require("./db/mongoose");
const bodyParser = require("body-parser");
const { list, task } = require("./db/models");


const app = express();
app.use(bodyParser.json());

app.get("/lists", (req, res) => {
  list.find({}).then(lists => {
    res.send(lists);
  });
});
app.post("/lists", (req, res) => {
  //todo create a new list and return a new list doc which includes the id
  let title = req.body.title;
  let newList = new list({
    title
  });
  newList.save().then(listDoc => {
    res.send(listDoc);
  });
});
app.patch("/lists/:id", (req, res) => {
  //todo create a new list and return a new list doc which includes the id
  list
    .findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: req.body
      }
    )
    .then(() => {
      res.sendStatus(200);
    });
});
app.delete("/lists/:id", (req, res) => {
  list.findOneAndDelete({ _id: req.params.id }).then(deletedDoc => {
    res.send(deletedDoc);
  });
});

app.get("/lists/:listId/tasks", (req, res) => {
  task.find({ _listId: req.params.listId }).then(tasks => {
    res.send(tasks);
  });
});

app.post("/lists/:listId/tasks", (req, res) => {
  let newtask = new task({
    title: req.body.title,
    _listId: req.params.listId
  });
  newtask.save().then(task => {
    res.send(task);
  });
});

app.patch("/lists/:listId/tasks/:taskId", (req, res) => {
  task
    .findOneAndUpdate(
      {
        _listId: req.params.listId,
        _id: req.params.taskId
      },
      {
        $set: req.body
      }
    )
    .then(oldTask => {
      res.send(oldTask);
    });
});

app.delete("/lists/:listId/tasks/:taskId", (req, res) => {
  task
    .findOneAndDelete({
      _listId: req.params.listId,
      _id: req.params.taskId
    })
    .then(deleted => {
      res.send(deleted);
    });
});

app.listen(3000, () => {
  console.log("app is running on port 3000");
});
