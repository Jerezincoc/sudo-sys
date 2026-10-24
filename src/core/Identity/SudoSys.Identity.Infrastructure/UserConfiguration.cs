using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using SudoSys.Identity.Domain;
using SudoSys.SharedKernel;

namespace SudoSys.Identity.Infrastructure;

internal sealed class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        var userIdConverter = new ValueConverter<UserId, Guid>(id => id.Value, value => UserId.From(value).Value);
        var officeIdConverter = new ValueConverter<OfficeId, Guid>(id => id.Value, value => OfficeId.From(value).Value);
        var roleIdConverter = new ValueConverter<RoleId, Guid>(id => id.Value, value => RoleId.From(value).Value);

        builder.ToTable("users");
        builder.HasKey(user => user.Id);
        builder.Property(user => user.Id).HasColumnName("id").HasConversion(userIdConverter).ValueGeneratedNever();
        builder.Property(user => user.OfficeId).HasColumnName("office_id").HasConversion(officeIdConverter).IsRequired();
        builder.Property(user => user.UserName).HasColumnName("user_name").HasMaxLength(64).IsRequired();
        builder.Property(user => user.DisplayName).HasColumnName("display_name").IsRequired();
        builder.Property(user => user.RoleId).HasColumnName("role_id").HasConversion(roleIdConverter).IsRequired();
        builder.Property(user => user.Status).HasColumnName("status").HasConversion<string>().HasMaxLength(20).IsRequired();
        builder.Property(user => user.MustChangePassword).HasColumnName("must_change_password").IsRequired();
        builder.Property(user => user.FailedLoginCount).HasColumnName("failed_login_count").IsRequired();
        builder.Property(user => user.LockedUntil).HasColumnName("locked_until").HasColumnType("timestamp with time zone");
        builder.Property<bool>("CompanyScopeIncludesAll").HasColumnName("company_scope_all").IsRequired();
        builder.Ignore(user => user.CompanyScope);
        builder.HasIndex(user => new { user.OfficeId, user.UserName }).IsUnique();
    }
}
