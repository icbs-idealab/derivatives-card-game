<div class="stretch-fixed fill flex fd-col bg-dark-modal">
    <p>{loadingText}</p>
    <div class="is-loading loading-bar"></div>
</div>

<script lang="ts">
    export let loadingText: string = 'loading'
</script>

<style>
    div {
        color: rgb(65, 65, 65);
    }

    p {
        font-size: 1.15em;
        /* text-transform: uppercase; */
        font-weight: 300;
        color: white;
        margin-bottom: 10px;
    }
    .loading-bar {
        height: 8px;
        width: 240px;
        border-radius: 15px;
        border: solid thin rgba(180, 180, 180, 0.8)
    }
</style>