import { privateKeyToAccount } from 'viem/accounts';
import { apiClient } from '../api-client';
import { loginUser } from '../user-auth';
import inquirer from 'inquirer';

const main = async () => {
  const { pk } = await inquirer.prompt([
    { name: 'pk', value: 'input', message: 'private key?' },
  ]);
  const account = privateKeyToAccount(pk);
  const { user_uuid, unblock_session_id } = await loginUser(account);
  console.log('address: ', account.address);
  console.log({ user_uuid, unblock_session_id });
  apiClient.setSessionId(unblock_session_id);

  const wallets = await apiClient.get('/user/wallet/polygon');
  console.log('wallets:', wallets);

  const txs = await apiClient.get('/user/transactions');
  console.log('txs:', txs);
};

main();
