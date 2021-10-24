Moralis.start({ serverUrl: "https://9wqwwntdrdzo.moralishost.com:2053/server", 
                appId: "5pJOB2hAiXbOPHBlMuq8Sf6Q6jQlbuhobq9diG4c" });
const CONTRACT_ADDRESS = "0x67b3c29A193334A6bC034843304A5b041D027d99";
const CHAIN_NAME = "mumbai"

async function fetchItemMetadata(Items, currentUser){
    let promises = [];
    for (let i = 0; i < Items.length; i++){
        let item = Items[i];
        let id = item.token_id;
        promises.push(fetch("https://9wqwwntdrdzo.moralishost.com:2053/server/functions/getItem?_ApplicationId=5pJOB2hAiXbOPHBlMuq8Sf6Q6jQlbuhobq9diG4c&itemId=" + id)
            .then(res => res.json())
            .then(res => JSON.parse(res.result))
            .then(res => { item.metadata = res; })
            .then(res => {
                const options = { address: CONTRACT_ADDRESS, token_id: id, chain: CHAIN_NAME };
                return Moralis.Web3API.token.getTokenIdOwners(options);
            })
            .then((res) => {
                item.owners = [];
                item.owner = [];
                item.tokensOwned = [];
                item.blockMade = [];
                for (let ii = 0; ii < res.result.length; ii++) {
                    let resultItem = res.result[ii];
                    item.owners.push(resultItem.owner_of);
                    if (resultItem && resultItem.owner_of == currentUser.attributes.ethAddress) {
                        item.owner.push(resultItem.owner_of);
                        item.blockMade.push(resultItem.block_number);
                        item.tokensOwned.push(resultItem.token_id, resultItem.amount);
                    }
                }
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

async function getGrowData(address){
    const growData = await fetch("https://9wqwwntdrdzo.moralishost.com:2053/server/functions/getGrowData?_ApplicationId=5pJOB2hAiXbOPHBlMuq8Sf6Q6jQlbuhobq9diG4c&address=" + address)
        .then(res => res.json())
        .then( (res) => {return res.result});
    return growData;
}

async function statusBar(amount) {
    //amount = parseInt(amount);
    let str = `
        <div class="progress">
            <div class="progress-bar" role="progressbar" aria-valuenow="${amount}"
              aria-valuemin="0" aria-valuemax="100" style="width:${amount}%">
                <span class="sr-only">${amount}% wait time</span>
            </div>
        </div>
    `
    return str;
}

async function renderPet(item, petId, petName, LastAte, Owner, CurrentBlock, WaitTime){
    const parent = document.getElementById("pet");
    let growButton = "";
    let feedButton = ""; 
    const Some = 500;
    const foodWait = parseInt(WaitTime / 3)  + Some;
    const growWait = parseInt(WaitTime) + Some;
    const foodTimer = CurrentBlock - parseInt(LastAte);
    const growTimer = CurrentBlock - parseInt(item.blockMade);
    const food =item.token_id - 16 + 0x1000;
    const options = { address: CONTRACT_ADDRESS, token_id: food, chain: CHAIN_NAME};
    const tokenIdOwners= await Moralis.Web3API.token.getTokenIdOwners(options);
    const found = tokenIdOwners.result.find(element => element.owner_of == Owner);
    if (growTimer / growWait > 1 && item.token_id != 0x0013) {
        growButton = `<a href="./grow.html?token_id=${item.token_id}&pet_id=${petId}" class="btn btn-primary">Grow</a>`
    } else if (item.token_id != 0x0013) {
        growButton = `<center>${growTimer} blocks more to Grow</center>` + await statusBar(growTimer / growWait * 100);
    }    
    if (foodTimer / foodWait > 1 && found) {
        feedButton = `<a href="./feed.html?token_id=${item.token_id}&pet_id=${petId}" class="btn btn-primary">Feed</a>`
    } else if (foodTimer / foodWait > 1 && !found){
        feedButton = `<center>No food available</center>`;
    } else {
        feedButton = `<center>${foodTimer} blocks more to Feed</center>` + await statusBar(foodTimer / foodWait * 100);
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
    col.className = "col-sm-12 col-md-6 col-lg-4 col-xl-3";
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
    col.className = "col-sm-12 col-md-6 col-lg-4 col-xl-3";
    col.innerHTML = htmlString;
    parent.appendChild(col);
}

async function addLogout(){
    let col = document.createElement("div");
    col.className = "col col-md-4";
    col.innerHTML = `<a href="./logout.html" class="btn btn-primary">Log Out</a><p></p>`;
    document.getElementById("logout_button").appendChild(col);
}

//
async function initializeApp(){
    let urlParams = new URLSearchParams(window.location.search);
    let loggedIn = "";
    try{
        loggedIn = urlParams.get("login");
    }catch{console.log(loggedIn)}
    
    let currentUser = Moralis.User.current();
    web3 = await Moralis.Web3.enable();
    if(!currentUser && !loggedIn){
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
    const options = { address: CONTRACT_ADDRESS, chain: CHAIN_NAME };
    let Items = await Moralis.Web3API.token.getAllTokenIds(options);
    let WithMetadata = await fetchItemMetadata(Items.result, currentUser);
    let hasChamber = false;
    let petCounter = 0;
    let petId = "";
    let petName = "";
    let contract = new web3.eth.Contract(contractAbi, CONTRACT_ADDRESS);
    const CurrentBlock = await web3.eth.getBlockNumber();
    const WaitTime = await contract.methods.WaitLimit().call();
    const userAddress = currentUser.attributes.ethAddress;
    const petsData = await getPetData(userAddress);
    for (let i = 0; i < WithMetadata.length; i++) {
        const item = WithMetadata[i];
        const owner = item.owner[0];
        if (item.token_id < 4096 && item.tokensOwned.length > 0){
            for(let ii = 0; ii < item.tokensOwned[1]; ii++) {
                petId = petsData[petCounter].pet_id;
                petName = petsData[petCounter].name;
                lastAte = await contract.methods.getLastAte(petId).call();
                await renderPet(item, petId, petName, lastAte, owner, CurrentBlock, WaitTime);                 
                petCounter++;
                if (item.token_id == 0x0010){
                    hasChamber = true;
                }
            }
        } else if (item.tokensOwned.length > 0){
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
                        iconUrls: ["https://s2.coinmarketcap.com/static/img/coins/64x64/3890.png"]
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
