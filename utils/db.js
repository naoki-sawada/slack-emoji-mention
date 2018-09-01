const mongoose = require('mongoose');
const config = require('config');
const User = require('../model/User');

const defaultValues = {
  emoji: ['tada', 'sparkles', '+1'],
  emojiPicks: [1, 2, 3],
  responseIntervals: [1000, 2000, 3000],
  containWords: ['lgtm', 'LGTM'],
};

async function getUser(conditions) {
  try {
    return await User.findOne(conditions).exec();
  } catch (e) {
    console.log(e);
  }
}

async function insertUser(data) {
  try {
    const { teamId, userId } = data;
    const existUser = await getUser({ teamId, userId });
    if (existUser) {
      return await updateUser(existUser.__id, data);
    } else {
      return await User.create({ ...defaultValues, ...data });
    }
  } catch (e) {
    console.log(e);
  }
}

async function updateUser(conditions, update) {
  try {
    return await User.findOneAndUpdate(conditions, update).exec();
  } catch (e) {
    console.log(e);
  }
}

async function deleteUser(conditions) {
  try {
    return await User.findOneAndDelete(conditions).exec();
  } catch (e) {
    console.log(e);
  }
}

module.exports = {
  getUser,
  insertUser,
  updateUser,
  deleteUser,
};
