import { SiweMessage } from 'siwe';
import {
  generatePrivateKey,
  privateKeyToAccount,
  type Address,
  type PrivateKeyAccount,
} from 'viem/accounts';
import { arbitrumSepolia } from 'viem/chains';

const unblockUrl = 'https://sandbox.getunblock.com'; //'https://anotherblock.io';
export const getUserSignatureData = async (account: PrivateKeyAccount) => {
  const SESSION_DURATION_MS = 1000 * 60 * 60 * 4; // 4 hours (max allowed)
  const expirationDate = new Date(Date.now() + SESSION_DURATION_MS);
  const domainUrl = new URL(unblockUrl);

  const siweData = {
    domain: domainUrl.hostname,
    address: account.address,
    statement: 'Sign in with Ethereum',
    uri: `${unblockUrl}/auth/login`,
    version: '1',
    chainId: arbitrumSepolia.id, //arbitrum sepolia,
    expirationTime: expirationDate.toISOString(),
  };
  const siweMessage = new SiweMessage(siweData);

  const preparedSiweMessage = siweMessage.prepareMessage();

  const signature = await account.signMessage({
    // Hex data representation of message.
    message: { raw: preparedSiweMessage as `0x${string}` },
  });

  return {
    message: preparedSiweMessage,
    signature,
  };
};
