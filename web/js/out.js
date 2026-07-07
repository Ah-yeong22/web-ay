function hello() {
    alert('안녕하세요');
}

let btn = document.getElementsByid("btn");

btn.addEventListener("click",() => {alert("하이")});