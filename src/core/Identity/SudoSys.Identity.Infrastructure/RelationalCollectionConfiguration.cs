using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using SudoSys.Identity.Domain;
using SudoSys.SharedKernel;

namespace SudoSys.Identity.Infrastructure;

internal sealed class UserCompanyScopeConfiguration : IEntityTypeConfiguration<UserCompanyScopeRow>
{
    public void Configure(EntityTypeBuilder<UserCompanyScopeRow> builder)
    {
        builder.ToTable("user_company_scope");
        builder.HasKey(row => new { row.UserId, row.CompanyId });
        builder.Property(row => row.UserId).HasColumnName("user_id").HasConversion(IdConverters.UserId);
        builder.Property(row => row.OfficeId).HasColumnName("office_id").HasConversion(IdConverters.OfficeId);
        builder.Property(row => row.CompanyId).HasColumnName("company_id").HasConversion(IdConverters.CompanyId);
        builder.HasOne<User>().WithMany().HasForeignKey(row => row.UserId).OnDelete(DeleteBehavior.Cascade);
        builder.HasIndex(row => row.OfficeId);
    }
}

internal sealed class RolePermissionConfiguration : IEntityTypeConfiguration<RolePermissionRow>
{
    public void Configure(EntityTypeBuilder<RolePermissionRow> builder)
    {
        builder.ToTable("role_permissions");
        builder.HasKey(row => new { row.RoleId, row.Permission });
        builder.Property(row => row.RoleId).HasColumnName("role_id").HasConversion(IdConverters.RoleId);
        builder.Property(row => row.OfficeId).HasColumnName("office_id").HasConversion(IdConverters.NullableOfficeId);
        builder.Property(row => row.Permission).HasColumnName("permission").HasMaxLength(200);
        builder.HasOne<Role>().WithMany().HasForeignKey(row => row.RoleId).OnDelete(DeleteBehavior.Cascade);
        builder.HasIndex(row => row.OfficeId);
    }
}

internal static class IdConverters
{
    public static ValueConverter<UserId, Guid> UserId { get; } =
        new(id => id.Value, value => SudoSys.Identity.Domain.UserId.From(value).Value);

    public static ValueConverter<RoleId, Guid> RoleId { get; } =
        new(id => id.Value, value => SudoSys.Identity.Domain.RoleId.From(value).Value);

    public static ValueConverter<OfficeId, Guid> OfficeId { get; } =
        new(id => id.Value, value => SudoSys.SharedKernel.OfficeId.From(value).Value);

    public static ValueConverter<OfficeId?, Guid?> NullableOfficeId { get; } =
        new(id => id.HasValue ? id.Value.Value : null, value => value.HasValue ? SudoSys.SharedKernel.OfficeId.From(value.Value).Value : null);

    public static ValueConverter<CompanyId, Guid> CompanyId { get; } =
        new(id => id.Value, value => SudoSys.SharedKernel.CompanyId.From(value).Value);
}
