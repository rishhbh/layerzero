const handleError = (err, req, res, next) => {
    if(process.env.NODE_ENV === 'development') {
        return res.status(500).json({
            error: err.message,
            stack: err.stack
        });
    }
    return res.status(500).json({
        error: 'Internal server error occured'
    });
};

export default handleError;