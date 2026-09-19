const { expect } = require('chai');
const {
  createWorkflowClient,
  uniqueName,
  expectSuccess,
  createResource,
  updateResource,
  deleteResource,
  ensureNamedResource
} = require('../../helpers/workflow_helper');

describe('Helpdesk, Reports, and User Workflow Tests', function () {
  let client;
  let user;
  const cleanup = [];

  before(async function () {
    ({ client, user } = await createWorkflowClient());
  });

  it('creates and updates ticket status through the helpdesk workflow', async function () {
    const statuses = await client.get('/tickets/ticketstatus');
    expect(statuses.status).to.equal(200);
    const closeStatus = statuses.data.items?.find((item) => ['Close', 'Closed'].includes(item.text));
    if (!closeStatus?.id) {
      this.skip();
    }

    const talentGroupId = await ensureNamedResource(client, '/talentGroups', 'WF Talent Group', {
      description: 'Workflow talent group'
    });
    cleanup.push(['/talentGroups', talentGroupId]);

    const ticketIssueId = await ensureNamedResource(client, '/ticketIssues', 'WF Ticket Issue', {
      description: 'Workflow ticket issue',
      talent_group_id: talentGroupId
    });
    cleanup.push(['/ticketIssues', ticketIssueId]);

    const ticketId = await createResource(client, '/tickets', {
      issue_id: ticketIssueId,
      description: 'Workflow ticket description',
      detail: 'Workflow ticket initial note',
      asset_tag: '',
      others: ''
    });

    await updateResource(client, `/tickets/${ticketId}`, {
      status_id: closeStatus.id,
      detail: 'Workflow ticket close note'
    });

    const getRes = await client.get(`/tickets/${ticketId}`);
    expect(getRes.status).to.equal(200);
    expect(getRes.data.id).to.equal(ticketId);
  });

  it('loads all primary reports without server errors', async function () {
    const reportPaths = [
      '/reports/assets',
      '/reports/accessories',
      '/reports/licenses',
      '/reports/components',
      '/reports/consumables',
      '/reports/depreciations',
      '/reports/activity'
    ];

    for (const path of reportPaths) {
      const res = await client.get(path, {
        params: {
          limit: 5,
          offset: 0,
          page: 1
        }
      });
      expect(res.status, `${path} status`).to.be.lessThan(500);
    }
  });

  it('reads current user status without server errors', async function () {
    const res = await client.get(`/users/${user.userId}/status`);
    expect(res.status).to.equal(200);
    expect(res.data.id).to.equal(user.userId);
  });

  it('creates, edits, checks status, and deletes a user when email side effects are enabled', async function () {
    if (process.env.WORKFLOW_ENABLE_USER_CREATE !== 'true') {
      this.skip();
    }

    const companyId = await ensureNamedResource(client, '/companies', 'WF User Company');
    const locationId = await ensureNamedResource(client, '/locations', 'WF User Location');
    const groupId = await ensureNamedResource(client, '/groups', 'WF User Group', {
      permissions: { superuser: '0' }
    });
    cleanup.push(['/groups', groupId], ['/locations', locationId], ['/companies', companyId]);

    const email = `workflow-${Date.now()}@example.test`;
    const userId = await createResource(client, '/users', {
      first_name: 'Workflow',
      last_name: 'User',
      username: uniqueName('workflow-user').replace(/\s+/g, '-').toLowerCase(),
      email,
      company_id: companyId,
      location_id: locationId,
      group_id: groupId,
      permissions: { superuser: '0' },
      activated: 1
    });

    await updateResource(client, `/users/${userId}`, {
      first_name: 'Workflow',
      last_name: 'User Updated',
      username: uniqueName('workflow-user-updated').replace(/\s+/g, '-').toLowerCase(),
      email,
      company_id: companyId,
      location_id: locationId,
      group_id: groupId,
      permissions: { superuser: '0' },
      activated: 1
    });

    const status = await client.get(`/users/${userId}/status`);
    expect(status.status).to.equal(200);
    expect(status.data.id).to.equal(userId);

    await deleteResource(client, `/users/${userId}`);
  });

  after(async function () {
    if (!client) {
      return;
    }

    while (cleanup.length > 0) {
      const [path, id] = cleanup.pop();
      await client.delete(`${path}/${id}`);
    }
  });
});
