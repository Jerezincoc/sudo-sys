using Microsoft.EntityFrameworkCore;
using Npgsql;
using SudoSys.Identity.Application;
using SudoSys.Identity.Infrastructure;
using SudoSys.SharedKernel;

namespace SudoSys.Identity.IntegrationTests;

[CollectionDefinition(Name)]
public sealed class PostgreSqlFixtureGroup : ICollectionFixture<PostgreSqlFixture>
{
    public const string Name = "identity-postgresql";
}

public sealed class PostgreSqlFixture : IAsyncLifetime
{
    private string? _adminConnectionString;
    private string? _databaseName;

    public string ConnectionString { get; private set; } = string.Empty;

    public async Task InitializeAsync()
    {
        _adminConnectionString = Environment.GetEnvironmentVariable("SUDOSYS_TEST_PG");
        if (string.IsNullOrWhiteSpace(_adminConnectionString))
        {
            throw new InvalidOperationException(
                "SUDOSYS_TEST_PG must be set with Host, Port, Username and Password, without Database.");
        }

        var adminBuilder = new NpgsqlConnectionStringBuilder(_adminConnectionString);
        if (!string.IsNullOrWhiteSpace(adminBuilder.Database))
        {
            throw new InvalidOperationException("SUDOSYS_TEST_PG must not contain Database.");
        }

        adminBuilder.Database = "postgres";
        _adminConnectionString = adminBuilder.ConnectionString;
        _databaseName = $"sudosys_identity_{Guid.NewGuid():N}";

        await using (var connection = new NpgsqlConnection(_adminConnectionString))
        {
            await connection.OpenAsync();
            await using var command = new NpgsqlCommand($"CREATE DATABASE \"{_databaseName}\"", connection);
            await command.ExecuteNonQueryAsync();
        }

        var databaseBuilder = new NpgsqlConnectionStringBuilder(_adminConnectionString)
        {
            Database = _databaseName
        };
        ConnectionString = databaseBuilder.ConnectionString;

        await using var context = CreateContext(new TestTenantContext(OfficeId.New()));
        await context.Database.MigrateAsync();
    }

    public async Task DisposeAsync()
    {
        if (_adminConnectionString is null || _databaseName is null)
        {
            return;
        }

        await using var connection = new NpgsqlConnection(_adminConnectionString);
        await connection.OpenAsync();
        await using var command = new NpgsqlCommand($"DROP DATABASE \"{_databaseName}\" WITH (FORCE)", connection);
        await command.ExecuteNonQueryAsync();
    }

    public IdentityDbContext CreateContext(ITenantContext tenantContext)
    {
        var options = new DbContextOptionsBuilder<IdentityDbContext>()
            .UseNpgsql(ConnectionString)
            .Options;
        return new IdentityDbContext(options, tenantContext);
    }
}

internal sealed class TestTenantContext(OfficeId? officeId) : ITenantContext
{
    public OfficeId? OfficeId { get; } = officeId;
}
