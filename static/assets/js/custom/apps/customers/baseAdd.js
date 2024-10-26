"use strict";

var NotifModalForm = function() {
    var 
    approveBtn, 
    cancelButton, 
    closeButton, 
    formValidation, 
    modalInstance, 
    cancellationReasonContainer,
    cancellationReasonField,
    cancelAppointmentBtn,
    formElement;

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    function showLoading(button) {
        button.querySelector('.indicator-label').style.display = 'none';
        button.querySelector('.indicator-progress').style.display = 'inline-block';
        button.disabled = true;
    }
    
    function hideLoading(button) {
        button.querySelector('.indicator-label').style.display = 'inline-block';
        button.querySelector('.indicator-progress').style.display = 'none';
        button.disabled = false;
    }

    function setCancelButtonState(isConfirmState) {
        if (isConfirmState) {
            cancelAppointmentBtn.classList.remove('btn-danger');
            cancelAppointmentBtn.classList.add('btn-warning');
            cancelAppointmentBtn.querySelector('.indicator-label').innerHTML = '<i class="fas fa-exclamation-triangle me-2"></i>Confirm Cancellation';
        } else {
            cancelAppointmentBtn.classList.remove('btn-warning');
            cancelAppointmentBtn.classList.add('btn-danger');
            cancelAppointmentBtn.querySelector('.indicator-label').innerHTML = '<i class="fas fa-ban me-2"></i>Cancel Appointment';
        }
    }

    return {
        init: function(modalName, formName) {
            modalInstance = new bootstrap.Modal(document.querySelector(`#${modalName}`)); // Initialize modal
            formElement = document.querySelector(`#${formName}`); // Get form element
            approveBtn = formElement.querySelector("#btn-notif-submit"); // Submit button
            cancelButton = formElement.querySelector("#btn-notif-cancel"); // Cancel button
            closeButton = formElement.querySelector("#btn-close"); // Close button
            cancelAppointmentBtn = document.getElementById('btn-notif-cancel-appointment');
            cancellationReasonContainer = document.getElementById('cancellation-reason-container');
            cancellationReasonField = document.getElementById('cancellation-reason');

            // Submit button event listener
            approveBtn.addEventListener("click", function(event) {
                event.preventDefault();
                showLoading(this);
                const pk = approveBtn.dataset.appointmentId;
                const reason = cancellationReasonField.value || '';  // Get reason from the field
                const status = approveBtn.dataset.status;
                const url = `/update_appointment_status/`;  // Remove query parameters from URL

                // Create an object with the data
                const data = {
                    pk: pk,
                    reason: reason,
                    status: status
                };

                fetch(url, {  
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': getCookie('csrftoken'),
                        'X-Requested-With': 'XMLHttpRequest',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)  // Send data as JSON in the request body
                })
                .then(response => response.json())
                .then(data => {
                    hideLoading(this);
                    if (data.success) {
                        Swal.fire({
                            text: "Appointment has been successfully updated to " + status + "!",
                            icon: "success",
                            buttonsStyling: false,
                            confirmButtonText: "Ok, got it!",
                            customClass: {
                                confirmButton: "btn btn-primary"
                            }
                        }).then(function(result) {
                            if (result.isConfirmed) {
                                modalInstance.hide(); // Close the modal
                                approveBtn.disabled = false; // Re-enable submit button
                                // Redirect or update UI as needed
                                window.location.reload();
                            }
                        });
                    } else {
                        // Display errors in the modal
                        displayErrors(data.errors);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    Swal.fire({
                        text: "Sorry, looks like there are some errors, please try again.",
                        icon: "error",
                        buttonsStyling: false,
                        confirmButtonText: "Ok, got it!",
                        customClass: {
                            confirmButton: "btn btn-primary"
                        }
                    });
                });
            });

            // Cancel button event listener
            cancelButton.addEventListener("click", function(event) {
                event.preventDefault();
                showLoading(this);

                if (!cancellationReasonContainer.classList.contains('d-none')) {
                    resetModal();
                    hideLoading(this);
                } else {
                    Swal.fire({
                        text: "Are you sure you would like to cancel?",
                        icon: "warning",
                        showCancelButton: true,
                        buttonsStyling: false,
                        confirmButtonText: "Yes, cancel it!",
                        cancelButtonText: "No, return",
                        customClass: {
                            confirmButton: "btn btn-primary",
                            cancelButton: "btn btn-active-light"
                        }
                    }).then(function(result) {
                        hideLoading(cancelButton);
                        if (result.value) {
                            formElement.reset(); // Reset the form
                            modalInstance.hide(); // Hide the modal
                        } else if (result.dismiss === "cancel") {
                            Swal.fire({
                                text: "Your form has not been cancelled!",
                                icon: "error",
                                buttonsStyling: false,
                                confirmButtonText: "Ok, got it!",
                                customClass: {
                                    confirmButton: "btn btn-primary"
                                }
                            });
                        }
                    });
                }
            });

            // Close button event listener
            closeButton.addEventListener("click", function(event) {
                event.preventDefault();
                showLoading(this);

                Swal.fire({
                    text: "Are you sure you would like to cancel?",
                    icon: "warning",
                    showCancelButton: true,
                    buttonsStyling: false,
                    confirmButtonText: "Yes, cancel it!",
                    cancelButtonText: "No, return",
                    customClass: {
                        confirmButton: "btn btn-primary",
                        cancelButton: "btn btn-active-light"
                    }
                }).then(function(result) {
                    hideLoading(closeButton);
                    if (result.value) {
                        formElement.reset(); // Reset the form
                        modalInstance.hide(); // Hide the modal
                    } else if (result.dismiss === "cancel") {
                        Swal.fire({
                            text: "Your form has not been cancelled!",
                            icon: "error",
                            buttonsStyling: false,
                            confirmButtonText: "Ok, got it!",
                            customClass: {
                                confirmButton: "btn btn-primary"
                            }
                        });
                    }
                });
            });

            cancelAppointmentBtn.addEventListener('click', function() {
                const isConfirmState = this.classList.contains('btn-warning');
                showLoading(this);
                
                if (isConfirmState) {
                    const pk = this.dataset.appointmentId;
                    const reason = cancellationReasonField.value || '';
                    const status = this.dataset.status;
                    const url = `/update_appointment_status/`;

                    const data = {
                        pk: pk,
                        reason: reason,
                        status: status
                    };

                    fetch(url, {  
                        method: 'POST',
                        headers: {
                            'X-CSRFToken': getCookie('csrftoken'),
                            'X-Requested-With': 'XMLHttpRequest',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(data)
                    })
                    .then(response => response.json())
                    .then(data => {
                        hideLoading(this);
                        if (data.success) {
                            Swal.fire({
                                text: "Appointment has been successfully updated to " + status + "!",
                                icon: "success",
                                buttonsStyling: false,
                                confirmButtonText: "Ok, got it!",
                                customClass: {
                                    confirmButton: "btn btn-primary"
                                }
                            }).then(function(result) {
                                if (result.isConfirmed) {
                                    modalInstance.hide();
                                    approveBtn.disabled = false; 
                                    formElement.reset();
                                    window.location.reload();
                                }
                            });
                        } else {
                            displayErrors(data.errors);
                        }
                    })
                    .catch(error => {
                        hideLoading(this);
                        console.error('Error:', error);
                        Swal.fire({
                            text: "Sorry, looks like there are some errors, please try again.",
                            icon: "error",
                            buttonsStyling: false,
                            confirmButtonText: "Ok, got it!",
                            customClass: {
                                confirmButton: "btn btn-primary"
                            }
                        });
                    });
                } else {
                    cancellationReasonContainer.classList.remove('d-none');
                    approveBtn.classList.add('d-none');
                    setCancelButtonState(true);
                    hideLoading(this);
                }
            });

            function resetModal() {
                cancellationReasonContainer.classList.add('d-none');
                approveBtn.classList.remove('d-none');
                cancelAppointmentBtn.textContent = 'Cancel Appointment';
                cancelAppointmentBtn.classList.remove('btn-warning');
                cancelAppointmentBtn.classList.add('btn-danger');
                cancellationReasonField.value = '';
            }
        }
    };
}();

KTUtil.onDOMContentLoaded(function() {
    NotifModalForm.init("view_modal", "notif_form");
});
