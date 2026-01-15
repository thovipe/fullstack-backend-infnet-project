package br.edu.infnet.infraapiproject.controller;

import br.edu.infnet.infraapiproject.model.AppTeam;
import br.edu.infnet.infraapiproject.model.dto.AppTeamDTORequest;
import br.edu.infnet.infraapiproject.model.dto.AppTeamDTOResponse;
import br.edu.infnet.infraapiproject.model.dto.UserDTOResponse;
import br.edu.infnet.infraapiproject.services.AppTeamServices;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/appteams")
public class AppTeamController {

    private final AppTeamServices appTeamServices;

    @PostMapping
    public ResponseEntity<AppTeamDTOResponse> createAppTeam(@RequestBody @Valid AppTeamDTORequest appTeam) {
        AppTeam appT = appTeamServices.createTeam(appTeam);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(appT.getId()).toUri();
        List<UserDTOResponse> userDTOResponseList = appT.getMembers().stream().map(user -> new UserDTOResponse(user.getId(), user.getName(), user.getEmail())).toList();
        AppTeamDTOResponse appTeamDTOResponse = new AppTeamDTOResponse(appT.getId(), appT.getName(), appT.getDescription(), userDTOResponseList);
        return ResponseEntity.created(location).body(appTeamDTOResponse);
    }

    @GetMapping
    public ResponseEntity<Page<AppTeamDTOResponse>> getAllAppTeams(@PageableDefault(page = 0, size = 10) Pageable pageable) {
        return ResponseEntity.ok(appTeamServices.getAppTeams(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AppTeamDTOResponse> getAppTeam(@PathVariable Long id) {
        AppTeam appTeam = appTeamServices.getAppTeamById(id);

        return ResponseEntity.ok(new AppTeamDTOResponse(appTeam.getId(), appTeam.getName(), appTeam.getDescription(), appTeam.getMembers()
                .stream().map(members -> new UserDTOResponse(members.getId(), members.getName(), members.getEmail())).toList()));

    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAppTeam(@PathVariable Long id) {
        appTeamServices.deleteTeam(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("{id}")
    public ResponseEntity<AppTeamDTOResponse> updateAppTeam(@PathVariable Long id, @RequestBody @Valid AppTeamDTORequest appTeam) {
        AppTeam team = appTeamServices.updateTeam(id, appTeam);

        return ResponseEntity.ok(new AppTeamDTOResponse(team.getId(), team.getName(),
                team.getDescription(), team.getMembers().stream()
                .map(member -> new UserDTOResponse(member.getId(), member.getName(), member.getEmail())).toList()));
    }

}
