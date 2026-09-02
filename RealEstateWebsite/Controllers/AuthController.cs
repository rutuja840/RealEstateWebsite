using Microsoft.AspNetCore.Mvc;
using RealEstate.BLL.DTOs.Auth;
using RealEstate.BLL.Interfaces;

namespace RealEstate.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        // =====================================================
        // REGISTER
        // POST: api/Auth/register
        // =====================================================

        [HttpPost("register")]
        public async Task<IActionResult> Register(
            [FromBody] RegisterRequestDto request)
        {
            var result =
                await _authService.RegisterAsync(request);

            return Ok(new
            {
                success = true,
                message = "User registered successfully.",
                data = result
            });
        }

        // =====================================================
        // LOGIN
        // POST: api/Auth/login
        // =====================================================

        [HttpPost("login")]
        public async Task<IActionResult> Login(
            [FromBody] LoginRequestDto request)
        {
            var result =
                await _authService.LoginAsync(request);

            return Ok(new
            {
                success = true,
                message = "Login successful.",
                data = result
            });
        }
    }
}