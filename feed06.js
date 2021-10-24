Moralis.start({ serverUrl: "https://9wqwwntdrdzo.moralishost.com:2053/server", 
                appId: "5pJOB2hAiXbOPHBlMuq8Sf6Q6jQlbuhobq9diG4c" });
const CONTRACT_ADDRESS = "0x67b3c29A193334A6bC034843304A5b041D027d99";
const CHAIN_NAME = "mumbai"

async function init(){
    let currentUser = Moralis.User.current();
    if(!currentUser){
        window.location.pathname = returnStr();
        return;
    }
    feed();
    
}

function returnStr(){
    return "/index.html?login=true";
}

async function loadButton(){
    alert("Pet Fed!");
    document.getElementById("button").innerHTML = "Home";
    window.location.href = returnStr();
}

async function feed(){
    if (document.getElementById("button").innerHTML == "Home" ||
    document.getElementById("button").innerHTML == "Error - Go Home"){
        window.location.href = returnStr();
        return;
    }
    if (document.getElementById("button").innerHTML != "Please Wait"){

        const urlParams = new URLSearchParams(window.location.search);
        const token_id = urlParams.get("token_id");
        const pet_id = urlParams.get("pet_id");
        document.getElementById("button").innerHTML = "Please Wait";
        switch (token_id) {
            case '16':
                sendTx(0x1000, pet_id);
                break;
            case '17':
                sendTx(0x1001, pet_id);
                break;
            case '18':
                sendTx(0x1002, pet_id);
                break;
            case '19':
                sendTx(0x1003, pet_id);
                break;
            default:
                alert("Pet can not be fed any more.");
                document.getElementById("button").innerHTML = "Home";
                window.location.href = returnStr();
                break;
        }
    }
}

async function sendTx(food, pet_id){
    web3 = await Moralis.Web3.enable();
    const contract = new web3.eth.Contract(contractAbi, CONTRACT_ADDRESS);
    const address = Moralis.User.current().attributes.ethAddress;
    const options = { address: CONTRACT_ADDRESS, token_id: food, chain: CHAIN_NAME};
    const tokenIdOwners= await Moralis.Web3API.token.getTokenIdOwners(options);
    const found = tokenIdOwners.result.find(element => element.owner_of == address);
    console.log(found);
    if (found && found.amount > 0){
        contract.methods.feed(address, food, pet_id).send({from: address, value: 0})
        .on('transactionHash', (tx) => {
            console.log('transactionHash', tx)
        })
        .on('error', (error, receipt) => {
            console.log('Error - Receipt', error, receipt);
            document.getElementById("button").innerHTML = "Error - Go Home";
        })
        .on("receipt", function(receipt){ loadButton(); });
    } else {
        alert("No Food Found");
        document.getElementById("button").innerHTML = "Error - Go Home";
    }
}

document.getElementById("button").onclick = feed;

init();
