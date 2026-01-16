const fs = require('fs');

// Configuration
const CONFIG = {
    numUsers: 50,
    numTeams: 20,
    numProjects: 30,
    numApplications: 100,
    minMembersPerTeam: 2,
    maxMembersPerTeam: 8,
};

// Helper functions
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function randomElements(array, min, max) {
    const count = randomInt(min, max);
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, array.length));
}

// Sample data
const firstNames = ['John', 'Jane', 'Michael', 'Emily', 'David', 'Sarah', 'Robert', 'Lisa', 'James', 'Mary',
    'William', 'Jennifer', 'Daniel', 'Patricia', 'Christopher', 'Linda', 'Matthew', 'Barbara',
    'Andrew', 'Elizabeth', 'Ryan', 'Susan', 'Kevin', 'Jessica', 'Brian'];

const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez',
    'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor',
    'Moore', 'Jackson', 'Martin', 'Lee', 'White', 'Harris', 'Clark'];

const teamPrefixes = ['Platform', 'Infrastructure', 'Data', 'Mobile', 'Web', 'Backend', 'Frontend', 'DevOps',
    'Security', 'AI/ML', 'Analytics', 'Product', 'Growth', 'Core', 'API'];

const projectTypes = ['E-commerce', 'Analytics', 'CRM', 'ERP', 'CMS', 'Monitoring', 'Integration', 'Dashboard',
    'Portal', 'Management', 'Automation', 'Reporting', 'Social', 'Messaging', 'Marketplace'];

const appTypes = ['API', 'Service', 'Gateway', 'Worker', 'Scheduler', 'Processor', 'Handler', 'Controller',
    'Engine', 'Manager', 'Monitor', 'Tracker', 'Analyzer', 'Generator', 'Validator'];

const techStacks = ['Node.js', 'Python', 'Java', 'Go', 'Ruby', 'PHP', 'C#', '.NET', 'React', 'Angular', 'Vue'];

const domains = ['example.com', 'app.io', 'service.net', 'platform.dev', 'cloud.systems'];

// Generators
function generateUsers(count) {
    const users = [];
    for (let i = 1; i <= count; i++) {
        const firstName = randomElement(firstNames);
        const lastName = randomElement(lastNames);
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@${randomElement(domains)}`;

        users.push({
            id: i,
            name: `${firstName} ${lastName}`,
            email: email,
            password: '$2a$10$' + 'hashedpassword'.repeat(4).substring(0, 53) // Mock bcrypt hash
        });
    }
    return users;
}

function generateAppTeams(count, users) {
    const teams = [];
    for (let i = 1; i <= count; i++) {
        const memberCount = randomInt(CONFIG.minMembersPerTeam, CONFIG.maxMembersPerTeam);
        const members = randomElements(users, memberCount, memberCount);

        teams.push({
            id: i,
            name: `${randomElement(teamPrefixes)} Team ${i}`,
            description: `Team responsible for ${randomElement(techStacks)} development and ${randomElement(['infrastructure', 'features', 'maintenance', 'support', 'optimization'])}`,
            memberIds: members.map(u => u.id)
        });
    }
    return teams;
}

function generateProjects(count, users) {
    const projects = [];
    for (let i = 1; i <= count; i++) {
        const owner = randomElement(users);
        const type = randomElement(projectTypes);

        projects.push({
            id: i,
            name: `${type} Project ${i}`,
            description: `${type} system for managing ${randomElement(['customer data', 'business operations', 'user engagement', 'transactions', 'workflows', 'analytics'])}`,
            userId: owner.id
        });
    }
    return projects;
}

function generateApplications(count, teams, projects) {
    const applications = [];

    for (let i = 1; i <= count; i++) {
        const team = randomElement(teams);
        const project = randomElement(projects);
        const appType = randomElement(appTypes);
        const tech = randomElement(techStacks);

        applications.push({
            id: i,
            name: `${project.name.split(' ')[0]} ${appType} ${i}`,
            description: `${appType} service built with ${tech} for ${project.name}. Handles ${randomElement(['authentication', 'data processing', 'file uploads', 'notifications', 'payments', 'reporting', 'integrations', 'webhooks'])}`,
            appteamId: team.id,
            projectId: project.id
        });
    }
    return applications;
}

// Generate datasets
console.log('Generating datasets...');

const users = generateUsers(CONFIG.numUsers);
const teams = generateAppTeams(CONFIG.numTeams, users);
const projects = generateProjects(CONFIG.numProjects, users);
const applications = generateApplications(CONFIG.numApplications, teams, projects);

// Create output directory
const outputDir = './generated_data';
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Save as JSON files
fs.writeFileSync(`${outputDir}/users.json`, JSON.stringify(users, null, 2));
fs.writeFileSync(`${outputDir}/teams.json`, JSON.stringify(teams, null, 2));
fs.writeFileSync(`${outputDir}/projects.json`, JSON.stringify(projects, null, 2));
fs.writeFileSync(`${outputDir}/applications.json`, JSON.stringify(applications, null, 2));

// Generate PostgreSQL seed file matching JPA entity structure
const pgSeed = `
-- Drop tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS appteams_users CASCADE;
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS appteams CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table (matches User entity)
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255)
);

-- AppTeams table (matches AppTeam entity)
CREATE TABLE appteams (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT
);

-- Projects table (matches Project entity)
CREATE TABLE projects (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL
);

-- Applications table (matches Application entity)
CREATE TABLE applications (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  appteam_id BIGINT REFERENCES appteams(id) ON DELETE SET NULL,
  project_id BIGINT REFERENCES projects(id) ON DELETE SET NULL
);

-- AppTeams-Users junction table (matches @JoinTable in AppTeam entity)
CREATE TABLE appteams_users (
  appteam_id BIGINT NOT NULL REFERENCES appteams(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (appteam_id, user_id)
);

-- Create indexes for foreign keys (improves query performance)
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_applications_appteam_id ON applications(appteam_id);
CREATE INDEX idx_applications_project_id ON applications(project_id);
CREATE INDEX idx_appteams_users_appteam_id ON appteams_users(appteam_id);
CREATE INDEX idx_appteams_users_user_id ON appteams_users(user_id);

-- Insert Users
${users.map(u => `INSERT INTO users (id, name, email, password) VALUES (${u.id}, '${u.name.replace(/'/g, "''")}', '${u.email}', '${u.password}');`).join('\n')}

-- Insert AppTeams
${teams.map(t => `INSERT INTO appteams (id, name, description) VALUES (${t.id}, '${t.name.replace(/'/g, "''")}', '${t.description.replace(/'/g, "''")}');`).join('\n')}

-- Insert Projects
${projects.map(p => `INSERT INTO projects (id, name, description, user_id) VALUES (${p.id}, '${p.name.replace(/'/g, "''")}', '${p.description.replace(/'/g, "''")}', ${p.userId});`).join('\n')}

-- Insert Applications
${applications.map(a => `INSERT INTO applications (id, name, description, appteam_id, project_id) VALUES (${a.id}, '${a.name.replace(/'/g, "''")}', '${a.description.replace(/'/g, "''")}', ${a.appteamId}, ${a.projectId});`).join('\n')}

-- Insert AppTeam-User relationships
${teams.flatMap(t => t.memberIds.map(memberId => `INSERT INTO appteams_users (appteam_id, user_id) VALUES (${t.id}, ${memberId});`)).join('\n')}

-- Reset sequences to continue from max ID
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('appteams_id_seq', (SELECT MAX(id) FROM appteams));
SELECT setval('projects_id_seq', (SELECT MAX(id) FROM projects));
SELECT setval('applications_id_seq', (SELECT MAX(id) FROM applications));

-- Verify data
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'AppTeams', COUNT(*) FROM appteams
UNION ALL
SELECT 'Projects', COUNT(*) FROM projects
UNION ALL
SELECT 'Applications', COUNT(*) FROM applications
UNION ALL
SELECT 'Team Members', COUNT(*) FROM appteams_users;
`;

fs.writeFileSync(`${outputDir}/postgres_seed.sql`, pgSeed);

// Generate Elasticsearch bulk import file with denormalized data
const esBulk = applications.flatMap(app => {
    const team = teams.find(t => t.id === app.appteamId);
    const project = projects.find(p => p.id === app.projectId);
    const projectOwner = users.find(u => u.id === project.userId);
    const teamMembers = users.filter(u => team.memberIds.includes(u.id));

    return [
        JSON.stringify({ index: { _index: 'applications', _id: app.id.toString() } }),
        JSON.stringify({
            id: app.id,
            name: app.name,
            description: app.description,
            appteamId: app.appteamId,
            projectId: app.projectId,
            // Denormalized data for search
            teamName: team.name,
            teamDescription: team.description,
            projectName: project.name,
            projectDescription: project.description,
            projectOwnerName: projectOwner.name,
            projectOwnerEmail: projectOwner.email,
            teamMemberCount: teamMembers.length,
            teamMemberNames: teamMembers.map(m => m.name),
            teamMemberEmails: teamMembers.map(m => m.email),
            // Full-text search field
            searchText: `${app.name} ${app.description} ${team.name} ${project.name} ${projectOwner.name}`.toLowerCase()
        })
    ];
}).join('\n') + '\n';

fs.writeFileSync(`${outputDir}/elasticsearch_bulk.ndjson`, esBulk);

// Generate Elasticsearch index mapping
const esMapping = `
PUT /applications
{
  "mappings": {
    "properties": {
      "id": { "type": "long" },
      "name": { 
        "type": "text",
        "fields": {
          "keyword": { "type": "keyword" }
        }
      },
      "description": { "type": "text" },
      "appteamId": { "type": "long" },
      "projectId": { "type": "long" },
      "teamName": { 
        "type": "text",
        "fields": {
          "keyword": { "type": "keyword" }
        }
      },
      "teamDescription": { "type": "text" },
      "projectName": { 
        "type": "text",
        "fields": {
          "keyword": { "type": "keyword" }
        }
      },
      "projectDescription": { "type": "text" },
      "projectOwnerName": { 
        "type": "text",
        "fields": {
          "keyword": { "type": "keyword" }
        }
      },
      "projectOwnerEmail": { "type": "keyword" },
      "teamMemberCount": { "type": "integer" },
      "teamMemberNames": { "type": "text" },
      "teamMemberEmails": { "type": "keyword" },
      "searchText": { "type": "text" }
    }
  }
}
`;

fs.writeFileSync(`${outputDir}/elasticsearch_mapping.txt`, esMapping);

// Generate sample queries for both databases
const sampleQueries = `
-- ========================================
-- PostgreSQL Sample Queries (ACID)
-- ========================================

-- 1. Get application with team and project details (JOIN)
SELECT 
    a.id,
    a.name as app_name,
    a.description as app_description,
    t.name as team_name,
    p.name as project_name,
    u.name as project_owner
FROM applications a
JOIN appteams t ON a.appteam_id = t.id
JOIN projects p ON a.project_id = p.id
JOIN users u ON p.user_id = u.id
WHERE a.id = 1;

-- 2. Get all applications for a team with member details
SELECT 
    a.id,
    a.name as app_name,
    t.name as team_name,
    COUNT(DISTINCT atu.user_id) as member_count,
    STRING_AGG(DISTINCT u.name, ', ') as members
FROM applications a
JOIN appteams t ON a.appteam_id = t.id
LEFT JOIN appteams_users atu ON t.id = atu.appteam_id
LEFT JOIN users u ON atu.user_id = u.id
WHERE t.id = 1
GROUP BY a.id, a.name, t.name;

-- 3. Get projects with application count
SELECT 
    p.id,
    p.name as project_name,
    u.name as owner,
    COUNT(a.id) as application_count
FROM projects p
JOIN users u ON p.user_id = u.id
LEFT JOIN applications a ON p.id = a.project_id
GROUP BY p.id, p.name, u.name
ORDER BY application_count DESC;

-- 4. Find users and their team memberships
SELECT 
    u.id,
    u.name,
    u.email,
    COUNT(DISTINCT atu.appteam_id) as team_count,
    STRING_AGG(DISTINCT t.name, ', ') as teams
FROM users u
LEFT JOIN appteams_users atu ON u.id = atu.user_id
LEFT JOIN appteams t ON atu.appteam_id = t.id
GROUP BY u.id, u.name, u.email
ORDER BY team_count DESC;

-- 5. ACID Transaction: Create new application with validation
BEGIN;
    -- Lock the project and team to ensure they exist
    SELECT id FROM projects WHERE id = 1 FOR UPDATE;
    SELECT id FROM appteams WHERE id = 1 FOR UPDATE;
    
    -- Insert the application
    INSERT INTO applications (name, description, appteam_id, project_id)
    VALUES ('New API Service', 'Handles authentication and authorization', 1, 1)
    RETURNING id;
    
    -- Could add audit log here
COMMIT;

-- 6. Get team workload (applications per team)
SELECT 
    t.id,
    t.name as team_name,
    COUNT(a.id) as app_count,
    COUNT(DISTINCT atu.user_id) as member_count
FROM appteams t
LEFT JOIN applications a ON t.id = a.appteam_id
LEFT JOIN appteams_users atu ON t.id = atu.appteam_id
GROUP BY t.id, t.name
ORDER BY app_count DESC;

-- 7. Find applications by project owner
SELECT 
    a.id,
    a.name as app_name,
    p.name as project_name,
    u.name as project_owner,
    t.name as team_name
FROM applications a
JOIN projects p ON a.project_id = p.id
JOIN users u ON p.user_id = u.id
JOIN appteams t ON a.appteam_id = t.id
WHERE u.email = 'john.smith1@example.com';

-- 8. Get team collaboration (teams working on same projects)
SELECT 
    t1.name as team1,
    t2.name as team2,
    p.name as shared_project,
    COUNT(*) as apps_count
FROM applications a1
JOIN applications a2 ON a1.project_id = a2.project_id AND a1.appteam_id < a2.appteam_id
JOIN appteams t1 ON a1.appteam_id = t1.id
JOIN appteams t2 ON a2.appteam_id = t2.id
JOIN projects p ON a1.project_id = p.id
GROUP BY t1.name, t2.name, p.name;


-- ========================================
-- Elasticsearch Sample Queries
-- ========================================

-- 1. Full-text search across applications
POST /applications/_search
{
  "query": {
    "multi_match": {
      "query": "authentication api",
      "fields": ["name^3", "description^2", "searchText"],
      "type": "best_fields"
    }
  },
  "highlight": {
    "fields": {
      "name": {},
      "description": {}
    }
  }
}

-- 2. Filter applications by team
POST /applications/_search
{
  "query": {
    "term": {
      "appteamId": 1
    }
  }
}

-- 3. Search by project owner
POST /applications/_search
{
  "query": {
    "match": {
      "projectOwnerName": "John Smith"
    }
  }
}

-- 4. Aggregation: Applications by team
POST /applications/_search
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

-- 5. Aggregation: Applications by project
POST /applications/_search
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

-- 6. Complex search: Find applications by team member email
POST /applications/_search
{
  "query": {
    "term": {
      "teamMemberEmails": "john.smith1@example.com"
    }
  }
}

-- 7. Fuzzy search for typos
POST /applications/_search
{
  "query": {
    "fuzzy": {
      "name": {
        "value": "authntication",
        "fuzziness": "AUTO"
      }
    }
  }
}

-- 8. Combined filters and search
POST /applications/_search
{
  "query": {
    "bool": {
      "must": [
        {
          "match": {
            "description": "processing"
          }
        }
      ],
      "filter": [
        {
          "term": {
            "appteamId": 1
          }
        },
        {
          "range": {
            "teamMemberCount": {
              "gte": 3
            }
          }
        }
      ]
    }
  }
}

-- 9. Nested aggregation: Projects by owner with app count
POST /applications/_search
{
  "size": 0,
  "aggs": {
    "by_owner": {
      "terms": {
        "field": "projectOwnerName.keyword"
      },
      "aggs": {
        "by_project": {
          "terms": {
            "field": "projectName.keyword"
          }
        }
      }
    }
  }
}

-- 10. Search with suggestions (for autocomplete)
POST /applications/_search
{
  "suggest": {
    "app-suggest": {
      "prefix": "api",
      "completion": {
        "field": "name.keyword"
      }
    }
  }
}
`;

fs.writeFileSync(`${outputDir}/sample_queries.txt`, sampleQueries);

// Generate Spring Boot Repository examples
const springRepos = `
package br.edu.infnet.infraapiproject.repository;

import br.edu.infnet.infraapiproject.model.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    
    // Find by team
    List<Application> findByTeamId(Long teamId);
    
    // Find by project
    List<Application> findByProjectId(Long projectId);
    
    // Find by name containing (case-insensitive)
    List<Application> findByNameContainingIgnoreCase(String name);
    
    // Custom query: Find applications with team and project details
    @Query("SELECT a FROM Application a " +
           "JOIN FETCH a.team t " +
           "JOIN FETCH a.project p " +
           "WHERE a.id = :id")
    Application findByIdWithDetails(@Param("id") Long id);
    
    // Find applications by project owner
    @Query("SELECT a FROM Application a " +
           "JOIN a.project p " +
           "WHERE p.user.id = :userId")
    List<Application> findByProjectOwnerId(@Param("userId") Long userId);
    
    // Find applications by team member
    @Query("SELECT DISTINCT a FROM Application a " +
           "JOIN a.team t " +
           "JOIN t.members m " +
           "WHERE m.id = :userId")
    List<Application> findByTeamMemberId(@Param("userId") Long userId);
}
`;

fs.writeFileSync(`${outputDir}/ApplicationRepository.java`, springRepos);

// Summary
console.log('\n✅ Dataset generation complete!');
console.log('\nGenerated files:');
console.log(`  📄 ${outputDir}/users.json (${users.length} users)`);
console.log(`  📄 ${outputDir}/teams.json (${teams.length} teams)`);
console.log(`  📄 ${outputDir}/projects.json (${projects.length} projects)`);
console.log(`  📄 ${outputDir}/applications.json (${applications.length} applications)`);
console.log(`  📄 ${outputDir}/postgres_seed.sql (PostgreSQL seed file)`);
console.log(`  📄 ${outputDir}/elasticsearch_bulk.ndjson (Elasticsearch bulk import)`);
console.log(`  📄 ${outputDir}/elasticsearch_mapping.txt (Elasticsearch index mapping)`);
console.log(`  📄 ${outputDir}/sample_queries.txt (Sample queries for both databases)`);
console.log(`  📄 ${outputDir}/ApplicationRepository.java (Spring Data JPA Repository)`);

console.log('\n📊 Statistics:');
console.log(`  Users: ${users.length}`);
console.log(`  Teams: ${teams.length}`);
console.log(`  Projects: ${projects.length}`);
console.log(`  Applications: ${applications.length}`);
console.log(`  Team-User relationships: ${teams.reduce((sum, t) => sum + t.memberIds.length, 0)}`);

console.log('\n🚀 Next steps:');
console.log('\n  PostgreSQL:');
console.log('    psql -U youruser -d yourdb -f generated_data/postgres_seed.sql');
console.log('\n  Elasticsearch:');
console.log('    # Create index with mapping');
console.log('    curl -X PUT "localhost:9200/applications" -H "Content-Type: application/json" -d @generated_data/elasticsearch_mapping.txt');
console.log('    # Import data');
console.log('    curl -X POST "localhost:9200/_bulk" -H "Content-Type: application/x-ndjson" --data-binary @generated_data/elasticsearch_bulk.ndjson');