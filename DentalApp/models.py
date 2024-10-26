from django.db import models
from django.conf import settings
from django.contrib.auth.models import BaseUserManager, AbstractBaseUser, AbstractUser
from django.core.exceptions import ValidationError
from django.db.models import F, Sum
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from datetime import timedelta, datetime
# Create your models here.

from django.db import models

class CustomUserManager(BaseUserManager):
    def create_user(self, username, password=None, **extra_fields):
        if not username:
            raise ValueError('The Username field must be set')
        user = self.model(username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(username, password, **extra_fields)

class CustomUser(AbstractUser):
    objects = CustomUserManager()
    is_staff = models.BooleanField(default=False)
    is_dentist = models.BooleanField(default=False)
    is_patient = models.BooleanField(default=False)
    is_email_verified = models.BooleanField(default=False)
    
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = []

    def __str__(self):
         return self.username

# class CustomUser(AbstractBaseUser):
#     username = models.CharField(max_length=150, unique=True)
#     is_staff = models.BooleanField(default=False)
#     is_dentist = models.BooleanField(default=False)
#     is_patient = models.BooleanField(default=False)
#     is_superuser = models.BooleanField(default=False)

#     USERNAME_FIELD = 'username'
#     REQUIRED_FIELDS = []

#     def __str__(self):
#         return self.username
class Patient(models.Model):
    user_account = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    gender = models.CharField(max_length=15)
    date_of_birth = models.DateField()
    contact_number = models.CharField(max_length=15)
    email = models.EmailField(unique=True)
    address = models.TextField(blank=True)
    image = models.ImageField(upload_to='item_images', default='item_images/default.jpg', blank=True, null=True)
    input_date = models.DateField(auto_now_add=True)

    def __str__(self):
        full_name = f"{self.first_name.capitalize()} {self.last_name.capitalize()}"
        return full_name
    
    def save(self, *args, **kwargs):
        # Capitalize first name and last name before saving
        self.first_name = self.first_name.capitalize()
        self.last_name = self.last_name.capitalize()
        super(Patient, self).save(*args, **kwargs)

class Clinic_Info(models.Model):
    clinic_name = models.CharField(max_length=100)
    clinic_address = models.CharField(max_length=100)
    contact_no = models.CharField(max_length=30)
    email = models.EmailField()
    facebook = models.CharField(max_length=100, blank=True, null=True)
    open_hours = models.CharField(max_length=200)
    logo = models.ImageField(blank=True, null=True)

class Dentist(models.Model):
    user_account = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    name = models.CharField(max_length=200)
    gender = models.CharField(max_length=10, choices=[
        ('Male', 'Male'),
        ('Female', 'Female'),
    ])
    address = models.CharField(max_length=100)
    contact_no = models.CharField(max_length=15)
    email = models.EmailField()
    degree = models.CharField(max_length=50)
    specialty = models.CharField(max_length=50)
    image = models.ImageField(blank=True, null=True)

    def __str__(self):
        return self.name
    
class Staff(models.Model):
    user_account = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    name = models.CharField(max_length=200)
    gender = models.CharField(max_length=10, choices=[
        ('Male', 'Male'),
        ('Female', 'Female'),
    ])
    address = models.CharField(max_length=100)
    contact_no = models.CharField(max_length=15)
    email = models.EmailField()
    image = models.ImageField(blank=True, null=True)

    def __str__(self):
        return self.name

class TimeSlot(models.Model):
    DAY_CHOICES = [
        ('Monday', 'Monday'),
        ('Tuesday', 'Tuesday'),
        ('Wednesday', 'Wednesday'),
        ('Thursday', 'Thursday'),
        ('Friday', 'Friday'),
        ('Saturday', 'Saturday'),
        ('Sunday', 'Sunday'),
    ]

    day_of_week = models.CharField(max_length=10, choices=DAY_CHOICES)
    start_time = models.TimeField()
    end_time = models.TimeField()

    class Meta:
        unique_together = ('day_of_week', 'start_time', 'end_time')

    def __str__(self):
        return f'{self.day_of_week}: {self.start_time} - {self.end_time}'

class Treatment(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    cost = models.DecimalField(max_digits=10, decimal_places=2)
    duration = models.IntegerField(help_text="Duration of the treatment in minutes")
    image = models.ImageField(upload_to='item_images', blank=True, null=True)

    def __str__(self):
        return self.name
    
class Appointment(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    dentist = models.ForeignKey(Dentist, on_delete=models.SET_NULL, null=True, blank=True)
    treatment = models.ManyToManyField(Treatment, blank=True)
    appointment_date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField(blank=True, null=True)
    notes = models.CharField(blank=True, null=True)
    status = models.CharField(default="Pending")
    cancellation_reason = models.TextField(blank=True, null=True)
    date_sent = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Appointment for {self.patient} on {self.appointment_date}"

class MedicalHistory(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    medical_condition = models.CharField(max_length=150)
    medications = models.CharField(max_length=100, blank=True)
    allergies = models.CharField(max_length=100, blank=True)
    notes = models.CharField(max_length=255, blank=True)

class Invoice(models.Model):
    invoice_number = models.CharField(max_length=20)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    remarks = models.TextField(blank=True)
    invoice_date = models.DateTimeField(auto_now_add=True)
    total_sum = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    paid = models.BooleanField(default=False)

    def update_total(self):
        item_totals = self.items.aggregate(total_sum=Sum(F('qty') * F('price')))
        self.total_sum = item_totals['total_sum'] or 0.00
        self.save()

    def __str__(self) :
        return f"{self.invoice_number} ({self.patient}) Total: ₱{self.total_sum}"

class Invoice_items(models.Model):
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='items')
    treatment = models.ForeignKey(Treatment, on_delete=models.CASCADE)
    qty = models.IntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.treatment} ({self.qty} x {self.price})"

@receiver(post_save, sender=Invoice_items)
@receiver(post_delete, sender=Invoice_items)
def update_invoice_total(sender, instance, **kwargs):
    instance.invoice.update_total()

class Payment(models.Model):
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE)
    payment = models.DecimalField(max_digits=10, decimal_places=2)
    payment_date = models.DateTimeField()
    input_date = models.DateTimeField(auto_now_add=True)
    remarks = models.TextField(blank=True)

class Event(models.Model):
    title = models.CharField(max_length=200)
    start = models.DateTimeField()
    end = models.DateTimeField()
    description = models.TextField()
    location = models.CharField(max_length=200)
    all_day = models.BooleanField(default=False)

class Notification(models.Model):
    appointment = models.ForeignKey(Appointment, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='notifications')
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification for {self.user.username}: {self.message}"