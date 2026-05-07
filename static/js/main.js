let targetChart, confusionChart, featureChart, rocChart;

document.addEventListener("DOMContentLoaded", function () {
    loadDataset();
});

// =========================
// LOAD DATASET
// =========================
async function loadDataset() {
    const response = await fetch("/dataset/summary");
    const data = await response.json();

    document.getElementById("num_rows").innerText = data.num_rows;
    document.getElementById("num_cols").innerText = data.num_cols;

    const ctx = document.getElementById("targetChart");

    if (targetChart) targetChart.destroy();

    targetChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: Object.keys(data.target_distribution),
            datasets: [{
                label: "Target Distribution",
                data: Object.values(data.target_distribution)
            }]
        }
    });

    const tbody = document.querySelector("#missingTable tbody");
    tbody.innerHTML = "";

    for (const [feature, count] of Object.entries(data.missing_values)) {
        const row = document.createElement("tr");
        row.innerHTML = `<td>${feature}</td><td>${count}</td>`;
        tbody.appendChild(row);
    }
}

// =========================
// RUN MODEL
// =========================
async function runEvaluation() {
    showLoading();

    try {
        const res = await fetch("/model/evaluate");
        const data = await res.json();

        if (data.error) {
            alert(data.error);
            return;
        }

        // ===== Metrics =====
        document.getElementById("f1").innerText = data.f1_score.toFixed(4);
        document.getElementById("roc").innerText = data.roc_auc.toFixed(4);

        // ===== Confusion Matrix =====
        const cm = data.confusion_matrix;

        if (confusionChart) confusionChart.destroy();

        confusionChart = new Chart(
            document.getElementById("confusionChart"),
            {
                type: "bar",
                data: {
                    labels: ["TN", "FP", "FN", "TP"],
                    datasets: [{
                        label: "Confusion Matrix",
                        data: [cm.tn, cm.fp, cm.fn, cm.tp],
                        backgroundColor: [
                            "rgba(40,167,69,0.8)",  // TN - xanh
                            "rgba(220,53,69,0.8)",  // FP - đỏ
                            "rgba(220,53,69,0.8)",  // FN - đỏ
                            "rgba(40,167,69,0.8)"   // TP - xanh
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: ctx => `${ctx.label}: ${ctx.raw}`
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: "Count"
                            }
                        }
                    }
                }
            }
        );

        // ===== Feature Importance =====
        const top = data.feature_importance.slice(0, 10);

        const featureLabels = top.map(x => x.feature);
        const featureValues = top.map(x => x.importance);

        if (featureChart) featureChart.destroy();

        featureChart = new Chart(
            document.getElementById("featureChart"),
            {
                type: "bar",
                data: {
                    labels: featureLabels,
                    datasets: [{
                        label: "Importance",
                        data: featureValues
                    }]
                },
                options: {
                    indexAxis: 'y'
                }
            }
        );

        // ===== ROC Curve =====
        const roc = data.roc_curve;

        if (rocChart) rocChart.destroy();

        rocChart = new Chart(
            document.getElementById("rocChart"),
            {
                type: "line",
                data: {
                    labels: roc.fpr,
                    datasets: [{
                        label: "ROC Curve",
                        data: roc.tpr,
                        fill: false,
                        tension: 0.2
                    }]
                },
                options: {
                    scales: {
                        x: {
                            title: { display: true, text: "FPR" }
                        },
                        y: {
                            title: { display: true, text: "TPR" }
                        }
                    }
                }
            }
        );

        // ===== Report =====
        document.getElementById("report").innerHTML = `
            <p><b>Model:</b> RandomForestClassifier</p>
            <p><b>F1-score:</b> ${data.f1_score.toFixed(4)}</p>
            <p><b>ROC-AUC:</b> ${data.roc_auc.toFixed(4)}</p>
        `;

    } catch (err) {
        console.error(err);
        alert("Error running model");
    }

    hideLoading();
}

// =========================
// LOADING
// =========================
function showLoading() {
    document.getElementById("loadingOverlay").style.display = "flex";
    document.getElementById("runBtn").disabled = true;
}

function hideLoading() {
    document.getElementById("loadingOverlay").style.display = "none";
    document.getElementById("runBtn").disabled = false;
}