const productList = document.getElementById("productList");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const allBtn = document.getElementById("allBtn");
const message = document.getElementById("message");
const count = document.getElementById("count");

const PRODUCT_API = "https://dummyjson.com/products?limit=30";
const SEARCH_API = "https://dummyjson.com/products/search?q=";

window.addEventListener("DOMContentLoaded", () => {
  loadAllProducts();
});

async function loadAllProducts() {
    const response = await fetch(PRODUCT_API);
    const data = await response.json();

    renderProducts(data.products);
    setMessage("전체 상품 목록을 조회했습니다.", "success");
  } 
    count.textContent = "";
    productList.innerHTML = "";

async function searchProducts() {
  const keyword = searchInput.value.trim();


  if (keyword.length < 2) {
    setMessage("검색어는 2글자 이상 입력하세요.", "error");
    count.textContent = "";
    productList.innerHTML = "";
    return;
  }

  const validPattern = /^[a-zA-Z0-9가-힣\s]+$/;

  if (!validPattern.test(keyword)) {
    setMessage("검색어에는 특수문자를 입력할 수 없습니다.", "error");
    count.textContent = "";
    productList.innerHTML = "";
    return;
  }

  try {

    const response = await fetch(SEARCH_API + encodeURIComponent(keyword));
    const data = await response.json();

    if (data.products.length === 0) {
      setMessage("검색 결과가 없습니다.", "error");
      productList.innerHTML = "";
      return;
    }

    renderProducts(data.products);
    setMessage("검색이 완료되었습니다.", "success");
  } catch (error) {
    setMessage("상품 검색 중 오류가 발생했습니다.", "error");
    count.textContent = "";
    productList.innerHTML = "";
  }
}

function renderProducts(products) {
  productList.innerHTML = "";

  products.forEach((product) => {
    const stockClass = product.stock < 10 ? "stock-low" : "stock-normal";
    const card = document.createElement("div");
    card.className = "product-card";

    card.innerHTML = `
      <img src="${product.thumbnail}" alt="${product.title}">
      <h3>${product.title}</h3>
      <p>카테고리: ${product.category}</p>
      <p>가격: $${product.price}</p>
      <p>할인율: ${product.discountPercentage}%</p>
      <p>평점: ${product.rating}</p>
    `;

    productList.appendChild(card);
  });
}

function setMessage(text, className) {
  message.textContent = text;
  message.className = className;
}

searchBtn.addEventListener("click", searchProducts);

allBtn.addEventListener("click", () => {
  searchInput.value = "";
  loadAllProducts();
});
