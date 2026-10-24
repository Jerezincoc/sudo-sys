using SudoSys.Identity.Domain;
using SudoSys.SharedKernel;

namespace SudoSys.Identity.Domain.Tests;

public class UserTests
{
    [Fact]
    public void CreateNormalizesLoginAndInitializesState()
    {
        var user = CreateUser("John.Doe");

        Assert.Equal("john.doe", user.UserName);
        Assert.Equal(UserStatus.Active, user.Status);
        Assert.True(user.MustChangePassword);
        Assert.Equal(0, user.FailedLoginCount);
        Assert.Null(user.LockedUntil);
    }

    [Theory]
    [InlineData("")]
    [InlineData("ab")]
    [InlineData("has space")]
    public void CreateRejectsInvalidLogin(string login)
    {
        var result = User.Create(OfficeId.New(), login, "John Doe", RoleId.New(), CompanyScope.All());

        Assert.True(result.IsFailure);
    }

    [Fact]
    public void CreateRejectsLoginLongerThan64CharactersAndEmptyDisplayName()
    {
        Assert.True(User.Create(OfficeId.New(), new string('a', 65), "John", RoleId.New(), CompanyScope.All()).IsFailure);
        Assert.True(User.Create(OfficeId.New(), "john", " ", RoleId.New(), CompanyScope.All()).IsFailure);
    }

    [Fact]
    public void FailedLoginsLockAtPolicyLimit()
    {
        var user = CreateUser();
        var now = new DateTimeOffset(2026, 10, 23, 12, 0, 0, TimeSpan.Zero);
        var policy = new LockoutPolicy(2, TimeSpan.FromMinutes(10));

        Assert.True(user.RegisterFailedLogin(now, policy).IsSuccess);
        Assert.Equal(UserStatus.Active, user.Status);
        Assert.True(user.RegisterFailedLogin(now, policy).IsSuccess);
        Assert.Equal(UserStatus.Locked, user.Status);
        Assert.Equal(now.AddMinutes(10), user.LockedUntil);
    }

    [Fact]
    public void LockExpirationIsStoredInUtc()
    {
        var user = CreateUser();
        var now = new DateTimeOffset(2026, 10, 23, 9, 0, 0, TimeSpan.FromHours(-3));

        user.RegisterFailedLogin(now, new LockoutPolicy(1, TimeSpan.FromMinutes(10)));

        Assert.Equal(TimeSpan.Zero, user.LockedUntil?.Offset);
        Assert.Equal(new DateTimeOffset(2026, 10, 23, 12, 10, 0, TimeSpan.Zero), user.LockedUntil);
    }

    [Fact]
    public void SuccessfulLoginResetsFailures()
    {
        var user = CreateUser();
        var now = new DateTimeOffset(2026, 10, 23, 12, 0, 0, TimeSpan.Zero);
        user.RegisterFailedLogin(now, new LockoutPolicy());

        Assert.True(user.RegisterSuccessfulLogin(now).IsSuccess);
        Assert.Equal(0, user.FailedLoginCount);
    }

    [Fact]
    public void SuccessfulLoginFailsWhileLockIsActive()
    {
        var user = CreateUser();
        var now = new DateTimeOffset(2026, 10, 23, 12, 0, 0, TimeSpan.Zero);
        user.RegisterFailedLogin(now, new LockoutPolicy(1, TimeSpan.FromMinutes(10)));

        Assert.True(user.RegisterSuccessfulLogin(now.AddMinutes(9)).IsFailure);
        Assert.Equal(UserStatus.Locked, user.Status);
    }

    [Fact]
    public void SuccessfulLoginReactivatesExpiredLock()
    {
        var user = CreateUser();
        var now = new DateTimeOffset(2026, 10, 23, 12, 0, 0, TimeSpan.Zero);
        user.RegisterFailedLogin(now, new LockoutPolicy(1, TimeSpan.FromMinutes(10)));

        Assert.True(user.RegisterSuccessfulLogin(now.AddMinutes(10)).IsSuccess);
        Assert.Equal(UserStatus.Active, user.Status);
        Assert.Null(user.LockedUntil);
        Assert.Equal(0, user.FailedLoginCount);
    }

    [Fact]
    public void CanAuthenticateReflectsStatusAndLockExpiry()
    {
        var user = CreateUser();
        var now = new DateTimeOffset(2026, 10, 23, 12, 0, 0, TimeSpan.Zero);
        user.RegisterFailedLogin(now, new LockoutPolicy(1, TimeSpan.FromMinutes(10)));

        Assert.False(user.CanAuthenticate(now.AddMinutes(9)));
        Assert.True(user.CanAuthenticate(now.AddMinutes(10)));
        user.Deactivate();
        Assert.False(user.CanAuthenticate(now.AddMinutes(20)));
    }

    [Fact]
    public void UnlockClearsLockState()
    {
        var user = CreateUser();
        var now = new DateTimeOffset(2026, 10, 23, 12, 0, 0, TimeSpan.Zero);
        user.RegisterFailedLogin(now, new LockoutPolicy(1, TimeSpan.FromMinutes(10)));

        Assert.True(user.Unlock().IsSuccess);
        Assert.Equal(UserStatus.Active, user.Status);
        Assert.Null(user.LockedUntil);
        Assert.Equal(0, user.FailedLoginCount);
    }

    [Fact]
    public void DeactivatedUserCanBeReactivated()
    {
        var user = CreateUser();

        Assert.True(user.Deactivate().IsSuccess);
        Assert.Equal(UserStatus.Deactivated, user.Status);
        Assert.True(user.Reactivate().IsSuccess);
        Assert.Equal(UserStatus.Active, user.Status);
    }

    [Fact]
    public void DeactivatedUserCannotChangeRoleOrScope()
    {
        var user = CreateUser();
        user.Deactivate();

        Assert.True(user.AssignRole(RoleId.New()).IsFailure);
        Assert.True(user.ChangeScope(CompanyScope.Specific([CompanyId.New()]).Value).IsFailure);
    }

    [Fact]
    public void ActiveUserCanChangeRoleAndScopeAndCompletePasswordChange()
    {
        var user = CreateUser();
        var roleId = RoleId.New();
        var scope = CompanyScope.Specific([CompanyId.New()]).Value;

        Assert.True(user.AssignRole(roleId).IsSuccess);
        Assert.True(user.ChangeScope(scope).IsSuccess);
        Assert.True(user.CompletePasswordChange().IsSuccess);
        Assert.Equal(roleId, user.RoleId);
        Assert.Equal(scope, user.CompanyScope);
        Assert.False(user.MustChangePassword);
    }

    private static User CreateUser(string userName = "john") =>
        User.Create(OfficeId.New(), userName, "John Doe", RoleId.New(), CompanyScope.All()).Value;
}
