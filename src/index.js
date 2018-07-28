const auth = require('./auth');
const { handleError, ApiError } = require('./error');
const compression = require('compression');
const bodyParser = require('body-parser');
const HttpStatus = require('http-status-codes');
const cors = require('cors');
const express = require('express');
const app = express();

app.use(bodyParser.json()) 
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/public', express.static(`${__dirname}/../public`));
app.use(compression());
app.use(cors());

app.get('/status', (req, res) => res.json({ success: true }));

app.post('/auth/login', (req, res, next) => {
  const { username, password } = req.body;
  const user = auth.loginUser(username, password);

  if (user) {
    auth.createToken(user, (err, result) => {
      if (err) {
        return next(new ApiError('Unable to create token', HttpStatus.INTERNAL_SERVER_ERROR, 'auth_login_error'));
      }
      
      res.json(result);
    });
  } else {
     next(new ApiError('Invalid username or password', HttpStatus.BAD_REQUEST, 'auth_login_invalid'));
  }
});

app.post('/auth/refresh-token', (req, res, next) => {
  const refreshToken = req.body.token;

  auth.getUserFromRefreshToken(refreshToken, (user) => {
    if (!user) {
      return next(new ApiError('Refresh token not found', HttpStatus.NOT_FOUND, 'auth_refresh_invalid'));
    }

    auth.createToken(user, (err, result) => {
      if (err) {
        return next(new ApiError('Unable to create token', HttpStatus.INTERNAL_SERVER_ERROR, 'auth_login_error'));
      }
      
      res.json(result);
    });
  });
});

app.get('/me', auth.checkAuth, (req, res) => {
  const user = auth.getUser(req.user);

  res.json({ result: user });
});

app.get('/articles', (req, res) => {
  let articles = require('../data/articles');

  articles = articles.map(article => {
    let { id, picture, title } = article;

    picture = req.protocol + '://' + req.headers.host + picture;

    return { id, title, picture };
  });

  res.json({ result: articles });
});

app.get('/articles/:id', (req, res) => {
  let articles = require('../data/articles');

  const id = +req.params.id;
  const article = articles.find(o => o.id === id);

  if (article) {
    const picture = req.protocol + '://' + req.headers.host + article.picture;

    return res.json({ result: { ...article, picture } });
  }
   
  res.sendStatus(404);
});

app.get('/notifications/count', auth.checkAuth, (req, res) => {
  res.json({ result: 5 });
});

app.use(handleError);

app.listen(3000);