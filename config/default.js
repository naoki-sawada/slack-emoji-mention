module.exports = {
  db: {
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_DATABASE || 'slack-emoji-mention',
  },
  slack: {
    clientId: process.env.SLACK_CLIENT_ID || 'xxxxx.xxxxxx',
    clientSecret: process.env.SLACK_CLIENT_SECRET || 'xxxxxxxxxxxxxxxxxxx',
  },
};
