interface ZealError {
  code: number;
  message: string;
}

export class ZealException extends Error {
  readonly status: number;
  readonly errors: ZealError[];
  readonly name = "ZealException";

  constructor(errors: ZealError[], status?: number) {
    const message: string[] = ["Zeal Errors:"];
    errors.forEach((e) => {
      message.push(`=> Code ${e.code} | ${e.message}`);
    });

    super(message.join("\n"));
    this.status = status || 500;
    this.errors = errors;
  }

  static fromUndefinedError(message: string): ZealException {
    return new ZealException([{ code: 500, message }]);
  }
}
