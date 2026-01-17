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

/* ===== QUANTITY CHANGE ===== */
function changeQty(index, value) {
  medicines[index].qty += value;

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
function renderTable(list = medicines) {
  const table = document.getElementById("medicineTable");
  table.innerHTML = "";

  list.forEach((m, index) => {
    const days = getRemainingDays(m.exp);

    let cls = "safe";
    if (days <= 0) cls = "expired";
    else if (days <= 30) cls = "critical";
    else if (days <= 90) cls = "warning";

    table.innerHTML += `
      <tr class="${cls}">
        <td>${m.name}</td>
        <td>${m.mfg}</td>
        <td>${m.exp}</td>
        <td>${days > 0 ? days + " days" : "Expired"}</td>
        <td>
          <button onclick="changeQty(${index}, -1)">−</button>
          <span>${m.qty}</span>
          <button onclick="changeQty(${index}, 1)">+</button>
        </td>
      </tr>
    `;
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