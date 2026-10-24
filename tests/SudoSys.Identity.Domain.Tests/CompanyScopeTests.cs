using SudoSys.Identity.Domain;
using SudoSys.SharedKernel;

namespace SudoSys.Identity.Domain.Tests;

public class CompanyScopeTests
{
    [Fact]
    public void AllAllowsAnyValidCompany()
    {
        Assert.True(CompanyScope.All().Allows(CompanyId.New()));
    }

    [Fact]
    public void SpecificAllowsOnlyListedCompanies()
    {
        var allowed = CompanyId.New();
        var scope = CompanyScope.Specific([allowed]).Value;

        Assert.True(scope.Allows(allowed));
        Assert.False(scope.Allows(CompanyId.New()));
    }

    [Fact]
    public void SpecificRejectsEmptyOrDuplicateList()
    {
        var companyId = CompanyId.New();

        Assert.True(CompanyScope.Specific([]).IsFailure);
        Assert.True(CompanyScope.Specific([companyId, companyId]).IsFailure);
    }

    [Fact]
    public void SpecificEqualityIgnoresInputOrder()
    {
        var first = CompanyId.New();
        var second = CompanyId.New();

        Assert.Equal(
            CompanyScope.Specific([first, second]).Value,
            CompanyScope.Specific([second, first]).Value);
    }
}
