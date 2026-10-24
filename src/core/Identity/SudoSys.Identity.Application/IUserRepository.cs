using SudoSys.Identity.Domain;

namespace SudoSys.Identity.Application;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(UserId id, CancellationToken cancellationToken);

    Task<User?> GetByUserNameAsync(string userName, CancellationToken cancellationToken);

    Task AddAsync(User user, CancellationToken cancellationToken);
}
