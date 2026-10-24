using SudoSys.SharedKernel;

namespace SudoSys.Identity.Domain;

[System.Diagnostics.CodeAnalysis.SuppressMessage(
    "Naming",
    "CA1711:Identifiers should not have incorrect suffix",
    Justification = "The approved Identity domain language requires the value object name Permission.")]
public sealed record Permission
{
    private Permission(string value)
    {
        Value = value;
    }

    public string Value { get; }

    public static Result<Permission> Create(string value)
    {
        if (string.IsNullOrEmpty(value))
        {
            return Invalid();
        }

        var segments = value.Split('.');
        if (segments.Length != 3 || segments.Any(segment => !IsValidSegment(segment)))
        {
            return Invalid();
        }

        return Result.Success(new Permission(value));
    }

    public override string ToString() => Value;

    private static bool IsValidSegment(string segment) =>
        segment.Length > 0 && segment.All(character =>
            character is >= 'a' and <= 'z' or >= '0' and <= '9' or '-');

    private static Result<Permission> Invalid() =>
        Result.Failure<Permission>(new Error(
            "permission.invalid_format",
            "Permission must contain three lowercase alphanumeric or hyphen-separated segments."));
}
