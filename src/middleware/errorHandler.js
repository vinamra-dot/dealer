export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: `Endpoint not found: ${req.method} ${req.originalUrl}`
  });
}

export function errorHandler(err, req, res, next) {
  console.error(`[API Error] ${req.method} ${req.url} -`, err);

  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal server error occurred.',
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
  });
}
