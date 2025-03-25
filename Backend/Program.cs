var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy => policy.WithOrigins(
                "http://localhost:5173",
                "https://your-azure-url.azurewebsites.net"
            )
            .AllowAnyMethod()
            .AllowAnyHeader());
});

// Database
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

// Middleware pipeline
app.UseDefaultFiles();
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(builder.Environment.ContentRootPath, "ClientApp")),
    RequestPath = ""
});

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseCors("AllowFrontend");

    // Launch Vite dev server
    var frontendPath = Path.Combine(app.Environment.ContentRootPath, "../Frontend");
    if (Directory.Exists(frontendPath))
    {
        Console.WriteLine("\n> Starting Vite Dev Server...");
        Process.Start(new ProcessStartInfo
        {
            FileName = "npm",
            Arguments = "run dev",
            WorkingDirectory = frontendPath,
            UseShellExecute = false
        });
    }
}
else
{
    // Production settings
    app.UseHttpsRedirection();
}

app.UseAuthorization();
app.MapControllers();
app.MapFallbackToFile("index.html");  // Critical for SPA routing
app.Run();