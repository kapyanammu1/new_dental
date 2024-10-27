from .models import Clinic_Info, Staff, Dentist  # Import your Clinic model

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
    
def display_user_details(request):
    if not request.user.is_authenticated:
        return {'user_details': None}
    
    user = request.user
    try:
        if user.is_staff:
            user_details = Staff.objects.get(user_account=user)
        elif hasattr(user, 'is_dentist') and user.is_dentist:
            user_details = Dentist.objects.get(user_account=user)
        else:
            return {'user_details': None}
            
        return {'user_details': user_details}
    except (Staff.DoesNotExist, Dentist.DoesNotExist):
        return {'user_details': None}
