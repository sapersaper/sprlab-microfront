import { n as e } from "./connection-BnSwcIhr.js";
//#region src/angular/routerAdapter.ts
function t(e) {
	return {
		getCurrentPath() {
			return e.url;
		},
		replace(t) {
			e.navigateByUrl(t, { replaceUrl: !0 });
		},
		afterEach(t) {
			e.events.subscribe((e) => {
				(e.constructor?.name === "NavigationEnd" || e.type === 1) && t(e.urlAfterRedirects || e.url);
			});
		}
	};
}
//#endregion
//#region src/angular/remote.ts
function n(n = {}) {
	let { router: r, ...i } = n;
	return e({
		...i,
		router: r ? t(r) : void 0
	});
}
//#endregion
export { t as createAngularRouterAdapter, n as initAngularRemote };
