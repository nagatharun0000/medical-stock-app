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
    m.exp ===