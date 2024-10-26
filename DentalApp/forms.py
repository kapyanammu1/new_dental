from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm, UserChangeForm, PasswordChangeForm
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from .models import Staff, Clinic_Info, CustomUser, Dentist, Invoice_items, Invoice, Patient, Appointment, Treatment, Payment, MedicalHistory
from datetime import date

class CustomPasswordChangeForm(PasswordChangeForm):
    def __init__(self, *args, **kwargs):
        super(CustomPasswordChangeForm, self).__init__(*args, **kwargs)
        for field in self.fields:
            self.fields[field].widget.attrs.update({
                'class': 'form-control',  # Add your CSS classes here
                'placeholder': 'Enter ' + field.replace('_', ' ').capitalize(),
            })

class CustomUserChangeForm(UserChangeForm):
    class Meta(UserChangeForm.Meta):
        fields = ('username',)
    username = forms.CharField(
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter your Username'})
    )

class LoginForm(AuthenticationForm):
    username = forms.CharField(
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter your Username'})
    )
    password = forms.CharField(
        widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': 'Enter your Password'})
    )

class SignupForm(UserCreationForm):
    USER_TYPE_CHOICES = [
        ('staff', 'Staff'),
        ('dentist', 'Dentist'),
        ('patient', 'Patient'),
    ]

    user_type = forms.ChoiceField(
        choices=USER_TYPE_CHOICES,
        widget=forms.Select(attrs={'class': 'form-select', 'placeholder': 'Select User Type'})
    )

    class Meta:
        model = CustomUser
        fields = ('username', 'password1', 'password2', 'user_type')
    
    username = forms.CharField(
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter your Username'})
    )
    password1 = forms.CharField(
        label="Password", widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': 'Enter your Password'})
    )
    password2 = forms.CharField(
        label="Confirm Password", widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': 'Repeat your Password'})
    )

    def save(self, commit=True):
        user = super().save(commit=False)
        user_type = self.cleaned_data.get('user_type')
        
        user.is_staff = user_type == 'staff'
        user.is_dentist = user_type == 'dentist'
        user.is_patient = user_type == 'patient'
        
        if commit:
            user.save()
        return user

class ClinicForm(forms.ModelForm):
    class Meta:
        model = Clinic_Info
        fields = ('clinic_name', 'clinic_address', 'contact_no', 'email', 'facebook', 'open_hours', 'logo')

        widgets = {
            'clinic_name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter your clinic name',
                'required': True
            }),
            'clinic_address': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter your clinic address',
                'required': True
            }),
            'contact_no': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter your clinic contact number',
                'required': True
            }),
            'email': forms.EmailInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter your clinic email address',
                'required': True
            }),
            'facebook': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter your clinic Facebook page',
            }),
            'open_hours': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Ex. Monday - Saturday, 8:00 am - 5:00 pm',
                'required': True
            }),
            'logo': forms.ClearableFileInput(attrs={
                'class': 'form-control', 
                'accept': 'image/*'
            })
        }

class DentistForm(forms.ModelForm):
    class Meta:
        model = Dentist
        fields = ('name', 'gender', 'address', 'contact_no', 'email', 'degree', 'specialty', 'image')

        widgets = {
            'name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter your Name',
            }),
            'gender': forms.Select(attrs={
                'class': 'form-control',
                'placeholder': 'Enter gender',
            }),
            'address': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter your Address',
            }),
            'contact_no': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter your Contact Number',
            }),
            'email': forms.EmailInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter your Email address',
            }),
            'degree': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter your Degree',
            }),
            'specialty': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter your Specialty',
            }),
            'image': forms.ClearableFileInput(attrs={
            'class': 'form-control mb-2', 
            'accept': 'image/*'
            }),
        }

class StaffForm(forms.ModelForm):
    class Meta:
        model = Staff
        fields = ('name', 'gender', 'address', 'contact_no', 'email', 'image')

        widgets = {
            'name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter your Name',
            }),
            'gender': forms.Select(attrs={
                'class': 'form-control',
                'placeholder': 'Enter gender',
            }),
            'address': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter your Address',
            }),
            'contact_no': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter your Contact Number',
            }),
            'email': forms.EmailInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter your Email address',
            }),
            'image': forms.ClearableFileInput(attrs={
            'class': 'form-control mb-2', 
            'accept': 'image/*'
            }),
        }

class PatientForm(forms.ModelForm):
    Gender_choices = (
        ("Male", "Male"),
        ("Female", "Female"),
    )
    class Meta:
        model = Patient
        fields = ('first_name', 'last_name', 'gender', 'date_of_birth', 'contact_number', 'email', 'address', 'image',)

        widgets = {
            'first_name': forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': "Enter your First Name"
            }),
            'last_name': forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': "Enter your Last Name"
            }),
            'date_of_birth': forms.DateInput(attrs={
            'class': 'form-control', 
            'type': 'date',
            'placeholder': "Enter your Date of Birth"
            }),
            'contact_number': forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': "Enter your Contact No."
            }),
            'email': forms.TextInput(attrs={
            'class': 'form-control', 
            'type': 'email',
            'placeholder': "Enter your Email Address"
            }),
            'address': forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': "Enter your Address"
            }),
        }
    gender = forms.ChoiceField(
        widget=forms.Select(attrs={'class': 'form-select'}),
        choices=Gender_choices,
    )
    image = forms.ImageField(
        label="Photo",
        widget=forms.ClearableFileInput(attrs={'class': 'form-control', 'accept': 'image/*'}),
    )
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        # Set default image if the instance doesn't have an image
        if not self.instance.image:
            self.fields['image'].initial = 'item_images/default.jpg'

class AppointmentForm(forms.ModelForm):
    status_choices = (
        ("Pending", "Pending"),
        ("Confirmed", "Confirmed"),
        ("Cancelled", "Cancelled"),
        ("No Show", "No Show"),
        ('Completed', 'Completed'),
    )
    class Meta:
        model = Appointment
        fields = ('patient', 'dentist', 'treatment', 'appointment_date', 'start_time', 'notes','status',)
        widgets = {
            'patient': forms.Select(attrs={
            'class': 'form-select',
            'data-control': "select2"
            }),
            'dentist': forms.Select(attrs={
            'class': 'form-select',
            'data-control': "select2"
            }),
            'treatment': forms.SelectMultiple(attrs={
            'class': 'form-select',
            'data-control': "select2"
            }),
            'appointment_date': forms.DateInput(attrs={
            'class': 'form-control form-control-solid', 
            'type': 'date', 
            'min': date.today()
            }),
            'start_time': forms.TimeInput(attrs={
            'class': 'form-control form-control-solid', 
            'type': 'time'
            }),
            'notes': forms.TextInput(attrs={
            'class': 'form-control form-control-solid'
            }),
        }
    status = forms.ChoiceField(
        widget=forms.Select(attrs={'class': 'form-select'}),
        choices=status_choices,
    )

class TreatmentForm(forms.ModelForm):
    class Meta:
        model = Treatment
        fields = ('image', 'name', 'description', 'cost', 'duration')
        widgets = {
            'name': forms.TextInput(attrs={
            'class': 'form-control mb-2'
            }),
            'description': forms.TextInput(attrs={
            'class': 'form-control mb-2'
            }),
            'cost': forms.NumberInput(attrs={
            'class': 'form-control mb-2'
            }),
            'duration': forms.NumberInput(attrs={
            'class': 'form-control mb-2'
            }),
            'image': forms.ClearableFileInput(attrs={
            'class': 'form-control mb-2', 
            'accept': 'image/*'
            }),
        }

class PaymentForm(forms.ModelForm):
    class Meta:
        model = Payment
        fields = ('invoice', 'payment', 'payment_date', 'remarks',)
        widgets = {
            'invoice': forms.Select(attrs={
            'class': 'form-select',
            'data-control': "select2"
            }),
            'payment': forms.NumberInput(attrs={
            'class': 'form-control form-control-solid'
            }),
            'payment_date': forms.DateInput(attrs={
            'class': 'form-control form-control-solid', 'type': 'date'
            }),
            'remarks': forms.TextInput(attrs={
            'class': 'form-control form-control-solid'
            }),
        }
        
class MedicalHistoryForm(forms.ModelForm):
    class Meta:
        model = MedicalHistory
        fields = ('patient', 'medical_condition', 'medications', 'allergies', 'notes',)
        widgets = {
            'patient': forms.Select(attrs={
            'class': 'form-select',
            'data-control': "select2"
            }),
            'medical_condition': forms.TextInput(attrs={
            'class': 'form-control'
            }),
            'medications': forms.TextInput(attrs={
            'class': 'form-control'
            }),
            'allergies': forms.TextInput(attrs={
            'class': 'form-control'
            }),
            'notes': forms.Textarea(attrs={
            'class': 'form-control'
            }),
        }

class InvoiceForm(forms.ModelForm):
    class Meta:
        model = Invoice
        fields = ('invoice_number', 'patient', 'remarks',)
        widgets = {
            'invoice_number': forms.TextInput(attrs={
            'class': 'form-control mb-2'
            }),
            'patient': forms.Select(attrs={
            'class': 'form-select',
            'data-control': "select2"
            }),
            'remarks': forms.TextInput(attrs={
            'class': 'form-control mb-2'
            }),
        }

class Invoice_itemsForm(forms.ModelForm):
    class Meta:
        model = Invoice_items
        fields = ('treatment', 'qty', 'price')
        widgets = {
            'treatment': forms.Select(attrs={
            'class': 'form-control form-control-solid'
            }),
            'qty': forms.NumberInput(attrs={
            'class': 'form-control form-control-solid',
            'data-kt-element': 'quantity'
            }),
            'price': forms.NumberInput(attrs={
            'class': 'form-control form-control-solid',
            'data-kt-element': 'price'
            }),
        }

class ChangePasswordForm(PasswordChangeForm):
    old_password = forms.CharField(
        widget=forms.PasswordInput(attrs={
            'class': 'form-control',
            'placeholder': 'Enter your current password'
        })
    )
    new_password1 = forms.CharField(
        widget=forms.PasswordInput(attrs={
            'class': 'form-control',
            'placeholder': 'Enter your new password'
        })
    )
    new_password2 = forms.CharField(
        widget=forms.PasswordInput(attrs={
            'class': 'form-control',
            'placeholder': 'Confirm your new password'
        })
    )

    def __init__(self, *args, **kwargs):
        super(ChangePasswordForm, self).__init__(*args, **kwargs)
        for field in self.fields:
            self.fields[field].label = field.replace('_', ' ').capitalize()
