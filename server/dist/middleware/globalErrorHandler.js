const globalErrorHandler = (err, req, res, next) => {
    void req;
    void next;
    const error = err;
    if (error?.isOperational === true && error.statusCode) {
        res.status(error.statusCode).json({
            status: error.status,
            message: error.message,
        });
        return;
    }
    console.error("Unhandled error:", err);
    res.status(500).json({
        status: "error",
        message: "Something went wrong",
    });
};
export default globalErrorHandler;
