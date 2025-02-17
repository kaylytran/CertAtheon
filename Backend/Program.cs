using System.Diagnostics;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Serve static files for the frontend build
builder.Services.AddSpaStaticFiles(configuration =>
{
    configuration.RootPath = "dist"; // React build output directory
});

var app = builder.Build();

// Enable Swagger in development
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Middleware
app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseAuthorization();
app.MapControllers();

// Start frontend automatically if it's not running
if (app.Environment.IsDevelopment())
{
    StartFrontendServer();
    app.UseSpa(spa =>
    {
        spa.UseProxyToSpaDevelopmentServer("http://localhost:5173");
    });
}

app.Run();

// Function to start the frontend server automatically
void StartFrontendServer()
{
    var frontendPath = Path.Combine(Directory.GetCurrentDirectory(), "../Frontend");
    var startInfo = new ProcessStartInfo
    {
        FileName = "npm",
        Arguments = "run dev",
        WorkingDirectory = frontendPath,
        RedirectStandardOutput = true,
        RedirectStandardError = true,
        UseShellExecute = false,
        CreateNoWindow = true
    };

    try
    {
        var process = new Process { StartInfo = startInfo };
        process.OutputDataReceived += (sender, args) => Console.WriteLine(args.Data);
        process.ErrorDataReceived += (sender, args) => Console.WriteLine("Error: " + args.Data);
        process.Start();
        process.BeginOutputReadLine();
        process.BeginErrorReadLine();
        Console.WriteLine("Frontend server started...");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Failed to start frontend: {ex.Message}");
    }
}
