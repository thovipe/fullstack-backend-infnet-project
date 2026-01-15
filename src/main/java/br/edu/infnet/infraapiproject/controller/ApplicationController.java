package br.edu.infnet.infraapiproject.controller;

import br.edu.infnet.infraapiproject.model.Application;
import br.edu.infnet.infraapiproject.model.dto.AppTeamDTOResponse;
import br.edu.infnet.infraapiproject.model.dto.ApplicationDTORequest;
import br.edu.infnet.infraapiproject.model.dto.ApplicationDTOResponse;
import br.edu.infnet.infraapiproject.services.ApplicationServices;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class ApplicationController {

    private final ApplicationServices applicationServices;

    @PostMapping
    public ResponseEntity<ApplicationDTOResponse> createApplication(@RequestBody @Valid ApplicationDTORequest applicationDTORequest) {
        Application app = applicationServices.createApplication(applicationDTORequest);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(app.getId()).toUri();
        return ResponseEntity.created(location).body(new ApplicationDTOResponse(app.getId(), app.getName(),
                app.getDescription(), app.getTeam().getId(), app.getProject().getId()));
    }

    @GetMapping
    public ResponseEntity<Page<ApplicationDTOResponse>> getAllApplications(@PageableDefault(page = 0, size = 10) Pageable pageable) {

        return ResponseEntity.ok(applicationServices.getApplications(pageable).map(app -> new ApplicationDTOResponse(app.getId(), app.getName(),
                        app.getDescription(), app.getTeam().getId(), app.getProject().getId())));
    }
    @GetMapping("/{id}")
    public ResponseEntity<ApplicationDTOResponse> getApplication(@PathVariable Long id) {
        Application app = applicationServices.getApplicationById(id);
        return ResponseEntity.ok(new ApplicationDTOResponse(app.getId(), app.getName(), app.getDescription(),
                app.getTeam().getId(), app.getProject().getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteApplication(@PathVariable Long id) {
        applicationServices.deleteApplicationById(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApplicationDTOResponse> updateApplication(@PathVariable Long id, @RequestBody @Valid ApplicationDTORequest applicationDTORequest) {
        Application app =  applicationServices.updateApplicationById(id, applicationDTORequest);
        return ResponseEntity.ok(new ApplicationDTOResponse(app.getId(), app.getName(), app.getDescription(), app.getTeam().getId(), app.getProject().getId()));
    }
}
