from django.core.management.base import BaseCommand
from scripts.generate_sample_data import create_sample_data

class Command(BaseCommand):
    help = 'Generates sample data for the Dental Clinic application'

    def handle(self, *args, **kwargs):
        create_sample_data()
        self.stdout.write(self.style.SUCCESS('Successfully generated sample data'))