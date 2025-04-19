using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace Backend.Services
{
    public interface IBlobService
    {
        // existing
        Task<string> UploadFileAsync(IFormFile file, string blobName);

        // new overload
        Task<string> UploadFileAsync(IFormFile file, string blobName, string containerName);
    }
}
