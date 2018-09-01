import * as axios from 'axios';

export async function getUser(token) {
  try {
    const response = await axios.get(`/user?token=${token}`);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function putUser(token, updater) {
  try {
    const response = await axios.put(`/user?token=${token}`, updater);
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
}
