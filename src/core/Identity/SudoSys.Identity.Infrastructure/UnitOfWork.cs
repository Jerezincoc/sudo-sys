using SudoSys.Identity.Application;

namespace SudoSys.Identity.Infrastructure;

public sealed class UnitOfWork(IdentityDbContext context) : IUnitOfWork
{
    public Task<int> SaveChangesAsync(CancellationToken cancellationToken) =>
        context.SaveChangesAsync(cancellationToken);
}
