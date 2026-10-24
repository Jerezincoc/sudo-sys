namespace SudoSys.Identity.Domain;

public sealed record LockoutPolicy
{
    public LockoutPolicy(int maxFailedAttempts = 5, TimeSpan? duration = null)
    {
        var effectiveDuration = duration ?? TimeSpan.FromMinutes(15);

        ArgumentOutOfRangeException.ThrowIfNegativeOrZero(maxFailedAttempts);
        if (effectiveDuration <= TimeSpan.Zero)
        {
            throw new ArgumentOutOfRangeException(nameof(duration), "Lockout duration must be positive.");
        }

        MaxFailedAttempts = maxFailedAttempts;
        Duration = effectiveDuration;
    }

    public int MaxFailedAttempts { get; }

    public TimeSpan Duration { get; }
}
