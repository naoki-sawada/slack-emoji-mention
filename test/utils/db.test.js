const mongoose = require('mongoose');
const config = require('config');
const User = require('../../model/User');
const db = require('../../utils/db');

const userId = 'UTEST001';
const teamId = 'TTEST001';

describe('utils', () => {
  beforeAll(async done => {
    await mongoose.connect(`mongodb://${config.db.host}/${config.db.database}`);
    done();
  });

  afterAll(async done => {
    await mongoose.connection.close();
    await mongoose.disconnect();
    done();
  });

  describe('db', () => {
    test('insertUser', async done => {
      const user = new User({
        userId,
        teamId,
        token: 'aaaaaaaaaaaa',
        emoji: ['tada', 'sparkles', '+1'],
        emojiPicks: [1, 2, 3],
        responseIntervals: [1000, 2000, 3000],
        containWords: ['lgtm', 'LGTM'],
      });
      const result = await db.insertUser(user);
      expect(result.userId).toEqual(userId);
      done();
    });

    test('getUser', async done => {
      const user = await db.getUser({ userId, teamId });
      expect(user.userId).toEqual(userId);
      done();
    });

    test('updateUser', async done => {
      const user = {
        token: 'xxxxxxxxxxxxxxx',
      };
      await db.updateUser({ userId, teamId }, user);

      const updatedItem = await db.getUser({ userId, teamId });
      expect(updatedItem.token).toEqual(user.token);

      done();
    });

    test('deleteUser', async done => {
      await db.deleteUser({ userId, teamId });

      const deletedItem = await db.getUser({ userId, teamId });
      expect(deletedItem).toEqual(null);

      done();
    });
  });
});
