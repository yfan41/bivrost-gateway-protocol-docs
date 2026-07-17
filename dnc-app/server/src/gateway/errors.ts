/** Gateway error with the protocol's errorCode/errorMsg plus a plain-language explanation. */
export class GatewayError extends Error {
  constructor(
    public readonly errorCode: number | null,
    public readonly errorMsg: string,
    public readonly statusMsg?: string,
  ) {
    super(errorMsg);
    this.name = 'GatewayError';
  }

  get explanation(): string {
    return explainGatewayError(this.errorCode, this.errorMsg);
  }
}

export function explainGatewayError(code: number | null, msg: string): string {
  switch (code) {
    case 142:
      return 'A file with this name already exists on the control. Controls do not support overwriting — the existing file must be deleted first.';
    case 158:
      return 'The control reports the path or file was not found (or no program is currently running).';
    case 10003:
      return 'The gateway does not know this machineID. The machine may have been removed or renamed in the gateway configuration.';
    case null:
      return `The gateway could not be reached: ${msg}. Check the gateway connection and network.`;
    default:
      return `The gateway reported an error (code ${code}): ${msg}.`;
  }
}

export const ERROR_FILE_EXISTS = 142;
export const ERROR_PATH_NOT_FOUND = 158;
export const ERROR_UNKNOWN_MACHINE = 10003;
