import { n as e } from "./connection-BnSwcIhr.js";
//#region src/vue/routerAdapter.ts
function t(e) {
	return {
		getCurrentPath() {
			return e.currentRoute?.value?.fullPath ?? e.currentRoute?.fullPath ?? "/";
		},
		replace(t) {
			e.replace(t);
		},
		afterEach(t) {
			typeof e.afterEach == "function" && e.afterEach((e) => {
				t(e.fullPath);
			});
		}
	};
}
//#endregion
//#region src/vue/messaging.ts
var n = null;
function r(e) {
	n = e;
}
async function i(e) {
	if (!n) {
		console.warn("[@sprlab/microfront] send called before connection was established");
		return;
	}
	await n.send(e);
}
function a(e) {
	n && n.onMessage(e);
}
//#endregion
//#region src/vue/sprRemote.ts
var o = { install(n, i = {}) {
	let { router: a, ...o } = i, s = a ? t(a) : void 0;
	r(e({
		...o,
		router: s
	}));
} }, s = { init(n = {}) {
	let { router: i, ...a } = n, o = i ? t(i) : void 0;
	r(e({
		...a,
		router: o
	}));
} };
//#endregion
export { t as a, i, o as n, a as r, s as t };
