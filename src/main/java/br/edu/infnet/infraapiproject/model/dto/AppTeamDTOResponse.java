package br.edu.infnet.infraapiproject.model.dto;

import java.util.List;

public record AppTeamDTOResponse(Long id, String name, String description, List<UserDTOResponse> users) {
}
