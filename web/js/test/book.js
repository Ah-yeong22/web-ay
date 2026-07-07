const keywordInput = document.getElementById("keyword");
const searchBtn = document.getElementById("searchBtn");
const message = document.getElementById("message");
const bookList = document.getElementById("bookList");

function showMessage(text) {
  message.textContent = text;
}

function clearBooks() {
  bookList.innerHTML = "";
}

function searchBooks() {
  const keyword = keywordInput.value.trim();
  const validPattern = /^[가-힣a-zA-Z0-9\s]+$/;

  showMessage("");
  clearBooks();

  if (keyword === "") {
    showMessage("검색어를 입력하세요");
    return;
  }

  if (keyword.length < 2) {
    showMessage("검색어는 2자 이상 입력하세요");
    return;
  }

  if (!validPattern.test(keyword)) {
    showMessage("한글, 영어, 숫자, 공백만 허용됩니다");
    return;
  }

  fetch(
    `https://openlibrary.org/search.json?title=${encodeURIComponent(keyword)}`
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error("API 오류");
      }

      return response.json();
    })
    .then((data) => {
      const books = data.docs.slice(0, 12);

      if (books.length === 0) {
        showMessage("검색 결과가 없습니다");
        return;
      }

      bookList.innerHTML = books
        .map((book) => {
          const authors = book.author_name
            ? book.author_name.slice(0, 3).join(", ")
            : "정보 없음";

          const publishers = book.publisher
            ? book.publisher.slice(0, 2).join(", ")
            : "정보 없음";

          const publishYear = book.first_publish_year || "정보 없음";

          return `
            <article class="book-card">
              <h2>${book.title || "제목 정보 없음"}</h2>
              <p><span class="label">저자:</span> ${authors}</p>
              <p><span class="label">최초 출판연도:</span> ${publishYear}</p>
              <p><span class="label">출판사:</span> ${publishers}</p>
            </article>
          `;
        })
        .join("");
    })
    .catch(() => {
      showMessage("도서 정보를 불러오지 못했습니다");
    });
}

searchBtn.addEventListener("click", searchBooks);

keywordInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    searchBooks();
  }
});