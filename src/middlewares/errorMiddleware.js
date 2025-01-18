const errorMiddleWare = (err, _, res, next) => {
  res.status(err.statusCode).json({ status: "failue", message: err.message });
};
export default errorMiddleWare;
