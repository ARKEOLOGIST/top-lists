<template>
	<div class="maximize_size">
		<LoginCard v-if="!is_authed" />
		<MainView
			v-else
			:preview_mode="is_preview"
			:dev_mode="is_dev"
		/>
	</div>
</template>

<script>
// Import Misc JS things
import "./js/prototypes.js";

// Import components
import LoginCard from './components/LoginView.vue';
import MainView from './components/MainView.vue';

export default {
	name: 'App',
	components: {
		"LoginCard": LoginCard,
		"MainView": MainView
	},
	computed: {
		is_dev() {
			let params = new URLSearchParams(window.location.search.slice(1));
			return params.get(`dev`) != null && params.get(`dev`) !== `false`
		},
		is_preview() {
			let params = new URLSearchParams(window.location.search.slice(1));
			return params.get(`preview`) != null && params.get(`preview`) !== `false`
		},
		is_authed() {
			let params = new URLSearchParams(window.location.hash.slice(1));

			if ( this.is_dev || this.is_preview ) { return true; };

			if (params.get(`access_token`)) {
				if (sessionStorage.getItem(this.storage_key.state) === params.get(`state`)) {
					console.info(`State compare success`)

					// Modify sessionStorage
					sessionStorage.setItem(this.storage_key.token, params.get(`access_token`));
					sessionStorage.removeItem(this.storage_key.state);
					window.location.hash = ``;
				} else {
					console.error(`State compare failed`);
				};
			};

			if (sessionStorage.getItem(this.storage_key.token)) {
				return true;
			};

			return false
		}
	}
}
</script>

<style>
@import "./css/transitions.css";
@import "./css/theme/dark.css";
@import "./css/scrollbar.css";
@import "./css/tooltips.css";
@import "./css/inputs.css";

html, body, .maximize_size {
	user-select: none !important;
	font-family: var(--fonts);
	overflow-x: hidden;
	height: 100%;
	width: 100%;
	padding: 0;
	margin: 0;
}

body {
	background-color: var(--background);
	color: var(--background-text);
}
</style>