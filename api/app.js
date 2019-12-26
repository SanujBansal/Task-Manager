const express = require('express');
const mongoose = require('./db/mongoose');
const bodyParser = require('body-parser');
const { list, task, User } = require('./db/models');
const app = express();

/* middlewares */
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

// api's
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
          error: 'Refresh token has expired or the sessin is invalid'
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
app.listen(3000, () => {
  console.log('app is running on port 3000');
});
