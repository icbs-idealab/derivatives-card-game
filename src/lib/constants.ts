import type { AppGame, AppGamePlayer, AppGamePlayers, CardHand, PlayerRole, SupabaseUser, SuitName, SuitReveals, SuitRevealsBool, MessageParams } from "./types";
// import { makePlayers } from "$lib/state";

export const defaultUser: SupabaseUser = {
    app_metadata: {
        provider: '',
        providers: [],
    },
    aud: '',
    confirmation_sent_at: '',
    confirmed_at: '',
    created_at: '',
    email: '',
    email_confirmed_at: '',
    id: '',
    identities: [],
    last_sign_in_at: '',
    phone: '',
    role: '',
    updated_at: '',
    user_metadata: {},
}

export const defaultGame: AppGame = {
    game_id: '',
    admin_id: '',
    admin: {
        user_id: "",
        player_name: "",
        role: "",
    },
    started: false,
    round: 0,
    ended: false,
    completed: false,
    maximum_spread: 4,
    deck: {
        held: [],
        revealed: [],
    }
}

export const emptyHand: CardHand = {
    clubs: 0,
    diamonds: 0,
    hearts: 0,
    spades: 0,
}

export const emptySuits: SuitReveals = {
    clubs: "",
    diamonds: "",
    hearts: "",
    spades: "",
}

export const emptySuitsBool: SuitRevealsBool = {
    clubs: false,
    diamonds: false,
    hearts: false,
    spades: false,
}

export const emptyReveals = {
    1: "",
    6: "",
    11: "",
    16: "",
    21: "",
    26: "",
}

export const defaultGamePlayer: AppGamePlayer = {
    user_id: '',
    game_id: '',
    player_name: '',
    hand: {...emptyHand},
    revealed: {...emptyReveals},
    role: '',
    buy: 41,
    sell: 40,
    is_admin: false,
}

export const roleKeys: SuitName[] = [
    'clubs',
    'diamonds',
    'hearts',
    'spades',
]

export const marketNames = roleKeys

export const allRoleNames: PlayerRole[] = [
    'clubs',
    'diamonds',
    'hearts',
    'spades',
    'speculator1',
    'speculator2',
    'speculator3',
    'speculator4',
    'speculator5',
    'speculator6',
]

export let suits = {
    clubs: {
        symbol: '&clubs;',
        color: 'var(--dm-white)',
    },
    spades: {
        symbol: '&spades;',
        color: 'var(--dm-white)',
    },
    diamonds: {
        symbol: '&diams;',
        color: 'var(--red)',
    },
    hearts: {
        symbol: '&hearts;',
        color: 'var(--red)',
    },
    default: {
        symbol: '🤔',
        color: 'black',
    },
    guest: {
        symbol: '🤔',
        color: 'black',
    },
} 

export const speculatorKeys = new Array(6).fill('').map((s, i) => `speculator${i+1}`)

export const playerRevealRoundsArray = [1, 6, 11, 16, 21, 26]

export const playerRevealRounds = {
    1: true,
    6: true,
    11: true,
    16: true,
    21: true,
    26: true,
}

export const defaultErrorMessage: Partial<MessageParams> = {
    errorMessage: "",
    errorObject: "",
    caller: "",
    timestamp: 0,
    message: "",
}
