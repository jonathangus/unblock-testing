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
  console.log('unblock_session_id', unblock_session_id);
  apiClient.setSessionId(unblock_session_id);

  const token = await apiClient.get('user/kyc/applicant/token');
  console.log('TOKEN', token);
  await apiClient.post('user/kyc/applicant', {
    address: {
      address_line_1: 'hogbergsgatan 33',
      post_code: '11620',
      city: 'stockholm',
      country: 'SE',
    },
    date_of_birth: '1994-04-09',
    source_of_funds: 'SALARY',
  });

  let info = await apiClient.get('user/kyc/applicant');
  console.log(info, 'info');

  const content = await convertImageToBase64(
    path.join(__dirname, 'kyc/driver.png')
  );

  console.log('selfie');
  await apiClient.put('user/kyc/document', {
    document_type: 'SELFIE',
    document_subtype: 'FRONT_SIDE',
    country: 'GB',
    filename: 'driver.png',
    content,
  });

  console.log('time to patch');

  let forceApprove = await apiClient.patch('user/kyc/verification', {
    status: 'HARD_KYC_FAILED',
  });
  console.log({ forceApprove });
  info = await apiClient.get('user/kyc/applicant');
  console.log(info, 'info');
};

main();
