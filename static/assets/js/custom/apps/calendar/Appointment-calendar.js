"use strict";
var KTAppCalendar = function() {
    var e, form;

    return {
        init: function() {
            // Select the calendar element
            var F = document.getElementById("kt_calendar_app");
            form = document.querySelector("#kt_modal_add_appointment_form");
            // Initialize the FullCalendar
            e = new FullCalendar.Calendar(F, {
                headerToolbar: {
                    left: "prev,next today",
                    center: "title",
                    right: "dayGridMonth,timeGridWeek,timeGridDay,listMonth"
                },
                initialDate: moment().startOf("day").format("YYYY-MM-DD"),
                navLinks: true, // can click day/week names to navigate views
                selectable: true,
                selectMirror: true,
                editable: true,
                dayMaxEvents: true, // allow "more" link when too many events
                events: function(info, successCallback, failureCallback) {
                    $.ajax({
                        url: '/api/appointment/',
                        method: 'GET',
                        success: function(data) {
                            successCallback(data);
                        },
                        error: function() {
                            failureCallback();
                        }
                    });
                },
                select: function(info) {

                    // Open the modal
                    $('#add_modal').modal('show');
                    getForm(info);
                    // console.log(moment(info.start).format('MM/DD/YYYY'));
                    // Pre-fill the date and time fields in the modal
                    
                },
                eventClick: function(info) {
                    // Update the modal content with event data
                    var eventId = info.event.id;
                    var patientId = info.event.extendedProps.patientid;
                    var treatments = info.event.extendedProps.treatments || [];
                    var treatmentsList = treatments.length > 0 ? treatments.join(', ') : 'No treatments';

                    $('#kt_modal_view_event').data('event-id', eventId);
                    $('#kt_modal_view_event').data('patient-id', patientId);
                    $('#kt_modal_view_event').find('[data-kt-calendar="event_name"]').text(info.event.title);
                    $('#kt_modal_view_event').find('[data-kt-calendar="event_description"]').text(treatmentsList);
                    $('#kt_modal_view_event').find('[data-kt-calendar="event_date"]').text(moment(info.event.start).format('YYYY-MM-DD'));
                    $('#kt_modal_view_event').find('[data-kt-calendar="start_time"]').text(moment(info.event.start).format('hh:mm A'));
                    $('#kt_modal_view_event').find('[data-kt-calendar="end_time"]').text(moment(info.event.end).format('hh:mm A'));
                    // Show the modal
                    $('#kt_modal_view_event').modal('show');
                }
            });

            // Render the calendar
            e.render();

            // Handle the form submission
            $('#kt_modal_add_event_submit').on('click', function(event) {
                event.preventDefault();
                
                // Add the new event to the calendar
                Swal.fire({
                    text: "New event added to calendar!",
                    icon: "success",
                    buttonsStyling: !1,
                    confirmButtonText: "Ok, got it!",
                    customClass: {
                        confirmButton: "btn btn-primary"
                    }
                }).then(function(o) {
                    if (o.isConfirmed) {
                        form.submit();
                        var eventId = $('#kt_modal_view_event').data('event-id');  // Get the event ID if we are updating an appointment

                        if (eventId) {
                            // Update the existing event in FullCalendar
                            var event = e.getEventById(eventId);
                            event.setProp('title', response.patient_name);
                            event.setExtendedProp('description', notes);
                            event.setStart(appointmentDate + 'T' + startTime);
                            event.setEnd(appointmentDate + 'T' + endTime);
                        } else {
                            // Add a new event to FullCalendar
                            e.addEvent({
                                id: response.id,
                                patientid: patientId,
                                title: response.patient_name,  // Assuming the backend returns the patient's name
                                description: notes,
                                start: appointmentDate + 'T' + startTime,
                            });
                        }
                        $('#kt_modal_add_event').modal('hide');
                        $('#kt_modal_add_appointment_form')[0].reset();
                    }
                });
            });

            $('#kt_modal_view_event_add').on('click', function() {
                $('#kt_modal_add_event').find('[data-kt-calendar="title"]').text('Add Appointment');
                $('#kt_modal_add_appointment_form')[0].reset();
            });

            $('#btn-showModal').on('click', function() {
                getForm("")
            });

            function getForm(info) {
                const id = "";
                document.getElementById('id').value = id;
                // Make an AJAX request to fetch the form
                $.ajax({
                    url: "/get-appointment-form/",
                    data: {
                        'id': id
                    },
                    type: 'GET',
                    dataType: 'json',
                    success: function(response) {
                        // Update the modal body with the form HTML
                        $('#modal-form-body').html(response.form);
                        $('#modal-form-body select').each(function() {
                            $(this).select2({
                                dropdownParent: $('#add_modal')
                            });  // Reinitialize Select2 for each select element
                        });

                        $('#id_appointment_date').val(moment(info.start).format('YYYY-MM-DD'));
                        $('#id_start_time').val(moment(info.start).format('HH:mm:ss'));
                        // $('#id_end_time').val(moment(info.end).format('HH:mm:ss'));
                    },
                    error: function(xhr, status, error) {
                        console.error('Error fetching the form:', error);
                    }
                });
            }

            const editButtons = document.querySelectorAll('.edit-btn');
            editButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const id = $('#kt_modal_view_event').data('event-id');
                    document.getElementById('id').value = id;
                    const APIurl = this.getAttribute('data-url');
                    // Make an AJAX request to fetch the form
                    $.ajax({
                        url: APIurl,  // The URL for the form view
                        data: {
                            'id': id  // Pass the payment ID to the server
                        },
                        type: 'GET',
                        dataType: 'json',
                        success: function(response) {
                            // Update the modal body with the form HTML
                            $('#modal-form-body').html(response.form);
                            $('#modal-form-body select').each(function() {
                                $(this).select2({
                                    dropdownParent: $('#add_modal')
                                });  // Reinitialize Select2 for each select element
                            });
                        },
                        error: function(xhr, status, error) {
                            console.error('Error fetching the form:', error);
                        }
                    });
                });
            });

            $('#kt_modal_view_event_delete').on('click', function(t) {
                t.preventDefault();
            
                Swal.fire({
                    text: "Are you sure you would like to delete this appointment?",
                    icon: "warning",
                    showCancelButton: true,
                    buttonsStyling: false,
                    confirmButtonText: "Yes, delete it!",
                    cancelButtonText: "No, return",
                    customClass: {
                        confirmButton: "btn btn-primary",
                        cancelButton: "btn btn-active-light"
                    }
                }).then(function(result) {
                    if (result.value) {
                        var eventId = $('#kt_modal_view_event').data('event-id');
                        $.ajax({
                            url: '/api/appointment/delete/' + eventId + '/',  // Ensure this URL matches your Django URL pattern
                            method: 'POST',
                            success: function() {
                                // Assuming `calendar` is your FullCalendar instance
                                e.getEventById(eventId).remove();
                                $('#kt_modal_view_event').modal('hide');
                                Swal.fire({
                                    text: "Your event has been deleted!",
                                    icon: "success",
                                    buttonsStyling: false,
                                    confirmButtonText: "Ok, got it!",
                                    customClass: {
                                        confirmButton: "btn btn-primary"
                                    }
                                });
                            },
                            error: function() {
                                Swal.fire({
                                    text: "There was an error deleting the event. Please try again.",
                                    icon: "error",
                                    buttonsStyling: false,
                                    confirmButtonText: "Ok, got it!",
                                    customClass: {
                                        confirmButton: "btn btn-primary"
                                    }
                                });
                            }
                        });
                    } else if (result.dismiss === Swal.DismissReason.cancel) {
                        Swal.fire({
                            text: "Your event was not deleted!",
                            icon: "info",
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
    }
}();

// Initialize the calendar when the DOM is fully loaded
KTUtil.onDOMContentLoaded((function() {
    KTAppCalendar.init()
}));
