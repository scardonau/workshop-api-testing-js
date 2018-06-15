const agent = require('superagent-promise')(require('superagent'), Promise);
const statusCode = require('http-status-codes');
const chai = require('chai');

const { expect } = chai;

describe('Given a user logged in github', () => {
  const userName = 'aperdomob';
  const baseUrl = 'https://api.github.com';

  let queryResponse;

  function putQuery() {
    return agent.put(`${baseUrl}/user/following/${userName}`)
      .auth('token', process.env.ACCESS_TOKEN)
      .then(response => response);
  }
  function getQuery() {
    return agent.get(`${baseUrl}/user/following`)
      .auth('token', process.env.ACCESS_TOKEN)
      .then(response => response.body);
  }

  describe(`When we try to follow ${userName}`, () => {
    before(async () => {
      queryResponse = await putQuery();
      return true;
    });

    it('Then we should get a valid response', () => {
      expect(queryResponse.statusCode).to.equal(statusCode.NO_CONTENT);
      expect(queryResponse.body).to.eql({});
    });

    let foundUser;

    before(async () => {
      const followedUsers = await getQuery();
      foundUser = followedUsers.find(user => user.login === userName);
      return true;
    });

    it(`And should be folowing ${userName}`, () => {
      expect(foundUser.login).to.equal(userName);
    });
  });

  describe('If we try to follow him again', () => {
    before(async () => {
      queryResponse = await putQuery();
      return true;
    });

    it('We can verify if put method is idempotent', () => {
      expect(queryResponse.statusCode).to.equal(statusCode.NO_CONTENT);
      expect(queryResponse.body).to.eql({});
    });

    let foundUser;

    before(async () => {
      const followedUsers = await getQuery();
      foundUser = followedUsers.find(user => user.login === userName);
      return true;
    });

    it(`And should still be folowing ${userName}`, () => {
      expect(foundUser.login).to.equal(userName);
    });
  });
});
