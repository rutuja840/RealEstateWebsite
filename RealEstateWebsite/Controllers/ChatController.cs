using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using RealEstate.API.Hubs;

namespace RealEstate.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChatController : ControllerBase
    {
        private readonly IHubContext<ChatHub> _hubContext;

        public ChatController(IHubContext<ChatHub> hubContext)
        {
            _hubContext = hubContext;
        }

        // GET: /api/chat/status
        [HttpGet("status")]
        public IActionResult Status()
        {
            return Ok(new
            {
                success = true,
                message = "ChatHub service is running.",
                hubUrl = "/hubs/chat"
            });
        }

        // GET: /api/chat/broadcast?user=name&message=hello
        [HttpGet("broadcast")]
        public async Task<IActionResult> Broadcast([FromQuery] string? user, [FromQuery] string? message)
        {
            if (string.IsNullOrWhiteSpace(message))
                return BadRequest(new { success = false, message = "Please provide a message query parameter." });

            await _hubContext.Clients.All.SendAsync("ReceiveMessage", user ?? "Server", message);

            return Ok(new { success = true, message = "Message broadcasted." });
        }

        // GET: /chatHub  (simple info page so navigating to /chatHub doesn't 404)
        [HttpGet]
        [Route("/chatHub")]
        public IActionResult ChatHubPage()
        {
            var html = @"<!doctype html>
<html>
<head>
  <meta charset='utf-8' />
  <title>ChatHub</title>
</head>
<body>
  <h2>ChatHub</h2>
  <p>This endpoint shows info about the SignalR ChatHub.</p>
  <ul>
    <li>Hub endpoint: <code>/hubs/chat</code></li>
    <li>To test broadcast via HTTP: <code>/api/chat/broadcast?message=hello&user=server</code></li>
  </ul>
  <p>Use a SignalR client to connect to the hub URL above.</p>
</body>
</html>";

            return new ContentResult
            {
                Content = html,
                ContentType = "text/html",
                StatusCode = 200
            };
        }
    }
}
