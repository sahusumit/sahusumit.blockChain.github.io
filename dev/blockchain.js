const sha256 = require('sha256');
const currentNodeUrl = process.argv[3];
const uuid = require('uuid/v1');

function BlockChain() {
    this.chain = [];
    this.pendingTransactions = [];
    this.currentNodeUrl=currentNodeUrl;
    this.networkNodes=[];//all the nodes added here
    //genesis block (first block in the chain) 
    this.createNewBlock(100,'0','0');
    this.currentNodeUrl=currentNodeUrl;
}

// class BlockChain {
//     constructor () {
//         this.chain = [];
//         this.newTransaction = [];        
//     }
// }

//when a new block is mined
BlockChain.prototype.createNewBlock = function(nonce,previousBlockHash,hash) {

    const newBlock = {
        index:this.chain.length+1,
        timestamp:Date.now(),
        transactions:this.pendingTransactions,
        nonce:nonce,//(proof of work that this block is legitimately created)
        hash:hash,//data from our new block(all the transactions will be hashed in to  a single string)
        previousBlockHash:previousBlockHash
    }

    this.pendingTransactions=[];
    this.chain.push(newBlock);
    
    return newBlock;
}

BlockChain.prototype.getLastBlock = function() {
    return this.chain[this.chain.length-1];
};


// BlockChain.prototype.createNewTransaction = function(amount,sender,recipient) {
    BlockChain.prototype.createNewTransaction = function(patientList) {

    const newTransaction = {
        patientList,
//hospital id ( keeping the organ)
//organ 

        // amount,
        // sender,
        // recipient,
        transactionId:uuid().split('-').join('')
    };

    return newTransaction;

};

BlockChain.prototype.addTransactionToPendingTransactions = function(transactionObj) {
    this.pendingTransactions.push(transactionObj);
    return this.getLastBlock()['index']+1;
};

BlockChain.prototype.hashBlock = function(previousBlockHash,currentBlockData,nonce) {
    const dataAsString = previousBlockHash+nonce.toString()+JSON.stringify(currentBlockData);
    const hash = sha256(dataAsString);
    return hash;
};

//TO SECURE THE BLOCKCHAIN ( WE WANT ONLY THE LEGITIMATE BLOCKS TO BE ADDED TO THE CHAIN I.E 
//BLOCKS SHOULD BE ADDED THROUG PROOF OF WORK)

//==> repeatedly hash block until it finds correct hash => '0000DSKFAJ'
//==> uses current block data for the hash, but also the previous block hash (because of previous block
//hash the whole chain is to be remined which is not feasible for well developed blockchain)
//==> continuously changes nonce value until it finds the correct hash
//==> returns to us the nonce value that creates the correct hash

BlockChain.prototype.proofOfWork = function(previousBlockHash,currentBlockData) {

    let nonce = 0;
    let hash = this.hashBlock(previousBlockHash,currentBlockData,0);
    
    while(hash.substring(0,4)!=='0000') {
        nonce++;
        hash = this.hashBlock(previousBlockHash,currentBlockData,nonce);
    }

    return nonce;

};


BlockChain.prototype.chainIsValid = function(blockchain) {

    let validChain = true;

    //start with 1 and not 0 to skip genesis block
    for(var i=1;i<blockchain.length;i++) {

        const currentBlock = blockchain[i];
        const prevBlock = blockchain[i-1];
        const blockHash = this.hashBlock(
            prevBlock['hash'],
            {
                transactions:currentBlock['transactions'],
                index:currentBlock['index']
            },
            currentBlock['nonce']
        );

        if(blockHash.substring(0,4)!=='0000') {
            validChain=false;
        }

        if(currentBlock['previousBlockHash']!==prevBlock['hash']) {
            validChain=false;
        }

    }

    const genesisBlock = blockchain[0];
    const correctNonce = genesisBlock['nonce']===100;
    const correctPreviousBlockHash = genesisBlock['previousBlockHash']==='0';
    const correctHash = genesisBlock['hash']==='0';
    const correctTransactions = genesisBlock['transactions'].length===0;

    if(!correctNonce || !correctPreviousBlockHash || !correctHash || !correctTransactions) {
        validChain=false;
    }


    return validChain;
};

BlockChain.prototype.getBlock = function(blockHash) {
    let correctBlock = null;
    this.chain.forEach(block => {
        if(block.hash === blockHash) 
            correctBlock = block;
    });
    return correctBlock;
}

BlockChain.prototype.getTransaction = function(transactionId) {

    let correctTransaction = null;
    let correctBlock = null;

    this.chain.forEach(block => {

        block.transactions.forEach(transaction => {

            if(transaction.transactionId === transactionId) {
                correctBlock=block;
                correctTransaction=transaction;
            }

        });

    });

    return {
        transaction:correctTransaction,
        block:correctBlock
    };

};

// BlockChain.prototype.getAddressData = function(address) {

//     const addressTransactions = [];
//     this.chain.forEach(block => {

//         block.transactions.forEach(transaction => {

//             if(transaction.sender===address || transaction.recipient === address) {
//                 addressTransactions.push(transaction);
//             }

//         });

//     });

//     let balance = 0;
//     addressTransactions.forEach(transaction => {

//         if(transaction.recipient === address) balance+=transaction.amount;
//         else if(transaction.sender === address)  balance -=transaction.amount;

//     });

//     return {
//         addressTransactions:addressTransactions,
//         addressBalance:balance
//     }

// }


module.exports = BlockChain;