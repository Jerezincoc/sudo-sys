namespace SudoSys.SharedKernel;

public readonly record struct OfficeId
{
    private OfficeId(Guid value)
    {
        Value = value;
    }

    public Guid Value { get; }

    public static OfficeId New() => new(Guid.NewGuid());

    public static Result<OfficeId> From(Guid value) => value == Guid.Empty
        ? Result.Failure<OfficeId>(new Error("office_id.empty", "Office identifier cannot be empty."))
        : Result.Success(new OfficeId(value));
}
