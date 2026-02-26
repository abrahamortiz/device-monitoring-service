# 🛠️ Device Emulator - Hardware Simulator

The **Device Emulator** is a programmable simulator built to mimic networking hardware (routers, switches, cameras, and IoT devices).

It is used in this PoC to provide a "live" hardware farm that the **Monitoring Service** can interact with during the trade show.

## 🚀 Key Features

- **Protocol Discovery**: Implements a standard `/health` endpoint that exposes device capabilities (REST/gRPC).
- **Diagnostics API**: Provides a `/diagnostics` endpoint that returns real-time hardware, software, and firmware versioning and a unique device status.
- **Dynamic Checksum Generation**: Mimics the behavior of an on-device checksum generator.
- **Unstable Network Mode**: Can be toggled via environment variables to simulate "shaky" Wi-Fi or packet loss.

## ⚙️ Configuration

The emulator's personality is defined via environment variables in the:

| Variable        | Description            | Example           |
| --------------- | ---------------------- | ----------------- |
| `DEVICE_ID`     | String identifier      | `router-1`        |
| `SUPPORTS_GRPC` | Reveal gRPC capability | `true` or `false` |
| `UNSTABLE_MODE` | Enable random failures | `true` or `false` |

## 🧪 Simulation Personalities

In our `docker-compose.yml`, we've configured 4 instances to simulate a real-world scenario:

1. **Device 1 (Stable REST)**: Standard device behavior.
2. **Device 2 (gRPC Capability)**: Signals support for gRPC through the health discovery protocol.
3. **Device 3 (Stable REST)**: Standard device behavior.
4. **Device 4 (Unstable REST)**: Simulates a device on a distant, unstable network. Failing 30% of the time to verify that the monitoring service's **Retry Logic** works as expected.

## 🛠️ Local Development

```bash
# Install dependencies
pnpm install

# Start in development mode
# Configure your "personality" in .env or prefixed:
DEVICE_ID=my-iotSUPPORTS_GRPC=true UNSTABLE_MODE=false pnpm dev
```

## 📋 API Spec (Internal)

| Endpoint       | Method | Description                                                 |
| -------------- | ------ | ----------------------------------------------------------- |
| `/health`      | `GET`  | Returns status (`UP`/`DOWN`) and protocol capabilities.     |
| `/diagnostics` | `GET`  | Returns full versioning snapshot (HW, SW, FW) and checksum. |
