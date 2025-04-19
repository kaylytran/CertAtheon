using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Http;
using System;
using System.IO;
using System.Threading.Tasks;

namespace Backend.Services
{
    public class BlobService : IBlobService, IAsyncDisposable
    {
        private readonly string _connectionString;
        private readonly BlobContainerClient _defaultContainerClient;
        private readonly string _defaultContainerName;

        public BlobService(IConfiguration configuration)
        {
            _connectionString = configuration["AzureBlobStorage:ConnectionString"]
                                ?? throw new ArgumentNullException("AzureBlobStorage:ConnectionString");
            _defaultContainerName = configuration["AzureBlobStorage:ContainerName"]
                                    ?? throw new ArgumentNullException("AzureBlobStorage:ContainerName");

            // Initialize default container client (for profile pictures)
            _defaultContainerClient = new BlobContainerClient(_connectionString, _defaultContainerName);
            _defaultContainerClient.CreateIfNotExists(PublicAccessType.Blob);
        }

        /// <summary>
        /// Uploads to the default (profilepictures) container.
        /// </summary>
        public Task<string> UploadFileAsync(IFormFile file, string blobName)
        {
            return UploadFileAsync(file, blobName, _defaultContainerName);
        }

        /// <summary>
        /// Uploads to a specified container (creating it if it doesn't exist).
        /// </summary>
        public async Task<string> UploadFileAsync(IFormFile file, string blobName, string containerName)
        {
            if (file == null) throw new ArgumentNullException(nameof(file));
            if (string.IsNullOrWhiteSpace(containerName)) throw new ArgumentNullException(nameof(containerName));

            var containerClient = new BlobContainerClient(_connectionString, containerName);
            await containerClient.CreateIfNotExistsAsync(PublicAccessType.Blob);

            var blobClient = containerClient.GetBlobClient(blobName);
            using (var stream = file.OpenReadStream())
            {
                await blobClient.UploadAsync(stream, new BlobHttpHeaders { ContentType = file.ContentType });
            }
            return blobClient.Uri.ToString();
        }

        public ValueTask DisposeAsync()
        {
            // BlobContainerClient does not implement IDisposable.
            return ValueTask.CompletedTask;
        }
    }
}
