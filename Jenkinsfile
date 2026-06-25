pipeline {
  agent any

  environment {
    AWS_DEFAULT_REGION = 'us-east-1'
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

    stage('GitGuardian Secret Scan') {
      steps {
        withCredentials([string(credentialsId: 'gitguardian-api-key', variable: 'GITGUARDIAN_API_KEY')]) {
          sh '''
              export GITGUARDIAN_API_KEY=$GITGUARDIAN_API_KEY
              /var/lib/jenkins/.local/bin/ggshield secret scan path -r . --yes
          '''
        }
      }
    }

    //stage('Trigger AWS CodePipeline') {
    //  steps {
    //    withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'aws-codepipeline-credentials']]) {
    //      sh '''#!/bin/bash
    //        aws codepipeline start-pipeline-execution --name "${CODEPIPELINE_NAME}"
    //      '''
    //    }
    //  }
    //}
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
