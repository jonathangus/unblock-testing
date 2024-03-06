import {
  getAddress,
  type Address,
  createWalletClient,
  http,
  parseAbi,
  parseUnits,
  parseEther,
} from 'viem';
import { apiClient } from '../api-client';
import { loginUser } from '../user-auth';
import { privateKeyToAccount } from 'viem/accounts';
import {
  getNewAccount,
  publicClient,
  chain,
  adminWalletClient,
  adminAcccount,
} from '../web3';
import inquirer from 'inquirer';

const USDC = '0x7ffae00b81355c763ef3f0ca042184762c48439f';

function generateRandomName(): string {
  const names = [
    'Alice',
    'Bob',
    'Charlie',
    'Diana',
    'Evan',
    'Fiona',
    'George',
    'Hannah',
    'Ian',
    'Jasmine',
  ];
  const randomIndex = Math.floor(Math.random() * names.length);
  return names[randomIndex] + '-' + generateRandomNumber(1, 1000);
}

function generateRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const unblockAccountCurrency = 'EUR';

const remoteBankAccRequest = {
  main_beneficiary: true, // true or false
  account_details: { currency: 'EUR', iban: process.env.IBAN },
  account_name: 'Anotherblockdd',
};

const main = async () => {
  const { pk } = await inquirer.prompt([
    { name: 'pk', value: 'input', message: 'private key?' },
  ]);

  const account = pk ? privateKeyToAccount(pk) : getNewAccount();
  const user = {
    first_name: generateRandomName(),
    last_name: generateRandomName(),
    email: `jonathan+${generateRandomNumber(5, 5000)}@anotherblock.io`,
    country: 'SE',
    target_address: account.address,
  };

  console.log('transfer usdc and eth to user');
  let nonce = await publicClient.getTransactionCount({
    address: adminAcccount.address,
  });

  let hash = await adminWalletClient.writeContract({
    address: USDC,
    abi: parseAbi([
      'function transfer(address recipient, uint256 amount) external',
    ]),
    functionName: 'transfer',
    args: [account.address, parseUnits('50', 18)],
    nonce,
  });
  await publicClient.waitForTransactionReceipt({ hash });

  nonce = await publicClient.getTransactionCount({
    address: adminAcccount.address,
  });

  hash = await adminWalletClient.sendTransaction({
    to: account.address,
    value: parseEther('0.005'),
    nonce,
  });

  await publicClient.waitForTransactionReceipt({ hash });

  console.log('create user');

  await apiClient.post('/user', user);

  console.log('login user');
  const { user_uuid, unblock_session_id } = await loginUser(account);
  console.log({ user_uuid });
  apiClient.setSessionId(unblock_session_id);
  console.log('create account');

  // onramp
  const { uuid: unblockAccUuid } = await apiClient.post(
    '/user/bank-account/unblock',
    {
      currency: unblockAccountCurrency,
    }
  );

  console.log('setup remote account');
  // connect offchain
  const { uuid: remoteAccUuid } = await apiClient.post(
    '/user/bank-account/remote',
    remoteBankAccRequest
  );

  console.log({ user_uuid, unblock_session_id, remoteAccUuid, unblockAccUuid });

  console.log('simulate tx');

  const wallets = await apiClient.get('/user/wallet/polygon');
  console.log('wallets:', wallets);

  nonce = await publicClient.getTransactionCount({
    address: adminAcccount.address,
  });

  hash = await adminWalletClient.sendTransaction({
    to: wallets[0].address,
    value: parseEther('0.005'),
    nonce,
  });

  await publicClient.waitForTransactionReceipt({ hash });

  const walletClient = createWalletClient({
    chain,
    transport: http(chain.rpcUrls.default.http[0]),
    account,
  });

  console.log('transfer usdc to user');
  hash = await walletClient.writeContract({
    address: USDC,
    abi: parseAbi([
      'function transfer(address recipient, uint256 amount) external',
    ]),
    functionName: 'transfer',
    args: [wallets[0].address, parseUnits('50', 18)],
  });

  await publicClient.waitForTransactionReceipt({ hash });
  console.log('transfer complete');

  let txs = await apiClient.get('/user/transactions');
  console.log('txs:', txs);

  const bankAccounts = await apiClient.get(`/user/bank-account/unblock`);

  console.log('bankAccounts: ', bankAccounts);

  console.log('simulate...');
  const simulate = await apiClient.post(
    `user/bank-account/unblock/${unblockAccUuid}/simulate`,
    {
      value: 1,
    }
  );
  console.log('simulate:', simulate);

  txs = await apiClient.get('/user/transactions');
  console.log('txs:', txs);
};

main();
