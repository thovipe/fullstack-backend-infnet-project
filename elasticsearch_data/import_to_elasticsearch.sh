#!/bin/bash

# Elasticsearch Import Script
# Generated on 2026-01-15T23:03:47.678Z

ES_HOST=${ES_HOST:-localhost:9200}
ES_USER=${ES_USER:-elastic}
ES_PASSWORD=${ES_PASSWORD:-}

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
curl -X PUT "$ES_HOST/applications" \
  -H "Content-Type: application/json" \
  -u "$ES_USER:$ES_PASSWORD" \
  -d @applications_mapping.json

echo ""
echo "✅ Index created"

# Import data using bulk API
echo "Importing documents..."
curl -X POST "$ES_HOST/_bulk" \
  -H "Content-Type: application/x-ndjson" \
  -u "$ES_USER:$ES_PASSWORD" \
  --data-binary @applications_bulk.ndjson

echo ""
echo "✅ Import complete"

# Verify the import
echo "Verifying import..."
curl -X GET "$ES_HOST/applications/_count" -u "$ES_USER:$ES_PASSWORD"
echo ""

echo "✅ Done! Applications indexed successfully"
