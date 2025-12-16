// Set today's date as default
document.addEventListener('DOMContentLoaded', function() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('invoiceDate').value = today;
    document.getElementById('paymentDate').value = today;
    
    // Auto-generate invoice number if empty
    const invoiceNumberInput = document.getElementById('invoiceNumber');
    if (!invoiceNumberInput.value) {
        const year = new Date().getFullYear();
        const month = String(new Date().getMonth() + 1).padStart(2, '0');
        const day = String(new Date().getDate()).padStart(2, '0');
        invoiceNumberInput.value = `INV-${year}-${month}${day}`;
    }
    
    // Update total when amount or currency changes
    document.getElementById('amount').addEventListener('input', updateTotal);
    document.getElementById('currency').addEventListener('change', updateTotal);
    
    // Initial total update
    updateTotal();
});

function updateTotal() {
    const amount = parseFloat(document.getElementById('amount').value) || 0;
    const currency = document.getElementById('currency').value;
    const currencySymbol = getCurrencySymbol(currency);
    document.getElementById('totalAmount').textContent = `${currencySymbol}${amount.toFixed(2)} ${currency}`;
}

function getCurrencySymbol(currency) {
    const symbols = {
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
        'INR': '₹'
    };
    return symbols[currency] || '$';
}

document.getElementById('invoiceForm').addEventListener('submit', function(e) {
    e.preventDefault();
    generatePDF();
});

function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const invoiceNumber = document.getElementById('invoiceNumber').value;
    const invoiceDate = formatDate(document.getElementById('invoiceDate').value);
    const fromName = document.getElementById('fromName').value;
    const fromAddress = document.getElementById('fromAddress').value;
    const fromWebsite = document.getElementById('fromWebsite').value;
    const toName = document.getElementById('toName').value;
    const toAddress = document.getElementById('toAddress').value;
    const toEmail = document.getElementById('toEmail').value;
    const description = document.getElementById('description').value;
    const reportIds = document.getElementById('reportIds').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const currency = document.getElementById('currency').value;
    const currencySymbol = getCurrencySymbol(currency);
    const paymentDate = formatDate(document.getElementById('paymentDate').value);
    const paymentMethod = document.getElementById('paymentMethod').value;
    const thankYouMessage = document.getElementById('thankYouMessage').value;
    
    // Colors
    const primaryColor = [102, 126, 234];
    
    let yPos = 20;
    
    // Title
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('INVOICE', 20, yPos);
    
    yPos += 10;
    
    // Invoice details
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(`Invoice Number: ${invoiceNumber}`, 20, yPos);
    yPos += 6;
    doc.text(`Date: ${invoiceDate}`, 20, yPos);
    yPos += 10;
    
    // From section
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('From:', 20, yPos);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    yPos += 7;
    doc.text(fromName, 20, yPos);
    yPos += 6;
    const fromAddressLines = fromAddress.split('\n');
    fromAddressLines.forEach(line => {
        if (line.trim()) {
            doc.text(line.trim(), 20, yPos);
            yPos += 6;
        }
    });
    if (fromWebsite) {
        doc.text(fromWebsite, 20, yPos);
        yPos += 6;
    }
    
    yPos += 5;
    
    // To section
    doc.setFont(undefined, 'bold');
    doc.setFontSize(12);
    doc.text('To:', 20, yPos);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    yPos += 7;
    doc.text(toName, 20, yPos);
    yPos += 6;
    const toAddressLines = toAddress.split('\n');
    toAddressLines.forEach(line => {
        if (line.trim()) {
            doc.text(line.trim(), 20, yPos);
            yPos += 6;
        }
    });
    doc.text(toEmail, 20, yPos);
    yPos += 10;
    
    // Description of Services
    doc.setFont(undefined, 'bold');
    doc.setFontSize(12);
    doc.text('Description of Services', 20, yPos);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    yPos += 7;
    
    // Description text
    const descriptionLines = doc.splitTextToSize(description, 170);
    descriptionLines.forEach(line => {
        doc.text(line, 20, yPos);
        yPos += 6;
    });
    
    yPos += 3;
    
    // Report IDs
    doc.text(`Report IDs: ${reportIds}`, 20, yPos);
    yPos += 7;
    
    // Amount
    doc.setFont(undefined, 'bold');
    doc.text(`Amount: ${currencySymbol}${amount.toFixed(2)} ${currency}`, 20, yPos);
    yPos += 10;
    
    // Total Amount
    doc.setFontSize(12);
    doc.text(`Total Amount ${currencySymbol}${amount.toFixed(2)} ${currency}`, 20, yPos);
    yPos += 10;
    
    // Payment information
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    let paymentInfo = `Payment scheduled`;
    if (paymentMethod) {
        paymentInfo += ` via ${paymentMethod}`;
    }
    paymentInfo += ` on ${paymentDate}.`;
    doc.text(paymentInfo, 20, yPos);
    yPos += 10;
    
    // Thank you message
    if (thankYouMessage) {
        doc.text(thankYouMessage, 20, yPos);
    } else {
        doc.text('Thank you for the opportunity to contribute to your platform.', 20, yPos);
    }
    
    // Save PDF
    const fileName = `Invoice_${invoiceNumber}_${invoiceDate.replace(/\//g, '-')}.pdf`;
    doc.save(fileName);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
}
