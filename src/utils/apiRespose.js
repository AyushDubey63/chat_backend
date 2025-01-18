class APIRespose {
  constructor({ message, data, status_code, status }) {
    this.message = message;
    this.data = data;
    this.status_code = status_code;
    this.status = "success";
  }
}
export default APIRespose;
