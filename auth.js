const ApiError = require('./error').ApiError;
const jwt = require('jsonwebtoken');
const randtoken = require('rand-token');
const HttpStatus = require('http-status-codes');
const secret = '278a5de700e29faae8e40e366ec5012b5ec63d36ec77e8a2417154cc1d25383f';

const users = [
  { id: 99794, username: 'clement@hosco.com', name: 'Clément Grimault' }
];

const checkAuth = (req, res, next) => {
  const header = req.header('Authorization');

  try {
    const [, bearer] = String(header).match(/^Bearer (.*)$/);

    jwt.verify(bearer, secret, (err, decoded) => {
      if (err) {
        return next(new ApiError('Invalid authorization', HttpStatus.FORBIDDEN, 'auth_token_invalid'));
      }
      
      req.user = decoded.user;
      next();
    });
  } catch (e) {
    next(new ApiError('No authorization token provided', HttpStatus.FORBIDDEN, 'auth_token_empty'));
  }
};

const loginUser = (username, password) => {
  if (username === 'clemgrim' && password === 'test') {
    return 99794;
  }

  return null;
};

const getUser = (id) => {
  return users.find((user) => user.id === id);
};

const createToken = (user, cb) => {
  const createdAt = new Date().getTime();
  const expires = 1000 * 60 * 60 * 24 * 30;
  const payload = { user, createdAt, exp: expires };

  jwt.sign(payload, secret, (err, token) => {
    if (err) {
      return cb(err);
    }

    cb(null, {
      token_type: 'bearer',
      access_token: token,
      expires_in: expires,
      refresh_token: randtoken.uid(256)
    });
  });
};

module.exports = {
  checkAuth,
  loginUser,
  getUser,
  createToken
};