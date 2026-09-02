using RealEstate.BLL.DTOs.Auth;

namespace RealEstate.BLL.Interfaces
{
    public interface IAuthService
    {
        Task<LoginResponseDto> RegisterAsync(
            RegisterRequestDto request);

        Task<LoginResponseDto> LoginAsync(
            LoginRequestDto request);
    }
}