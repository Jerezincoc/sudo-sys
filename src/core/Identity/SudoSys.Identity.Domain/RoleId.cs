using SudoSys.SharedKernel;

namespace SudoSys.Identity.Domain;

public readonly record struct RoleId
{
    private RoleId(Guid value)
    {
        Value = value;
    }

    public Guid Value { get; }

    public static RoleId New() => new(Guid.NewGuid());

    public static Result<RoleId> From(Guid value) => value == Guid.Empty
        ? Result.Failure<RoleId>(new Error("role_id.empty", "Role identifier cannot be empty."))
        : Result.Success(new RoleId(value));
}
