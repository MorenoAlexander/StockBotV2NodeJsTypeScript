import axios from 'axios'

export const namespaced = true

const initDefaultState = () => {
  return {
    usercookie: null,
    email: ''
  }
}

export const state = () => initDefaultState()

export const mutations = {
  SET_USER_COOKIE(state: any, cookie: string) {
    state.usercookie = cookie
  },
  SET_EMAIL(state: any, email: string) {
    state.email = email
  },
  CLEAR_STATE(state: any) {
    Object.assign(state, initDefaultState())
  }
}

export const actions = {
  async loginUser({ commit, state }: any, payload: any) {
    try {
      let response = await LoginIntoSession(payload)
    } catch (err) {
      console.error(err)
      commit('SET_USER_COOKIE', null)
    }
  },
  async logoutUser({ commit, state }: any) {}
}

export const getters = {
  getEmail(state: any): string {
    return state.email
  },
  getUserCookie(state: any): string {
    return state.usercookie
  }
}

/**PRIVATE FUNCTIONS */

async function LoginIntoSession(payload: any): Promise<string> {
  let response = await axios.post('/api/auth/login', payload, {})

  if (response.status !== 200) {
    throw new Error('Invalid request response')
  }

  return response.data

  return 'lol'
}

async function LogoutOfSession() {}

interface LoginResponse {}
