$(document).ready(function() {
    let socket = null;
    let notifications = [];
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;

    function connectWebSocket() {
        // Close existing socket if any
        if (socket) {
            socket.close();
        }

        socket = new WebSocket('ws://ec2-52-91-47-250.compute-1.amazonaws.com/ws/notifications/');

        socket.onopen = function(event) {
            console.log("WebSocket connected successfully at:", new Date().toLocaleString());
            reconnectAttempts = 0; // Reset reconnection attempts on successful connection
        };

        socket.onmessage = function(event) {
            console.log("Raw message received:", event.data);
            try {
                const data = JSON.parse(event.data);
                console.log("Parsed notification:", data);

                // Parse the timestamp
                const timestamp = new Date(data.timestamp);
                
                // Add the new notification to the array
                notifications.push({
                    id: `notif-${Date.now()}`,
                    message: data.message,
                    appointment_id: data.appointment_id,
                    patientImageUrl: data.patient_image_url,
                    timestamp: timestamp
                });
                
                // Render the new notification
                renderNotification(notifications[notifications.length - 1]);
            } catch (error) {
                console.error("Error processing message:", error);
            }
        };

        socket.onerror = function(error) {
            console.error("WebSocket error:", error);
        };

        socket.onclose = function(event) {
            console.log("WebSocket closed. Code:", event.code, "Reason:", event.reason);
            
            // Attempt to reconnect if not maximum attempts reached
            if (reconnectAttempts < maxReconnectAttempts) {
                reconnectAttempts++;
                console.log(`Attempting to reconnect (${reconnectAttempts}/${maxReconnectAttempts})...`);
                setTimeout(connectWebSocket, 5000); // Try to reconnect after 5 seconds
            } else {
                console.error("Maximum reconnection attempts reached");
            }
        };
    }

    // Initial connection
    connectWebSocket();

    // Rest of your existing functions...
    
    // Modified renderNotification function with error handling
    function renderNotification(notification) {
        try {
            const timeAgo = calculateTimeAgo(notification.timestamp);
            
            const notificationHtml = `
                <div id="${notification.id}" class="d-flex flex-stack py-4">
                    <div class="d-flex align-items-center">
                        <div class="symbol symbol-35px me-4">
                            <span class="symbol-label bg-light-primary">
                                <img src="${notification.patientImageUrl}" alt="Patient Image" class="rounded-circle" width="35" height="35" onerror="this.src='/static/assets/media/avatars/blank.png'">
                            </span>
                        </div>
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
                    </div>
                    <span class="badge badge-light fs-8">${timeAgo}</span>
                </div>`;

            $('#notif').prepend(notificationHtml);

            // Update notification count
            let count = parseInt($('#notificationCount').text(), 10) || 0;
            count += 1;
            $('#notificationCount').text(count).show();

            // Add event listeners
            $(`#${notification.id} .view-appointment`).on('click', function(event) {
                event.preventDefault();
                const id = $(this).data('id');
                const APIurl = $(this).data('url');
                $('#notif_id').val(id);
                fetchAppointmentDetails(id, APIurl);
            });

        } catch (error) {
            console.error("Error rendering notification:", error);
        }
    }

    // Modified fetch_Unread_Notif with better error handling
    function fetch_Unread_Notif() {
        $.ajax({
            url: "/unread_notif/",
            type: "GET",
            dataType: 'json',
            success: function(data) {
                console.log("Fetched unread notifications:", data);
                data.forEach((notif) => {
                    try {
                        const timestamp = new Date(notif.timestamp);
                        notifications.push({
                            id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                            appointment_id: notif.appointment_id,
                            message: notif.patient,
                            patientImageUrl: notif.patient_image_url,
                            timestamp: timestamp,
                        });
                        renderNotification(notifications[notifications.length - 1]);
                    } catch (error) {
                        console.error("Error processing notification:", notif, error);
                    }
                });
            },
            error: function(xhr, status, error) {
                console.error("Error fetching unread notifications:", status, error);
                console.log("Response:", xhr.responseText);
            }
        });
    }

    // Periodically check WebSocket connection
    setInterval(function() {
        if (socket.readyState !== WebSocket.OPEN) {
            console.log("WebSocket not connected. Current state:", socket.readyState);
            if (reconnectAttempts < maxReconnectAttempts) {
                connectWebSocket();
            }
        }
    }, 30000); // Check every 30 seconds

    // Initial fetch
    fetch_Unread_Notif();
});
