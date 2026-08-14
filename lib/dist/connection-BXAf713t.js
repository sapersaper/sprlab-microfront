//#region src/core/iframe.ts
function e() {
	return window.self !== window.parent;
}
//#endregion
//#region src/core/history.ts
function t() {
	window.history.pushState = (e, t, n) => {
		window.history.replaceState(e, t, n);
	};
}
//#endregion
//#region src/core/height.ts
function n(e) {
	let t = null, n = () => {
		let n = document.documentElement.scrollHeight;
		n !== t && (t = n, e(n));
	}, r = new ResizeObserver(n);
	return r.observe(document.documentElement), r.observe(document.body), n(), () => r.disconnect();
}
var r = class extends Error {
	code;
	constructor(e, t) {
		super(t), this.name = "PenpalError", this.code = e;
	}
}, i = (e) => ({
	name: e.name,
	message: e.message,
	stack: e.stack,
	penpalCode: e instanceof r ? e.code : void 0
}), a = ({ name: e, message: t, stack: n, penpalCode: i }) => {
	let a = i ? new r(i, t) : Error(t);
	return a.name = e, a.stack = n, a;
}, o = class {
	value;
	transferables;
	constructor(e, t) {
		this.value = e, this.transferables = t?.transferables;
	}
}, s = "penpal", c = (e) => typeof e == "object" && !!e, l = (e) => typeof e == "function", u = (e) => c(e) && e.namespace === s, d = (e) => e.type === "SYN", f = (e) => e.type === "ACK1", p = (e) => e.type === "ACK2", m = (e) => e.type === "CALL", h = (e) => e.type === "REPLY", g = (e) => e.type === "DESTROY", _ = (e, t = []) => {
	let n = [];
	for (let r of Object.keys(e)) {
		let i = e[r];
		l(i) ? n.push([...t, r]) : c(i) && n.push(..._(i, [...t, r]));
	}
	return n;
}, v = (e, t) => {
	let n = e.reduce((e, t) => c(e) ? e[t] : void 0, t);
	return l(n) ? n : void 0;
}, y = (e) => e.join("."), b = (e, t, n) => ({
	namespace: s,
	channel: e,
	type: "REPLY",
	callId: t,
	isError: !0,
	...n instanceof Error ? {
		value: i(n),
		isSerializedErrorInstance: !0
	} : { value: n }
}), x = (e, t, n, i) => {
	let a = !1, c = async (c) => {
		if (a || !m(c)) return;
		i?.(`Received ${y(c.methodPath)}() call`, c);
		let { methodPath: l, args: u, id: d } = c, f, p;
		try {
			let e = v(l, t);
			if (!e) throw new r("METHOD_NOT_FOUND", `Method \`${y(l)}\` is not found.`);
			let i = await e(...u);
			i instanceof o && (p = i.transferables, i = await i.value), f = {
				namespace: s,
				channel: n,
				type: "REPLY",
				callId: d,
				value: i
			};
		} catch (e) {
			f = b(n, d, e);
		}
		if (!a) try {
			i?.(`Sending ${y(l)}() reply`, f), e.sendMessage(f, p);
		} catch (t) {
			throw t.name === "DataCloneError" && (f = b(n, d, t), i?.(`Sending ${y(l)}() reply`, f), e.sendMessage(f)), t;
		}
	};
	return e.addMessageHandler(c), () => {
		a = !0, e.removeMessageHandler(c);
	};
}, S = crypto.randomUUID?.bind(crypto) ?? (() => [
	,
	,
	,
	,
].fill(0).map(() => Math.floor(Math.random() * (2 ** 53 - 1)).toString(16)).join("-")), C = class {
	transferables;
	timeout;
	constructor(e) {
		this.transferables = e?.transferables, this.timeout = e?.timeout;
	}
}, w = /* @__PURE__ */ new Set([
	"apply",
	"call",
	"bind"
]), T = (e, t, n = []) => new Proxy(n.length ? () => {} : /* @__PURE__ */ Object.create(null), {
	get(r, i) {
		if (i !== "then") return n.length && w.has(i) ? Reflect.get(r, i) : T(e, t, [...n, i]);
	},
	apply(t, r, i) {
		return e(n, i);
	}
}), E = (e) => new r("CONNECTION_DESTROYED", `Method call ${y(e)}() failed due to destroyed connection`), D = (e, t, n) => {
	let i = !1, o = /* @__PURE__ */ new Map(), c = (e) => {
		if (!h(e)) return;
		let { callId: t, value: r, isError: i, isSerializedErrorInstance: s } = e, c = o.get(t);
		c && (o.delete(t), n?.(`Received ${y(c.methodPath)}() call`, e), i ? c.reject(s ? a(r) : r) : c.resolve(r));
	};
	return e.addMessageHandler(c), {
		remoteProxy: T((a, c) => {
			if (i) throw E(a);
			let l = S(), u = c[c.length - 1], d = u instanceof C, { timeout: f, transferables: p } = d ? u : {}, m = d ? c.slice(0, -1) : c;
			return new Promise((i, c) => {
				let u = f === void 0 ? void 0 : window.setTimeout(() => {
					o.delete(l), c(new r("METHOD_CALL_TIMEOUT", `Method call ${y(a)}() timed out after ${f}ms`));
				}, f);
				o.set(l, {
					methodPath: a,
					resolve: i,
					reject: c,
					timeoutId: u
				});
				try {
					let r = {
						namespace: s,
						channel: t,
						type: "CALL",
						id: l,
						methodPath: a,
						args: m
					};
					n?.(`Sending ${y(a)}() call`, r), e.sendMessage(r, p);
				} catch (e) {
					c(new r("TRANSMISSION_FAILED", e.message));
				}
			});
		}, n),
		destroy: () => {
			i = !0, e.removeMessageHandler(c);
			for (let { methodPath: e, reject: t, timeoutId: n } of o.values()) clearTimeout(n), t(E(e));
			o.clear();
		}
	};
}, O = () => {
	let e, t;
	return {
		promise: new Promise((n, r) => {
			e = n, t = r;
		}),
		resolve: e,
		reject: t
	};
}, k = "deprecated-penpal", A = (e) => c(e) && "penpal" in e, j = (e) => e.split("."), M = (e) => e.join("."), N = (e) => {
	try {
		return JSON.stringify(e);
	} catch {
		return String(e);
	}
}, P = (e) => new r("TRANSMISSION_FAILED", `Unexpected message to translate: ${N(e)}`), F = (e) => {
	if (e.penpal === "syn") return {
		namespace: s,
		channel: void 0,
		type: "SYN",
		participantId: k
	};
	if (e.penpal === "ack") return {
		namespace: s,
		channel: void 0,
		type: "ACK2"
	};
	if (e.penpal === "call") return {
		namespace: s,
		channel: void 0,
		type: "CALL",
		id: e.id,
		methodPath: j(e.methodName),
		args: e.args
	};
	if (e.penpal === "reply") return e.resolution === "fulfilled" ? {
		namespace: s,
		channel: void 0,
		type: "REPLY",
		callId: e.id,
		value: e.returnValue
	} : {
		namespace: s,
		channel: void 0,
		type: "REPLY",
		callId: e.id,
		isError: !0,
		...e.returnValueIsError ? {
			value: e.returnValue,
			isSerializedErrorInstance: !0
		} : { value: e.returnValue }
	};
	throw P(e);
}, I = (e) => {
	if (f(e)) return {
		penpal: "synAck",
		methodNames: e.methodPaths.map(M)
	};
	if (m(e)) return {
		penpal: "call",
		id: e.id,
		methodName: M(e.methodPath),
		args: e.args
	};
	if (h(e)) return e.isError ? {
		penpal: "reply",
		id: e.callId,
		resolution: "rejected",
		...e.isSerializedErrorInstance ? {
			returnValue: e.value,
			returnValueIsError: !0
		} : { returnValue: e.value }
	} : {
		penpal: "reply",
		id: e.callId,
		resolution: "fulfilled",
		returnValue: e.value
	};
	throw P(e);
}, L = ({ messenger: e, methods: t, timeout: n, channel: i, log: a }) => {
	let o = S(), c, l = [], u = !1, m = _(t), { promise: h, resolve: g, reject: v } = O(), y = n === void 0 ? void 0 : setTimeout(() => {
		v(new r("CONNECTION_TIMEOUT", `Connection timed out after ${n}ms`));
	}, n), b = () => {
		for (let e of l) e();
	}, C = () => {
		if (u) return;
		l.push(x(e, t, i, a));
		let { remoteProxy: n, destroy: r } = D(e, i, a);
		l.push(r), clearTimeout(y), u = !0, g({
			remoteProxy: n,
			destroy: b
		});
	}, w = () => {
		let t = {
			namespace: s,
			type: "SYN",
			channel: i,
			participantId: o
		};
		a?.("Sending handshake SYN", t);
		try {
			e.sendMessage(t);
		} catch (e) {
			v(new r("TRANSMISSION_FAILED", e.message));
		}
	}, T = (t) => {
		if (a?.("Received handshake SYN", t), t.participantId === c && c !== k || (c = t.participantId, w(), !(o > c || c === k))) return;
		let n = {
			namespace: s,
			channel: i,
			type: "ACK1",
			methodPaths: m
		};
		a?.("Sending handshake ACK1", n);
		try {
			e.sendMessage(n);
		} catch (e) {
			v(new r("TRANSMISSION_FAILED", e.message));
			return;
		}
	}, E = (t) => {
		a?.("Received handshake ACK1", t);
		let n = {
			namespace: s,
			channel: i,
			type: "ACK2"
		};
		a?.("Sending handshake ACK2", n);
		try {
			e.sendMessage(n);
		} catch (e) {
			v(new r("TRANSMISSION_FAILED", e.message));
			return;
		}
		C();
	}, A = (e) => {
		a?.("Received handshake ACK2", e), C();
	}, j = (e) => {
		d(e) && T(e), f(e) && E(e), p(e) && A(e);
	};
	return e.addMessageHandler(j), l.push(() => e.removeMessageHandler(j)), w(), h;
}, R = (e) => {
	let t = !1, n;
	return (...r) => (t || (t = !0, n = e(...r)), n);
}, z = /* @__PURE__ */ new WeakSet(), B = ({ messenger: e, methods: t = {}, timeout: n, channel: i, log: a }) => {
	if (!e) throw new r("INVALID_ARGUMENT", "messenger must be defined");
	if (z.has(e)) throw new r("INVALID_ARGUMENT", "A messenger can only be used for a single connection");
	z.add(e);
	let o = [e.destroy], c = R((t) => {
		if (t) {
			let t = {
				namespace: s,
				channel: i,
				type: "DESTROY"
			};
			try {
				e.sendMessage(t);
			} catch {}
		}
		for (let e of o) e();
		a?.("Connection destroyed");
	}), l = (e) => u(e) && e.channel === i;
	return {
		promise: (async () => {
			try {
				e.initialize({
					log: a,
					validateReceivedMessage: l
				}), e.addMessageHandler((e) => {
					g(e) && c(!1);
				});
				let { remoteProxy: r, destroy: s } = await L({
					messenger: e,
					methods: t,
					timeout: n,
					channel: i,
					log: a
				});
				return o.push(s), r;
			} catch (e) {
				throw c(!0), e;
			}
		})(),
		destroy: () => {
			c(!0);
		}
	};
}, V = class {
	#e;
	#t;
	#n;
	#r;
	#i;
	#a = /* @__PURE__ */ new Set();
	#o;
	#s = !1;
	constructor({ remoteWindow: e, allowedOrigins: t }) {
		if (!e) throw new r("INVALID_ARGUMENT", "remoteWindow must be defined");
		this.#e = e, this.#t = t?.length ? t : [window.origin];
	}
	initialize = ({ log: e, validateReceivedMessage: t }) => {
		this.#n = e, this.#r = t, window.addEventListener("message", this.#d);
	};
	sendMessage = (e, t) => {
		if (d(e)) {
			let n = this.#l(e);
			this.#e.postMessage(e, {
				targetOrigin: n,
				transfer: t
			});
			return;
		}
		if (f(e) || this.#s) {
			let n = this.#s ? I(e) : e, r = this.#l(e);
			this.#e.postMessage(n, {
				targetOrigin: r,
				transfer: t
			});
			return;
		}
		if (p(e)) {
			let { port1: n, port2: r } = new MessageChannel();
			this.#o = n, n.addEventListener("message", this.#f), n.start();
			let i = [r, ...t || []], a = this.#l(e);
			this.#e.postMessage(e, {
				targetOrigin: a,
				transfer: i
			});
			return;
		}
		if (this.#o) {
			this.#o.postMessage(e, { transfer: t });
			return;
		}
		throw new r("TRANSMISSION_FAILED", "Cannot send message because the MessagePort is not connected");
	};
	addMessageHandler = (e) => {
		this.#a.add(e);
	};
	removeMessageHandler = (e) => {
		this.#a.delete(e);
	};
	destroy = () => {
		window.removeEventListener("message", this.#d), this.#u(), this.#a.clear();
	};
	#c = (e) => this.#t.some((t) => t instanceof RegExp ? t.test(e) : t === e || t === "*");
	#l = (e) => {
		if (d(e)) return "*";
		if (!this.#i) throw new r("TRANSMISSION_FAILED", "Cannot send message because the remote origin is not established");
		return this.#i === "null" && this.#t.includes("*") ? "*" : this.#i;
	};
	#u = () => {
		this.#o?.removeEventListener("message", this.#f), this.#o?.close(), this.#o = void 0;
	};
	#d = ({ source: e, origin: t, ports: n, data: r }) => {
		if (e === this.#e) {
			if (A(r)) {
				this.#n?.("Please upgrade the child window to the latest version of Penpal."), this.#s = !0;
				try {
					r = F(r);
				} catch (e) {
					this.#n?.(`Failed to translate deprecated message: ${e.message}`);
					return;
				}
			}
			if (this.#r?.(r)) {
				if (!this.#c(t)) {
					this.#n?.(`Received a message from origin \`${t}\` which did not match allowed origins \`[${this.#t.join(", ")}]\``);
					return;
				}
				if (d(r) && (this.#u(), this.#i = t), p(r) && !this.#s) {
					if (this.#o = n[0], !this.#o) {
						this.#n?.("Ignoring ACK2 because it did not include a MessagePort");
						return;
					}
					this.#o.addEventListener("message", this.#f), this.#o.start();
				}
				for (let e of this.#a) e(r);
			}
		}
	};
	#f = ({ data: e }) => {
		if (this.#r?.(e)) for (let t of this.#a) t(e);
	};
};
//#endregion
//#region src/core/connection.ts
function H(e) {
	let { iframe: t, allowedOrigins: n, timeout: r, methods: i } = e;
	return B({
		messenger: new V({
			remoteWindow: t.contentWindow,
			allowedOrigins: n
		}),
		timeout: r,
		methods: i
	});
}
function U(r) {
	if (!e()) return null;
	let { appName: i = "unknown", allowedOrigins: a = ["*"], router: o, methods: s = {} } = r, c = [], l = {
		...s,
		onShellMessage(e) {
			c.forEach((t) => t(e));
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
	o && (l.onShellNavigate = (e) => {
		o.getCurrentPath() !== e && o.replace(e);
	}), t();
	let u = B({
		messenger: new V({
			remoteWindow: window.parent,
			allowedOrigins: a
		}),
		methods: l
	}).promise;
	return u.then((e) => {
		n((t) => {
			e.onRemoteHeight(t);
		});
	}).catch(() => {}), u.then((e) => {
		let t = o ? o.getCurrentPath() : window.location.pathname;
		t && e.onRemoteRouteChange(t);
	}).catch(() => {}), o && o.afterEach((e) => {
		u.then((t) => {
			t.onRemoteRouteChange(e);
		}).catch(() => {});
	}), {
		connectionPromise: u,
		async send(e) {
			if (!u) {
				console.warn("[@sprlab/microfront] send called before connection was established");
				return;
			}
			await (await u).onRemoteMessage({
				payload: e,
				metadata: { appName: i }
			});
		},
		onMessage(e) {
			c.push(e);
		}
	};
}
//#endregion
export { e as a, t as i, U as n, n as r, H as t };
