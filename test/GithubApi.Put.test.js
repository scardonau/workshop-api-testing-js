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
      .auth('token', process.env.ACCESS_TOKEN);
  }

  function getQuery() {
    return agent.get(`${baseUrl}/user/following`)
      .auth('token', process.env.ACCESS_TOKEN)
      .then(response => response.body);
  }

  describe(`When we try to follow ${userName}`, () => {
    before(async () => {
      queryResponse = await putQuery();
    });

    it('Then we should get a valid response', () => {
      expect(queryResponse.statusCode).to.equal(statusCode.NO_CONTENT);
      expect(queryResponse.body).to.eql({});
    });

    describe('And if we check the followed ussers', () => {
      let foundUser;

      before(async () => {
        const followedUsers = await getQuery();
        foundUser = followedUsers.find(user => user.login === userName);
      });

      it(`We should be following ${userName}`, () => {
        expect(foundUser.login).to.equal(userName);
      });
    });
  });

  describe('If we try to follow him again', () => {
    before(async () => {
      queryResponse = await putQuery();
    });

    it('We can verify if put method is idempotent', () => {
      expect(queryResponse.statusCode).to.equal(statusCode.NO_CONTENT);
      expect(queryResponse.body).to.eql({});
    });

    describe('And when we check the followed users', () => {
      let foundUser;

      before(async () => {
        const followedUsers = await getQuery();
        foundUser = followedUsers.find(user => user.login === userName);
      });

      it(`It should still be following ${userName}`, () => {
        expect(foundUser.login).to.equal(userName);
      });
    });
  });
});
