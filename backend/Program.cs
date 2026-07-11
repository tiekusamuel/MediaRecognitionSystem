using Scalar.AspNetCore;
using backend.Helpers.Extensions;
using backend.Middleware;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using backend.Configuration;
using backend.Interfaces;
using backend.Services;


var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Configure OpenAPI with JWT support
builder.Services.AddOpenApi();
// Database configuration
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        sqlServerOptions => sqlServerOptions
            .EnableRetryOnFailure(
                maxRetryCount: 5,
                maxRetryDelay: TimeSpan.FromSeconds(30),
                errorNumbersToAdd: null)
            .CommandTimeout(60)));

// JWT Configuration
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
builder.Services.Configure<JwtSettings>(jwtSettings);

var jwtSecret = jwtSettings.Get<JwtSettings>()?.Secret 
    ?? throw new InvalidOperationException("JWT Secret is not configured in appsettings.json");

var jwtIssuer = jwtSettings.Get<JwtSettings>()?.Issuer 
    ?? throw new InvalidOperationException("JWT Issuer is not configured in appsettings.json");

var jwtAudience = jwtSettings.Get<JwtSettings>()?.Audience 
    ?? throw new InvalidOperationException("JWT Audience is not configured in appsettings.json");

// Authentication Configuration
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.SaveToken = true;
    options.RequireHttpsMetadata = false; // Set to true in production
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ClockSkew = TimeSpan.Zero,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret))
    };

    // Custom event handlers
    options.Events = new JwtBearerEvents
    {
        OnAuthenticationFailed = context =>
        {
            if (context.Exception.GetType() == typeof(SecurityTokenExpiredException))
            {
                context.Response.Headers.Add("Token-Expired", "true");
            }
            return Task.CompletedTask;
        },
        OnChallenge = context =>
        {
            context.HandleResponse();
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            context.Response.ContentType = "application/json";
            
            var result = System.Text.Json.JsonSerializer.Serialize(new 
            { 
                message = "You are not authorized to access this resource" 
            });
            
            return context.Response.WriteAsync(result);
        },
        OnForbidden = context =>
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            context.Response.ContentType = "application/json";
            
            var result = System.Text.Json.JsonSerializer.Serialize(new 
            { 
                message = "You do not have permission to access this resource" 
            });
            
            return context.Response.WriteAsync(result);
        }
    };
});

// Add this to your service registration
builder.Services.AddScoped<IHistoryService, HistoryService>();

builder.Services.AddAuthorization();

// Register application services
builder.Services.AddApplicationServices();

// Register authentication service
builder.Services.AddScoped<IAuthService, AuthService>();

// CORS Configuration

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173") // React dev server
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});
// File upload configuration
builder.Services.AddFileUploadConfiguration();

// Configure Kestrel for large file uploads
builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.Limits.MaxRequestBodySize = 104857600; // 100 MB
    serverOptions.Limits.KeepAliveTimeout = TimeSpan.FromMinutes(2);
    serverOptions.Limits.RequestHeadersTimeout = TimeSpan.FromMinutes(1);
});

// Add health checks
builder.Services.AddHealthChecks()
    .AddDbContextCheck<ApplicationDbContext>();

// Add memory cache for performance
builder.Services.AddMemoryCache();

// Add response compression
builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
});

// HttpClient
builder.Services.AddHttpClient<IAIServiceClient, AIServiceClient>(client =>
{
    client.BaseAddress = new Uri(
        builder.Configuration["AIService:BaseUrl"]!
    );

    client.Timeout = TimeSpan.FromMinutes(2);
});


var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference(options =>
    {
        options.Title = "Recognition API";
        options.Theme = ScalarTheme.Purple;
        options.ShowSidebar = true;
        
        // Add authentication support in Scalar UI
        options.Authentication = new ScalarAuthenticationOptions
        {
            PreferredSecurityScheme = "Bearer",
        };
    });
    
    app.UseDeveloperExceptionPage();
}
else
{
    app.UseExceptionHandler("/error");
    app.UseHsts();
}

// Enable response compression
app.UseResponseCompression();

// Serve static files (for the microphone HTML page)
app.UseStaticFiles();

// Default file serving
app.UseDefaultFiles();

// Add custom middleware (order matters!)
app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseMiddleware<RequestLoggingMiddleware>();

app.UseHttpsRedirection();

// CORS must be before Authentication and Authorization
app.UseCors("AllowFrontend");

// Authentication & Authorization
app.UseAuthentication();
app.UseAuthorization();

// Map controllers
app.MapControllers();

// Map health check endpoint
app.MapHealthChecks("/health");

// Seed database (optional - for development)
if (app.Environment.IsDevelopment())
{
    using (var scope = app.Services.CreateScope())
    {
        var services = scope.ServiceProvider;
        try
        {
            var context = services.GetRequiredService<ApplicationDbContext>();
            
            // Apply pending migrations
            if (context.Database.GetPendingMigrations().Any())
            {
                context.Database.Migrate();
            }
            
            // Seed data if needed
            // await SeedData.Initialize(services);
        }
        catch (Exception ex)
        {
            var logger = services.GetRequiredService<ILogger<Program>>();
            logger.LogError(ex, "An error occurred while migrating or seeding the database.");
        }
    }
}

app.Run();