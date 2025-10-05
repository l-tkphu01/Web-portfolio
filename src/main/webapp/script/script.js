// ========================== BIẾN TOÀN CỤC ==========================
let selectedFile = null;
let currentWeek = null;

// ========================== KHỞI TẠO SAU KHI LOAD ==========================
document.addEventListener("DOMContentLoaded", async function () {
  initializeEventListeners();
  await loadSubmittedWeeks();
  updateAllStatistics();
});

// ========================== CẬP NHẬT TẤT CẢ THỐNG KÊ ==========================
function updateAllStatistics() {
  const totalWeeks = 12; // Cố định 12 tuần
  let submittedWeeks = 0;

  // Đếm số tuần đã nộp (có badge "Đã nộp")
  for (let i = 1; i <= 12; i++) {
    const badge = document.getElementById(`week-${i}-badge`);
    if (badge && badge.classList.contains("badge-submitted")) {
      submittedWeeks++;
    }
  }

  const notSubmittedWeeks = totalWeeks - submittedWeeks;

  // Cập nhật các số liệu
  const totalWeeksElement = document.getElementById("totalWeeks");
  const submittedEl = document.getElementById("submittedCount");
  const notSubmittedEl = document.getElementById("notSubmittedCount");
  const rateEl = document.getElementById("submissionRate");

  if (totalWeeksElement) totalWeeksElement.textContent = totalWeeks;
  if (submittedEl) submittedEl.textContent = submittedWeeks;
  if (notSubmittedEl) notSubmittedEl.textContent = notSubmittedWeeks;

  // Cập nhật phần trăm
  if (rateEl) {
    const percent = totalWeeks > 0 ? Math.round((submittedWeeks / totalWeeks) * 100) : 0;
    rateEl.textContent = `${percent}%`;
  }
}

// ========================== SỰ KIỆN KHỞI TẠO ==========================
function initializeEventListeners() {
  // File input
  const fileInput = document.getElementById("fileInput");
  if (fileInput) {
    fileInput.addEventListener("change", (e) => {
      if (e.target.files.length > 0) handleFileSelect(e.target.files[0]);
    });
  }

  // Filter menu
  const filterBtn = document.getElementById("filterBtn");
  const filterMenu = document.querySelector(".filter-menu");
  if (filterBtn && filterMenu) {
    filterBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      filterMenu.classList.toggle("hidden");
      const sortMenu = document.querySelector(".sort-menu");
      if (sortMenu) sortMenu.classList.add("hidden");
    });
  }

  // Sort menu
  const sortBtn = document.getElementById("sortBtn");
  const sortMenu = document.querySelector(".sort-menu");
  if (sortBtn && sortMenu) {
    sortBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      sortMenu.classList.toggle("hidden");
      const filterMenu = document.querySelector(".filter-menu");
      if (filterMenu) filterMenu.classList.add("hidden");
    });
  }

  // Click ngoài -> đóng menu
  document.addEventListener("click", (e) => {
    if (filterMenu && !filterMenu.contains(e.target) && e.target !== filterBtn)
      filterMenu.classList.add("hidden");
    if (sortMenu && !sortMenu.contains(e.target) && e.target !== sortBtn)
      sortMenu.classList.add("hidden");
  });

  // Modal backdrop
  const modal = document.getElementById("submissionModal");
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  }
}

// ========================== MODAL FUNCTIONS ==========================
function openSubmissionModal(weekNumber) {
  currentWeek = weekNumber;
  const modal = document.getElementById("submissionModal");
  const weekLabel = document.getElementById("modalWeekLabel");
  const weekNumberInput = document.getElementById("weekNumber");

  if (modal) modal.classList.remove("hidden");
  if (weekLabel) weekLabel.textContent = `Tuần ${weekNumber} - ${getWeekTitle(weekNumber)}`;
  if (weekNumberInput) weekNumberInput.value = weekNumber;
}

function closeModal() {
  const modal = document.getElementById("submissionModal");
  if (modal) modal.classList.add("hidden");
  resetForm();
}

function getWeekTitle(num) {
  const titles = {
    1: "Giới thiệu môn học (odoo)",
    2: "MVC (Model–View–Controller)",
    3: "Working with NetBeans and Apache Tomcat",
    4: "A crash course in HTML5 and CSS3",
    5: "How to develop servlets",
    6: "How to develop JSPs",
    7: "How to work with sessions and cookies",
    8: "How to use EL (Expression Language)",
    9: "How to use JSTL",
    10: "How to use a MySQL database",
    11: "How to use JDBC to work with a database",
    12: "How to use JPA to work with a database",
  };
  return titles[num] || "Bài tập";
}

// ========================== DRAG & DROP ==========================
function handleDragOver(e) {
  e.preventDefault();
  document.getElementById("dropZone")?.classList.add("dragover");
}
function handleDragLeave(e) {
  e.preventDefault();
  document.getElementById("dropZone")?.classList.remove("dragover");
}
function handleDrop(e) {
  e.preventDefault();
  const dropZone = document.getElementById("dropZone");
  dropZone?.classList.remove("dragover");
  if (e.dataTransfer.files.length > 0) handleFileSelect(e.dataTransfer.files[0]);
}
function handleFileSelect(file) {
  if (file.size > 10 * 1024 * 1024) {
    alert("File quá lớn! Giới hạn 10MB.");
    return;
  }
  selectedFile = file;
  const fileStatus = document.getElementById("fileStatus");
  if (fileStatus) {
    fileStatus.textContent = `✅ Đã chọn: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
  }
}

// ========================== SUBMIT ASSIGNMENT ==========================
async function submitAssignment() {
  const form = document.getElementById("submissionForm");
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const fileInput = document.getElementById("fileInput");
  const fileToSend = fileInput?.files[0] || null;

  const weekNumber = parseInt(document.getElementById("weekNumber")?.value || 0);
  const studentName = document.getElementById("studentName").value.trim();
  const studentId = document.getElementById("studentId").value.trim();
  const exerciseName = document.getElementById("exerciseName").value.trim();
  const note = document.getElementById("note").value.trim();
  const projectLink = document.getElementById("projectLink").value.trim();

  if (!exerciseName) {
    alert("⚠️ Vui lòng nhập tiêu đề bài nộp!");
    return;
  }

  if (!fileToSend && !projectLink) {
    alert("⚠️ Vui lòng chọn file hoặc nhập link project!");
    return;
  }

  const formData = new FormData();
  formData.append("student_name", studentName);
  formData.append("student_id", studentId);
  formData.append("exercise_name", exerciseName);
  formData.append("week_number", weekNumber);
  formData.append("note", note);
  formData.append("project_link", projectLink);
  if (fileToSend) formData.append("file", fileToSend);

  const API_BASE = "https://submission-backend-2.onrender.com";

  try {
    document.body.style.cursor = "wait";

    const response = await fetch(`${API_BASE}/submit`, { method: "POST", body: formData });

    document.body.style.cursor = "default";

    // Kiểm tra nếu response OK (200-299)
    if (response.ok) {
      let result;
      try {
        result = await response.json();
      } catch (jsonErr) {
        // Nếu không parse được JSON, vẫn coi như thành công
        console.warn("Không thể parse JSON response, nhưng status OK");
        result = { success: true, message: "Nộp bài thành công!" };
      }

      showSuccessToast("✅ " + (result.message || "Nộp bài thành công!"));
      closeModal();
      resetForm();

      const badge = document.getElementById(`week-${weekNumber}-badge`);
      if (badge) {
        badge.textContent = "Đã nộp";
        badge.className = "badge badge-submitted";
      }

      await loadSubmittedWeeks();
      updateAllStatistics();
    } else {
      // Response không OK
      let result;
      try {
        result = await response.json();
      } catch (jsonErr) {
        result = { message: `Lỗi HTTP ${response.status}` };
      }
      alert("❌ Lỗi khi nộp bài: " + (result.message || "Không rõ lỗi."));
    }
  } catch (err) {
    document.body.style.cursor = "default";
    console.error("❌ Fetch error:", err);
    alert("⚠️ Không thể kết nối tới server!");
  }
}

// ========================== LOAD DỮ LIỆU TỪ BACKEND ==========================
async function loadSubmittedWeeks() {
  try {
    const API_BASE = "https://submission-backend-2.onrender.com";
    const res = await fetch(`${API_BASE}/submissions`);
    const data = await res.json();

    if (data.success && Array.isArray(data.submissions)) {
      const grouped = {};
      data.submissions.forEach((sub) => {
        if (!grouped[sub.week_number]) grouped[sub.week_number] = [];
        grouped[sub.week_number].push(sub);
      });

      Object.keys(grouped).forEach((week) => {
        const badge = document.getElementById(`week-${week}-badge`);
        if (badge) {
          badge.textContent = "Đã nộp";
          badge.className = "badge badge-submitted";
        }

        const card = document.querySelector(`#week-${week}-card .submission-list`);
        if (card) {
          card.innerHTML = "";
          grouped[week].forEach((sub) => {
            const wrapper = document.createElement("div");
            wrapper.className = "submission-item";

            const titleDiv = document.createElement("div");
            titleDiv.className = "submission-title";
            titleDiv.style.fontWeight = "bold";
            titleDiv.style.marginBottom = "8px";
            titleDiv.textContent = `📘 ${sub.exercise_name}`;
            wrapper.appendChild(titleDiv);

            const btnContainer = document.createElement("div");
            btnContainer.style.display = "flex";
            btnContainer.style.gap = "8px";
            btnContainer.style.flexWrap = "wrap";

            if (sub.file_path) {
              const fileBtn = document.createElement("button");
              fileBtn.className = "view-btn";
              fileBtn.innerHTML = "📄 Xem File";
              fileBtn.onclick = () => window.open(sub.file_path, "_blank");
              btnContainer.appendChild(fileBtn);
            }

            if (sub.project_link) {
              const projectBtn = document.createElement("button");
              projectBtn.className = "view-btn";
              projectBtn.innerHTML = "🌐 Xem Project";
              projectBtn.onclick = () => window.open(sub.project_link, "_blank");
              btnContainer.appendChild(projectBtn);
            }

            const delBtn = document.createElement("button");
            delBtn.className = "delete-btn";
            delBtn.innerHTML = "❌ Xoá";
            delBtn.onclick = () =>
              deleteSpecificSubmission(sub.student_id, sub.week_number, sub.exercise_name);
            btnContainer.appendChild(delBtn);

            wrapper.appendChild(btnContainer);
            card.appendChild(wrapper);
          });
        }
      });

      updateAllStatistics();
    } else {
      console.warn("⚠️ Không có dữ liệu bài nộp nào từ server.");
    }
  } catch (err) {
    console.error("❌ Không thể tải dữ liệu bài nộp:", err);
  }
}

// ========================== XOÁ BÀI NỘP CỤ THỂ ==========================
async function deleteSpecificSubmission(studentId, weekNumber, exerciseName) {
  const API_BASE = "https://submission-backend-2.onrender.com";
  if (!confirm(`🗑 Bạn có chắc muốn xoá bài "${exerciseName}" của tuần ${weekNumber}?`)) return;

  try {
    const res = await fetch(
      `${API_BASE}/submission/${studentId}/${weekNumber}/${encodeURIComponent(exerciseName)}`,
      { method: "DELETE" }
    );
    const data = await res.json();
    if (res.ok && data.success) {
      alert(data.message);
      await loadSubmittedWeeks();

      // Kiểm tra xem tuần này còn bài nộp nào không
      const weekCard = document.querySelector(`#week-${weekNumber}-card .submission-list`);
      if (weekCard && weekCard.children.length === 0) {
        const badge = document.getElementById(`week-${weekNumber}-badge`);
        if (badge) {
          badge.textContent = "Đang mở";
          badge.className = "badge";
        }
      }

      updateAllStatistics();
    } else {
      alert("❌ " + (data.message || "Không thể xoá bài nộp!"));
    }
  } catch (err) {
    console.error("Lỗi khi xoá:", err);
    alert("⚠️ Không thể kết nối tới server!");
  }
}

// ========================== RESET FORM ==========================
function resetForm() {
  const form = document.getElementById("submissionForm");
  const fileStatus = document.getElementById("fileStatus");
  if (form) form.reset();
  if (fileStatus) fileStatus.textContent = "";
  selectedFile = null;
  currentWeek = null;
}

// ========================== TOAST ==========================
function showSuccessToast(message = "Nộp bài thành công!") {
  const toast = document.getElementById("successToast");
  const toastMsg = document.getElementById("toastMsg");
  if (toast && toastMsg) {
    toastMsg.textContent = message;
    toast.classList.remove("hidden");
    setTimeout(() => toast.classList.add("hidden"), 3000);
  }
}

// ========================== LỌC / SẮP XẾP ==========================
function filterByStatus(status) {
  const cards = document.querySelectorAll(".week-card");
  cards.forEach((card) => {
    const badge = card.querySelector("span[id$='-badge']");
    if (!badge) return;
    const isSubmitted = badge.classList.contains("badge-submitted");
    if (status === "all") card.classList.remove("hidden");
    else if (status === "submitted" && isSubmitted) card.classList.remove("hidden");
    else if (status === "not-submitted" && !isSubmitted) card.classList.remove("hidden");
    else card.classList.add("hidden");
  });
  document.querySelector(".filter-menu")?.classList.add("hidden");
}

function filterByWeek(week) {
  const cards = document.querySelectorAll(".week-card");
  cards.forEach((card) => {
    const weekNum = card.getAttribute("data-week");
    if (week === "all" || weekNum === week) card.classList.remove("hidden");
    else card.classList.add("hidden");
  });
}

function sortBy(type) {
  const container = document.querySelector(".weeks-grid");
  const weekCards = Array.from(container.querySelectorAll(".week-card"));
  let sortedCards;

  switch (type) {
    case "weekAsc":
      sortedCards = weekCards.sort((a, b) => getWeekNumber(a) - getWeekNumber(b));
      break;
    case "weekDesc":
      sortedCards = weekCards.sort((a, b) => getWeekNumber(b) - getWeekNumber(a));
      break;
    case "statusSubmittedFirst":
      sortedCards = weekCards.sort((a, b) => isSubmitted(b) - isSubmitted(a));
      break;
    case "statusNotSubmittedFirst":
      sortedCards = weekCards.sort((a, b) => isSubmitted(a) - isSubmitted(b));
      break;
    default:
      sortedCards = weekCards;
  }

  container.innerHTML = "";
  sortedCards.forEach((card) => container.appendChild(card));
  document.querySelector(".sort-menu")?.classList.add("hidden");
}

function getWeekNumber(card) {
  const weekNum = card.getAttribute("data-week");
  return weekNum ? parseInt(weekNum) : 0;
}

function isSubmitted(card) {
  const badge = card.querySelector("span[id$='-badge']");
  return badge && badge.classList.contains("badge-submitted");
}