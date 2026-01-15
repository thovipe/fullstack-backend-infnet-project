package br.edu.infnet.infraapiproject.repository;

import br.edu.infnet.infraapiproject.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;

import javax.swing.text.html.Option;
import java.util.Optional;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    Optional<Project> findByName(String name);
}
