using Microsoft.EntityFrameworkCore;
using SudoSys.Identity.Application;
using SudoSys.Identity.Domain;
using SudoSys.SharedKernel;

namespace SudoSys.Identity.Infrastructure;

public sealed class IdentityDbContext(
    DbContextOptions<IdentityDbContext> options,
    ITenantContext tenantContext) : DbContext(options)
{
    internal DbSet<User> Users => Set<User>();

    internal DbSet<Role> Roles => Set<Role>();

    internal DbSet<UserCompanyScopeRow> UserCompanyScopes => Set<UserCompanyScopeRow>();

    internal DbSet<RolePermissionRow> RolePermissions => Set<RolePermissionRow>();

    internal OfficeId RequiredOfficeId => tenantContext.OfficeId
        ?? throw new InvalidOperationException("A current office is required for Identity queries.");

    internal void EnsureCurrentOffice(OfficeId officeId)
    {
        if (officeId != RequiredOfficeId)
        {
            throw new InvalidOperationException("The aggregate does not belong to the current office.");
        }
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        await SynchronizeUserCompanyScopesAsync(cancellationToken);
        await SynchronizeRolePermissionsAsync(cancellationToken);
        return await base.SaveChangesAsync(cancellationToken);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("identity");
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(IdentityDbContext).Assembly);

        modelBuilder.Entity<User>().HasQueryFilter(user => user.OfficeId == RequiredOfficeId);
        modelBuilder.Entity<Role>().HasQueryFilter(role => role.OfficeId == null || role.OfficeId == RequiredOfficeId);
        modelBuilder.Entity<UserCompanyScopeRow>().HasQueryFilter(row => row.OfficeId == RequiredOfficeId);
        modelBuilder.Entity<RolePermissionRow>().HasQueryFilter(
            row => row.OfficeId == null || row.OfficeId == RequiredOfficeId);
    }

    private async Task SynchronizeUserCompanyScopesAsync(CancellationToken cancellationToken)
    {
        var users = ChangeTracker.Entries<User>()
            .Where(entry => entry.State is not EntityState.Detached and not EntityState.Deleted)
            .Select(entry => entry.Entity)
            .ToList();

        foreach (var user in users)
        {
            EnsureCurrentOffice(user.OfficeId);
            Entry(user).Property<bool>("CompanyScopeIncludesAll").CurrentValue = user.CompanyScope.IncludesAll;

            var persistedRows = await UserCompanyScopes
                .Where(row => row.UserId == user.Id)
                .ToListAsync(cancellationToken);
            var desiredCompanyIds = user.CompanyScope.CompanyIds.ToHashSet();

            UserCompanyScopes.RemoveRange(
                persistedRows.Where(row => !desiredCompanyIds.Contains(row.CompanyId)));

            var persistedCompanyIds = persistedRows.Select(row => row.CompanyId).ToHashSet();
            await UserCompanyScopes.AddRangeAsync(
                desiredCompanyIds
                    .Where(companyId => !persistedCompanyIds.Contains(companyId))
                    .Select(companyId => new UserCompanyScopeRow
                    {
                        UserId = user.Id,
                        OfficeId = user.OfficeId,
                        CompanyId = companyId
                    }),
                cancellationToken);
        }
    }

    private async Task SynchronizeRolePermissionsAsync(CancellationToken cancellationToken)
    {
        var roles = ChangeTracker.Entries<Role>()
            .Where(entry => entry.State is not EntityState.Detached and not EntityState.Deleted)
            .Select(entry => entry.Entity)
            .ToList();

        foreach (var role in roles)
        {
            if (role.OfficeId is { } officeId)
            {
                EnsureCurrentOffice(officeId);
            }

            var persistedRows = await RolePermissions
                .Where(row => row.RoleId == role.Id)
                .ToListAsync(cancellationToken);
            var desiredPermissions = role.Permissions
                .Select(permission => permission.Value)
                .ToHashSet(StringComparer.Ordinal);

            RolePermissions.RemoveRange(
                persistedRows.Where(row => !desiredPermissions.Contains(row.Permission)));

            var persistedPermissions = persistedRows
                .Select(row => row.Permission)
                .ToHashSet(StringComparer.Ordinal);
            await RolePermissions.AddRangeAsync(
                desiredPermissions
                    .Where(permission => !persistedPermissions.Contains(permission))
                    .Select(permission => new RolePermissionRow
                    {
                        RoleId = role.Id,
                        OfficeId = role.OfficeId,
                        Permission = permission
                    }),
                cancellationToken);
        }
    }
}
