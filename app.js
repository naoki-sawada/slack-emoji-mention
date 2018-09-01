'use strict';
const axios = require('axios');
const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const { WebClient } = require('@slack/client');
const shuffle = require('shuffle-array');
const mongoose = require('mongoose');
const config = require('config');
const User = require('./model/User');
const dummy = require('./lib/dummy');
const db = require('./utils/db');

mongoose.connect(`mongodb://${config.db.host}/${config.db.database}`);

const app = express();

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
    const findUser = text.match(/\<\@(.*?)\>/);
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
    console.log('Slack response: ', result.data);

    const { ok, access_token, user_id, team_name, team_id } = result.data;
    if (ok) {
      const insertUser = new User({
        userId: user_id,
        emoji: ['tada', 'sparkles', '+1'],
        emojiPicks: [1, 2, 3],
        responseIntervals: [1000, 2000, 3000],
        containWords: ['lgtm', 'LGTM'],
        teamId: team_id,
        token: access_token,
      });
      await db.insertUser(insertUser);

      const saved = await db.getUser({ userId: user_id, teamId: team_id });
      console.log('Saved: ', saved);
    }

    res.send('OK');
  } catch (e) {
    console.log(e);
    res.send(500);
  }
});

const server = http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});
