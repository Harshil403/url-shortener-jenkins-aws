resource "kubernetes_namespace" "monitoring" {
  metadata {
    name = "monitoring"
  }
}

resource "helm_release" "kube_prometheus_stack" {
  name       = "kube-prometheus-stack"
  repository = "https://prometheus-community.github.io/helm-charts"
  chart      = "kube-prometheus-stack"
  namespace  = kubernetes_namespace.monitoring.metadata[0].name

  set {
    name  = "prometheus.prometheusSpec.resources.requests.cpu"
    value = "100m"
  }
  set {
    name  = "prometheus.prometheusSpec.resources.requests.memory"
    value = "256Mi"
  }
  set {
    name  = "prometheus.prometheusSpec.retention"
    value = "3d"
  }
  set {
    name  = "grafana.service.type"
    value = "ClusterIP"
  }
  set {
    name  = "grafana.adminPassword"
    value = var.grafana_admin_password
  }

  depends_on = [kubernetes_namespace.monitoring]
}