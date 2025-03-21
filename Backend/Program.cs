using System.Diagnostics;
using Backend.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

// Services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy => policy.WithOrigins("http://localhost:5173")
                        .AllowAnyMethod()
                        .AllowAnyHeader()
                        .AllowCredentials());
});

// DB Context
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

// Serve frontend from Frontend/dist (instead of wwwroot)
var frontendBuildPath = Path.Combine(Directory.GetCurrentDirectory(), "../Frontend/dist");

if (Directory.Exists(frontendBuildPath))
{
    app.UseDefaultFiles(new DefaultFilesOptions
    {
        FileProvider = new PhysicalFileProvider(frontendBuildPath)
    });

    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new PhysicalFileProvider(frontendBuildPath),
        RequestPath = ""
    });

    app.MapFallback(context =>
    {
        context.Response.ContentType = "text/html";
        return context.Response.SendFileAsync(Path.Combine(frontendBuildPath, "index.html"));
    });
}
else
{
    Console.WriteLine("Frontend/dist not found. Static files will not be served.");
}

// Swagger only in dev
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();

    // Launch Vite dev server
    var frontendPath = Path.Combine(app.Environment.ContentRootPath, "../Frontend");
    if (Directory.Exists(frontendPath))
    {
        Console.WriteLine("\n> Starting Vite Dev Server...");
        var viteProcess = new ProcessStartInfo
        {
            FileName = "npm",
            Arguments = "run dev",
            WorkingDirectory = frontendPath,
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false,
            CreateNoWindow = false
        };

        var process = Process.Start(viteProcess);
        process.OutputDataReceived += (sender, args) => { if (args.Data != null) Console.WriteLine(args.Data); };
        process.BeginOutputReadLine();
    }
}

// Remaining middleware
app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseAuthorization();
app.MapControllers();

app.Run();
