//#region src/core/types.ts
var e = /* @__PURE__ */ function(e) {
	return e.Loading = "loading", e.Connected = "connected", e.Error = "error", e.NoPlugin = "no-plugin", e;
}({});
//#endregion
//#region src/core/messenger.ts
function t() {
	let t = null, n = e.Loading, r = !1, i = [], a = [], o = [], s = (e) => {
		e !== n && (n = e, o.forEach((t) => t(e)));
	};
	return {
		get status() {
			return n;
		},
		set status(e) {
			s(e);
		},
		get iframeLoaded() {
			return r;
		},
		set iframeLoaded(e) {
			r = e;
		},
		setIframeLoaded() {
			r = !0;
		},
		setConnection(n) {
			t = n, n.then(() => s(e.Connected)).catch(() => {
				s(r ? e.NoPlugin : e.Error);
			});
		},
		async send(e) {
			if (!t) {
				console.warn("[@sprlab/microfront] sendMessage called before connection was established");
				return;
			}
			await (await t).onShellMessage(e);
		},
		handleRemoteMessage(e) {
			i.forEach((t) => t(e.payload, e.metadata));
		},
		handleRouteChange(e) {
			a.forEach((t) => t(e));
		},
		onMessage(e) {
			i.push(e);
		},
		onRouteChange(e) {
			a.push(e);
		},
		onStatusChange(e) {
			o.push(e);
		}
	};
}
//#endregion
export { e as n, t };
