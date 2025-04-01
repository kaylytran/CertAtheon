using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace Backend.Services
{
    public interface IBlobService
    {
        Task<string> UploadFileAsync(IFormFile file, string blobName);
    }
}
