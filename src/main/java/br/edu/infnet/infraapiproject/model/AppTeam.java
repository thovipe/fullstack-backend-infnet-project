package br.edu.infnet.infraapiproject.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;

@Getter
@Entity
@Table(name = "appteams")
@NoArgsConstructor
@AllArgsConstructor
@Setter
public class AppTeam {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @NotNull
    private String name;
    private String description;
    @OneToMany
    @JoinTable( name = "appteams_users", joinColumns = @JoinColumn(name="appteam_id"), inverseJoinColumns = @JoinColumn(name="user_id"))
    private List<User> members;


}
