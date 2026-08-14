import { n as e, t } from "./messenger-C-bB4YoP.js";
//#region src/nuxt2-shell/messenger.ts
function n() {
	let e = t(), n = {
		status: e.status,
		iframeLoaded: e.iframeLoaded,
		setIframeLoaded() {
			e.setIframeLoaded(), n.iframeLoaded = !0;
		},
		setConnection(t) {
			e.setConnection(t);
		},
		async send(t) {
			await e.send(t);
		},
		handleRemoteMessage(t) {
			e.handleRemoteMessage(t);
		},
		handleRouteChange(t) {
			e.handleRouteChange(t);
		},
		onMessage(t) {
			e.onMessage(t);
		},
		onRouteChange(t) {
			e.onRouteChange(t);
		},
		onStatusChange(t) {
			e.onStatusChange(t);
		}
	};
	return e.onStatusChange((e) => {
		n.status = e;
	}), n;
}
//#endregion
export { e as ConnectionStatus, n as createRemoteMessenger };
