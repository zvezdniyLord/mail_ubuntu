const URL = 'https://devsanya.ru/api'
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const userData = {
        email: formData.get('email'),
        full_name: formData.get('full_name'),
        password: formData.get('password'),
        position: formData.get('position'),
        company: formData.get('company'),
        industry: formData.get('industry'),
        city: formData.get('city'),
        phone: formData.get('phone'),
    };

    try {
        const response = await fetch(`${URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        const result = await response.json();

        if (response.ok) {
            alert('Регистрация прошла успешно!');
            window.location.href = '/login.html';
        } else {
            alert(`Ошибка: ${result.error}`);
        }
    } catch (error) {
        console.error('Ошибка при регистрации:', error);
        alert('Произошла ошибка при регистрации. Попробуйте позже.');
    }
});
