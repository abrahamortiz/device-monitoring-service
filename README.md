# 🌐 Smart Device Monitoring Service - Monorepo PoC

Welcome to the **Smart Device Monitoring PoC**. This is a monorepo consisting of a central monitoring orchestrator and a fleet of emulated networking hardware. This setup was specifically designed to provide a "live" hardware monitoring demonstration.

## 📁 Monorepo Structure

```text
.
├── apps/
│   ├── monitoring-service/    # The core orchestrator (Fastify, PostgreSQL)
│   └── device-emulator/      # Hardware emulator for routers, cameras, etc.
├── packages/
│   └── shared/               # Shared TypeScript types
└── docker-compose.yml        # Orchestration for the full "Hardware Farm"
```

## 🏗️ The "Hardware Farm" Orchestration

To satisfy the **PoC life-cycle** requirements, we use Docker Compose to spin up a realistic environment. This allows us to test the service against multiple device types and networking conditions without physical hardware.

- **Central Orchestrator**: One instance of the `monitoring-service`.
- **Fleet of Emulators**: Four instances of the `device-emulator` with different "personalities":
  - **Device 1 (Router)**: Stable REST device.
  - **Device 2 (Switch)**: Stable gRPC-capable device simulation.
  - **Device 3 (Camera)**: Stable REST device.
  - **Device 4 (Door Access)**: **Unstable Mode** enabled (simulates package drops and health failures to demonstrate our retry logic).

## 🚀 Getting Started (Fast Setup)

You can launch the entire ecosystem with a single command. This builds the images from source, initializes the PostgreSQL database, and starts the heartbeat monitoring cycle.

```bash
docker compose up -d
```

| Service                 | Access Link                                                  | Description                          |
| ----------------------- | ------------------------------------------------------------ | ------------------------------------ |
| **API Base URL**        | [http://localhost:3000](http://localhost:3000)               | Main monitoring REST endpoints       |
| **API Documentation**   | [http://localhost:3000/docs](http://localhost:3000/docs)     | Swagger UI for live testing          |
| **Device 1**            | [http://localhost:4001/health](http://localhost:4001/health) | Emulated Router                      |
| **Device 4 (Unstable)** | [http://localhost:4004/health](http://localhost:4004/health) | Emulated "Smart Lock" on shaky Wi-Fi |

## 🛠️ Main Components

### 1. Monitoring Service

The brain of the operation. It performs the "Heartbeat" cycle, discovering device capabilities, fetching diagnostics, and persisting everything to Postgres.

- [Read Monitoring README](apps/monitoring-service/README.md)

### 2. Device Emulator

A programmable emulator that mimics our upcoming hardware line. It supports toggling "Unstable Mode" to verify that our monitoring software doesn't produce false alarms.

- [Read Emulator README](apps/device-emulator/README.md)

## 🧪 Testing the Whole PoC

Testing is a first-class citizen in this PoC. We ensure valid results by running unit tests in isolation and integration tests via the Docker lifecycle.

```bash
# Run all unit tests
pnpm run test

# Check coverage for the application logic
pnpm run test:coverage
```

## 📝 Trade-offs & Future Considerations

- **gRPC Simulation**: The emulator reveals gRPC capabilities via its health endpoint. The monitoring service is decoupled to allow adding a gRPC client seamlessly when the real hardware arrives.
- **Unstable Networks**: We implemented a `RetryHttpClient` specifically to handle the "Device 4" scenario, ensuring that intermittency doesn't compromise the trade show demo.
- **External Binary**: The system includes a `IChecksumValidator` interface. Currently, it uses a placeholder service, ready to wrap the external checksum generator binary once available.

## 🤖 AI Assistance Disclosure

Some parts of this PoC (ChecksumValidator service, Vitest implementation, and documentation) were co-developed with **Antigravity by Google DeepMind**. This allowed me to build a PoC in a fraction of the time required for a manual build.
