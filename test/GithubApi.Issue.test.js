const agent = require('superagent-promise')(require('superagent'), Promise);
const chai = require('chai');

const { expect } = chai;

describe('Given a user logged in Github', () => {
  const baseUrl = 'https://api.github.com';
  let user;
  let reposUrl;
  let firstRepository;

  describe('When we get the logged in user', () => {
    before(() => agent.get(`${baseUrl}/user`)
      .auth('token', process.env.ACCESS_TOKEN)
      .then((response) => {
        user = response.body;
        reposUrl = user.repos_url;
      }));

    it('Should have at least one public repo', () => {
      expect(user.public_repos).to.be.above(0);
    });
  });

  describe('When we get his repos list', () => {
    before(() => agent.get(reposUrl)
      .then((response) => {
        [firstRepository] = response.body;
      }));
    it('At least one repo must exist', () => {
      expect(firstRepository).to.have.a.property('name');
    });
  });

  describe('When we try to create an issue on the repository', () => {
    const expectedTitle = 'test issue';
    let createdIssue;

    before(() => agent.post(`${baseUrl}/repos/${user.login}/${firstRepository.name}/issues`)
      .auth('token', process.env.ACCESS_TOKEN)
      .send({ title: expectedTitle })
      .then((response) => {
        createdIssue = response.body;
      }));
    it(`Should create an issue with the title ${expectedTitle} and empty body`, () => {
      expect(createdIssue.body).to.equal(null);
      expect(createdIssue.title).to.equal(expectedTitle);
    });

    describe('And we try to modify the issue body', () => {
      const expectedBody = 'Now I have a body';
      let modifiedIssue;

      before(() => agent.patch(`${baseUrl}/repos/${user.login}/${firstRepository.name}/issues/${createdIssue.number}`)
        .auth('token', process.env.ACCESS_TOKEN)
        .send({ body: expectedBody })
        .then((response) => {
          modifiedIssue = response.body;
        }));

      it('The issue body must be correctly modified', () => {
        expect(modifiedIssue.body).to.equal(expectedBody);
        expect(modifiedIssue.title).to.equal(expectedTitle);
      });
    });
  });
});
