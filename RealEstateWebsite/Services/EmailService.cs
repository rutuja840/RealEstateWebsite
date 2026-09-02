using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using System;

namespace RealEstateWebsite.Services
{
    public class SmtpOptions
    {
        public string Host { get; set; } = string.Empty;
        public int Port { get; set; }
        public bool EnableSsl { get; set; }
        public string User { get; set; } = string.Empty;
        public string Pass { get; set; } = string.Empty;
        public string From { get; set; } = string.Empty;
    }

    public class EmailService : RealEstate.BLL.Services.IEmailService
    {
        private readonly SmtpOptions _options;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _logger = logger;
            _options = new SmtpOptions();
            configuration.GetSection("Smtp").Bind(_options);
        }

        public async Task SendAsync(string to, string subject, string body, bool isHtml = true)
        {
            using var message = new MailMessage();
            message.From = new MailAddress(_options.From);
            message.Subject = subject;
            message.Body = body;
            message.IsBodyHtml = isHtml;
            message.To.Add(new MailAddress(to));

            // Optionally set Reply-To to the configured user (silently ignore invalid address)
            if (!string.IsNullOrWhiteSpace(_options.User))
            {
                try
                {
                    message.ReplyToList.Add(new MailAddress(_options.User));
                }
                catch { }
            }

            using var client = new SmtpClient(_options.Host, _options.Port)
            {
                DeliveryMethod = SmtpDeliveryMethod.Network,
                UseDefaultCredentials = false,
                Credentials = new NetworkCredential(_options.User, _options.Pass),
                EnableSsl = _options.EnableSsl,
                Timeout = 100000
            };

            try
            {
                await client.SendMailAsync(message);
                _logger?.LogInformation("Email sent to {To} via {Host}:{Port}", to, _options.Host, _options.Port);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Failed to send email to {To}", to);
                throw;
            }
        }
    }
}
