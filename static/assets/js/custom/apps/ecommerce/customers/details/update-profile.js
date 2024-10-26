"use strict";

var KTEcommerceUpdateProfile = function() {
    var e, validation, i;

    return {
        init: function() {
            i = document.querySelector("#kt_ecommerce_customer_profile");
            e = i.querySelector("#kt_ecommerce_customer_profile_submit");

            validation = FormValidation.formValidation(i, {
                fields: {
                    first_name: {
                        validators: {
                            notEmpty: {
                                message: "First Name is required"
                            }
                        }
                    },
                    last_name: {
                        validators: {
                            notEmpty: {
                                message: "Last Name is required"
                            }
                        }
                    },
                    email: {
                        validators: {
                            notEmpty: {
                                message: "Email is required"
                            }
                        }
                    },
                    date_of_birth: {
                        validators: {
                            notEmpty: {
                                message: "Birhtdate is required"
                            }
                        }
                    },
                    contact_number: {
                        validators: {
                            notEmpty: {
                                message: "Contact No. is required"
                            }
                        }
                    },
                    address: {
                        validators: {
                            notEmpty: {
                                message: "Address is required"
                            }
                        }
                    }
                },
                plugins: {
                    trigger: new FormValidation.plugins.Trigger(),
                    bootstrap: new FormValidation.plugins.Bootstrap5({
                        rowSelector: ".fv-row",
                        eleInvalidClass: "",
                        eleValidClass: ""
                    })
                }
            });

            e.addEventListener("click", function(event) {
                event.preventDefault(); // Prevent default form submission

                validation.validate().then(function(status) {
                    console.log("validated!");

                    if (status == "Valid") {
                        e.setAttribute("data-kt-indicator", "on");
                        e.disabled = true;

                        setTimeout(function() {
                            e.removeAttribute("data-kt-indicator");

                            Swal.fire({
                                text: "Your profile has been saved!",
                                icon: "success",
                                buttonsStyling: !1,
                                confirmButtonText: "Ok, got it!",
                                customClass: {
                                    confirmButton: "btn btn-primary"
                                }
                            }).then(function(result) {
                                if (result.isConfirmed) {
                                    e.disabled = false;
                                    i.submit(); // Submit the form
                                }
                            });
                        }, 1000);

                    } else {
                        Swal.fire({
                            text: "Sorry, looks like there are some required field empty, please try again.",
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

KTUtil.onDOMContentLoaded(function() {
    KTEcommerceUpdateProfile.init();
});
