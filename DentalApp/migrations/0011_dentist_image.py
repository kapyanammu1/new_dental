# Generated by Django 4.2.1 on 2024-10-05 15:51

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('DentalApp', '0010_timeslot'),
    ]

    operations = [
        migrations.AddField(
            model_name='dentist',
            name='image',
            field=models.ImageField(blank=True, null=True, upload_to=''),
        ),
    ]