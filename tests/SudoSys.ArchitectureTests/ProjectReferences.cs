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
        return XDocument.Load(ProjectFile(projectName))
            .Descendants("ProjectReference")
            .Select(e => Path.GetFileNameWithoutExtension(((string?)e.Attribute("Include") ?? string.Empty).Replace((char)92, '/')))
            .ToList();
    }

    public static IReadOnlyList<string> PackagesOf(string projectName) =>
        XDocument.Load(ProjectFile(projectName))
            .Descendants("PackageReference")
            .Select(element => (string?)element.Attribute("Include") ?? string.Empty)
            .ToList();

    private static string ProjectFile(string projectName) => Directory
        .EnumerateFiles(RepositoryRoot(), projectName + ".csproj", SearchOption.AllDirectories)
        .Single(path => !path.Contains(
            $"{Path.DirectorySeparatorChar}obj{Path.DirectorySeparatorChar}",
            StringComparison.Ordinal));

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
