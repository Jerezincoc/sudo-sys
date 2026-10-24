namespace SudoSys.SharedKernel;

[System.Diagnostics.CodeAnalysis.SuppressMessage(
    "Naming",
    "CA1716:Identifiers should not match keywords",
    Justification = "The approved SharedKernel contract requires the public type name Error.")]
public sealed record Error(string Code, string Message)
{
    public static Error None { get; } = new(string.Empty, string.Empty);
}
