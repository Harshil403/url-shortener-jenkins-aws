variable "aws_region" {
  default = "ap-south-1"
}

variable "project_name" {
  default = "url-shortener"
}

variable "grafana_admin_password" {
  description = "Admin password for Grafana"
  type        = string
  sensitive   = true
}