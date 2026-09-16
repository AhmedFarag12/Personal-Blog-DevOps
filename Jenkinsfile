pipeline {

    agent any

    environment {
        DOCKER_IMAGE = "ahmedfarag1211/personal-blog"
        DOCKER_CREDENTIALS = "dockerhub-credentials"
        KUBECONFIG_CREDENTIALS = "kubeconfig-credentials"
        K8S_NAMESPACE = "personal-blog"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Test') {
            steps {
                sh 'npm test'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh '''
                    docker build \
                    -t ${DOCKER_IMAGE}:${BUILD_NUMBER} \
                    -t ${DOCKER_IMAGE}:latest \
                    .
                '''
            }
        }

        stage('Push Docker Image') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: "${DOCKER_CREDENTIALS}",
                        usernameVariable: 'DOCKER_USERNAME',
                        passwordVariable: 'DOCKER_PASSWORD'
                    )
                ]) {

                    sh '''
                        echo "$DOCKER_PASSWORD" | docker login \
                        -u "$DOCKER_USERNAME" \
                        --password-stdin

                        docker push ${DOCKER_IMAGE}:${BUILD_NUMBER}
                        docker push ${DOCKER_IMAGE}:latest
                    '''
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                withCredentials([
                    file(
                        credentialsId: "${KUBECONFIG_CREDENTIALS}",
                        variable: 'KUBECONFIG'
                    )
                ]) {
                    sh '''
                        kubectl apply -f k8s/namespace.yaml
                        kubectl apply -f k8s/secret.yaml
                        kubectl apply -f k8s/mongo-pv.yaml
                        kubectl apply -f k8s/mongo-pvc.yaml
                        kubectl apply -f k8s/mongo-deployment.yaml
                        kubectl apply -f k8s/mongo-service.yaml
                        kubectl apply -f k8s/app-deployment.yaml
                        kubectl apply -f k8s/app-service.yaml

                        kubectl set image deployment/personal-blog personal-blog=${DOCKER_IMAGE}:${BUILD_NUMBER} -n ${K8S_NAMESPACE}
                        kubectl rollout status deployment/personal-blog -n ${K8S_NAMESPACE}
                    '''
                }
            }
        }
    }

    post {
        always {
            sh 'docker logout || true'
        }
    }
}
