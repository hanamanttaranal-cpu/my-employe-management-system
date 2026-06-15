package com.example.ems.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "employees")
public class Employee {

    @Id
    @Column(length = 50)
    private String uid;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    private String role;

    private double salary;

    @Column(name = "salary_status")
    private String salaryStatus = "Pending";

    @Column(name = "joined_at")
    private String joinedAt;

    @Column(name = "is_admin")
    private boolean isAdmin = false;

    // Default Constructor
    public Employee() {}

    // Parametrized Constructor
    public Employee(String uid, String name, String email, String role, double salary, String salaryStatus, String joinedAt, boolean isAdmin) {
        this.uid = uid;
        this.name = name;
        this.email = email;
        this.role = role;
        this.salary = salary;
        this.salaryStatus = salaryStatus;
        this.joinedAt = joinedAt;
        this.isAdmin = isAdmin;
    }

    // Getters and Setters
    public String getUid() {
        return uid;
    }

    public void setUid(String uid) {
        this.uid = uid;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public double getSalary() {
        return salary;
    }

    public void setSalary(double salary) {
        this.salary = salary;
    }

    public String getSalaryStatus() {
        return salaryStatus;
    }

    public void setSalaryStatus(String salaryStatus) {
        this.salaryStatus = salaryStatus;
    }

    public String getJoinedAt() {
        return joinedAt;
    }

    public void setJoinedAt(String joinedAt) {
        this.joinedAt = joinedAt;
    }

    public boolean getIsAdmin() {
        return isAdmin;
    }

    public void setIsAdmin(boolean isAdmin) {
        this.isAdmin = isAdmin;
    }
}
