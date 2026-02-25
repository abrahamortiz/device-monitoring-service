export type DiagnosticsResult = {
  hardware_version: string;
  software_version: string;
  firmware_version: string;
  status: "OK" | "ERROR" | "WARN";
  checksum: string;
};
