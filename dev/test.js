const Blockchain = require('./blockchain');

const bitcoin = new Blockchain();

/* //CREATING NEW BLOCKS

bitcoin.createNewBlock(1234,'asdjfkasf','asdfjkadsfk');
bitcoin.createNewBlock(22233,'fdsfdsaff','dsdfasdfa');
bitcoin.createNewBlock(3322322,'gadfsad','hasdfasd');

*/

/* // BLOCK AND TRANSACTION

//NEW BLOCK CREATED
bitcoin.createNewBlock(1234,'asdjfkasf','asdfjkadsfk');
//STORED IN PENDING TRANSACTION
bitcoin.createNewTransaction(100,'gaurav','aman');
//WHEN NEW BLOCK IS MINED PENDING TRANSACTIONS ARE STORED IN THE CURRENT BLOCK
bitcoin.createNewBlock(1235,'adsfkasf','sadfssss');

bitcoin.createNewTransaction(3300,'gaurav','aman');
bitcoin.createNewTransaction(30,'gaurav','aman');
bitcoin.createNewTransaction(10,'gaurav','aman');
//HERE CREATE A NEW BLOCK TO ADD THESE TRANSACTIONS IN TO IT

*/

/*  //TESTING THE HASH FUNCTION

const previousBlockHash='9DFSAKDFJSDLAKFJSDIF';
const currentBlockData=[
    {
        amount:10,
        sender:'sumit',
        recepient:'aman'
    },
    {
        amount:440,
        sender:'sumit',
        recepient:'aman'
    },
    {
        amount:1222,
        sender:'sumit',
        recepient:'aman'
    }
];
const nonce=100;

console.log(bitcoin.hashBlock(previousBlockHash,currentBlockData,nonce));
*/

/* //VERIFYING PROOF OF WORK

const previousBlockHash='9DFSAKDFJSDLAKFJSDIF';
const currentBlockData=[
    {
        amount:10,
        sender:'sumit',
        recepient:'aman'
    },
    {
        amount:440,
        sender:'sumit',
        recepient:'aman'
    },
    {
        amount:1222,
        sender:'sumit',
        recepient:'aman'
    }
];

//IT FINDS THE CORRECT NONCE
console.log(bitcoin.proofOfWork(previousBlockHash,currentBlockData));
//THEN JUST CHECK THAT NONCE
console.log(bitcoin.hashBlock(previousBlockHash,currentBlockData,67894));

*/


const bc1 = {
    "chain": [
      {
        "index": 1,
        "timestamp": 1539498453171,
        "transactions": [
          
        ],
        "nonce": 100,
        "hash": "0",
        "previousBlockHash": "0"
      },
      {
        "index": 2,
        "timestamp": 1539498525927,
        "transactions": [
          {
            "amount": 2222,
            "sender": "gaurav",
            "recipient": "sumit",
            "transactionId": "54c75730cf7a11e8b6a46f4e1148d8a9"
          },
          {
            "amount": 22,
            "sender": "gaurav",
            "recipient": "sumit",
            "transactionId": "59b58c30cf7a11e8b6a46f4e1148d8a9"
          },
          {
            "amount": 2,
            "sender": "gaurav",
            "recipient": "sumit",
            "transactionId": "5c752160cf7a11e8b6a46f4e1148d8a9"
          }
        ],
        "nonce": 37425,
        "hash": "0000484fca6bc4ad5a41c8592d94ea5ae1da3a32711f6a9fe537a5fc0f214bc1",
        "previousBlockHash": "0"
      },
      {
        "index": 3,
        "timestamp": 1539498665044,
        "transactions": [
          {
            "amount": 12.5,
            "sender": "00",
            "recipient": "3bd71030cf7a11e8b6a46f4e1148d8a9",
            "transactionId": "6737f3c0cf7a11e8b6a46f4e1148d8a9"
          },
          {
            "amount": 40,
            "sender": "gaurav",
            "recipient": "sumit",
            "transactionId": "a8ab52c0cf7a11e8b6a46f4e1148d8a9"
          },
          {
            "amount": 50,
            "sender": "gaurav",
            "recipient": "sumit",
            "transactionId": "ac786050cf7a11e8b6a46f4e1148d8a9"
          },
          {
            "amount": 60,
            "sender": "gaurav",
            "recipient": "sumit",
            "transactionId": "b068ad50cf7a11e8b6a46f4e1148d8a9"
          },
          {
            "amount": 70,
            "sender": "gaurav",
            "recipient": "sumit",
            "transactionId": "b3c768b0cf7a11e8b6a46f4e1148d8a9"
          }
        ],
        "nonce": 16820,
        "hash": "0000e4dfdc330f27f71c1ec2892d864271d1646680aa5e9b53c864233d54279d",
        "previousBlockHash": "0000484fca6bc4ad5a41c8592d94ea5ae1da3a32711f6a9fe537a5fc0f214bc1"
      },
      {
        "index": 4,
        "timestamp": 1539498677296,
        "transactions": [
          {
            "amount": 12.5,
            "sender": "00",
            "recipient": "3bd71030cf7a11e8b6a46f4e1148d8a9",
            "transactionId": "ba20c670cf7a11e8b6a46f4e1148d8a9"
          }
        ],
        "nonce": 17896,
        "hash": "00005b8f33cff80efa2003e6768e4589771b0c25a60bb52a6a66dcabbf54b517",
        "previousBlockHash": "0000e4dfdc330f27f71c1ec2892d864271d1646680aa5e9b53c864233d54279d"
      },
      {
        "index": 5,
        "timestamp": 1539498688167,
        "transactions": [
          {
            "amount": 12.5,
            "sender": "00",
            "recipient": "3bd71030cf7a11e8b6a46f4e1148d8a9",
            "transactionId": "c16e2120cf7a11e8b6a46f4e1148d8a9"
          }
        ],
        "nonce": 82098,
        "hash": "00003c6dc1765df0c83d8ab77add5e256697efce94984766f26c8007aa07fa32",
        "previousBlockHash": "00005b8f33cff80efa2003e6768e4589771b0c25a60bb52a6a66dcabbf54b517"
      }
    ],
    "pendingTransactions": [
      {
        "amount": 12.5,
        "sender": "00",
        "recipient": "3bd71030cf7a11e8b6a46f4e1148d8a9",
        "transactionId": "c7e8e990cf7a11e8b6a46f4e1148d8a9"
      }
    ],
    "currentNodeUrl": "http://localhost:3001",
    "networkNodes": [
      
    ]
  };

console.log('valid:'+bitcoin.chainIsValid(bc1.chain));
