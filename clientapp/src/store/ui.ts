export const namespaced = true;

const initDefaultState = () => {
    return {
        navDrawer: true,
    }
}

export const state = () => initDefaultState();


export const mutations = {
    SET_NAV_DRAWER(state : any, boolean : any) {
        state.navDrawer = boolean;
    },
    CLEAR_STATE(state : any) {
        Object.assign(state, initDefaultState())
    },
}


export const actions = {
    toggleNavDrawer({commit, state} : any) {
        commit('SET_NAV_DRAWER', !state.navDrawer)
    },

    setNavDrawer({commit, state}: any, drawer: any) {
        if (isDrawerStateChangeRedundant(drawer, state)) return
        commit('SET_NAV_DRAWER', !!drawer)
    },

    clearState({commit} : any) {
        commit('CLEAR_STATE')
    }
}

export const getters = {

}


/*
PRIVATE FUNCTIONS
*/

function isDrawerStateChangeRedundant(drawer: any, state: { navDrawer: boolean; }) : boolean {
    return !!drawer === state.navDrawer
}