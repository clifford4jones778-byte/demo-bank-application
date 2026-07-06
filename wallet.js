import {
    auth,
    db,
    ref,
    get,
    set,
    push,
    update,
    onValue
} from "./firebase.js";

let uid = "";
let balance = 0;

auth.onAuthStateChanged(async (user) => {

    if (!user) {

        window.location.href = "login.html";
        return;

    }

    uid = user.uid;

    loadBalance();

    loadTransactions();

});

function formatMoney(amount) {

    return "$" + Number(amount).toLocaleString("en-US", {

        minimumFractionDigits:2,
        maximumFractionDigits:2

    });

}

window.formatMoney = formatMoney;

/* ===============================
   LOAD BALANCE & USER INFO
================================ */

async function loadBalance(){

    const snapshot = await get(
        ref(db,"users/"+uid)
    );

    if(!snapshot.exists()) return;

    const user = snapshot.val();

    balance = Number(user.balance || 0);

    const balanceElement =
        document.getElementById("balance");

    if(balanceElement){

        balanceElement.innerHTML =
            formatMoney(balance);

    }

    // Load user's name
    const cardHolder =
        document.getElementById("cardHolder");

    if(cardHolder){

        cardHolder.textContent =
            (user.fullname || user.name || "Demo User").toUpperCase();

    }

    // Welcome message
    const welcomeUser =
        document.getElementById("welcomeUser");

    if(welcomeUser){

        welcomeUser.textContent =
            user.fullname || user.name || "Demo Account";

    }

}
/* ===============================
   SAVE BALANCE
================================ */

async function saveBalance(){

    await update(

        ref(db,"users/"+uid),

        {

            balance:balance

        }

    );

}

/* ===============================
   SAVE TRANSACTION
================================ */

async function saveTransaction(type,amount,description){

    await push(

        ref(db,"transactions/"+uid),

        {

            type,

            amount,

            description,

            status:"Successful",

            demo:true,

            createdAt:new Date().toISOString()

        }

    );

}
/* ===============================
   DEPOSIT
================================ */

window.deposit = async function(amount){

    amount = Number(amount);

    if(isNaN(amount) || amount <= 0){

        alert("Enter a valid amount.");

        return;

    }

    showProcessing();

    try{

        // Reload current balance from Firebase
        await loadBalance();

        // Credit account
        balance += amount;

        // Save updated balance
        await saveBalance();

        // Save transaction
        await saveTransaction(
            "Deposit",
            amount,
            "Funds Deposited"
        );

        // Refresh dashboard
        await loadBalance();
        loadTransactions();

        // Success message
        showDemoAlert(
            "Deposit Successful",
            "Demo Mode: No real money was deposited."
        );

    }catch(error){

        console.error("Deposit Error:", error);

        alert(
            "Deposit Failed\n\n" +
            error.message
        );

    }finally{

        hideProcessing();

    }

};
/* ===============================
   WITHDRAW
================================ */

window.withdraw = async function(amount){

    amount = Number(amount);

    if(isNaN(amount) || amount <= 0){

        alert("Enter a valid amount.");

        return;

    }

    if(amount > balance){

        alert("Insufficient Balance");

        return;

    }

    showProcessing();

    balance -= amount;

    await saveBalance();

    await saveTransaction(

        "Withdrawal",

        -amount,

        "Cash Withdrawal"

    );

    hideProcessing();

    showDemoAlert(

        "Withdrawal Successful",

        "Demo Mode: No real money was withdrawn."

    );

    loadBalance();

    loadTransactions();

};

/* ===============================
   TRANSFER
================================ */

window.transfer = async function(amount,receiver){

    amount = Number(amount);

    if(receiver.trim()===""){

        alert("Enter recipient.");

        return;

    }

    if(isNaN(amount) || amount<=0){

        alert("Invalid Amount");

        return;

    }

    if(amount>balance){

        alert("Insufficient Balance");

        return;

    }

    showProcessing();

    balance -= amount;

    await saveBalance();

    await saveTransaction(

        "Transfer",

        -amount,

        "Transfer to " + receiver

    );

    hideProcessing();

    showDemoAlert(

        "Transfer Successful",

        "Demo Mode: No real transfer occurred."

    );

    loadBalance();

    loadTransactions();

};

/* ===============================
   LOAD TRANSACTIONS
================================ */

async function loadTransactions(){

    const container =
        document.getElementById("transactionList");

    if(!container) return;

    onValue(

        ref(db,"transactions/"+uid),

        function(snapshot){

            container.innerHTML="";

            if(!snapshot.exists()){

                container.innerHTML=`
                <div class="empty">
                    No Transactions Yet
                </div>
                `;

                return;

            }

            const data = snapshot.val();

            const transactions =
                Object.values(data).reverse();

            transactions.slice(0,5).forEach(tx=>{

                container.innerHTML += `

                <div class="transactionItem">

                    <div>

                        <h4>${tx.type}</h4>

                        <p>${tx.description}</p>

                    </div>

                    <div class="amount ${tx.amount>=0?"credit":"debit"}">

                        ${tx.amount>=0?"+":"-"}${formatMoney(Math.abs(tx.amount))}

                    </div>

                </div>

                `;

            });

        }

    );

}

/* ===============================
   PROCESSING MODAL
================================ */

function showProcessing(){

    const modal =
        document.getElementById("processingModal");

    if(modal){

        modal.classList.remove("hidden");

    }

}

function hideProcessing(){

    const modal =
        document.getElementById("processingModal");

    if(modal){

        modal.classList.add("hidden");

    }

}

/* ===============================
   DEMO ALERT
================================ */

function showDemoAlert(title, message){

    const modal = document.getElementById("messageModal");
    const modalTitle = document.getElementById("modalTitle");
    const modalMessage = document.getElementById("modalMessage");

    if(!modal){
        alert(title + "\n\n" + message);
        return;
    }

    modalTitle.textContent = title;
    modalMessage.textContent = message;

    modal.classList.remove("hidden");

}

window.closeMessageModal = function(){

    document
        .getElementById("messageModal")
        .classList.add("hidden");

};