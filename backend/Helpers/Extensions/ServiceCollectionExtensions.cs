using backend.Configurations;
using backend.Data;
using backend.Interfaces;
using backend.Repositories;
using backend.Services;
using Microsoft.EntityFrameworkCore;

namespace backend.Helpers.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            // Register services
            services.AddScoped<IMovieRecognitionService, MovieRecognitionService>();
            services.AddScoped<IMusicRecognitionService, MusicRecognitionService>();
            services.AddScoped<IFileProcessingService, FileProcessingService>();

            // Register repositories
            services.AddScoped<IMovieRepository, MovieRepository>();
            services.AddScoped<IMusicRepository, MusicRepository>();
            services.AddScoped<IRecognitionHistoryRepository, RecognitionHistoryRepository>();

            return services;
        }

        public static IServiceCollection AddDatabaseContext(
            this IServiceCollection services, 
            IConfiguration configuration)
        {
            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseSqlServer(
                    configuration.GetConnectionString("DefaultConnection"),
                    b => b.MigrationsAssembly("backend")));

            return services;
        }

        public static IServiceCollection AddCorsPolicy(this IServiceCollection services)
        {
            services.AddCors(options =>
            {
                options.AddPolicy("AllowAll", policy =>
                {
                    policy.AllowAnyOrigin()
                          .AllowAnyMethod()
                          .AllowAnyHeader();
                });
            });

            return services;
        }

        public static IServiceCollection AddFileUploadConfiguration(this IServiceCollection services)
        {
            services.Configure<FileUploadConfiguration>(options =>
            {
                options.MaxVideoSizeInBytes = 100 * 1024 * 1024;
                options.MaxImageSizeInBytes = 10 * 1024 * 1024;
                options.MaxAudioSizeInBytes = 20 * 1024 * 1024;
            });

            services.Configure<Microsoft.AspNetCore.Http.Features.FormOptions>(options =>
            {
                options.MultipartBodyLengthLimit = 104857600; // 100 MB
            });

            return services;
        }
    }
}