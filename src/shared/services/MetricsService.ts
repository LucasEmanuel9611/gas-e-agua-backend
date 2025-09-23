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

  getMetrics(): Promise<string> {
    return register.metrics();
  }

  getRegister() {
    return register;
  }
}

export const metricsService = new MetricsService();
