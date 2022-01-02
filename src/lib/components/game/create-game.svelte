<script lang="ts">
    import Button from "$lib/components/button/button.svelte";
    import FormLabel from "$lib/components/input/form-label.svelte";
    import NumericInput from "$lib/components/input/numeric-input.svelte";
    import TextInput from "$lib/components/input/text-input.svelte";
    // import Container from "$lib/layout/container.svelte";
    import type { MarketButtonParameters } from "$lib/types";
    import { createNewGame } from "$lib/actions";
    import MarketSelector from "./market-selector.svelte";
    import { browser } from "$app/env";
    import { goto } from "$app/navigation";
    import { currentUser } from "$lib/state";
    import { get } from "svelte/store";
    export let playerName: string = ''
    // export let gameId: string = ''
    export let maximumSpread: number = 4

    // market / role
    export let market: MarketButtonParameters = {
        name: 'clubs',
        icon: '&clubs',
    }

    export let updatePlayerMarket = (selected: MarketButtonParameters) => {
        console.log('current: ', market)
        console.log('selected: ', selected)
    }
    function onUpdatePlayerMarket(selectedMarket){
        updatePlayerMarket(selectedMarket)
    }

    // update player name
    export let updatePlayerName = (value: string) => {}
    function onUpdatePlayerName({target}){
        updatePlayerName(target.value)
    }

    // update game id
    export let updateMaximumSpread = (value: number) => {}
    function onUpdateMaximumSpread(e){
        updateMaximumSpread(e.target.value)
    }
    // join game
    export let submit = async () => {
        console.log('creating new game...')
        await createNewGame({
            user: get(currentUser),
            creatorRole: market.name,
            maximumSpread,
            playerName
        })
        .then(() => {
            browser && goto('/game') && location.reload()
            // browser && location.reload()
        })
        .catch(error => {
            console.log('error creating new game: ', error)
        })
    }
</script>

<div class="create-game">
    <FormLabel value="Select your Role" />
    <MarketSelector onSelect={onUpdatePlayerMarket} selected={market} />
    <!-- Creator Player Name -->
    <FormLabel value="Select Player Name" />
    <TextInput value={playerName} onUpdate={onUpdatePlayerName} placeholder="Enter a player name" />
    <!-- set maximum-spread -->
    <FormLabel value="Set the maximum spread" />
    <!-- <TextInput value={maximumSpread} onUpdate={onUpdateMaximumSpread} placeholder="Enter the maximum spread" /> -->
    <NumericInput value={maximumSpread} onUpdate={onUpdateMaximumSpread} placeholder="Enter maximum spread" />
    <!-- submit -->
    <div class="button-container">
        <Button type="proceed" label="Create Game" action={submit} />
    </div>
</div>

<style>
    .button-container {
        width: 160px;
    }

    .create-game {
        width: 100%;
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: repeat(3, auto);
        grid-gap: 15px;
        padding-top: 30px;
    }
</style>