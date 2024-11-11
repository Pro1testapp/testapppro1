// Initialize sales data from localStorage or create empty array
let salesData = JSON.parse(localStorage.getItem('salesData')) || [];

// Form submission handler
document.getElementById('salesForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const sale = {
        date: document.getElementById('date').value,
        units: parseInt(document.getElementById('units').value),
        costPrice: parseFloat(document.getElementById('costPrice').value),
        sellingPrice: parseFloat(document.getElementById('sellingPrice').value),
        revenue: parseFloat(document.getElementById('sellingPrice').value) * parseInt(document.getElementById('units').value),
        cost: parseFloat(document.getElementById('costPrice').value) * parseInt(document.getElementById('units').value),
        profit: (parseFloat(document.getElementById('sellingPrice').value) * parseInt(document.getElementById('units').value)) - 
                (parseFloat(document.getElementById('costPrice').value) * parseInt(document.getElementById('units').value))
    };

    salesData.push(sale);
    localStorage.setItem('salesData', JSON.stringify(salesData));
    
    this.reset();
    analyzeData();
    alert('Sale recorded successfully!');
});

function showTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // Show selected tab
    document.getElementById(`${tabName}-tab`).classList.add('active');
}

// Show sales tab by default
document.addEventListener('DOMContentLoaded', function() {
    showTab('sales');
    analyzeData();
    // Set today's date as default
    document.getElementById('date').valueAsDate = new Date();
});

function handleAnalysisTypeChange() {
    const customDateRange = document.getElementById('customDateRange');
    if (document.getElementById('analysisType').value === 'custom') {
        customDateRange.style.display = 'block';
    } else {
        customDateRange.style.display = 'none';
        analyzeData();
    }
}

function analyzeData() {
    const analysisType = document.getElementById('analysisType').value;
    let filteredData = [...salesData];
    
    const now = new Date();
    
    if (analysisType === 'daily') {
        filteredData = salesData.filter(sale => 
            new Date(sale.date).toDateString() === now.toDateString()
        );
    } else if (analysisType === 'weekly') {
        const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
        filteredData = salesData.filter(sale => 
            new Date(sale.date) >= weekAgo
        );
    } else if (analysisType === 'monthly') {
        filteredData = salesData.filter(sale => 
            new Date(sale.date).getMonth() === now.getMonth() &&
            new Date(sale.date).getFullYear() === now.getFullYear()
        );
    } else if (analysisType === 'quarterly') {
        const quarter = Math.floor(now.getMonth() / 3);
        filteredData = salesData.filter(sale => {
            const saleQuarter = Math.floor(new Date(sale.date).getMonth() / 3);
            return saleQuarter === quarter &&
                   new Date(sale.date).getFullYear() === now.getFullYear();
        });
    } else if (analysisType === 'yearly') {
        filteredData = salesData.filter(sale =>
            new Date(sale.date).getFullYear() === now.getFullYear()
        );
    } else if (analysisType === 'custom') {
        const startDate = new Date(document.getElementById('startDate').value);document.getElementById('endDate').value);
        if (startDate && endDate) {
            filteredData = salesData.filter(sale =>
                new Date(sale.date) >= startDate && new Date(sale.date) <= endDate
            );
        }
    }

    const totals = filteredData.reduce((acc, sale) => {
        acc.revenue += sale.revenue;
        acc.cost += sale.cost;
        acc.profit += sale.profit;
        acc.units += sale.units;
        return acc;
    }, { revenue: 0, cost: 0, profit: 0, units: 0 });

    const resultsHTML = `
        <table>
            <tr>
                <th>Metric</th>
                <th>Value</th>
            </tr>
            <tr>
                <td>Total Units Sold</td>
                <td>${totals.units}</td>
            </tr>
            <tr>
                <td>Total Revenue</td>
                <td>₹${totals.revenue.toFixed(2)}</td>
            </tr>
            <tr>
                <td>Total Cost</td>
                <td>₹${totals.cost.toFixed(2)}</td>
            </tr>
            <tr>
                <td>Total Profit</td>
                <td>₹${totals.profit.toFixed(2)}</td>
            </tr>
        </table>
    `;

    document.getElementById('analysisResults').innerHTML = resultsHTML;
}

function exportData(format) {
    const data = salesData;
    
    switch(format) {
        case 'excel':
        case 'csv':
            let csvContent = "data:text/csv;charset=utf-8,";
            csvContent += "Date,Units,Cost Price,Selling Price,Revenue,Cost,Profit\n";
            data.forEach(row => {
                csvContent += `${row.date},${row.units},${row.costPrice},${row.sellingPrice},${row.revenue},${row.cost},${row.profit}\n`;
            });
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", format === 'excel' ? "sales_data.xls" : "sales_data.csv");
            document.body.appendChild(link);
            link.click();
            link.remove();
            break;

        case 'json':
            const jsonString = JSON.stringify(data, null, 2);
            const jsonBlob = new Blob([jsonString], { type: 'application/json' });
            const jsonUrl = window.URL.createObjectURL(jsonBlob);
            const jsonLink = document.createElement('a');
            jsonLink.setAttribute('href', jsonUrl);
            jsonLink.setAttribute('download', 'sales_data.json');
            jsonLink.click();
            window.URL.revokeObjectURL(jsonUrl);
            break;

        case 'pdf':
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            doc.text("Bhavik Plastic - Sales Report", 20, 10);
            
            let yPos = 30;
            data.forEach((row, index) => {
                if (yPos > 280) {
                    doc.addPage();
                    yPos = 20;
                }
                doc.text(`Date: ${row.date}`, 20, yPos);
                doc.text(`Units: ${row.units}`, 20, yPos + 7);
                doc.text(`Revenue: ₹${row.revenue.toFixed(2)}`, 20, yPos + 14);
                doc.text(`Profit: ₹${row.profit.toFixed(2)}`, 20, yPos + 21);
                yPos += 30;
            });
            
            doc.save("sales_data.pdf");
            break;
    }
}
