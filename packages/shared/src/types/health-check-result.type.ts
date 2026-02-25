export type HealthCheckResult = {
  status: "UP" | "DOWN";
  timestamp: string;
  capabilities: {
    protocol: "REST" | "gRPC";
  };
};
