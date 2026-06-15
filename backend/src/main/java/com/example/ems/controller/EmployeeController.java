package com.example.ems.controller;

import com.example.ems.model.Employee;
import com.example.ems.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/employees")
@CrossOrigin(origins = "*")
public class EmployeeController {

    @Autowired
    private EmployeeRepository employeeRepository;

    // 1. Get All Employees (Admin action)
    @GetMapping
    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    // 2. Public Sign-up / Registration
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody Map<String, Object> payload) {
        String name = (String) payload.get("name");
        String email = (String) payload.get("email");
        String role = (String) payload.get("role");
        
        double salary = 0.0;
        if (payload.get("salary") != null) {
            try {
                salary = Double.parseDouble(payload.get("salary").toString());
            } catch (NumberFormatException e) {
                // Keep default
            }
        }

        if (name == null || name.trim().isEmpty() || email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error: Name and email are required fields."));
        }

        if (employeeRepository.existsByEmailIgnoreCase(email.trim())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error: Email is already registered in the system."));
        }

        String uid = "emp-" + UUID.randomUUID().toString().substring(0, 8);
        Employee emp = new Employee(
            uid,
            name.trim(),
            email.trim().toLowerCase(),
            role != null ? role.trim() : "Employee",
            salary,
            "Pending",
            Instant.now().toString(),
            false
        );

        Employee saved = employeeRepository.save(emp);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // 3. Admin: Add Employee Directly (supports custom attributes)
    @PostMapping
    public ResponseEntity<?> addEmployeeDirectly(@RequestBody Map<String, Object> payload) {
        String name = (String) payload.get("name");
        String email = (String) payload.get("email");
        String role = (String) payload.get("role");
        
        double salary = 0.0;
        if (payload.get("salary") != null) {
            try {
                salary = Double.parseDouble(payload.get("salary").toString());
            } catch (NumberFormatException e) {
                // Keep default
            }
        }

        if (name == null || name.trim().isEmpty() || email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error: Name and email are required fields."));
        }

        if (employeeRepository.existsByEmailIgnoreCase(email.trim())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error: Email is already registered."));
        }

        String uid = "emp-" + UUID.randomUUID().toString().substring(0, 8);
        boolean isAdmin = email.trim().equalsIgnoreCase("myname@1.com");
        
        Employee emp = new Employee(
            uid,
            name.trim(),
            email.trim().toLowerCase(),
            role != null ? role.trim() : "Employee",
            salary,
            "Pending",
            Instant.now().toString(),
            isAdmin
        );

        Employee saved = employeeRepository.save(emp);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // 4. Admin: Update Salary or Status of an employee
    @PutMapping("/{id}/salary")
    public ResponseEntity<?> updateSalaryDetails(@PathVariable String id, @RequestBody Map<String, Object> payload) {
        Optional<Employee> optionalEmployee = employeeRepository.findById(id);
        if (optionalEmployee.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Employee not found"));
        }

        Employee emp = optionalEmployee.get();

        if (payload.containsKey("salary") && payload.get("salary") != null) {
            try {
                double newSalary = Double.parseDouble(payload.get("salary").toString());
                emp.setSalary(newSalary);
            } catch (NumberFormatException e) {
                // Keep unchanged
            }
        }

        if (payload.containsKey("salaryStatus") && payload.get("salaryStatus") != null) {
            emp.setSalaryStatus((String) payload.get("salaryStatus"));
        }

        Employee saved = employeeRepository.save(emp);
        return ResponseEntity.ok(saved);
    }

    // 5. Admin: Delete Employee Account
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEmployee(@PathVariable String id) {
        if (!employeeRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Employee not found"));
        }

        employeeRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Employee record deleted successfully"));
    }

    // 6. Employee: Retrieve Own Salary and Profile Payload
    @GetMapping("/me")
    public ResponseEntity<?> getOwnProfile(@RequestParam String email) {
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Missing email query parameter."));
        }

        Optional<Employee> empOpt = employeeRepository.findByEmailIgnoreCase(email.trim());
        if (empOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Employee profile not found"));
        }

        return ResponseEntity.ok(empOpt.get());
    }
}
