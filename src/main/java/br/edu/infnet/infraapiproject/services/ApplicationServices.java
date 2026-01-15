package br.edu.infnet.infraapiproject.services;

import br.edu.infnet.infraapiproject.model.AppTeam;
import br.edu.infnet.infraapiproject.model.Application;
import br.edu.infnet.infraapiproject.model.Project;
import br.edu.infnet.infraapiproject.model.dto.ApplicationDTORequest;
import br.edu.infnet.infraapiproject.repository.ApplicationRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ApplicationServices {

    private final ProjectServices projectServices;
    private final AppTeamServices appTeamServices;
    private final ApplicationRepository applicationRepository;

    @Transactional
    public Application createApplication(ApplicationDTORequest applicationDTORequest) {

        Project projectFromRepository = projectServices.getProjectById(applicationDTORequest.projectId());
        AppTeam appTeam = appTeamServices.getAppTeamById(applicationDTORequest.appTeamId());
        Application application = new Application();
        application.setName(applicationDTORequest.name());
        application.setDescription(applicationDTORequest.description());
        application.setTeam(appTeam);
        application.setProject(projectFromRepository);

        return applicationRepository.save(application);
    }

    public Application getApplicationById(Long id) {

        if(id == null) {
            throw new RuntimeException("Id is null");
        }
        Application application = applicationRepository.findById(id).orElseThrow(() -> new RuntimeException("Application not found"));

        return application;
    }

    public Page<Application> getApplications(Pageable pageable) {
        return applicationRepository.findAll(pageable);
    }

    @Transactional
    public void deleteApplicationById(Long id) {
        if (id == null) {
            throw new RuntimeException("Id is null");
        }
        applicationRepository.deleteById(id);
    }

    @Transactional
    public Application updateApplicationById(Long id, ApplicationDTORequest application) {

        if (id == null) {
            throw new RuntimeException("Id is null");
        }
        Application applicationFromRepository = applicationRepository.findById(id).orElseThrow(() -> new RuntimeException("Application not found"));
        if(application.appTeamId()!=null) {
            AppTeam appTeam = appTeamServices.getAppTeamById(application.appTeamId());
            applicationFromRepository.setTeam(appTeam);
        }
        if(application.projectId()!=null) {
            Project project = projectServices.getProjectById(application.projectId());
            applicationFromRepository.setProject(project);
        }
        if(application.description()!=null) {
            applicationFromRepository.setDescription(application.description());
        }
        if(!application.name().equals(applicationFromRepository.getName())) {
            applicationFromRepository.setName(application.name());
        }

        return applicationRepository.save(applicationFromRepository);
    }
}
