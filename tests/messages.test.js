/* eslint-env jest */
const {
  generateMessage
} = require('../src/lib/messages');

describe('messages', () => {
  describe('generateMessage()', () => {
    it('be an object', () => {
      const msg = 'hello';
      const { text, createdAt } = generateMessage(msg);
      expect(text).toBe(msg);
      expect(createdAt).toBeDefined();
    });
  });
});
