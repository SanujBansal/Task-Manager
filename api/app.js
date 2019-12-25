const express = require('express');
const mongoose = require('./db/mongoose');
const bodyParser = require('body-parser');
const { list, task, User } = require('./db/models');

const app = express();
app.use(bodyParser.json());
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*'); // update to match the domain you will make the request from
  res.header('Access-Control-Allow-Methods', 'PATCH, GET, POST, DELETE, PUT');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});

app.get('/lists', (req, res) => {
  list.find({}).then(lists => {
    res.send(lists);
  });
});
app.post('/lists', (req, res) => {
  //todo create a new list and return a new list doc which includes the id
  let title = req.body.title;
  let newList = new list({
    title
  });
  newList
    .save()
    .then(listDoc => {
      res.send(listDoc);
    })
    .catch(err => {
      console.log(err);
    });
});
app.patch('/lists/:id', (req, res) => {
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
app.delete('/lists/:id', (req, res) => {
  list.findOneAndDelete({ _id: req.params.id }).then(deletedDoc => {
    res.send(deletedDoc);
  });
});

app.get('/lists/:listId/tasks', (req, res) => {
  task.find({ _listId: req.params.listId }).then(tasks => {
    res.send(tasks);
  });
});

app.post('/lists/:listId/tasks', (req, res) => {
  let newtask = new task({
    title: req.body.title,
    _listId: req.params.listId
  });
  newtask
    .save()
    .then(task => {
      res.send(task);
    })
    .catch(e => {
      console.log(err);
    });
});

app.patch('/lists/:listId/tasks/:taskId', (req, res) => {
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

app.delete('/lists/:listId/tasks/:taskId', (req, res) => {
  task
    .findOneAndDelete({
      _listId: req.params.listId,
      _id: req.params.taskId
    })
    .then(deleted => {
      res.send(deleted);
    });
});

app.post('/users', (req, res) => {
  let body = req.body;
  let newUser = new User(body);

  newUser
    .save()
    .then(() => {
      return newUser.createSession();
    })
    .then(refreshToken => {
      return newUser.generateAccessAuthToken().then(accessToken => {
        return { accessToken, refreshToken };
      });
    })
    .then(authToken => {
      res
        .header('x-refresh-token', authToken.refreshToken)
        .header('x-access-token', authToken.accessToken)
        .send(newUser);
    })
    .catch(e => {
      res.status(400).send(e);
    });
});
app.post('/users/login', (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  User.findByCredentials(email, password)
    .then(user => {
      return user
        .createSession()
        .then(refreshToken => {
          return user.generateAccessAuthToken().then(accessToken => {
            return { accessToken, refreshToken };
          });
        })
        .then(authToken => {
          res
            .header('x-refresh-token', authToken.refreshToken)
            .header('x-access-token', authToken.accessToken)
            .send(user);
        });
    })
    .catch(e => {
      res.status(400).send(e);
    });
});
app.listen(3000, () => {
  console.log('app is running on port 3000');
});
