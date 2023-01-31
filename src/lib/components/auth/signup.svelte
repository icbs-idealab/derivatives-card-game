<script lang="ts">
    import Button from "$lib/components/button/button.svelte";
    import TextArea from "$lib/components/input/text-area.svelte";
    import TextInput from "$lib/components/input/text-input.svelte";
	import PasswordInput from "../input/password-input.svelte";
    export let email: string = ''
    export let password: string = ''
    export let updateEmail = (value: string) => {}
    export let updatePassword = (value: string) => {}
    export let disableSubmit= false

    function onUpdateEmail({target}: any){ 
        updateEmail(target.value)
    }
    function onUpdatePassword({target}: any){ 
        updatePassword(target.value)
    }

    export let onSubmit = (submission: any) => {
        console.log('submitting')
        console.table(submission)
    }

    function submit(){
        disableSubmit = true
        if(onSubmit && typeof onSubmit === 'function'){
            onSubmit({email, password})
        }
    }
</script>

<div class="request-access">
    <TextInput value={email} onUpdate={onUpdateEmail} placeholder="Enter your email" />
    <PasswordInput value={password} onUpdate={onUpdatePassword} placeholder="Enter your Password" />
    <div class="button-container">
        <Button type="proceed" label="sign-up" action={submit} disabled={disableSubmit} />
    </div>
</div>

<style>
    .request-access {
        width: 100%;
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: repeat(3, auto);
        grid-gap: 15px;
        padding-top: 30px;
    }
</style>