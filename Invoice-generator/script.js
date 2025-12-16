// Set today's date as default
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize if authenticated
    if (sessionStorage.getItem('authenticated') !== 'true') {
        return;
    }
    
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('invoiceDate').value = today;
    
    // Auto-generate invoice number if empty
    const invoiceNumberInput = document.getElementById('invoiceNumber');
    if (!invoiceNumberInput.value) {
        const year = new Date().getFullYear();
        const month = String(new Date().getMonth() + 1).padStart(2, '0');
        const day = String(new Date().getDate()).padStart(2, '0');
        invoiceNumberInput.value = `BB/${year}/${month}${day}`;
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
    const supplierName = document.getElementById('supplierName').value;
    const supplierAddress = document.getElementById('supplierAddress').value;
    const supplierEmail = document.getElementById('supplierEmail').value;
    const gstin = document.getElementById('gstin').value;
    const recipientName = document.getElementById('recipientName').value;
    const recipientAddress = document.getElementById('recipientAddress').value;
    const placeOfSupply = document.getElementById('placeOfSupply').value;
    const description = document.getElementById('description').value;
    const reportIds = document.getElementById('reportIds').value;
    const sacCode = document.getElementById('sacCode').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const currency = document.getElementById('currency').value;
    const currencySymbol = getCurrencySymbol(currency);
    const exportDeclaration = document.getElementById('exportDeclaration').value;
    
    // Colors
    const primaryColor = [102, 126, 234];
    
    let yPos = 20;
    
    // Title
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('EXPORT TAX INVOICE', 105, yPos, { align: 'center' });
    
    yPos += 10;
    
    // Invoice details
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(`Invoice No: ${invoiceNumber}`, 20, yPos);
    yPos += 6;
    doc.text(`Invoice Date: ${invoiceDate}`, 20, yPos);
    yPos += 12;
    
    // Supplier (Exporter) section
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Supplier (Exporter):', 20, yPos);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    yPos += 7;
    doc.text(supplierName, 20, yPos);
    yPos += 6;
    const supplierAddressLines = supplierAddress.split('\n');
    supplierAddressLines.forEach(line => {
        if (line.trim()) {
            doc.text(line.trim(), 20, yPos);
            yPos += 6;
        }
    });
    doc.text(`Email: ${supplierEmail}`, 20, yPos);
    yPos += 7;
    doc.setFont(undefined, 'bold');
    doc.text(`GSTIN: ${gstin}`, 20, yPos);
    yPos += 10;
    
    // Recipient (Importer of Services) section
    doc.setFont(undefined, 'bold');
    doc.setFontSize(12);
    doc.text('Recipient (Importer of Services):', 20, yPos);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    yPos += 7;
    doc.text(recipientName, 20, yPos);
    yPos += 6;
    const recipientAddressLines = recipientAddress.split('\n');
    recipientAddressLines.forEach(line => {
        if (line.trim()) {
            doc.text(line.trim(), 20, yPos);
            yPos += 6;
        }
    });
    yPos += 5;
    
    // Place of Supply
    doc.setFont(undefined, 'bold');
    doc.text(`Place of Supply: ${placeOfSupply}`, 20, yPos);
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
    doc.text(`(Report ID: ${reportIds})`, 20, yPos);
    yPos += 7;
    
    // SAC Code
    doc.setFont(undefined, 'bold');
    doc.text(`SAC: ${sacCode}`, 20, yPos);
    yPos += 10;
    
    // Invoice Value
    doc.setFont(undefined, 'bold');
    doc.setFontSize(11);
    doc.text('Invoice Value:', 20, yPos);
    doc.text(`${currencySymbol}${amount.toFixed(2)}`, 60, yPos);
    yPos += 7;
    
    // GST Rate
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.text('GST Rate: 0%', 20, yPos);
    yPos += 6;
    doc.text('IGST: Nil', 20, yPos);
    yPos += 8;
    
    // Export Declaration
    doc.setFont(undefined, 'bold');
    doc.text('Declaration:', 20, yPos);
    doc.setFont(undefined, 'normal');
    yPos += 6;
    const declarationLines = doc.splitTextToSize(exportDeclaration, 170);
    declarationLines.forEach(line => {
        doc.text(line, 20, yPos);
        yPos += 6;
    });
    yPos += 7;
    
    // Total Invoice Value
    doc.setFont(undefined, 'bold');
    doc.setFontSize(12);
    doc.text(`Total Invoice Value: ${currencySymbol}${amount.toFixed(2)} ${currency}`, 20, yPos);
    yPos += 15;
    
    // Signature
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.text('Signature:', 20, yPos);
    yPos += 7;
    doc.text(supplierName, 20, yPos);
    
    // Save PDF
    const fileName = `Invoice_${invoiceNumber}_${invoiceDate.replace(/\//g, '-')}.pdf`;
    doc.save(fileName);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`; // Format as DD-MM-YYYY
}
