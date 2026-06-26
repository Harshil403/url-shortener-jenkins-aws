pipeline {
  agent any

  environment {
    AWS_DEFAULT_REGION = 'ap-south-1'
  }

  parameters {
    string(name: 'CODEPIPELINE_NAME', defaultValue: 'url-shortener-pipeline', description: 'AWS CodePipeline name to trigger')
  }

  options {
    buildDiscarder(logRotator(daysToKeepStr: '14', numToKeepStr: '20'))
    timestamps()
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('SonarQube Scan') {
      steps {
        script {
          def scannerHome = tool(name: 'sonar-scanner', type: 'hudson.plugins.sonar.SonarRunnerInstallation')

          withSonarQubeEnv('SonarQube') {
            sh "${scannerHome}/bin/sonar-scanner"
          }
        }
      }
    }

    stage('Gitleaks Secret Scan') {
      steps {
        sh '''
            gitleaks detect --source . --no-git --verbose
        '''
      }
    }

    stage('Trigger AWS CodePipeline') {
      steps {
        withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'aws-codepipeline-credentials']]) {
          sh '''#!/bin/bash
            aws codepipeline start-pipeline-execution --name "${CODEPIPELINE_NAME}"
          '''
        }
      }
    }
  }

  post {
    success {
      echo 'Pipeline completed successfully.'
    }
    failure {
      echo 'Pipeline failed. Check the logs for SonarQube or GitGuardian details.'
    }
  }
}
