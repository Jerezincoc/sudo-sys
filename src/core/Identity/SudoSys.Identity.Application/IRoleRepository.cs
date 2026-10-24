using SudoSys.Identity.Domain;

namespace SudoSys.Identity.Application;

public interface IRoleRepository
{
    Task<Role?> GetByIdAsync(RoleId id, CancellationToken cancellationToken);

    Task AddAsync(Role role, CancellationToken cancellationToken);

    Task<IReadOnlyList<Role>> ListAvailableAsync(CancellationToken cancellationToken);
}
