document.addEventListener("DOMContentLoaded", function() {
    
    const editButtons = document.querySelectorAll('.edit-btn');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            document.getElementById('id').value = id;
            const APIurl = this.getAttribute('data-url');
            // Make an AJAX request to fetch the form
            $.ajax({
                url: APIurl,  // The URL for the form view
                data: {
                    'id': id  
                },
                type: 'GET',
                dataType: 'json',
                success: function(response) {
                    // Update the modal body with the form HTML
                    $('#modal-form-body').html(response.form);
                    $('#modal-form-body').append(
                        `<label for="id_user_selection">Select User:</label>
                        <select id="id_user_selection" name="user_selection" class="form-select" style="width: 100%;">
                            
                        </select>`
                    );
                    $('#id_user_selection').select2({
                        placeholder: "Select an option",
                        allowClear: true // Allows users to clear the selection if needed
                    });

                    try {
                        const userTypeSelect = document.getElementById('id_user_type');
                        const userSelectionSelect = document.getElementById('id_user_selection');
                        const userType = userTypeSelect.value;
                            fetch(`/get_user_choices/?user_type=${userType}`)
                                .then(response => response.json())
                                .then(data => {
                                    userSelectionSelect.innerHTML = '<option value="">Select User</option>';
                                    data.forEach(([value, text]) => {
                                        const option = new Option(text, value);
                                        userSelectionSelect.add(option);
                                    });
                                })
                                .catch(error => console.error('Error fetching user choices:', error));
                                    
                        if (userTypeSelect && userSelectionSelect) {
                            userTypeSelect.addEventListener('change', function() {
                                const userType = this.value;
                                fetch(`/get_user_choices/?user_type=${userType}`)
                                    .then(response => response.json())
                                    .then(data => {
                                        userSelectionSelect.innerHTML = '<option value="">Select User</option>';
                                        data.forEach(([value, text]) => {
                                            const option = new Option(text, value);
                                            userSelectionSelect.add(option);
                                        });
                                    })
                                    .catch(error => console.error('Error fetching user choices:', error));
                            });
                        }
                    } catch (error) {
                        console.error('Error setting up user type selection:', error);
                    }
                },
                error: function(xhr, status, error) {
                    console.error('Error fetching the form:', error);
                }
            });
        });
    });
});
