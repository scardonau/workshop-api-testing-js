const fetch = require('isomorphic-fetch');
const chai = require('chai');
const statusCode = require('http-status-codes');
const chaiSubset = require('chai-subset');

chai.use(chaiSubset);
const { expect } = chai;

describe('Given a user logged in GitHub using isomorphic-fetch', () => {
  const gistsUrl = 'https://api.github.com/gists';
  const authenticationHeader = {
    Authorization: `token ${process.env.ACCESS_TOKEN}`
  };

  const gistInfo = {
    description: 'this is a test gist',
    public: true,
    files: {
      file1: {
        content: 'Test contents'
      }
    }
  };

  describe('When the user creates a gist', () => {
    let gistQueryResponse;
    let createdGist;

    before(() => fetch(gistsUrl, {
      method: 'POST',
      body: JSON.stringify(gistInfo),
      headers: authenticationHeader
    }).then((response) => {
      gistQueryResponse = response;
      return response.json();
    }).then((body) => {
      createdGist = body;
    }));

    it('Then the gist should be created', () => {
      expect(gistQueryResponse.status).to.equal(statusCode.CREATED);
      expect(createdGist).to.containSubset(gistInfo);
    });

    describe('And when we try to access the gist', () => {
      let getGistQueryResponse;

      before(() => fetch(createdGist.url, {
        method: 'GET',
        headers: authenticationHeader
      }).then((response) => {
        getGistQueryResponse = response;
      }));

      it('The gist must exist', () => {
        expect(getGistQueryResponse.status).to.equal(statusCode.OK);
      });

      describe('Finally, when we delete the gist', () => {
        let deleteQueryResponse;

        before(() => fetch(createdGist.url, {
          method: 'DELETE',
          headers: authenticationHeader
        }).then((response) => {
          deleteQueryResponse = response;
        }));

        it('The gist must be deleted', () => {
          expect(deleteQueryResponse.status).to.equal(statusCode.NO_CONTENT);
        });
      });

      describe('And if we try to access the gist', () => {
        let gistNotFoundQuery;

        before(() => fetch(createdGist.url, {
          headers: authenticationHeader
        }).then((response) => {
          gistNotFoundQuery = response;
        }));

        it('The gist must not be accesible anymore', () => {
          expect(gistNotFoundQuery.status).to.equal(statusCode.NOT_FOUND);
        });
      });
    });
  });
});
