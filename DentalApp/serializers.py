from rest_framework import serializers
from .models import Invoice_items, Dentist, Clinic_Info, Patient, Treatment, Invoice, MedicalHistory, Appointment
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core.signing import Signer
from django.core.mail import send_mail
from django.conf import settings

User = get_user_model()

class UserAccountSerializer(serializers.ModelSerializer):
    password1 = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            'username', 
            'password1', 
            'password2', 
            'is_patient', 
            'is_dentist', 
            'is_staff']

    def validate(self, data):
        if data['password1'] != data['password2']:
            raise serializers.ValidationError("Passwords do not match.")
        return data

    def create(self, validated_data):
        password = validated_data.pop('password1')
        validated_data.pop('password2')

        # Create the user with the remaining data
        user = User.objects.create(**validated_data)
        user.set_password(password)  # Set the user's password securely
        user.save()

        return user
    
class PatientSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    user_account = UserAccountSerializer()

    class Meta:
        model = Patient
        fields = [
            'id', 
            'first_name', 
            'last_name', 
            'gender', 
            'date_of_birth', 
            'contact_number', 
            'email', 
            'address', 
            'image', 
            'user_account']
        
    def get_image(self, obj):
        request = self.context.get('request')
        if obj.image:
            return request.build_absolute_uri(obj.image.url)
        return request.build_absolute_uri('/media/item_images/default.jpg')
    
    def create(self, validated_data):
        user_data = validated_data.pop('user_account')
        user = UserAccountSerializer.create(UserAccountSerializer(), validated_data=user_data)

        # Create the patient and link it to the user account
        patient = Patient.objects.create(user_account=user, **validated_data)

         # Generate email confirmation token
        signer = Signer()
        token = signer.sign(patient.email)

        # Send email with confirmation link
        confirmation_link = f"{settings.BACKEND_URL}/confirm-email/{token}/"
        send_mail(
            'Email Confirmation',
            f'Please confirm your email by clicking the link: {confirmation_link}',
            settings.DEFAULT_FROM_EMAIL,
            [patient.email],
            fail_silently=False,
        )

        return patient
    
    def update(self, instance, validated_data):
        print("Validated data:", validated_data)
        print("Files:", self.context['request'].FILES) 
        user_data = validated_data.pop('user_account', None)
        request = self.context.get('request')
        if user_data:
            UserAccountSerializer.update(UserAccountSerializer(), instance.user_account, validated_data=user_data)

        # Handle image update if it's provided
        image = request.FILES.get('image', None)
        if image:
            instance.image = image
            print("Image updated:")

        # Update other fields
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.gender = validated_data.get('gender', instance.gender)
        instance.date_of_birth = validated_data.get('date_of_birth', instance.date_of_birth)
        instance.contact_number = validated_data.get('contact_number', instance.contact_number)
        instance.email = validated_data.get('email', instance.email)
        instance.address = validated_data.get('address', instance.address)

        print("Saving instance")
        instance.save()
        return instance
    
class TreatmentSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    class Meta:
        model = Treatment
        fields = [
            'id',
            'name', 
            'description', 
            'cost', 
            'image']
        
    def get_image(self, obj):
        request = self.context.get('request')
        if obj.image:
            return request.build_absolute_uri(obj.image.url)
        return request.build_absolute_uri('/media/item_images/default.jpg')
    
class InvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invoice
        fields = [
            'id',
            'invoice_number', 
            'patient', 
            'remarks', 
            'invoice_date',
            'total_sum',
            'paid']
        
class Invoice_ItemSerializer(serializers.ModelSerializer):
    treatment = serializers.SerializerMethodField()
    class Meta:
        model = Invoice_items
        fields = [
            'invoice', 
            'treatment', 
            'qty', 
            'price']
        
    def get_treatment(self, obj):
        if obj.treatment:
            return obj.treatment.name  # Assuming Dentist model has a 'name' field
        return None
        
class MedicalHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalHistory
        fields = [
            'id',
            'medical_condition', 
            'medications', 
            'allergies',
            'notes']
        
class AppointmentSerializer(serializers.ModelSerializer):
    dentist_name = serializers.SerializerMethodField()
    class Meta:
        model = Appointment
        fields = [
            'id',
            'dentist',
            'dentist_name',
            'treatment',
            'appointment_date', 
            'start_time', 
            'end_time',
            'notes',
            'status']
        
    def get_dentist_name(self, obj):
        if obj.dentist:
            return obj.dentist.name  # Assuming Dentist model has a 'name' field
        return None
        
class ClinicInfoSerializer(serializers.ModelSerializer):
    logo = serializers.SerializerMethodField()
    class Meta:
        model = Clinic_Info
        fields = [
            'clinic_name', 
            'clinic_address', 
            'contact_no',
            'email',
            'facebook',
            'open_hours',
            'logo']
        
    def get_logo(self, obj):
        request = self.context.get('request')
        if obj.logo:
            return request.build_absolute_uri(obj.logo.url)
        return request.build_absolute_uri('/media/item_images/default.jpg')
    
class DentistSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    class Meta:
        model = Dentist
        fields = [
            'id',
            'name', 
            'gender', 
            'address',
            'contact_no',
            'email',
            'degree',
            'specialty',
            'image']
    
    def get_image(self, obj):
        request = self.context.get('request')
        if obj.image:
            return request.build_absolute_uri(obj.image.url)
        return request.build_absolute_uri('/media/item_images/default.jpg')