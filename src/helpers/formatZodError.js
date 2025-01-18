export const formatZodErrors = (error, res) => {
  return res.status(422).json({
    success: false,
    message: "Invalid Data Inputed",
    error: error.issues.map((e) => ({
      [e.path[0]]: e.message,
    })),
  });
};
