using System.Collections.Immutable;
using SudoSys.SharedKernel;

namespace SudoSys.Identity.Domain;

public sealed class Role
{
    private ImmutableHashSet<Permission> _permissions;

    private Role()
    {
        Name = null!;
        _permissions = ImmutableHashSet<Permission>.Empty;
    }

    private Role(RoleId id, OfficeId? officeId, string name, bool isSystem, ImmutableHashSet<Permission> permissions)
    {
        Id = id;
        OfficeId = officeId;
        Name = name;
        IsSystem = isSystem;
        _permissions = permissions;
    }

    public RoleId Id { get; }

    public OfficeId? OfficeId { get; }

    public string Name { get; private set; }

    public bool IsSystem { get; }

    public IReadOnlySet<Permission> Permissions => _permissions;

    public static Result<Role> CreateSystem(string name, IEnumerable<Permission> permissions) =>
        Create(null, name, true, permissions);

    public static Result<Role> CreateCustom(OfficeId officeId, string name, IEnumerable<Permission> permissions)
    {
        if (officeId.Value == Guid.Empty)
        {
            return Result.Failure<Role>(new Error("role.office_id.empty", "Custom role requires a valid office."));
        }

        return Create(officeId, name, false, permissions);
    }

    public Result Rename(string name)
    {
        if (IsSystem)
        {
            return ImmutableSystemRole();
        }

        var normalizedName = NormalizeName(name);
        if (normalizedName is null)
        {
            return InvalidName();
        }

        Name = normalizedName;
        return Result.Success();
    }

    public Result Grant(Permission permission)
    {
        if (IsSystem)
        {
            return ImmutableSystemRole();
        }

        if (!PermissionCatalog.Contains(permission))
        {
            return UnknownPermission();
        }

        _permissions = _permissions.Add(permission);
        return Result.Success();
    }

    public Result Revoke(Permission permission)
    {
        if (IsSystem)
        {
            return ImmutableSystemRole();
        }

        if (!PermissionCatalog.Contains(permission))
        {
            return UnknownPermission();
        }

        _permissions = _permissions.Remove(permission);
        return Result.Success();
    }

    public Result<Role> CopyAs(string name, OfficeId officeId) => CreateCustom(officeId, name, _permissions);

    private static Result<Role> Create(
        OfficeId? officeId,
        string name,
        bool isSystem,
        IEnumerable<Permission> permissions)
    {
        var normalizedName = NormalizeName(name);
        if (normalizedName is null)
        {
            return Result.Failure<Role>(new Error("role.name.invalid", "Role name must contain between 1 and 80 characters."));
        }

        if (permissions is null)
        {
            return Result.Failure<Role>(new Error("role.permissions.required", "Role permissions are required."));
        }

        var permissionSet = permissions.ToImmutableHashSet();
        if (permissionSet.Any(permission => !PermissionCatalog.Contains(permission)))
        {
            return Result.Failure<Role>(new Error("role.permission.unknown", "Role contains a permission outside the catalog."));
        }

        return Result.Success(new Role(RoleId.New(), officeId, normalizedName, isSystem, permissionSet));
    }

    private static string? NormalizeName(string name)
    {
        var normalized = name?.Trim();
        return string.IsNullOrEmpty(normalized) || normalized.Length > 80 ? null : normalized;
    }

    private static Result InvalidName() => Result.Failure(
        new Error("role.name.invalid", "Role name must contain between 1 and 80 characters."));

    private static Result ImmutableSystemRole() => Result.Failure(
        new Error("role.system.immutable", "System roles cannot be changed."));

    private static Result UnknownPermission() => Result.Failure(
        new Error("role.permission.unknown", "Permission is outside the catalog."));

    internal void RestorePermissions(IEnumerable<Permission> permissions) =>
        _permissions = permissions.ToImmutableHashSet();
}
