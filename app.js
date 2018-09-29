'use strict';
const axios = require('axios');
const express = require('express');
const http = require('http');
const httpContext = require('express-http-context');
const bodyParser = require('body-parser');
const { WebClient } = require('@slack/client');
const shuffle = require('shuffle-array');
const mongoose = require('mongoose');
const config = require('config');
const User = require('./model/User');
const dummy = require('./lib/dummy');
const db = require('./utils/db');
const crypto = require('./utils/crypto');

mongoose.connect(
  process.env.MONGODB_URI ||
    `mongodb://${config.db.host}/${config.db.database}`,
);

const app = express();
const userRouter = express.Router();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'X-Requested-With, Content-Type, Authorization',
  );
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  next();
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(httpContext.middleware);
app.use('/config', express.static('www'));
app.set('port', process.env.PORT || 3000);

app.get('/', function(req, res) {
  res.send('running');
});

app.post('/', async (req, res) => {
  try {
    const bodyText = JSON.stringify(req.body);
    dummy.echoText(bodyText);

    const { challenge } = req.body;
    if (challenge) {
      res.send(req.body);
    }

    const {
      team_id,
      event: { channel, event_ts, text },
    } = req.body;
    const findUser = text ? text.match(/\<\@(.*?)\>/) : false;
    if (channel && findUser) {
      const mentionedUser = findUser[1];
      console.log('mentionedUser: ', mentionedUser);

      const userInfo = await db.getUser({
        userId: mentionedUser,
        teamId: team_id,
      });
      if (userInfo) {
        const {
          token,
          emoji,
          emojiPicks,
          responseIntervals,
          containWords,
        } = userInfo;

        const isResponseMessage = containWords.find(word => {
          return text.includes(word);
        });

        if (isResponseMessage) {
          const web = new WebClient(token);

          const picksNum = shuffle.pick(emojiPicks);
          console.log(picksNum);
          let pickedEmoji = shuffle.pick(emoji, { picks: picksNum });

          if (!Array.isArray(pickedEmoji)) {
            pickedEmoji = [pickedEmoji];
          }

          pickedEmoji.forEach((name, index) => {
            setTimeout(() => {
              web.reactions
                .add({ name, channel, timestamp: event_ts })
                .then(res => {
                  // console.log(res);
                })
                .catch(console.error);
            }, shuffle.pick(responseIntervals));
          });
        }
      }
    }

    res.send('OK');
  } catch (e) {
    res.send('500');
    console.log(e);
  }
});

userRouter.use(async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token) {
      res.sendStatus(400);
      return;
    }

    const result = await axios({
      method: 'post',
      url: 'https://slack.com/api/auth.test',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${crypto.decrypt(token)}`,
      },
    });

    const { ok, user_id, team_id } = result.data;
    if (!ok) {
      res.sendStatus(401);
      return;
    }

    if (!user_id && !team_id) {
      res.sendStatus(500);
      return;
    }

    httpContext.set('user_id', user_id);
    httpContext.set('team_id', team_id);

    next();
  } catch (e) {
    console.log(e);
  }
});

userRouter.get('/', async (req, res) => {
  try {
    const searchCondition = {
      teamId: httpContext.get('team_id'),
      userId: httpContext.get('user_id'),
    };
    const user = await db.getUser(searchCondition);
    if (!user) {
      res.sendStatus(404);
    }

    res.send(user);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

userRouter.put('/', async (req, res) => {
  try {
    const searchCondition = {
      teamId: httpContext.get('team_id'),
      userId: httpContext.get('user_id'),
    };

    await db.updateUser(searchCondition, req.body);

    const user = await db.getUser(searchCondition);
    if (!user) {
      res.sendStatus(404);
    }

    res.send(user);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

app.use('/user', userRouter);

app.get('/redirect', async (req, res) => {
  try {
    const { code } = req.query;
    const result = await axios({
      method: 'post',
      url: 'https://slack.com/api/oauth.access',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      params: {
        client_id: config.slack.clientId,
        client_secret: config.slack.clientSecret,
        code,
      },
    });
    // console.log('Slack response: ', result.data);

    const { ok, access_token, user_id, team_name, team_id } = result.data;

    if (!ok) {
      res.send('Failed to get token.');
      return;
    }

    const user = {
      teamId: team_id,
      userId: user_id,
    };
    await db.insertUser(user);

    const saved = await db.getUser({ userId: user_id, teamId: team_id });
    // console.log('Saved: ', saved);

    res.redirect(`/config?token=${crypto.encrypt(access_token)}`);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

const server = http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});
