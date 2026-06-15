package com.example.ems.startup;

import com.example.ems.model.Employee;
import com.example.ems.model.Role;
import com.example.ems.repository.EmployeeRepository;
import com.example.ems.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Override
    public void run(String... args) throws Exception {
        // Seed Roles if empty
        if (roleRepository.count() == 0) {
            System.out.println("Seeding custom corporate roles in database...");
            roleRepository.save(new Role("1", "Developer", "Engineers system integrations and codes company modules.", Instant.now().toString()));
            roleRepository.save(new Role("2", "Manager", "Coordinates client objectives and reports operational statistics.", Instant.now().toString()));
            roleRepository.save(new Role("3", "Sysops Designer", "Configures cloud server clusters, EKS, and Jenkins CI pipelines.", Instant.now().toString()));
            roleRepository.save(new Role("4", "Employee", "General operational workload execution role.", Instant.now().toString()));
        }

        // Seed Employees if empty
        if (employeeRepository.count() == 0) {
            System.out.println("Seeding corporate employee directory in database...");
            
            // admin-root-001 | Master HR Admin | myname@1.com | Admin | 15000 | Paid | Joined 2025-10-01
            employeeRepository.save(new Employee(
                "admin-root-001",
                "Master HR Admin",
                "myname@1.com",
                "Admin",
                15000.0,
                "Paid",
                "2025-10-01T00:00:00Z",
                true
            ));

            // emp-dev-432 | Jane Austin | jane@corp-domain.com | Developer | 8500 | Processing | Joined 2026-02-12
            employeeRepository.save(new Employee(
                "emp-dev-432",
                "Jane Austin",
                "jane@corp-domain.com",
                "Developer",
                8500.0,
                "Processing",
                "2026-02-12T00:00:00Z",
                false
            ));

            // emp-mgr-981 | Sam Billings | sam@corp-domain.com | Manager | 9200 | Pending | Joined 2026-04-18
            employeeRepository.save(new Employee(
                "emp-mgr-981",
                "Sam Billings",
                "sam@corp-domain.com",
                "Manager",
                9200.0,
                "Pending",
                "2026-04-18T00:00:00Z",
                false
            ));
        }
    }
}
