package br.edu.infnet.infraapiproject.model.dto;

import java.util.List;

public record AppTeamDTORequest(String name, String description, List<Long> memberIds) {
}
