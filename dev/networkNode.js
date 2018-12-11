const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const Blockchain = require('./blockchain');
const uuid = require('uuid/v1');
const rp = require('request-promise');

app.set('view-engine','ejs');

//TO HAVE DIFFERENT NODES FUNCTIONALITY USE DIFFERENT PORT
const port = process.argv[2];

const nodeAddress = uuid().split('-').join('');

const organChain = new Blockchain();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));


//ROUTES 

app.get('/',function(req,res) {
    res.render("landing.ejs",{organChain});
});

app.get('/blockchain',function(req,res) {
    res.send(organChain);
});

app.get('/addPatients',function(req,res) {
    res.render("addPatients.ejs");
});

app.get('/removePatients',function(req,res) {
    res.render("removePatients.ejs");
});

app.get('/addNode',function(req,res) {
    res.render("addNode.ejs");
});

//API

app.post('/transaction',function(req,res) {
    const newTransaction = req.body;
    const blockIndex = organChain.addTransactionToPendingTransactions(newTransaction);
    res.json({
        note:`Transaction will be added in block ${blockIndex}.`
    });
});

//use this endpoint every time when you want to create a new transaction
app.post('/transaction/broadcast',function(req,res) {
    const newTransaction = organChain.createNewTransaction(req.body.list);
    organChain.addTransactionToPendingTransactions(newTransaction);
    const requestPromises = [];
    organChain.networkNodes.forEach(networkNodeUrl => {
        const requestOptions = {
            uri:networkNodeUrl+'/transaction',
            method:'POST',
            body:newTransaction,
            json:true
        }
        requestPromises.push(rp(requestOptions));
    });

    Promise.all(requestPromises) 
    .then(data => {
        res.json({
            note:'Transaction created and broadcast successfully.'
        });
    })
    .catch(err=> {
        console.log("An error has occured "+err);
    });

});

app.get('/mine', function(req, res) {
	const lastBlock = organChain.getLastBlock();
	const previousBlockHash = lastBlock['hash'];
	const currentBlockData = {
		transactions: organChain.pendingTransactions,
		index: lastBlock['index'] + 1
	};
	const nonce = organChain.proofOfWork(previousBlockHash, currentBlockData);
	const blockHash = organChain.hashBlock(previousBlockHash, currentBlockData, nonce);
	const newBlock = organChain.createNewBlock(nonce, previousBlockHash, blockHash);

	const requestPromises = [];
	organChain.networkNodes.forEach(networkNodeUrl => {
		const requestOptions = {
			uri: networkNodeUrl + '/receive-new-block',
			method: 'POST',
			body: { newBlock: newBlock },
			json: true
		};

		requestPromises.push(rp(requestOptions));
	});

	Promise.all(requestPromises)
	.then(data => {
        res.render("landing.ejs",{organChain});
    })
    .catch(err=> {
        console.log("An error has occured "+err);
    });
});

app.post('/receive-new-block', function(req, res) {
	const newBlock = req.body.newBlock;
	const lastBlock = organChain.getLastBlock();
	const correctHash = lastBlock.hash === newBlock.previousBlockHash; 
	const correctIndex = lastBlock['index'] + 1 === newBlock['index'];

	if (correctHash && correctIndex) {
		organChain.chain.push(newBlock);
		organChain.pendingTransactions = [];
		res.json({
			note: 'New block received and accepted.',
			newBlock: newBlock
		});
	} else {
		res.json({
			note: 'New block rejected.',
			newBlock: newBlock
		});
	}
});

//REGISTER A NODE AND BROADCAST TO THE WHOLE NETWORK
//whenever a new node is created it is registered to the current network 
//and brodcasted to the entire network and then registered there too
app.post('/register-and-broadcast-node',function(req,res) {
    const newNodeUrl = req.body.newNodeUrl;
    if(organChain.networkNodes.indexOf(newNodeUrl)==-1) {
        organChain.networkNodes.push(newNodeUrl);
    }

    const regNodesPromises = [];
    organChain.networkNodes.forEach(networkNodesUrl => {

        const requestOptions = {
            uri:networkNodesUrl+'/register-node',
            method:'POST',
            body:{newNodeUrl:newNodeUrl},
            json:true
        };

        regNodesPromises.push(rp(requestOptions));

    });

    Promise.all(regNodesPromises)
        .then(data=>{
            const bulkRegisterOptions = {
                uri:newNodeUrl + '/register-nodes-bulk', //do the bulk with the new node
                method:'POST',
                body:{
                    allNetworkNodes:[
                        ...organChain.networkNodes,
                        organChain.currentNodeUrl
                    ]
                },
                json:true
            };
            return rp(bulkRegisterOptions);
        })
        .then(data => {
            res.render("landing.ejs",{organChain});
        })
        .catch(err=> {
            console.log("An error has occured "+err);
        });
});

app.post('/register-node',function(req,res )  {

    const newNodeUrl = req.body.newNodeUrl;
    const nodeNotAlreadyPresent = organChain.networkNodes.indexOf(newNodeUrl)==-1;
    const notCurrentNode = organChain.currentNodeUrl!==newNodeUrl;

    if(nodeNotAlreadyPresent && notCurrentNode) organChain.networkNodes.push(newNodeUrl);

    res.json({
        note:'New node registered successfully with node.'
    });

});

//REGISTER MULTIPLE NODES AT ONCE
//when new node is added all the existing nodes are added to the new one
app.post('/register-nodes-bulk',function(req,res) {
    const allNetworkNodes = req.body.allNetworkNodes;
    allNetworkNodes.forEach(networkNodeUrl => {
        const nodeNotAlreadyPresent = organChain.networkNodes.indexOf(networkNodeUrl) == -1;
        const notCurrentNode = organChain.currentNodeUrl!==networkNodeUrl;
        if(nodeNotAlreadyPresent && notCurrentNode) {
            organChain.networkNodes.push(networkNodeUrl);
        }
    });

    res.json({
        note:'Bulk registration successful'
    });

});


app.get('/consensus',function(req,res) {

    const requestPromises = [];
    organChain.networkNodes.forEach(networkNodeUrl => {

        const requestOptions = {
            uri:networkNodeUrl+'/blockchain',
            method:'GET',
            json:true
        };

        requestPromises.push(rp(requestOptions));

    });

    Promise.all(requestPromises)
    .then(blockchains => {

        const currentChainLength = organChain.chain.length;
        let maxChainLength = currentChainLength;
        let newLongestChain = null;
        let newPendingTransactions = null;

        blockchains.forEach(blockchain => {

            if(blockchain.chain.length > maxChainLength){
                maxChainLength = blockchain.chain.length;
                newLongestChain = blockchain.chain;
                newPendingTransactions = blockchain.pendingTransactions;
            };

        });

        if(!newLongestChain || (newLongestChain && !organChain.chainIsValid(newLongestChain))) {
            res.render("landing.ejs",{organChain});
            // res.json({
            //     note:'Current chain has not been replaced',
            //     chain:organChain.chain
            // });
        } else{
            organChain.chain = newLongestChain;
            organChain.pendingTransactions = newPendingTransactions;
            res.render("landing.ejs",{organChain});
            // res.json({
            //     note:'This chain has been replaced.',
            //     chain:organChain.chain
            // });
        }
    })
    .catch(err=> {
        console.log("An error has occured "+err);
    });;

});

app.post('/add-new-patient',function(req,res) {
    var options = {
        uri: organChain.currentNodeUrl+'/consensus',
        method:'GET',
        json:true
    };

    rp(options)
        .then(function (data) {
            const lastBlock = organChain.getLastBlock();
            var prevList;
            if(lastBlock.index==1) {
                prevList =[];
            } else {
                prevList = lastBlock.transactions[0].patientList;
            }
            const patientNotAlreadyPresent = false;
            prevList.forEach(patient => {
                
                if(patient==req.body.id) {
                    patientNotAlreadyPresent = true;
                }

            });
            
            if(!patientNotAlreadyPresent) {
                const newList = [...prevList,req.body.id];
                console.log("new list is====>"+newList);
                const requestOptions = {
                    uri:organChain.currentNodeUrl+'/transaction/broadcast',
                    method:'POST',
                    body:{
                        list:[...newList]
                    },
                    json:true
                }

                rp(requestOptions)
                .then(function(data) {
                    res.render("landing.ejs",{organChain});
                    // res.json({
                    //     note:'New Patient added successfully.'
                    // });  
                });


            } else {
                res.json({
                    note:'New Patient already exist.'
                });
            }            
        })
        .catch(function (err) {
       
            res.json({
                note:'something went wrong.'
            });
        });

});


app.post('/remove-patient',function(req,res) {
    var options = {
        uri: organChain.currentNodeUrl+'/consensus',
        method:'GET',
        json:true
    };
     
    rp(options)
        .then(function (data) {
          
            var lastBlock = organChain.getLastBlock();
            var prevList = lastBlock.transactions[0].patientList;
            
            var patientNotPresent = true;
            prevList.forEach(patient => {
                
                if(patient==req.body.id) {
                    patientNotPresent = false;
                }

            });
            
            if(!patientNotPresent) {
                var newList = prevList.filter(function(id) {
                    return id!=req.body.id
                });
            
                const requestOptions = {
                    uri:organChain.currentNodeUrl+'/transaction/broadcast',
                    method:'POST',
                    body:{
                        list:[...newList]
                    },
                    json:true
                }
 
                rp(requestOptions)
                .then(function(data) {
                    res.render("landing.ejs",{organChain});
                    // res.json({
                    //     note:' Patient removed successfully.'
                    // });  
                });


            } else {
                res.json({
                    note:' Patient does not exist.'
                });
            }            
        })
        .catch(function (err) {
            res.json({
                note:'something went wrong.'
            });
        });  

});


//TO GET THE PARTICULAR BLOCK
app.get('/block/:blockHash',function(req,res) {
    const blockHash = req.params.blockHash;
    const correctBlock = organChain.getBlock(blockHash);
    res.json({
        block:correctBlock
    });
});

//TO GET THE PARTICULAR TRANSACTION
app.get('/transaction/:transactionId',function(req,res) {

    const transactionId = req.params.transactionId;
    const transactionData = organChain.getTransaction(transactionId);
    res.json({
        block:transactionData.block
    });

});

//TO GET THE PARTICULAR TRANSACTIONS
app.get('/address/:address',function(req,res) {

    const address = req.params.address;
    const addressData = organChain.getAddressData(address);
    res.json({
        addressData:addressData
    });

});

app.listen(port,function(){
    console.log(`Listening on port ${port}...`);
});