resource "aws_ecr_repository" "frontend" {
  name = "url-shortener-frontend"

  image_scanning_configuration {
    scan_on_push = true
  }

  force_delete = true
}

resource "aws_ecr_repository" "backend" {
  name = "url-shortener-backend"

  image_scanning_configuration {
    scan_on_push = true
  }

  force_delete = true
}