using Microsoft.EntityFrameworkCore;
using SudoSys.Identity.Domain;
using SudoSys.Identity.Infrastructure;
using SudoSys.SharedKernel;

namespace SudoSys.Identity.IntegrationTests;

[Collection(PostgreSqlFixtureGroup.Name)]
public sealed class IdentityPersistenceTests(PostgreSqlFixture database)
{
    [Fact]
    public async Task SavesAndReloadsUserWithAllCompanyScopeAndEveryScalarField()
    {
        var officeId = OfficeId.New();
        var user = User.Create(officeId, UniqueName(), "  Maria Silva  ", RoleId.New(), CompanyScope.All()).Value;
        var lockoutAt = new DateTimeOffset(2026, 10, 24, 12, 0, 0, TimeSpan.FromHours(-3));
        Assert.True(user.CompletePasswordChange().IsSuccess);
        Assert.True(user.RegisterFailedLogin(lockoutAt, new LockoutPolicy(1, TimeSpan.FromMinutes(15))).IsSuccess);

        await using (var context = database.CreateContext(new TestTenantContext(officeId)))
        {
            await new UserRepository(context).AddAsync(user, CancellationToken.None);
            await new UnitOfWork(context).SaveChangesAsync(CancellationToken.None);
        }

        await using (var context = database.CreateContext(new TestTenantContext(officeId)))
        {
            var loaded = await new UserRepository(context).GetByIdAsync(user.Id, CancellationToken.None);

            Assert.NotNull(loaded);
            Assert.Equal(user.Id, loaded.Id);
            Assert.Equal(officeId, loaded.OfficeId);
            Assert.Equal(user.UserName, loaded.UserName);
            Assert.Equal("Maria Silva", loaded.DisplayName);
            Assert.Equal(user.RoleId, loaded.RoleId);
            Assert.Equal(UserStatus.Locked, loaded.Status);
            Assert.False(loaded.MustChangePassword);
            Assert.Equal(1, loaded.FailedLoginCount);
            Assert.Equal(lockoutAt.ToUniversalTime().AddMinutes(15), loaded.LockedUntil);
            Assert.True(loaded.CompanyScope.IncludesAll);
            Assert.Empty(loaded.CompanyScope.CompanyIds);
        }
    }

    [Fact]
    public async Task SavesAndReloadsUserWithSpecificCompanyScope()
    {
        var officeId = OfficeId.New();
        var companies = new[] { CompanyId.New(), CompanyId.New() };
        var scope = CompanyScope.Specific(companies).Value;
        var user = User.Create(officeId, UniqueName(), "Specific", RoleId.New(), scope).Value;

        await using (var context = database.CreateContext(new TestTenantContext(officeId)))
        {
            await new UserRepository(context).AddAsync(user, CancellationToken.None);
            await new UnitOfWork(context).SaveChangesAsync(CancellationToken.None);
        }

        await using (var context = database.CreateContext(new TestTenantContext(officeId)))
        {
            var loaded = await new UserRepository(context).GetByUserNameAsync(user.UserName, CancellationToken.None);
            Assert.NotNull(loaded);
            Assert.False(loaded.CompanyScope.IncludesAll);
            Assert.Equal(companies.OrderBy(x => x.Value), loaded.CompanyScope.CompanyIds.OrderBy(x => x.Value));
        }
    }

    [Fact]
    public async Task SavesAndReloadsRoleWithPermissions()
    {
        var officeId = OfficeId.New();
        var role = Role.CreateCustom(
            officeId,
            "Payroll operators",
            [PermissionCatalog.IdentityUsersView, PermissionCatalog.IdentityRolesManage]).Value;

        await using (var context = database.CreateContext(new TestTenantContext(officeId)))
        {
            await new RoleRepository(context).AddAsync(role, CancellationToken.None);
            await new UnitOfWork(context).SaveChangesAsync(CancellationToken.None);
        }

        await using (var context = database.CreateContext(new TestTenantContext(officeId)))
        {
            var loaded = await new RoleRepository(context).GetByIdAsync(role.Id, CancellationToken.None);
            Assert.NotNull(loaded);
            Assert.Equal(role.Id, loaded.Id);
            Assert.Equal(officeId, loaded.OfficeId);
            Assert.Equal(role.Name, loaded.Name);
            Assert.False(loaded.IsSystem);
            Assert.Equal(role.Permissions.OrderBy(x => x.Value), loaded.Permissions.OrderBy(x => x.Value));
        }
    }

    [Fact]
    public async Task RejectsDuplicateUserNameInsideSameOffice()
    {
        var officeId = OfficeId.New();
        var name = UniqueName();

        await using var context = database.CreateContext(new TestTenantContext(officeId));
        var repository = new UserRepository(context);
        await repository.AddAsync(CreateUser(officeId, name), CancellationToken.None);
        await repository.AddAsync(CreateUser(officeId, name.ToUpperInvariant()), CancellationToken.None);

        await Assert.ThrowsAsync<DbUpdateException>(
            () => new UnitOfWork(context).SaveChangesAsync(CancellationToken.None));
    }

    [Fact]
    public async Task HidesUserFromAnotherOfficeAndAllowsSameNameThere()
    {
        var officeA = OfficeId.New();
        var officeB = OfficeId.New();
        var name = UniqueName();
        var userA = CreateUser(officeA, name);
        var userB = CreateUser(officeB, name);

        await using (var context = database.CreateContext(new TestTenantContext(officeA)))
        {
            await new UserRepository(context).AddAsync(userA, CancellationToken.None);
            await new UnitOfWork(context).SaveChangesAsync(CancellationToken.None);
        }

        await using (var context = database.CreateContext(new TestTenantContext(officeB)))
        {
            Assert.Null(await new UserRepository(context).GetByIdAsync(userA.Id, CancellationToken.None));
            await new UserRepository(context).AddAsync(userB, CancellationToken.None);
            await new UnitOfWork(context).SaveChangesAsync(CancellationToken.None);
            Assert.NotNull(await new UserRepository(context).GetByUserNameAsync(name, CancellationToken.None));
        }
    }

    [Fact]
    public async Task QueryWithoutCurrentOfficeFails()
    {
        await using var context = database.CreateContext(new TestTenantContext(null));

        var userException = await Assert.ThrowsAsync<InvalidOperationException>(
            () => new UserRepository(context).GetByUserNameAsync(UniqueName(), CancellationToken.None));
        var roleException = await Assert.ThrowsAsync<InvalidOperationException>(
            () => new RoleRepository(context).ListAvailableAsync(CancellationToken.None));

        Assert.Contains("office", userException.Message, StringComparison.OrdinalIgnoreCase);
        Assert.Contains("office", roleException.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task ListsSystemAndCurrentOfficeRolesOnly()
    {
        var officeA = OfficeId.New();
        var officeB = OfficeId.New();
        var systemRole = Role.CreateSystem(UniqueName(), [PermissionCatalog.IdentityUsersView]).Value;
        var officeARole = Role.CreateCustom(officeA, UniqueName(), []).Value;
        var officeBRole = Role.CreateCustom(officeB, UniqueName(), []).Value;

        await using (var context = database.CreateContext(new TestTenantContext(officeA)))
        {
            var repository = new RoleRepository(context);
            await repository.AddAsync(systemRole, CancellationToken.None);
            await repository.AddAsync(officeARole, CancellationToken.None);
            await new UnitOfWork(context).SaveChangesAsync(CancellationToken.None);
        }

        await using (var context = database.CreateContext(new TestTenantContext(officeB)))
        {
            await new RoleRepository(context).AddAsync(officeBRole, CancellationToken.None);
            await new UnitOfWork(context).SaveChangesAsync(CancellationToken.None);
        }

        await using (var context = database.CreateContext(new TestTenantContext(officeA)))
        {
            var available = await new RoleRepository(context).ListAvailableAsync(CancellationToken.None);
            Assert.Contains(available, role => role.Id == systemRole.Id && role.IsSystem);
            Assert.Contains(available, role => role.Id == officeARole.Id);
            Assert.DoesNotContain(available, role => role.Id == officeBRole.Id);
        }

        await using (var context = database.CreateContext(new TestTenantContext(officeB)))
        {
            Assert.NotNull(await new RoleRepository(context).GetByIdAsync(systemRole.Id, CancellationToken.None));
        }
    }

    [Fact]
    public async Task PersistsEveryCompanyScopeChangeOnTrackedUser()
    {
        var officeId = OfficeId.New();
        var user = CreateUser(officeId, UniqueName());
        await AddUserAsync(user);

        var firstCompanies = new[] { CompanyId.New(), CompanyId.New() };
        await ChangeScopeAsync(CompanyScope.Specific(firstCompanies).Value);
        await AssertScopeAsync(includesAll: false, firstCompanies);

        var secondCompanies = new[] { CompanyId.New() };
        await ChangeScopeAsync(CompanyScope.Specific(secondCompanies).Value);
        await AssertScopeAsync(includesAll: false, secondCompanies);

        await ChangeScopeAsync(CompanyScope.All());
        await AssertScopeAsync(includesAll: true, []);

        async Task ChangeScopeAsync(CompanyScope scope)
        {
            await using var context = database.CreateContext(new TestTenantContext(officeId));
            var loaded = await new UserRepository(context).GetByIdAsync(user.Id, CancellationToken.None);
            Assert.NotNull(loaded);
            Assert.True(loaded.ChangeScope(scope).IsSuccess);
            await new UnitOfWork(context).SaveChangesAsync(CancellationToken.None);
        }

        async Task AssertScopeAsync(bool includesAll, IReadOnlyCollection<CompanyId> companyIds)
        {
            await using var context = database.CreateContext(new TestTenantContext(officeId));
            var loaded = await new UserRepository(context).GetByIdAsync(user.Id, CancellationToken.None);
            Assert.NotNull(loaded);
            Assert.Equal(includesAll, loaded.CompanyScope.IncludesAll);
            Assert.Equal(
                companyIds.OrderBy(companyId => companyId.Value),
                loaded.CompanyScope.CompanyIds.OrderBy(companyId => companyId.Value));
        }

        async Task AddUserAsync(User newUser)
        {
            await using var context = database.CreateContext(new TestTenantContext(officeId));
            await new UserRepository(context).AddAsync(newUser, CancellationToken.None);
            await new UnitOfWork(context).SaveChangesAsync(CancellationToken.None);
        }
    }

    [Fact]
    public async Task PersistsGrantAndRevokeOnTrackedCustomRole()
    {
        var officeId = OfficeId.New();
        var role = Role.CreateCustom(
            officeId,
            UniqueName(),
            [PermissionCatalog.IdentityUsersView, PermissionCatalog.IdentityRolesView]).Value;

        await using (var context = database.CreateContext(new TestTenantContext(officeId)))
        {
            await new RoleRepository(context).AddAsync(role, CancellationToken.None);
            await new UnitOfWork(context).SaveChangesAsync(CancellationToken.None);
        }

        await using (var context = database.CreateContext(new TestTenantContext(officeId)))
        {
            var loaded = await new RoleRepository(context).GetByIdAsync(role.Id, CancellationToken.None);
            Assert.NotNull(loaded);
            Assert.True(loaded.Grant(PermissionCatalog.IdentityUsersEdit).IsSuccess);
            Assert.True(loaded.Revoke(PermissionCatalog.IdentityUsersView).IsSuccess);
            await new UnitOfWork(context).SaveChangesAsync(CancellationToken.None);
        }

        await using (var context = database.CreateContext(new TestTenantContext(officeId)))
        {
            var loaded = await new RoleRepository(context).GetByIdAsync(role.Id, CancellationToken.None);
            Assert.NotNull(loaded);
            Assert.Equal(
                new[] { PermissionCatalog.IdentityRolesView, PermissionCatalog.IdentityUsersEdit }
                    .OrderBy(permission => permission.Value),
                loaded.Permissions.OrderBy(permission => permission.Value));
        }
    }

    [Fact]
    public async Task PersistsScalarChangesOnTrackedAggregates()
    {
        var officeId = OfficeId.New();
        var user = CreateUser(officeId, UniqueName());
        var role = Role.CreateCustom(officeId, UniqueName(), []).Value;

        await using (var context = database.CreateContext(new TestTenantContext(officeId)))
        {
            await new UserRepository(context).AddAsync(user, CancellationToken.None);
            await new RoleRepository(context).AddAsync(role, CancellationToken.None);
            await new UnitOfWork(context).SaveChangesAsync(CancellationToken.None);
        }

        await using (var context = database.CreateContext(new TestTenantContext(officeId)))
        {
            var loadedUser = await new UserRepository(context).GetByIdAsync(user.Id, CancellationToken.None);
            var loadedRole = await new RoleRepository(context).GetByIdAsync(role.Id, CancellationToken.None);
            Assert.NotNull(loadedUser);
            Assert.NotNull(loadedRole);
            Assert.True(loadedUser.Deactivate().IsSuccess);
            Assert.True(loadedRole.Rename("Renamed role").IsSuccess);
            await new UnitOfWork(context).SaveChangesAsync(CancellationToken.None);
        }

        await using (var context = database.CreateContext(new TestTenantContext(officeId)))
        {
            var loadedUser = await new UserRepository(context).GetByIdAsync(user.Id, CancellationToken.None);
            var loadedRole = await new RoleRepository(context).GetByIdAsync(role.Id, CancellationToken.None);
            Assert.NotNull(loadedUser);
            Assert.NotNull(loadedRole);
            Assert.Equal(UserStatus.Deactivated, loadedUser.Status);
            Assert.Equal("Renamed role", loadedRole.Name);
        }
    }

    private static User CreateUser(OfficeId officeId, string name) =>
        User.Create(officeId, name, "Test user", RoleId.New(), CompanyScope.All()).Value;

    private static string UniqueName() => $"u{Guid.NewGuid():N}";
}
