import { n as e } from "./connection-D26Gi4mZ.js";
//#region src/react/routerAdapter.ts
function t(e) {
	return {
		getCurrentPath() {
			return e.state.location.pathname;
		},
		replace(t) {
			e.navigate(t, { replace: !0 });
		},
		afterEach(t) {
			e.subscribe((e) => {
				t(e.location.pathname);
			});
		}
	};
}
//#endregion
//#region src/react/remote.ts
function n(n = {}) {
	let { router: r, ...i } = n;
	return e({
		...i,
		router: r ? t(r) : void 0
	});
}
//#endregion
export { t as createReactRouterAdapter, n as initReactRemote };
