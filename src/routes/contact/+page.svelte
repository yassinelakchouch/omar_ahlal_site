<script lang="ts">
	import Arrow from '#lib/components/Arrow.svelte';
	import PhoneBar from '#lib/components/PhoneBar.svelte';
	import { magnet } from '#lib/interactions.js';
	import { SETTLE, kit } from '#lib/motion.svelte.js';
	import ShootChips from '#lib/components/ShootChips.svelte';
	import { send, type Kind } from '#lib/contact.js';
	import { EMAIL, NAME } from '#lib/copy.js';

	let kind = $state<Kind>('portrait');
	let name = $state('');
	let reach = $state('');
	let when = $state('');
	let idea = $state('');
	let phase = $state<'rest' | 'sending' | 'sent' | 'error'>('rest');
	let error = $state('');

	function drop(card: HTMLElement) {
		void kit().then(({ gsap }) =>
			gsap.timeline()
				.fromTo(card, { y: -60, rotation: -8, opacity: 0 }, { y: 0, rotation: -2, opacity: 1, ...SETTLE })
				.fromTo(card.querySelector('.pin'), { scale: 0 }, { scale: 1, duration: 0.25, ease: 'back.out(3)' }, '-=0.15')
		);
	}

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		if (phase === 'sending') return;
		phase = 'sending';
		error = '';
		const r = await send({ kind, name, reach, when, idea });
		if (r.ok) phase = 'sent';
		else {
			phase = 'error';
			error = r.message;
		}
	}
</script>

<svelte:head>
	<title>Contact · {NAME}</title>
	<meta name="description" content="Book a shoot with {NAME}: the kind of shoot, then three lines." />
</svelte:head>

<!-- O-05 07: the kind of shoot first, then three lines. -->
<section class="contact">
	<div class="left">
		<h1>let’s make<br />something</h1>
		<ShootChips bind:value={kind} />
		<a class="mail" href="mailto:{EMAIL}">{EMAIL}</a>
	</div>
	{#if phase === 'sent'}
		<div class="sent" role="status" {@attach drop}>
			<span class="pin" aria-hidden="true"></span>
			<p class="mono">Sent</p>
			<p class="big">Thank you, {name.trim().split(' ')[0] || 'friend'}.</p>
			<p>Omar answers within two days, by the email or number you gave.</p>
		</div>
	{:else}
		<form id="book" onsubmit={submit}>
			<label><span class="mono">Name</span><input bind:value={name} autocomplete="name" required maxlength="120" /></label>
			<label><span class="mono">Email or phone</span><input bind:value={reach} autocomplete="email" required minlength="3" maxlength="200" spellcheck="false" /></label>
			<label><span class="mono">When</span><input bind:value={when} maxlength="120" placeholder="Saturday 14 March, golden hour" /></label>
			<label><span class="mono">The idea</span><textarea bind:value={idea} required maxlength="3800" rows="3" placeholder="A portrait series for a book cover"></textarea></label>
			{#if error}<p class="error" role="alert">{error}</p>{/if}
			<button class="send" disabled={phase === 'sending'} {@attach magnet}>{#if phase === 'sending'}Sending…{:else}Send <Arrow glyph="↗" />{/if}</button>
		</form>
	{/if}
</section>

{#if phase !== 'sent'}<PhoneBar meta="Answer within two days" label={phase === 'sending' ? 'Sending…' : 'Send ↗'} type="submit" disabled={phase === 'sending'} onclick={() => document.querySelector<HTMLFormElement>('#book')?.requestSubmit()} />{/if}

<style>
	.contact {
		display: grid;
		grid-template-columns: 1.15fr 1fr;
		gap: 60px;
		padding: 20px 48px 96px;
	}
	.left {
		display: grid;
		gap: 22px;
		align-content: start;
		justify-items: start;
	}
	h1 {
		margin: 0;
		font-weight: 900;
		font-size: clamp(60px, 8.9vw, 128px);
		line-height: 0.82;
		letter-spacing: -0.06em;
	}
	.mail {
		font-weight: 600;
		font-size: 22px;
		color: var(--ember);
		text-underline-offset: 5px;
	}
	form,
	.sent {
		display: grid;
		gap: 22px;
		align-content: start;
		padding-top: 24px;
	}
	label {
		display: grid;
		gap: 6px;
	}
	label .mono {
		color: var(--muted);
	}
	input,
	textarea {
		--autofill: var(--paper);
		padding: 6px 0 8px;
		border: 0;
		border-bottom: 1.5px solid var(--ink);
		border-radius: 0;
		background: transparent;
		font: inherit;
		font-size: 20px;
		color: var(--ink);
		resize: none;
		field-sizing: content;
		min-height: 2lh;
		--autofill: var(--paper);
	}
	input:focus,
	textarea:focus {
		outline: none;
		border-bottom-color: var(--ember);
		box-shadow: 0 1.5px 0 var(--ember);
	}
	input::placeholder,
	textarea::placeholder {
		color: #8a8a8a;
	}
	.error {
		margin: 0;
		color: #a32a2a;
	}
	.send {
		gap: 6px;
		display: inline-flex;
		align-items: center;
		justify-self: start;
		height: 46px;
		padding: 0 22px;
		border: 0;
		border-radius: 999px;
		background: var(--ink);
		color: var(--paper);
		font-family: var(--mono);
		font-size: 13px;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		cursor: pointer;
	}
	.send:disabled {
		opacity: 0.6;
	}
	.sent {
		position: relative;
		align-self: start;
		margin-top: 24px;
		padding: 36px 28px 40px;
		rotate: -2deg;
		background: var(--mat);
		box-shadow: 0 14px 28px rgba(17, 17, 17, 0.18);
	}
	.pin {
		position: absolute;
		left: 50%;
		top: 8px;
		width: 22px;
		height: 22px;
		translate: -50% 0;
		border-radius: 50%;
		background: radial-gradient(circle at 35% 35%, #fff, #cfcfcf);
		box-shadow: 0 3px 6px rgba(0, 0, 0, 0.25);
	}
	.sent p {
		margin: 0;
	}
	.big {
		font-weight: 900;
		font-size: 40px;
		line-height: 1;
		letter-spacing: -0.04em;
	}
	@media (max-width: 760px) {
		.contact {
			grid-template-columns: 1fr;
			gap: 16px;
			padding: 6px 16px 160px;
		}
		form {
			padding-top: 0;
			gap: 16px;
		}
		.send {
			display: none;
		}
		.mail {
			order: 3;
			font-size: 18px;
		}
	}
</style>
