Moralis.start({ serverUrl: "https://9wqwwntdrdzo.moralishost.com:2053/server", 
                appId: "5pJOB2hAiXbOPHBlMuq8Sf6Q6jQlbuhobq9diG4c" });
const CONTRACT_ADDRESS = "0x67b3c29A193334A6bC034843304A5b041D027d99";

async function init(){
    let currentUser = Moralis.User.current();
    if(!currentUser){
        window.location.pathname = returnStr();
        return;
    }
    web3 = await Moralis.Web3.enable();
    const accounts = await web3.eth.getAccounts();
    const urlParams = new URLSearchParams(window.location.search);
    const itemId = urlParams.get("itemId");
    document.getElementById("name_input").value = "Starter Pet";
    document.getElementById("address_input").value = accounts[0];
}

function returnStr(){
    return "/index.html?login=true";
}

async function getpet(){
    if (document.getElementById("button").innerHTML == "Home"){
        window.location.href = returnStr();
        return;
    }
    if (document.getElementById("button").innerHTML != "Please Wait"){
        web3 = await Moralis.Web3.enable();
        const contract = await new web3.eth.Contract(contractAbi, CONTRACT_ADDRESS);
        const name = document.getElementById("name_input").value;
        const address = document.getElementById("address_input").value;
       
        document.getElementById("button").innerHTML = "Please Wait";
        
        contract.methods.createHogePet(address, name)
            .send({from: address, value: 0})
            .on('error', (error, receipt) => {
                console.log('Error - Receipt', error, receipt);
                document.getElementById("button").innerHTML = "Error";
            })
            .on("receipt", function (receipt) {
                    // needs to check for require()
                    console.log(receipt);
                    alert("Incu-Chamber Ready! \n\nPlease wait a few blocks to be mined for it to show up in your invertory.");
                    document.getElementById("button").innerHTML = "Home";
            });
    }
}


document.getElementById("button").onclick = getpet;

init();