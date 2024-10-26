from .models import Clinic_Info  # Import your Clinic model

def display_clinic_info(request):
    try:
        clinic = Clinic_Info.objects.first()  # Assuming you have only one clinic
        return {
            'clinic_info': {
                'name': clinic.clinic_name,
                'logo': clinic.logo.url if clinic.logo else None,
                # Add other clinic fields as needed
            }
        }
    except Clinic_Info.DoesNotExist:
        return {'clinic_info': None}
