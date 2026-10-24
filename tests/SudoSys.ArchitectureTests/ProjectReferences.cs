using System.Xml.Linq;

namespace SudoSys.ArchitectureTests;

/// <summary>
/// Lê as ProjectReference declaradas nos .csproj. A checagem por reflexão não serve aqui:
/// o compilador omite referências que o código não usa, então ela não enxergaria a violação.
/// </summary>
internal static class ProjectReferences
{
    public static IReadOnlyList<string> Of(string projectName)
    {
        var csproj = Directory
            .EnumerateFiles(RepositoryRoot(), projectName + ".csproj", SearchOption.AllDirectories)
            .Single(p => !p.Contains($"{Path.DirectorySeparatorChar}obj{Path.DirectorySeparatorChar}", StringComparison.Ordinal));

        return XDocument.Load(csproj)
            .Descendants("ProjectReference")
            .Select(e => Path.GetFileNameWithoutExtension(((string?)e.Attribute("Include") ?? string.Empty).Replace((char)92, '/')))
            .ToList();
    }

    private static string RepositoryRoot()
    {
        var dir = new DirectoryInfo(AppContext.BaseDirectory);
        while (dir is not null && !File.Exists(Path.Combine(dir.FullName, "SudoSys.slnx")))
        {
            dir = dir.Parent;
        }

        return dir?.FullName ?? throw new InvalidOperationException("SudoSys.slnx não encontrado.");
    }
}
