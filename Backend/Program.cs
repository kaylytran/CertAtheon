using System.Diagnostics;
using Backend.Data;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Logging.AzureAppServices;

var builder = WebApplication.CreateBuilder(args);

// Configure logging
builder.Logging.AddConsole();

// Only add Azure diagnostics when running in Azure
if (builder.Environment.IsProduction())
{
    builder.Logging.AddAzureWebAppDiagnostics();
}

// Add services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173",  // Dev
                "https://your-app.azurewebsites.net"  // Production
            )
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

// Database Configuration
builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    Console.WriteLine($"Using connection string: {connectionString}");
    options.UseSqlServer(connectionString, sqlOptions =>
    {
        sqlOptions.EnableRetryOnFailure(3);
    });
});

var app = builder.Build();

// Exception handling
app.UseExceptionHandler(exceptionHandlerApp =>
{
    exceptionHandlerApp.Run(async context =>
    {
        context.Response.StatusCode = 500;
        await context.Response.WriteAsync("An unexpected error occurred");
    });
});

// Static files configuration
var clientAppPath = Path.Combine(app.Environment.ContentRootPath, "ClientApp");
if (!Directory.Exists(clientAppPath))
{
    Console.WriteLine($"Warning: ClientApp directory not found at {clientAppPath}");
}
else
{
    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new PhysicalFileProvider(clientAppPath),
        RequestPath = ""
    });
}

// Configure for development
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    
    // Launch Vite dev server
    try
    {
        var frontendPath = Path.Combine(app.Environment.ContentRootPath, "../Frontend");
        if (Directory.Exists(frontendPath))
        {
            Process.Start(new ProcessStartInfo
            {
                FileName = "npm",
                Arguments = "run dev",
                WorkingDirectory = frontendPath,
                UseShellExecute = false,
                RedirectStandardOutput = true,
                RedirectStandardError = true
            });
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Failed to start Vite: {ex.Message}");
    }
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseAuthorization();

app.MapControllers();
app.MapFallbackToFile("index.html");  // For SPA routing

try
{
    Console.WriteLine("Starting application...");
    app.Run();
}
catch (Exception ex)
{
    Console.WriteLine($"Application failed to start: {ex}");
    throw;
}