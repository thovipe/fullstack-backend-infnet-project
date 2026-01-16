package br.edu.infnet.infraapiproject.services;

import br.edu.infnet.infraapiproject.model.dto.ApplicationDTODocument;
import co.elastic.clients.elasticsearch.ElasticsearchClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SearchServices {

    private final ElasticsearchClient esClient;

    public List<ApplicationDTODocument> search() throws Exception {

        var response = esClient.search(s -> s
                .index("applications")
                .query(q -> q
                        .term(t -> t
                                .field("description")
                                .value(v -> v.stringValue("automation"))
                        )
                ), ApplicationDTODocument.class);

        return response.hits().hits().stream().map(h -> {
           ApplicationDTODocument doc = h.source();
           return doc;
        } ).toList();
    };
}
