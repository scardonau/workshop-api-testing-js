const agent = require('superagent-promise')(require('superagent'), Promise);
const statusCode = require('http-status-codes');
const chai = require('chai');
const chaiSubset = require('chai-subset');

chai.use(chaiSubset);
const { expect } = chai;
const aperdomoGithubUrl = 'https://api.github.com/users/aperdomob';
const allReposPath = '/repos';
const repoContentsUrl = 'https://api.github.com/repos/aperdomob/jasmine-awesome-report/contents/';
// const url = 'https://api.github.com/repos/aperdomob/jasmine-awesome-report/contents';

describe('Consuming get services from github API', () => {
  it('Verify name, company and location', () => {
    const query = {
      name: 'Alejandro Perdomo',
      company: 'PSL',
      location: 'Colombia'
    };

    return agent.get(aperdomoGithubUrl)
      .then((response) => {
        expect(response.status).to.equal(statusCode.OK);
        expect(response.body).to.include(query);
      });
  });

  it('Verify attributes from a given repo', () => {
    const query = {
      name: 'jasmine-awesome-report',
      description: 'An awesome html report for Jasmine',
      full_name: 'aperdomob/jasmine-awesome-report',
      private: false
    };

    return agent.get(aperdomoGithubUrl + allReposPath)
      .then((response) => {
        expect(response.status).to.equal(statusCode.OK);
        const repoArray = response.body;
        const foundRepo = repoArray.find(repo => repo.name === query.name);
        expect(foundRepo).to.include(query);
      });
  });

  it('Verify README name, path and sha', () => {
    const query = [
      {
        name: 'README.md',
        path: 'README.md',
        sha: '9bcf2527fd5cd12ce18e457581319a349f9a56f3'
      }
    ];

    return agent.get(repoContentsUrl)
      .then((response) => {
        expect(response.status).to.equal(statusCode.OK);
        const contentsArray = response.body;
        expect(contentsArray).to.containSubset(query);
      });
  });
});
