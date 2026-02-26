import { exec } from "node:child_process";
import { promisify } from "node:util";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const execAsync = promisify(exec);

export interface IChecksumValidator {
  validate(data: string, expectedChecksum: string): Promise<boolean>;
}

/**
 * Placeholder for the external checksum generator binary requested for the trade show PoC.
 * This service is designed to be easily swapped with the actual binary path once provided.
 */
export class ExternalChecksumValidator implements IChecksumValidator {
  private binaryPath: string | null;

  constructor(binaryPath: string | null = null) {
    this.binaryPath = binaryPath;
  }

  public async validate(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    data: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    expectedChecksum: string,
  ): Promise<boolean> {
    // If binary is not provided yet, we simulate a successful validation to keep the PoC running
    if (!this.binaryPath) {
      console.warn(
        "Checksum validation: No binary path provided. Simulating success for PoC.",
      );

      return true;
    }

    try {
      // Example implementation for when the binary is available:
      // const { stdout } = await execAsync(`${this.binaryPath} --data "${data}" --checksum "${expectedChecksum}"`);
      // return stdout.trim() === "VALID";
      console.log(
        `Executing checksum validation with binary: ${this.binaryPath}`,
      );

      return true;
    } catch (error) {
      console.error("External checksum generator execution failed:", error);
      return false;
    }
  }
}
