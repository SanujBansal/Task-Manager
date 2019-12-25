const mongoose = require('mongoose');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwtSecret = 'pqmkceidekfjw;fpqz:@h4@#455Gafd';

const userSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    minlength: 1,
    trim: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  sessions: [
    {
      token: {
        type: String,
        required: true
      },
      expireAt: {
        type: Number,
        required: true
      }
    }
  ]
});

userSchema.methods.toJSON = function() {
  const user = this;
  const userObject = user.toObject();

  return _.omit(userObject, ['password', 'sessions']);
};

userSchema.methods.generateAccessAuthToken = function() {
  const user = this;
  return new Promise((resolve, reject) => {
    jwt.sign(
      { _id: user._id.toHexString() },
      jwtSecret,
      { expiresIn: '15m' },
      (err, token) => {
        if (!err) {
          resolve(token);
        } else {
          reject();
        }
      }
    );
  });
};

userSchema.methods.generateRefreshAuthToken = function() {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(64, (err, buff) => {
      if (!err) {
        resolve(buff.toString('hex'));
      } else {
        reject();
      }
    });
  });
};

userSchema.methods.createSession = function() {
  let user = this;
  return user
    .generateRefreshAuthToken()
    .then(refreshToken => {
      return saveSessionToDatabase(user, refreshToken);
    })
    .then(refreshToken => {
      return refreshToken;
    })
    .catch(e => {
      return Promise.reject('Failed to save session to database. \n ' + e);
    });
};

// Model Methods --> Statics
userSchema.statics.findByIdandToken = function(_id, token) {
  const user = this;
  return user.findOne({ _id, 'session.token': token });
};
userSchema.statics.findByCredentials = (email, password) => {
  let uuser = this;
  return User.findOne({ email }).then(user => {
    if (!user) {
      return Promise.reject();
    }
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
          resolve(user);
        } else {
          reject();
        }
      });
    });
  });
};
userSchema.statics.hasRefreshTokenExpired = expiresAt => {
  let secondsSinceEpoch = Date.now() / 1000;
  if (expiresAt > secondsSinceEpoch) {
    return false;
  } else {
    return true;
  }
};
// Before a user document is saved, this code runs
userSchema.pre('save', function(next) {
  let user = this;
  let costFactor = 10;
  if (user.isModified('password')) {
    // generate salt and hash pass
    bcrypt.genSalt(costFactor, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

//Helper Methods
let saveSessionToDatabase = (user, refreshToken) => {
  return new Promise((resolve, reject) => {
    let expireAt = generateRefreshTokenExpireTime();
    user.sessions.push({ token: refreshToken, expireAt });
    user
      .save()
      .then(() => {
        return resolve(refreshToken);
      })
      .catch(e => {
        reject(e);
      });
  });
};
let generateRefreshTokenExpireTime = function() {
  let daysUntilExpire = 10;
  let secondsUntilExpire = daysUntilExpire * 24 * 60 * 60;
  return Date.now() / 1000 + secondsUntilExpire;
};
const User = mongoose.model('User', userSchema);
module.exports = { User };
