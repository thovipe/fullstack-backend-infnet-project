
package br.edu.infnet.infraapiproject.repository;

import br.edu.infnet.infraapiproject.model.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    
    // Find by team
    List<Application> findByTeamId(Long teamId);
    
    // Find by project
    List<Application> findByProjectId(Long projectId);
    
    // Find by name containing (case-insensitive)
    List<Application> findByNameContainingIgnoreCase(String name);
    
    // Custom query: Find applications with team and project details
    @Query("SELECT a FROM Application a " +
           "JOIN FETCH a.team t " +
           "JOIN FETCH a.project p " +
           "WHERE a.id = :id")
    Application findByIdWithDetails(@Param("id") Long id);
    
    // Find applications by project owner
    @Query("SELECT a FROM Application a " +
           "JOIN a.project p " +
           "WHERE p.user.id = :userId")
    List<Application> findByProjectOwnerId(@Param("userId") Long userId);
    
    // Find applications by team member
    @Query("SELECT DISTINCT a FROM Application a " +
           "JOIN a.team t " +
           "JOIN t.members m " +
           "WHERE m.id = :userId")
    List<Application> findByTeamMemberId(@Param("userId") Long userId);
}
