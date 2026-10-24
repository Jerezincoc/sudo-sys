using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using SudoSys.Identity.Application;
using SudoSys.SharedKernel;

namespace SudoSys.Identity.Infrastructure;

public sealed class IdentityDbContextFactory : IDesignTimeDbContextFactory<IdentityDbContext>
{
    public IdentityDbContext CreateDbContext(string[] args)
    {
        var connectionString = args.FirstOrDefault()
            ?? "Host=localhost;Database=sudosys_design;Username=postgres";
        var options = new DbContextOptionsBuilder<IdentityDbContext>()
            .UseNpgsql(connectionString)
            .Options;
        return new IdentityDbContext(options, new DesignTimeTenantContext());
    }

    private sealed class DesignTimeTenantContext : ITenantContext
    {
        public OfficeId? OfficeId { get; } = SudoSys.SharedKernel.OfficeId
            .From(Guid.Parse("00000000-0000-0000-0000-000000000001"))
            .Value;
    }
}
