using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using SudoSys.Identity.Domain;
using SudoSys.SharedKernel;

namespace SudoSys.Identity.Infrastructure;

internal sealed class RoleConfiguration : IEntityTypeConfiguration<Role>
{
    public void Configure(EntityTypeBuilder<Role> builder)
    {
        var roleIdConverter = new ValueConverter<RoleId, Guid>(id => id.Value, value => RoleId.From(value).Value);
        var officeIdConverter = new ValueConverter<OfficeId?, Guid?>(
            id => id.HasValue ? id.Value.Value : null,
            value => value.HasValue ? OfficeId.From(value.Value).Value : null);

        builder.ToTable("roles");
        builder.HasKey(role => role.Id);
        builder.Property(role => role.Id).HasColumnName("id").HasConversion(roleIdConverter).ValueGeneratedNever();
        builder.Property(role => role.OfficeId).HasColumnName("office_id").HasConversion(officeIdConverter);
        builder.Property(role => role.Name).HasColumnName("name").HasMaxLength(80).IsRequired();
        builder.Property(role => role.IsSystem).HasColumnName("is_system").IsRequired();
        builder.Ignore(role => role.Permissions);
        builder.HasIndex(role => role.OfficeId);
    }
}
