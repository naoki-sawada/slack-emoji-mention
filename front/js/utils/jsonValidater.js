import * as jsonschema from 'jsonschema';

const schema = {
  id: '/SettingValidation',
  type: 'object',
  required: ['emoji', 'emojiPicks', 'responseIntervals', 'containWords'],
  properties: {
    emoji: {
      type: 'array',
      items: { type: 'string' },
      required: true,
      minItems: 1,
    },
    emojiPicks: {
      type: 'array',
      items: { type: 'number' },
      required: true,
      minItems: 1,
    },
    responseIntervals: {
      type: 'array',
      items: { type: 'number' },
      required: true,
      minItems: 1,
    },
    containWords: {
      type: 'array',
      items: { type: 'string' },
      required: true,
      minItems: 1,
    },
  },
};

const validate = source => {
  const valid = new jsonschema.Validator();
  return valid.validate(source, schema);
};

export default validate;
