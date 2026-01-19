# Infrastructure API Project

A Spring Boot application for managing infrastructure services, applications, teams, and projects with integrated Elasticsearch search capabilities and Keycloak authentication.

## Overview

This project provides a RESTful API for managing:
- **Users**: User accounts and authentication
- **App Teams**: Development teams with members
- **Projects**: Projects owned by users
- **Applications**: Services/applications assigned to teams and projects

The system uses PostgreSQL for transactional data storage and Elasticsearch for advanced search capabilities, with Keycloak handling OAuth2 authentication.

## Technology Stack

- **Java 25**
- **Spring Boot 4.0.1**
- **PostgreSQL 18.1**
- **Elasticsearch 9.2.4**
- **Keycloak** (latest)
- **Docker & Docker Compose**
- **Maven 3.9.12**

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Client    │────▶│  Spring Boot │────▶│ PostgreSQL  │
│             │     │      API     │     └─────────────┘
└─────────────┘     │              │     
                    │              │     ┌─────────────┐
                    │              │────▶│Elasticsearch│
                    │              │     └─────────────┘
                    │              │     
                    │              │     ┌─────────────┐
                    │              │────▶│  Keycloak   │
                    └──────────────┘     └─────────────┘
```

## Prerequisites

- Docker and Docker Compose
- Java 25 (for local development)
- Maven 3.9+ (for local development)

## Quick Start

### 1. Start Services with Docker Compose

```bash
docker-compose up -d
```

This will start:
- PostgreSQL (port 5432)
- PgAdmin (port 8090)
- Keycloak (port 7080)
- Elasticsearch (port 9200)
- Kibana (port 5601)
- API (port 8080)
- Frontend (port 3000)

### 2. Access Services

| Service | URL | Credentials |
|---------|-----|-------------|
| API | http://localhost:8080 | OAuth2 token required |
| PgAdmin | http://localhost:8090 | user@localhost.com / password |
| Keycloak | http://localhost:7080 | admin / admin |
| Kibana | http://localhost:5601 | - |
| Frontend | http://localhost:3000 | - |

### 3. Database Setup

The database is automatically initialized with the schema from `init-db/01_schema.sql`. To load sample data:

```bash
# From inside the PostgreSQL container
docker exec -i postgres psql -U dbuser -d infraServices < generated_data/postgres_seed.sql
```

### 4. Load Data into Elasticsearch

```bash
# Navigate to elasticsearch_data directory
cd elasticsearch_data

# Run the sync script
node sync_to_elasticsearch.js
```

Or manually import:

```bash
# Create index with mapping
curl -X PUT "localhost:9200/applications" \
  -H "Content-Type: application/json" \
  -d @elasticsearch_data/applications_mapping.json

# Bulk import data
curl -X POST "localhost:9200/_bulk" \
  -H "Content-Type: application/x-ndjson" \
  --data-binary @elasticsearch_data/applications_bulk.ndjson
```

## Local Development

### Build and Run

```bash
# Build the project
./mvnw clean package -DskipTests

# Run the application
./mvnw spring-boot:run
```

### Build Docker Image

```bash
docker build -t infraapi:0.0.4 .
```

## API Endpoints

All endpoints require authentication via OAuth2 JWT token from Keycloak.

### Users
- `POST /api/users` - Create user
- `GET /api/users` - List users (paginated)
- `GET /api/users/{id}` - Get user by ID
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

### App Teams
- `POST /api/appteams` - Create team
- `GET /api/appteams` - List teams (paginated)
- `GET /api/appteams/{id}` - Get team by ID
- `PUT /api/appteams/{id}` - Update team
- `DELETE /api/appteams/{id}` - Delete team

### Projects
- `POST /api/projects` - Create project
- `GET /api/projects` - List projects (paginated)
- `GET /api/projects/{id}` - Get project by ID
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project

### Applications
- `POST /api/applications` - Create application
- `GET /api/applications` - List applications (paginated)
- `GET /api/applications/{id}` - Get application by ID
- `PUT /api/applications/{id}` - Update application
- `DELETE /api/applications/{id}` - Delete application

### Search
- `GET /api/search?searchText={query}` - Search applications (paginated)

## Authentication

The API uses OAuth2 Resource Server with JWT tokens from Keycloak.

### Keycloak Configuration

1. Access Keycloak at http://localhost:7080
2. Login with admin/admin
3. Create a realm named `allthom`
4. Create a client `infraapi` with:
    - Client Protocol: openid-connect
    - Access Type: confidential
    - Valid Redirect URIs: http://localhost:8080/*

### Getting a Token

```bash
curl -X POST "http://localhost:7080/realms/allthom/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=infraapi" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "grant_type=password" \
  -d "username=YOUR_USERNAME" \
  -d "password=YOUR_PASSWORD"
```

### Using the Token

```bash
curl -X GET "http://localhost:8080/api/applications" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Data Model

```
Users
  └── Projects (owner)
  └── AppTeams (members)
        └── Applications
              └── Project
```

### Entity Relationships

- **User** (1) → (N) **Projects** - A user can own multiple projects
- **User** (N) → (N) **AppTeams** - Users can belong to multiple teams
- **AppTeam** (1) → (N) **Applications** - A team manages multiple applications
- **Project** (1) → (N) **Applications** - A project contains multiple applications

## Search Capabilities

Elasticsearch provides advanced search across applications with denormalized data including:
- Application name and description
- Team information and members
- Project details and owner
- Full-text search across all fields

### Example Search Query

```bash
curl -X GET "http://localhost:8080/api/search?searchText=automation&page=0&size=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Development Tools

### Generate Sample Data

```bash
node generated_data_generator.js
```

This creates:
- 50 users
- 20 teams
- 30 projects
- 100 applications
- Sample SQL seed file
- Elasticsearch bulk import file

### Import Data from PostgreSQL to Elasticsearch

```bash
node importFromPostgres.js
```

This script:
1. Connects to PostgreSQL
2. Queries all applications with related data
3. Generates Elasticsearch bulk import file
4. Creates index mapping
5. Provides import scripts

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection URL | jdbc:postgresql://postgres:5432/infraServices |
| ISSUER_URI | Keycloak issuer URI | http://keycloak:7080/realms/allthom |
| JWK_URI | Keycloak JWK set URI | http://keycloak:7080/realms/allthom/protocol/openid-connect/certs |

## Monitoring and Administration

### PgAdmin
- URL: http://localhost:8090
- Add server with host: `postgres`, database: `infraServices`

### Kibana
- URL: http://localhost:5601
- Use Dev Tools to query Elasticsearch

### Sample Elasticsearch Queries

```json
// Search applications
GET /applications/_search
{
  "query": {
    "multi_match": {
      "query": "api service",
      "fields": ["name^3", "description^2", "searchText"]
    }
  }
}

// Aggregate by team
GET /applications/_search
{
  "size": 0,
  "aggs": {
    "by_team": {
      "terms": {
        "field": "teamName.keyword"
      }
    }
  }
}
```

## Testing

```bash
# Run tests
./mvnw test

# Run with coverage
./mvnw verify
```

## Project Structure

```
├── src/main/java/br/edu/infnet/infraapiproject/
│   ├── controller/          # REST controllers
│   ├── model/               # JPA entities
│   │   ├── dto/            # Data Transfer Objects
│   │   └── exceptions/     # Custom exceptions
│   ├── repository/          # JPA repositories
│   ├── services/            # Business logic
│   └── infra/
│       ├── config/         # Configuration classes
│       └── security/       # Security configuration
├── init-db/                 # Database initialization scripts
├── generated_data/          # Sample data
├── elasticsearch_data/      # Elasticsearch setup
└── docker-compose.yaml      # Service orchestration
```

## Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL logs
docker logs postgres

# Connect to database
docker exec -it postgres psql -U dbuser -d infraServices
```

### Elasticsearch Not Starting
```bash
# Check Elasticsearch logs
docker logs elasticsearch

# Verify cluster health
curl http://localhost:9200/_cluster/health
```

### Keycloak Authentication Issues
- Verify realm name is `allthom`
- Check client configuration
- Ensure redirect URIs are correct
- Validate token expiration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is part of an educational program at INFNET.

## Contact

For questions or support, please contact the development team.