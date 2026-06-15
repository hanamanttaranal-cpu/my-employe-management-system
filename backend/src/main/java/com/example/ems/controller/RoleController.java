package com.example.ems.controller;

import com.example.ems.model.Role;
import com.example.ems.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/roles")
@CrossOrigin(origins = "*")
public class RoleController {

    @Autowired
    private RoleRepository roleRepository;

    // 1. Get All Available Corporate Roles
    @GetMapping
    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    // 2. Admin: Create Dynamic Custom Roles
    @PostMapping
    public ResponseEntity<?> createRole(@RequestBody Map<String, String> payload) {
        String roleName = payload.get("roleName");
        String description = payload.get("description");

        if (roleName == null || roleName.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error: roleName is a required field."));
        }

        if (roleRepository.existsByRoleNameIgnoreCase(roleName.trim())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error: Role '" + roleName + "' already exists."));
        }

        String id = "role-" + UUID.randomUUID().toString().substring(0, 8);
        Role newRole = new Role(id, roleName.trim(), description != null ? description : "", Instant.now().toString());
        Role saved = roleRepository.save(newRole);

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
}
