export class ApiError extends Error {
  public status: number;
  public data?: Record<string, string | string[]>;

  constructor(
    message: string,
    status: number,
    data?: Record<string, string | string[]>
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;

    // Set the prototype explicitly when extending a built-in class
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}
