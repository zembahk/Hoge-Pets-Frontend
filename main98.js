Moralis.start({ serverUrl: "https://9wqwwntdrdzo.moralishost.com:2053/server", 
                appId: "5pJOB2hAiXbOPHBlMuq8Sf6Q6jQlbuhobq9diG4c" });
const CONTRACT_ADDRESS = "0x67b3c29A193334A6bC034843304A5b041D027d99";

function fetchItemMetadata(Items, currentUser){
    let promises = [];
    for (let i = 0; i < Items.length; i++){
        let item = Items[i];
        let id = item.token_id;
        let numberOfTokens = 1;
        promises.push(fetch("https://9wqwwntdrdzo.moralishost.com:2053/server/functions/getItem?_ApplicationId=5pJOB2hAiXbOPHBlMuq8Sf6Q6jQlbuhobq9diG4c&itemId=" + id)
        .then(res => res.json())
        .then(res => JSON.parse(res.result))
        .then(res => {item.metadata = res})
        .then(res => {
            const options = { address: CONTRACT_ADDRESS, token_id: id, chain: "mumbai" };
            return Moralis.Web3API.token.getTokenIdOwners(options);
        })
        .then( (res) => {
            item.owners = [];
            item.tokensOwned = [];
            item.blockMade = [];
            res.result.forEach(element => {
                item.owners.push(element.owner_of);

                if (currentUser.attributes.ethAddress == element.owner_of){
//console.log(element);                    
                    item.tokensOwned.push(element.token_id, element.amount);
                    item.blockMade.push(element.block_number);
                }
            });
//console.log(item)
            return item;
        }));
    }
    return Promise.all(promises);
}

async function getPetData(address){
    const petData = await fetch("https://9wqwwntdrdzo.moralishost.com:2053/server/functions/getPetData?_ApplicationId=5pJOB2hAiXbOPHBlMuq8Sf6Q6jQlbuhobq9diG4c&address=" + address)
        .then(res => res.json())
        .then( (res) => {return res.result});
    return petData;
}

function renderPet(item, petId, petName, LastAte, CurrentBlock, WaitTime){
    const parent = document.getElementById("pet");
    let growButton = "";
    let feedButton = ""; 
    const Some = 50;
    //petUpdate(petId, contract);
    //const IsFed= await contract.methods.getIsFed(petId).call();
    //const CanGrow = await contract.methods.getCanGrow(petId).call();
//console.log(CurrentBlock - LastAte > WaitTime / 3  + Some);
    const foodWait = parseInt(WaitTime) / 3  + Some;
    const growWait = parseInt(WaitTime) + Some;
    const foodTimer = parseInt(LastAte) + parseInt(foodWait) - CurrentBlock;
    const growTimer = parseInt(item.blockMade) + growWait - CurrentBlock;
//console.log(growWait);
    if (CurrentBlock - item.blockMade > growWait) {
        growButton = `<a href="./grow.html?token_id=${item.token_id}&pet_id=${petId}" class="btn btn-primary">Grow</a>`
    } else {
        growButton = `<center>${growTimer} blocks more to Grow</center>`;
    }    
    if (CurrentBlock - LastAte > foodWait) {
        feedButton = `<a href="./feed.html?token_id=${item.token_id}&pet_id=${petId}" class="btn btn-primary">Feed</a>`
    } else {
        feedButton = `<center><p>${foodTimer} blocks more to Feed</p></center>`;
    }

    let htmlString = `
        <p></p>
        <div class="card text-white bg-dark">   
          <img src="${item.metadata.image}" class="card-img" alt="Pet Image">
          ${growButton}
          ${feedButton}
          <div class="card-body"> 
          <center>
            <h5 class="card-title">${item.metadata.name} ~ ${petName}</h5>
            <br>
            <p class="card-text">${item.metadata.description}</p>
            <p class="card-text">You Own: ${item.tokensOwned[1]}</p>
            </center><br>
            <p class="card-footer text-muted"">Total Amount: ${item.amount}
            <br>Number of Owners: ${item.owners.length}</p> 
          </div>
        </div>
    `
    let col = document.createElement("div");
    col.className = "col col-md-6";
    col.innerHTML = htmlString;
    parent.appendChild(col);
}

async function renderItem(item){
    const parent = document.getElementById("food");
    let htmlString = `
        <p></p>
        <div class="card text-white bg-dark">
        <img src="${item.metadata.image}" class="card-img-top" alt="Item Image">
        <div class="card-body">
          <center>
            <h5 class="card-title">${item.metadata.name}</h5>
            <br>
            <p class="card-text">${item.metadata.description}</p>
            <p class="card-text">You Own: ${item.tokensOwned[1]}</p> 
          </center><br>
            <p class="card-footer text-muted"">Total Amount: ${item.amount} 
            <br>Number of Owners: ${item.owners.length}</p>
        </div>
        </div>
    `
    let col = document.createElement("div");
    col.className = "col col-md-6";
    col.innerHTML = htmlString;
    parent.appendChild(col);
}

async function addLogout(){
    let col = document.createElement("div");
    col.className = "col col-md-4";
    col.innerHTML = `<a href="./logout.html" class="btn btn-primary">Log Out</a><p></p>`;
    document.getElementById("logout_button").appendChild(col);
}

async function initializeApp(){
    let currentUser = Moralis.User.current();
    web3 = await Moralis.Web3.enable();
    
    if(!currentUser){
        try {
            await Moralis.Web3.authenticate({signingMessage:"Welcome to Hoge Pets! \n Please sign in to play."});
            window.location.href=window.location.href
            return;
        } catch (error) {
            console.log("Error:\n" + error +  "\n\nError message:\n" + error.message);
            return;
        }
    }
    console.log("Current user logged in as " + currentUser.id);
    addLogout();
    switchNetworks(web3);
    const options = { address: CONTRACT_ADDRESS, chain: "mumbai" };
    let Items = await Moralis.Web3API.token.getAllTokenIds(options);
    let WithMetadata = await fetchItemMetadata(Items.result, currentUser);
    let hasChamber = false;
    let petCounter = 0;
    let petId = "";
    let petName = "";
    let contract = new web3.eth.Contract(contractAbi, CONTRACT_ADDRESS);
    const CurrentBlock = await web3.eth.getBlockNumber();
    //const Buffer = 25;
    const WaitTime = await contract.methods.WaitLimit().call();
    const userAddress = currentUser.attributes.ethAddress;
    const petsData = await getPetData(userAddress);
//console.log(WithMetadata);
    for (let i = 0; i < WithMetadata.length; i++) {
        const item = WithMetadata[i];
        const found = item.owners.find(owner => owner == userAddress);
        if (item.token_id < 4096 && found){
            petId = petsData[petCounter].pet_id;
            petName = petsData[petCounter].name;
            lastAte = await contract.methods.getLastAte(petId).call();
//console.log(CurrentBlock - item.blockMade > WaitTime);
//console.log(WaitTime);
            renderPet(item, petId, petName, lastAte, CurrentBlock, WaitTime);   
            petCounter++;         
            if (item.token_id == 0x0010){
            hasChamber = true;
            }
        } else if (found) {
            renderItem(item)
        } 
    }

    if (!hasChamber){
        let col = document.createElement("div");
        col.className = "col col-md-8";
        col.innerHTML = `
            Please wait for the blocks to be mined to see your new pet.<br>
            <a href="./getpet.html" class="btn btn-primary">Get Incu-Chamber</a><br>
            Only one Incu-Chamber can be owned at a time.<br>
        `;
        document.getElementById("get_button").appendChild(col);
    }

}

async function switchNetworks(web3){
    try {
        await web3.currentProvider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x13881' }], // Hexadecimal version of 80001, prefixed with 0x
        });
    } catch (error) {
        if (error.code === 4902) {
            try {
                await ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{ 
                        chainId: '0x13881', // Hexadecimal version of 80001, prefixed with 0x
                        chainName: "POLYGON Mumbai",
                        nativeCurrency: {
                            name: "MATIC",
                            symbol: "MATIC",
                            decimals: 18,
                        },
                        rpcUrls: ["https://speedy-nodes-nyc.moralis.io/cebf590f4bcd4f12d78ee1d4/polygon/mumbai"],
                        blockExplorerUrls: ["https://explorer-mumbai.maticvigil.com/"],
                        iconUrls: ["https://s2.coinmarketcap.com/static/img/coins/64x64/3890.png"],

                    }],
                });
            } catch (addError){
                console.log('Did not add network');
            }
        }
        console.log(error.message); 
    }
    
}

async function petUpdate(petId, contract){
//needs to be send()
    await contract.methods.petUpdate(petId).call();
}


initializeApp();
