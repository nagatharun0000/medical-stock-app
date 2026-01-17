let medicines = JSON.parse(localStorage.getItem("medicines")) || [];

/* ===== LOGIN ===== */
function login() {
  const phone = document.getElementById("phone").value.trim();
  const pass = document.getElementById("password").value.trim();

  if (!phone || !pass) {
    alert("Enter phone number and password");
    return;
  }

  document.getElementById("loginBox").classList.add("hidden");
  document.getElementById("appBox").classList.remove("hidden");
  renderTable();
}

function togglePassword() {
  const pass = document.getElementById("password");
  pass.type = pass.type === "password" ? "text" : "password";
}
/* ===== searchMedicine function ===== */
function searchMedicine(text) {
  const filtered = medicines.filter(m =>
    m.name.toLowerCase().includes(text.toLowerCase())
  );
  renderTable(filtered);
}

/* ===== exportExcel ===== */
function exportExcel() {
  let csv = "Medicine,MFG,EXP,Remaining,Quantity\n";

  medicines.forEach(m => {
    csv += `${m.name},${m.mfg},${m.exp},${remainingMonths(m.exp)},${m.qty}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "medicine_stock.csv";
  a.click();
}

/* ===== exportPD ===== */
function exportPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.text("Medicine Stock Report", 14, 15);

  let y = 25;
  medicines.forEach(m => {
    doc.text(
      `${m.name} | MFG:${m.mfg} | EXP:${m.exp} | Qty:${m.qty}`,
      14,
      y
    );
    y += 8;
  });

  doc.save("medicine_stock.pdf");
}

/* ===== deleteRow ===== */
function deleteRow(index) {
  if (!confirm("Delete this medicine entry?")) return;

  medicines.splice(index, 1);
  saveAndRender();
}


/* ===== TOGGLE FORMS ===== */
function toggleAddForm() {
  document.getElementById("addForm").classList.toggle("hidden");
}

function toggleDeleteForm() {
  document.getElementById("deleteForm").classList.toggle("hidden");
}

/* ===== ADD MEDICINE ===== */
function addMedicine() {
  const name = document.getElementById("addName").value.trim();
  const mfg = document.getElementById("mfgDate").value;
  const exp = document.getElementById("expDate").value;
  const qty = Number(document.getElementById("quantity").value);

  if (!name || !mfg || !exp || qty <= 0) {
    alert("Fill all fields correctly");
    return;
  }

  // 🔍 Check if same medicine with same MFG & EXP exists
  const existing = medicines.find(m =>
    m.name.toLowerCase() === name.toLowerCase() &&
    m.mfg === mfg &&
    m.exp === exp
  );

  if (existing) {
    // ✅ Just increase quantity
    existing.qty += qty;
  } else {
    // ➕ New entry
    medicines.push({ name, mfg, exp, qty });
  }

  saveAndRender();
  clearAddForm();
  document.getElementById("addForm").classList.add("hidden");
}


/* ===== DELETE MEDICINE ===== */
function deleteMedicine() {
  const name = document.getElementById("delName").value.trim();
  const exp = document.getElementById("delExpDate").value;

  if (!name) {
    alert("Enter medicine name");
    return;
  }

  const sameMedicines = medicines.filter(m => m.name === name);

  if (sameMedicines.length === 0) {
    alert("Medicine not found");
    return;
  }

  let target;

  if (exp) {
    target = sameMedicines.find(m => m.exp === exp);
    if (!target) {
      alert("Medicine with this expiry not found");
      return;
    }
  } else {
    target = sameMedicines.reduce((a, b) =>
      remainingMonths(a.exp) < remainingMonths(b.exp) ? a : b
    );
  }

  medicines.splice(medicines.indexOf(target), 1);
  saveAndRender();
  clearDeleteForm();
  document.getElementById("deleteForm").classList.add("hidden");
}

/* ===== HELPERS ===== */
function remainingMonths(exp) {
  const [y, m] = exp.split("-").map(Number);
  const remainingDays = getRemainingDays(medicine.exp);

function saveAndRender() {
  localStorage.setItem("medicines", JSON.stringify(medicines));
  renderTable();
}
function getRemainingDays(expDate) {
  const today = new Date();
  const exp = new Date(expDate + "-01");

  const diffTime = exp - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}
/* ===== TABLE ===== */
function renderTable(filteredList = medicines) {
  const table = document.getElementById("medicineTable");
  table.innerHTML = "";

  filteredList
    .sort((a, b) => remainingMonths(a.exp) - remainingMonths(b.exp))
    .forEach((m, index) => {
      const rem = remainingMonths(m.exp);

      let colorClass = "safe";
      if (rem <= 0) colorClass = "expired";
      else if (rem <= 3) colorClass = "critical";
      else if (rem <= 6) colorClass = "warning";

      const row = document.createElement("tr");
      row.className = colorClass;

      row.innerHTML = `
        <td>${m.name}</td>
        <td>${m.mfg}</td>
        <td>${m.exp}</td>
        <td>${rem <= 0 ? "Expired" : rem}</td>
        <td>${m.qty}</td>
        <td>
          <button class="row-delete" onclick="deleteRow(${index})">🗑️</button>
        </td>
      `;

      table.appendChild(row);
    });
}


/* ===== CLEAR FORMS ===== */
function clearAddForm() {
  document.getElementById("addName").value = "";
  document.getElementById("mfgDate").value = "";
  document.getElementById("expDate").value = "";
  document.getElementById("quantity").value = "";
}

function clearDeleteForm() {
  document.getElementById("delName").value = "";
  document.getElementById("delExpDate").value = "";
}
