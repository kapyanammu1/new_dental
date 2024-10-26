from django.contrib.auth import views as auth_views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.urls import path
from . import views
from .forms import LoginForm

urlpatterns = [
    path('', views.dashboard, name='index'),
    # path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/', views.CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('confirm-email/<str:token>/', views.confirm_email, name='confirm-email'),
    path('api/dentist/', views.DentistAPIView.as_view(), name='dentist-list'),
    path('api/patients/', views.PatientListAPIView.as_view(), name='patient-list'),
    path('api/signup/', views.SignupAPIView.as_view(), name='sign-up'),
    path('api/treatments/', views.TreatmentAPIView.as_view(), name='treatment-list'),
    path('api/invoices/', views.InvoiceAPIView.as_view(), name='invoices-list'),
    path('api/invoice_items/', views.Invoice_ItemAPIView.as_view(), name='invoice-items'),
    path('api/medical-history/', views.MedicalHistoryAPIView.as_view(), name='medical-history'),
    path('api/appointment_client/', views.AppointmentAPIView.as_view(), name='appointment_client'),
    path('unread_notif/', views.unread_notif, name='unread_notif'),
    path('api/clinic-info/', views.ClinicInfoAPIView.as_view(), name='clinic-info'),
    path('Signup/', views.signUp, name='Signup'),
    path('user_Signup/', views.user_Signup, name='user_Signup'),
    path('confirm_signup/', views.confirm_signup, name='confirm_signup'),
    # path('login/', auth_views.LoginView.as_view(
    #     template_name='sign-in.html', authentication_form=LoginForm), 
    #     name='login'),
    path('login/', views.signIn, name='login'),
    path('logout/', views.logout_view, name='logouts'),
    path('Dashboard/', views.dashboard, name='Dashboard'),
    path('chartData/', views.getchartData, name='chartData'),
    path('pending-appointments/', views.updatePendingAppointments, name='updatePendingAppointments'),
    path('User_list/', views.UserAccounts, name='User_list'),
    path('Dentist_list/', views.dentists, name='Dentist_list'),
    path('Staff_list/', views.staffs, name='Staff_list'),
    path('patients_list/', views.patients, name='patients_list'),
    path('Calendar/', views.calendar, name='Calendar'),
    path('update_appointment_status/', views.update_appointment_status, name='update_appointment_status'),
    path('Appointment_list/', views.appointments, name='Appointment_list'),
    path('Treatment_list/', views.treatments, name='Treatment_list'),
    path('Invoice_list/', views.invoices, name='Invoice_list'),
    path('Payment_list/', views.payments, name='Payment_list'),
    path('Clinic_Info/', views.ClinicInfo, name='Clinic_Info'),
    path('get-appointment-form/', views.getAppointmentForm, name='get_appointment_form'),
    path('get-payment-form/', views.getpayForm, name='get_payment_form'),
    path('get_user_choices/', views.get_user_choices, name='get_user_choices'),
    path('get-user-form/', views.getUserForm, name='get_user_form'),
    path('get-staff-form/', views.getStaffForm, name='get_staff_form'),
    path('get-dentist-form/', views.getDentistForm, name='get_dentist_form'),
    path('get-treatment-form/', views.getTreatmentForm, name='get_dentist_form'),
    path('Invoice/', views.create_invoice, name='Invoice'),
    path('Invoice/<int:invoice_id>/', views.create_invoice, name='Invoice'),
    path('View_Patient/<int:pk>/', views.Patient_info, name='View_Patient'),
    path('Delete_user/<int:pk>/', views.Delete_user, name='Delete_user'),
    path('Delete_patient/<int:pk>/', views.Delete_patient, name='Delete_patient'),
    path('Delete_treatment/<int:pk>/', views.Delete_treatment, name='Delete_treatment'),
    path('Delete_dentist/<int:pk>/', views.Delete_dentist, name='Delete_dentist'),
    path('Delete_staff/<int:pk>/', views.Delete_staff, name='Delete_staff'),
    path('Delete_medHis/<int:pk>/', views.Delete_medHis, name='Delete_medHis'),
    path('Delete_invoice/<int:pk>/', views.Delete_invoice, name='Delete_invoice'),
    path('Delete_payment/<int:pk>/', views.Delete_payment, name='Delete_payment'),
    path('printInvoice/<int:pk>/', views.printInvoice, name='printInvoice'),
    path('api/events/', views.events_list, name='events_list'),
    path('api/events/create/', views.create_event, name='create_event'),
    path('api/events/update/<int:event_id>/', views.update_event, name='update_event'),
    path('api/events/delete/<int:event_id>/', views.delete_event, name='delete_event'),
    path('api/appointment/', views.appointment_list, name='appointment_list'),
    path('api/appointment/create/', views.create_appointment, name='create_appointment'),
    path('api/appointment/delete/<int:appointment_id>/', views.delete_appointment, name='delete_appointment'),
    path('getPrice/<int:treatment_id>/', views.getPrice, name='getPrice'),
]