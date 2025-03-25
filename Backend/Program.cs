using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Extensions.FileProviders;
using System.Diagnostics;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Middleware pipeline
app.UseHttpsRedirection();

// Static files configuration
var clientAppPath = Path.Combine(app.Environment.ContentRootPath, "ClientApp");
var fileProvider = new PhysicalFileProvider(clientAppPath);

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = fileProvider,
    ContentTypeProvider = new FileExtensionContentTypeProvider(),
    RequestPath = ""
});

// Enable CORS
app.UseCors("AllowAll");

// API routing
app.MapControllers();

// SPA fallback routing - MUST COME LAST
app.MapFallbackToFile("index.html", new StaticFileOptions
{
    FileProvider = fileProvider
});

// Development configuration
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    
    // Launch Vite dev server
    var frontendPath = Path.Combine(app.Environment.ContentRootPath, "../Frontend");
    if (Directory.Exists(frontendPath))
    {
        Process.Start(new ProcessStartInfo
        {
            FileName = "npm",
            Arguments = "run dev",
            WorkingDirectory = frontendPath,
            UseShellExecute = false
        });
    }
}

app.Run();