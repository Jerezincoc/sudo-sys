using SudoSys.Identity.Domain;
using SudoSys.SharedKernel;

namespace SudoSys.Identity.Domain.Tests;

public class IdTests
{
    [Fact]
    public void NewCreatesNonEmptyIdentifiers()
    {
        Assert.NotEqual(Guid.Empty, OfficeId.New().Value);
        Assert.NotEqual(Guid.Empty, CompanyId.New().Value);
        Assert.NotEqual(Guid.Empty, UserId.New().Value);
        Assert.NotEqual(Guid.Empty, RoleId.New().Value);
    }

    [Fact]
    public void FromPreservesValidGuid()
    {
        var value = Guid.NewGuid();

        Assert.Equal(value, OfficeId.From(value).Value.Value);
        Assert.Equal(value, CompanyId.From(value).Value.Value);
        Assert.Equal(value, UserId.From(value).Value.Value);
        Assert.Equal(value, RoleId.From(value).Value.Value);
    }

    [Fact]
    public void FromRejectsEmptyGuid()
    {
        Assert.True(OfficeId.From(Guid.Empty).IsFailure);
        Assert.True(CompanyId.From(Guid.Empty).IsFailure);
        Assert.True(UserId.From(Guid.Empty).IsFailure);
        Assert.True(RoleId.From(Guid.Empty).IsFailure);
    }
}
