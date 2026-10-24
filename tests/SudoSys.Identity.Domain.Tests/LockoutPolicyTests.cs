using SudoSys.Identity.Domain;

namespace SudoSys.Identity.Domain.Tests;

public class LockoutPolicyTests
{
    [Fact]
    public void DefaultsToFiveAttemptsAndFifteenMinutes()
    {
        var policy = new LockoutPolicy();

        Assert.Equal(5, policy.MaxFailedAttempts);
        Assert.Equal(TimeSpan.FromMinutes(15), policy.Duration);
    }

    [Fact]
    public void RejectsNonPositiveValues()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() => new LockoutPolicy(0, TimeSpan.FromMinutes(1)));
        Assert.Throws<ArgumentOutOfRangeException>(() => new LockoutPolicy(1, TimeSpan.Zero));
    }
}
