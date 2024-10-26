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
                    $('#modal-form-body select').each(function() {
                        $(this).select2({
                            dropdownParent: $('#add_modal')
                        }); 
                    });
                },
                error: function(xhr, status, error) {
                    console.error('Error fetching the form:', error);
                }
            });
        });
    });
});
