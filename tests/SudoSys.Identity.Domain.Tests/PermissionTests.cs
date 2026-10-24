using SudoSys.Identity.Domain;

namespace SudoSys.Identity.Domain.Tests;

public class PermissionTests
{
    [Theory]
    [InlineData("identity.users.view")]
    [InlineData("module-2.resource-9.action-1")]
    public void CreateAcceptsCanonicalPermission(string text)
    {
        var result = Permission.Create(text);

        Assert.True(result.IsSuccess);
        Assert.Equal(text, result.Value.Value);
    }

    [Theory]
    [InlineData("")]
    [InlineData("identity.users")]
    [InlineData("identity.users.view.extra")]
    [InlineData("Identity.users.view")]
    [InlineData("identity.users.view all")]
    [InlineData("identity..view")]
    [InlineData("identity.users.view_")]
    public void CreateRejectsInvalidPermission(string text)
    {
        Assert.True(Permission.Create(text).IsFailure);
    }

    [Fact]
    public void EqualityUsesPermissionText()
    {
        var first = Permission.Create("identity.users.view").Value;
        var second = Permission.Create("identity.users.view").Value;

        Assert.Equal(first, second);
    }

    [Fact]
    public void CatalogContainsOnlyValidUniquePermissions()
    {
        Assert.Equal(6, PermissionCatalog.All.Count);
        Assert.Equal(PermissionCatalog.All.Count, PermissionCatalog.All.Distinct().Count());
        Assert.All(PermissionCatalog.All, permission => Assert.True(Permission.Create(permission.Value).IsSuccess));
    }

    [Fact]
    public void CatalogRecognizesKnownPermissionOnly()
    {
        Assert.True(PermissionCatalog.Contains(Permission.Create("identity.users.view").Value));
        Assert.False(PermissionCatalog.Contains(Permission.Create("other.resource.action").Value));
    }
}
