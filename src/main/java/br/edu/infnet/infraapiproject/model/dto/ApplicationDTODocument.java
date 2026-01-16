package br.edu.infnet.infraapiproject.model.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;
import java.util.ArrayList;

@Data
@NoArgsConstructor
@Setter
@Getter
@JsonIgnoreProperties(ignoreUnknown = true)
public class ApplicationDTODocument {

          private Long id;
          private String name;
          private String description;
          private Long appteamId;
          private Long projectId;
          private String teamName;
          private String teamDescription;
          private Long teamMemberCount;
          private ArrayList<Long> teamMemberIds;
          private ArrayList<String> teamMemberNames;
          private ArrayList<String> teamMemberEmails;
          private String projectName;
          private String projectDescription;
          private Long projectOwnerId;
          private String projectOwnerName;
          private String projectOwnerEmail;
          private String searchText;
}
