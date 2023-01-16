import type { RealtimeChannel } from "@supabase/supabase-js"

// INBUILT

// svelte.JSX.ChangeEventHandler<HTMLInputElement>


// MY TYPES

export type SuitName = 'clubs' | 'diamonds' | 'hearts' | 'spades'
export type SpeculatorRoles = 'speculator1' | 'speculator2' | 'speculator3' | 'speculator4' | 'speculator5' | 'speculator6'
export type PlayerRole = SuitName | SpeculatorRoles | 'guest' | ""

export type SuitSymbol = '&clubs' | '&diamonds' | '&hearts' | '&spades' | '&#128065' | '&#129300' | '&#128540'

export interface JoinGameParameters {
    playerName: string
    gameId: string
}

export interface MarketButtonParameters {
    name: SuitName
    icon: SuitSymbol
}

export interface AppUser {
    id: string
    playerName: string
    email: string
    admin: boolean
    role: PlayerRole
    game: string
}

export interface MenuItem {
    label: string
    icon: string
    active: boolean
    action: () => void
}

export interface AppError {
    message: string
    code: string
}

export type AppErrors = AppError[]

export interface AppIssue {
    id: string
    description: string
    title: string
    steps: issueStep[]
    loggedIn: boolean
    inGame: boolean
    browser: string
}

export interface CardHand {
    clubs: number
    diamonds: number
    hearts: number
    spades: number
}

type rateName = 'clubs_rate' | 'diamonds_rate' | 'hearts_rate' | 'spades_rate'
export type FinalScore = {
    [index: string]: {
        balance: number
        contracts: {
            [index: SuitName]: number
        }
        lastRevealed: SuitName
    }
}

export interface AppGame {
    id?: string // optional as only present in the supabase record
    game_id: string
    admin_id: string
    admin: {
        user_id: string
        player_name: string
        role: string
    }
    round: number
    started: boolean
    ended: boolean
    completed: boolean
    maximum_spread: number
    deck: GameDeck
    final_scores?: FinalScore
}

// DECK

type Holder = 'game' | 'clubs' | 'diamonds' | 'spades' | 'hearts'

export interface GameCard {
    suit: SuitName
    revealed: boolean
    revealedOn: Date | null
    heldBy: Holder
}

export interface GameDeck {
    revealed: SuitName[]
    held: SuitName[]
}

//

export interface GameDeckCount {
    revealed: 0
    held: 0
}

//
export type RevealRoundNumnber = 1 | 6 | 11 | 21 | 26

interface RevealRounds {
    [index: number | string]: string
    1: string,
    6: string,
    11: string,
    21: string,
    26: string,
}

export interface ActionCount {
    [index: string | number]: number
}

export interface AppGamePlayer {
    user_id: string
    player_name: string
    hand: SuitCount
    revealed: RevealRounds
    // role: string // for ref/convenience only, otherwise derived from column
    role: PlayerRole // for ref/convenience only, otherwise derived from column
    buy: number
    sell: number
    game_id: string
    is_admin: boolean
    bot_action_count?: ActionCount
    rate_change_log: RateChangeLog[]
}

export interface ParsedRateChangeLogTime {
    day: number | string
    month: number | string
    year: number | string
    hour: number | string
    minute: number | string
    second: number | string
}

export interface RateChangeLog {
    buy: number
    sell: number
    time: number 
    parsedTime?: ParsedRateChangeLogTime
    role?: SuitName
    round?: number
    player_id?: string
    player_name?: string
}


export interface AppLobbyPlayer extends AppGamePlayer {
    create_at?: any
    game_id?: string
}

export interface LobbyPlayerBasicInfo {
    player_name: string
    user_id: string
    game_id?: string
    is_bot?: boolean
}

export interface UnassignedLobbyPlayer {
    user_id: string
    game_id: string
    player_name: string
    id_old: number
    create_at?: any
}

export interface LobbyRequirements {
    gamePlayers: any
    lobbyPlayers: any
}

export interface AppGameRole extends AppGamePlayer {
    role?: PlayerRole
}

export interface SuitHands {
    clubs: SuitCount
    diamonds: SuitCount
    hearts: SuitCount
    spades: SuitCount
}

export interface SuitReveals {
    clubs: string
    diamonds: string
    hearts: string
    spades: string
}

export interface SuitRevealsBool {
    clubs: boolean
    diamonds: boolean
    hearts: boolean
    spades: boolean
}

export interface SuitCount {
    clubs: number
    diamonds: number
    hearts: number
    spades: number
}

export interface BotSuitCount {
    [index: SuitName]: number
    clubs: number
    diamonds: number
    hearts: number
    spades: number
}

export type GetHandProps = Partial<SuitCount>

interface RevealedRoundSuits {
    [index: string]: GameCard | null
}

export type AppGamePlayers = AppGamePlayer[]

export type AppGamePlayersByRole = {
    // [index: PlayerRole]: AppGameRole
    // [index: string]: AppGameRole | AppGamePlayer
    [index: string]: AppGamePlayer
}

export interface OldGamePlayers {
    game_id: string
    clubs: AppGameRole
    diamonds: AppGameRole
    hearts: AppGameRole
    spades: AppGameRole
    speculator1: AppGameRole
    speculator2: AppGameRole
    speculator3: AppGameRole
    speculator4: AppGameRole
    speculator5: AppGameRole
    speculator6: AppGameRole
}

export type GameUpdateProps = Partial<AppGame>

export interface NewGameProps {
    user: SupabaseUser
    maximumSpread: number,
    creatorRole: SuitName,
    playerName: string,
}

export interface CreatedGameResult {
    data: any
    error: any
    success: boolean
}

export interface PlayerGameResult {
    [index: string]: {
        balance: number, 
        contracts: any, 
        lastRevealed: string
    }
}

export type GamePlayers = AppUser[]

export interface SupabaseUser {
    app_metadata: {
        provider?: string
        [key: string]: any
    }
    aud: string
    confirmation_sent_at?: string
    confirmed_at?: string
    created_at: string
    email?: string
    email_confirmed_at?: string
    id: string
    identities?: any[]
    last_sign_in_at?: string
    phone?: string
    role?: string
    updated_at?: string
    user_metadata: {
        [index: string]: any
    }
}

export interface AuthCheckResult {
    success: boolean
    user: SupabaseUser
}

export interface SupabaseAuthSession {
    currentSession: {
        access_token: string
        expires_at: number
        expires_in: number
        provider_token: string
        refresh_token: string
        token_type: string
        user: SupabaseUser
    }
    expiresAt: number
}

export type PotentialAuthToken = string | SupabaseAuthSession

export interface CreateGameResults {
    data: any
    error: any
    type: string
    success: boolean
}

export type EndGameFunction = (game_id: string) => Promise<any>

// TRADES

export interface GameTrade {
    game_id: string
    market: SuitName | ''
    price: number
    round: number
    actor: string
    buy: boolean
}

export type TradeLedger = GameTrade[]

export type TradeValue = null | number
export interface TradeValues {
    [index: string]: TradeValue
}

export interface MessageParams {
    caller: string
    errorMessage: string
    errorObject: string
    timestamp: number
    message: string
    params?: string
}

export interface GameArchive {
    game_id: string
    game: string
    players: string
    trades: string
    participants: string
}

export type GameEndState = 'Game Completed' | 'Game Ended' | ''

export interface ServerSubscriptions {
    [index: string]: null | RealtimeChannel
}
export interface Bots {
    hearts: LobbyPlayerBasicInfo
    clubs: LobbyPlayerBasicInfo
    spades: LobbyPlayerBasicInfo
    diamonds: LobbyPlayerBasicInfo
}

export type GamePhase = 'early' | 'mid' | 'late' | 'end'
export type GamePhases = GamePhase[]

export interface BotRateAdjustments {
    early: {
        [index: number]: number
    }
    mid: {
        [index: number]: number
    }
    late: {
        [index: number]: number
    }
    end: {
        [index: number]: number
    }
}

export interface BotRates {
    buy: number
    sell: number
    round?: number
}

export interface BotParams {
    early_game_frequency: number
    mid_game_frequency: number
    late_game_frequency: number
    end_game_frequency: number
    early_game_max_trades: number
    mid_game_max_trades: number
    late_game_max_trades: number
    end_game_max_trades: number

    mid_game_start_round: number
    late_game_start_round: number
    end_game_start_round: number

    frequency_multiplier: number

    min_sell_rate: number
    max_sell_rate: number
    min_buy_rate: number
    max_buy_rate: number
}

export interface NumberRange {
    min: number
    max: number
}

export interface BotTradeData {
    market: SuitName
    type: string
    price: number
}

export interface AdminControlButtonsFn {
    action: (...props: any) => any
    disabled?: boolean
}
export interface AdminControlButtonsWoIcon extends AdminControlButtonsFn {
    label: string
}

export interface AdminControlButtonsWoLabel extends AdminControlButtonsFn {
    icon: string
}

type Only<T, U> = {
    [P in keyof T]: T[P];
  } & {
    [P in keyof U]?: never;
  };
  
type Either<T, U> = Only<T, U> | Only<U, T>;
  
// export type AdminControlButton = AdminControlButtonsWoIcon | AdminControlButtonsWoLabel | (AdminControlButtonsWoIcon & AdminControlButtonsWoLabel)
export type AdminControlButton = Either<AdminControlButtonsWoIcon | AdminControlButtonsWoLabel>

//

export interface TextInputEvent extends Event {
    currentTarget: HTMLInputElement
    target: HTMLInputElement
}
