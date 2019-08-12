/* eslint-env jest */
const request = require('supertest');
const { app } = require('../src/app');

describe('index', () => {
  it('should render the index file', async () => {
    const resp = await request(app)
      .get('')
      .expect(200);
    expect(resp.text).toMatch(/>Chat App</i);
  });
});
