Moralis.start({ serverUrl: "https://9wqwwntdrdzo.moralishost.com:2053/server", 
                appId: "5pJOB2hAiXbOPHBlMuq8Sf6Q6jQlbuhobq9diG4c" });
const CONTRACT_ADDRESS = "0x67b3c29A193334A6bC034843304A5b041D027d99";

async function init(){
    let currentUser = Moralis.User.current();
    if(!currentUser){
        window.location.pathname = "/index.html";
        return;
    }    
    grow();
}

function loadButton(){
    alert("Pet Grown!");
    document.getElementById("button").innerHTML = "Home";
    //window.location.href = './index.html';
}

async function grow(){
    if (document.getElementById("button").innerHTML == "Home"||
    document.getElementById("button").innerHTML == "Error - Go Home"){
        window.location.href = './index.html';
        return;
    }
    if (document.getElementById("button").innerHTML != "Please Wait"){
    
        const urlParams = new URLSearchParams(window.location.search);
        //const token_id = urlParams.get("token_id");
        const pet_id = urlParams.get("pet_id");

        web3 = await Moralis.Web3.enable();
        const contract = new web3.eth.Contract(contractAbi, CONTRACT_ADDRESS);
        const address = Moralis.User.current().attributes.ethAddress;
        
        document.getElementById("button").innerHTML = "Please Wait";
        
        contract.methods.grow(address, pet_id)
        .send({from: address, value: 0})
        .on('transactionHash', (tx) => {
            console.log('transactionHash', tx)
        })
        .on('error', (error, receipt) => {
            console.log('Participate Error - Receipt', error, receipt);
            document.getElementById("button").innerHTML = "Error - Go Home";
        })
        .on("receipt", function(receipt){ loadButton(); });
    }
}

document.getElementById("button").onclick = grow;

init();
