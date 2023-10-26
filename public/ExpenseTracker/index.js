async function addNewExpense(event) {
  event.preventDefault();

  // Client-side validation
  const expenseAmount = event.target.expenseamount.value;
  const description = event.target.description.value;
  const category = event.target.category.value;

  if (!expenseAmount || !description || !category) {
    // Display validation error to the user
    alert("Please fill out all fields.");
    return;
  }

  const expenseDetails = {
    expenseAmount,
    description,
    category,
  };

  console.log(expenseDetails);

  try {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      "http://localhost:5000/expense/addExpense",
      expenseDetails,
      { headers: { Authorization: token } }
    );

    if (response.data.success) {
      addNewExpenseToUI(response.data.expense);
      event.target.reset(); // Reset the form
    } else {
      // Handle API error and display user-friendly message
      alert("Failed to add expense. Please try again later.");
    }
  } catch (err) {
    console.error(err);
    // Handle network error and display user-friendly message
    alert("An error occurred. Please try again later.");
  }
}

function showPremiumUserMessage() {
  document.getElementById('rzp-button1').style.visibility = "hidden"
  document.getElementById('message').innerHTML = "You are a premium user"
}

function parseJwt (token) {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  return JSON.parse(jsonPayload);
}

window.addEventListener("DOMContentLoaded", async () => {
  try {
    const token = localStorage.getItem("token");
    // const isAdmin = localStorage.getItem("isAdmin");
    const decodedToken = parseJwt(token);
    console.log(decodedToken);
    const isPremiumUser = decodedToken.isPremiumUser
    if(isPremiumUser) {
      showPremiumUserMessage();
      showLeaderBoard();
    }

    const res = await axios.get("http://localhost:5000/expense/getExpenses", {
      headers: { Authorization: token },
    });
    res.data.expenses.forEach((expense) => {
      addNewExpenseToUI(expense);
    });
  } catch (err) {
    console.error(err);
  }
});

function addNewExpenseToUI(expense) {
  const parentElement = document.getElementById("listOfExpenses");
  const expenseElementId = `expense-${expense.id}`;
  const listItem = document.createElement("li");
  listItem.id = expenseElementId;
  listItem.innerHTML = `
      ${expense.expenseAmount} - ${expense.description} - ${expense.category}
      <button onclick="deleteExpense(event, ${expense.id})">Delete Expense</button>
    `;
  parentElement.appendChild(listItem);
}

async function removeExpenseFromUI(expenseId) {
  const expenseElementId = `expense-${expenseId}`;
  const expenseElement = document.getElementById(expenseElementId);
  if (expenseElement) {
    expenseElement.remove();
  }
}


async function deleteExpense(event, expenseId) {
  try {
    const token = localStorage.getItem('token'); // Retrieve the token from localStorage

    if (!token) {
      // Handle the case where the token is missing or not authenticated
      console.error('Authentication token is missing.');
      alert('Authentication token is missing. Please log in.');
      return;
    }

    const response = await axios.delete(
      `http://localhost:5000/expense/deleteExpense/${expenseId}`,
      { headers: { Authorization: token } }
    );

    if (response.status === 200) {
      // Assuming a successful response has a status code of 200
      removeExpenseFromUI(expenseId);
      alert('Expense deleted successfully.');
    } else {
      console.error('Unexpected status code:', response.status);
      alert('Failed to delete expense. Please try again.');
    }
  } catch (err) {
    console.error('An error occurred while deleting the expense:', err);
    alert('An error occurred while deleting the expense. Please try again.');
  }
}


// Add this code within a script tag in your HTML file or in your JavaScript file.

document.getElementById("rzp-button1").onclick = async function (e) {
  try {
    const token = localStorage.getItem("token");
    
    // Step 1: Send a request to create a premium membership order
    const orderResponse = await axios.get(
      "http://localhost:5000/purchase/premiummembership",
      { headers: { Authorization: token } }
    );
    console.log(orderResponse);

    const options = {
      key: orderResponse.data.key_id,
      order_id: orderResponse.data.order.id,
      
      handler: async function (response) {
        console.log(orderResponse.data.key_id);
        console.log(orderResponse.data.order.id);
        try {
          // Step 2: After successful payment, update the transaction status
          const updateResponse = await axios.post(
            "http://localhost:5000/purchase/updatetransactionstatus",
            {
              order_id: options.order_id,
              payment_id: response.razorpay_payment_id,
            },
            { headers: { Authorization: token } }
          );

          if (updateResponse.data.success) {
            // Step 3: If the transaction is successful, update user status
            alert("You are a Premium User Now");
            localStorage.setItem('token', updateResponse.data.token);
            showLeaderBoard();

          } else {
            // If the transaction failed, display an error message
            alert("Transaction failed. Please contact support.");
          }
        } catch (error) {
          console.error(error);
          alert("Transaction failed. Please contact support.");
        }
      },
    };

    const rzpl = new Razorpay(options);
    rzpl.open();
    e.preventDefault();

    rzpl.on("payment.failed", function (response) {
      console.log(response);
      alert("Payment failed. Please try again later.");
    });
  } catch (error) {
    console.error(error);
    alert("Something went wrong. Please try again later.");
  }
};


function showLeaderBoard(){
  const inputElement = document.createElement('input')
  inputElement.type = 'button'
  inputElement.value = 'Show LeaderBoard'
  inputElement.onclick = async() => {
    const token = localStorage.getItem('token')
    const userLeaderBoardArray = await axios.get('http://localhost:5000/premium/showLeaderBoard', { headers: { Authorization: token } } )
    console.log(">>>>>>>>>", userLeaderBoardArray.data); 

    let leaderBoardElem = document.getElementById('leaderboard')
    leaderBoardElem.innerHTML += '<h1> Leader Board </h1>'
    userLeaderBoardArray.data.forEach((userDetails) => {
      leaderBoardElem.innerHTML += `<li>Name - ${userDetails.name} Total Expense - ${userDetails.totalExpenses || 0} </li>`
    })
  }
  document.getElementById("message").appendChild(inputElement)
}

function showError(err){
  document.body.innerHTML += `<div style="color:red;"> ${err}</div>`
}


async function download() {
  try {
      const token = localStorage.getItem('token'); // Retrieve the token from localStorage

      const response = await axios.get('http://localhost:5000/user/download', { headers: { Authorization: token } });

      if (response.status === 200) {
          // The backend is essentially sending a download link
          // which, if opened in the browser, will trigger the file download
          const a = document.createElement("a");
          a.href = response.data.fileUrl;
          a.download = 'myexpense.csv';
          a.click();
      } else {
          throw new Error(response.data.message);
      }
  } catch (err) {
      showError(err);
      console.error(err);
  }
}

document.getElementById("downloadexpense").onclick = download;
