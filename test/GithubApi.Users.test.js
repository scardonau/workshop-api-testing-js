const agent = require('superagent-promise')(require('superagent'), Promise);
const chai = require('chai');
const responseTime = require('superagent-response-time');

const { expect } = chai;

describe('Given a user logged in github', () => {
  const usersUrl = 'https://api.github.com/users';
  describe('when gets all the users from github', () => {
    let getQueryTime;
    let allUsersResponse;

    before(async () => {
      await agent
        .get(usersUrl)
        .auth('token', process.env.ACCESS_TOKEN)
        .then((response) => {
          allUsersResponse = response;
        });

      return agent
        .get(usersUrl)
        .auth('token', process.env.ACCESS_TOKEN)
        .use(responseTime((err, time) => {
          getQueryTime = time;
        }));
    });

    it('then the response should be quick', () => {
      expect(getQueryTime).to.be.below(5000);
    });

    it('and it should bring 30 users by default', () => {
      expect(allUsersResponse.body.length).to.equal(30);
    });
  });

  describe('when we filter the users to a number of 10', () => {
    let tenUsersResponse;

    before(() => agent
      .get(usersUrl)
      .auth('token', process.env.ACCESS_TOKEN)
      .query({ per_page: 10 })
      .then((response) => {
        tenUsersResponse = response;
      }));

    it('then it should bring 10 users', () => {
      expect(tenUsersResponse.body.length).to.equal(10);
    });
  });

  describe('when we filter the users to a number of 50', () => {
    let fiftyUsersResponse;

    before(() => agent
      .get(usersUrl)
      .auth('token', process.env.ACCESS_TOKEN)
      .query({ per_page: 50 })
      .then((response) => {
        fiftyUsersResponse = response;
      }));

    it('then it should bring 50 users', () => {
      expect(fiftyUsersResponse.body.length).to.equal(50);
    });
  });
});
