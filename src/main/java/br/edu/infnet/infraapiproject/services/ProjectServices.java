package br.edu.infnet.infraapiproject.services;

import br.edu.infnet.infraapiproject.model.Project;
import br.edu.infnet.infraapiproject.model.User;
import br.edu.infnet.infraapiproject.model.dto.ProjectDTORequest;
import br.edu.infnet.infraapiproject.model.dto.ProjectDTOResponse;
import br.edu.infnet.infraapiproject.repository.ProjectRepository;
import br.edu.infnet.infraapiproject.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProjectServices {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final UserServices userServices;

    @Transactional
    public Project createProject(String name, String description, String ownerName) {

        User user = userRepository.findByName(ownerName).orElseThrow(() -> new RuntimeException("User not found"));
        Project project = new Project();
        project.setName(name);
        project.setDescription(description);
        project.setUser(user);

        return projectRepository.save(project);
    }

    public Project getProjectById(Long id) {
        if(id == null) {
            throw new RuntimeException("Project id is null");
        }
        Project project = projectRepository.findById(id).orElseThrow(() -> new RuntimeException("Project not found"));

        return project;
    }

    public Page<ProjectDTOResponse> getAllProjects(Pageable pageable) {
        return projectRepository.findAll(pageable).map(project -> new ProjectDTOResponse(project.getId(), project.getName(), project.getDescription(), project.getUser().getName()));
    }

    public Project getProjectByName(String name) {
        if(name == null) {
            throw new RuntimeException("Project name is null");
        }
        Project project = projectRepository.findByName(name).orElseThrow(() -> new RuntimeException("Project not found"));

        return project;
    }

    @Transactional
    public void deleteProjectById(Long id) {
        if(id == null) {
            throw new RuntimeException("Project id is null");
        }
        projectRepository.deleteById(id);
    }

    @Transactional
    public Project updateProject(Long id, ProjectDTORequest project) {
        if(project.ownerName() == null) {
            throw new RuntimeException("Project owner name is null");
        }
        Project projectFromRepository = getProjectById(id);
        User user = userServices.getUserByName(project.ownerName());
        projectFromRepository.setName(project.name());
        if(project.description() != null) {
            projectFromRepository.setDescription(project.description());
        }
        projectFromRepository.setUser(user);

        return  projectRepository.save(projectFromRepository);
    }
}
