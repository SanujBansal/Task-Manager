const express = require('express');
const mongoose = require('./db/mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const { list, task, User } = require('./db/models');
const app = express();
const jwt = require('jsonwebtoken');
/* middlewares */
app.use(bodyParser.json());
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*'); // update to match the domain you will make the request from
  res.header('Access-Control-Allow-Methods', 'PATCH, GET, POST, DELETE, PUT');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, x-access-token, x-refresh-token, _id'
  );
  res.header(
    'Access-Control-Expose-Headers',
    'x-access-token, x-refresh-token'
  );
  next();
});

let authenticate = (req, res, next) => {
  let token = req.header('x-access-token');
  jwt.verify(token, User.getJWTSecret(), (err, decoded) => {
    if (err) {
      // do not authenticate
      res.status(401).send(err);
    } else {
      req.user_id = decoded._id;
      next();
    }
  });
};

// api's
app.get('/lists', authenticate, (req, res) => {
  list
    .find({
      _userId: req.user_id
    })
    .then(lists => {
      res.send(lists);
    });
});
app.post('/lists', authenticate, (req, res) => {
  //todo create a new list and return a new list doc which includes the id
  let title = req.body.title;
  let newList = new list({
    title,
    _userId: req.user_id
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
app.patch('/lists/:id', authenticate, (req, res) => {
  //todo create a new list and return a new list doc which includes the id
  list
    .findOneAndUpdate(
      { _id: req.params.id, _userId: req.user_id },
      {
        $set: req.body
      }
    )
    .then(() => {
      res.sendStatus(200);
    });
});
app.delete('/lists/:id', authenticate, (req, res) => {
  list
    .findOneAndDelete({ _id: req.params.id, _userId: req.user_id })
    .then(deletedDoc => {
      res.send(deletedDoc);
      deleteTasksFromList(deletedDoc._id);
    });
});

app.get('/lists/:listId/tasks', authenticate, (req, res) => {
  task.find({ _listId: req.params.listId }).then(tasks => {
    res.send(tasks);
  });
});

app.post('/lists/:listId/tasks', authenticate, (req, res) => {
  console.log(req.params);
  console.log(req.user_id);
  list
    .findOne({
      _id: req.params.listId,
      _userId: req.user_id
    })
    .then(list => {
      if (list) {
        return true;
      }
      return false;
    })
    .then(canCreateTask => {
      if (canCreateTask) {
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
      } else {
        res.sendStatus(404);
      }
    });
});

app.patch('/lists/:listId/tasks/:taskId', authenticate, (req, res) => {
  list
    .findOne({
      _id: req.params.listId,
      _userId: req.user_id
    })
    .then(list => {
      if (list) {
        return true;
      }
      return false;
    })
    .then(canUpdateTask => {
      if (canUpdateTask) {
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
      } else {
        res.sendStatus(404);
      }
    });
});

app.delete('/lists/:listId/tasks/:taskId', authenticate, (req, res) => {
  list
    .findOne({
      _id: req.params.listId,
      _userId: req.user_id
    })
    .then(list => {
      if (list) {
        return true;
      }
      return false;
    })
    .then(canDeleteTask => {
      if (canDeleteTask) {
        task
          .findOneAndDelete({
            _listId: req.params.listId,
            _id: req.params.taskId
          })
          .then(deleted => {
            res.send(deleted);
          });
      } else {
        res.sendStatus(404);
      }
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
let verifySession = (req, res, next) => {
  let refreshToken = req.header('x-refresh-token');
  let _id = req.header('_id');
  User.findByIdandToken(_id, refreshToken)
    .then(user => {
      if (!user) {
        return Promise.reject({
          error:
            'User not found. Make sure that the refresh token and user id are correct'
        });
      }
      req.user_id = user.id;
      req.refreshToken = refreshToken;
      req.userObject = user;
      let isSessionValid = false;
      user.sessions.forEach(session => {
        if (session.token === refreshToken) {
          console.log(session);
          if (User.hasRefreshTokenExpired(session.expiresAt) === false) {
            isSessionValid = true;
          }
        }
      });
      if (isSessionValid) {
        next();
      } else {
        return Promise.reject({
          error: 'Refresh token has expired or the session is invalid'
        });
      }
    })
    .catch(e => {
      res.status(401).send(e);
    });
};
app.get('/users/me/access-token', verifySession, (req, res) => {
  req.userObject
    .generateAccessAuthToken()
    .then(accessToken => {
      res.header('x-access-token', accessToken).send({ accessToken });
    })
    .catch(e => {
      res.status(400).send(e);
    });
});

/* HELPER METHODS */
let deleteTasksFromList = _listId => {
  task
    .deleteMany({
      _listId
    })
    .then(() => {
      console.log('tasks of list deleted');
    });
};
app.use(express.static(__dirname + '/angular-frontEnd/dist/taskManager'))
app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname + '/angular-frontEnd/dist/taskManager/index.html')); // Set index.html as layout
});
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log('app is running on port '+PORT);
});
