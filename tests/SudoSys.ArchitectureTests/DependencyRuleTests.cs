using System.Reflection;
using SudoSys.SharedKernel;

namespace SudoSys.ArchitectureTests;

public class DependencyRuleTests
{
    [Fact]
    public void SharedKernelNaoDependeDeFrameworkWebNemDaApi()
    {
        var proibidos = new[] { "Microsoft.AspNetCore", "Npgsql", "Microsoft.EntityFrameworkCore", "SudoSys.Api" };

        var referenciados = SharedKernelAssembly.Assembly
            .GetReferencedAssemblies()
            .Select(a => a.Name ?? string.Empty)
            .Where(n => proibidos.Any(p => n.StartsWith(p, StringComparison.Ordinal)))
            .ToList();

        Assert.Empty(referenciados);
    }
}

