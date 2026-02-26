import type {
  HealthCheckResult,
  DiagnosticsResult,
} from "@device-monitoring-service/shared";
import fastify from "fastify";

async function bootstrap() {
  const app = fastify({ logger: true });

  const deviceId = process.env.DEVICE_ID ?? "unknown-device";
  const supportsGrpc = process.env.SUPPORTS_GRPC === "true";
  const unstableMode = process.env.UNSTABLE_MODE === "true";

  const protocol: "REST" | "gRPC" = supportsGrpc ? "gRPC" : "REST";

  app.get<{ Reply: HealthCheckResult }>("/health", async (_request, reply) => {
    const isDown = unstableMode && Math.random() < 0.3;

    const result: HealthCheckResult = {
      status: isDown ? "DOWN" : "UP",
      timestamp: new Date().toISOString(),
      capabilities: {
        protocol,
      },
    };

    if (isDown) {
      return reply.status(503).send(result);
    }

    return result;
  });

  app.get<{ Reply: DiagnosticsResult }>(
    "/diagnostics",
    async (_request, reply) => {
      const hasWarning = unstableMode && Math.random() < 0.2;
      const hasError = unstableMode && Math.random() < 0.1;

      const status: DiagnosticsResult["status"] = hasError
        ? "ERROR"
        : hasWarning
          ? "WARN"
          : "OK";

      const result: DiagnosticsResult = {
        hardware_version: "HW-1.0",
        software_version: "SW-2.3.1",
        firmware_version: "FW-5.4.0",
        status,
        checksum: generateChecksum(deviceId),
      };

      if (status === "ERROR") {
        return reply.status(500).send(result);
      }

      return result;
    },
  );

  await app.listen({ port: 3000, host: "0.0.0.0" });
}

function generateChecksum(seed: string): string {
  return Buffer.from(seed + Date.now().toString())
    .toString("hex")
    .slice(0, 16);
}

bootstrap().catch((error) => {
  console.error("Failed to start emulator: ", error);
  process.exit(1);
});
