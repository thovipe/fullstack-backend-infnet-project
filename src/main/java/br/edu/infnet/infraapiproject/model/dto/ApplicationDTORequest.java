package br.edu.infnet.infraapiproject.model.dto;

public record ApplicationDTORequest(String name, String description, Long appTeamId, Long projectId) {
}
