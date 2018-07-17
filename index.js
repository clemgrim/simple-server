const auth = require('./auth');
const { handleError, ApiError } = require('./error');
const compression = require('compression');
const bodyParser = require('body-parser');
const HttpStatus = require('http-status-codes');
const express = require('express');
const app = express();

app.use(bodyParser.json()) 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(compression());

app.get('/status', (req, res) => res.json({ success: true }));

app.post('/login', (req, res, next) => {
  const { username, password } = req.body;
  const user = auth.loginUser(username, password);

  if (user) {
    auth.createToken(user, (err, result) => {
      if (err) {
        next(new ApiError('Unable to create token', HttpStatus.INTERNAL_SERVER_ERROR, 'auth_login_error'));
      } else {
        res.json(result);
      }
    });
    
  } else {
     next(new ApiError('Invalid username or password', HttpStatus.BAD_REQUEST, 'auth_login_invalid'));
  }
});

app.get('/me', auth.checkAuth, (req, res) => {
  const user = auth.getUser(req.user);

  res.json(user);
});

app.use(handleError);

app.listen(3000);