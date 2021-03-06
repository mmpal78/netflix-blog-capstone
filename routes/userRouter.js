const { BasicStrategy } = require('passport-http');
const express = require('express');
const jsonParser = require('body-parser').json();
const passport = require('passport');

const { User } = require('../models/userModel');

const router = express.Router();

router.use(jsonParser);

router.post('/', (req, res) => {
  if (!req.body) {
    return res.status(400).json({ message: 'No request body' });
  }

  if (!('username' in req.body)) {
    return res.status(422).json({ message: 'Missing field: username' });
  }

  let { username, password, firstName, lastName } = req.body;

  if (typeof username !== 'string') {
    return res.status(422).json({ message: 'Incorrect field type: username' });
  }

  username = username.trim();

  if (username === '') {
    return res.status(422).json({ message: 'Incorrect field length: username' });
  }

  if (!(password)) {
    return res.status(422).json({ message: 'Missing field: password' });
  }

  if (typeof password !== 'string') {
    return res.status(422).json({ message: 'Incorrect field type: password' });
  }

  password = password.trim();

  if (password === '') {
    return res.status(422).json({ message: 'Incorrect field length: password' });
  }

  // check for existing user
  return User
    .find({ username })
    .count()
    .exec()
    .then(count => {
      if (count > 0) {
        return res.status(422).json({ message: 'username already taken' });
      }
      // if no existing user, hash password
      return User.hashPassword(password)
    })
    .then(hash => {
      return User
        .create({
          username: username,
          password: hash,
          firstName: firstName,
          lastName: lastName
        })
    })
    .then(user => {
      return res.status(201).json(user.apiRepr());
    })
    .catch(err => {
      res.status(500).json({ message: 'Internal server error' })
    });
});

router.get('/me',
  passport.authenticate('basic', { session: true }),
  (req, res) => {
    console.log(req.user, 'USER in me');
    res.json({ user: req.user.apiRepr() })
  }
);


module.exports = { router };
