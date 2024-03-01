import type { PrivateKeyAccount } from 'viem';
import { apiClient } from './api-client';
import { getUserSignatureData } from './siwe';

export const loginUser = async (account: PrivateKeyAccount) => {
  const sigData = await getUserSignatureData(account);

  const res = await apiClient.post('/auth/login', sigData);

  return res;
};
