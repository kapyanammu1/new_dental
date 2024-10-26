# Generated by Django 4.2.1 on 2024-10-18 10:40

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('DentalApp', '0020_notification_patient'),
    ]

    operations = [
        migrations.AddField(
            model_name='notification',
            name='appointment',
            field=models.ForeignKey(default=92, on_delete=django.db.models.deletion.CASCADE, to='DentalApp.appointment'),
            preserve_default=False,
        ),
    ]