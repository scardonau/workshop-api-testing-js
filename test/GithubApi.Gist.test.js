const agent = require('superagent-promise')(require('superagent'), Promise);
const chai = require('chai');
const statusCode = require('http-status-codes');
const chaiSubset = require('chai-subset');

chai.use(chaiSubset);
const { expect } = chai;

describe('Given a user logged in GitHub', () => {
  const gistsUrl = 'https://api.github.com/gists';
  const query = {
    description: 'this is a test gist',
    public: true,
    files: {
      file1: {
        content: 'Test contents'
      }
    }
  };

  describe('When the user creates a gist', () => {
    let queryResponse;
    let createdGist;

    before(() => agent
      .post(gistsUrl)
      .send(query)
      .auth('token', process.env.ACCESS_TOKEN)
      .then((response) => {
        queryResponse = response;
        createdGist = response.body;
      }));

    it('Then the gist should be created', () => {
      expect(queryResponse.status).to.equal(statusCode.CREATED);
      expect(createdGist).to.containSubset(query);
    });

    describe('And when we try to access the gist', () => {
      let searchedGist;

      before(() => agent
        .get(createdGist.url)
        .auth('token', process.env.ACCESS_TOKEN)
        .then((response) => {
          searchedGist = response.body;
        }));

      it('The gist must exist', () => {
        expect(searchedGist).to.containSubset(query);
      });
    });

    describe('Finally, when we delete the gist', () => {
      let deleteQueryResponse;

      before(() => agent
        .del(createdGist.url)
        .auth('token', process.env.ACCESS_TOKEN)
        .then((response) => {
          deleteQueryResponse = response;
        }));

      it('The gist must be deleted', () => {
        expect(deleteQueryResponse.status).to.equal(statusCode.NO_CONTENT);
      });
    });

    describe('And if we try to access the gist', () => {
      let responseStatus;
      before(async () => {
        try {
          await agent
            .get(createdGist.url)
            .auth('token', process.env.ACCESS_TOKEN);
        } catch (err) {
          responseStatus = err.status;
        }
      });

      it('The gist must not be accesible anymore', () => {
        expect(responseStatus).to.equal(statusCode.NOT_FOUND);
      });
    });
  });
});
