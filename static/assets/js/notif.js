$(document).ready(function() {
    const socket = new WebSocket('ws://ec2-52-91-47-250.compute-1.amazonaws.com/ws/notifications/');
    // const socket = new WebSocket('ws://127.0.0.1:8000/ws/notifications/');

    socket.onopen = function(event) {
        console.log("WebSocket connection established.");
    };

    let notifications = [];

    // socket.onmessage = function(event) {
    //     const data = JSON.parse(event.data);
    //     console.log("Received notification:", data.message);

    //     const timestamp = new Date(data.timestamp);
    //     const now = new Date();
    //     const diffInSeconds = Math.floor((now - timestamp) / 1000);
    //     let timeAgo = '';

    //     // Calculate time difference in a user-friendly format
    //     if (diffInSeconds < 60) {
    //         timeAgo = `${diffInSeconds} seconds ago`;
    //     } else if (diffInSeconds < 3600) {
    //         const minutes = Math.floor(diffInSeconds / 60);
    //         timeAgo = `${minutes} minutes ago`;
    //     } else {
    //         const hours = Math.floor(diffInSeconds / 3600);
    //         timeAgo = `${hours} hours ago`;
    //     }

    //     $('#notif').append(
    //         `<div  class="d-flex flex-stack py-4">
    //             <div class="d-flex align-items-center">
    //                 <!--begin::Symbol-->
    //                 <div class="symbol symbol-35px me-4">
    //                     <span class="symbol-label bg-light-primary">
    //                         <img src="${data.patient_image_url}" alt="Patient Image" class="rounded-circle" width="35" height="35">
    //                     </span>
    //                 </div>
    //                 <!--end::Symbol-->
    //                 <!--begin::Title-->
    //                 <div class="mb-0 me-2">
    //                     <a href="#" class="fs-6 text-gray-800 text-hover-primary fw-bold">${data.message}</a>
    //                     <div class="text-gray-500 fs-7">Sent a request for an appointment.</div>
    //                 </div>
    //                 <!--end::Title-->
    //             </div>
    //             <!--end::Section-->
    //             <!--begin::Label-->
    //             <span class="badge badge-light fs-8">${timeAgo}</span>
    //         </div>`
    //     );
    //     let count = parseInt($('#notificationCount').text(), 10) || 0;
    //     count += 1;
    //     $('#notificationCount').text(count).show();
    // };

    socket.onmessage = function(event) {
        const data = JSON.parse(event.data);
        console.log("Received notification:", data.message);

        // Parse the timestamp
        const timestamp = new Date(data.timestamp);
        
        // Add the new notification to the array
        notifications.push({
            id: `notif-${Date.now()}`,  // Create a unique ID for each notification
            message: data.message,
            appointment_id: data.appointment_id,
            patientImageUrl: data.patient_image_url,
            timestamp: timestamp
        });
        // Render the new notification
        renderNotification(notifications[notifications.length - 1]);
    };

    function renderNotification(notification) {
        const timeAgo = calculateTimeAgo(notification.timestamp);
        
        $('#notif').prepend(
            `<div id="${notification.id}" class="d-flex flex-stack py-4">
                <div class="d-flex align-items-center">
                    <!--begin::Symbol-->
                    <div class="symbol symbol-35px me-4">
                        <span class="symbol-label bg-light-primary">
                            <img src="${notification.patientImageUrl}" alt="Patient Image" class="rounded-circle" width="35" height="35">
                        </span>
                    </div>
                    <!--end::Symbol-->
                    <!--begin::Title-->
                    <div class="mb-0 me-2">
                        <div class="fs-6 text-gray-800 text-hover-primary fw-bold">
                            ${notification.message}
                        </div>
                        <div class="text-gray-500 fs-7">
                            Sent a request for an appointment.
                            <a href="#"
                                class="view-appointment"
                                data-id="${notification.appointment_id}"
                                data-url="/get-appointment-form/" 
                                data-bs-toggle="modal"
                                data-bs-target="#view_modal"
                                id="btn-viewModal">View
                            </a>
                        </div>
                    </div>
                    <!--end::Title-->
                </div>
                <!--end::Section-->
                <!--begin::Label-->
                <span class="badge badge-light fs-8">${timeAgo}</span>
            </div>`
        );

        // Update the notification count
        let count = parseInt($('#notificationCount').text(), 10) || 0;
        count += 1;
        $('#notificationCount').text(count).show();

        const viewLinks = document.querySelectorAll('.view-appointment');
    
        // viewLinks.forEach(link => {
        //     link.addEventListener('click', function(event) {
        //         event.preventDefault();
        //         const id = this.getAttribute('data-id');
        //         document.getElementById('notif_id').value = id;
        //         const APIurl = this.getAttribute('data-url');
        //         // Make an AJAX request to fetch the form
        //         $.ajax({
        //             url: APIurl,  // The URL for the form view
        //             data: {
        //                 'id': id  // Pass the payment ID to the server
        //             },
        //             type: 'GET',
        //             dataType: 'json',
        //             success: function(response) {
        //                 // Update the modal body with the form HTML
        //                 $('#modal-notif-form-body').html(response.form);
        //                 $('#modal-notif-form-body select').each(function() {
        //                     $(this).select2({
        //                         dropdownParent: $('#view_modal')
        //                     });  // Reinitialize Select2 for each select element
        //                 });
        //             },
        //             error: function(xhr, status, error) {
        //                 console.error('Error fetching the form:', error);
        //             }
        //         });
        //     });
        // });
        viewLinks.forEach(link => {
            link.addEventListener('click', function(event) {
                event.preventDefault();
                const id = this.getAttribute('data-id');
                document.getElementById('notif_id').value = id;
                const APIurl = this.getAttribute('data-url');
                fetchAppointmentDetails(id, APIurl);
            });
        });
    }

    function fetchAppointmentDetails(appointmentId, APIurl) {
        fetch(APIurl + '?id=' + appointmentId, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // Include CSRF token if needed
                // 'X-CSRFToken': getCookie('csrftoken')
            },
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            updateModalContent(data.appointment_data);
        })
        .catch(error => {
            console.error('Error fetching appointment details:', error);
        }); 
    }
    
    function updateModalContent(appointmentDetails) {
        const modalBody = document.querySelector('#modal-notif-form-body');
        modalBody.innerHTML = `
            <div class="appointment-card">
                <input type="hidden" name="id" id="id" value=${appointmentDetails.id}>
                <img src="${appointmentDetails.patient_image_url}" alt="Patient" class="patient-image">
                <div class="appointment-info">
                    <h3 class="patient-name">${appointmentDetails.patient_name}</h3>
                    <p class="appointment-date">
                        <i class="far fa-calendar"></i> ${appointmentDetails.date}
                    </p>
                    <p class="appointment-time">
                        <i class="far fa-clock"></i> ${formatTime(appointmentDetails.start_time)} - ${formatTime(appointmentDetails.end_time)}
                    </p>
                    <p class="appointment-treatments">
                        <i class="fas fa-tooth"></i> ${appointmentDetails.treatments.join(', ') || 'No treatments specified'}
                    </p>
                    <p class="appointment-notes">
                        <i class="far fa-comment-alt"></i> ${appointmentDetails.notes || 'No additional notes'}
                    </p>
                </div>
            </div>
        `;
        const submitButton = document.getElementById('btn-notif-submit');
        const cancelButton = document.getElementById('btn-notif-cancel-appointment');

        // Update the button's data attributes with appointment details
        submitButton.dataset.appointmentId = appointmentDetails.id;
        submitButton.dataset.reason = "";
        submitButton.dataset.status = 'Confirmed';

        cancelButton.dataset.appointmentId = appointmentDetails.id;
        cancelButton.dataset.reason = "";
        cancelButton.dataset.status = 'Cancelled';

        // ... rest of the function (buttons setup, etc.)
    }

    function formatTime(timeString) {
        // Parse the time string (assuming it's in HH:mm format)
        const [hours, minutes] = timeString.split(':').map(Number);
        
        // Determine AM or PM suffix
        const period = hours >= 12 ? 'PM' : 'AM';
        
        // Convert to 12-hour format
        const formattedHours = hours % 12 || 12; // Use 12 instead of 0 for 12 AM
        return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    }

    function calculateTimeAgo(timestamp) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - timestamp) / 1000);
        let timeAgo = '';

        // Calculate time difference in a user-friendly format
        if (diffInSeconds < 60) {
            timeAgo = `${diffInSeconds} seconds ago`;
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            timeAgo = `${minutes} minutes ago`;
        } else {
            const hours = Math.floor(diffInSeconds / 3600);
            timeAgo = `${hours} hours ago`;
        }

        return timeAgo;
    }

    // Function to update all time ago values every minute
    function updateTimes() {
        notifications.forEach(notification => {
            const timeAgo = calculateTimeAgo(notification.timestamp);
            $(`#${notification.id} .badge`).text(timeAgo);
        });
    }

    // Update times every minute
    setInterval(updateTimes, 60000);

    socket.onerror = function(error) {
        console.error("WebSocket error:", error);
    };

    socket.onclose = function(event) {
        console.log("WebSocket connection closed:", event);
    };

    function fetch_Unread_Notif() {
        $.ajax({
            url:  "/unread_notif/",
            type: "GET",
            success: function(data) {
                data.forEach((notif) => {
                    const timestamp = new Date(notif.timestamp);
                    // Add the new notification to the array
                    notifications.push({
                        id: `notif-${Date.now()}`,
                        appointment_id: notif.appointment_id,
                        message: notif.patient,
                        patientImageUrl: notif.patient_image_url,
                        appointment_date: notif.appointment_date,
                        start_time: notif.start_time,
                        end_time: notif.end_time,
                        timestamp: timestamp,
                    });
    
                    // Render the new notification
                    renderNotification(notifications[notifications.length - 1]);
                });
            },
            error: function(xhr){
                console.log("Error:", xhr);
            }
        });

        
    }
    
    fetch_Unread_Notif();
});
