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

    //stage('Quality Gate') {
    //  steps {
    //    timeout(time: 5, unit: 'MINUTES') {
    //      waitForQualityGate abortPipeline: true
    //    }
    //  }
    //}

    // stage('GitGuardian secret scan') {
    //   steps {
    //     withCredentials([string(credentialsId: 'gitguardian-api-key', variable: 'GITGUARDIAN_API_KEY')]) {
    //       sh '''#!/bin/bash
    //         gitguardian scan repo --api-key "$GITGUARDIAN_API_KEY" --output json .
    //       '''
    //     }
    //   }
    // }

    // stage('Trigger AWS CodePipeline') {
    //   steps {
    //     withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'aws-codepipeline-credentials']]) {
    //       sh '''#!/bin/bash
    //         aws codepipeline start-pipeline-execution --name "${CODEPIPELINE_NAME}"
    //       '''
    //     }
    //   }
    // }
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
