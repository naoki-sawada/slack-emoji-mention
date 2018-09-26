import { h, app } from 'hyperapp';
import queryString from 'query-string';
import { getUser, putUser } from './utils/api';

const state = {
  userSettings: {
    emoji: [],
    emojiPicks: [],
    responseIntervals: [],
    containWords: [],
  },
};

const actions = {
  setUser: value => state => ({ userSettings: value }),
  getUser: value => async (state, actions) => {
    try {
      const user = await getUser(value);
      if (user) {
        actions.setUser(user);
      }
    } catch (e) {
      console.error(e);
      window.alert(`Failed to get user data :( => ${e.message}`);
    }
  },
  putUser: value => async (state, actions) => {
    try {
      const { token, updater } = value;
      const user = await putUser(token, JSON.parse(updater));
      if (user) {
        actions.setUser(user);
        window.alert('Succeed to saved!');
      }
    } catch (e) {
      window.alert(`Failed to save :( => ${e.message}`);
    }
  },
};

const InputArea = ({ name, userSettings, putUser }) => {
  const { emoji, emojiPicks, responseIntervals, containWords } = userSettings;
  const { token } = queryString.parse(location.search);
  return (
    <div style={{ margin: '2vh' }} class={name}>
      <textarea style={{ fontSize: '2vh' }} id="textarea" rows="10" cols="80">
        {JSON.stringify({ emoji, emojiPicks, responseIntervals, containWords })}
      </textarea>
      <button
        style={{ margin: '1.5vh' }}
        onclick={() => {
          putUser({
            token,
            updater: document.getElementById('textarea').value,
          });
        }}
      >
        save
      </button>
    </div>
  );
};

const view = (state, actions) => {
  function fetchUser() {
    const { token } = queryString.parse(location.search);
    actions.getUser(token);
  }

  return (
    <div oncreate={fetchUser}>
      <h1 style={{ margin: '2vh' }}>Settings</h1>
      <InputArea userSettings={state.userSettings} putUser={actions.putUser} />
    </div>
  );
};

const main = app(state, actions, view, document.body);
