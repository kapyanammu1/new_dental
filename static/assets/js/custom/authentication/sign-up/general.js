"use strict";
var SignupFormHandler = function() {
    var formElement, submitButton, validationInstance, passwordMeter, isPasswordValid = function() {
        return passwordMeter.getScore() > 50;
    };
    return {
        init: function() {
            formElement = document.querySelector("#kt_sign_up_form");
            submitButton = document.querySelector("#kt_sign_up_submit");
            passwordMeter = KTPasswordMeter.getInstance(formElement.querySelector('[data-kt-password-meter="true"]'));
            
            // submitButton.addEventListener("click", function(event) {
            //     event.preventDefault();
            //     $.ajax({
            //         url: '/Signup/',  // The URL for the form view
            //         type: 'POST',
            //         dataType: 'json',
            //         data: $(formElement).serialize(),
            //         success: function(response) {
            //             if (response.success) {

            //                 submitButton.setAttribute("data-kt-indicator", "on");
            //                 submitButton.disabled = true;
            //                 setTimeout(function() {
            //                     submitButton.removeAttribute("data-kt-indicator");
            //                     submitButton.disabled = false;
            //                     Swal.fire({
            //                         text: "You have successfully created an account!",
            //                         icon: "success",
            //                         buttonsStyling: false,
            //                         confirmButtonText: "Ok, got it!",
            //                         customClass: {
            //                             confirmButton: "btn btn-primary"
            //                         }
            //                     }).then(function(alertResult) {
            //                         if (alertResult.isConfirmed) {
            //                             formElement.reset();
            //                             passwordMeter.reset();
                                        
            //                         }
            //                     });
            //                 }, 1500);
            //             }
            //         },
            //         error: function(xhr, status, error) {
            //             Swal.fire({
            //                 text: "Sorry, it looks like there are some errors. Please try again." + error,
            //                 icon: "error",
            //                 buttonsStyling: false,
            //                 confirmButtonText: "Ok, got it!",
            //                 customClass: {
            //                     confirmButton: "btn btn-primary"
            //                 }
            //             });
            //         }
            //     });
            // });
        }
    };
}();

KTUtil.onDOMContentLoaded(function() {
    SignupFormHandler.init();
});
