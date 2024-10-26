"use strict";

var DeleteManager = function() {
    var dataTable, TableElement, deleteUrl;

    var setupDeleteHandler = () => {
        TableElement.querySelectorAll('[data-kt-customer-table-filter="delete_row"]').forEach((deleteButton) => {
            deleteButton.addEventListener("click", function(event) {
                event.preventDefault();
                const tableRow = event.target.closest("tr"),
                    firstColumnCell = tableRow.querySelectorAll("td")[0].innerText,
                    customerId = tableRow.getAttribute('data-pk');
                    deleteUrl = deleteButton.getAttribute('data-url');
                Swal.fire({
                    text: "Are you sure you want to delete " + firstColumnCell + "?",
                    icon: "warning",
                    showCancelButton: true,
                    buttonsStyling: false,
                    confirmButtonText: "Yes, delete!",
                    cancelButtonText: "No, cancel",
                    customClass: {
                        confirmButton: "btn fw-bold btn-danger",
                        cancelButton: "btn fw-bold btn-active-light-primary"
                    }
                }).then((result) => {
                    if (result.value) {
                        $.ajax({
                            type: "POST",
                            url: deleteUrl + customerId + "/",
                            data: {
                                'csrfmiddlewaretoken': $('input[name="csrfmiddlewaretoken"]').val(),
                            },
                            success: function() {
                                Swal.fire({
                                    text: "You have deleted " + firstColumnCell + "!",
                                    icon: "success",
                                    buttonsStyling: false,
                                    confirmButtonText: "Ok, got it!",
                                    customClass: {
                                        confirmButton: "btn fw-bold btn-primary"
                                    }
                                }).then(() => {
                                    dataTable.row($(tableRow)).remove().draw();
                                });
                            },
                            error: function() {
                                Swal.fire({
                                    text: "Error deleting the record.",
                                    icon: "error",
                                    buttonsStyling: false,
                                    confirmButtonText: "Ok, got it!",
                                    customClass: {
                                        confirmButton: "btn fw-bold btn-primary"
                                    }
                                });
                            }
                        });
                        
                    } else if (result.dismiss === "cancel") {
                        Swal.fire({
                            text: firstColumnCell + " was not deleted.",
                            icon: "error",
                            buttonsStyling: false,
                            confirmButtonText: "Ok, got it!",
                            customClass: {
                                confirmButton: "btn fw-bold btn-primary"
                            }
                        });
                    }
                });
            });
        });
    };

    var setupSearchFunctionality = () => {
        const searchInput = document.querySelector('[data-kt-customer-table-filter="search"]');
        if (searchInput) {
            searchInput.addEventListener('keyup', function(e) {
                dataTable.search(e.target.value).draw();
            });
        }
    };

    return {
        init: function(tableName) {
            TableElement = document.querySelector(`#${tableName}`);

            if (TableElement) {
                TableElement.querySelectorAll("tbody tr").forEach((tableRow) => {
                    const cells = tableRow.querySelectorAll("td");
                });

                dataTable = $(TableElement).DataTable({
                    info: false,
                    order: [],
                    columnDefs: [
                        { orderable: false, targets: 3 }
                    ]
                }).on("draw", function() {
                    setupDeleteHandler();
                    KTMenu.init();
                });
                
                setupDeleteHandler();
                setupSearchFunctionality(); // Add this line to initialize search functionality
            }
        }
    };
}();
