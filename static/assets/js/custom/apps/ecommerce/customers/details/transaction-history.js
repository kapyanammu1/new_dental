"use strict";

var KTCustomerViewPaymentTable = function() {
    var t, e = document.querySelector("#kt_table_customers_payment");

    return {
        init: function() {
            if (e) {
                // Format date in the 4th column of each row
                e.querySelectorAll("tbody tr").forEach((t) => {
                    const e = t.querySelectorAll("td"),
                          n = moment(e[3].innerHTML, "DD MMM YYYY, LT").format();
                    e[3].setAttribute("data-order", n);
                });

                // Initialize DataTable
                t = $(e).DataTable({
                    info: false,
                    order: [],
                    pageLength: 5,
                    lengthChange: false,
                    columnDefs: [{ orderable: false, targets: 4 }]
                });

                // Add delete functionality
                e.querySelectorAll('[data-kt-customer-table-filter="delete_row"]').forEach((e) => {
                    e.addEventListener("click", function(e) {
                        e.preventDefault();

                        const n = e.target.closest("tr"),
                              o = n.querySelectorAll("td")[0].innerText;

                        Swal.fire({
                            text: "Are you sure you want to delete " + o + "?",
                            icon: "warning",
                            showCancelButton: true,
                            buttonsStyling: false,
                            confirmButtonText: "Yes, delete!",
                            cancelButtonText: "No, cancel",
                            customClass: {
                                confirmButton: "btn fw-bold btn-danger",
                                cancelButton: "btn fw-bold btn-active-light-primary"
                            }
                        }).then(function(e) {
                            if (e.value) {
                                Swal.fire({
                                    text: "You have deleted " + o + "!",
                                    icon: "success",
                                    buttonsStyling: false,
                                    confirmButtonText: "Ok, got it!",
                                    customClass: { confirmButton: "btn fw-bold btn-primary" }
                                }).then(function() {
                                    t.row($(n)).remove().draw();
                                }).then(function() {
                                    toggleToolbars();
                                });
                            } else if (e.dismiss === "cancel") {
                                Swal.fire({
                                    text: o + " was not deleted.",
                                    icon: "error",
                                    buttonsStyling: false,
                                    confirmButtonText: "Ok, got it!",
                                    customClass: { confirmButton: "btn fw-bold btn-primary" }
                                });
                            }
                        });
                    });
                });
            }
        }
    };
}();

KTUtil.onDOMContentLoaded(function() {
    KTCustomerViewPaymentTable.init();
});
