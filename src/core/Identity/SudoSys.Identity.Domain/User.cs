using SudoSys.SharedKernel;

namespace SudoSys.Identity.Domain;

public sealed class User
{
    private User()
    {
        UserName = null!;
        DisplayName = null!;
        CompanyScope = null!;
    }

    private User(
        UserId id,
        OfficeId officeId,
        string userName,
        string displayName,
        RoleId roleId,
        CompanyScope companyScope)
    {
        Id = id;
        OfficeId = officeId;
        UserName = userName;
        DisplayName = displayName;
        RoleId = roleId;
        CompanyScope = companyScope;
        Status = UserStatus.Active;
        MustChangePassword = true;
    }

    public UserId Id { get; }

    public OfficeId OfficeId { get; }

    public string UserName { get; }

    public string DisplayName { get; }

    public RoleId RoleId { get; private set; }

    public CompanyScope CompanyScope { get; private set; }

    public UserStatus Status { get; private set; }

    public bool MustChangePassword { get; private set; }

    public int FailedLoginCount { get; private set; }

    public DateTimeOffset? LockedUntil { get; private set; }

    public static Result<User> Create(
        OfficeId officeId,
        string userName,
        string displayName,
        RoleId roleId,
        CompanyScope scope)
    {
        if (officeId.Value == Guid.Empty)
        {
            return Failure("user.office_id.empty", "User requires a valid office.");
        }

        if (roleId.Value == Guid.Empty)
        {
            return Failure("user.role_id.empty", "User requires a valid role.");
        }

        var normalizedUserName = userName?.ToLowerInvariant();
        if (normalizedUserName is null
            || normalizedUserName.Length is < 3 or > 64
            || normalizedUserName.Any(char.IsWhiteSpace))
        {
            return Failure("user.user_name.invalid", "User name must contain 3 to 64 characters without whitespace.");
        }

        var normalizedDisplayName = displayName?.Trim();
        if (string.IsNullOrEmpty(normalizedDisplayName))
        {
            return Failure("user.display_name.empty", "Display name cannot be empty.");
        }

        if (scope is null)
        {
            return Failure("user.company_scope.required", "Company scope is required.");
        }

        return Result.Success(new User(
            UserId.New(),
            officeId,
            normalizedUserName,
            normalizedDisplayName,
            roleId,
            scope));
    }

    public Result RegisterFailedLogin(DateTimeOffset now, LockoutPolicy policy)
    {
        if (Status == UserStatus.Deactivated)
        {
            return DeactivatedUser();
        }

        var utcNow = now.ToUniversalTime();
        if (Status == UserStatus.Locked && LockedUntil > utcNow)
        {
            return ActiveLock();
        }

        if (Status == UserStatus.Locked)
        {
            Status = UserStatus.Active;
            LockedUntil = null;
            FailedLoginCount = 0;
        }

        FailedLoginCount++;
        if (FailedLoginCount >= policy.MaxFailedAttempts)
        {
            Status = UserStatus.Locked;
            LockedUntil = utcNow.Add(policy.Duration);
        }

        return Result.Success();
    }

    public Result RegisterSuccessfulLogin(DateTimeOffset now)
    {
        if (Status == UserStatus.Deactivated)
        {
            return DeactivatedUser();
        }

        var utcNow = now.ToUniversalTime();
        if (Status == UserStatus.Locked && LockedUntil > utcNow)
        {
            return ActiveLock();
        }

        Status = UserStatus.Active;
        FailedLoginCount = 0;
        LockedUntil = null;
        return Result.Success();
    }

    public bool CanAuthenticate(DateTimeOffset now) => Status switch
    {
        UserStatus.Deactivated => false,
        UserStatus.Locked => LockedUntil <= now.ToUniversalTime(),
        _ => true
    };

    public Result Unlock()
    {
        if (Status != UserStatus.Locked)
        {
            return Result.Failure(new Error("user.not_locked", "Only a locked user can be unlocked."));
        }

        Status = UserStatus.Active;
        FailedLoginCount = 0;
        LockedUntil = null;
        return Result.Success();
    }

    public Result Deactivate()
    {
        if (Status == UserStatus.Deactivated)
        {
            return DeactivatedUser();
        }

        Status = UserStatus.Deactivated;
        FailedLoginCount = 0;
        LockedUntil = null;
        return Result.Success();
    }

    public Result Reactivate()
    {
        if (Status != UserStatus.Deactivated)
        {
            return Result.Failure(new Error("user.not_deactivated", "Only a deactivated user can be reactivated."));
        }

        Status = UserStatus.Active;
        return Result.Success();
    }

    public Result AssignRole(RoleId roleId)
    {
        if (Status == UserStatus.Deactivated)
        {
            return DeactivatedUser();
        }

        if (roleId.Value == Guid.Empty)
        {
            return Result.Failure(new Error("user.role_id.empty", "User requires a valid role."));
        }

        RoleId = roleId;
        return Result.Success();
    }

    public Result ChangeScope(CompanyScope scope)
    {
        if (Status == UserStatus.Deactivated)
        {
            return DeactivatedUser();
        }

        if (scope is null)
        {
            return Result.Failure(new Error("user.company_scope.required", "Company scope is required."));
        }

        CompanyScope = scope;
        return Result.Success();
    }

    public Result CompletePasswordChange()
    {
        MustChangePassword = false;
        return Result.Success();
    }

    private static Result<User> Failure(string code, string message) =>
        Result.Failure<User>(new Error(code, message));

    private static Result DeactivatedUser() =>
        Result.Failure(new Error("user.deactivated", "Deactivated user cannot perform this operation."));

    private static Result ActiveLock() =>
        Result.Failure(new Error("user.locked", "User lockout is still active."));

    internal void RestoreCompanyScope(CompanyScope companyScope) => CompanyScope = companyScope;
}
