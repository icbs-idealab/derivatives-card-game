import type { AppGame, AppGamePlayer, AppGamePlayers, CardHand, PlayerRole, SupabaseUser, SuitName, SuitReveals, SuitRevealsBool, MessageParams, LobbyPlayerBasicInfo, Bots, BotParams, GamePhases, BotTradeData, ActionCount } from "./types";
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

function createBotActionCount(){
    let count: ActionCount = {}
    new Array(33).fill(true).forEach((_, i: number) => {
        count[String(i)] = 0
    })
    return count
}

export const defaultGamePlayer: AppGamePlayer = {
    user_id: '',
    game_id: '',
    player_name: '',
    hand: {...emptyHand},
    revealed: {...emptyReveals},
    role: "",
    buy: 30,
    sell: 24,
    is_admin: false,
    // bot_action_count: {"1":0,"2":0,"3":0,"4":0,"5":0,"6":0,"7":0,"8":0,"9":0,"10":0,"11":0,"12":0,"13":0,"14":0,"15":0,"16":0,"17":0,"18":0,"19":0,"20":0,"21":0,"22":0,"23":0,"24":0,"25":0,"26":0,"27":0,"28":0,"29":0,"30":0,"31":0,"32":0,"33":0},
    // bot_action_count: {1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0,10:0,11:0,12:0,13:0,14:0,15:0,16:0,17:0,18:0,19:0,20:0,21:0,22:0,23:0,24:0,25:0,26:0,27:0,28:0,29:0,30:0,31:0,32:0,33:0},
    bot_action_count: createBotActionCount(),
    rate_change_log: []
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

export const playerRevealRounds: {[index: number]: boolean} = {
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


export let bots: Bots = {
    hearts: {
        user_id: 'heart-bot',
        player_name: 'Hearts Bot',
        game_id: '',
        is_bot: true
    },
    diamonds: {
        user_id: 'diamonds-bot',
        player_name: 'Diamonds Bot',
        game_id: '',
        is_bot: true
    },
    spades: {
        user_id: 'spades-bot',
        player_name: 'Spades Bot',
        game_id: '',
        is_bot: true
    },
    clubs: {
        user_id: 'clubs-bot',
        player_name: 'Clubs Bot',
        game_id: '',
        is_bot: true
    },
}

// for future update
export const v2SupabaseTables = {
    games: 'v2_game',
    users: 'v2_users',
    archives: 'v2_archives',
    trades: 'v2_trades',
    admins: 'v2_admins',
}

export const gamePhases: GamePhases = [
    'early',
    'mid',
    'late',
    'end',
]

export const defaultBotParams: BotParams = {
    early_game_frequency: 7000,
    mid_game_frequency: 5000,
    late_game_frequency: 3500,
    end_game_frequency: 2000,
    early_game_max_trades: 4,
    mid_game_max_trades: 10,
    late_game_max_trades: 18,
    end_game_max_trades: 30,

    mid_game_start_round: 15,
    late_game_start_round: 24,
    end_game_start_round: 29,

    frequency_multiplier: 1,

    min_sell_rate: 1,
    max_sell_rate: 250,
    min_buy_rate: 5,
    max_buy_rate: 300,
}

export const defaultBotTradeData: BotTradeData = {
    market: "clubs",
    type: "buy",
    price: 0,
}

export function getDefaultBotTrade(){
    return {
        market: "clubs",
        type: "buy",
        price: 0,    
    } as BotTradeData
}