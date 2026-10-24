using SudoSys.Identity.Domain;
using SudoSys.SharedKernel;

namespace SudoSys.Identity.Infrastructure;

internal sealed class UserCompanyScopeRow
{
    public UserId UserId { get; set; }

    public OfficeId OfficeId { get; set; }

    public CompanyId CompanyId { get; set; }
}

internal sealed class RolePermissionRow
{
    public RoleId RoleId { get; set; }

    public OfficeId? OfficeId { get; set; }

    public string Permission { get; set; } = string.Empty;
}
