# Generated by Django 4.2.1 on 2024-10-04 18:44

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('DentalApp', '0008_clinic_info_logo_clinic_info_open_hours'),
    ]

    operations = [
        migrations.AlterField(
            model_name='clinic_info',
            name='facebook',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
    ]