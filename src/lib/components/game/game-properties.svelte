<div class="game-properties flex">
    <div class="game-round flex fd-col">
        <p>Round</p>
        <p>{round}/33</p>
    </div>
    <div class="game-players flex jc-end">
        <!-- <Players /> -->
    </div>
</div>

<script lang="ts">
    import Players from "./players.svelte";
    export let round: number | null = 0
</script>