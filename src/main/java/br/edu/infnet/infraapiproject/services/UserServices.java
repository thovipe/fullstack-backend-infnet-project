package br.edu.infnet.infraapiproject.services;

import br.edu.infnet.infraapiproject.model.User;
import br.edu.infnet.infraapiproject.model.dto.UserDTORequest;
import br.edu.infnet.infraapiproject.model.dto.UserDTOResponse;
import br.edu.infnet.infraapiproject.model.exceptions.UserNotFoundException;
import br.edu.infnet.infraapiproject.repository.UserRepository;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServices {

    private final UserRepository userRepository;

    @Transactional
    public User createUser(String name, String email, String password) {
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(password);
        userRepository.save(user);
        return user;
    }

    public Page<UserDTOResponse> getUsers(Pageable pageable) {
        Page users = userRepository.findAll(pageable).map(user ->  new UserDTOResponse(user.getId(), user.getName(), user.getEmail()));
        return users;
    }


    public User getUser(Long userId) {
        if (userId == null) {
            throw new IllegalArgumentException("Id cannot be null");
        };
        return userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
    }

    public User getUserByName(String ownerName) {
        if (ownerName == null) {
            throw new IllegalArgumentException("Name cannot be null");
        }
        return userRepository.findByName(ownerName)
                .orElseThrow(() -> new UserNotFoundException("User not found."));
    }

    @Transactional
    public void deleteUser(Long userId) {
        if (userId == null) {
            throw new IllegalArgumentException("Id cannot be null");
        }
        userRepository.deleteById(userId);
    }

    @Transactional
    public User updateUser(Long userId, @Valid UserDTORequest userDTORequest) {
        if (userId == null) {
            throw new IllegalArgumentException("Id cannot be null");
        }
        if (userDTORequest == null) {
            throw new IllegalArgumentException("UserDTORequest cannot be null");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setName(userDTORequest.name());
        if (userDTORequest.email() != null) {
            user.setEmail(userDTORequest.email());
        }
        if (userDTORequest.password() != null) {
            user.setPassword(userDTORequest.password());
        }
        return userRepository.save(user);
    }
}
