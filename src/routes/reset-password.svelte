<script lang="ts">
    import Button from "$lib/components/button/button.svelte";
    import TextInput from "$lib/components/input/text-input.svelte";
    import { setLoadingModal } from "$lib/actions";
    import type { AppErrors } from "$lib/types";
    import { appErrors } from "$lib/state";
import { redirect } from "$lib/helpers";
    let email: string = ''

    let success = false
    let error = null

    function onUpdateEmail({target}){ 
        email = target.value
    }


    async function submit(){
        setLoadingModal(true)
        const results = await fetch("/api/send-password-reset", {
            method: "POST",
            body: JSON.stringify({email})
        })

        const parsed = await results.json()

        console.log('parsed: ', parsed)

        if(parsed.error){
             error = {
                message: parsed.error.message,
                code: parsed.error.status,
            }
                // appErrors.set([ers])
                setLoadingModal(false)
        }
        else {
            success = true
            setLoadingModal(false)
        }
    }

    function retry(){
        error = null
        success = false
    }

</script>

<div class="page flex fd-col jc-start">
    <div class="reset-container">
        {#if !error && !success}
            <div class="title flex fd-col jc-start">
                <h1>Reset Password</h1>
                <p>If you've forgotten your password, please enter your registered email in the input provided and then click the reset below:</p>
            </div>
            <TextInput value={email} onUpdate={onUpdateEmail} placeholder="Enter your email" />
            <div class="button-container">
                <Button type="proceed" label="Reset" action={submit} />
            </div>
        {:else if success}
            <div class="title flex fd-col jc-start">
                <h1>Reset Email Sent</h1>
                <p>Please check your inbox for further instructions.</p>
                <div class="button-container">
                    <Button 
                        label="Retry"
                        action={() => redirect('/')}
                    />
                </div>    
            </div>
        {:else if error}
            <div class="title flex fd-col jc-start">
                <h1>Error</h1>
                <p>{error.message}</p>
            </div>
            <div class="button-container">
                <Button 
                    label="Retry"
                    action={retry}
                />
            </div>
        {/if}
    </div>
</div>

<style>
    .page {
        height: 100vh;
        padding-top: 100px;
    }
    .reset-container {
        width: 100%;
        min-width: 300px;
        max-width: 600px;
        display: block;
        /* display: grid;
        grid-template-columns: 1fr; */
        /* grid-template-rows: auto 1fr 1fr auto; */
        grid-gap: 8px;
        background: white;
        padding: 30px;
        border-radius: 8px;
    }

    h1, p {
        width: 100%;
        text-align: left;
    }

    h1 {
        font-size: 1.3em;
        font-weight: bold;
    }
    p{
        font-size: 0.9em;
    }

    .button-container {
        margin-top: 20px;
    }

    .title {
        /* font-size: 1.15em; */
        margin: 0 0 25px;
        text-align: left;
        width: 100%;
    }

</style>