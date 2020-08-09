import Vue from 'vue';
import VTooltip from 'v-tooltip';
import VueEllipseProgress from 'vue-ellipse-progress';
import App from './App.vue';

Vue.config.productionTip = false;
VTooltip.enabled = window.innerWidth > 768

// Third-party plugins
Vue.use(VTooltip);
Vue.use(VueEllipseProgress, `percent`);

// global mixings
Vue.mixin({
	data() {return {
		api_url: `https://api.spotify.com/v1`,
		auth_redirect: process.env.NODE_ENV === `production` ? `https://oliver.akins.me/top-lists` : `http://localhost:8080`,
	}},
	methods: {
		css_var(var_name) {
			return getComputedStyle(document.documentElement).getPropertyValue(var_name);
		},
	}
});


// eslint-disable-next-line
const app = new Vue({
	render: h => h(App),
}).$mount('#app')
