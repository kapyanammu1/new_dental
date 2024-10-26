from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model
from .models import Dentist, Staff

User = get_user_model()

class DentistStaffBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        try:
            user = User.objects.get(username=username)
            if user.check_password(password):
                # Check if the user is associated with a Dentist or Staff
                if Dentist.objects.filter(user_account=user).exists() or Staff.objects.filter(user_account=user).exists():
                    return user
        except User.DoesNotExist:
            return None
        return None
