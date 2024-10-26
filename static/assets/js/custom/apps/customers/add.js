"use strict";

var CustomerModalForm = function() {
    var 
    submitButton, 
    cancelButton, 
    closeButton, 
    modalInstance, 
    formElement;

    // Function to show loading indicator
    function showLoading(button) {
        button.setAttribute('data-kt-indicator', 'on');
        button.disabled = true;
    }

    // Function to hide loading indicator
    function hideLoading(button) {
        button.removeAttribute('data-kt-indicator');
        button.disabled = false;
    }

    // Function to display errors in the modal
    function displayErrors(errors) {
        // Clear previous errors
        formElement.querySelectorAll('.error-message').forEach(el => el.remove());

        // Display new errors
        for (const [field, messages] of Object.entries(errors)) {
            const inputField = formElement.querySelector(`[name="${field}"]`);
            if (inputField) {
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error-message text-danger mt-2';
                errorDiv.textContent = messages.join(', ');
                inputField.parentNode.appendChild(errorDiv);
            }
        }
    }

    return {
        init: function(modalName, formName) {
            modalInstance = new bootstrap.Modal(document.querySelector(`#${modalName}`)); // Initialize modal
            formElement = document.querySelector(`#${formName}`); // Get form element
            submitButton = formElement.querySelector("#btn-submit"); // Submit button
            cancelButton = formElement.querySelector("#btn-cancel"); // Cancel button
            closeButton = formElement.querySelector("#btn-close"); // Close button

            // Submit button event listener
            submitButton.addEventListener("click", function(event) {
                event.preventDefault();
                showLoading(submitButton);

                // Get form data
                const formData = new FormData(formElement);
                const url = submitButton.getAttribute('data-url');
                
                // Send form data to server
                fetch(url, {  // Replace with your actual URL
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-CSRFToken': getCookie('csrftoken'), 
                        'X-Requested-With': 'XMLHttpRequest'  
                    }
                })
                .then(response => response.json())
                .then(data => {
                    hideLoading(submitButton);
                    if (data.success) {
                        Swal.fire({
                            text: "Form has been successfully submitted!",
                            icon: "success",
                            buttonsStyling: false,
                            confirmButtonText: "Ok, got it!",
                            customClass: {
                                confirmButton: "btn btn-primary"
                            }
                        }).then(function(result) {
                            if (result.isConfirmed) {
                                modalInstance.hide(); // Close the modal
                                submitButton.disabled = false; // Re-enable submit button
                                // Redirect or update UI as needed
                                window.location.href = data.redirect;
                            }
                        });
                    } else {
                        // Display errors in the modal
                        displayErrors(data.errors);
                    }
                })
                .catch(error => {
                    hideLoading(submitButton);
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
                showLoading(cancelButton);

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
            });

            // Close button event listener
            closeButton.addEventListener("click", function(event) {
                event.preventDefault();
                showLoading(closeButton);

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
        }
    };
}();

// Ensure you have this function to get the CSRF token
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

// KTUtil.onDOMContentLoaded(function() {
//     CustomerModalForm.init();
// });
