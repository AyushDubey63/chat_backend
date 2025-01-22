class APIResponse {
  constructor({ message, data, status_code, status }) {
    this.status = "success";
    this.status_code = status_code;
    this.message = message;
    this.data = data;
  }
}
export default APIResponse;
