using Azure.Messaging.ServiceBus;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;

namespace Backend.Services
{
    public interface IMessageSenderService
    {
        Task SendMessageAsync(string message);
    }

    public class ServiceBusSenderService : IMessageSenderService, IAsyncDisposable
    {
        private readonly ServiceBusClient _client = null;
        private readonly ServiceBusSender _sender = null;
        private readonly ILogger<ServiceBusSenderService> _logger;
        private readonly bool _isMessagingEnabled;

        public ServiceBusSenderService(IConfiguration configuration, ILogger<ServiceBusSenderService> logger)
        {
            _logger = logger;
            var connectionString = configuration.GetConnectionString("ServiceBusConnection");
            var queueName = configuration["ServiceBusQueueName"];

            try
            {
                _client = new ServiceBusClient(connectionString);
                _sender = _client.CreateSender(queueName);
                _isMessagingEnabled = true;
                _logger.LogInformation("Service Bus client initialized successfully.");
            }
            catch (FormatException ex)
            {
                _logger.LogError(ex, "The Service Bus connection string is invalid. Messaging will be disabled.");
                _isMessagingEnabled = false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while initializing the Service Bus client. Messaging will be disabled.");
                _isMessagingEnabled = false;
            }
        }

        public async Task SendMessageAsync(string message)
        {
            if (!_isMessagingEnabled)
            {
                _logger.LogWarning("Messaging is disabled due to configuration error. Skipping sending message: {Message}", message);
                return;
            }

            try
            {
                var serviceBusMessage = new ServiceBusMessage(message);
                await _sender.SendMessageAsync(serviceBusMessage);
                _logger.LogInformation("Message sent successfully: {Message}", message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending message to Service Bus: {Message}", message);
            }
        }

        public async ValueTask DisposeAsync()
        {
            if (_sender != null)
                await _sender.DisposeAsync();
            if (_client != null)
                await _client.DisposeAsync();
        }
    }
}