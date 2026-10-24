using Microsoft.EntityFrameworkCore;
using SudoSys.Identity.Application;
using SudoSys.Identity.Domain;

namespace SudoSys.Identity.Infrastructure;

public sealed class UserRepository(IdentityDbContext context) : IUserRepository
{
    public async Task<User?> GetByIdAsync(UserId id, CancellationToken cancellationToken)
    {
        var user = await context.Users.SingleOrDefaultAsync(candidate => candidate.Id == id, cancellationToken);
        return await RestoreScopeAsync(user, cancellationToken);
    }

    public async Task<User?> GetByUserNameAsync(string userName, CancellationToken cancellationToken)
    {
        var normalizedUserName = userName.ToLowerInvariant();
        var user = await context.Users.SingleOrDefaultAsync(
            candidate => candidate.UserName == normalizedUserName,
            cancellationToken);
        return await RestoreScopeAsync(user, cancellationToken);
    }

    public async Task AddAsync(User user, CancellationToken cancellationToken)
    {
        context.EnsureCurrentOffice(user.OfficeId);
        await context.Users.AddAsync(user, cancellationToken);
    }

    private async Task<User?> RestoreScopeAsync(User? user, CancellationToken cancellationToken)
    {
        if (user is null)
        {
            return null;
        }

        var includesAll = context.Entry(user).Property<bool>("CompanyScopeIncludesAll").CurrentValue;
        var companyIds = await context.UserCompanyScopes
            .Where(row => row.UserId == user.Id)
            .Select(row => row.CompanyId)
            .ToListAsync(cancellationToken);
        var scope = includesAll ? CompanyScope.All() : CompanyScope.Specific(companyIds).Value;
        user.RestoreCompanyScope(scope);
        return user;
    }
}
