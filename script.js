document.addEventListener('DOMContentLoaded', function() {
    // Initialize invoice number system
    initializeInvoiceNumbering();
    
    // Set default dates
    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + 15); // Due in 15 days

    document.getElementById('invoiceDate').valueAsDate = today;
    document.getElementById('invoiceDue').valueAsDate = dueDate;
    
    // Set current date in the signature area
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    document.getElementById('currentDate').textContent = today.toLocaleDateString('en-GB', options);
    
    // Set default client
    document.getElementById('billTo').value = "";
    
    // Add example items
    addInitialItems();
    
    // Add event listeners for calculations
    document.getElementById('invoiceItems').addEventListener('input', calculateAll);
    document.getElementById('deliveryCharge').addEventListener('input', calculateAll);
    document.getElementById('paid').addEventListener('input', calculateAll);
    
    // Add event listeners for add/remove item buttons
    document.getElementById('addRow').addEventListener('click', addItemRow);
    document.getElementById('removeRow').addEventListener('click', removeItemRow);
    
    // Print invoice
    document.getElementById('printInvoice').addEventListener('click', function() {
        window.print();
    });
    
    // Save invoice (this would typically connect to a backend)
    document.getElementById('saveInvoice').addEventListener('click', function() {
        // Create a visual feedback for saving
        const btn = document.getElementById('saveInvoice');
        const originalText = btn.textContent;
        btn.textContent = "Saving...";
        btn.disabled = true;
        
        setTimeout(function() {
            btn.textContent = "✓ Saved!";
            
            // Increment invoice number for next invoice
            incrementInvoiceNumber();
            
            setTimeout(function() {
                btn.textContent = originalText;
                btn.disabled = false;
                alert('Invoice saved successfully!');
            }, 1500);
        }, 1000);
    });
    
    // Apply sweet animation to logo
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('mouseover', function() {
            this.style.transform = 'scale(1.1)';
            this.style.transition = 'transform 0.3s ease';
        });
        
        logo.addEventListener('mouseout', function() {
            this.style.transform = 'scale(1)';
        });
    }
    
    // Add sweet animation to balance due
    const balanceDue = document.getElementById('balanceDue');
    if (balanceDue) {
        setInterval(function() {
            balanceDue.classList.toggle('pulse-animation');
        }, 2000);
    }
    
    // Add event listener for new invoice button (which now exists directly in HTML)
    const newInvoiceBtn = document.getElementById('newInvoiceBtn');
    if (newInvoiceBtn) {
        newInvoiceBtn.addEventListener('click', createNewInvoice);
    }
    
    // Initial calculation
    calculateAll();
});

function addInitialItems() {
    // Clear existing items
    document.getElementById('invoiceItems').innerHTML = '';
    
    // Add items from the sample invoice
    addItemWithValues('', 1000.00, 1);
    
}

function addItemWithValues(description, price, qty) {
    const tbody = document.getElementById('invoiceItems');
    const tr = document.createElement('tr');
    
    tr.innerHTML = `
        <td>
            <input type="text" class="form-control item-description" value="${description}" placeholder="Description">
        </td>
        <td>
            <div class="input-group">
                <span class="input-group-text currency-symbol">Rs</span>
                <input type="number" class="form-control item-price" value="${price.toFixed(2)}" placeholder="0.00">
            </div>
        </td>
        <td>
            <input type="number" class="form-control item-qty" value="${qty}" placeholder="1">
        </td>
        <td>
            <div class="input-group">
                <span class="input-group-text currency-symbol">Rs</span>
                <input type="text" class="form-control item-amount" readonly>
            </div>
        </td>
    `;
    
    tbody.appendChild(tr);
    calculateRowAmount(tr);
}

function addItemRow() {
    const tbody = document.getElementById('invoiceItems');
    const tr = document.createElement('tr');
    
    tr.innerHTML = `
        <td>
            <input type="text" class="form-control item-description" placeholder="Description">
        </td>
        <td>
            <div class="input-group">
                <span class="input-group-text currency-symbol">Rs</span>
                <input type="number" class="form-control item-price" value="0.00" placeholder="0.00">
            </div>
        </td>
        <td>
            <input type="number" class="form-control item-qty" value="1" placeholder="1">
        </td>
        <td>
            <div class="input-group">
                <span class="input-group-text currency-symbol">Rs</span>
                <input type="text" class="form-control item-amount" readonly>
            </div>
        </td>
    `;
    
    tbody.appendChild(tr);
    
    // Add event listeners to the new row's inputs
    const priceInput = tr.querySelector('.item-price');
    const qtyInput = tr.querySelector('.item-qty');
    
    priceInput.addEventListener('input', function() {
        calculateRowAmount(tr);
        calculateAll();
    });
    
    qtyInput.addEventListener('input', function() {
        calculateRowAmount(tr);
        calculateAll();
    });
    
    // Calculate initial values for the new row
    calculateRowAmount(tr);
    calculateAll();
    
    // Add a sweet animation to the new row
    tr.style.animation = 'fadeIn 0.5s';
}

function removeItemRow() {
    const tbody = document.getElementById('invoiceItems');
    if (tbody.rows.length > 1) {
        const lastRow = tbody.rows[tbody.rows.length - 1];
        
        // Add a sweet animation before removing
        lastRow.style.animation = 'fadeOut 0.3s';
        
        setTimeout(function() {
            tbody.deleteRow(tbody.rows.length - 1);
            calculateAll();
        }, 300);
    }
}

function calculateRowAmount(row) {
    const price = parseFloat(row.querySelector('.item-price').value) || 0;
    const qty = parseInt(row.querySelector('.item-qty').value) || 0;
    const amount = price * qty;
    
    row.querySelector('.item-amount').value = amount.toFixed(2);
    return amount;
}

function calculateAll() {
    // Get all item rows
    const rows = document.querySelectorAll('#invoiceItems tr');
    
    // Reset totals
    let subtotal = 0;
    
    // Calculate each row
    rows.forEach(row => {
        const rate = parseFloat(row.querySelector('.item-price').value) || 0;
        const qty = parseInt(row.querySelector('.item-qty').value) || 0;
        const amount = rate * qty;
        
        // Update amount field
        row.querySelector('.item-amount').value = amount.toFixed(2);
        
        // Add to subtotal
        subtotal += amount;
    });
    
    // Calculate other totals
    const deliveryCharge = parseFloat(document.getElementById('deliveryCharge').value) || 0;
    const total = subtotal + deliveryCharge;
    const paid = parseFloat(document.getElementById('paid').value) || 0;
    const balanceDue = total - paid;
    
    // Update display
    document.getElementById('subtotal').value = subtotal.toFixed(2);
    document.getElementById('total').value = total.toFixed(2);
    document.getElementById('balanceDue').value = balanceDue.toFixed(2);
    
    // Highlight balance due for better visibility in print
    const balanceDueElement = document.getElementById('balanceDue');
    if (balanceDue > 0) {
        balanceDueElement.style.fontWeight = 'bold';
        balanceDueElement.style.color = '#000'; // Ensure good contrast for printing
    }
    
    // Highlight balance due if it's positive
    if (balanceDue > 0) {
        document.getElementById('balanceDue').parentElement.classList.add('balance-due-positive');
    } else {
        document.getElementById('balanceDue').parentElement.classList.remove('balance-due-positive');
    }
    
    // Return values for potential use elsewhere
    return {
        subtotal: subtotal,
        deliveryCharge: deliveryCharge,
        total: total,
        paid: paid,
        balanceDue: balanceDue
    };
}

// Invoice numbering system
function initializeInvoiceNumbering() {
    // Check if we have a stored invoice number in localStorage
    let currentInvoiceNum = localStorage.getItem('sublimeLastInvoiceNum');
    let currentYear = new Date().getFullYear();
    let storedYear = localStorage.getItem('sublimeInvoiceYear');
    
    // Initialize if not exists or year has changed
    if (!currentInvoiceNum || !storedYear || parseInt(storedYear) !== currentYear) {
        // Reset invoice number for new year
        currentInvoiceNum = 1;
        localStorage.setItem('sublimeInvoiceYear', currentYear.toString());
        localStorage.setItem('sublimeLastInvoiceNum', currentInvoiceNum.toString());
    } else {
        currentInvoiceNum = parseInt(currentInvoiceNum);
    }
    
    // Format and set invoice number
    setInvoiceNumber(currentInvoiceNum, currentYear);
}

function setInvoiceNumber(num, year) {
    // Format invoice number (e.g., INV2025-37)
    const formattedNum = num.toString().padStart(2, '0');
    const invoiceNumber = `INV${year}-${formattedNum}`;
    
    // Update the invoice number input
    document.getElementById('invoiceNumber').value = invoiceNumber;
    
    // Store the current number
    localStorage.setItem('sublimeLastInvoiceNum', num.toString());
}

function incrementInvoiceNumber() {
    // Get current values
    let currentNum = parseInt(localStorage.getItem('sublimeLastInvoiceNum') || '1');
    let currentYear = parseInt(localStorage.getItem('sublimeInvoiceYear') || new Date().getFullYear());
    
    // Increment the number
    currentNum++;
    
    // Update storage
    localStorage.setItem('sublimeLastInvoiceNum', currentNum.toString());
    
    // Generate and display next invoice number (for reference only)
    const nextInvoiceNum = `INV${currentYear}-${currentNum.toString().padStart(2, '0')}`;
    console.log(`Next invoice will be: ${nextInvoiceNum}`);
    
    return nextInvoiceNum;
}

// Don't need this anymore since button is in HTML
// function addNewInvoiceButton() {
//     const container = document.querySelector('.text-center.mt-3');
//     
//     if (container) {
//         // Create new invoice button if it doesn't exist
//         if (!document.getElementById('newInvoiceBtn')) {
//             const newInvoiceBtn = document.createElement('button');
//             newInvoiceBtn.id = 'newInvoiceBtn';
//             newInvoiceBtn.className = 'btn btn-sweet-secondary me-2';
//             newInvoiceBtn.textContent = 'New Invoice';
//             
//             // Insert before the first child
//             container.insertBefore(newInvoiceBtn, container.firstChild);
//             
//             // Add event listener
//             newInvoiceBtn.addEventListener('click', createNewInvoice);
//         }
//     }
// }

function createNewInvoice() {
    // Clear client name
    document.getElementById('billTo').value = '';
    
    // Increment invoice number
    const nextInvoice = incrementInvoiceNumber();
    document.getElementById('invoiceNumber').value = nextInvoice;
    
    // Reset dates
    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + 15);
    
    document.getElementById('invoiceDate').valueAsDate = today;
    document.getElementById('invoiceDue').valueAsDate = dueDate;
    
    // Clear items and add one empty row
    document.getElementById('invoiceItems').innerHTML = '';
    addItemWithValues('', 0.00, 1);
    
    // Reset paid amount
    document.getElementById('paid').value = '0.00';
    
    // Reset delivery charge
    document.getElementById('deliveryCharge').value = '0.00';
    
    // Recalculate
    calculateAll();
    
    // Visual feedback
    alert('New invoice created!');
}

// Add CSS animations
document.head.insertAdjacentHTML('beforeend', `
<style>
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(10px); }
    }
    
    @keyframes pulse-animation {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
    
    .pulse-animation {
        animation: pulse-animation 1s infinite;
    }
    
    .balance-due-positive {
        transition: all 0.3s ease;
    }
</style>
`);
