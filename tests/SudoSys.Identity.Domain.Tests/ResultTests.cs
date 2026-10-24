using SudoSys.SharedKernel;

namespace SudoSys.Identity.Domain.Tests;

public class ResultTests
{
    [Fact]
    public void SuccessCarriesValueWithoutError()
    {
        var result = Result.Success(42);

        Assert.True(result.IsSuccess);
        Assert.False(result.IsFailure);
        Assert.Equal(42, result.Value);
        Assert.Equal(Error.None, result.Error);
    }

    [Fact]
    public void FailureCarriesErrorAndDoesNotExposeValue()
    {
        var error = new Error("test.failure", "Expected failure.");
        var result = Result.Failure<int>(error);

        Assert.True(result.IsFailure);
        Assert.Equal(error, result.Error);
        Assert.Throws<InvalidOperationException>(() => result.Value);
    }
}
