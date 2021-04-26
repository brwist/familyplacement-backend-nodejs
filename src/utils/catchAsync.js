import httpStatus from "http-status";

const catchAsync = (fn, customError) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ success: false, message: err?.message });
  });
};

export default catchAsync;
