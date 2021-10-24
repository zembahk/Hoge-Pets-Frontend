Moralis.start({ serverUrl: "https://9wqwwntdrdzo.moralishost.com:2053/server", 
                appId: "5pJOB2hAiXbOPHBlMuq8Sf6Q6jQlbuhobq9diG4c" });
const CONTRACT_ADDRESS = "0x67b3c29A193334A6bC034843304A5b041D027d99";
const CHAIN_NAME = "mumbai"

let currentUser = Moralis.User.current();
if (currentUser){
    Moralis.User.logOut().then(() => {  
        currentUser = Moralis.User.current();  
        alert("Logged Out")
        window.location.pathname = "/index.html";
    });
}

let col = document.createElement("div");
col.className = "col col-md-4";
col.innerHTML = `<a href="./index.html" class="btn btn-primary">Home</a><p></p>`;
document.getElementById("button").appendChild(col);