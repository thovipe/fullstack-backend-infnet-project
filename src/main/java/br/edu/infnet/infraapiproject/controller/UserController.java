package br.edu.infnet.infraapiproject.controller;

import br.edu.infnet.infraapiproject.model.User;
import br.edu.infnet.infraapiproject.model.dto.UserDTORequest;
import br.edu.infnet.infraapiproject.model.dto.UserDTOResponse;
import br.edu.infnet.infraapiproject.services.UserServices;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping(value = "/api/users")
public class UserController {

    private final UserServices userServices;

    @PostMapping
    public ResponseEntity<UserDTOResponse> createUser(@RequestBody @Valid UserDTORequest userDTORequest) {
        User user = userServices.createUser(userDTORequest.name(), userDTORequest.email(), userDTORequest.password());

        return ResponseEntity.ok(new UserDTOResponse(user.getId(), user.getName(), user.getEmail()));
    }

    @GetMapping
    public ResponseEntity<Page<UserDTOResponse>> getAllUsers(@PageableDefault(page = 0, size = 10) Pageable pageable) {
         return ResponseEntity.ok(userServices.getUsers(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTOResponse> getUserById(@PathVariable Long id){
        User user = userServices.getUser(id);
        return ResponseEntity.ok(new UserDTOResponse(user.getId(), user.getName(), user.getEmail()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDTOResponse> updateUser(@PathVariable Long id,  @RequestBody @Valid UserDTORequest userDTORequest) {
        User user = userServices.updateUser(id, userDTORequest);
        return ResponseEntity.ok(new UserDTOResponse(user.getId(), user.getName(), user.getEmail()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userServices.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
