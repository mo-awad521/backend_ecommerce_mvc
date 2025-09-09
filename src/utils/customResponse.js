// response.js
export class ResponseStatus {
  static OK = { code: 200, status: "OK", success: true };
  static RESOURCE_CREATED = {
    code: 201,
    status: "RESOURCE_CREATED",
    success: true,
  };
  static BAD_REQUEST = { code: 400, status: "BAD_REQUEST", success: false };
  static UNAUTHORIZED = { code: 401, status: "UNAUTHORIZED", success: false };
  static FORBIDDEN = { code: 403, status: "FORBIDDEN", success: false };
  static NOT_FOUND = { code: 404, status: "NOT_FOUND", success: false };
  static INTERNAL_SERVER_ERROR = {
    code: 500,
    status: "INTERNAL_SERVER_ERROR",
    success: false,
  };
}

export class CustomResponse {
  constructor(status, message, data, error) {
    this.status = status;
    this.message = message;
    this.data = data;
    this.error = error;
  }
}
