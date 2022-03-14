<script lang="ts">
    import Icon from "$lib/components/icon/icon.svelte";
    export let value: number = 48;
    export let label: string = 'label';
    let localValue = value
    export let onChange = (value) => {
        console.log('exporting: ', value)
    }

    function onLocalChange({target}){
        updateLocalValue(target.value)
    }

    function onLocalInput({target}){
        console.log('local input: ', target.value)
        updateLocalValue(target.value || 0)
    }
    
    function updateLocalValue(value){
        localValue = value
        if(onChange && typeof onChange === 'function'){
            onChange(value)
        }
    }

    function increment({target}){
        console.log('will udpate local value with a type of: ', typeof localValue)
        if(typeof localValue === 'string'){
            updateLocalValue(parseInt(localValue) + 1)
        }
        else{
            updateLocalValue((localValue) + 1)
        }
        
    }

    function decrement({target}){

        if(typeof localValue === 'string'){
            updateLocalValue((localValue) - 1)
        }
        updateLocalValue(localValue - 1)
    }
</script>

<div class="value-changer value-container">
    <div class="value flex fd-col" data-diff={localValue !== value}>
        <span class="label">{label}</span>
        <input 
            class="value-input flex" 
            type="number" 
            value={localValue} 
            on:change={onLocalChange} 
            on:input={onLocalInput} 
        />
        <!-- {#if localValue !== value}
        {:else}
        {/if} -->
        <!-- <p>{value}</p> -->
    </div>
    <div class="controls">
        <div class="control-button flex" on:click={increment}>
            <Icon icon="chevronUp" />
        </div>
        <div class="control-button flex" on:click={decrement}>
            <Icon icon="chevronDown" />
        </div>
    </div>
</div>

<style>
    .value-changer {
        background: lightgray;
        width: 100%;
        height: 100%;
        border-radius: 6px;
        position: relative;
        overflow: hidden;
        display: grid;
        grid-template-columns: 1fr 0.3fr;
    }

    .value {
        font-size: 1.25em;

    }

    .value-input {
        border: none;
        width: 100%;
        position: relative;
        left: 0;
        text-align: center;
        line-height: 0.75;
        font-size: 1.2em;
        background: whitesmoke;
        height: 30px;
    }

    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
    }

    /* Firefox */
    input[type=number] {
    -moz-appearance: textfield;
    }

    .value span {
        text-align: center;
    }

    .value .label {
        font-size: 50%;
        line-height: 1;
        opacity: 0.5;
    }

    .controls {
        height: 100%;
        width: 35px;
        /* background: red; */
        position: absolute;
        top: 0;
        bottom: 0;
        right: 0;
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: 1fr 1fr;
        grid-gap: 3px;
        padding: 5px;
    }

    .control-button {
        background: lightgray;
        border-radius: 4px;
    }
</style>