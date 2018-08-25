const ApiError = require('./error').ApiError;
const jwt = require('jsonwebtoken');
const randtoken = require('rand-token');
const HttpStatus = require('http-status-codes');
const secret = '278a5de700e29faae8e40e366ec5012b5ec63d36ec77e8a2417154cc1d25383f';
const REFRESH_TOKENS = {};
const COOKIE_NAME = 'hat';

const users = [
  { id: 99794, username: 'clement@hosco.com', name: 'Clément Grimault' }
];

const getToken = (req) => {
  if (req.cookies && req.cookies[COOKIE_NAME]) {
    return req.cookies[COOKIE_NAME];
  }

  const header = req.header('Authorization');
  const matches = String(header).match(/^Bearer (.*)$/);

  return matches ? matches[1] : null;
};

const checkAuth = (req, res, next) => {
  const token = getToken(req);

  if (!token) {
    return next(new ApiError('No authorization token provided', HttpStatus.UNAUTHORIZED, 'auth_token_empty'));
  }

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return next(new ApiError('Invalid authorization', HttpStatus.UNAUTHORIZED, 'auth_token_invalid'));
    }
    
    req.user = decoded.user;
    next();
  });
};

const loginUser = (username, password) => {
  if (username === 'clement@hosco.com' && password === 'test') {
    return 99794;
  }

  return null;
};

const getUser = (id) => {
  return users.find((user) => user.id === id);
};

const createToken = (user, cb) => {
  const createdAt = Date.now() / 1000;
  const expires = createdAt + 60 * 60 * 24;
  const payload = { user };

  jwt.sign(payload, secret, (err, token) => {
    if (err) {
      return cb(err);
    }

    const refreshToken = randtoken.uid(256);
    REFRESH_TOKENS[refreshToken] = token;

    cb(null, {
      token_type: 'bearer',
      access_token: token,
      expires_in: expires,
      refresh_token: refreshToken
    });
  });
};

const getUserFromRefreshToken = (refreshToken, cb) => {
  const token = REFRESH_TOKENS[refreshToken];

  if (!token) {
    return cb(null);
  }

  jwt.verify(token, secret, { ignoreExpiration: true }, (err, decoded) => {
    if (err) {
      return cb(null);
    }
    
    cb(decoded.user);
  });
};

module.exports = {
  checkAuth,
  loginUser,
  getUser,
  createToken,
  getUserFromRefreshToken,
  COOKIE_NAME,
};
