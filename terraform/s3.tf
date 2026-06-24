resource "random_id" "pipeline" {
  byte_length = 4
}

resource "aws_s3_bucket" "pipeline_bucket" {
  bucket = "url-shortener-pipeline-${random_id.pipeline.hex}"
}
