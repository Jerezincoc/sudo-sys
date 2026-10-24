using System.Collections.Immutable;
using SudoSys.SharedKernel;

namespace SudoSys.Identity.Domain;

public sealed class CompanyScope : IEquatable<CompanyScope>
{
    private readonly ImmutableHashSet<CompanyId> _companyIds;

    private CompanyScope(bool includesAll, ImmutableHashSet<CompanyId> companyIds)
    {
        IncludesAll = includesAll;
        _companyIds = companyIds;
    }

    public bool IncludesAll { get; }

    public IReadOnlySet<CompanyId> CompanyIds => _companyIds;

    public static CompanyScope All() => new(true, ImmutableHashSet<CompanyId>.Empty);

    public static Result<CompanyScope> Specific(IEnumerable<CompanyId> companyIds)
    {
        if (companyIds is null)
        {
            return InvalidCompanies();
        }

        var values = companyIds.ToList();
        if (values.Count == 0 || values.Any(companyId => companyId.Value == Guid.Empty))
        {
            return InvalidCompanies();
        }

        var uniqueValues = values.ToImmutableHashSet();
        if (uniqueValues.Count != values.Count)
        {
            return InvalidCompanies();
        }

        return Result.Success(new CompanyScope(false, uniqueValues));
    }

    public bool Allows(CompanyId companyId) =>
        companyId.Value != Guid.Empty && (IncludesAll || _companyIds.Contains(companyId));

    public bool Equals(CompanyScope? other) => other is not null
        && IncludesAll == other.IncludesAll
        && _companyIds.SetEquals(other._companyIds);

    public override bool Equals(object? obj) => Equals(obj as CompanyScope);

    public override int GetHashCode()
    {
        var hash = new HashCode();
        hash.Add(IncludesAll);
        foreach (var companyId in _companyIds.OrderBy(value => value.Value))
        {
            hash.Add(companyId);
        }

        return hash.ToHashCode();
    }

    private static Result<CompanyScope> InvalidCompanies() => Result.Failure<CompanyScope>(
        new Error("company_scope.invalid", "A specific company scope requires unique valid companies."));
}
