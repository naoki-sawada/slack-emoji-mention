'use strict'
const axios = require('axios');
const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const { WebClient } = require('@slack/client');
const shuffle = require('shuffle-array');
const dummy = require('./lib/dummy');

const DB = {
  "U0TU7LF5J": {
    token: "xoxp-27973717745-27959695188-427871202519-ea3fdbafe8853142e072ee5093586b14",
    emoji: ["tada", "miku", "sushi"],
    emojiPicks: [2, 3],
    responseIntervals: [1000, 2000],
    containWords: ["lgtm", "LGTM"],
  },
};

const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization');
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  next();
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('port', process.env.PORT || 3000);

app.get('/', function(req, res) {
  res.send('running');
});

app.post('/', function(req, res) {
  const bodyText = JSON.stringify(req.body);
  dummy.echoText(bodyText);

  const { challenge } = req.body;
  if (challenge) {
    res.send(req.body);
  }

  const { event: { channel, event_ts, text } } = req.body;
  const findUser = text.match(/\<\@(.*?)\>/);
  if (channel && findUser) {
    const mentionedUser = findUser[1];
    console.log("mentionedUser: ", mentionedUser);

    if (DB[mentionedUser]) {
      const { token, emoji, emojiPicks, responseIntervals, containWords } = DB[mentionedUser];

      const isResponseMessage = containWords.find(word => {
        return text.includes(word);
      });

      if (isResponseMessage) {
        const web = new WebClient(token);
  
        const picksNum = shuffle.pick(emojiPicks);
        console.log(picksNum);
        let pickedEmoji = shuffle.pick(emoji, { 'picks': picksNum });
        
        if (!Array.isArray(pickedEmoji)) {
          pickedEmoji = [pickedEmoji];
        }

        pickedEmoji.forEach((name, index) => {
          setTimeout(() => {
            web.reactions.add({ name, channel, timestamp: event_ts })
              .then((res) => {
                // console.log(res);
              })
              .catch(console.error);
          }, shuffle.pick(responseIntervals));
        });
      }
   
    }
  }

  res.send("OK");
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
        client_id: '27973717745.28076528854',
        client_secret: 'c1abc4b2a59533a6ee5d400157b65a79',
        code,
      },
    });
    console.log(result.data);

    const { ok, access_token, user_id, team_name, team_id } = result.data;
    if (ok) {
    }

    res.send("OK");
  } catch (e) {
    console.log(e);
    res.send(500);
  }
});

const server = http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});
