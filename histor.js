import {
    auth,
    db,
    ref,
    onValue
} from "./firebase.js";

let uid = "";

/* ===========================
   AUTH CHECK
=========================== */

auth.onAuthStateChanged(function(user){

    if(!user){

        window.location.href = "login.html";

        return;

    }

    uid = user.uid;

    loadHistory();

});

/* ===========================
   CURRENCY FORMAT
=========================== */

function formatMoney(amount){

    return "$" + Number(amount).toLocaleString("en-US",{

        minimumFractionDigits:2,

        maximumFractionDigits:2

    });

}

/* ===========================
   LOAD HISTORY
=========================== */

function loadHistory(){

    const historyList =
        document.getElementById("historyList");

    if(!historyList) return;

    onValue(

        ref(db,"transactions/"+uid),

        function(snapshot){

            historyList.innerHTML="";

            if(!snapshot.exists()){

                historyList.innerHTML=`

                <div class="empty">

                    No Transaction History

                </div>

                `;

                return;

            }

            const data = snapshot.val();

            const transactions =
                Object.values(data).reverse();

            transactions.forEach(function(tx){

                const amount =
                    Number(tx.amount);

                historyList.innerHTML += `

                <div class="transactionItem">

                    <div>

                        <h4>${tx.type}</h4>

                        <p>${tx.description}</p>

                        <small>

                        ${new Date(tx.createdAt).toLocaleString()}

                        </small>

                    </div>

                    <div style="text-align:right;">

                        <div class="amount ${amount>=0?"credit":"debit"}">

                        ${amount>=0?"+":"-"}

                        ${formatMoney(Math.abs(amount))}

                        </div>

                        <small style="color:green">

                        ${tx.status}

                        </small>

                    </div>

                </div>

                `;

            });

        }

    );

}

/* ===========================
   SEARCH HISTORY
=========================== */

window.searchTransactions = function(keyword){

    keyword = keyword.toLowerCase();

    const cards =
        document.querySelectorAll(".transactionItem");

    cards.forEach(function(card){

        if(

            card.innerText
            .toLowerCase()
            .includes(keyword)

        ){

            card.style.display="flex";

        }else{

            card.style.display="none";

        }

    });

};

/* ===========================
   EXPORT JSON
=========================== */

window.exportHistory = function(){

    onValue(

        ref(db,"transactions/"+uid),

        function(snapshot){

            if(!snapshot.exists()){

                alert("No Transactions");

                return;

            }

            const data = JSON.stringify(

                snapshot.val(),

                null,

                2

            );

            const blob = new Blob(

                [data],

                {

                    type:"application/json"

                }

            );

            const url =
                URL.createObjectURL(blob);

            const a =
                document.createElement("a");

            a.href = url;

            a.download = "TransactionHistory.json";

            a.click();

        },

        {

            onlyOnce:true

        }

    );

};

/* ===========================
   DELETE HISTORY (DEMO ONLY)
=========================== */

window.clearHistory = function(){

    alert(

        "History deletion has been disabled because transactions are stored in Firebase."

    );

};