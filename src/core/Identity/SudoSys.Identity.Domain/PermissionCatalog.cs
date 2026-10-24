using System.Collections.Frozen;

namespace SudoSys.Identity.Domain;

public static class PermissionCatalog
{
    public static Permission IdentityUsersView { get; } = Create("identity.users.view");
    public static Permission IdentityUsersCreate { get; } = Create("identity.users.create");
    public static Permission IdentityUsersEdit { get; } = Create("identity.users.edit");
    public static Permission IdentityUsersDeactivate { get; } = Create("identity.users.deactivate");
    public static Permission IdentityRolesView { get; } = Create("identity.roles.view");
    public static Permission IdentityRolesManage { get; } = Create("identity.roles.manage");

    public static IReadOnlySet<Permission> All { get; } = new[]
    {
        IdentityUsersView,
        IdentityUsersCreate,
        IdentityUsersEdit,
        IdentityUsersDeactivate,
        IdentityRolesView,
        IdentityRolesManage
    }.ToFrozenSet();

    public static bool Contains(Permission permission) => All.Contains(permission);

    private static Permission Create(string value) => Permission.Create(value).Value;
}
