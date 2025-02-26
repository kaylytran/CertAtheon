using Backend.Data;
using Backend.Models;
using Backend.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using System.Diagnostics;

var builder = WebApplication.CreateBuilder(args);

// Add services to the dependency injection container.

builder.Services.AddControllersWithViews();

// Configure EF Core with SQL Server
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DbConnection")));

// Register Identity services
builder.Services.AddIdentity<ApplicationUser, IdentityRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();

// Register our Azure Service Bus messaging service as a singleton.
builder.Services.AddSingleton<IMessageSenderService, ServiceBusSenderService>();

// Configure cookie settings for authentication
builder.Services.ConfigureApplicationCookie(options =>
{
    options.LoginPath = "/Account/Login"; 
    options.AccessDeniedPath = "/Account/AccessDenied";
});


builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo 
    { 
        Title = "CertAethon API", 
        Version = "v1" 
    });
    
    // Define the BearerAuth scheme.
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Please insert JWT with Bearer into field. Example: \"Bearer {token}\"",
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        BearerFormat = "JWT",
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme 
            {
                Reference = new OpenApiReference 
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] { }
        }
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();

    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
    StartFrontendServer();

    app.UseStaticFiles(); // Enables serving static files from wwwroot
    app.UseSpa(spa =>
    {
        spa.Options.SourcePath = "wwwroot"; // Serve from wwwroot
    });
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

// Enable authentication and authorization middleware
app.UseAuthentication();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");


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
