import { Blockchain } from '../lib/bc_transactions.js';

const amountElement = document.getElementById('amount') as HTMLInputElement;
const fromElement = document.getElementById('from') as HTMLInputElement;
const toElement = document.getElementById('to') as HTMLInputElement;

const pendingTransactionsElement = document.getElementById('pendingTransactions');
const blockchainElement = document.getElementById('blockchain');
const addTransactionButton = document.getElementById('addTransaction');
const mineButton = document.getElementById('mine');

(async function main() {
    console.log('⏳ Initializing the blockchain, creating the genesis block...');
    const bc = new Blockchain();
    await bc.createGenesisBlock();
    console.log('✅ Initializion done.');

    addTransactionButton.onclick = function () {
        bc.createTransaction({
            amount: parseInt(amountElement.value),
            sender: fromElement.value,
            recipient: toElement.value,
        });

        pendingTransactionsElement.textContent = JSON.stringify(bc.pendingTransactions, null, 2);

        // Reset form
        fromElement.value = '';
        toElement.value = '';
        amountElement.value = '0';
    };

    mineButton.onclick = async function () {
        await bc.minePendingTransactions();
        blockchainElement.textContent = JSON.stringify(bc, null, 2);
        pendingTransactionsElement.textContent = '[]';
    }
})();









// (async function main (): Promise<void> {
//     console.log('⏳ Initializing the blockchain, creating the genesis block...');

//     const bc = new Blockchain();
//     await bc.createGenesisBlock();

//     bc.createTransaction({ sender: 'John', recipient: 'Kate', amount: 50 });
//     bc.createTransaction({ sender: 'Kate', recipient: 'Mike', amount: 10 });

//     await bc.minePendingTransactions();

//     bc.createTransaction({ sender: 'Alex', recipient: 'Rosa', amount: 15 });
//     bc.createTransaction({ sender: 'Gina', recipient: 'Rick', amount: 60 });

//     await bc.minePendingTransactions();

//     console.log(JSON.stringify(bc, null, 2));
// })();
