# Monitoring Service Backend

This is the core Node.js backend for the Smart Device Monitoring PoC. It handles the orchestration of device health checks, status persistence, and provides a RESTful API for management.

## 📁 Project Structure

- `src/modules`: Domain-driven modular structure.
  - `device`: Device management (models, instances, repositories).
  - `monitoring`: The core "Heartbeat" logic and health-check implementations.
- `src/infrastructure`: External concerns (HTTP client, DB schema, Swagger config).
- `src/shared`: Global error handlers, common types, and Zod schemas.

## ⚙️ Configuration

The service is configured via environment variables (see `.env.example`):

| Variable       | Description                | Default |
| -------------- | -------------------------- | ------- |
| `PORT`         | Service port               | 3000    |
| `DATABASE_URL` | Postgres connection string | -       |
| `MAX_RETRIES`  | Max health check retries   | 3       |
| `TIMEOUT_MS`   | Timeout per request        | 2000    |
| `INTERVAL_MS`  | Monitoring cycle frequency | 30000   |

## 🧬 Domain Logic: The Health Check Lifecycle

The monitoring cycle (`MonitoringService.executeMonitoringCycle`) follows these steps for each device:

1. **Capability Discovery**: Call the `/health` endpoint to get supported protocols (REST/gRPC).
2. **Diagnostic Retrieval**: Based on the discovery, call the diagnostics endpoint to get:
   - Status (`UP`, `DOWN`, etc.)
   - OS Versions (HW, SW, FW)
   - Checksum
3. **Status Resolution**:
   - **ONLINE**: Health is UP and diagnostics succeeded.
   - **DEGRADED**: Health is not UP or diagnostics failed, but device responded.
   - **OFFLINE**: No response within timeout and retries.
4. **Persistence**: The result is logged to `device_status_log` and the `devices` table is updated with the latest state.

## 🛠️ Development

### Local Setup

1. `pnpm install`
2. `pnpm db:push` (ensure DB is running)
3. `pnpm dev`

### Adding New Protocols

To add gRPC support, implement the `IHttpClient` interface or create a new dedicated service in `src/modules/monitoring/application` and update the `HealthCheckService` to toggle based on the capability discovery result.

## 🔍 Code Quality & Standards

- **Type Safety**: No `any` types allowed (strictly enforced via ESLint).
- **Validation**: Every request and response is validated with Zod.
- **Testing**: TDD approach for application services using Vitest.
