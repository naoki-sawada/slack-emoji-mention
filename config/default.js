module.exports = {
  db: {
    host: process.env.DB_HOST || 'localhost',
    // username: process.env.DB_USERNAME || 'root',
    // password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_DATABASE || 'slack-emoji-mention',
    // port: process.env.DB_PORT || 5432,
  },
  slack: {
    clientId: process.env.SLACK_CLIENT_ID || 'xxxxx.xxxxxx',
    clientSecret: process.env.SLACK_CLIENT_SECRET || 'xxxxxxxxxxxxxxxxxxx',
  },
};
