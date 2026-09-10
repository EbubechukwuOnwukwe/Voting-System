from django.core.management.base import BaseCommand
from voting_api.models import Election

class Command(BaseCommand):
    help = "Delete all elections and their positions, candidates and votes. Does not delete users or CMS administrators."

    def add_arguments(self, parser):
        parser.add_argument("--yes", action="store_true", help="Confirm destructive operation")

    def handle(self, *args, **options):
        if not options["yes"]:
            self.stdout.write("This deletes ALL elections, positions, candidates and votes. Run with --yes to confirm.")
            return
        count = Election.objects.count()
        Election.objects.all().delete()
        self.stdout.write(self.style.SUCCESS(f"Deleted {count} election(s) and all related positions, candidates and votes."))
