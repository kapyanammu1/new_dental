# Generated by Django 4.2.1 on 2024-10-22 14:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('DentalApp', '0022_staff'),
    ]

    operations = [
        migrations.AddField(
            model_name='appointment',
            name='cancellation_reason',
            field=models.TextField(blank=True, null=True),
        ),
    ]
