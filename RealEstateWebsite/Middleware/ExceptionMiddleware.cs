using System.Net;
using System.Text.Json;

namespace RealEstate.API.Middleware
{
    public class ExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionMiddleware> _logger;

        public ExceptionMiddleware(
            RequestDelegate next,
            ILogger<ExceptionMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Unhandled exception occurred. Request: {Method} {Path}",
                    context.Request.Method,
                    context.Request.Path);

                await HandleExceptionAsync(
                    context,
                    ex);
            }
        }

        private static async Task HandleExceptionAsync(
       HttpContext context,
       Exception exception)
        {
            context.Response.ContentType = "application/json";

            int statusCode;
            string message;

            switch (exception)
            {
                case ArgumentException:
                    statusCode = (int)HttpStatusCode.BadRequest;
                    message = exception.Message;
                    break;

                case UnauthorizedAccessException:
                    statusCode = (int)HttpStatusCode.Unauthorized;
                    message = exception.Message;
                    break;

                case KeyNotFoundException:
                    statusCode = (int)HttpStatusCode.NotFound;
                    message = exception.Message;
                    break;

                case InvalidOperationException:
                    statusCode = (int)HttpStatusCode.BadRequest;
                    message = exception.Message;
                    break;

                default:
                    statusCode = (int)HttpStatusCode.InternalServerError;

                    // Default to generic message
                    message = exception.Message;
                    break;
            }

            context.Response.StatusCode = statusCode;

            // If running in Development, include full exception details to help debugging
            var env = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
            object response;

            if (!string.IsNullOrEmpty(env) && env.Equals("Development", StringComparison.OrdinalIgnoreCase))
            {
                response = new
                {
                    success = false,
                    statusCode = statusCode,
                    message = message,
                    error = exception.ToString()
                };
            }
            else
            {
                response = new
                {
                    success = false,
                    statusCode = statusCode,
                    message = message
                };
            }

            var json = JsonSerializer.Serialize(response);

            await context.Response.WriteAsync(json);
        }
    }
}