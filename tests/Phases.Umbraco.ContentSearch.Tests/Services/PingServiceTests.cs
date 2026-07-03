using Phases.Umbraco.ContentSearch.Services;
using Xunit;

namespace Phases.Umbraco.ContentSearch.Tests.Services;

public sealed class PingServiceTests
{
    [Fact]
    public async Task PingAsync_ReturnsPong()
    {
        var service = new PingService();

        var response = await service.PingAsync();

        Assert.Equal("Pong", response.Message);
    }
}
