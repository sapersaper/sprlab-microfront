import { t as e } from "./connection-BnSwcIhr.js";
import { t } from "./messenger-BA7RhBG8.js";
import "./sprRemoteLegacy-B7HQ_JAp.js";
import { computed as n, createElementBlock as r, defineComponent as i, inject as a, normalizeStyle as o, onMounted as s, onUnmounted as c, openBlock as l, provide as u, ref as d, vShow as f, watch as p, withDirectives as m } from "vue";
import { useRoute as h, useRouter as g } from "vue-router";
//#region src/vue/useRemote.ts
var _ = Symbol.for("remote-messenger"), v = /* @__PURE__ */ function(e) {
	return e.Loading = "loading", e.Connected = "connected", e.Error = "error", e.NoPlugin = "no-plugin", e;
}({});
function y(e) {
	return e;
}
function b() {
	let e = t(), n = d(y(e.status)), r = d(e.iframeLoaded);
	return {
		status: n,
		iframeLoaded: r,
		setIframeLoaded() {
			e.setIframeLoaded(), r.value = !0;
		},
		setConnection(t) {
			e.setConnection(t), t.then(() => {
				n.value = y(e.status);
			}).catch(() => {
				n.value = y(e.status);
			});
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
		}
	};
}
function x() {
	let e = a(_, null), t = e ?? b();
	return e || u(_, t), {
		sendMessage: t.send,
		onMessage: t.onMessage,
		onRouteChange: t.onRouteChange,
		isLoading: n(() => t.status.value === v.Loading),
		isConnected: n(() => t.status.value === v.Connected),
		isError: n(() => t.status.value === v.Error),
		isNoPlugin: n(() => t.status.value === v.NoPlugin)
	};
}
//#endregion
//#region src/vue/RemoteApp.vue?vue&type=script&setup=true&lang.ts
var S = ["src", "title"], C = /* @__PURE__ */ i({
	__name: "RemoteApp",
	props: {
		src: {
			type: String,
			required: !0
		},
		title: {
			type: String,
			required: !0
		},
		basePath: {
			type: String,
			default: ""
		},
		timeout: {
			type: Number,
			default: 1e4
		},
		allowedOrigins: {
			type: Array,
			default: () => ["*"]
		},
		fullHeight: {
			type: Boolean,
			default: !1
		}
	},
	setup(t) {
		let i = Symbol.for("remote-messenger"), u = t, _ = a(i, null), y = h(), b = g(), x = d(null), C = null, w = null, T = d(0), E = 0, D = n(() => {
			let e = {
				width: "100%",
				border: "none"
			};
			return T.value > 0 && (e.height = T.value + "px"), u.fullHeight && (e.minHeight = "100%"), e;
		}), O = !1, k = !0, A = !1, j = 0, M = !1;
		typeof window < "u" && window.addEventListener("popstate", () => {
			M = !0, setTimeout(() => {
				M = !1;
			}, 0);
		});
		let N = n(() => {
			if (!_) return !0;
			let e = _.status.value;
			return e === v.Connected || e === v.NoPlugin;
		}), P = n(() => {
			if (!u.basePath) return "";
			let e = y.params.path;
			return !e || Array.isArray(e) && e.length === 0 ? "" : "/" + (Array.isArray(e) ? e.join("/") : e);
		}), F = d("");
		async function I(e) {
			try {
				return await fetch(e, {
					method: "HEAD",
					mode: "no-cors",
					signal: AbortSignal.timeout(u.timeout)
				}), !0;
			} catch {
				return !1;
			}
		}
		async function L() {
			if (!C || !u.fullHeight || E <= 0) return;
			let e = x.value;
			if (e) {
				T.value = 0, e.style.height = E + "px", await new Promise((e) => requestAnimationFrame(() => requestAnimationFrame(e)));
				try {
					let t = await (await C.promise).onShellContainerHeight(E);
					t > E ? (T.value = t, e.style.height = t + "px") : e.style.height = "";
				} catch {
					e.style.height = "";
				}
			}
		}
		return s(async () => {
			F.value = u.basePath ? u.src + (P.value || "") : u.src;
			let t = x.value;
			if (!t) return;
			u.fullHeight && t.parentElement && (E = t.parentElement.clientHeight);
			function n() {
				return C && C.destroy(), j = Date.now(), k = !0, C = e({
					iframe: t,
					allowedOrigins: u.allowedOrigins,
					timeout: u.timeout,
					methods: {
						onRemoteMessage(e) {
							_ && _.handleRemoteMessage(e);
						},
						onRemoteRouteChange(e) {
							if (u.basePath) {
								let t = u.basePath + e;
								if (y.fullPath !== t) {
									O = !0;
									let e = Date.now() - j < 500;
									(k || A || e) && !M ? (k = !1, A = !1, b.replace(t)) : M || b.push(t);
								} else k = !1;
							}
							_ && _.handleRouteChange(e), u.fullHeight && L();
						},
						onRemoteHeight(e) {
							if (u.fullHeight) return;
							let t = Number(e);
							!isNaN(t) && t > 0 && (T.value = t);
						}
					}
				}), C;
			}
			n(), M && (k = !1);
			let r = !0;
			if (t.addEventListener("load", () => {
				if (r) {
					r = !1;
					return;
				}
				A = !0, O = !1, n();
			}), _) {
				await I(u.src) && _.setIframeLoaded();
				let e = new Promise((e, t) => {
					w = setTimeout(() => t(/* @__PURE__ */ Error("Connection timeout")), u.timeout);
				});
				_.setConnection(Promise.race([C.promise, e]));
			}
		}), u.basePath && p(() => P.value, async (e) => {
			if (O) {
				O = !1;
				return;
			}
			if (!C) return;
			let t = e || "/", n = x.value;
			if (!n) return;
			let r = !1;
			try {
				let e = await Promise.race([C.promise, new Promise((e, t) => setTimeout(() => t(/* @__PURE__ */ Error("timeout")), 300))]);
				typeof e.onShellNavigate == "function" && (await Promise.race([e.onShellNavigate(t), new Promise((e, t) => setTimeout(() => t(/* @__PURE__ */ Error("timeout")), 300))]), r = !0);
			} catch {}
			if (!r) {
				let e = u.src + t;
				n.src.endsWith(t) || (n.src = e);
			}
		}), c(() => {
			w && clearTimeout(w), C && C.destroy();
		}), (e, n) => m((l(), r("iframe", {
			ref_key: "iframeRef",
			ref: x,
			src: F.value,
			title: t.title,
			style: o(D.value)
		}, null, 12, S)), [[f, N.value]]);
	}
});
//#endregion
export { v as n, x as r, C as t };
