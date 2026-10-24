using SudoSys.SharedKernel;

namespace SudoSys.Identity.Domain;

public readonly record struct UserId
{
    private UserId(Guid value)
    {
        Value = value;
    }

    public Guid Value { get; }

    public static UserId New() => new(Guid.NewGuid());

    public static Result<UserId> From(Guid value) => value == Guid.Empty
        ? Result.Failure<UserId>(new Error("user_id.empty", "User identifier cannot be empty."))
        : Result.Success(new UserId(value));
}
