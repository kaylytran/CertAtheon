var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add this for serving the React app
builder.Services.AddSpaStaticFiles(configuration =>
{
    configuration.RootPath = "dist"; // This will be your React build output directory
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseAuthorization();
app.MapControllers();

// Add these lines for the React app
app.UseSpa(spa =>
{
    spa.UseProxyToSpaDevelopmentServer("http://localhost:5173"); // Default Vite dev server port
});

app.Run();
