using SudoSys.Identity.Domain;
using SudoSys.SharedKernel;

namespace SudoSys.Identity.Domain.Tests;

public class RoleTests
{
    [Fact]
    public void CreateSystemCreatesImmutableSystemRole()
    {
        var role = Role.CreateSystem("Operators", [PermissionCatalog.IdentityUsersView]).Value;

        Assert.True(role.IsSystem);
        Assert.Null(role.OfficeId);
        Assert.True(role.Rename("Other").IsFailure);
        Assert.True(role.Grant(PermissionCatalog.IdentityUsersCreate).IsFailure);
        Assert.True(role.Revoke(PermissionCatalog.IdentityUsersView).IsFailure);
    }

    [Fact]
    public void CreateCustomValidatesNameAndCatalogPermissions()
    {
        var officeId = OfficeId.New();
        var unknown = Permission.Create("other.resource.action").Value;

        Assert.True(Role.CreateCustom(officeId, string.Empty, []).IsFailure);
        Assert.True(Role.CreateCustom(officeId, new string('a', 81), []).IsFailure);
        Assert.True(Role.CreateCustom(officeId, "Operators", [unknown]).IsFailure);
    }

    [Fact]
    public void CustomRoleCanBeRenamedAndPermissionsChanged()
    {
        var role = Role.CreateCustom(OfficeId.New(), "Operators", []).Value;

        Assert.True(role.Rename("Reviewers").IsSuccess);
        Assert.True(role.Grant(PermissionCatalog.IdentityUsersView).IsSuccess);
        Assert.Contains(PermissionCatalog.IdentityUsersView, role.Permissions);
        Assert.True(role.Revoke(PermissionCatalog.IdentityUsersView).IsSuccess);
        Assert.DoesNotContain(PermissionCatalog.IdentityUsersView, role.Permissions);
    }

    [Fact]
    public void GrantRejectsPermissionOutsideCatalog()
    {
        var role = Role.CreateCustom(OfficeId.New(), "Operators", []).Value;
        var unknown = Permission.Create("other.resource.action").Value;

        Assert.True(role.Grant(unknown).IsFailure);
    }

    [Fact]
    public void CopyAsCreatesCustomRoleWithSamePermissions()
    {
        var system = Role.CreateSystem(
            "Base",
            [PermissionCatalog.IdentityUsersView, PermissionCatalog.IdentityRolesView]).Value;
        var officeId = OfficeId.New();

        var copy = system.CopyAs("Office role", officeId).Value;

        Assert.False(copy.IsSystem);
        Assert.Equal(officeId, copy.OfficeId);
        Assert.Equal(system.Permissions.OrderBy(permission => permission.Value), copy.Permissions.OrderBy(permission => permission.Value));
        Assert.NotEqual(system.Id, copy.Id);
    }
}
