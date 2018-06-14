const agent = require('superagent-promise')(require('superagent'), Promise);
const chai = require('chai');
const chaiSubset = require('chai-subset');
const md5 = require('md5');

chai.use(chaiSubset);
const { expect } = chai;
const baseUrl = 'https://api.github.com';
const repoContentsUrl = 'https://api.github.com/repos/aperdomob/jasmine-awesome-report/contents/';

describe('Consuming get services from github API', () => {
  const userName = 'aperdomob';

  describe(`When we get the user ${userName}`, () => {
    let user;
    const query = {
      name: 'Alejandro Perdomo',
      company: 'PSL',
      location: 'Colombia'
    };

    before(() => {
      const getUserQuery = agent.get(`${baseUrl}/users/${userName}`)
        .then((response) => {
          user = response.body;
        });

      return getUserQuery;
    });

    it('Should display information correctly', () => {
      expect(user).to.include(query);
    });
  });

  describe('When we get the repositories', () => {
    const expectedRepoName = 'jasmine-awesome-report';
    let foundRepo;
    const query = {
      name: expectedRepoName,
      description: 'An awesome html report for Jasmine',
      full_name: 'aperdomob/jasmine-awesome-report',
      private: false
    };

    before(() => {
      const getUserRepositoryQuery = agent.get(`${baseUrl}/users/${userName}/repos`)
        .then((response) => {
          const repoArray = response.body;
          foundRepo = repoArray.find(repo => repo.name === query.name);
        });

      return getUserRepositoryQuery;
    });

    it(`The ${expectedRepoName} repo should be present`, () => {
      expect(foundRepo).to.include(query);
    });
  });

  describe('When we download the repo', () => {
    const repoDownloadUrl = 'https://github.com/aperdomob/jasmine-awesome-report/archive/development.zip';
    const unexpectedMD5 = '63ed83c4d9f70dddb0be62f98946cc28';
    let repoZip;

    before(() => {
      const downloadQuery = agent.get(repoDownloadUrl)
        .buffer(true)
        .then((response) => {
          repoZip = response.text;
        });

      return downloadQuery;
    });

    it('Should match the MD5', () => {
      expect(md5(repoZip)).to.not.equal(unexpectedMD5);
    });
  });

  describe('When we get the repository files', () => {
    let contentsArray;
    let readme;
    const query = {
      name: 'README.md',
      path: 'README.md',
      sha: '9bcf2527fd5cd12ce18e457581319a349f9a56f3'
    };

    before(() => {
      const getContentsQuery = agent.get(repoContentsUrl)
        .then((response) => {
          contentsArray = response.body;
          readme = contentsArray.find(file => file.name === query.name);
        });

      return getContentsQuery;
    });

    it('Should have a readme', () => {
      expect(readme).to.containSubset(query);
    });

    describe('when we download the file', () => {
      let readmeContent;
      const expectedMD5 = '8a406064ca4738447ec522e639f828bf';

      before(() => {
        const downloadReadmeQuery = agent.get(readme.download_url)
          .then((response) => {
            readmeContent = response.text;
          });

        return downloadReadmeQuery;
      });

      it('should match the expected md5', () => {
        expect(md5(readmeContent)).to.equal(expectedMD5);
      });
    });
  });
});
