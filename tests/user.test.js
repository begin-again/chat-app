/* eslint-env jest */
const {
  addUser,
  removeUser,
  users,
  getUser,
  getUsersInRoom
} = require('../src/lib/user');

describe('Users', () => {
  beforeEach(() => {
    users.splice(0, users.length);
    expect(users).toHaveLength(0);
  });
  describe('addUser()', () => {
    it('should add new user', () => {
      const result = addUser({ id: 1, username: 'todd', room: 'fake' });
      expect(result.user).toMatchObject({
        id: 1,
        username: 'todd',
        room: 'fake'
      });
      expect(users.length).toBe(1);
    });
    it('should not add duplicate  user', () => {
      const user = { id: 1, username: 'todd', room: 'fake' };
      users.push(user);
      const result = addUser(user);
      expect(result).toMatchObject({
        error: 'username is already in use!'
      });
      expect(users).toHaveLength(1);
    });
    it('should not add empty name', () => {
      const result = addUser({ id: 1, username: '  ', room: 'fake' });
      expect(result).toMatchObject({
        error: 'username and room are required!'
      });
      expect(users).toHaveLength(0);
    });
    it('should not add empty room', () => {
      const result = addUser({ id: 1, username: 'todd', room: '' });
      expect(result).toMatchObject({
        error: 'username and room are required!'
      });
      expect(users).toHaveLength(0);
    });
    it('should trim and convert to lowercase', () => {
      const result = addUser({ id: 1, username: 'TODD ', room: 'FAKE Room ' });
      expect(result.user).toMatchObject({
        id: 1,
        username: 'todd',
        room: 'fake room'
      });
      expect(users).toHaveLength(1);
    });
  });
  describe('removeUser()', () => {
    it('should remove user', () => {
      users.push({ id: 1, username: 'todd', room: 'fake' });
      const result = removeUser(1);
      expect(result).toMatchObject({
        id: 1,
        username: 'todd',
        room: 'fake'
      });
      expect(users).toHaveLength(0);
    });
    it('should be undefined when user does not exist', () => {
      users.push({ id: 1, username: 'todd', room: 'fake' });
      const result = removeUser(2);
      expect(result).not.toBeDefined();
      expect(users).toHaveLength(1);
    });
  });
  describe('getUser()', () => {
    const fake = { id: 1, username: 'todd', room: 'fake' };
    it('should be user object', () => {
      users.push(fake);
      const user = getUser(fake.id);
      expect(user).toMatchObject({
        id: fake.id, username: fake.username, room: fake.room
      });
    });
    it('should be undefined when user not found', () => {
      users.push(fake);
      const user = getUser(fake.id + 1);
      expect(user).not.toBeDefined();
    });
  });
  describe('getUsersInRoom()', () => {
    const user1 = { id: 1, username: 'todd', room: 'room1' };
    const user2 = { id: 2, username: 'fred', room: 'room1' };
    const user3 = { id: 3, username: 'sam', room: 'room2' };
    it('should be array of user objects', () => {
      users.push(user1);
      users.push(user2);
      users.push(user3);
      const found = getUsersInRoom('ROOM1');
      expect(Array.isArray(found)).toBe(true);
      expect(found).toHaveLength(2);
    });
    it('should be an empty array when room not found', () => {
      users.push(user3);
      const found = getUsersInRoom('room1');
      expect(Array.isArray(found)).toBe(true);
      expect(found).toHaveLength(0);
    });
    it('should be an empty array when no users', () => {
      const found = getUsersInRoom('room1');
      expect(Array.isArray(found)).toBe(true);
      expect(found).toHaveLength(0);
    });
  });
});
