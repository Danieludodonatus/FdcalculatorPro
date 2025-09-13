// Get elements
let btn = document.getElementById("Calculate");
let result = document.getElementById("output");
let breakdown = document.getElementById("breakdown");
let maturityDate = document.getElementById("maturityDate");
let downloadBtn = document.getElementById("downloadPDF");

// Chart instances
let growthChartInstance = null;
let breakdownChartInstance = null;

// Function to calculate maturity amount
function CalculateAmount() {
    // Get fresh values each time
    let principalamount = parseFloat(document.getElementById("principalamount").value);
    let interstrate = parseFloat(document.getElementById("interstrate").value);
    let Tenure = parseFloat(document.getElementById("Tenure").value);
    let start = document.getElementById("startDate").value;
    let interestType = document.getElementById("interestType").value;

    // Validate
    if (isNaN(principalamount) || isNaN(interstrate) || isNaN(Tenure) || !start) {
        result.innerHTML = "⚠️ Please fill in all fields correctly.";
        return;
    }

    // Simple or compound calculation
    let maturityamount = 0;
    if (interestType === "simple") {
        maturityamount = principalamount + (principalamount * interstrate * Tenure) / 100;
    } else {
        maturityamount = principalamount * Math.pow(1 + interstrate / 100, Tenure);
    }

    // Maturity Date
    let startDateObj = new Date(start);
    startDateObj.setFullYear(startDateObj.getFullYear() + Tenure);
    let maturityDateStr = startDateObj.toDateString();

    // Update output
    result.innerHTML = `✅ Maturity Amount: ${maturityamount.toFixed(2)}`;
    breakdown.innerHTML = `Principal: ${principalamount} | Interest Earned: ${(maturityamount - principalamount).toFixed(2)}`;
    maturityDate.innerHTML = `Maturity Date: ${maturityDateStr}`;

    // Update Growth Chart
    let yearlyData = [];
    for (let i = 1; i <= Tenure; i++) {
        let amt =
            interestType === "simple"
                ? principalamount + (principalamount * interstrate * i) / 100
                : principalamount * Math.pow(1 + interstrate / 100, i);
        yearlyData.push(amt.toFixed(2));
    }

    if (growthChartInstance) growthChartInstance.destroy();
    let ctx1 = document.getElementById("growthChart").getContext("2d");
    growthChartInstance = new Chart(ctx1, {
        type: "line",
        data: {
            labels: Array.from({ length: Tenure }, (_, i) => `Year ${i + 1}`),
            datasets: [
                {
                    label: "Growth Over Time",
                    data: yearlyData,
                    borderColor: "#007bff",
                    backgroundColor: "rgba(0, 123, 255, 0.2)",
                    fill: true,
                    tension: 0.2,
                },
            ],
        },
    });

    // Update Breakdown Chart
    if (breakdownChartInstance) breakdownChartInstance.destroy();
    let ctx2 = document.getElementById("breakdownChart").getContext("2d");
    breakdownChartInstance = new Chart(ctx2, {
        type: "pie",
        data: {
            labels: ["Principal", "Interest"],
            datasets: [
                {
                    data: [principalamount, maturityamount - principalamount],
                    backgroundColor: ["#28a745", "#ffc107"],
                },
            ],
        },
    });

    // ✅ Reset inputs after calculation
    document.getElementById("principalamount").value = "";
    document.getElementById("interstrate").value = "";
    document.getElementById("Tenure").value = "";
    document.getElementById("startDate").value = "";
    document.getElementById("interestType").value = "simple";
}

// Event listener
btn.addEventListener("click", CalculateAmount);

// Download PDF including charts
downloadBtn.addEventListener("click", () => {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    pdf.setFontSize(16);
    pdf.text("FD Calculator Report", 10, 10);

    pdf.setFontSize(12);
    pdf.text(result.innerText, 10, 20);
    pdf.text(breakdown.innerText, 10, 30);
    pdf.text(maturityDate.innerText, 10, 40);

    // Add charts as images
    let growthCanvas = document.getElementById("growthChart");
    let breakdownCanvas = document.getElementById("breakdownChart");

    pdf.addImage(growthCanvas.toDataURL("image/png"), "PNG", 10, 50, 80, 60);
    pdf.addImage(breakdownCanvas.toDataURL("image/png"), "PNG", 110, 50, 80, 60);

    pdf.save("FD_Calculator_Report.pdf");
});
