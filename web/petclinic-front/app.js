const API_URL = "http://localhost:10000/reservations";

// HTML 요소 가져오기
const reservationForm = document.querySelector("#reservationForm");
const reservationTableBody = document.querySelector(
    "#reservationTableBody"
);

const reservationIdInput = document.querySelector("#reservationId");
const petNameInput = document.querySelector("#petName");
const ownerNameInput = document.querySelector("#ownerName");
const animalTypeInput = document.querySelector("#animalType");
const doctorNameInput = document.querySelector("#doctorName");
const reservationDateInput = document.querySelector(
    "#reservationDate"
);
const statusInput = document.querySelector("#status");
const priceInput = document.querySelector("#price");

const cancelEditButton = document.querySelector(
    "#cancelEditButton"
);

const reloadButton = document.querySelector("#reloadButton");


/*
 * 전체 예약 조회
 * GET /reservations
 */
async function loadReservations() {

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("예약 목록을 불러오지 못했습니다.");
        }

        const reservations = await response.json();

        showReservations(reservations);

    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}


/*
 * 조회 결과를 테이블에 출력
 */
function showReservations(reservations) {

    reservationTableBody.innerHTML = "";

    if (!reservations || reservations.length === 0) {

        reservationTableBody.innerHTML = `
            <tr>
                <td colspan="9">
                    등록된 예약이 없습니다.
                </td>
            </tr>
        `;

        return;
    }

    reservations.forEach(function (reservation) {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${reservation.id}</td>
            <td>${escapeHtml(reservation.petName)}</td>
            <td>${escapeHtml(reservation.ownerName)}</td>
            <td>${escapeHtml(reservation.animalType)}</td>
            <td>${escapeHtml(reservation.doctorName)}</td>
            <td>${reservation.reservationDate ?? ""}</td>
            <td>${escapeHtml(reservation.status)}</td>
            <td>
                ${Number(reservation.price).toLocaleString()}원
            </td>
            <td>-</td>
        `;

        reservationTableBody.appendChild(row);
    });
}


/*
 * 예약 등록
 * POST /reservations
 */
reservationForm.addEventListener("submit", async function (event) {

    // 기본 새로고침 막기
    event.preventDefault();

    const reservation = {
        petName: petNameInput.value.trim(),
        ownerName: ownerNameInput.value.trim(),
        animalType: animalTypeInput.value,
        doctorName: doctorNameInput.value.trim(),
        reservationDate: reservationDateInput.value,
        status: statusInput.value,
        price: Number(priceInput.value)
    };

    try {
        const response = await fetch(API_URL, {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(reservation)
        });

        if (!response.ok) {
            throw new Error("예약 등록에 실패했습니다.");
        }

        // 백엔드에서 영향을 받은 행의 개수를 반환
        const result = await response.json();

        if (result === 1) {
            alert("예약이 등록되었습니다.");

            resetForm();

            // 등록 후 다시 전체 조회
            await loadReservations();

        } else {
            alert("예약이 등록되지 않았습니다.");
        }

    } catch (error) {
        console.error(error);
        alert(error.message);
    }
});


/*
 * 입력 폼 초기화
 */
function resetForm() {

    reservationForm.reset();

    reservationIdInput.value = "";
}


/*
 * 취소 버튼
 */
cancelEditButton.addEventListener("click", function () {

    resetForm();
});


/*
 * 전체 조회 버튼
 */
reloadButton.addEventListener("click", function () {

    loadReservations();
});


/*
 * HTML 태그가 데이터로 들어오는 것을 방지
 */
function escapeHtml(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/*
 * 페이지를 처음 열면 자동 전체 조회
 */
loadReservations();