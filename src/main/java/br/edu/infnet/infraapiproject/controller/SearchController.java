package br.edu.infnet.infraapiproject.controller;

import br.edu.infnet.infraapiproject.model.dto.ApplicationDTODocument;
import br.edu.infnet.infraapiproject.model.dto.ApplicationDTORequest;
import br.edu.infnet.infraapiproject.services.SearchServices;
import co.elastic.clients.elasticsearch.core.SearchRequest;
import co.elastic.clients.elasticsearch.core.SearchResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/search")
public class SearchController {

    private final SearchServices searchServices;

    @GetMapping
    public ResponseEntity<List<ApplicationDTODocument>> search() throws Exception {

        return ResponseEntity.ok(searchServices.search());

    }
}