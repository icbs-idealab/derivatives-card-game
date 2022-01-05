<script lang="ts">
    export let value: number = 0;
    export let label: string = '';
</script>

<div class="value-display value-container">
    
    {#if value !== undefined && value !== null}
        <div class="value flex fd-col">
            {#if label}
                <span class="label">{label}</span>
            {/if}
            <p>{value}</p>
        </div>
    {:else}
        <div class="value is-loading"></div>
    {/if}

</div>

<style>
    .value-display {
        background: lightgray;
        width: 100%;
        height: 100%;
        border-radius: 6px;
        position: relative;
        overflow: hidden;
        display: grid;
        grid-template-columns: 1fr;
    }

    .value {
        font-size: 1.25em;
    }

    .value  p {
        margin: 5px 0 0;
        line-height: 0.75;
    }

    .value span {
        text-align: center;
    }

    .value .label {
        font-size: 50%;
        line-height: 1;
    }
</style>