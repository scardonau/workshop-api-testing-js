const agent = require('superagent-promise')(require('superagent'), Promise);
const statusCode = require('http-status-codes');
const { expect } = require('chai');

describe('Given an old repo that changed name', () => {
  const oldUrl = 'https://github.com/aperdomob/redirect-test';
  const newUrl = 'https://github.com/aperdomob/new-redirect-test';

  describe('When we consult the repo via HEAD services', () => {
    let headQueryResponse;
    before(() => agent.head(oldUrl)
      .catch((err) => {
        headQueryResponse = err;
      }));

    it('the the reponse should show that the repo has a new url', () => {
      expect(headQueryResponse.status).to.equal(statusCode.MOVED_PERMANENTLY);
      expect(headQueryResponse.response.headers.location).to.equal(newUrl);
    });
  });

  describe('when we visit the old repo via GET service', () => {
    let getQueryResponse;

    before(() => agent
      .get(oldUrl)
      .then((response) => {
        getQueryResponse = response;
      }));

    it('then the repo must redirect correctly to a new url', () => {
      expect(getQueryResponse.status).to.equal(statusCode.OK);
    });
  });
});
