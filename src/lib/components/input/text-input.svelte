<div class="input" style={style}>
    <input 
        type="text"
        placeholder={placeholder}
        on:input={onUpdate}
        value={value}
    />
</div>

<script lang="ts">
    export let value: string = 'Initial Value'
    export let placeholder: string = 'Enter your text here'
    export let onUpdate: (e: any) => any = (e) => {
        console.log('updated value: ', e.target.value)
    }
    export let style: string = '';
</script>