package br.edu.infnet.infraapiproject.controller;

import br.edu.infnet.infraapiproject.model.Project;
import br.edu.infnet.infraapiproject.model.dto.ProjectDTORequest;
import br.edu.infnet.infraapiproject.model.dto.ProjectDTOResponse;
import br.edu.infnet.infraapiproject.services.ProjectServices;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping(value = "/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectServices projectServices;

    @PostMapping
    public ResponseEntity<ProjectDTOResponse> createProject(@RequestBody @Valid ProjectDTORequest project) {
        Project projectFromRepository = projectServices.createProject(project.name(), project.description(), project.ownerName());
        var response = new ProjectDTOResponse(projectFromRepository.getId(),projectFromRepository.getName(), projectFromRepository.getDescription(), projectFromRepository.getUser().getName());
        return ResponseEntity.created(URI.create("/api/projects/" + projectFromRepository.getId())).body(response);
    }

    @GetMapping
    public ResponseEntity<Page<ProjectDTOResponse>> getProjects(@PageableDefault(page=0, size=10)  Pageable pageable) {
        return ResponseEntity.ok(projectServices.getAllProjects(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectDTOResponse> getProject(@PathVariable Long id) {
        Project project = projectServices.getProjectById(id);
        return ResponseEntity.ok(new ProjectDTOResponse(project.getId(),project.getName(),project.getDescription(),project.getUser().getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void>  deleteProject(@PathVariable Long id) {
        projectServices.deleteProjectById(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjectDTOResponse> updateProject(@PathVariable Long id, @RequestBody @Valid ProjectDTORequest project) {
        Project projectUpdated = projectServices.updateProject(id, project);
        return ResponseEntity.ok(new ProjectDTOResponse(projectUpdated.getId(),projectUpdated.getName(), projectUpdated.getDescription(), projectUpdated.getUser().getName()));
    }
}
