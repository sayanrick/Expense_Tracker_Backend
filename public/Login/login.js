async function login(e) {
    try {
        e.preventDefault();
        const loginDetails = {
            email: e.target.email.value,
            password: e.target.password.value
        }
        console.log(loginDetails);
        const response = await axios.post('http://localhost:5000/user/login', loginDetails);
        if (response.status === 200) {
            alert(response.data.message);
            console.log(response.data);
            localStorage.setItem('token', response.data.token)
            window.location.href = "../ExpenseTracker/index.html"
        } else {
            console.error('Login failed:', response.statusText);
        }
    } catch(err) {
        console.log('Error', err);
        document.body.innerHTML += `<div style="color:red;"> ${err.message} </div>`;
    }
}

function forgotpassword() {
    window.location.href = "../ForgotPassword/index.html"
}