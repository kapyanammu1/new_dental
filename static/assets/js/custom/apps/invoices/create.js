"use strict";

const KTAppInvoicesCreate = (function() {
    const addItemButton = document.getElementById('add-item');
    const itemRowsContainer = document.getElementById('item-rows');
    const itemRowTemplate = itemRowsContainer ? itemRowsContainer.querySelector('.item-row') : null;
    const totalForms = document.getElementById('id_form-TOTAL_FORMS');

    const updateTotals = () => {
        if (!itemRowsContainer || !totalForms) return; // Safety check

        const rows = Array.from(itemRowsContainer.querySelectorAll('[data-kt-element="item"]'));
        let totalAmount = 0;
        const numberFormatter = wNumb({ decimals: 2, thousand: "," });

        rows.forEach(row => {
            if (row.style.display === 'none') return; // Skip hidden rows

            const quantityInput = row.querySelector('[name$="-qty"]');
            const priceInput = row.querySelector('[name$="-price"]');
            const totalElement = row.querySelector('[data-kt-element="total"]');

            if (!quantityInput || !priceInput || !totalElement) return; // Safety check

            let quantity = parseInt(quantityInput.value) || 1;
            let price = numberFormatter.from(priceInput.value) || 0;
            price = price < 0 ? 0 : price;
            const total = quantity * price;

            quantityInput.value = quantity;
            // priceInput.value = numberFormatter.to(price);
            totalElement.innerText = numberFormatter.to(total);
            totalAmount += total;
        });

        // Make sure the correct elements are selected
        const subTotalElement = document.querySelector('[data-kt-element="sub-total"]');
        const grandTotalElement = document.querySelector('[data-kt-element="grand-total"]');

        if (subTotalElement && grandTotalElement) {
            subTotalElement.innerText = numberFormatter.to(totalAmount);
            grandTotalElement.innerText = numberFormatter.to(totalAmount);
        } else {
            console.error('Sub-total or Grand-total elements not found.');
        }
    };    

    const addItemRow = () => {
        if (!itemRowTemplate || !itemRowsContainer || !totalForms) return; // Safety check
        
        const totalFormsCount = document.querySelectorAll('.item-row').length;
        const newItemRow = itemRowTemplate.cloneNode(true);
        newItemRow.classList.remove('d-none');
    
        // Update names for form elements
        const treatmentField = newItemRow.querySelector('[name*="treatment"]');
        const qtyField = newItemRow.querySelector('[name*="qty"]');
        const priceField = newItemRow.querySelector('[name*="price"]');
    
        treatmentField.setAttribute('name', `form-${totalFormsCount}-treatment`);
        qtyField.setAttribute('name', `form-${totalFormsCount}-qty`);
        priceField.setAttribute('name', `form-${totalFormsCount}-price`);
    
        // Reset values
        treatmentField.value = '';
        qtyField.value = '1';
        priceField.value = '0.00';

        // Append the new row
        itemRowsContainer.appendChild(newItemRow);
    
        // Reinitialize Select2 on the new treatment field
        $(treatmentField).select2();
        
        // Update the total forms count
        totalForms.value = totalFormsCount + 1;
    
        // Update totals
        updateTotals();
    };

    const reinitializeSelect2Fields = () => {
        document.querySelectorAll('[name*="treatment"]').forEach(field => {
            if (!$(field).hasClass("select2-hidden-accessible")) {
                 // Reinitialize Select2 if not already done
                console.log(field.name)
                field.setAttribute('data-control', "select2");
                $(field).select2();
            }
        });
    };

    const fetchPrice = (treatID, priceInput) => {
        $.ajax({
            url: `/getPrice/${treatID}/`,
            method: 'GET',
            success: data => {
                priceInput.value = data.price;
                updateTotals();
            },
            error: () => {
                console.log('An error occurred.');
            }
        });
    };

    const removeItemRow = (event) => {
        if (event.target.closest('[data-kt-element="remove-item"]')) {
            const row = event.target.closest('.item-row');
            if (row) {
                const qtyInput = row.querySelector('[name$="-qty"]');
                const qtyName = qtyInput.name.replace("-qty", "");
                const cbName = qtyName + "-DELETE";
                
                const deleteCheckbox = document.querySelector(`input[name="${cbName}"]`);
                
                if (deleteCheckbox) {
                    // Check the checkbox to mark the item for deletion
                    deleteCheckbox.checked = true;
                    console.log(`Checkbox ${deleteCheckbox.name} checked: ${deleteCheckbox.checked}`);
                }

                row.remove();

                // Update totals
                updateTotals();
            }
        }
    };

    const handleChange = (event) => {
        if (event.target.matches('[name$="-qty"], [name$="-price"], [name$="-treatment"]')) {
            updateTotals();
        }
    };

    const initEventListeners = () => {
        if (!addItemButton) return; // Safety check

        addItemButton.addEventListener('click', (event) => {
            event.preventDefault();
            addItemRow();
            reinitializeSelect2Fields();
        });

        if (itemRowsContainer) {
            itemRowsContainer.addEventListener('click', removeItemRow);
        }

        // Use Select2 event for treatment changes
        $(document).on('change', 'select[name$="-treatment"]', (event) => {
            const treatID = $(event.target).val();
            const txtPrice = event.target.name.replace("-treatment", "");
            const priceInput = document.querySelector(`input[name="${txtPrice}-price"]`);
            if (priceInput) {
                fetchPrice(treatID, priceInput);
            }
        });

        document.body.addEventListener('change', handleChange);

        updateTotals();
    };

    return {
        init: function() {
            document.addEventListener('DOMContentLoaded', initEventListeners);
        }
    };
})();

KTAppInvoicesCreate.init();
