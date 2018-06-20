const agent = require('superagent-promise')(require('superagent'), Promise);
const chai = require('chai');
const responseTime = require('superagent-response-time');

const { expect } = chai;

describe('When we try to get all the users from github', () => {
  const usersUrl = 'https://api.github.com/users';
  let getResponseTime;

  before(() => agent
    .get(usersUrl)
    .auth('token', process.env.ACCESS_TOKEN)
    .use(responseTime((err, time) => {
      getResponseTime = time;
    })));

  it('The response time for the request muts be lower than 5 seconds', () => {
    expect(getResponseTime).to.be.below(5000);
  });
});
