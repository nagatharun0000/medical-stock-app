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

/* ===== SEARCH ===== */
function searchMedicine(text) {
  const filtered = medicines.filter(m =>
    m.name.toLowerCase().includes(text.toLowerCase())
  );
  renderTable(filtered);
}

/* ===== DATE UTILS ===== */
function getRemainingDays(expDate) {
  const today = new Date();
  const exp = new Date(expDate + "-01");
  const diff = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
  return diff;
}

/* ===== ADD MEDICINE ===== */
function addMedicine() {
  const name = addName.value.trim();
  const mfg = mfgDate.value;
  const exp = expDate.value;
  const qty = Number(quantity.value);

  if (!name || !mfg || !exp || qty <= 0) {
    alert("Fill all fields correctly");
    return;
  }

  const existing = medicines.find(m =>
    m.name.toLowerCase() === name.toLowerCase() &&
    m.mfg === mfg &&
    m.exp === exp
  );

  if (existing) existing.qty += qty;
  else medicines.push({ name, mfg, exp, qty });

  saveAndRender();
  clearAddForm();
  addForm.classList.add("hidden");
}


/* ===== QUANTITY CHANGE ( + / - ) ===== */
function changeQty(index, value) {
  medicines[index].qty += value;

  if (medicines[index].qty <= 0) {
    medicines.splice(index, 1);
  }

  saveAndRender();
}

/* ===== BULK REMOVE ===== */
function removeBulk(index) {
  const input = document.getElementById(`bulk-${index}`);
  const value = Number(input.value);

  if (!value || value <= 0) {
    alert("Enter valid quantity to remove");
    return;
  }

  medicines[index].qty -= value;

  if (medicines[index].qty <= 0) {
    medicines.splice(index, 1);
  }

  saveAndRender();
}

/* ===== EXPORT EXCEL ===== */
function exportExcel() {
  let csv = "Medicine,MFG,EXP,Remaining Days,Quantity\n";
  medicines.forEach(m => {
    csv += `${m.name},${m.mfg},${m.exp},${getRemainingDays(m.exp)},${m.qty}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "medicine_stock.csv";
  a.click();
}

/* ===== EXPORT PDF ===== */
function exportPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text("Medicine Stock Report", 14, 15);

  let y = 25;
  medicines.forEach(m => {
    doc.text(
      `${m.name} | EXP:${m.exp} | Days:${getRemainingDays(m.exp)} | Qty:${m.qty}`,
      14,
      y
    );
    y += 8;
  });

  doc.save("medicine_stock.pdf");
}

/* ===== STORAGE ===== */
function saveAndRender() {
  localStorage.setItem("medicines", JSON.stringify(medicines));
  renderTable();
}

/* ===== TABLE ===== */
function renderTable(filteredList = medicines) {
  const table = document.getElementById("medicineTable");
  table.innerHTML = "";

  filteredList.forEach((medicine, index) => {
    const remainingDays = getRemainingDays(medicine.exp);

    let colorClass = "safe";
    if (remainingDays <= 0) colorClass = "expired";
    else if (remainingDays <= 30) colorClass = "critical";
    else if (remainingDays <= 90) colorClass = "warning";

    const row = document.createElement("tr");
    row.className = colorClass;

    row.innerHTML = `
      <td>${medicine.name}</td>
      <td>${medicine.mfg}</td>
      <td>${medicine.exp}</td>
      <td>${remainingDays > 0 ? remainingDays + " days" : "Expired"}</td>

      <td class="qty-cell">
        <button onclick="changeQty(${index}, -1)">−</button>
        <span class="qty">${medicine.qty}</span>
        <button onclick="changeQty(${index}, 1)">+</button>

        <input type="number"
               min="1"
               placeholder="Qty"
               class="bulk-input"
               id="bulk-${index}">

        <button class="bulk-btn"
                onclick="removeBulk(${index})">
          Remove
        </button>
      </td>
    `;

    table.appendChild(row);
  });
}
/* ===== UI ===== */
function toggleAddForm() {
  addForm.classList.toggle("hidden");
}

function clearAddForm() {
  addName.value = "";
  mfgDate.value = "";
  expDate.value = "";
  quantity.value = "";
}