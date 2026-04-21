//#region src/core/messenger.ts
function e() {
	let e = null, t = "loading", n = !1, r = [], i = [];
	return {
		get status() {
			return t;
		},
		set status(e) {
			t = e;
		},
		get iframeLoaded() {
			return n;
		},
		set iframeLoaded(e) {
			n = e;
		},
		setIframeLoaded() {
			n = !0;
		},
		setConnection(r) {
			e = r, r.then(() => {
				t = "connected";
			}).catch(() => {
				t = n ? "no-plugin" : "error";
			});
		},
		async send(t) {
			if (!e) {
				console.warn("[@sprlab/microfront] sendMessage called before connection was established");
				return;
			}
			await (await e).onShellMessage(t);
		},
		handleRemoteMessage(e) {
			r.forEach((t) => t(e.payload, e.metadata));
		},
		handleRouteChange(e) {
			i.forEach((t) => t(e));
		},
		onMessage(e) {
			r.push(e);
		},
		onRouteChange(e) {
			i.push(e);
		}
	};
}
//#endregion
export { e as t };
