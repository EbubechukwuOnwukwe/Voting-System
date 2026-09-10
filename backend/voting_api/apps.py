from django.apps import AppConfig


class VotingApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'voting_api'
    verbose_name = 'AI-Enhanced Voting System API'

    def ready(self):
        """Import signals when app is ready"""
        import voting_api.signals
