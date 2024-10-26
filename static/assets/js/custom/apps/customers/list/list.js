"use strict";

var TableManager = function() {
    var dataTable, searchInput, filterMonth, customerTableElement;

    var setupDeleteRowHandler = () => {
        customerTableElement.querySelectorAll('[data-kt-customer-table-filter="delete_row"]').forEach((deleteButton) => {
            deleteButton.addEventListener("click", function(event) {
                event.preventDefault();
                const tableRow = event.target.closest("tr"),
                      customerName = tableRow.querySelectorAll("td")[0].innerText,
                      pkValue = tableRow.getAttribute('data-pk');

                Swal.fire({
                    text: "Are you sure you want to delete " + customerName + "?",
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
                            url: "/Delete_patient/" + pkValue + "/",
                            data: {
                                'csrfmiddlewaretoken': $('input[name="csrfmiddlewaretoken"]').val(),
                            },
                            success: function() {
                                Swal.fire({
                                    text: "You have deleted " + customerName + "!",
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
                                    text: "Error deleting the patient.",
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
                            text: customerName + " was not deleted.",
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

    var setupDeleteSelectedHandler = () => {
        const checkboxes = customerTableElement.querySelectorAll('[type="checkbox"]'),
              deleteSelectedButton = document.querySelector('[data-kt-customer-table-select="delete_selected"]');

        checkboxes.forEach((checkbox) => {
            checkbox.addEventListener("click", function() {
                setTimeout(() => {
                    updateToolbarVisibility();
                }, 50);
            });
        });

        deleteSelectedButton.addEventListener("click", function() {
            Swal.fire({
                text: "Are you sure you want to delete selected customers?",
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
                    Swal.fire({
                        text: "You have deleted all selected customers!",
                        icon: "success",
                        buttonsStyling: false,
                        confirmButtonText: "Ok, got it!",
                        customClass: {
                            confirmButton: "btn fw-bold btn-primary"
                        }
                    }).then(() => {
                        checkboxes.forEach((checkbox) => {
                            if (checkbox.checked) {
                                dataTable.row($(checkbox.closest("tbody tr"))).remove().draw();
                            }
                        });
                        customerTableElement.querySelectorAll('[type="checkbox"]')[0].checked = false;
                    });
                } else if (result.dismiss === "cancel") {
                    Swal.fire({
                        text: "Selected customers were not deleted.",
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
    };

    const updateToolbarVisibility = () => {
        const baseToolbar = document.querySelector('[data-kt-customer-table-toolbar="base"]'),
              selectedToolbar = document.querySelector('[data-kt-customer-table-toolbar="selected"]'),
              selectedCountElement = document.querySelector('[data-kt-customer-table-select="selected_count"]'),
              checkboxes = customerTableElement.querySelectorAll('tbody [type="checkbox"]');
        let hasChecked = false, selectedCount = 0;

        checkboxes.forEach((checkbox) => {
            if (checkbox.checked) {
                hasChecked = true;
                selectedCount++;
            }
        });

        if (hasChecked) {
            selectedCountElement.innerHTML = selectedCount;
            baseToolbar.classList.add("d-none");
            selectedToolbar.classList.remove("d-none");
        } else {
            baseToolbar.classList.remove("d-none");
            selectedToolbar.classList.add("d-none");
        }
    };

    return {
        init: function() {
            customerTableElement = document.querySelector("#kt_customers_table");

            if (customerTableElement) {
                customerTableElement.querySelectorAll("tbody tr").forEach((row) => {
                    const cells = row.querySelectorAll("td"),
                          formattedDate = moment(cells[5].innerHTML, "DD MMM YYYY, LT").format();
                    cells[5].setAttribute("data-order", formattedDate);
                });

                dataTable = $(customerTableElement).DataTable({
                    info: false,
                    order: [],
                    columnDefs: [
                        { orderable: false, targets: 0 },
                        { orderable: false, targets: 6 }
                    ]
                }).on("draw", function() {
                    setupDeleteSelectedHandler();
                    setupDeleteRowHandler();
                    updateToolbarVisibility();
                    KTMenu.init();
                });

                setupDeleteSelectedHandler();
                
                document.querySelector('[data-kt-customer-table-filter="search"]').addEventListener("keyup", function(event) {
                    dataTable.search(event.target.value).draw();
                });

                searchInput = $('[data-kt-customer-table-filter="month"]');
                filterMonth = document.querySelectorAll('[data-kt-customer-table-filter="payment_type"] [name="payment_type"]');

                document.querySelector('[data-kt-customer-table-filter="filter"]').addEventListener("click", function() {
                    const selectedMonth = searchInput.val();
                    let paymentType = "";
                    filterMonth.forEach((type) => {
                        if (type.checked) {
                            paymentType = type.value;
                        }
                        if (paymentType === "all") {
                            paymentType = "";
                        }
                    });
                    const filterQuery = selectedMonth + " " + paymentType;
                    dataTable.search(filterQuery).draw();
                });

                setupDeleteRowHandler();

                document.querySelector('[data-kt-customer-table-filter="reset"]').addEventListener("click", function() {
                    searchInput.val(null).trigger("change");
                    filterMonth[0].checked = true;
                    dataTable.search("").draw();
                });
            }
        }
    };
}();
