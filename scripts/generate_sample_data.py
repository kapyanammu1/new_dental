import os
import sys
import django
import random
from datetime import datetime, timedelta
from django.utils import timezone
from django.db import transaction

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


# Set up Django environment
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "DentalClinic.settings")
django.setup()

from DentalApp.models import CustomUser, Patient, Dentist, Treatment, Appointment, Invoice, Invoice_items, Payment

# Helper function to generate random dates
def random_date(start, end):
    return start + timedelta(
        seconds=random.randint(0, int((end - start).total_seconds()))
    )

# Create sample data
@transaction.atomic
def create_sample_data():
    # Create treatments
    treatments = [
        Treatment.objects.create(name="Cleaning", description="Regular dental cleaning", cost=100, duration=60),
        Treatment.objects.create(name="Filling", description="Dental filling", cost=200, duration=90),
        Treatment.objects.create(name="Root Canal", description="Root canal treatment", cost=800, duration=120),
        Treatment.objects.create(name="Crown", description="Dental crown", cost=1000, duration=120),
        Treatment.objects.create(name="Extraction", description="Tooth extraction", cost=150, duration=60),
    ]

    # Create dentists
    dentists = []
    for i in range(5):
        user = CustomUser.objects.create_user(f"dentist{i+1}", password="password", is_dentist=True)
        dentist = Dentist.objects.create(
            user_account=user,
            name=f"Dr. Dentist {i+1}",
            gender=random.choice(['Male', 'Female']),
            address=f"Address {i+1}",
            contact_no=f"123456789{i}",
            email=f"dentist{i+1}@example.com",
            degree="DDS",
            specialty=random.choice(['General', 'Orthodontics', 'Periodontics', 'Endodontics'])
        )
        dentists.append(dentist)

    # Create patients and appointments
    start_date = timezone.now().replace(year=timezone.now().year - 1, month=1, day=1, hour=9, minute=0, second=0, microsecond=0)
    end_date = timezone.now().replace(hour=17, minute=0, second=0, microsecond=0)

    for i in range(200):  # Create 200 patients
        user = CustomUser.objects.create_user(f"patient{i+1}", password="password", is_patient=True)
        patient = Patient.objects.create(
            user_account=user,
            first_name=f"FirstName{i+1}",
            last_name=f"LastName{i+1}",
            gender=random.choice(['Male', 'Female']),
            date_of_birth=random_date(start_date - timedelta(days=365*70), start_date - timedelta(days=365*18)),
            contact_number=f"987654321{i}",
            email=f"patient{i+1}@example.com",
            address=f"Patient Address {i+1}"
        )

        # Create 1-5 appointments for each patient
        for _ in range(random.randint(1, 5)):
            appointment_date = random_date(start_date, end_date)
            appointment = Appointment.objects.create(
                patient=patient,
                dentist=random.choice(dentists),
                appointment_date=appointment_date.date(),
                start_time=appointment_date.time(),
                end_time=(appointment_date + timedelta(minutes=60)).time(),
                status=random.choice(['Completed', 'Pending', 'Cancelled'])
            )
            appointment.treatment.set(random.sample(treatments, k=random.randint(1, 3)))

            # Create invoice and payment for completed appointments
            if appointment.status == 'Completed':
                invoice = Invoice.objects.create(
                    invoice_number=f"INV-{appointment.id}",
                    patient=patient,
                    invoice_date=appointment_date,
                    paid=True
                )
                for treatment in appointment.treatment.all():
                    Invoice_items.objects.create(
                        invoice=invoice,
                        treatment=treatment,
                        qty=1,
                        price=treatment.cost
                    )
                invoice.update_total()
                
                Payment.objects.create(
                    invoice=invoice,
                    payment=invoice.total_sum,
                    payment_date=appointment_date + timedelta(days=random.randint(0, 30)),
                    remarks="Payment for dental services"
                )

    print("Sample data created successfully!")

# if __name__ == "__main__":
#     create_sample_data()