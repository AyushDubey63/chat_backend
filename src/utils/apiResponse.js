class APIResponse {
  constructor({ message, data, status_code, status = "success" }) {
    this.status = status;
    this.status_code = status_code;
    this.message = message;
    this.data = data;
  }
}
export default APIResponse;
