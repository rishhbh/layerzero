const handleError = (err, req, res, next) => {
    if(process.env.NODE_ENV === 'development') {
        console.log(`\nMessage: ${err.customMessage}\nError: ${err.message}\nStack: ${err.stack}`);
        return res.status(500).json({
            message: err.customMessage || "Something went wrong",
            error: err.message,
            stack: err.stack
        });
    }
    return res.status(500).json({
        error: 'Internal server error occured'
    });
};

export default handleError;