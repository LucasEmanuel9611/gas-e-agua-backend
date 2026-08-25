import {
  collectDefaultMetrics,
  Counter,
  Gauge,
  Histogram,
  register,
} from "prom-client";

class MetricsService {
  private httpRequestsTotal: Counter<string>;
  private httpRequestDuration: Histogram<string>;
  private activeConnections: Gauge<string>;
  private databaseConnections: Gauge<string>;
  private notificationsSentTotal: Counter<string>;
  private notificationsDeliveredTotal: Counter<string>;
  private notificationsFailedTotal: Counter<string>;
  private notificationDeliveryRate: Gauge<string>;
  private notificationProcessingDuration: Histogram<string>;
  private notificationQueueSize: Gauge<string>;

  constructor() {
    collectDefaultMetrics({ register });

    this.httpRequestsTotal = new Counter({
      name: "http_requests_total",
      help: "Total number of HTTP requests",
      labelNames: ["method", "route", "status"],
      registers: [register],
    });

    this.httpRequestDuration = new Histogram({
      name: "http_request_duration_seconds",
      help: "HTTP request duration in seconds",
      labelNames: ["method", "route", "status"],
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
      registers: [register],
    });

    this.activeConnections = new Gauge({
      name: "nodejs_active_connections",
      help: "Number of active connections",
      registers: [register],
    });

    this.databaseConnections = new Gauge({
      name: "database_connections_active",
      help: "Number of active database connections",
      registers: [register],
    });

    this.notificationsSentTotal = new Counter({
      name: "notifications_sent_total",
      help: "Total number of notifications sent",
      labelNames: ["type", "priority"],
      registers: [register],
    });

    this.notificationsDeliveredTotal = new Counter({
      name: "notifications_delivered_total",
      help: "Total number of notifications successfully delivered",
      labelNames: ["type"],
      registers: [register],
    });

    this.notificationsFailedTotal = new Counter({
      name: "notifications_failed_total",
      help: "Total number of notifications that failed to deliver",
      labelNames: ["type", "reason"],
      registers: [register],
    });

    this.notificationDeliveryRate = new Gauge({
      name: "notification_delivery_rate",
      help: "Current notification delivery success rate (percentage)",
      registers: [register],
    });

    this.notificationProcessingDuration = new Histogram({
      name: "notification_processing_duration_seconds",
      help: "Time taken to process and send notifications",
      labelNames: ["type", "job_type"],
      buckets: [0.1, 0.5, 1, 2, 5, 10, 30],
      registers: [register],
    });

    this.notificationQueueSize = new Gauge({
      name: "notification_queue_size",
      help: "Current size of the notification queue",
      labelNames: ["status"],
      registers: [register],
    });
  }

  recordHttpRequest(
    method: string,
    route: string,
    status: number,
    duration: number
  ): void {
    this.httpRequestsTotal.labels(method, route, status.toString()).inc();
    this.httpRequestDuration
      .labels(method, route, status.toString())
      .observe(duration);
  }

  setActiveConnections(count: number): void {
    this.activeConnections.set(count);
  }

  setDatabaseConnections(count: number): void {
    this.databaseConnections.set(count);
  }

  recordNotificationSent(type: string, priority: string): void {
    this.notificationsSentTotal.labels(type, priority).inc();
  }

  recordNotificationDelivered(type: string): void {
    this.notificationsDeliveredTotal.labels(type).inc();
  }

  recordNotificationFailed(type: string, reason: string): void {
    this.notificationsFailedTotal.labels(type, reason).inc();
  }

  updateNotificationDeliveryRate(rate: number): void {
    this.notificationDeliveryRate.set(rate);
  }

  recordNotificationProcessingDuration(
    type: string,
    jobType: string,
    duration: number
  ): void {
    this.notificationProcessingDuration.labels(type, jobType).observe(duration);
  }

  setNotificationQueueSize(status: string, size: number): void {
    this.notificationQueueSize.labels(status).set(size);
  }

  getMetrics(): Promise<string> {
    return register.metrics();
  }

  getRegister() {
    return register;
  }
}

export const metricsService = new MetricsService();
