using System.Threading.Tasks;

namespace RealEstate.BLL.Services
{
    public interface IEmailService
    {
        Task SendAsync(string to, string subject, string body, bool isHtml = true);
    }
}
