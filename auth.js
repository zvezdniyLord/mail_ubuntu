const loginForm = document.getElementById('loginForm');
const URL = 'https://devsanya.ru/api';
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const response = await fetch(`${URL}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        }
    });
    if(response.ok) {
        const data = response.json();
        console.log(data);
    } else {
        console.error("error");
    }
});
