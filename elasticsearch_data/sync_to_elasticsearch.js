
// Sync PostgreSQL to Elasticsearch
// Run with: node sync_to_elasticsearch.js

const { Client } = require('pg');
const { Client: ESClient } = require('@elastic/elasticsearch');

const pgClient = new Client({
  host: 'localhost',
  port: 5432,
  database: 'infraServices',
  user: 'dbuser',
  password: 'askdjdj!3wsed$#'
});

const esClient = new ESClient({
  node: process.env.ES_HOST || 'http://localhost:9200'
});

async function syncToElasticsearch() {
  try {
    await pgClient.connect();
    console.log('✅ Connected to PostgreSQL');

    const result = await pgClient.query(`
      SELECT 
        a.id, a.name as app_name, a.description as app_description,
        a.appteam_id, a.project_id,
        t.name as team_name, t.description as team_description,
        p.name as project_name, p.description as project_description,
        u.name as project_owner_name, u.email as project_owner_email,
        (SELECT COUNT(*) FROM appteams_users WHERE appteam_id = t.id) as team_member_count,
        (SELECT json_agg(json_build_object('id', tm.id, 'name', tm.name, 'email', tm.email))
         FROM appteams_users atu JOIN users tm ON atu.user_id = tm.id
         WHERE atu.appteam_id = t.id) as team_members
      FROM applications a
      JOIN appteams t ON a.appteam_id = t.id
      JOIN projects p ON a.project_id = p.id
      JOIN users u ON p.user_id = u.id
    `);

    const operations = result.rows.flatMap(row => {
      const teamMembers = row.team_members || [];
      const doc = {
        id: row.id,
        name: row.app_name,
        description: row.app_description,
        appteamId: row.appteam_id,
        projectId: row.project_id,
        teamName: row.team_name,
        teamDescription: row.team_description,
        teamMemberCount: parseInt(row.team_member_count),
        teamMemberNames: teamMembers.map(m => m.name),
        teamMemberEmails: teamMembers.map(m => m.email),
        projectName: row.project_name,
        projectDescription: row.project_description,
        projectOwnerName: row.project_owner_name,
        projectOwnerEmail: row.project_owner_email,
        searchText: [row.app_name, row.app_description, row.team_name, row.project_name].join(' ').toLowerCase(),
        indexedAt: new Date().toISOString()
      };

      return [
        { index: { _index: 'applications', _id: row.id.toString() } },
        doc
      ];
    });

    const bulkResponse = await esClient.bulk({ operations });
    
    if (bulkResponse.errors) {
      console.error('❌ Errors during bulk indexing');
    } else {
      console.log(`✅ Indexed ${result.rows.length} documents`);
    }

    await pgClient.end();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

syncToElasticsearch();
