import axios, { isAxiosError } from 'axios';

class ApiClient {
  headers: Record<string, string> = {
    accept: 'application/json',
    'content-type': 'application/json',
    Authorization: `API-Key ${process.env.API_KEY!}`,
  };

  get = async (path: string): Promise<any> => {
    const request = await axios.get(`${process.env.BASE_URL!}${path}`, {
      headers: this.headers,
    });

    return request.data;
  };

  post = async (path: string, body: any): Promise<any> => {
    try {
      const request = await axios.post(
        `${process.env.BASE_URL!}${path}`,
        body,
        {
          headers: this.headers,
        }
      );

      return request.data;
    } catch (e) {
      if (isAxiosError(e)) {
        console.error('AXIOS ERROR:', e.message);
        throw e;
      }
      throw e;
    }
  };
  put = async (path: string, body: any): Promise<any> => {
    try {
      const request = await axios.put(`${process.env.BASE_URL!}${path}`, body, {
        headers: this.headers,
      });

      return request.data;
    } catch (e) {
      if (isAxiosError(e)) {
        console.error('AXIOS ERROR:', e.message);
        throw e;
      }
      throw e;
    }
  };
  patch = async (path: string, body: any): Promise<any> => {
    try {
      const request = await axios.patch(
        `${process.env.BASE_URL!}${path}`,
        body,
        {
          headers: this.headers,
        }
      );

      return request.data;
    } catch (e) {
      if (isAxiosError(e)) {
        console.error('AXIOS ERROR:', e.message);
        throw e;
      }
      throw e;
    }
  };
  setSessionId = (id: string) => {
    this.headers = {
      ...this.headers,
      'unblock-session-id': id,
    };
  };
}

export const apiClient = new ApiClient();
