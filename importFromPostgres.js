const { Client } = require('pg');
const fs = require('fs');

// PostgreSQL connection configuration
const pgConfig = {
    host: process.env.PG_HOST || 'localhost',
    port: process.env.PG_PORT || 5432,
    database: process.env.PG_DATABASE || 'infraServices',
    user: process.env.PG_USER || 'dbuser',
    password: process.env.PG_PASSWORD || 'askdjdj!3wsed$#'
};

async function generateElasticsearchFromSQL() {
    const client = new Client(pgConfig);

    try {
        console.log('Connecting to PostgreSQL...');
        await client.connect();
        console.log('✅ Connected to PostgreSQL');

        // Query to get all applications with denormalized data
        const query = `
      SELECT 
        a.id,
        a.name as app_name,
        a.description as app_description,
        a.appteam_id,
        a.project_id,
        -- Team data
        t.name as team_name,
        t.description as team_description,
        -- Project data
        p.name as project_name,
        p.description as project_description,
        p.user_id as project_owner_id,
        -- Project owner data
        u.name as project_owner_name,
        u.email as project_owner_email,
        -- Team members (aggregated)
        (
          SELECT COUNT(*)
          FROM appteams_users atu
          WHERE atu.appteam_id = t.id
        ) as team_member_count,
        (
          SELECT json_agg(json_build_object('id', tm.id, 'name', tm.name, 'email', tm.email))
          FROM appteams_users atu2
          JOIN users tm ON atu2.user_id = tm.id
          WHERE atu2.appteam_id = t.id
        ) as team_members
      FROM applications a
      JOIN appteams t ON a.appteam_id = t.id
      JOIN projects p ON a.project_id = p.id
      JOIN users u ON p.user_id = u.id
      ORDER BY a.id;
    `;

        console.log('Fetching data from PostgreSQL...');
        const result = await client.query(query);
        console.log(`✅ Retrieved ${result.rows.length} applications`);

        // Transform to Elasticsearch bulk format
        const esBulkData = [];

        for (const row of result.rows) {
            const teamMembers = row.team_members || [];
            const teamMemberNames = teamMembers.map(m => m.name);
            const teamMemberEmails = teamMembers.map(m => m.email);
            const teamMemberIds = teamMembers.map(m => m.id);

            // Create search text for full-text search
            const searchText = [
                row.app_name,
                row.app_description,
                row.team_name,
                row.team_description,
                row.project_name,
                row.project_description,
                row.project_owner_name,
                ...teamMemberNames
            ].filter(Boolean).join(' ').toLowerCase();

            // Index action
            esBulkData.push(JSON.stringify({
                index: { _index: 'applications', _id: row.id.toString() }
            }));

            // Document data
            esBulkData.push(JSON.stringify({
                id: row.id,
                name: row.app_name,
                description: row.app_description,
                appteamId: row.appteam_id,
                projectId: row.project_id,
                // Denormalized team data
                teamName: row.team_name,
                teamDescription: row.team_description,
                teamMemberCount: parseInt(row.team_member_count),
                teamMemberIds: teamMemberIds,
                teamMemberNames: teamMemberNames,
                teamMemberEmails: teamMemberEmails,
                // Denormalized project data
                projectName: row.project_name,
                projectDescription: row.project_description,
                projectOwnerId: row.project_owner_id,
                projectOwnerName: row.project_owner_name,
                projectOwnerEmail: row.project_owner_email,
                // Full-text search field
                searchText: searchText,
                // Metadata
                indexedAt: new Date().toISOString()
            }));
        }

        // Add newline at the end (required by Elasticsearch bulk API)
        const bulkContent = esBulkData.join('\n') + '\n';

        // Create output directory
        const outputDir = './elasticsearch_data';
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Write bulk import file
        const bulkFilePath = `${outputDir}/applications_bulk.ndjson`;
        fs.writeFileSync(bulkFilePath, bulkContent);
        console.log(`✅ Generated: ${bulkFilePath}`);

        // Generate Elasticsearch index mapping
        const mapping = {
            mappings: {
                properties: {
                    id: { type: 'long' },
                    name: {
                        type: 'text',
                        fields: {
                            keyword: { type: 'keyword' }
                        }
                    },
                    description: { type: 'text' },
                    appteamId: { type: 'long' },
                    projectId: { type: 'long' },
                    // Team fields
                    teamName: {
                        type: 'text',
                        fields: {
                            keyword: { type: 'keyword' }
                        }
                    },
                    teamDescription: { type: 'text' },
                    teamMemberCount: { type: 'integer' },
                    teamMemberIds: { type: 'long' },
                    teamMemberNames: { type: 'text' },
                    teamMemberEmails: { type: 'keyword' },
                    // Project fields
                    projectName: {
                        type: 'text',
                        fields: {
                            keyword: { type: 'keyword' }
                        }
                    },
                    projectDescription: { type: 'text' },
                    projectOwnerId: { type: 'long' },
                    projectOwnerName: {
                        type: 'text',
                        fields: {
                            keyword: { type: 'keyword' }
                        }
                    },
                    projectOwnerEmail: { type: 'keyword' },
                    // Search fields
                    searchText: { type: 'text' },
                    indexedAt: { type: 'date' }
                }
            },
            settings: {
                number_of_shards: 1,
                number_of_replicas: 1,
                analysis: {
                    analyzer: {
                        default: {
                            type: 'standard'
                        }
                    }
                }
            }
        };

        const mappingFilePath = `${outputDir}/applications_mapping.json`;
        fs.writeFileSync(mappingFilePath, JSON.stringify(mapping, null, 2));
        console.log(`✅ Generated: ${mappingFilePath}`);

        // Generate sample documents for preview
        const sampleDocs = result.rows.slice(0, 5).map(row => {
            const teamMembers = row.team_members || [];
            return {
                id: row.id,
                name: row.app_name,
                description: row.app_description,
                teamName: row.team_name,
                projectName: row.project_name,
                projectOwner: row.project_owner_name,
                teamMemberCount: parseInt(row.team_member_count),
                teamMembers: teamMembers.map(m => ({ name: m.name, email: m.email }))
            };
        });

        const sampleFilePath = `${outputDir}/sample_documents.json`;
        fs.writeFileSync(sampleFilePath, JSON.stringify(sampleDocs, null, 2));
        console.log(`✅ Generated: ${sampleFilePath}`);

        // Generate import script
        const importScript = `#!/bin/bash

# Elasticsearch Import Script
# Generated on ${new Date().toISOString()}

ES_HOST=\${ES_HOST:-localhost:9200}
ES_USER=\${ES_USER:-elastic}
ES_PASSWORD=\${ES_PASSWORD:-}

echo "Elasticsearch Host: $ES_HOST"

# Check if Elasticsearch is running
if ! curl -s -f "$ES_HOST" > /dev/null 2>&1; then
    echo "❌ Error: Cannot connect to Elasticsearch at $ES_HOST"
    exit 1
fi

echo "✅ Connected to Elasticsearch"

# Delete existing index (optional - comment out if you want to keep existing data)
echo "Deleting existing index (if exists)..."
curl -X DELETE "$ES_HOST/applications" -u "$ES_USER:$ES_PASSWORD" 2>/dev/null
echo ""

# Create index with mapping
echo "Creating index with mapping..."
curl -X PUT "$ES_HOST/applications" \\
  -H "Content-Type: application/json" \\
  -u "$ES_USER:$ES_PASSWORD" \\
  -d @applications_mapping.json

echo ""
echo "✅ Index created"

# Import data using bulk API
echo "Importing documents..."
curl -X POST "$ES_HOST/_bulk" \\
  -H "Content-Type: application/x-ndjson" \\
  -u "$ES_USER:$ES_PASSWORD" \\
  --data-binary @applications_bulk.ndjson

echo ""
echo "✅ Import complete"

# Verify the import
echo "Verifying import..."
curl -X GET "$ES_HOST/applications/_count" -u "$ES_USER:$ES_PASSWORD"
echo ""

echo "✅ Done! Applications indexed successfully"
`;

        const scriptFilePath = `${outputDir}/import_to_elasticsearch.sh`;
        fs.writeFileSync(scriptFilePath, importScript);
        fs.chmodSync(scriptFilePath, '755');
        console.log(`✅ Generated: ${scriptFilePath}`);

        // Generate sample queries
        const sampleQueries = `
# Sample Elasticsearch Queries
# Use these with: curl -X POST "localhost:9200/applications/_search" -H "Content-Type: application/json" -d @query.json

# 1. Search by application name
{
  "query": {
    "match": {
      "name": "API"
    }
  }
}

# 2. Search by team name
{
  "query": {
    "match": {
      "teamName": "Platform"
    }
  }
}

# 3. Full-text search across all fields
{
  "query": {
    "multi_match": {
      "query": "authentication processing",
      "fields": ["name^3", "description^2", "searchText"]
    }
  },
  "highlight": {
    "fields": {
      "name": {},
      "description": {}
    }
  }
}

# 4. Filter by team member email
{
  "query": {
    "term": {
      "teamMemberEmails": "john.smith1@example.com"
    }
  }
}

# 5. Filter by project owner
{
  "query": {
    "match": {
      "projectOwnerName": "John Smith"
    }
  }
}

# 6. Aggregation: Applications by team
{
  "size": 0,
  "aggs": {
    "by_team": {
      "terms": {
        "field": "teamName.keyword",
        "size": 20
      },
      "aggs": {
        "avg_team_size": {
          "avg": {
            "field": "teamMemberCount"
          }
        }
      }
    }
  }
}

# 7. Aggregation: Applications by project
{
  "size": 0,
  "aggs": {
    "by_project": {
      "terms": {
        "field": "projectName.keyword",
        "size": 20
      }
    }
  }
}

# 8. Complex query: Find applications with large teams
{
  "query": {
    "bool": {
      "must": [
        {
          "match": {
            "description": "service"
          }
        }
      ],
      "filter": [
        {
          "range": {
            "teamMemberCount": {
              "gte": 5
            }
          }
        }
      ]
    }
  },
  "sort": [
    {
      "teamMemberCount": "desc"
    }
  ]
}

# 9. Search by multiple team members
{
  "query": {
    "terms": {
      "teamMemberEmails": [
        "john.smith1@example.com",
        "jane.johnson2@example.com"
      ]
    }
  }
}

# 10. Nested aggregation: Projects by owner
{
  "size": 0,
  "aggs": {
    "by_owner": {
      "terms": {
        "field": "projectOwnerName.keyword",
        "size": 10
      },
      "aggs": {
        "by_project": {
          "terms": {
            "field": "projectName.keyword",
            "size": 5
          }
        }
      }
    }
  }
}
`;

        const queriesFilePath = `${outputDir}/sample_queries.txt`;
        fs.writeFileSync(queriesFilePath, sampleQueries);
        console.log(`✅ Generated: ${queriesFilePath}`);

        // Generate Node.js script to sync data
        const syncScript = `
// Sync PostgreSQL to Elasticsearch
// Run with: node sync_to_elasticsearch.js

const { Client } = require('pg');
const { Client: ESClient } = require('@elastic/elasticsearch');

const pgClient = new Client({
  host: '${pgConfig.host}',
  port: ${pgConfig.port},
  database: '${pgConfig.database}',
  user: '${pgConfig.user}',
  password: '${pgConfig.password}'
});

const esClient = new ESClient({
  node: process.env.ES_HOST || 'http://localhost:9200'
});

async function syncToElasticsearch() {
  try {
    await pgClient.connect();
    console.log('✅ Connected to PostgreSQL');

    const result = await pgClient.query(\`
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
    \`);

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
      console.log(\`✅ Indexed \${result.rows.length} documents\`);
    }

    await pgClient.end();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

syncToElasticsearch();
`;

        const syncFilePath = `${outputDir}/sync_to_elasticsearch.js`;
        fs.writeFileSync(syncFilePath, syncScript);
        console.log(`✅ Generated: ${syncFilePath}`);

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('📊 Summary');
        console.log('='.repeat(60));
        console.log(`Total applications exported: ${result.rows.length}`);
        console.log('\n📁 Generated files:');
        console.log(`  ${bulkFilePath}`);
        console.log(`  ${mappingFilePath}`);
        console.log(`  ${sampleFilePath}`);
        console.log(`  ${scriptFilePath}`);
        console.log(`  ${queriesFilePath}`);
        console.log(`  ${syncFilePath}`);
        console.log('\n🚀 Next steps:');
        console.log('  1. Review the sample documents:');
        console.log(`     cat ${sampleFilePath}`);
        console.log('  2. Import to Elasticsearch:');
        console.log(`     cd ${outputDir} && ./import_to_elasticsearch.sh`);
        console.log('  3. Or import manually:');
        console.log('     curl -X PUT "localhost:9200/applications" -H "Content-Type: application/json" -d @applications_mapping.json');
        console.log('     curl -X POST "localhost:9200/_bulk" -H "Content-Type: application/x-ndjson" --data-binary @applications_bulk.ndjson');

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    } finally {
        await client.end();
        console.log('\n✅ PostgreSQL connection closed');
    }
}

// Run the generator
generateElasticsearchFromSQL();