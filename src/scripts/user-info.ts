import { privateKeyToAccount } from 'viem/accounts';
import { apiClient } from '../api-client';
import { loginUser } from '../user-auth';
import inquirer from 'inquirer';
import { readFile } from 'fs/promises';
import path from 'path';

async function convertImageToBase64(filePath: string) {
  try {
    const data = await readFile(filePath);
    return data.toString('base64');
  } catch (error) {
    console.error('Error reading the file:', error);
    return null;
  }
}

const main = async () => {
  const { pk } = await inquirer.prompt([
    { name: 'pk', value: 'input', message: 'private key?' },
  ]);
  const account = privateKeyToAccount(pk);

  const { user_uuid, unblock_session_id } = await loginUser(account);
  console.log('address: ', account.address);
  console.log('user_uuid', user_uuid);
  console.log('unblock_session_id', unblock_session_id);
  apiClient.setSessionId(unblock_session_id);

  let info = await apiClient.get('user/kyc/applicant');
  console.log(info, 'info');
};

main();
