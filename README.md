Project Overview
Designed and implemented an automated, secure, end-to-end CI/CD pipeline for a full-stack Java application with a MySQL database backend, deployed on an enterprise-grade cloud architecture with complete cluster observability.

Key Responsibilities & Implementation Details
Infrastructure as Code (IaC): Architected the entire AWS foundational infrastructure using Terraform, provisioning a custom VPC, Public/Private Subnets, Internet Gateway, NAT Gateway, Route Tables, and an Amazon EKS Cluster with managed node groups.

CI/CD Automation: Built a declarative Jenkins pipeline utilizing a dedicated build agent, fully integrated with Git and GitHub webhooks for automated source code checkout upon code commits.

Build & Dependency Management: Employed Maven to clean, compile, run unit tests, and package the Java application.

Continuous Security (DevSecOps): * Integrated SonarQube to analyze code quality, track technical debt, catch code smells, and enforce strict Quality Gates.

Utilized Trivy for filesystem vulnerability analysis to catch hardcoded secrets, as well as container image scanning before deployment.

Artifact Management: Set up and configured a Nexus Artifact Repository to securely store, version, and manage compiled application binaries.

Orchestration & Dynamic Storage: Managed container deployment on Amazon EKS, leveraging AWS EBS CSI drivers to provision Persistent Volumes (PV) and Persistent Volume Claims (PVC) for the stateful MySQL database backend.

Traffic Routing & Observability: * Exposed the application services externally using AWS Load Balancers and configured NodePort fallbacks for internal management.

Deployed the Prometheus Operator stack inside a dedicated monitoring namespace to dynamically scrape cluster-wide resource metrics.

Built custom Grafana dashboards to provide real-time visualization of container CPU, memory utilization, and application uptime.


images 
https://github.com/hanamanttaranal-cpu/my-employe-management-system/edit/main/README.md
https://github.com/hanamanttaranal-cpu/my-employe-management-system/blob/f3cb9dcc60e957e7a7045ecead6646ea50ef968d/images/Screenshot%202026-06-16%20223715.png
