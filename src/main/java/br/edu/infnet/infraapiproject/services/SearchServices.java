package br.edu.infnet.infraapiproject.services;

import br.edu.infnet.infraapiproject.model.dto.ApplicationDTODocument;
import co.elastic.clients.elasticsearch.ElasticsearchClient;
import jakarta.persistence.criteria.CriteriaBuilder;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SearchServices {

    private final ElasticsearchClient esClient;

    public Page<ApplicationDTODocument> search( Pageable pageable, String searchText) throws Exception {


        var response = esClient.search(s -> s
                .index("applications")
                .query(q -> q
                        .queryString(t -> t
                                .defaultField("searchText")
                                .query(searchText)
                        )
                )
                        .size(pageable.getPageSize())
                        .from(pageable.getPageNumber() * pageable.getPageSize())
                , ApplicationDTODocument.class);

        List<ApplicationDTODocument> responseList = response.hits().hits().stream().map(h -> {
            ApplicationDTODocument doc = h.source();
            return doc;
        } ).toList();

        long totalHits = response.hits().total().value();

        Page<ApplicationDTODocument> pages = new PageImpl<>(responseList,  pageable, totalHits);

        return pages;
    };
}
