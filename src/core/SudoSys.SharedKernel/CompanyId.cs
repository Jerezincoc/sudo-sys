namespace SudoSys.SharedKernel;

public readonly record struct CompanyId
{
    private CompanyId(Guid value)
    {
        Value = value;
    }

    public Guid Value { get; }

    public static CompanyId New() => new(Guid.NewGuid());

    public static Result<CompanyId> From(Guid value) => value == Guid.Empty
        ? Result.Failure<CompanyId>(new Error("company_id.empty", "Company identifier cannot be empty."))
        : Result.Success(new CompanyId(value));
}
