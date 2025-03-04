const errorMiddleWare = (err, _, res, next) => {
  res.status(err.statusCode).json({ status: "failure", message: err.message });
};
export default errorMiddleWare;
