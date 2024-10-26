$(document).ready(function() {
    var dataTable;
    if ($.fn.DataTable.isDataTable('#treatmentTable')) {
        dataTable = $('#treatmentTable').DataTable();
    } else {
        dataTable = $('#treatmentTable').DataTable({
            pageLength: 10,
            order: [[2, 'desc']], // Sort by date column descending
            dom: 'Bfrtip',
            buttons: [
                'copy', 'csv', 'excel', 'pdf', 'print'
            ]
        });
    }

    // Search functionality
    $('input[data-kt-customer-table-filter="search"]').keyup(function() {
        dataTable.search($(this).val()).draw();
    });

    // Filter functionality
    $('[data-kt-customer-table-filter="filter"]').click(function() {
        var month = $('[data-kt-customer-table-filter="month"]').val();
        var status = $('[data-kt-customer-table-filter="status"] input:checked').val();

        // Custom filtering function
        $.fn.dataTable.ext.search.push(
            function(settings, data, dataIndex) {
                var rowMonth = new Date(data[2]).getMonth() + 1; // Date column
                var rowStatus = data[4]; // Status column

                if ((month === '' || month == rowMonth) &&
                    (status === 'all' || status === rowStatus)) {
                    return true;
                }
                return false;
            }
        );

        dataTable.draw();
    });

    $('[data-kt-customer-table-filter="reset"]').click(function() {
        $('[data-kt-customer-table-filter="month"]').val('').trigger('change');
        $('[data-kt-customer-table-filter="status"] input[value="all"]').prop('checked', true);
        $.fn.dataTable.ext.search.pop();
        dataTable.draw();
    });

    // Export functionality
    $('[data-bs-target="#kt_customers_export_modal"]').click(function() {
        $('#kt_customers_export_modal').modal('show');
    });

    $('#kt_customers_export_submit').click(function() {
        var format = $('[name="format"]').val();
        
        switch(format) {
            case 'excel':
                dataTable.button('.buttons-excel').trigger();
                break;
            case 'pdf':
                dataTable.button('.buttons-pdf').trigger();
                break;
            case 'cvs':
                dataTable.button('.buttons-csv').trigger();
                break;
            case 'print':
                dataTable.button('.buttons-print').trigger();
                break;
        }

        $('#kt_customers_export_modal').modal('hide');
    });
});