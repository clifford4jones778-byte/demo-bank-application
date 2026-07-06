import {
    auth,
    db,
    ref,
    set,
    get
} from "./firebase.js";

import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

/* =====================================
   MODERN POPUP MESSAGE
===================================== */

function showMessage(title, message, type = "success") {

    let modal = document.getElementById("messageModal");

    if (!modal) {

        modal = document.createElement("div");

        modal.id = "messageModal";

        modal.innerHTML = `
            <div class="popup-overlay">
                <div class="popup-box">

                    <div class="popup-header">

                        <h2 id="popupTitle"></h2>

                        <button id="popupClose">&times;</button>

                    </div>

                    <div id="popupMessage"></div>

                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const style = document.createElement("style");

        style.innerHTML = `

        .popup-overlay{

            position:fixed;
            inset:0;
            background:rgba(0,0,0,.45);
            display:flex;
            justify-content:center;
            align-items:center;
            z-index:999999;

        }

        .popup-box{

            width:92%;
            max-width:380px;
            background:#fff;
            border-radius:18px;
            overflow:hidden;
            animation:popup .25s ease;

        }

        .popup-header{

            display:flex;
            justify-content:space-between;
            align-items:center;
            padding:18px 20px;
            background:#0d6efd;
            color:#fff;

        }

        #popupClose{

            border:none;
            background:none;
            color:#fff;
            font-size:28px;
            cursor:pointer;

        }

        #popupMessage{

            padding:25px 20px;
            line-height:1.7;
            color:#444;

        }

        @keyframes popup{

            from{

                transform:scale(.85);
                opacity:0;

            }

            to{

                transform:scale(1);
                opacity:1;

            }

        }

        `;

        document.head.appendChild(style);

    }

    document.getElementById("popupTitle").textContent = title;

    document.getElementById("popupMessage").innerHTML = message;

    document.getElementById("popupClose").onclick = function(){

        modal.remove();

    };

}

/* =====================================
   LOGIN
===================================== */

const loginForm = document.getElementById("loginForm");

if(loginForm){

    loginForm.addEventListener("submit",async function(e){

        e.preventDefault();

        const email =
        document.getElementById("username").value.trim();

        const password =
        document.getElementById("password").value;

        if(email==="" || password===""){

            showMessage(

                "Login Failed",

                "Please enter your email and password.",

                "error"

            );

            return;

        }

        try{

            const userCredential =

            await signInWithEmailAndPassword(

                auth,

                email,

                password

            );

            localStorage.setItem(

                "uid",

                userCredential.user.uid

            );

            window.location.href="pin.html";

        }catch(error){

            showMessage(

                "Login Failed",

                error.message,

                "error"

            );

        }

    });

}

/* =====================================
   FORGOT PASSWORD
===================================== */

const forgotPassword =
document.getElementById("forgotPassword");

if(forgotPassword){

    forgotPassword.addEventListener(

        "click",

        function(e){

            e.preventDefault();

            let email =
            document.getElementById("username").value.trim();

            if(email===""){

                email = prompt(

                    "Enter your registered email address"

                );

            }

            if(!email) return;

            sendPasswordResetEmail(

                auth,

                email

            )

            .then(function(){

                showMessage(

                    "Password Reset",

                    "A password reset email has been sent to:<br><br><b>"+email+"</b>"

                );

            })

            .catch(function(error){

                showMessage(

                    "Reset Failed",

                    error.message,

                    "error"

                );

            });

        }

    );

}
/* =====================================
   REGISTER
===================================== */

const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", async function (e) {

        e.preventDefault();

        const fullname = document.getElementById("fullname").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const pin = document.getElementById("pin").value.trim();

        if (
            fullname === "" ||
            phone === "" ||
            email === "" ||
            password === "" ||
            pin === ""
        ) {

            showMessage(
                "Registration Failed",
                "Please complete all required fields.",
                "error"
            );

            return;

        }

        if (password.length < 6) {

            showMessage(
                "Weak Password",
                "Password must be at least 6 characters.",
                "error"
            );

            return;

        }

        if (!/^\d{4}$/.test(pin)) {

            showMessage(
                "Invalid PIN",
                "PIN must contain exactly 4 digits.",
                "error"
            );

            return;

        }

        try {

            const userCredential =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

            const user = userCredential.user;

            const accountNumber =
                Math.floor(
                    1000000000 +
                    Math.random() * 9000000000
                ).toString();

            const cardNumber =
                "4587" +
                Math.floor(
                    100000000000 +
                    Math.random() * 900000000000
                );

            const cvv =
                Math.floor(
                    100 + Math.random() * 900
                ).toString();

            await set(ref(db, "users/" + user.uid), {

                uid: user.uid,

                fullname: fullname,

                phone: phone,

                email: email,

                balance: 2000000,

                pin: pin,

                accountNumber: accountNumber,

                cardNumber: cardNumber,

                expiry: "12/30",

                cvv: cvv,

                status: "ACTIVE",

                createdAt: new Date().toISOString()

            });

            showMessage(
                "Account Created",
                "Your banking account has been created successfully."
            );

            setTimeout(function () {

                window.location.href = "login.html";

            }, 1500);

        } catch (error) {

            showMessage(
                "Registration Failed",
                error.message,
                "error"
            );

        }

    });

}
/* =====================================
   CREATE USER RECORD
===================================== */

async function createUserRecord(

    user,

    fullName,

    pin

){

    await set(

        ref(

            db,

            "users/"+user.uid

        ),

        {

            uid:user.uid,

            name:fullName,

            email:user.email,

            balance:2000000,

            pin:pin,

            accountNumber:
            Math.floor(

                1000000000+

                Math.random()*9000000000

            ).toString(),

            cardNumber:
            "4587246898541234",

            expiry:"12/30",

            cvv:"456",

            createdAt:
            new Date().toISOString()

        }

    );

}

/* =====================================
   PIN VERIFICATION
===================================== */

const pinForm =
document.getElementById("pinForm");

if(pinForm){

    pinForm.addEventListener(

        "submit",

        async function(e){

            e.preventDefault();

            const enteredPin =
            document.getElementById("pin").value;

            const uid =
            localStorage.getItem("uid");

            try{

                const snapshot =
                await get(

                    ref(

                        db,

                        "users/"+uid

                    )

                );

                if(!snapshot.exists()){

                    showMessage(

                        "PIN Verification",

                        "User account not found.",

                        "error"

                    );

                    return;

                }

                const user =
                snapshot.val();

                if(user.pin!==enteredPin){

                    showMessage(

                        "Incorrect PIN",

                        "The PIN you entered is incorrect.",

                        "error"

                    );

                    return;

                }

                localStorage.setItem(

                    "authenticated",

                    "true"

                );

                window.location.href=
                "dashboard.html";

            }catch(error){

                showMessage(

                    "Verification Failed",

                    error.message,

                    "error"

                );

            }

        }

    );

}
/* =====================================
   SESSION MANAGEMENT
===================================== */

onAuthStateChanged(auth, function(user){

    if(user){

        localStorage.setItem(
            "uid",
            user.uid
        );

    }else{

        localStorage.removeItem("uid");
        localStorage.removeItem("authenticated");

    }

});

/* =====================================
   AUTHENTICATION GUARD
===================================== */

window.requireAuthentication = function(){

    const authenticated =
        localStorage.getItem("authenticated");

    if(authenticated !== "true"){

        window.location.href = "login.html";

    }

};

/* =====================================
   LOGOUT
===================================== */

window.logout = async function(){

    try{

        await signOut(auth);

        localStorage.removeItem("uid");
        localStorage.removeItem("authenticated");

        showMessage(

            "Logged Out",

            "You have been logged out successfully."

        );

        setTimeout(function(){

            window.location.href = "login.html";

        },1000);

    }catch(error){

        showMessage(

            "Logout Failed",

            error.message,

            "error"

        );

    }

};

/* =====================================
   HELPER FUNCTIONS
===================================== */

window.isLoggedIn = function(){

    return auth.currentUser !== null;

};

window.getCurrentUser = function(){

    return auth.currentUser;

};

window.getCurrentUID = function(){

    return localStorage.getItem("uid");

};

/* =====================================
   AUTO CLOSE POPUP (OPTIONAL)
===================================== */

window.closeMessage = function(){

    const modal = document.getElementById("messageModal");

    if(modal){

        modal.remove();

    }

};
/* =====================================
   LOAD PROFILE INFORMATION
===================================== */

async function loadProfile() {

    const user = auth.currentUser;

    if (!user) return;

    try {

        const snapshot = await get(
            ref(db, "users/" + user.uid)
        );

        if (!snapshot.exists()) return;

        const data = snapshot.val();

        const profileName =
            document.getElementById("profileName");

        if (profileName) {

            profileName.textContent =
                data.fullname || data.name || "Demo User";

        }

        const profileEmail =
            document.getElementById("profileEmail");

        if (profileEmail) {

            profileEmail.textContent =
                data.email || "";

        }

        const profileAccountNumber =
            document.getElementById("profileAccountNumber");

        if (profileAccountNumber) {

            profileAccountNumber.textContent =
                data.accountNumber || "";

        }

    } catch (error) {

        console.error(error);

    }

}

/* Load profile automatically */

onAuthStateChanged(auth, function(user){

    if(user){

        loadProfile();

    }

});
/* =====================================
   PROFILE PHOTO (LOCAL STORAGE)
===================================== */

const avatarContainer =
document.getElementById("avatarContainer");

const photoInput =
document.getElementById("photoInput");

const profilePhoto =
document.getElementById("profilePhoto");

const avatarIcon =
document.getElementById("avatarIcon");

if(avatarContainer){

    // Load saved photo
    const savedPhoto =
    localStorage.getItem("profilePhoto");

    if(savedPhoto){

        profilePhoto.src = savedPhoto;

        profilePhoto.style.display="block";

        avatarIcon.style.display="none";

    }

    avatarContainer.onclick=function(){

        photoInput.click();

    };

}

if(photoInput){

    photoInput.onchange=function(e){

        const file=e.target.files[0];

        if(!file) return;

        if(file.size > 2 * 1024 * 1024){

            showMessage(
                "Image Too Large",
                "Please choose an image smaller than 2 MB.",
                "error"
            );

            return;

        }

        const reader =
        new FileReader();

        reader.onload=function(event){

            const image =
            event.target.result;

            localStorage.setItem(
                "profilePhoto",
                image
            );

            profilePhoto.src=image;

            profilePhoto.style.display="block";

            avatarIcon.style.display="none";

            showMessage(
                "Profile Updated",
                "Your profile picture has been updated successfully."
            );

        };

        reader.readAsDataURL(file);

    };

}
// PIN Pad
const pinInput = document.getElementById("pin");
const dots = document.querySelectorAll(".dot");
const numberButtons = document.querySelectorAll(".num");
const clearBtn = document.getElementById("clear");
const okBtn = document.getElementById("ok");

let pin = "";

function updateDots() {
    dots.forEach((dot, index) => {
        dot.classList.toggle("active", index < pin.length);
    });

    pinInput.value = pin;
}

numberButtons.forEach(button => {
    button.addEventListener("click", () => {

        if (pin.length >= 4) return;

        pin += button.textContent.trim();
        updateDots();

        // Automatically verify after 4 digits
        if (pin.length === 4) {
            setTimeout(() => {
                verifyPin();
            }, 200);
        }
    });
});

clearBtn.addEventListener("click", () => {
    if (pin.length > 0) {
        pin = pin.slice(0, -1);
        updateDots();
    }
});

okBtn.addEventListener("click", verifyPin);

function showPinModal(success, message){

    const modal = document.getElementById("pinModal");
    const icon = document.getElementById("pinIcon");
    const title = document.getElementById("pinTitle");
    const msg = document.getElementById("pinMessage");

    modal.classList.add("show");

    if(success){

        icon.className="pin-icon success";
        icon.innerHTML="✓";

        title.textContent="PIN Verified";
        msg.textContent=message;

        document.getElementById("closeModal").onclick=function(){

            window.location.href="dashboard.html";

        };

    }else{

        icon.className="pin-icon error";
        icon.innerHTML="✕";

        title.textContent="Verification Failed";
        msg.textContent=message;

        document.getElementById("closeModal").onclick=function(){

            modal.classList.remove("show");

            pin="";
            updateDots();

        };

    }

}

function verifyPin(){

    const correctPin="1234";

    if(pin===correctPin){

        showPinModal(true,"PIN verification successful.");

    }else{

        showPinModal(false,"Incorrect PIN. Please try again.");

    }

}