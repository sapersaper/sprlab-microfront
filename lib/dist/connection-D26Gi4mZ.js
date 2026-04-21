import { WindowMessenger as e, connect as t } from "penpal";
//#region src/core/iframe.ts
function n() {
	return window.self !== window.parent;
}
//#endregion
//#region src/core/history.ts
function r() {
	window.history.pushState = (e, t, n) => {
		window.history.replaceState(e, t, n);
	};
}
//#endregion
//#region src/core/height.ts
function i(e) {
	let t = 0, n = () => {
		let n = document.documentElement.scrollHeight;
		n !== t && (t = n, e(n));
	}, r = new ResizeObserver(n);
	return r.observe(document.documentElement), r.observe(document.body), n(), () => r.disconnect();
}
//#endregion
//#region src/core/connection.ts
function a(n) {
	let { iframe: r, allowedOrigins: i, timeout: a, methods: o } = n;
	return t({
		messenger: new e({
			remoteWindow: r.contentWindow,
			allowedOrigins: i
		}),
		timeout: a,
		methods: o
	});
}
function o(a) {
	if (!n()) return null;
	let { appName: o = "unknown", allowedOrigins: s = ["*"], router: c, methods: l = {} } = a, u = [], d = {
		...l,
		onShellMessage(e) {
			u.forEach((t) => t(e));
		},
		onShellContainerHeight(e) {
			let t = Number(e);
			return new Promise((e) => {
				requestAnimationFrame(() => {
					requestAnimationFrame(() => {
						let n = document.documentElement.scrollHeight;
						e(n > t ? n : t);
					});
				});
			});
		}
	};
	c && (d.onShellNavigate = (e) => {
		c.getCurrentPath() !== e && c.replace(e);
	}), r();
	let f = t({
		messenger: new e({
			remoteWindow: window.parent,
			allowedOrigins: s
		}),
		methods: d
	}).promise;
	return f.then((e) => {
		i((t) => {
			e.onRemoteHeight(t);
		});
	}).catch(() => {}), c && (f.then((e) => {
		let t = c.getCurrentPath();
		t && e.onRemoteRouteChange(t);
	}).catch(() => {}), c.afterEach((e) => {
		f.then((t) => {
			t.onRemoteRouteChange(e);
		}).catch(() => {});
	})), {
		connectionPromise: f,
		async send(e) {
			if (!f) {
				console.warn("[@sprlab/microfront] send called before connection was established");
				return;
			}
			await (await f).onRemoteMessage({
				payload: e,
				metadata: { appName: o }
			});
		},
		onMessage(e) {
			u.push(e);
		}
	};
}
//#endregion
export { n as a, r as i, o as n, i as r, a as t };
