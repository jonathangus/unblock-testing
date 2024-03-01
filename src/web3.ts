import {
  createPublicClient,
  createWalletClient,
  http,
  type Address,
} from 'viem';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { polygonMumbai } from 'viem/chains';

export const chain = polygonMumbai;

export const publicClient = createPublicClient({
  transport: http(chain.rpcUrls.default.http[0]),
});

export const getNewAccount = () => {
  const pk = generatePrivateKey();
  const account = privateKeyToAccount(pk);

  console.log('this sessions privatekey: ', pk);
  console.log('this sessions address: ', account.address);
  return account;
};

export const adminAcccount = privateKeyToAccount(
  process.env.PRIVATE_KEY! as Address
);

export const adminWalletClient = createWalletClient({
  chain,
  transport: http(chain.rpcUrls.default.http[0]),
  account: adminAcccount,
});
