using Microsoft.EntityFrameworkCore;
using SudoSys.Identity.Application;
using SudoSys.Identity.Domain;

namespace SudoSys.Identity.Infrastructure;

public sealed class RoleRepository(IdentityDbContext context) : IRoleRepository
{
    public async Task<Role?> GetByIdAsync(RoleId id, CancellationToken cancellationToken)
    {
        var role = await context.Roles.SingleOrDefaultAsync(candidate => candidate.Id == id, cancellationToken);
        if (role is not null)
        {
            await RestorePermissionsAsync([role], cancellationToken);
        }

        return role;
    }

    public async Task AddAsync(Role role, CancellationToken cancellationToken)
    {
        if (role.OfficeId is { } officeId)
        {
            context.EnsureCurrentOffice(officeId);
        }

        await context.Roles.AddAsync(role, cancellationToken);
    }

    public async Task<IReadOnlyList<Role>> ListAvailableAsync(CancellationToken cancellationToken)
    {
        var roles = await context.Roles.OrderBy(role => role.Name).ToListAsync(cancellationToken);
        await RestorePermissionsAsync(roles, cancellationToken);
        return roles;
    }

    private async Task RestorePermissionsAsync(IReadOnlyCollection<Role> roles, CancellationToken cancellationToken)
    {
        var roleIds = roles.Select(role => role.Id).ToList();
        var rows = await context.RolePermissions
            .Where(row => roleIds.Contains(row.RoleId))
            .ToListAsync(cancellationToken);

        foreach (var role in roles)
        {
            role.RestorePermissions(rows
                .Where(row => row.RoleId == role.Id)
                .Select(row => Permission.Create(row.Permission).Value));
        }
    }
}
