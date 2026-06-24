module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.0"

  cluster_name    = "url-shortener-cluster"
  cluster_version = "1.33"

  cluster_endpoint_public_access  = true
  cluster_endpoint_private_access = true

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  enable_cluster_creator_admin_permissions = true

  eks_managed_node_groups = {
    main = {
      desired_size = 2
      min_size     = 2
      max_size     = 3

      instance_types = ["t3.micro"]

      capacity_type = "ON_DEMAND"
    }
  }

  tags = {
    Project = "url-shortener"
  }
}

resource "aws_eks_access_entry" "codebuild" {
  cluster_name  = module.eks.cluster_name
  principal_arn = aws_iam_role.codebuild_role.arn
  type          = "STANDARD"
}

resource "aws_eks_access_policy_association" "codebuild_admin" {
  cluster_name  = module.eks.cluster_name
  principal_arn = aws_eks_access_entry.codebuild.principal_arn

  policy_arn = "arn:aws:eks::aws:cluster-access-policy/AmazonEKSClusterAdminPolicy"

  access_scope {
    type = "cluster"
  }
}