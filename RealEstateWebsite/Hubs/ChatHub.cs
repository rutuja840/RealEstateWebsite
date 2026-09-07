using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;

namespace RealEstate.API.Hubs;

public class ChatHub : Hub
{
    private readonly ILogger<ChatHub> _logger;

    public ChatHub(ILogger<ChatHub> logger)
    {
        _logger = logger;
    }

    public override async Task OnConnectedAsync()
    {
        _logger.LogInformation("ChatHub connected: {ConnectionId}", Context.ConnectionId);
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        if (exception == null)
            _logger.LogInformation("ChatHub disconnected: {ConnectionId}", Context.ConnectionId);
        else
            _logger.LogWarning(exception, "ChatHub disconnected with error: {ConnectionId}", Context.ConnectionId);

        await base.OnDisconnectedAsync(exception);
    }

    // Send message to all connected clients
    public async Task SendMessage(string user, string message)
    {
        _logger.LogInformation("SendMessage from {User}: {Message}", user, message);
        await Clients.All.SendAsync("ReceiveMessage", user, message);
    }

    // Send message to a specific group
    public async Task SendToGroup(string groupName, string user, string message)
    {
        _logger.LogInformation("SendToGroup {Group} from {User}: {Message}", groupName, user, message);
        await Clients.Group(groupName).SendAsync("ReceiveMessage", user, message);
    }

    public async Task JoinGroup(string groupName)
    {
        _logger.LogInformation("Connection {ConnectionId} joining group {Group}", Context.ConnectionId, groupName);
        await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
    }

    public async Task LeaveGroup(string groupName)
    {
        _logger.LogInformation("Connection {ConnectionId} leaving group {Group}", Context.ConnectionId, groupName);
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
    }
}
