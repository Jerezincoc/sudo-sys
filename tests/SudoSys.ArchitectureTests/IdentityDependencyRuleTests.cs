namespace SudoSys.ArchitectureTests;

public class IdentityDependencyRuleTests
{
    [Theory]
    [InlineData("SudoSys.Identity.Domain", new[] { "SudoSys.SharedKernel" })]
    [InlineData("SudoSys.Identity.Contracts", new string[0])]
    [InlineData("SudoSys.Identity.Application", new[] { "SudoSys.Identity.Domain", "SudoSys.Identity.Contracts", "SudoSys.SharedKernel" })]
    [InlineData("SudoSys.Identity.Infrastructure", new[] { "SudoSys.Identity.Application", "SudoSys.Identity.Domain", "SudoSys.Identity.Contracts" })]
    public void ProjetoReferenciaSomenteOPermitido(string projeto, string[] permitidos)
    {
        var excedentes = ProjectReferences.Of(projeto).Except(permitidos).ToList();

        Assert.Empty(excedentes);
    }

    [Theory]
    [InlineData("SudoSys.Identity.Domain")]
    [InlineData("SudoSys.Identity.Application")]
    [InlineData("SudoSys.Identity.Infrastructure")]
    [InlineData("SudoSys.Identity.Contracts")]
    public void ModuloNaoReferenciaApi(string projeto)
    {
        Assert.DoesNotContain("SudoSys.Api", ProjectReferences.Of(projeto));
    }

    [Theory]
    [InlineData("SudoSys.Identity.Domain")]
    [InlineData("SudoSys.Identity.Application")]
    public void DomainEApplicationNaoReferenciamPersistencia(string projeto)
    {
        var packages = ProjectReferences.PackagesOf(projeto);

        Assert.DoesNotContain(packages, package => package.Contains("EntityFrameworkCore", StringComparison.OrdinalIgnoreCase));
        Assert.DoesNotContain(packages, package => package.Contains("Npgsql", StringComparison.OrdinalIgnoreCase));
    }

    [Fact]
    public void InfrastructurePodeReferenciarPersistencia()
    {
        var packages = ProjectReferences.PackagesOf("SudoSys.Identity.Infrastructure");

        Assert.Contains("Microsoft.EntityFrameworkCore.Design", packages);
        Assert.Contains("Npgsql.EntityFrameworkCore.PostgreSQL", packages);
    }
}
