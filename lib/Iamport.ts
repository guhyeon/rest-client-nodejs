import axios from 'axios';
import _ from 'lodash';
import qs from 'qs';

import * as Request from './request';
import * as Response from './response';
import * as Enum from './enum';

import { BASE_URL } from './constants';
import { Headers } from './Interfaces';

interface IamportProperties {
  apiKey: string,
  apiSecret: string,
};
interface RequestDataForGetToken {
  imp_key: string,
  imp_secret: string,
};
interface Token {
  access_token: string,
  now: number,
  expired: number,
};

export class Iamport {
  private apiKey: string;
  private apiSecret: string;
  private token: Token;
  private apiInstance: any;

  constructor(properties: IamportProperties) {
    const { apiKey, apiSecret  } = properties;
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;

    this.apiInstance = axios.create({
      baseURL: BASE_URL,
      paramsSerializer: (params: any) =>
        qs.stringify(params, { arrayFormat: 'brackets' }),
    });
  }

  public getApiInstance(): any {
    return this.apiInstance;
  }

  public async getHeaders(): Promise<Headers> {
    if (!this.isTokenValid()) {
      await this.getToken()
      .then(({ data }: any) => {
        const { response } = data;
        this.token = _.assign({}, response);
      })
      .catch((error: any) => Promise.reject(error));
    } 

    const { access_token } = this.token;
    return { Authorization: `Bearer ${access_token}` };
  }

  private getToken(): Promise<any> {
    const data: RequestDataForGetToken = {
      imp_key: this.apiKey,
      imp_secret: this.apiSecret,
    };
    return axios.post('https://api.iamport.kr/users/getToken', data);
  }

  private isTokenValid(): boolean {
    if (this.token && this.token.access_token) {
      const { now } = this.token;
      return new Date().getTime() > now * 1000;
    }
    return false;
  }
}

export {
  Request,
  Response,
  Enum
}
