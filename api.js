import axios from 'axios'
import crypto from 'crypto'
import { v4 as uuidv4 } from 'uuid';

import jwt from 'jsonwebtoken'
const sign = jwt.sign

import { encode as qs } from "querystring"

import dotenv from 'dotenv'
dotenv.config()

const access_key = process.env.UPBIT_OPEN_API_ACCESS_KEY
const secret_key = process.env.UPBIT_OPEN_API_SECRET_KEY
const server_url = process.env.UPBIT_OPEN_API_SERVER_URL

function options(body) {
  const payload = {
    access_key,
    nonce: uuidv4(),
  }

  if(body) {
    const query = qs(body)
    const hash = crypto.createHash('sha512')
    const queryHash = hash.update(query, 'utf-8').digest('hex')

    payload.query_hash =  queryHash
    payload.query_hash_alg = 'SHA512'
  }

  const token = sign(payload, secret_key)

  const options = {
    headers: { Authorization: `Bearer ${token}` },
    json: body,
  }
  
  return options
}

async function get(url, options) {
  let res = null
  try {
    res = await axios.get(`${server_url}/v1${url}`, options)
  } catch(err) {
    res = err.response
  }

  return res
}

export async function getMarkets() {
  return await get('/market/all')
}

export async function getCandle(market, type, unit = '') {
  // when type == 'minute' unit cam be 1, 3, 5, 15, 10, 30, 60, 240
  return await get(`/candles/${type}s/${unit}`, {
    params: { market }
  })
}

export async function getTradeTicks(market) {
  return await get(`/trades/ticks`, {
    params: { market }
  })
}

export async function getTickers(markets) {
  return await get(`/ticker`, {
    params: { 
      markets: markets.join(',')
    }
  })
}

export async function getOrderbooks(markets) {
  return await get(`/orderbook`, {
    params: { 
      markets: markets.join(',')
    }
  })
}

export async function getAccounts() {
  return await get(`/accounts`, options())
}

export async function getChance(market) {
  return await get(`/orders/chance?${qs({ market })}`, options({ market }))
}

export default {
  getMarkets,
  getCandle,
  getTradeTicks,
  getTickers,
  getOrderbooks,
  getChance,
  getAccounts,
}