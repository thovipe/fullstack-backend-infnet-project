package br.edu.infnet.infraapiproject.infra.config;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ElastiSearchConfig {

    @Bean
    public ElasticsearchClient esClient() {

        ElasticsearchClient esClient = ElasticsearchClient.of(b -> b
                .host("http://localhost:9200")

        );
        return esClient;
    }
}
