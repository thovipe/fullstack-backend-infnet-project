package br.edu.infnet.infraapiproject.repository;

import br.edu.infnet.infraapiproject.model.Application;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
}
