using SudoSys.SharedKernel;

namespace SudoSys.Identity.Application;

public interface ITenantContext
{
    OfficeId? OfficeId { get; }
}
