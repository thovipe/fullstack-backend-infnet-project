package br.edu.infnet.infraapiproject.services;

import br.edu.infnet.infraapiproject.model.AppTeam;
import br.edu.infnet.infraapiproject.model.User;
import br.edu.infnet.infraapiproject.model.dto.AppTeamDTORequest;
import br.edu.infnet.infraapiproject.model.dto.AppTeamDTOResponse;
import br.edu.infnet.infraapiproject.model.dto.UserDTOResponse;
import br.edu.infnet.infraapiproject.repository.AppTeamRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import tools.jackson.databind.cfg.MapperBuilder;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AppTeamServices {

    private final AppTeamRepository appTeamRepository;
    private final UserServices userServices;
    private final MapperBuilder mapperBuilder;

    @Transactional
    public AppTeam createTeam(AppTeamDTORequest appTeamDTORequest) {

        AppTeam appTeam = new AppTeam();
        appTeam.setName(appTeamDTORequest.name());
        appTeam.setDescription(appTeamDTORequest.description());
        List<User> users = new ArrayList<>();

        for(Long id : appTeamDTORequest.memberIds()) {
            User user = userServices.getUser(id);
            users.add(user);
        }
        appTeam.setMembers(users);

        return appTeamRepository.save(appTeam);
    }

    public AppTeam getAppTeamById(Long id) {
        if(id == null) {
            throw new RuntimeException("Id is null");
        }
        return appTeamRepository.findById(id).orElseThrow(() -> new RuntimeException("Team not found"));
    }

    public Page<AppTeamDTOResponse> getAppTeams(Pageable pageable) {

        return appTeamRepository.findAll(pageable).map(appTeam -> new AppTeamDTOResponse(appTeam.getId(), appTeam.getName(),
                appTeam.getDescription(), appTeam.getMembers().stream().map(members -> new UserDTOResponse(members.getId(),
                members.getName(), members.getEmail())).toList()));
    }

    @Transactional
    public void deleteTeam(Long id) {
        if(id == null) {
            throw new RuntimeException("Id is null");
        }
        appTeamRepository.deleteById(id);
    }

    @Transactional
    public AppTeam updateTeam(Long id, AppTeamDTORequest team) {

        if(id == null) {
            throw new RuntimeException("Id is null");
        }
        if(team == null) {
            throw new RuntimeException("Team is null");
        }

        List<User> users = new ArrayList<>();

        for(Long i : team.memberIds()) {
            User user = userServices.getUser(i);
            users.add(user);
        }

        AppTeam appTeam = appTeamRepository.findById(id).orElseThrow(() -> new RuntimeException("Team not found"));
        appTeam.setName(team.name());
        appTeam.setDescription(team.description());
        appTeam.setMembers(users);

        return appTeamRepository.save(appTeam);
    }
}
