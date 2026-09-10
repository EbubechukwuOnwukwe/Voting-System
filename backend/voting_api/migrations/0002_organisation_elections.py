from django.db import migrations, models
import django.db.models.deletion


def migrate_existing_data(apps, schema_editor):
    Election = apps.get_model("voting_api", "Election")
    Position = apps.get_model("voting_api", "Position")
    Profile = apps.get_model("voting_api", "Profile")
    User = apps.get_model("auth", "User")

    # Do not create an election on a fresh installation. Elections are now created
    # explicitly by the CMS, so migrations must never start a voting countdown.
    election = None
    if Position.objects.filter(election__isnull=True).exists():
        election = Election.objects.create(
            name="Migrated Organisation Election",
            description="Migrated legacy positions. Edit or remove this election in the CMS.",
            start_time=__import__("django.utils.timezone", fromlist=["now"]).now(),
            end_time=__import__("django.utils.timezone", fromlist=["now"]).now() + __import__("datetime").timedelta(days=1),
        )
        Position.objects.filter(election__isnull=True).update(election=election)

    for profile in Profile.objects.all():
        first, *rest = (profile.nickname or "Voter").strip().split()
        last = " ".join(rest)
        profile.first_name = first
        profile.last_name = last
        profile.save(update_fields=["first_name", "last_name"])
        user = profile.user
        user.email = profile.email
        user.username = profile.email.lower()
        user.first_name = first
        user.last_name = last
        user.save(update_fields=["email", "username", "first_name", "last_name"])


class Migration(migrations.Migration):
    dependencies = [("voting_api", "0001_initial")]

    operations = [
        migrations.CreateModel(
            name="Election",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=200)),
                ("description", models.TextField(blank=True)),
                ("start_time", models.DateTimeField()),
                ("end_time", models.DateTimeField()),
                ("is_active", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={"ordering": ["-created_at"]},
        ),
        migrations.AddField(
            model_name="position",
            name="election",
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name="positions", to="voting_api.election"),
        ),
        migrations.AddField(model_name="profile", name="first_name", field=models.CharField(default="", max_length=100)),
        migrations.AddField(model_name="profile", name="last_name", field=models.CharField(default="", max_length=100)),
        migrations.AddField(model_name="profile", name="is_eligible", field=models.BooleanField(default=True)),
        migrations.RunPython(migrate_existing_data, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="position", name="election",
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="positions", to="voting_api.election"),
        ),
        migrations.RemoveField(model_name="profile", name="student_id"),
        migrations.RemoveField(model_name="profile", name="nickname"),
        migrations.AlterField(
            model_name="position", name="name",
            field=models.CharField(max_length=100),
        ),
        migrations.AlterUniqueTogether(name="position", unique_together=set()),
        migrations.AddConstraint(
            model_name="position",
            constraint=models.UniqueConstraint(fields=("election", "name"), name="unique_position_per_election"),
        ),
        migrations.AlterUniqueTogether(name="candidate", unique_together=set()),
        migrations.AddConstraint(
            model_name="candidate",
            constraint=models.UniqueConstraint(fields=("position", "name"), name="unique_candidate_per_position"),
        ),
    ]
