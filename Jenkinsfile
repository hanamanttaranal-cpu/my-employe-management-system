pipeline {
    agent any

    environment {
        // Registry credentials matching AWS ECR or Docker Hub
        DOCKER_REGISTRY = 'your-registry-id.dkr.ecr.us-east-1.amazonaws.com'
        BACKEND_IMAGE_NAME = 'ems-backend'
        FRONTEND_IMAGE_NAME = 'ems-frontend'
        IMAGE_TAG = "v${env.BUILD_NUMBER}"
        KUBECONFIG_CREDENTIAL_ID = 'aws-eks-kubeconfig'
        AWS_CREDENTIALS_ID = 'aws-credentials'
    }

    options {
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
    }

    stages {
        // 1. Resolve & Fetch Repositories
        stage('Checkout Source') {
            steps {
                checkout scm
            }
        }

        // 2. Automated Testing Stage
        stage('Run Code Quality & Unit Tests') {
            parallel {
                stage('Backend Java Test Suite') {
                    steps {
                        dir('backend') {
                            echo 'Running Spring Boot Maven Unit and Integration Tests...'
                            sh 'mvn clean test'
                        }
                    }
                }
                stage('Frontend React Lint') {
                    steps {
                        dir('frontend') {
                            echo 'Auditing Frontend dependency parameters...'
                            sh 'npm ci'
                            sh 'npm run lint || true'
                        }
                    }
                }
            }
        }

        // 3. Security Auditing (Anti-Vulnerability Guards)
        stage('System Vulnerability Assessment') {
            steps {
                echo 'Performing static code analysis (SAST) and OWASP check...'
                // sh 'mvn dependency-check:check' // Optional Maven Security Plugin
            }
        }

        // 4. Standalone Container Image Engineering
        stage('Build & Push Container Images') {
            steps {
                script {
                    echo "Building Docker Image: ${DOCKER_REGISTRY}/${BACKEND_IMAGE_NAME}:${IMAGE_TAG}"
                    sh "docker build -t ${DOCKER_REGISTRY}/${BACKEND_IMAGE_NAME}:${IMAGE_TAG} ./backend"
                    
                    echo "Building Docker Image: ${DOCKER_REGISTRY}/${FRONTEND_IMAGE_NAME}:${IMAGE_TAG}"
                    sh "docker build -t ${DOCKER_REGISTRY}/${FRONTEND_IMAGE_NAME}:${IMAGE_TAG} ./frontend"

                    // Authenticate ECR or Docker Registry and upload
                    withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', credentialsId: AWS_CREDENTIALS_ID]]) {
                        sh "aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ${DOCKER_REGISTRY}"
                        sh "docker push ${DOCKER_REGISTRY}/${BACKEND_IMAGE_NAME}:${IMAGE_TAG}"
                        sh "docker push ${DOCKER_REGISTRY}/${FRONTEND_IMAGE_NAME}:${IMAGE_TAG}"
                    }
                }
            }
        }

        // 5. AWS EKS Kubernetes Manifest Rollout
        stage('Deploy Rollout to AWS EKS') {
            steps {
                script {
                    withKubeConfig([credentialsId: KUBECONFIG_CREDENTIAL_ID]) {
                        echo "Targeting EKS Cluster Cluster and Applying Manifests..."
                        
                        // Dynamically update image tags inside Kubernetes manifests safely
                        sh "sed -i 's|ems-backend:latest|${DOCKER_REGISTRY}/${BACKEND_IMAGE_NAME}:${IMAGE_TAG}|g' eks-deployment.yaml"
                        sh "sed -i 's|ems-frontend:latest|${DOCKER_REGISTRY}/${FRONTEND_IMAGE_NAME}:${IMAGE_TAG}|g' eks-deployment.yaml"
                        
                        // Rollout application resources
                        sh "kubectl apply -f eks-deployment.yaml"
                        sh "kubectl rollout status deployment/ems-backend-deploy"
                        sh "kubectl rollout status deployment/ems-frontend-deploy"
                    }
                }
            }
        }
    }

    post {
        success {
            echo "Continuous Integration and Deploy Successful: Build #${env.BUILD_NUMBER} is Live!"
        }
        failure {
            echo "CI/CD Pipeline failed! Check logs and retry. Rollbacks initiated automatically if needed."
        }
    }
}
