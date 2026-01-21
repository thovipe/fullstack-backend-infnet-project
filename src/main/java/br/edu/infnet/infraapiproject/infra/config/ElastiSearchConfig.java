package br.edu.infnet.infraapiproject.infra.config;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ElastiSearchConfig {

    @Value("${elasticsearch.url}")
    private String elasticUrl;



    @Bean
    public ElasticsearchClient esClient() {

        ElasticsearchClient esClient = ElasticsearchClient.of(b -> b
                .host(elasticUrl)
        );
        return esClient;
    }
}
