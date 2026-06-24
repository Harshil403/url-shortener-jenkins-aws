resource "aws_codepipeline" "url_shortener" {

  name     = "url-shortener-pipeline"
  role_arn = aws_iam_role.codepipeline_role.arn
  pipeline_type = "V2"

  artifact_store {
    location = aws_s3_bucket.pipeline_bucket.bucket
    type     = "S3"
  }

  # Add here
  trigger {
    provider_type = "CodeStarSourceConnection"

    git_configuration {
      source_action_name = "GitHub"

      push {
        branches {
          excludes = ["*"]
        }
      }
    }
  }

  stage {
    name = "Source"

    action {
      name     = "GitHub"
      category = "Source"
      owner    = "AWS"
      provider = "CodeStarSourceConnection"
      version  = "1"

      output_artifacts = ["source_output"]

      configuration = {
        ConnectionArn    = "arn:aws:codeconnections:ap-south-1:023036696781:connection/88e15edd-0e8f-4e50-91ff-5b02f38af4bb"
        FullRepositoryId = "Harshil403/url-shortener-jenkins-aws"
        BranchName       = "main"
      }
    }
  }

  stage {
    name = "Build"

    action {
      name     = "Build"
      category = "Build"
      owner    = "AWS"
      provider = "CodeBuild"
      version  = "1"

      input_artifacts  = ["source_output"]
      output_artifacts = ["build_output"]

      configuration = {
        ProjectName = aws_codebuild_project.url_shortener.name
      }
    }
  }
}