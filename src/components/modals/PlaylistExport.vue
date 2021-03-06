<template>
	<transition name="fade" @after-enter="content = true">
		<div
			v-if="container"
			class="modal-container"
			@click.self="content = false"
		>
			<transition name="burst" @after-leave="$emit('close')">
				<div v-if="content" class="modal">
					<h2 class="center">Export Playlist</h2>
					<div class="modal-form">
						<div class="input-row">
							<input
								id="playlist-name"
								v-model="name"
								type="text"
								name="Playlist Name"
							>
							<span class="char_counter">
								{{ name.length }}/100
							</span>
						</div>
						<div class="input-row">
							<textarea-autosize
								v-model="description"
								placeholder="Playlist Description"
								:min-height="100"
							/>
						</div>
						<div class="input-row">
							<select v-model="is_public">
								<option :value="false">Private Playlist</option>
								<option :value="true">Public Playlist</option>
							</select>
							<button
								:disabled="!can_export"
								@click.self="create_playlist()"
							>
								Create Playlist
							</button>
						</div>
					</div>
					<div
						v-if="success"
						class="alert success"
					>
						<a :href="playlist.url">Playlist</a> created successfully!
					</div>
				</div>
			</transition>
		</div>
	</transition>
</template>

<script>
import * as axios from "axios";

export default {
	name: `PlaylistExportModal`,
	props: {
		config: {
			type: Object,
			required: true,
		},
		user_id: {
			type: String,
			required: true,
		},
		data: {
			type: Array,
			required: true,
		}
	},
	data() {return {
		container: false,
		content: false,
		create_button_enabled: true,
		name: ``,
		is_public: false,
		description: `Playlist auto-generated by Top Lists for Spotify`,
		success: false,
		playlist: {
			id: null,
			url: null,
		},
		exported_settings: null,
	}},
	mounted() {
		let date = new Date();
		let month = date.getMonth() + 1;
		month = month < 10 ? `0${month}` : month;
		this.name = `Top ${this.config.limit || 10} - ${date.getFullYear()}/${month}/${date.getDate()}`;

		this.$nextTick(function() {
			this.container = true;
		});
	},
	computed: {
		payload() {
			return {
				name: this.name,
				description: this.description,
				public: this.is_public,
			};
		},
		can_export() {

			// Spotify has a name length of 100 characters, ensure we don't error
			if (this.name.length > 100) {
				return false;
			};

			if (this.exported_settings) {
				return (
					this.payload.name != this.exported_settings.name
					|| this.payload.description != this.exported_settings.description
					|| this.payload.is_public != this.exported_settings.is_public
				)
			};
			return true;
		}
	},
	methods: {
		create_playlist() {

			let payload = this.payload
			this.exported_settings = payload;

			// Create the Spotify playlist (no tracks yet)
			axios.post(
				`${this.api_url}/users/${this.user_id}/playlists`,
				JSON.stringify(payload),
				{ headers: {
					Authorization: `Bearer ${this.api_token}`,
					"Content-Type": `application/json`
				} }
			)
			.then(response => {
				this.playlist.id = response.data.id;
				this.playlist.url = response.data.external_urls.spotify;
				this.populate_playlist()
			})
			.catch((err) => {
				if (err.response.status == 401) {
					return this.auth_expired(err);
				};
				console.error(err);
			})
		},
		populate_playlist() {
			let payload = { uris: [] };

			for (var track of this.data) {
				payload.uris.push(track.uri);
			};

			axios.post(
				`${this.api_url}/playlists/${this.playlist.id}/tracks`,
				payload,
				{ headers: {
					Authorization: `Bearer ${this.api_token}`,
					"Content-Type": `application/json`
				} }
			)
			.then(response => {
				this.success = true;
			})
			.catch((err) => {
				if (err.response.status == 401) {
					return this.auth_expired(err);
				};
				console.error(err)
			})
		},
	},
}
</script>

<style scoped>
.modal-container {
	background-color: var(--modal-container-background);
	justify-content: center;
	align-items: center;
	position: fixed;
	display: flex;
	height: 100vh;
	width: 100vw;
	z-index: 10;
	left: 0;
	top: 0;
}

.modal {
	background-color: var(--modal-background);
	border-radius: var(--corner-rounding);
	color: var(--modal-text);
	text-align: center;
	overflow-y: auto;
	max-height: 85%;
	padding: 0 15px;
	z-index: 11;
	width: 90%;
}

div.modal-form {
	flex-direction: column;
	align-items: center;
	display: flex;
}

input#playlist-name {
	padding-right: 80px;
	font-size: 16px;
}

.input-row {
	justify-content: space-evenly;
	margin-bottom: 10px;
	position: relative;
	flex-wrap: wrap;
	display: flex;
	width: 100%;
}

.char_counter {
	position: absolute;
	bottom: 15px;
	right: 15px;
}

.success {
	background-color: var(--success-background);
	border-radius: var(--corner-rounding);
	border-color: var(--success);
	color: var(--success-text);
	border-style: solid;
	margin-bottom: 10px;
	border-width: 2px;
	padding: 5px;
}

.success a {
	color: var(--success-accent);
}

button {
	margin: 10px;
}


@media only screen and (min-width: 768px) {
	.modal {
		width: 50%;
		max-height: 75%;
	}
}
</style>