import * as $ from "react";
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const m0 = globalThis, E0 = m0.ShadowRoot && (m0.ShadyCSS === void 0 || m0.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, P0 = Symbol(), O0 = /* @__PURE__ */ new WeakMap();
let W0 = class {
  constructor(e, i, n) {
    if (this._$cssResult$ = !0, n !== P0)
      throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = i;
  }
  get styleSheet() {
    let e = this.o;
    const i = this.t;
    if (E0 && e === void 0) {
      const n = i !== void 0 && i.length === 1;
      n && (e = O0.get(i)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), n && O0.set(i, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const nt = (t) => new W0(typeof t == "string" ? t : t + "", void 0, P0), w = (t, ...e) => {
  const i = t.length === 1 ? t[0] : e.reduce((n, s, r) => n + ((a) => {
    if (a._$cssResult$ === !0)
      return a.cssText;
    if (typeof a == "number")
      return a;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + a + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(s) + t[r + 1], t[0]);
  return new W0(i, t, P0);
}, rt = (t, e) => {
  if (E0)
    t.adoptedStyleSheets = e.map((i) => i instanceof CSSStyleSheet ? i : i.styleSheet);
  else
    for (const i of e) {
      const n = document.createElement("style"), s = m0.litNonce;
      s !== void 0 && n.setAttribute("nonce", s), n.textContent = i.cssText, t.appendChild(n);
    }
}, z0 = E0 ? (t) => t : (t) => t instanceof CSSStyleSheet ? ((e) => {
  let i = "";
  for (const n of e.cssRules)
    i += n.cssText;
  return nt(i);
})(t) : t;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: at, defineProperty: ot, getOwnPropertyDescriptor: lt, getOwnPropertyNames: ct, getOwnPropertySymbols: ht, getPrototypeOf: pt } = Object, N = globalThis, T0 = N.trustedTypes, dt = T0 ? T0.emptyScript : "", b0 = N.reactiveElementPolyfillSupport, n0 = (t, e) => t, x0 = { toAttribute(t, e) {
  switch (e) {
    case Boolean:
      t = t ? dt : null;
      break;
    case Object:
    case Array:
      t = t == null ? t : JSON.stringify(t);
  }
  return t;
}, fromAttribute(t, e) {
  let i = t;
  switch (e) {
    case Boolean:
      i = t !== null;
      break;
    case Number:
      i = t === null ? null : Number(t);
      break;
    case Object:
    case Array:
      try {
        i = JSON.parse(t);
      } catch {
        i = null;
      }
  }
  return i;
} }, D0 = (t, e) => !at(t, e), I0 = { attribute: !0, type: String, converter: x0, reflect: !1, hasChanged: D0 };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), N.litPropertyMetadata ?? (N.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let W = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ?? (this.l = [])).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, i = I0) {
    if (i.state && (i.attribute = !1), this._$Ei(), this.elementProperties.set(e, i), !i.noAccessor) {
      const n = Symbol(), s = this.getPropertyDescriptor(e, n, i);
      s !== void 0 && ot(this.prototype, e, s);
    }
  }
  static getPropertyDescriptor(e, i, n) {
    const { get: s, set: r } = lt(this.prototype, e) ?? { get() {
      return this[i];
    }, set(a) {
      this[i] = a;
    } };
    return { get() {
      return s == null ? void 0 : s.call(this);
    }, set(a) {
      const l = s == null ? void 0 : s.call(this);
      r.call(this, a), this.requestUpdate(e, l, n);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? I0;
  }
  static _$Ei() {
    if (this.hasOwnProperty(n0("elementProperties")))
      return;
    const e = pt(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(n0("finalized")))
      return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(n0("properties"))) {
      const i = this.properties, n = [...ct(i), ...ht(i)];
      for (const s of n)
        this.createProperty(s, i[s]);
    }
    const e = this[Symbol.metadata];
    if (e !== null) {
      const i = litPropertyMetadata.get(e);
      if (i !== void 0)
        for (const [n, s] of i)
          this.elementProperties.set(n, s);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [i, n] of this.elementProperties) {
      const s = this._$Eu(i, n);
      s !== void 0 && this._$Eh.set(s, i);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(e) {
    const i = [];
    if (Array.isArray(e)) {
      const n = new Set(e.flat(1 / 0).reverse());
      for (const s of n)
        i.unshift(z0(s));
    } else
      e !== void 0 && i.push(z0(e));
    return i;
  }
  static _$Eu(e, i) {
    const n = i.attribute;
    return n === !1 ? void 0 : typeof n == "string" ? n : typeof e == "string" ? e.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    var e;
    this._$ES = new Promise((i) => this.enableUpdating = i), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), (e = this.constructor.l) == null || e.forEach((i) => i(this));
  }
  addController(e) {
    var i;
    (this._$EO ?? (this._$EO = /* @__PURE__ */ new Set())).add(e), this.renderRoot !== void 0 && this.isConnected && ((i = e.hostConnected) == null || i.call(e));
  }
  removeController(e) {
    var i;
    (i = this._$EO) == null || i.delete(e);
  }
  _$E_() {
    const e = /* @__PURE__ */ new Map(), i = this.constructor.elementProperties;
    for (const n of i.keys())
      this.hasOwnProperty(n) && (e.set(n, this[n]), delete this[n]);
    e.size > 0 && (this._$Ep = e);
  }
  createRenderRoot() {
    const e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return rt(e, this.constructor.elementStyles), e;
  }
  connectedCallback() {
    var e;
    this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(!0), (e = this._$EO) == null || e.forEach((i) => {
      var n;
      return (n = i.hostConnected) == null ? void 0 : n.call(i);
    });
  }
  enableUpdating(e) {
  }
  disconnectedCallback() {
    var e;
    (e = this._$EO) == null || e.forEach((i) => {
      var n;
      return (n = i.hostDisconnected) == null ? void 0 : n.call(i);
    });
  }
  attributeChangedCallback(e, i, n) {
    this._$AK(e, n);
  }
  _$EC(e, i) {
    var r;
    const n = this.constructor.elementProperties.get(e), s = this.constructor._$Eu(e, n);
    if (s !== void 0 && n.reflect === !0) {
      const a = (((r = n.converter) == null ? void 0 : r.toAttribute) !== void 0 ? n.converter : x0).toAttribute(i, n.type);
      this._$Em = e, a == null ? this.removeAttribute(s) : this.setAttribute(s, a), this._$Em = null;
    }
  }
  _$AK(e, i) {
    var r;
    const n = this.constructor, s = n._$Eh.get(e);
    if (s !== void 0 && this._$Em !== s) {
      const a = n.getPropertyOptions(s), l = typeof a.converter == "function" ? { fromAttribute: a.converter } : ((r = a.converter) == null ? void 0 : r.fromAttribute) !== void 0 ? a.converter : x0;
      this._$Em = s, this[s] = l.fromAttribute(i, a.type), this._$Em = null;
    }
  }
  requestUpdate(e, i, n) {
    if (e !== void 0) {
      if (n ?? (n = this.constructor.getPropertyOptions(e)), !(n.hasChanged ?? D0)(this[e], i))
        return;
      this.P(e, i, n);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$ET());
  }
  P(e, i, n) {
    this._$AL.has(e) || this._$AL.set(e, i), n.reflect === !0 && this._$Em !== e && (this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Set())).add(e);
  }
  async _$ET() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (i) {
      Promise.reject(i);
    }
    const e = this.scheduleUpdate();
    return e != null && await e, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    var n;
    if (!this.isUpdatePending)
      return;
    if (!this.hasUpdated) {
      if (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this._$Ep) {
        for (const [r, a] of this._$Ep)
          this[r] = a;
        this._$Ep = void 0;
      }
      const s = this.constructor.elementProperties;
      if (s.size > 0)
        for (const [r, a] of s)
          a.wrapped !== !0 || this._$AL.has(r) || this[r] === void 0 || this.P(r, this[r], a);
    }
    let e = !1;
    const i = this._$AL;
    try {
      e = this.shouldUpdate(i), e ? (this.willUpdate(i), (n = this._$EO) == null || n.forEach((s) => {
        var r;
        return (r = s.hostUpdate) == null ? void 0 : r.call(s);
      }), this.update(i)) : this._$EU();
    } catch (s) {
      throw e = !1, this._$EU(), s;
    }
    e && this._$AE(i);
  }
  willUpdate(e) {
  }
  _$AE(e) {
    var i;
    (i = this._$EO) == null || i.forEach((n) => {
      var s;
      return (s = n.hostUpdated) == null ? void 0 : s.call(n);
    }), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(e)), this.updated(e);
  }
  _$EU() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(e) {
    return !0;
  }
  update(e) {
    this._$Ej && (this._$Ej = this._$Ej.forEach((i) => this._$EC(i, this[i]))), this._$EU();
  }
  updated(e) {
  }
  firstUpdated(e) {
  }
};
W.elementStyles = [], W.shadowRootOptions = { mode: "open" }, W[n0("elementProperties")] = /* @__PURE__ */ new Map(), W[n0("finalized")] = /* @__PURE__ */ new Map(), b0 == null || b0({ ReactiveElement: W }), (N.reactiveElementVersions ?? (N.reactiveElementVersions = [])).push("2.0.4");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const r0 = globalThis, u0 = r0.trustedTypes, j0 = u0 ? u0.createPolicy("lit-html", { createHTML: (t) => t }) : void 0, Y0 = "$lit$", B = `lit$${(Math.random() + "").slice(9)}$`, J0 = "?" + B, gt = `<${J0}>`, q = document, a0 = () => q.createComment(""), o0 = (t) => t === null || typeof t != "object" && typeof t != "function", Z0 = Array.isArray, ft = (t) => Z0(t) || typeof (t == null ? void 0 : t[Symbol.iterator]) == "function", C0 = `[ 	
\f\r]`, e0 = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, R0 = /-->/g, B0 = />/g, U = RegExp(`>|${C0}(?:([^\\s"'>=/]+)(${C0}*=${C0}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), N0 = /'/g, L0 = /"/g, Q0 = /^(?:script|style|textarea|title)$/i, tt = (t) => (e, ...i) => ({ _$litType$: t, strings: e, values: i }), v = tt(1), p = tt(2), Y = Symbol.for("lit-noChange"), y = Symbol.for("lit-nothing"), U0 = /* @__PURE__ */ new WeakMap(), M = q.createTreeWalker(q, 129);
function et(t, e) {
  if (!Array.isArray(t) || !t.hasOwnProperty("raw"))
    throw Error("invalid template strings array");
  return j0 !== void 0 ? j0.createHTML(e) : e;
}
const yt = (t, e) => {
  const i = t.length - 1, n = [];
  let s, r = e === 2 ? "<svg>" : "", a = e0;
  for (let l = 0; l < i; l++) {
    const c = t[l];
    let h, d, g = -1, C = 0;
    for (; C < c.length && (a.lastIndex = C, d = a.exec(c), d !== null); )
      C = a.lastIndex, a === e0 ? d[1] === "!--" ? a = R0 : d[1] !== void 0 ? a = B0 : d[2] !== void 0 ? (Q0.test(d[2]) && (s = RegExp("</" + d[2], "g")), a = U) : d[3] !== void 0 && (a = U) : a === U ? d[0] === ">" ? (a = s ?? e0, g = -1) : d[1] === void 0 ? g = -2 : (g = a.lastIndex - d[2].length, h = d[1], a = d[3] === void 0 ? U : d[3] === '"' ? L0 : N0) : a === L0 || a === N0 ? a = U : a === R0 || a === B0 ? a = e0 : (a = U, s = void 0);
    const f = a === U && t[l + 1].startsWith("/>") ? " " : "";
    r += a === e0 ? c + gt : g >= 0 ? (n.push(h), c.slice(0, g) + Y0 + c.slice(g) + B + f) : c + B + (g === -2 ? l : f);
  }
  return [et(t, r + (t[i] || "<?>") + (e === 2 ? "</svg>" : "")), n];
};
class l0 {
  constructor({ strings: e, _$litType$: i }, n) {
    let s;
    this.parts = [];
    let r = 0, a = 0;
    const l = e.length - 1, c = this.parts, [h, d] = yt(e, i);
    if (this.el = l0.createElement(h, n), M.currentNode = this.el.content, i === 2) {
      const g = this.el.content.firstChild;
      g.replaceWith(...g.childNodes);
    }
    for (; (s = M.nextNode()) !== null && c.length < l; ) {
      if (s.nodeType === 1) {
        if (s.hasAttributes())
          for (const g of s.getAttributeNames())
            if (g.endsWith(Y0)) {
              const C = d[a++], f = s.getAttribute(g).split(B), j = /([.?@])?(.*)/.exec(C);
              c.push({ type: 1, index: r, name: j[2], strings: f, ctor: j[1] === "." ? xt : j[1] === "?" ? ut : j[1] === "@" ? wt : w0 }), s.removeAttribute(g);
            } else
              g.startsWith(B) && (c.push({ type: 6, index: r }), s.removeAttribute(g));
        if (Q0.test(s.tagName)) {
          const g = s.textContent.split(B), C = g.length - 1;
          if (C > 0) {
            s.textContent = u0 ? u0.emptyScript : "";
            for (let f = 0; f < C; f++)
              s.append(g[f], a0()), M.nextNode(), c.push({ type: 2, index: ++r });
            s.append(g[C], a0());
          }
        }
      } else if (s.nodeType === 8)
        if (s.data === J0)
          c.push({ type: 2, index: r });
        else {
          let g = -1;
          for (; (g = s.data.indexOf(B, g + 1)) !== -1; )
            c.push({ type: 7, index: r }), g += B.length - 1;
        }
      r++;
    }
  }
  static createElement(e, i) {
    const n = q.createElement("template");
    return n.innerHTML = e, n;
  }
}
function J(t, e, i = t, n) {
  var a, l;
  if (e === Y)
    return e;
  let s = n !== void 0 ? (a = i._$Co) == null ? void 0 : a[n] : i._$Cl;
  const r = o0(e) ? void 0 : e._$litDirective$;
  return (s == null ? void 0 : s.constructor) !== r && ((l = s == null ? void 0 : s._$AO) == null || l.call(s, !1), r === void 0 ? s = void 0 : (s = new r(t), s._$AT(t, i, n)), n !== void 0 ? (i._$Co ?? (i._$Co = []))[n] = s : i._$Cl = s), s !== void 0 && (e = J(t, s._$AS(t, e.values), s, n)), e;
}
class mt {
  constructor(e, i) {
    this._$AV = [], this._$AN = void 0, this._$AD = e, this._$AM = i;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(e) {
    const { el: { content: i }, parts: n } = this._$AD, s = ((e == null ? void 0 : e.creationScope) ?? q).importNode(i, !0);
    M.currentNode = s;
    let r = M.nextNode(), a = 0, l = 0, c = n[0];
    for (; c !== void 0; ) {
      if (a === c.index) {
        let h;
        c.type === 2 ? h = new h0(r, r.nextSibling, this, e) : c.type === 1 ? h = new c.ctor(r, c.name, c.strings, this, e) : c.type === 6 && (h = new vt(r, this, e)), this._$AV.push(h), c = n[++l];
      }
      a !== (c == null ? void 0 : c.index) && (r = M.nextNode(), a++);
    }
    return M.currentNode = q, s;
  }
  p(e) {
    let i = 0;
    for (const n of this._$AV)
      n !== void 0 && (n.strings !== void 0 ? (n._$AI(e, n, i), i += n.strings.length - 2) : n._$AI(e[i])), i++;
  }
}
class h0 {
  get _$AU() {
    var e;
    return ((e = this._$AM) == null ? void 0 : e._$AU) ?? this._$Cv;
  }
  constructor(e, i, n, s) {
    this.type = 2, this._$AH = y, this._$AN = void 0, this._$AA = e, this._$AB = i, this._$AM = n, this.options = s, this._$Cv = (s == null ? void 0 : s.isConnected) ?? !0;
  }
  get parentNode() {
    let e = this._$AA.parentNode;
    const i = this._$AM;
    return i !== void 0 && (e == null ? void 0 : e.nodeType) === 11 && (e = i.parentNode), e;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(e, i = this) {
    e = J(this, e, i), o0(e) ? e === y || e == null || e === "" ? (this._$AH !== y && this._$AR(), this._$AH = y) : e !== this._$AH && e !== Y && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : ft(e) ? this.k(e) : this._(e);
  }
  S(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.S(e));
  }
  _(e) {
    this._$AH !== y && o0(this._$AH) ? this._$AA.nextSibling.data = e : this.T(q.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    var r;
    const { values: i, _$litType$: n } = e, s = typeof n == "number" ? this._$AC(e) : (n.el === void 0 && (n.el = l0.createElement(et(n.h, n.h[0]), this.options)), n);
    if (((r = this._$AH) == null ? void 0 : r._$AD) === s)
      this._$AH.p(i);
    else {
      const a = new mt(s, this), l = a.u(this.options);
      a.p(i), this.T(l), this._$AH = a;
    }
  }
  _$AC(e) {
    let i = U0.get(e.strings);
    return i === void 0 && U0.set(e.strings, i = new l0(e)), i;
  }
  k(e) {
    Z0(this._$AH) || (this._$AH = [], this._$AR());
    const i = this._$AH;
    let n, s = 0;
    for (const r of e)
      s === i.length ? i.push(n = new h0(this.S(a0()), this.S(a0()), this, this.options)) : n = i[s], n._$AI(r), s++;
    s < i.length && (this._$AR(n && n._$AB.nextSibling, s), i.length = s);
  }
  _$AR(e = this._$AA.nextSibling, i) {
    var n;
    for ((n = this._$AP) == null ? void 0 : n.call(this, !1, !0, i); e && e !== this._$AB; ) {
      const s = e.nextSibling;
      e.remove(), e = s;
    }
  }
  setConnected(e) {
    var i;
    this._$AM === void 0 && (this._$Cv = e, (i = this._$AP) == null || i.call(this, e));
  }
}
class w0 {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, i, n, s, r) {
    this.type = 1, this._$AH = y, this._$AN = void 0, this.element = e, this.name = i, this._$AM = s, this.options = r, n.length > 2 || n[0] !== "" || n[1] !== "" ? (this._$AH = Array(n.length - 1).fill(new String()), this.strings = n) : this._$AH = y;
  }
  _$AI(e, i = this, n, s) {
    const r = this.strings;
    let a = !1;
    if (r === void 0)
      e = J(this, e, i, 0), a = !o0(e) || e !== this._$AH && e !== Y, a && (this._$AH = e);
    else {
      const l = e;
      let c, h;
      for (e = r[0], c = 0; c < r.length - 1; c++)
        h = J(this, l[n + c], i, c), h === Y && (h = this._$AH[c]), a || (a = !o0(h) || h !== this._$AH[c]), h === y ? e = y : e !== y && (e += (h ?? "") + r[c + 1]), this._$AH[c] = h;
    }
    a && !s && this.j(e);
  }
  j(e) {
    e === y ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class xt extends w0 {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === y ? void 0 : e;
  }
}
class ut extends w0 {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== y);
  }
}
class wt extends w0 {
  constructor(e, i, n, s, r) {
    super(e, i, n, s, r), this.type = 5;
  }
  _$AI(e, i = this) {
    if ((e = J(this, e, i, 0) ?? y) === Y)
      return;
    const n = this._$AH, s = e === y && n !== y || e.capture !== n.capture || e.once !== n.once || e.passive !== n.passive, r = e !== y && (n === y || s);
    s && this.element.removeEventListener(this.name, this, n), r && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    var i;
    typeof this._$AH == "function" ? this._$AH.call(((i = this.options) == null ? void 0 : i.host) ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class vt {
  constructor(e, i, n) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = i, this.options = n;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    J(this, e);
  }
}
const _0 = r0.litHtmlPolyfillSupport;
_0 == null || _0(l0, h0), (r0.litHtmlVersions ?? (r0.litHtmlVersions = [])).push("3.1.2");
const kt = (t, e, i) => {
  const n = (i == null ? void 0 : i.renderBefore) ?? e;
  let s = n._$litPart$;
  if (s === void 0) {
    const r = (i == null ? void 0 : i.renderBefore) ?? null;
    n._$litPart$ = s = new h0(e.insertBefore(a0(), r), r, void 0, i ?? {});
  }
  return s._$AI(t), s;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
class m extends W {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    var i;
    const e = super.createRenderRoot();
    return (i = this.renderOptions).renderBefore ?? (i.renderBefore = e.firstChild), e;
  }
  update(e) {
    const i = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = kt(i, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    var e;
    super.connectedCallback(), (e = this._$Do) == null || e.setConnected(!0);
  }
  disconnectedCallback() {
    var e;
    super.disconnectedCallback(), (e = this._$Do) == null || e.setConnected(!1);
  }
  render() {
    return Y;
  }
}
var K0;
m._$litElement$ = !0, m.finalized = !0, (K0 = globalThis.litElementHydrateSupport) == null || K0.call(globalThis, { LitElement: m });
const S0 = globalThis.litElementPolyfillSupport;
S0 == null || S0({ LitElement: m });
(globalThis.litElementVersions ?? (globalThis.litElementVersions = [])).push("4.0.4");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const k = (t) => (e, i) => {
  i !== void 0 ? i.addInitializer(() => {
    customElements.define(t, e);
  }) : customElements.define(t, e);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const $t = { attribute: !0, type: String, converter: x0, reflect: !1, hasChanged: D0 }, bt = (t = $t, e, i) => {
  const { kind: n, metadata: s } = i;
  let r = globalThis.litPropertyMetadata.get(s);
  if (r === void 0 && globalThis.litPropertyMetadata.set(s, r = /* @__PURE__ */ new Map()), r.set(i.name, t), n === "accessor") {
    const { name: a } = i;
    return { set(l) {
      const c = e.get.call(this);
      e.set.call(this, l), this.requestUpdate(a, c, t);
    }, init(l) {
      return l !== void 0 && this.P(a, void 0, t), l;
    } };
  }
  if (n === "setter") {
    const { name: a } = i;
    return function(l) {
      const c = this[a];
      e.call(this, l), this.requestUpdate(a, c, t);
    };
  }
  throw Error("Unsupported decorator location: " + n);
};
function o(t) {
  return (e, i) => typeof i == "object" ? bt(t, e, i) : ((n, s, r) => {
    const a = s.hasOwnProperty(r);
    return s.constructor.createProperty(r, a ? { ...n, wrapped: !0 } : n), a ? Object.getOwnPropertyDescriptor(s, r) : void 0;
  })(t, e, i);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const M0 = (t, e, i) => (i.configurable = !0, i.enumerable = !0, Reflect.decorate && typeof e != "object" && Object.defineProperty(t, e, i), i);
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function it(t, e) {
  return (i, n, s) => {
    const r = (a) => {
      var l;
      return ((l = a.renderRoot) == null ? void 0 : l.querySelector(t)) ?? null;
    };
    if (e) {
      const { get: a, set: l } = typeof n == "object" ? i : s ?? (() => {
        const c = Symbol();
        return { get() {
          return this[c];
        }, set(h) {
          this[c] = h;
        } };
      })();
      return M0(i, n, { get() {
        let c = a.call(this);
        return c === void 0 && (c = r(this), (c !== null || this.hasUpdated) && l.call(this, c)), c;
      } });
    }
    return M0(i, n, { get() {
      return r(this);
    } });
  };
}
const st = p`
  <pattern id="pins-female" width="2.54" height="2.54" patternUnits="userSpaceOnUse">
    <rect x="0" y="0" width="2.54" height="2.54" fill="#404040"></rect>
    <rect x="1.079" y="0.896" width="0.762" height="0.762" style="fill: #191919"></rect>
    <path
      transform="translate(1.079, 1.658) rotate(180 0 0)"
      d="m 0 0 v 0.762 l 0.433,0.433 c 0.046,-0.046 0.074,-0.109 0.074,-0.179 v -1.27 c 0,-0.070 -0.028,-0.133 -0.074,-0.179 z"
      style="opacity: 0.25"
    ></path>
    <path
      transform="translate(1.841, 1.658) rotate(90 0 0)"
      d="m 0 0 v 0.762 l 0.433,0.433 c 0.046,-0.046 0.074,-0.109 0.074,-0.179 v -1.27 c 0,-0.070 -0.028,-0.133 -0.074,-0.179 z"
      style="opacity: 0.3; fill: #fff"
    ></path>
    <path
      transform="translate(1.841, 0.896)"
      d="m 0 0 v 0.762 l 0.433,0.433 c 0.046,-0.046 0.074,-0.109 0.074,-0.179 v -1.27 c 0,-0.070 -0.028,-0.133 -0.074,-0.179 z"
      style="opacity: 0.15; fill: #fff"
    ></path>
    <path
      transform="translate(1.079, 0.896) rotate(270 0 0)"
      d="m 0 0 v 0.762 l 0.433,0.433 c 0.046,-0.046 0.074,-0.109 0.074,-0.179 v -1.27 c 0,-0.070 -0.028,-0.133 -0.074,-0.179 z"
      style="opacity: 0.35"
    ></path>
  </pattern>
`, R = (t) => ({
  type: "analog",
  channel: t
}), i0 = (t, e = 0) => ({
  type: "i2c",
  signal: t,
  bus: e
}), s0 = (t, e = 0) => ({
  type: "spi",
  signal: t,
  bus: e
}), q0 = (t, e = 0) => ({
  type: "usart",
  signal: t,
  bus: e
}), Ct = () => ({ type: "power", signal: "GND" }), _t = (t) => ({
  type: "power",
  signal: "VCC",
  voltage: t
}), Z = [" ", "Spacebar"];
/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const St = /* @__PURE__ */ new Set(["children", "localName", "ref", "style", "className"]), G0 = /* @__PURE__ */ new WeakMap(), At = (t, e, i, n, s) => {
  const r = s == null ? void 0 : s[e];
  r === void 0 || i === n ? (t[e] = i, i == null && e in HTMLElement.prototype && t.removeAttribute(e)) : ((a, l, c) => {
    let h = G0.get(a);
    h === void 0 && G0.set(a, h = /* @__PURE__ */ new Map());
    let d = h.get(l);
    c !== void 0 ? d === void 0 ? (h.set(l, d = { handleEvent: c }), a.addEventListener(l, d)) : d.handleEvent = c : d !== void 0 && (h.delete(l), a.removeEventListener(l, d));
  })(t, r, i);
}, b = ({ react: t, tagName: e, elementClass: i, events: n, displayName: s }) => {
  const r = new Set(Object.keys(n ?? {})), a = t.forwardRef((l, c) => {
    const h = t.useRef(null), d = t.useRef(null), g = {}, C = {};
    for (const [f, j] of Object.entries(l))
      St.has(f) ? g[f === "className" ? "class" : f] = j : r.has(f) || f in i.prototype ? C[f] = j : g[f] = j;
    return t.useLayoutEffect(() => {
      if (d.current !== null) {
        for (const f in C)
          At(d.current, f, l[f], h.current ? h.current[f] : void 0, n);
        h.current = l;
      }
    }), t.useLayoutEffect(() => {
      var f;
      (f = d.current) == null || f.removeAttribute("defer-hydration");
    }, []), g.suppressHydrationWarning = !0, t.createElement(e, { ...g, ref: t.useCallback((f) => {
      d.current = f, typeof c == "function" ? c(f) : c !== null && (c.current = f);
    }, [c]) });
  });
  return a.displayName = s ?? i.name, a;
}, S = w`
    .active {
        --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) #e7ebed;
        --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);
        box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
    }
    .pin-target:hover{
        fill: #4af;
        fill-opacity: 1;
    }
    .pin-group {
        fill: red;
        //fill-opacity: 0;
    }
    
    .container {
        padding: 2px;
        width: fit-content;
    }
    .pin-target {
        r:4px;
        z-index: 99;
        fill: transparent;
    }
`;
function A(t, e) {
  const i = t.x * Math.cos(e) - t.y * Math.sin(e), n = t.x * Math.sin(e) + t.y * Math.cos(e);
  return {
    ...t,
    x: i,
    y: n
  };
}
var Et = Object.defineProperty, Pt = Object.getOwnPropertyDescriptor, O = (t, e, i, n) => {
  for (var s = n > 1 ? void 0 : n ? Pt(e, i) : e, r = t.length - 1, a; r >= 0; r--)
    (a = t[r]) && (s = (n ? a(e, i, s) : a(s)) || s);
  return n && s && Et(e, i, s), s;
};
let x = class extends m {
  constructor() {
    super(...arguments), this.led13 = !1, this.ledRX = !1, this.ledTX = !1, this.ledPower = !1, this.resetPressed = !1, this.isActive = !1, this.rotationTransform = 0, this.isDragged = !1, this.pinInfo = [
      { name: "A5.2", x: 72, y: 9, signals: [R(5), i0("SCL")] },
      { name: "A4.2", x: 81.7, y: 9, signals: [R(4), i0("SDA")] },
      { name: "AREF", x: 91.4, y: 9, signals: [] },
      {
        name: "GND.1",
        x: 101,
        y: 9,
        signals: [{ type: "power", signal: "GND" }]
      },
      { name: "13", x: 110.6, y: 9, signals: [s0("SCK")] },
      { name: "12", x: 120.6, y: 9, signals: [s0("MISO")] },
      { name: "11", x: 130, y: 9, signals: [s0("MOSI"), { type: "pwm" }] },
      { name: "10", x: 139.6, y: 9, signals: [s0("SS"), { type: "pwm" }] },
      { name: "9", x: 149.4, y: 9, signals: [{ type: "pwm" }] },
      { name: "8", x: 159.4, y: 9, signals: [] },
      { name: "7", x: 174.4, y: 9, signals: [] },
      { name: "6", x: 184, y: 9, signals: [{ type: "pwm" }] },
      { name: "5", x: 193.6, y: 9, signals: [{ type: "pwm" }] },
      { name: "4", x: 203.4, y: 9, signals: [] },
      { name: "3", x: 213.2, y: 9, signals: [{ type: "pwm" }] },
      { name: "2", x: 222.8, y: 9, signals: [] },
      { name: "1", x: 232, y: 9, signals: [q0("TX")] },
      { name: "0", x: 242.2, y: 9, signals: [q0("RX")] },
      { name: "IOREF", x: 117, y: 192.6, signals: [] },
      { name: "RESET", x: 126.4, y: 192.6, signals: [] },
      {
        name: "3.3V",
        x: 136,
        y: 192.6,
        signals: [{ type: "power", signal: "VCC", voltage: 3.3 }]
      },
      {
        name: "5V",
        x: 145.8,
        y: 192.6,
        signals: [{ type: "power", signal: "VCC", voltage: 5 }]
      },
      {
        name: "GND.2",
        x: 155.6,
        y: 192.6,
        signals: [{ type: "power", signal: "GND" }]
      },
      {
        name: "GND.3",
        x: 165.4,
        y: 192.6,
        signals: [{ type: "power", signal: "GND" }]
      },
      {
        name: "VIN",
        x: 174.8,
        y: 192.6,
        signals: [{ type: "power", signal: "VCC" }]
      },
      { name: "A0", x: 194.6, y: 192.6, signals: [R(0)] },
      { name: "A1", x: 203.8, y: 192.6, signals: [R(1)] },
      { name: "A2", x: 213.6, y: 192.6, signals: [R(2)] },
      { name: "A3", x: 223.2, y: 192.6, signals: [R(3)] },
      { name: "A4", x: 233.2, y: 192.6, signals: [R(4), i0("SDA")] },
      { name: "A5", x: 243, y: 192.6, signals: [R(5), i0("SCL")] }
    ];
  }
  get rotatedPinInfo() {
    return this.pinInfo.map(
      (t) => A(t, this.rotationTransform)
    );
  }
  static get styles() {
    return [
      S,
      w`
        text {
          font-size: 2px;
          font-family: monospace;
          user-select: none;
        }

        circle[tabindex]:hover,
        circle[tabindex]:focus {
          stroke: white;
          outline: none;
        }
      `
    ];
  }
  update(t) {
    t.has("flip") && this.dispatchEvent(
      new CustomEvent("pininfo-change", { detail: this.pinInfo })
    ), t.has("rotationTransform") && this.dispatchEvent(
      new CustomEvent("pininfo-change", { detail: this.rotatedPinInfo })
    ), super.update(t);
  }
  _onPinClick(t) {
    this.dispatchEvent(
      new CustomEvent("pin-clicked", {
        detail: {
          data: t.target.dataset.value,
          id: t.target.id,
          clientX: t.clientX,
          clientY: t.clientY
        }
      })
    );
  }
  render() {
    const { ledPower: t, led13: e, ledRX: i, ledTX: n } = this;
    return v` <svg
      width="274.318110236px"
      height="201.6px"
      viewBox="-4 0 274.318110236 201.6"
      class="${this.isActive && !this.isDragged ? "active" : ""} component-svg"
    >
      <g transform="scale(3.8)">
        <defs>
          <g id="led-body" fill="#eee">
            <rect x="0" y="0" height="1.2" width="2.6" fill="#c6c6c6" />
            <rect
              x="0.6"
              y="-0.1"
              width="1.35"
              height="1.4"
              stroke="#aaa"
              stroke-width="0.05"
            />
          </g>
        </defs>

        <filter id="ledFilter" x="-0.8" y="-0.8" height="2.2" width="2.8">
          <feGaussianBlur stdDeviation="0.5" />
        </filter>

        ${st}

        <pattern
          id="pin-male"
          width="2.54"
          height="4.80"
          patternUnits="userSpaceOnUse"
        >
          <rect ry="0.3" rx="0.3" width="2.12" height="4.80" fill="#565656" />
          <ellipse cx="1" cy="1.13" rx="0.5" ry="0.5" fill="#aaa"></ellipse>
          <ellipse cx="1" cy="3.67" rx="0.5" ry="0.5" fill="#aaa"></ellipse>
        </pattern>

        <pattern
          id="mcu-leads"
          width="2.54"
          height="0.508"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 0.254,0 C 0.114,0 0,0.114 0,0.254 v 0 c 0,0.139 0,0.253 0,0.253 h 1.523 c 0,0 0,-0.114 0,-0.253 v 0 C 1.523,0.114 1.409,0 1.269,0 Z"
            fill="#ddd"
          />
        </pattern>

        <!-- PCB -->
        <path
          d="m0.999 0a1 1 0 0 0-0.999 0.999v51.34a1 1 0 0 0 0.999 0.999h64.04a1 1 0 0 0 0.999-0.999v-1.54l2.539-2.539v-32.766l-2.539-2.539v-11.43l-1.524-1.523zm14.078 0.835h0.325l0.212 0.041h0l0.105 0.021 0.300 0.124 0.270 0.180 0.229 0.229 0.180 0.270 0.017 0.042 0.097 0.234 0.01 0.023 0.050 0.252 0.013 0.066v0.325l-0.063 0.318-0.040 0.097-0.083 0.202-0 0.001-0.180 0.270-0.229 0.229-0.270 0.180-0.300 0.124-0.106 0.020-0.212 0.042h-0.325l-0.212-0.042-0.106-0.020-0.300-0.124-0.270-0.180-0.229-0.229-0.180-0.270-0 -0.001-0.083-0.202-0.040-0.097-0.063-0.318v-0.325l0.013-0.066 0.050-0.252 0.01-0.023 0.097-0.234 0.017-0.042 0.180-0.270 0.229-0.229 0.270-0.180 0.300-0.124 0.105-0.021zm50.799 15.239h0.325l0.212 0.042 0.105 0.021 0.300 0.124 0.270 0.180 0.229 0.229 0.180 0.270 0.014 0.035 0.110 0.264 0.01 0.051 0.053 0.267v0.325l-0.03 0.152-0.033 0.166-0.037 0.089-0.079 0.191-0 0.020-0.180 0.270-0.229 0.229-0.270 0.180-0.071 0.029-0.228 0.094-0.106 0.021-0.212 0.042h-0.325l-0.212-0.042-0.106-0.021-0.228-0.094-0.071-0.029-0.270-0.180-0.229-0.229-0.180-0.270-0 -0.020-0.079-0.191-0.036-0.089-0.033-0.166-0.030-0.152v-0.325l0.053-0.267 0.010-0.051 0.109-0.264 0.014-0.035 0.180-0.270 0.229-0.229 0.270-0.180 0.300-0.124 0.105-0.021zm0 27.94h0.325l0.180 0.036 0.138 0.027 0.212 0.087 0.058 0.024 0.029 0.012 0.270 0.180 0.229 0.229 0.180 0.270 0.124 0.300 0.063 0.319v0.325l-0.063 0.318-0.124 0.300-0.180 0.270-0.229 0.229-0.270 0.180-0.300 0.124-0.106 0.021-0.212 0.042h-0.325l-0.212-0.042-0.105-0.021-0.300-0.124-0.270-0.180-0.229-0.229-0.180-0.270-0.124-0.300-0.063-0.318v-0.325l0.063-0.319 0.124-0.300 0.180-0.270 0.229-0.229 0.270-0.180 0.029-0.012 0.058-0.024 0.212-0.087 0.137-0.027zm-52.07 5.080h0.325l0.212 0.041 0.106 0.021 0.300 0.124 0.270 0.180 0.229 0.229 0.121 0.182 0.058 0.087h0l0.114 0.275 0.01 0.023 0.063 0.318v0.325l-0.035 0.179-0.027 0.139-0.01 0.023-0.114 0.275h-0l-0.180 0.270-0.229 0.229-0.270 0.180-0.300 0.124-0.106 0.020-0.212 0.042h-0.325l-0.212-0.042-0.105-0.020-0.300-0.124-0.270-0.180-0.229-0.229-0.180-0.270-0.114-0.275-0.01-0.023-0.027-0.139-0.036-0.179v-0.325l0.063-0.318 0.01-0.023 0.114-0.275 0.058-0.087 0.121-0.182 0.229-0.229 0.270-0.180 0.300-0.124 0.105-0.021z"
          fill="#393434"
        />

        <!-- reset button -->
        <rect
          x="3.816"
          y="1.4125"
          width="6.2151"
          height="6.0268"
          fill="#CCCCCC"
        />
        <g fill="#E6E6E6">
          <rect x="2.1368" y="1.954" width="1.695" height=".84994" />
          <rect x="2.121" y="3.8362" width="1.695" height=".84994" />
          <rect x="2.0974" y="5.8608" width="1.695" height=".84994" />
          <rect x="10.031" y="6.0256" width="1.695" height=".84994" />
          <rect x="10.008" y="1.9528" width="1.695" height=".84994" />
        </g>
        <circle
          id="reset-button"
          cx="6.9619"
          cy="4.5279"
          r="1.5405"
          fill="#852725"
          stroke="#777"
          stroke-width="0.15"
          tabindex="0"
          @mousedown=${() => this._onDown()}
          @mouseup=${() => this._onUp()}
          @mouseleave=${() => this._onLeave()}
          @keydown=${(s) => Z.includes(s.key) && this._onDown()}
          @keyup=${(s) => Z.includes(s.key) && this._onUp()}
        />
          <!-- @touchstart=${() => this._onDown()} @touchend=${() => this._onLeave()}-->
        
        <!-- USB Connector -->
        <g style="fill:#B3B3B3;stroke:#B3B3B3;stroke-width:0.010">
          <rect width="1" height="1" x="0" y="8.5"></rect>
          <rect width="1" height="1" x="0" y="21.04"></rect>
          <g fill="#000">
            <rect
              width="11"
              height="11.93"
              x="-0.05"
              y="9.72"
              rx="0.2"
              ry="0.2"
              opacity="0.24"
            />
          </g>
          <rect x="-4" y="9.37" height="11.85" width="14.46" />
          <rect x="-4" y="9.61" height="11.37" width="14.05" fill="#706f6f" />
          <rect x="-4" y="9.71" height="11.17" width="13.95" fill="#9d9d9c" />
        </g>

        <!-- Power jack -->
        <g stroke-width=".254" fill="black">
          <rect fill="#232323" height="9.6" width="3.4" x="-2.3" y="41.05" />
          <rect
            xmlns="http://www.w3.org/2000/svg"
            fill="#232323"
            height="7.8"
            width="10.2"
            x="0"
            y="42"
          />
          <rect
            xmlns="http://www.w3.org/2000/svg"
            fill="#494949"
            height="0.8"
            width="9.1"
            x="1"
            y="42.3"
          />
          <!--          <path-->
          <!--            d="m-2.58 48.53v2.289c0 0.279 0.228 0.508 0.508 0.508h1.722c0.279 0 0.508-0.228 0.508-0.508v-2.289z"-->
          <!--            fill="#232323"-->
          <!--            opacity=".3"-->
          <!--          />-->
          <!--          <path-->
          <!--            d="m11.334 42.946c0-0.558-0.509-1.016-1.132-1.016h-10.043v9.652h10.043c0.622 0 1.132-0.457 1.132-1.016z"-->
          <!--            opacity=".3"-->
          <!--          />-->
          <!--          <path-->
          <!--            d="m-2.072 40.914c-0.279 0-0.507 0.204-0.507 0.454v8.435c0 0.279 0.228 0.507 0.507 0.507h1.722c0.279 0 0.507-0.228 0.507-0.507v-8.435c0-0.249-0.228-0.454-0.507-0.454z"-->
          <!--          />-->
          <!--          <path-->
          <!--            d="m-2.58 48.784v1.019c0 0.279 0.228 0.508 0.508 0.508h1.722c0.279 0 0.508-0.228 0.508-0.508v-1.019z"-->
          <!--            opacity=".3"-->
          <!--          />-->
          <!--          <path-->
          <!--            d="m11.334 43.327c0.139 0 0.254 0.114 0.254 0.254v4.064c0 0.139-0.114 0.254-0.254 0.254"-->
          <!--          />-->
          <!--          <path-->
          <!--            d="m11.334 42.438c0-0.558-0.457-1.016-1.016-1.016h-10.16v8.382h10.16c0.558 0 1.016-0.457 1.016-1.016z"-->
          <!--          />-->
          <!--          <path-->
          <!--            d="m10.064 49.804h-9.906v-8.382h1.880c-1.107 0-1.363 1.825-1.363 3.826 0 1.765 1.147 3.496 3.014 3.496h6.374z"-->
          <!--            opacity=".3"-->
          <!--          />-->
          <rect
            x="10.064"
            y="42"
            width=".254"
            height="7.8"
            fill="#ffffff"
            opacity=".2"
          />
          <!--          <path-->
          <!--            d="m10.318 48.744v1.059c0.558 0 1.016-0.457 1.016-1.016v-0.364c0 0.313-1.016 0.320-1.016 0.320z"-->
          <!--            opacity=".3"-->
          <!--          />-->
          <rect
            xmlns="http://www.w3.org/2000/svg"
            fill="#000"
            height="0.8"
            width="9.1"
            x="1"
            y="48.6"
          />
        </g>

        <!-- Pin Headers -->
        <g transform="translate(17.497 1.27)">
          <rect
            width="${0.38 + 2.54 * 10}"
            height="2.54"
            fill="url(#pins-female)"
          ></rect>
        </g>
        <g transform="translate(44.421 1.27)">
          <rect
            width="${0.38 + 2.54 * 8}"
            height="2.54"
            fill="url(#pins-female)"
          ></rect>
        </g>
        <g transform="translate(26.641 49.53)">
          <rect
            width="${0.38 + 2.54 * 8}"
            height="2.54"
            fill="url(#pins-female)"
          ></rect>
        </g>
        <g transform="translate(49.501 49.53)">
          <rect
            width="${0.38 + 2.54 * 6}"
            height="2.54"
            fill="url(#pins-female)"
          ></rect>
        </g>

        <!-- MCU -->
        <g>
          <path
            d="m64.932 41.627h-36.72c-0.209 0-0.379-0.170-0.379-0.379v-8.545c0-0.209 0.170-0.379 0.379-0.379h36.72c0.209 0 0.379 0.170 0.379 0.379v8.545c0 0.209-0.169 0.379-0.379 0.379z"
            fill="#292c2d"
          />
          <path
            d="m65.019 40.397c0 0.279-0.228 0.508-0.508 0.508h-35.879c-0.279 0-0.507 0.025-0.507-0.254v-6.338c0-0.279 0.228-0.508 0.507-0.508h35.879c0.279 0 0.508 0.228 0.508 0.508z"
            opacity=".3"
          />
          <path
            d="m65.019 40.016c0 0.279-0.228 0.508-0.508 0.508h-35.879c-0.279 0-0.507 0.448-0.507-0.508v-6.084c0-0.279 0.228-0.508 0.507-0.508h35.879c0.279 0 0.508 0.228 0.508 0.508z"
            fill="#3c4042"
          />
          <rect
            transform="translate(29.205, 32.778)"
            fill="url(#mcu-leads)"
            height="0.508"
            width="35.56"
          ></rect>
          <rect
            transform="translate(29.205, 41.159) scale(1 -1)"
            fill="url(#mcu-leads)"
            height="0.508"
            width="35.56"
          ></rect>
          <g fill="#252728">
            <circle cx="33.269" cy="36.847" r="1" />
            <circle cx="59.939" cy="36.847" r="1" />
            <path d="M65 38.05a1.13 1.13 0 010-2.26v2.27z" />
          </g>
        </g>

        <!-- Programming Headers -->
        <g transform="translate(14.1 4.4)">
          <rect width="7" height="4.80" fill="url(#pin-male)" />
        </g>

        <g transform="translate(63 27.2) rotate(270 0 0)">
          <rect width="7" height="4.80" fill="url(#pin-male)" />
        </g>

        <!-- LEDs -->
        <g transform="translate(57.3, 16.21)">
          <use xlink:href="#led-body" />
          ${t && p`<circle cx="1.3" cy="0.55" r="1.3" fill="#80ff80" filter="url(#ledFilter)" />`}
        </g>

        <text fill="#fff">
          <tspan x="60.88" y="17.5">ON</tspan>
        </text>

        <g transform="translate(26.87,11.69)">
          <use xlink:href="#led-body" />
          ${e && p`<circle cx="1.3" cy="0.55" r="1.3" fill="#ff8080" filter="url(#ledFilter)" />`}
        </g>

        <g transform="translate(26.9, 16.2)">
          <use xlink:href="#led-body" />
          ${n && p`<circle cx="0.975" cy="0.55" r="1.3" fill="yellow" filter="url(#ledFilter)" />`}
        </g>

        <g transform="translate(26.9, 18.5)">
          <use xlink:href="#led-body" />
          ${i && p`<circle cx="0.975" cy="0.55" r="1.3" fill="yellow" filter="url(#ledFilter)" />`}
        </g>

        <text fill="#fff" style="text-anchor: end">
          <tspan x="26.5" y="13">L</tspan>
          <tspan x="26.5" y="17.5">TX</tspan>
          <tspan x="26.5" y="19.8">RX</tspan>
          <tspan x="26.5" y="20">&nbsp;</tspan>
        </text>

        <!-- Pin Labels -->
        <rect x="28.4" y="8.6" width="31.5" height="0.16" fill="#fff"></rect>
        <text fill="#fff" style="font-weight: 800">
          <tspan x="38.84" y="10.44">DIGITAL PWM (~)</tspan>
        </text>
        <text
          transform="translate(22.6 4) rotate(270 0 0)"
          fill="#fff"
          style="font-size: 2px; text-anchor: end; font-family: monospace"
        >
          <tspan x="0" dy="2.54">AREF</tspan>
          <tspan x="0" dy="2.54">GND</tspan>
          <tspan x="0" dy="2.54">13</tspan>
          <tspan x="0" dy="2.54">12</tspan>
          <tspan x="0" dy="2.54">~11</tspan>
          <tspan x="0" dy="2.54">~10</tspan>
          <tspan x="0" dy="2.54">~9</tspan>
          <tspan x="0" dy="2.54">8</tspan>
          <tspan x="0" dy="4.08">7</tspan>
          <tspan x="0" dy="2.54">~6</tspan>
          <tspan x="0" dy="2.54">~5</tspan>
          <tspan x="0" dy="2.54">4</tspan>
          <tspan x="0" dy="2.54">~3</tspan>
          <tspan x="0" dy="2.54">2</tspan>
          <tspan x="0" dy="2.54">TX→1</tspan>
          <tspan x="0" dy="2.54">RX←0</tspan>
          <tspan x="0" dy="2.54">&nbsp;</tspan>
        </text>

        <rect
          x="33.90"
          y="42.76"
          width="12.84"
          height="0.16"
          fill="#fff"
        ></rect>
        <rect
          x="49.48"
          y="42.76"
          width="14.37"
          height="0.16"
          fill="#fff"
        ></rect>
        <text fill="#fff" style="font-weight: 900">
          <tspan x="41" y="44.96">POWER</tspan>
          <tspan x="53.5" y="44.96">ANALOG IN</tspan>
        </text>
        <text
          transform="translate(29.19 49) rotate(270 0 0)"
          fill="#fff"
          style="font-weight: 700"
        >
          <tspan x="0" dy="2.54">IOREF</tspan>
          <tspan x="0" dy="2.54">RESET</tspan>
          <tspan x="0" dy="2.54">3.3V</tspan>
          <tspan x="0" dy="2.54">5V</tspan>
          <tspan x="0" dy="2.54">GND</tspan>
          <tspan x="0" dy="2.54">GND</tspan>
          <tspan x="0" dy="2.54">Vin</tspan>
          <tspan x="0" dy="4.54">A0</tspan>
          <tspan x="0" dy="2.54">A1</tspan>
          <tspan x="0" dy="2.54">A2</tspan>
          <tspan x="0" dy="2.54">A3</tspan>
          <tspan x="0" dy="2.54">A4</tspan>
          <tspan x="0" dy="2.54">A5</tspan>
          <tspan x="0" dy="2.54">&nbsp;</tspan>
        </text>

        <!-- Logo -->
        <!--        <path-->
        <!--          style="fill:none;stroke:#fff;stroke-width:1.03"-->
        <!--          d="m 34.21393,12.01079 c -1.66494,-0.13263 -3.06393,1.83547 -2.37559,3.36182 0.66469,1.65332 3.16984,2.10396 4.36378,0.77797 1.15382,-1.13053 1.59956,-2.86476 3.00399,-3.75901 1.43669,-0.9801 3.75169,-0.0547 4.02384,1.68886 0.27358,1.66961 -1.52477,3.29596 -3.15725,2.80101 -1.20337,-0.27199 -2.06928,-1.29866 -2.56193,-2.37788 -0.6046,-1.0328 -1.39499,-2.13327 -2.62797,-2.42367 -0.2191,-0.0497 -0.44434,-0.0693 -0.66887,-0.0691 z"-->
        <!--        />-->
        <!--        <path-->
        <!--          style="fill:none;stroke:#fff;stroke-width:0.56"-->
        <!--          d="m 39.67829,14.37519 h 1.75141 m -0.89321,-0.8757 v 1.7514 m -7.30334,-0.8757 h 2.10166"-->
        <!--        />-->
        <!--        <text-->
        <!--          x="31"-->
        <!--          y="20.2"-->
        <!--          style="font-size:2.8px;font-weight:bold;line-height:1.25;fill:#fff"-->
        <!--        >-->
        <!--          ARDUINO-->
        <!--        </text>-->

        <!--        <rect-->
        <!--          style="fill:none;stroke:#fff;stroke-width:0.1;stroke-dasharray:0.1, 0.1"-->
        <!--          width="11"-->
        <!--          height="5.45"-->
        <!--          x="45.19"-->
        <!--          y="11.83"-->
        <!--          rx="1"-->
        <!--          ry="1"-->
        <!--        />-->
        <text
          x="42.5"
          y="16"
          style="font-size:4px; line-height:1.25"
          fill="#fff"
        >
          HERO
        </text>
      </g>

      <g class="pin-group">
        ${this.pinInfo.map((s) => p`
                    <circle @click=${this._onPinClick} 
                    id="${"pt-" + this.id + "-" + s.name}" 
                    data-value="${JSON.stringify(s)}" 
                    class="pin-target" 
                    r="2px" 
                    cx=${s.x} 
                    cy=${s.y} ><title>${s.name}</title></circle>`)}
      </g>
    </svg>`;
  }
  /**
   * Handles the mousedown event.
   *
   * @private
   * @returns {void}
   */
  _onDown() {
    console.log("mousedown"), this.resetPressed || (this.resetButton.style.stroke = x.RESET_BUTTON_COLOR, this.dispatchEvent(
      new CustomEvent("button-press", {
        detail: "reset"
      })
    )), this.resetPressed = !0;
  }
  /**
   * Handles the mouseup event.
   *
   * @private
   * @return {void}
   */
  _onUp() {
    console.log("mouseup"), this.resetPressed && this.resetButtonAction();
  }
  /**
   * Performs the reset button action.
   *
   * @private
   * @function resetButtonAction
   * @returns {void}
   */
  resetButtonAction() {
    this.resetPressed = !1, this.resetButton.style.stroke = "", this.dispatchButtonReleaseEvent("reset");
  }
  /**
   * Dispatches a button release event.
   *
   * @param {string} eventType - The type of button release event.
   * @private
   *
   * @return {void}
   */
  dispatchButtonReleaseEvent(t) {
    this.dispatchEvent(
      new CustomEvent("button-release", {
        detail: t
      })
    );
  }
  /**
   * Handles the mouseleave event for the reset button.
   * @private
   * @returns {void} No return value.
   */
  _onLeave() {
    console.log("mouseleave"), this.resetButton.blur(), this._onUp();
  }
};
x.RESET_BUTTON_COLOR = "#333";
O([
  o()
], x.prototype, "led13", 2);
O([
  o()
], x.prototype, "ledRX", 2);
O([
  o()
], x.prototype, "ledTX", 2);
O([
  o()
], x.prototype, "ledPower", 2);
O([
  o()
], x.prototype, "resetPressed", 2);
O([
  it("#reset-button")
], x.prototype, "resetButton", 2);
O([
  o({ type: Boolean })
], x.prototype, "isActive", 2);
O([
  o()
], x.prototype, "rotationTransform", 2);
O([
  o({ type: Boolean })
], x.prototype, "isDragged", 2);
x = O([
  k("inventr-hero-board")
], x);
const fe = b({
  tagName: "inventr-hero-board",
  elementClass: x,
  react: $,
  events: {
    onPininfoChange: "pininfo-change",
    onPinClicked: "pin-clicked"
  }
});
var Dt = Object.defineProperty, Ot = Object.getOwnPropertyDescriptor, p0 = (t, e, i, n) => {
  for (var s = n > 1 ? void 0 : n ? Ot(e, i) : e, r = t.length - 1, a; r >= 0; r--)
    (a = t[r]) && (s = (n ? a(e, i, s) : a(s)) || s);
  return n && s && Dt(e, i, s), s;
};
let G = class extends m {
  constructor() {
    super(...arguments), this.hasSignal = !1, this.rotationTransform = 0, this.isActive = !1, this.isDragged = !1, this.pinInfo = [
      { name: "bz1", x: 28, y: 100, signals: [] },
      { name: "bz2", x: 38.4, y: 100, signals: [] },
      { name: "bz3", x: 48.7, y: 100, signals: [] }
    ];
  }
  get rotatedPinInfo() {
    return this.pinInfo.map(
      (t) => A(t, this.rotationTransform)
    );
  }
  static get styles() {
    return [
      S,
      w`
        :host {
          display: inline-block;
        }

        .buzzer-container {
          display: flex;
          flex-direction: column;
          width: 75px;
        }

        .music-note {
          position: relative;
          left: 40px;
          animation-duration: 1.5s;
          animation-name: animate-note;
          animation-iteration-count: infinite;
          animation-timing-function: linear;
          transform: scale(1.5);
          fill: blue;
          offset-path: path(
            'm0 0c-0.9-0.92-1.8-1.8-2.4-2.8-0.56-0.92-0.78-1.8-0.58-2.8 0.2-0.92 0.82-1.8 1.6-2.8 0.81-0.92 1.8-1.8 2.6-2.8 0.81-0.92 1.4-1.8 1.6-2.8 0.2-0.92-0.02-1.8-0.58-2.8-0.56-0.92-1.5-1.8-2.4-2.8'
          );
          offset-rotate: 0deg;
        }

        @keyframes animate-note {
          0% {
            offset-distance: 0%;
            opacity: 0;
          }
          10% {
            offset-distance: 10%;
            opacity: 1;
          }
          75% {
            offset-distance: 75%;
            opacity: 1;
          }
          100% {
            offset-distance: 100%;
            opacity: 0;
          }
        }
      `
    ];
  }
  _onPinClick(t) {
    this.dispatchEvent(
      new CustomEvent("pin-clicked", {
        detail: {
          data: t.target.dataset.value,
          id: t.target.id,
          clientX: t.clientX,
          clientY: t.clientY
        }
      })
    );
  }
  update(t) {
    super.update(t), t.has("flip") && this.dispatchEvent(
      new CustomEvent("pininfo-change", { detail: this.pinInfo })
    ), t.has("rotationTransform") && this.dispatchEvent(
      new CustomEvent("pininfo-change", { detail: this.rotatedPinInfo })
    );
  }
  render() {
    let t = this.hasSignal;
    return v`
      <div class="buzzer-container">
        <svg
          class="music-note"
          style="visibility: ${t ? "" : "hidden"}"
          xmlns="http://www.w3.org/2000/svg"
          width="8"
          height="8"
          viewBox="0 0 8 8"
        >
          <path
            d="M8 0c-5 0-6 1-6 1v4.09c-.15-.05-.33-.09-.5-.09-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5v-3.97c.73-.23 1.99-.44 4-.5v2.06c-.15-.05-.33-.09-.5-.09-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5v-5.5z"
          />
        </svg>

<!--          transform="rotate(${this.rotationTransform})"-->
        <svg
          width="80px"
          height="104px"
          viewBox="0 0 80 104"
          xmlns="http://www.w3.org/2000/svg"
          class="${this.isActive && !this.isDragged ? "active" : ""} component-svg"
        >
          <g transform="scale(4.55)">
            <rect x="0" y="0" height="20" width="17.5" fill="#363636" />

            <circle cx="1.8" cy="1.8" r="1.1" fill="#ccc" stroke-width=".25" />

            <circle cx="1.8" cy="1.8" r="0.8" fill="#fff" stroke-width=".25" />
            <circle cx="15.4" cy="1.8" r="1.1" fill="#ccc" stroke-width=".25" />
            <circle cx="15.4" cy="1.8" r="0.8" fill="#fff" stroke-width=".25" />

            <text fill="#fff" style="font-weight: 1; font-size: 2px;">
              <tspan x="14.8" y="19">S</tspan>
              <tspan x="1" y="19">-</tspan>
            </text>

            <rect x="4.5" y="17" height="3" width="8" fill="#000"></rect>

            <!--PINS-->
            <path
              d="m6.23 18.5v3.5"
              fill="none"
              stroke="#A8A8A8"
              stroke-width=".5"
            />
            <path
              d="m8.47 18.5v3.5"
              fill="#f00"
              stroke="#A8A8A8"
              stroke-width=".5"
            />
            <path
              d="m10.77 18.5v3.5"
              fill="none"
              stroke="#A8A8A8"
              stroke-width=".5"
            />

            <g stroke="#000">
              <g>
                <ellipse
                  cx="8.5"
                  cy="8.5"
                  rx="7.15"
                  ry="7.15"
                  fill="#1a1a1a"
                  stroke-width=".7"
                />
                <circle
                  cx="8.5"
                  cy="8.5"
                  r="6.3472"
                  fill="none"
                  stroke-width=".3"
                />
                <circle
                  cx="8.5"
                  cy="8.5"
                  r="4.3488"
                  fill="none"
                  stroke-width=".3"
                />
              </g>
              <circle
                cx="8.5"
                cy="8.5"
                r="1.3744"
                fill="#ccc"
                stroke-width=".25"
              />
            </g>
          </g>
          <!-- PIN TARGETS -->
          <g class="pin-group">
            ${this.pinInfo.map((e) => p`<circle id="${"pt-" + this.id + "-" + e.name}" @click=${this._onPinClick} data-value="${JSON.stringify(e)}" class="pin-target" 
  r="2px" cx=${e.x} cy=${e.y} ><title>${e.name}</title></circle>`)}
          </g>
        </svg>
      </div>
    `;
  }
};
p0([
  o()
], G.prototype, "hasSignal", 2);
p0([
  o()
], G.prototype, "rotationTransform", 2);
p0([
  o({ type: Boolean })
], G.prototype, "isActive", 2);
p0([
  o({ type: Boolean })
], G.prototype, "isDragged", 2);
G = p0([
  k("buzzer-component")
], G);
const ye = b({
  tagName: "buzzer-component",
  elementClass: G,
  react: $,
  events: {
    onPininfoChange: "pininfo-change",
    onPinClicked: "pin-clicked"
  }
}), zt = p`
  <pattern id="pins-male" width="2.54" height="2.54" patternUnits="userSpaceOnUse">
    <rect x="0" y="0" width="2.54" height="2.54" fill="#404040"></rect>
        <rect x="0.849" y="0.8" width="0.982" height="0.982" style="fill: #ff0000"></rect>
        <path
            transform="translate(1.079, 1.658) rotate(180 0 0)"
            d="m 0 0 v 0.762 l 0.433,0.433 c 0.046,-0.046 0.074,-0.109 0.074,-0.179 v -1.27 c 0,-0.070 -0.028,-0.133 -0.074,-0.179 z"
            style="opacity: 0.25"
        ></path>
        <path
            transform="translate(1.841, 1.658) rotate(90 0 0)"
            d="m 0 0 v 0.762 l 0.433,0.433 c 0.046,-0.046 0.074,-0.109 0.074,-0.179 v -1.27 c 0,-0.070 -0.028,-0.133 -0.074,-0.179 z"
            style="opacity: 0.3; fill: #000"
        ></path>
        <path
            transform="translate(1.841, 0.896)"
            d="m 0 0 v 0.762 l 0.433,0.433 c 0.046,-0.046 0.074,-0.109 0.074,-0.179 v -1.27 c 0,-0.070 -0.028,-0.133 -0.074,-0.179 z"
            style="opacity: 0.15; fill: #000"
        ></path>
        <path
            transform="translate(1.079, 0.896) rotate(270 0 0)"
            d="m 0 0 v 0.762 l 0.433,0.433 c 0.046,-0.046 0.074,-0.109 0.074,-0.179 v -1.27 c 0,-0.070 -0.028,-0.133 -0.074,-0.179 z"
            style="opacity: 0.35"
        ></path>
        <circle
            cx="1.34"
            cy="1.3"
            r="0.362"
            fill="#d9d5bc"
            stroke="#777"
            stroke-width="0.15"
            tabindex="0"
        />
  </pattern>
`;
var Tt = Object.defineProperty, It = Object.getOwnPropertyDescriptor, d0 = (t, e, i, n) => {
  for (var s = n > 1 ? void 0 : n ? It(e, i) : e, r = t.length - 1, a; r >= 0; r--)
    (a = t[r]) && (s = (n ? a(e, i, s) : a(s)) || s);
  return n && s && Tt(e, i, s), s;
};
const jt = [6.7, 23, 39.4, 55.6], Rt = [1, 18, 35, 51];
let F = class extends m {
  constructor() {
    super(...arguments), this.keys = [
      "S1",
      "S2",
      "S3",
      "S4",
      "S5",
      "S6",
      "S7",
      "S8",
      "S9",
      "S10",
      "S11",
      "S12",
      "S13",
      "S14",
      "S15",
      "S16"
    ], this.keyValues = [
      "1",
      "2",
      "3",
      "A",
      "4",
      "5",
      "6",
      "B",
      "7",
      "8",
      "9",
      "C",
      "*",
      "0",
      "#",
      "D"
    ], this.rotationTransform = 0, this.isDragged = !1, this.pressedKeys = /* @__PURE__ */ new Set();
  }
  get pinInfo() {
    return [
      { name: "R1", x: 5, y: 160, signals: [] },
      { name: "R2", x: 5, y: 150, signals: [] },
      { name: "R3", x: 5, y: 140, signals: [] },
      { name: "R4", x: 5, y: 130, signals: [] },
      { name: "C1", x: 5, y: 120, signals: [] },
      { name: "C2", x: 5, y: 110, signals: [] },
      { name: "C3", x: 5, y: 100, signals: [] },
      { name: "C4", x: 5, y: 90, signals: [] }
    ];
  }
  get rotatedPinInfo() {
    return this.pinInfo.map(
      (t) => A(t, this.rotationTransform)
    );
  }
  renderButton(t, e) {
    const i = this.keys[t * 4 + e] ?? "", n = this.keyValues[t * 4 + e] ?? "", s = i.toUpperCase();
    return p`<g
      class="hero-button"
      transform="translate(${jt[e]} ${Rt[t]})"
      tabindex="0"
      data-key-value=${n}
      data-key-name=${s}
      @blur=${(r) => {
      this.up(i, r.currentTarget);
    }}
      @mousedown=${() => this.down(i)}
      @mouseup=${() => this.up(i)}
      @keydown=${(r) => Z.includes(r.key) && this.down(i, r.currentTarget)}
      @keyup=${(r) => Z.includes(r.key) && this.up(i, r.currentTarget)}
    >
<!--    @touchstart=${() => this.down(i)} @touchend=${() => this.up(i)}-->
      <rect
        x="3.816"
        y="1.4125"
        width="8.2151px"
        height="8.0268px"
        fill="#CCCCCC"
      />
      <text x="8" y="12.4" style="line-height:1.25" fill="#fff">
        ${s}
      </text>
      <g fill="#E6E6E6">
        <rect x="3.1368" y="1.954" width=".695" height=".84994" />
        <rect x="3.0974" y="7.8608" width=".695" height=".84994" />
        <rect x="12.031" y="7.8608" width=".695" height=".84994" />
        <rect x="12.031" y="1.9528" width=".695" height=".84994" />
      </g>
      <circle
        id="${s}"
        cx="7.89"
        cy="5.5279"
        r="2.8"
        fill="#000"
        stroke="#777"
        stroke-width="0.15"
        tabindex="0"
      />`;
  }
  static get styles() {
    return [
      S,
      w`
        .hero-button:focus {
          outline: none;
        }
        circle:focus {
          outline: none;
        }
        .hero-button:active > circle {
          fill: red;
        }
      `
    ];
  }
  //this is triggering when changed properties includes flip prop.
  update(t) {
    t.has("flip") && this.dispatchEvent(
      new CustomEvent("pininfo-change", { detail: this.pinInfo })
    ), t.has("rotationTransform") && this.dispatchEvent(
      new CustomEvent("pininfo-change", { detail: this.rotatedPinInfo })
    ), super.update(t);
  }
  _onPinClick(t) {
    this.dispatchEvent(
      new CustomEvent("pin-clicked", {
        detail: {
          data: t.target.dataset.value,
          id: t.target.id,
          clientX: t.clientX,
          clientY: t.clientY
        }
      })
    );
  }
  render() {
    return v`
      <svg
        class="component-svg"
        width="${220}px"
        height="${204}px"
        viewBox="0 0 ${220} ${204}"
        font-family="sans-serif"
        font-size="3px"
        text-anchor="middle"
        @keydown=${(s) => this.keyStrokeDown(s.key)}
        @keyup=${(s) => this.keyStrokeUp(s.key)}
      >
        <g>
          <defs>
            <pattern
              id="wires"
              width="2.54"
              height="8"
              patternUnits="userSpaceOnUse"
            >
              <rect width="${2.54}" height="8" fill="#eee" />
              <rect x="0.77" width="1" height="6" fill="#d9d5bc" />
              <circle cx="1.27" cy="6" r="0.75" fill="#d9d5bc" />
              <rect x="0.52" y="6" width="1.5" height="2" fill="#d9d5bc" />
            </pattern>

            ${zt}
          </defs>

          <g transform="scale(3.1)">
            <!-- Keypad outline -->
            <rect
              x="0"
              y="0"
              width="${220}px"
              height="${204}px"
              fill="#1B763D"
            />
            <!--Male Pins-->
            <rect
              y="23.34"
              width="${2.54}px"
              height="${20.32}px"
              fill="url(#pins-male)"
            />

            <!--Buttons-->
            <g fill="#4e90d7">
              <g>${this.renderButton(0, 0)}</g>
              <g>${this.renderButton(0, 1)}</g>
              <g>${this.renderButton(0, 2)}</g>
              <g>${this.renderButton(0, 3)}</g>
              <g>${this.renderButton(1, 0)}</g>
              <g>${this.renderButton(1, 1)}</g>
              <g>${this.renderButton(1, 2)}</g>
              <g>${this.renderButton(1, 3)}</g>
              <g>${this.renderButton(2, 0)}</g>
              <g>${this.renderButton(2, 1)}</g>
              <g>${this.renderButton(2, 2)}</g>
              <g>${this.renderButton(2, 3)}</g>
              <g>${this.renderButton(3, 0)}</g>
              <g>${this.renderButton(3, 1)}</g>
              <g>${this.renderButton(3, 2)}</g>
              <g>${this.renderButton(3, 3)}</g>
            </g>
          </g>
        </g>
        <g transform="scale(0.82)" class="pin-group">
          ${this.pinInfo.map((s) => p`
                    <circle @click=${this._onPinClick} 
                    id="${"pt-" + this.id + "-" + s.name}" 
                    data-value="${JSON.stringify(s)}" 
                    class="pin-target" 
                    r="2px" 
                    cx=${s.x} 
                    cy=${s.y} ><title>${s.name}</title></circle>`)}
        </g>
      </svg>
    `;
  }
  keyIndex(t) {
    const e = this.keys.indexOf(t);
    return { row: Math.floor(e / 4), column: e % 4 };
  }
  down(t, e) {
    this.pressedKeys.has(t) || (e && e.classList.add("pressed"), this.pressedKeys.add(t), this.dispatchEvent(
      new CustomEvent("button-press", {
        detail: { key: t, ...this.keyIndex(t) }
      })
    ));
  }
  up(t, e) {
    this.pressedKeys.has(t) && (e && e.classList.remove("pressed"), this.pressedKeys.delete(t), this.dispatchEvent(
      new CustomEvent("button-release", {
        detail: { key: t, ...this.keyIndex(t) }
      })
    ));
  }
  keyStrokeDown(t) {
    var n;
    const e = t.toUpperCase(), i = (n = this.shadowRoot) == null ? void 0 : n.querySelector(
      `[data-key-name="${e}"]`
    );
    i && this.down(e, i);
  }
  keyStrokeUp(t) {
    var s, r;
    const e = t.toUpperCase(), i = (s = this.shadowRoot) == null ? void 0 : s.querySelector(
      `[data-key-name="${e}"]`
    ), n = (r = this.shadowRoot) == null ? void 0 : r.querySelectorAll(".pressed");
    t === "Shift" && (n == null || n.forEach((a) => {
      const l = a.dataset.keyName;
      l && this.up(l, a);
    })), i && this.up(e, i);
  }
};
d0([
  o({ type: Array })
], F.prototype, "keys", 2);
d0([
  o({ type: Array })
], F.prototype, "keyValues", 2);
d0([
  o()
], F.prototype, "rotationTransform", 2);
d0([
  o({ type: Boolean })
], F.prototype, "isDragged", 2);
F = d0([
  k("custom-keypad-component")
], F);
const me = b({
  tagName: "custom-keypad-component",
  elementClass: F,
  react: $,
  events: {
    onPininfoChange: "pininfo-change",
    onPinClicked: "pin-clicked"
  }
});
var Bt = Object.defineProperty, Nt = Object.getOwnPropertyDescriptor, g0 = (t, e, i, n) => {
  for (var s = n > 1 ? void 0 : n ? Nt(e, i) : e, r = t.length - 1, a; r >= 0; r--)
    (a = t[r]) && (s = (n ? a(e, i, s) : a(s)) || s);
  return n && s && Bt(e, i, s), s;
};
let H = class extends m {
  constructor() {
    super(...arguments), this.values = [0, 0, 0, 0], this.rotationTransform = 0, this.isActive = !1, this.isDragged = !1, this.svgWidth = 36.87, this.svgHeight = 56, this.scaleFactor = 1, this.pinInfo = [
      { name: "1a", number: 1, y: 5, x: 7.5, signals: [] },
      { name: "2a", number: 2, y: 5, x: 17.5, signals: [] },
      { name: "3a", number: 3, y: 5, x: 27.5, signals: [] },
      { name: "1b", number: 4, y: 52, x: 7.5, signals: [] },
      { name: "2b", number: 5, y: 52, x: 17.5, signals: [] },
      { name: "3b", number: 6, y: 52, x: 27.5, signals: [] }
    ];
  }
  get rotatedPinInfo() {
    return this.pinInfo.map(
      (t) => A(t, this.rotationTransform)
    );
  }
  update(t) {
    super.update(t), t.has("flip") && this.dispatchEvent(
      new CustomEvent("pininfo-change", { detail: this.pinInfo })
    ), t.has("rotationTransform") && this.dispatchEvent(
      new CustomEvent("pininfo-change", { detail: this.rotatedPinInfo })
    );
  }
  /**
   * Change switch state
   * @param index Which switch to change
   */
  toggleSwitch(t) {
    this.values[t] = this.values[t] ? 0 : 1, this.dispatchEvent(new InputEvent("switch-change", { detail: t })), this.requestUpdate();
  }
  /** Change switch state by keyboard 1-8 press */
  onKeyDown(t) {
    t.stopPropagation();
    const i = ["1", "2", "3", "4", "5", "6", "7", "8"].indexOf(t.key);
    i !== -1 && this.toggleSwitch(i);
  }
  drawSwitch(t, e) {
    return p` 
    <rect
    @click=${() => this.toggleSwitch(t)}
    x="${e + 4.693}"
    y="21.2"
    width="5.8168"
    height="13"
  />
  <use
    @click=${() => this.toggleSwitch(t)}
    xlink:href="#switch"
    x="${e}"
    y=${this.values[t] ? -7.2 : 0}
  />`;
  }
  preventTextSelection(t) {
    t.detail > 1 && t.preventDefault();
  }
  static get styles() {
    return [S, w``];
  }
  _onPinClick(t) {
    this.dispatchEvent(
      new CustomEvent("pin-clicked", {
        detail: {
          data: t.target.dataset.value,
          id: t.target.id,
          clientX: t.clientX,
          clientY: t.clientY
        }
      })
    );
  }
  render() {
    return v`
      <svg
        tabindex="0"
        @keydown=${this.onKeyDown}
        @mousedown=${this.preventTextSelection}
        class="${this.isActive && !this.isDragged ? "active" : ""} component-svg"
        width="${this.svgWidth}"
        height="${this.svgHeight}"
        viewBox="0 0 ${this.svgWidth} ${this.svgHeight}"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g transform="scale(1)">
          <defs>
            <path
              id="switch"
              transform="translate(-66.856 -41.367)"
              fill="#fffef4"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width=".77094"
              d="m72.096 69.764s1.3376 0.38247 2.1066 0.39196c0.76893 0.0095 2.44-0.39196 2.44-0.39196 0.39596-0.06361 0.72389 0.32286 0.72389 0.72389v4.3678c0 0.40104-0.52337 0.72389-0.72389 0.72389s-1.6592-0.41225-2.4288-0.40316c-0.76958 0.0091-2.1177 0.40316-2.1177 0.40316-0.39396 0.075-0.72389-0.32286-0.72389-0.72389v-4.3678c0-0.40104 0.32286-0.72389 0.72389-0.72389z"
            />
          </defs>

          <!-- Pins -->
          <g
            transform="translate(-66.856 -41.367)"
            fill="#454837"
            fill-opacity=".49194"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width=".76744"
          >
            <rect x="73" y="87" width="2" height="6.5" rx=".7" ry=".7" />
            <rect x="82.6" y="87" width="2" height="6.5" rx=".7" ry=".7" />
            <rect x="92.2" y="87" width="2" height="6.5" rx=".7" ry=".7" />

            <rect x="73" y="44.4" width="2" height="6.5" rx=".7" ry=".7" />
            <rect x="82.6" y="44.4" width="2" height="6.5" rx=".7" ry=".7" />
            <rect x="92.2" y="44.4" width="2" height="6.5" rx=".7" ry=".7" />
          </g>

          <!-- Board -->
          <rect x="0" y="8.5" width="35" height="38.0831" fill="#d72c2c" />

          <!-- Text -->
          <text
            fill="#fffef4"
            font-family="sans-serif"
            font-size="7.66px"
            style="line-height:1.25"
          >
            <tspan x="4.340" y="18.03">ON</tspan>
            <tspan x="20.340" y="18.03">YS</tspan>
            <tspan x="4.35" y="43.28">1</tspan>
            <tspan x="14.485" y="43.28">2</tspan>
            <tspan x="23.956" y="43.28">3</tspan>
          </text>

          <!-- Switches -->
          <g fill="#917c6f" stroke-width=".77094">
            ${this.drawSwitch(0, 0)}<!-- -->
            ${this.drawSwitch(1, 9.6)}<!-- -->
            ${this.drawSwitch(2, 19.4)}<!-- -->
          </g>
        </g>
        <g class="pin-group">
          ${this.pinInfo.map((t) => p`<circle id="${"pt-" + this.id + "-" + t.name}" 
                  @click=${this._onPinClick} 
                  data-value="${JSON.stringify(t)}"
                   class="pin-target" 
                   r="2px" 
                   cx=${t.x} 
                   cy=${t.y} ><title>${t.name}</title></circle>`)}
        </g>
      </svg>
    `;
  }
};
g0([
  o({ type: Array })
], H.prototype, "values", 2);
g0([
  o()
], H.prototype, "rotationTransform", 2);
g0([
  o()
], H.prototype, "isActive", 2);
g0([
  o()
], H.prototype, "isDragged", 2);
H = g0([
  k("dip-switch-3-component")
], H);
const xe = b({
  tagName: "dip-switch-3-component",
  elementClass: H,
  react: $,
  events: {
    onPininfoChange: "pininfo-change",
    onPinClicked: "pin-clicked"
  }
});
var Lt = Object.defineProperty, Ut = Object.getOwnPropertyDescriptor, f0 = (t, e, i, n) => {
  for (var s = n > 1 ? void 0 : n ? Ut(e, i) : e, r = t.length - 1, a; r >= 0; r--)
    (a = t[r]) && (s = (n ? a(e, i, s) : a(s)) || s);
  return n && s && Lt(e, i, s), s;
};
const Mt = [10.7, 25, 39.3, 53.6], qt = [7, 22, 37, 52];
function Gt(t) {
  return !isNaN(parseFloat(t));
}
let V = class extends m {
  constructor() {
    super(...arguments), this.columns = 4, this.connector = !1, this.keys = [
      "1",
      "2",
      "3",
      "A",
      "4",
      "5",
      "6",
      "B",
      "7",
      "8",
      "9",
      "C",
      "*",
      "0",
      "#",
      "D"
    ], this.rotationTransform = 0, this.pressedKeys = /* @__PURE__ */ new Set();
  }
  get pinInfo() {
    switch (this.columns) {
      case 3:
        return [
          { name: "R1", x: 76.5, y: 338, signals: [] },
          { name: "R2", x: 86, y: 338, signals: [] },
          { name: "R3", x: 95.75, y: 338, signals: [] },
          { name: "R4", x: 105.25, y: 338, signals: [] },
          { name: "C1", x: 115, y: 338, signals: [] },
          { name: "C2", x: 124.5, y: 338, signals: [] },
          { name: "C3", x: 134, y: 338, signals: [] }
        ];
      default:
        return [
          { name: "R1", x: 100, y: 338, signals: [] },
          { name: "R2", x: 110, y: 338, signals: [] },
          { name: "R3", x: 119.5, y: 338, signals: [] },
          { name: "R4", x: 129, y: 338, signals: [] },
          { name: "C1", x: 138.5, y: 338, signals: [] },
          { name: "C2", x: 148, y: 338, signals: [] },
          { name: "C3", x: 157.75, y: 338, signals: [] },
          { name: "C4", x: 167.5, y: 338, signals: [] }
        ];
    }
  }
  update(t) {
    t.has("columns") && this.dispatchEvent(new CustomEvent("pininfo-change")), super.update(t);
  }
  renderKey(t, e) {
    const i = this.keys[t * this.columns + e] ?? "", n = Gt(i) ? "blue-key" : "red-key", s = i.toUpperCase();
    return p`<g
      transform="translate(${qt[e]} ${Mt[t]}) rotate(${this.rotationTransform})"
      tabindex="0"
      class=${n}
      data-key-name=${s}
      @blur=${(r) => {
      this.up(i, r.currentTarget);
    }}
      @mousedown=${() => this.down(i)}
      @mouseup=${() => this.up(i)}
      // @touchstart=${() => this.down(i)}
      // @touchend=${() => this.up(i)}
      @keydown=${(r) => Z.includes(r.key) && this.down(i, r.currentTarget)}
      @keyup=${(r) => Z.includes(r.key) && this.up(i, r.currentTarget)}
    >
      <use xlink:href="#key" />
      <text x="5.6" y="8.1">${i}</text>
    </g>`;
  }
  render() {
    const { connector: t } = this, e = this.columns === 4, i = 15, n = 2.54, s = e ? 70.336 : 70.336 - i, r = e ? n * 8 : n * 7, a = 76 + (t ? 15 : 0);
    return v`
      <style>
        text {
          fill: #dfe2e5;
          user-select: none;
        }

        g[tabindex] {
          cursor: pointer;
        }

        g[tabindex]:focus,
        g[tabindex]:active {
          stroke: white;
          outline: none;
        }

        .blue-key:focus,
        .red-key:focus {
          filter: url(#shadow);
        }

        .blue-key:active,
        .blue-key.pressed {
          fill: #4e50d7;
        }

        .red-key:active,
        .red-key.pressed {
          fill: #ab040b;
        }

        g[tabindex]:focus text {
          stroke: none;
        }

        g[tabindex]:active text,
        .blue-key.pressed text,
        .red-key.pressed text {
          fill: white;
          stroke: none;
        }
      </style>

      <svg
        width="${s}mm"
        height="${a}mm"
        version="1.1"
        viewBox="0 0 ${s} ${a}"
        font-family="sans-serif"
        font-size="8.2px"
        text-anchor="middle"
        xmlns="http://www.w3.org/2000/svg"
        @keydown=${(l) => this.keyStrokeDown(l.key)}
        @keyup=${(l) => this.keyStrokeUp(l.key)}
      >
        <defs>
          <rect
            id="key"
            width="11.2"
            height="11"
            rx="1.4"
            ry="1.4"
            stroke="#b1b5b9"
            stroke-width=".75"
          />
          <pattern
            id="wires"
            width="2.54"
            height="8"
            patternUnits="userSpaceOnUse"
          >
            <rect width="2.54" height="8" fill="#eee" />
            <rect x="0.77" width="1" height="6" fill="#d9d5bc" />
            <circle cx="1.27" cy="6" r="0.75" fill="#d9d5bc" />
            <rect x="0.52" y="6" width="1.5" height="2" fill="#d9d5bc" />
          </pattern>
          <pattern
            id="wires-marks"
            width="2.54"
            height="8"
            patternUnits="userSpaceOnUse"
          >
            <rect x="0.52" y="6" width="1.5" height="2" fill="#746d41" />
          </pattern>
          ${st}
          <filter id="shadow">
            <feDropShadow
              dx="0"
              dy="0"
              stdDeviation="0.5"
              flood-color="#ffff99"
            />
          </filter>
        </defs>

        <!-- Keypad outline -->
        <rect
          x="0"
          y="0"
          width="${s}"
          height="76"
          rx="5"
          ry="5"
          fill="#454449"
        />
        <rect
          x="2.78"
          y="3.25"
          width="${e ? 65 : 65 - i}"
          height="68.6"
          rx="3.5"
          ry="3.5"
          fill="none"
          stroke="#b1b5b9"
          stroke-width="1"
        />

        <!-- Connector -->
        ${t ? p`
            <g transform="translate(${(s - r) / 2}, 76)">
              <rect width="${r}" height="8" fill="url(#wires)" />
              <rect width="10.16" height="8" fill="url(#wires-marks)" />
              <rect y="8" width="${r}" height="7" fill="#333" />
              <rect transform="translate(0, 12)" width="${r}" height="2.54" fill="url(#pins-female)" />
            </g>
          ` : null}

        <!-- Blue keys -->
        <g fill="#4e90d7">
          <g>${this.renderKey(0, 0)}</g>
          <g>${this.renderKey(0, 1)}</g>
          <g>${this.renderKey(0, 2)}</g>
          <g>${this.renderKey(1, 0)}</g>
          <g>${this.renderKey(1, 1)}</g>
          <g>${this.renderKey(1, 2)}</g>
          <g>${this.renderKey(2, 0)}</g>
          <g>${this.renderKey(2, 1)}</g>
          <g>${this.renderKey(2, 2)}</g>
          <g>${this.renderKey(3, 1)}</g>
        </g>

        <!-- Red keys -->
        <g fill="#e94541">
          <g>${this.renderKey(3, 0)}</g>
          <g>${this.renderKey(3, 2)}</g>
          ${e && p`
              <g>${this.renderKey(0, 3)}</g>
              <g>${this.renderKey(1, 3)}</g>
              <g>${this.renderKey(2, 3)}</g>
              <g>${this.renderKey(3, 3)}</g>
          `}
        </g>
      </svg>
    `;
  }
  keyIndex(t) {
    const e = this.keys.indexOf(t);
    return { row: Math.floor(e / 4), column: e % 4 };
  }
  down(t, e) {
    this.pressedKeys.has(t) || (e && e.classList.add("pressed"), this.pressedKeys.add(t), this.dispatchEvent(
      new CustomEvent("button-press", {
        detail: { key: t, ...this.keyIndex(t) }
      })
    ));
  }
  up(t, e) {
    this.pressedKeys.has(t) && (e && e.classList.remove("pressed"), this.pressedKeys.delete(t), this.dispatchEvent(
      new CustomEvent("button-release", {
        detail: { key: t, ...this.keyIndex(t) }
      })
    ));
  }
  keyStrokeDown(t) {
    var n;
    const e = t.toUpperCase(), i = (n = this.shadowRoot) == null ? void 0 : n.querySelector(
      `[data-key-name="${e}"]`
    );
    i && this.down(e, i);
  }
  keyStrokeUp(t) {
    var s, r;
    const e = t.toUpperCase(), i = (s = this.shadowRoot) == null ? void 0 : s.querySelector(
      `[data-key-name="${e}"]`
    ), n = (r = this.shadowRoot) == null ? void 0 : r.querySelectorAll(".pressed");
    t === "Shift" && (n == null || n.forEach((a) => {
      const l = a.dataset.keyName;
      l && this.up(l, a);
    })), i && this.up(e, i);
  }
};
f0([
  o()
], V.prototype, "columns", 2);
f0([
  o()
], V.prototype, "connector", 2);
f0([
  o({ type: Array })
], V.prototype, "keys", 2);
f0([
  o()
], V.prototype, "rotationTransform", 2);
V = f0([
  k("membrane-keypad-component")
], V);
const ue = b({
  tagName: "membrane-keypad-component",
  elementClass: V,
  react: $
  // events: {
  //   onactivate: 'activate',
  //   onchange: 'change',
  // },
});
var Ft = Object.defineProperty, Ht = Object.getOwnPropertyDescriptor, v0 = (t, e, i, n) => {
  for (var s = n > 1 ? void 0 : n ? Ht(e, i) : e, r = t.length - 1, a; r >= 0; r--)
    (a = t[r]) && (s = (n ? a(e, i, s) : a(s)) || s);
  return n && s && Ft(e, i, s), s;
};
let c0 = class extends m {
  constructor() {
    super(...arguments), this.pinInfo = Array(), this.pinColor = "red", this.pinInfoChangeCallback = () => {
      this.requestUpdate();
    };
  }
  get slotChild() {
    var t;
    return console.log(this.elementSlot), (t = this.elementSlot) == null ? void 0 : t.assignedElements()[0];
  }
  static get styles() {
    return w`
      .pin-target:hover {
        fill: #4af;
        r: 4px;
      }
    `;
  }
  handleSlotChange() {
    var e;
    const t = this.slotChild;
    console.log(t), t !== this.previousSlotChild && ((e = this.previousSlotChild) == null || e.removeEventListener(
      "pininfo-change",
      this.pinInfoChangeCallback
    ), t == null || t.addEventListener("pininfo-change", this.pinInfoChangeCallback), this.previousSlotChild = t), this.requestUpdate();
  }
  render() {
    var i;
    console.log("RENDER PINS");
    const t = ((i = this.slotChild) == null ? void 0 : i.pinInfo) ?? [], { pinColor: e } = this;
    return v` <div style="position: relative">
      <slot id="content" @slotchange=${() => this.handleSlotChange()}></slot>

      <svg
        style="position: absolute; top: 0; left: 0"
        width="100%"
        height="100%"
        fill=${e}
      >
        ${t.map((n) => p`<circle class="pin-target" cx=${n.x} cy=${n.y} r=2><title>${n.name}</title></circle>`)}
      </svg>
    </div>`;
  }
};
v0([
  o()
], c0.prototype, "pinInfo", 2);
v0([
  o()
], c0.prototype, "pinColor", 2);
v0([
  it("#content")
], c0.prototype, "elementSlot", 2);
c0 = v0([
  k("render-pins")
], c0);
var Vt = Object.defineProperty, Xt = Object.getOwnPropertyDescriptor, y0 = (t, e, i, n) => {
  for (var s = n > 1 ? void 0 : n ? Xt(e, i) : e, r = t.length - 1, a; r >= 0; r--)
    (a = t[r]) && (s = (n ? a(e, i, s) : a(s)) || s);
  return n && s && Vt(e, i, s), s;
};
const A0 = {
  [-2]: "#C3C7C0",
  // Silver
  [-1]: "#F1D863",
  // Gold
  0: "#000000",
  // Black
  1: "#8F4814",
  // Brown
  2: "#FB0000",
  // Red
  3: "#FC9700",
  // Orange
  4: "#FCF800",
  // Yellow
  5: "#00B800",
  // Green
  6: "#0000FF",
  // Blue
  7: "#A803D6",
  // Violet
  8: "#808080",
  // Gray
  9: "#FCFCFC"
  // White
};
let X = class extends m {
  constructor() {
    super(...arguments), this.value = "1000", this.rotationTransform = 0, this.isActive = !1, this.isDragged = !1, this.pinInfo = [
      { name: "r1", x: 2, y: 6, signals: [] },
      { name: "r2", x: 48, y: 6, signals: [] }
    ];
  }
  get rotatedPinInfo() {
    return this.pinInfo.map(
      (t) => A(t, this.rotationTransform)
    );
  }
  static get styles() {
    return [S, w``];
  }
  breakValue(t) {
    const e = t >= 1e10 ? 9 : t >= 1e9 ? 8 : t >= 1e8 ? 7 : t >= 1e7 ? 6 : t >= 1e6 ? 5 : t >= 1e5 ? 4 : t >= 1e4 ? 3 : t >= 1e3 ? 2 : t >= 100 ? 1 : t >= 10 ? 0 : t >= 1 ? -1 : -2, i = Math.round(t / 10 ** e);
    return t === 0 ? [0, 0] : [Math.round(i % 100), e];
  }
  _onPinClick(t) {
    this.dispatchEvent(
      new CustomEvent("pin-clicked", {
        detail: {
          data: t.target.dataset.value,
          id: t.target.id,
          clientX: t.clientX,
          clientY: t.clientY
        }
      })
    );
  }
  update(t) {
    super.update(t), t.has("flip") && this.dispatchEvent(
      new CustomEvent("pininfo-change", { detail: this.pinInfo })
    ), t.has("rotationTransform") && this.dispatchEvent(
      new CustomEvent("pininfo-change", { detail: this.rotatedPinInfo })
    );
  }
  render() {
    const { value: t } = this, e = parseFloat(t), [i, n] = this.breakValue(e), s = A0[Math.floor(i / 10)], r = A0[i % 10], a = A0[n];
    return v`
      <svg
        viewBox="-3 0 58 12"
        width="58px"
        height="12px"
        class="${this.isActive && !this.isDragged ? "active" : ""} component-svg"
      >
        <g transform="scale(1)">
          <defs>
            <linearGradient
              id="a"
              x2="0"
              y1="22.332"
              y2="38.348"
              gradientTransform="matrix(.14479 0 0 .14479 -23.155 -4.0573)"
              gradientUnits="userSpaceOnUse"
              spreadMethod="reflect"
            >
              <stop stop-color="#323232" offset="0"></stop>
              <stop stop-color="#fff" stop-opacity=".42268" offset="1"></stop>
            </linearGradient>
          </defs>
          <rect
            y="4.79"
            width="46.228"
            height="1.896"
            fill="#aaa"
            x="1.826"
            style=""
            transform="matrix(1, 0, 0, 1, 1.7763568394002505e-15, 0)"
          ></rect>
          <g
            stroke-width=".14479"
            fill="#d5b597"
            transform="matrix(2.971329927444458, 0, 0, 2.971329927444458, 1.8266659975051898, 1.2965840101242065)"
            style=""
          >
            <path
              id="body"
              d="m4.6918 0c-1.0586 0-1.9185 0.67468-1.9185 1.5022 0 0.82756 0.85995 1.4978 1.9185 1.4978 0.4241 0 0.81356-0.11167 1.1312-0.29411h4.0949c0.31802 0.18313 0.71075 0.29411 1.1357 0.29411 1.0586 0 1.9185-0.67015 1.9185-1.4978 0-0.8276-0.85995-1.5022-1.9185-1.5022-0.42499 0-0.81773 0.11098-1.1357 0.29411h-4.0949c-0.31765-0.18244-0.7071-0.29411-1.1312-0.29411z"
            ></path>
            <path
              d="m4.6918 0c-1.0586 0-1.9185 0.67468-1.9185 1.5022 0 0.82756 0.85995 1.4978 1.9185 1.4978 0.4241 0 0.81356-0.11167 1.1312-0.29411h4.0949c0.31802 0.18313 0.71075 0.29411 1.1357 0.29411 1.0586 0 1.9185-0.67015 1.9185-1.4978 0-0.8276-0.85995-1.5022-1.9185-1.5022-0.42499 0-0.81773 0.11098-1.1357 0.29411h-4.0949c-0.31765-0.18244-0.7071-0.29411-1.1312-0.29411z"
              fill="url(#a)"
              opacity=".44886"
            ></path>
            <rect
              x="4"
              y="0"
              width="1"
              height="3"
              fill="${s}"
              clip-path="url(#g)"
            ></rect>
            <path
              d="m6 0.29411v2.4117h0.96v-2.4117z"
              fill="${r}"
            ></path>
            <path
              d="m7.8 0.29411v2.4117h0.96v-2.4117z"
              fill="${a}"
            ></path>
            <rect
              x="10.69"
              y="0"
              width="1"
              height="3"
              fill="#F1D863"
              clip-path="url(#g)"
            ></rect>
            <clipPath id="g">
              <path
                d="m4.6918 0c-1.0586 0-1.9185 0.67468-1.9185 1.5022 0 0.82756 0.85995 1.4978 1.9185 1.4978 0.4241 0 0.81356-0.11167 1.1312-0.29411h4.0949c0.31802 0.18313 0.71075 0.29411 1.1357 0.29411 1.0586 0 1.9185-0.67015 1.9185-1.4978 0-0.8276-0.85995-1.5022-1.9185-1.5022-0.42499 0-0.81773 0.11098-1.1357 0.29411h-4.0949c-0.31765-0.18244-0.7071-0.29411-1.1312-0.29411z"
              ></path>
            </clipPath>
          </g>
        </g>
        <g class="pin-group">
          ${this.pinInfo.map((l) => p`<circle id="${"pt-" + this.id + "-" + l.name}" @click=${this._onPinClick} data-value="${JSON.stringify(l)}" class="pin-target" r="2px" cx=${l.x} cy=${l.y} ><title>${l.name}</title></circle>`)}
        </g>
      </svg>
    `;
  }
};
y0([
  o()
], X.prototype, "value", 2);
y0([
  o()
], X.prototype, "rotationTransform", 2);
y0([
  o({ type: Boolean })
], X.prototype, "isActive", 2);
y0([
  o({ type: Boolean })
], X.prototype, "isDragged", 2);
X = y0([
  k("inventr-resistor")
], X);
const we = b({
  tagName: "inventr-resistor",
  elementClass: X,
  react: $,
  events: {
    onPininfoChange: "pininfo-change",
    onPinClicked: "pin-clicked"
  }
});
var Kt = Object.defineProperty, Wt = Object.getOwnPropertyDescriptor, z = (t, e, i, n) => {
  for (var s = n > 1 ? void 0 : n ? Wt(e, i) : e, r = t.length - 1, a; r >= 0; r--)
    (a = t[r]) && (s = (n ? a(e, i, s) : a(s)) || s);
  return n && s && Kt(e, i, s), s;
};
const Yt = {
  red: "#ff8080",
  green: "#80ff80",
  blue: "#8080ff",
  yellow: "#ffff80",
  orange: "#ffcf80",
  white: "#ffffff",
  purple: "#ff80ff"
};
let _ = class extends m {
  constructor() {
    super(...arguments), this.isActive = !1, this.value = !1, this.brightness = 1, this.color = "red", this.lightColor = null, this.label = "", this.rotationTransform = 0, this.flip = !1, this.isDragged = !1;
  }
  get pinInfo() {
    const t = this.flip ? 4 : 15, e = this.flip ? 15 : 4;
    return [
      { name: "A", x: t, y: 36, signals: [], description: "Anode" },
      { name: "C", x: e, y: 36, signals: [], description: "Cathode" }
    ];
  }
  get rotatedPinInfo() {
    return this.pinInfo.map(
      (t) => A(t, this.rotationTransform)
    );
  }
  // connectedCallback (){
  //   super.connectedCallback()
  //   console.log("Custom element added to page.");
  //   if(this.pinARef.x) console.log(this.pinARef.x.value, this.pinARef.y.value);
  //   if(this.pinCRef.x) console.log(this.pinCRef.x.value, this.pinCRef.y.value);
  // };
  static get styles() {
    return [
      S,
      w`
        :host {
          display: inline-block;
        }

        .led-container {
          display: flex;
          flex-direction: column;
          width: 25px;
        }

        .led-label {
          font-size: 10px;
          text-align: center;
          color: gray;
          position: relative;
          line-height: 1;
          top: -8px;
        }
      `
    ];
  }
  //this is triggering when changed properties includes flip prop.
  update(t) {
    t.has("flip") && this.dispatchEvent(
      new CustomEvent("pininfo-change", { detail: this.pinInfo })
    ), t.has("rotationTransform") && this.dispatchEvent(
      new CustomEvent("pininfo-change", { detail: this.rotatedPinInfo })
    ), super.update(t);
  }
  _onPinClick(t) {
    this.dispatchEvent(
      new CustomEvent("pin-clicked", {
        detail: {
          data: t.target.dataset.value,
          id: t.target.id,
          clientX: t.clientX,
          clientY: t.clientY
        }
      })
    );
  }
  render() {
    const { color: t, lightColor: e, flip: i } = this, n = e || Yt[t == null ? void 0 : t.toLowerCase()] || t, s = this.brightness ? 0.3 + this.brightness * 0.7 : 0, r = this.value && this.brightness > Number.EPSILON, a = i ? -1.2 : 1.2;
    return v`
        <svg class="${this.isActive && !this.isDragged ? "active" : ""} component-svg"
          width="25px"
          height="44px"
          viewBox="-4 -5 25 44"
        >
          <g transform="scale(${a} 1.2) translate(${i ? -15 : 0} 0)">
            <filter id="light1" x="-0.8" y="-0.8" height="2.2" width="2.8">
              <feGaussianBlur stdDeviation="2" />
            </filter>
            <filter id="light2" x="-0.8" y="-0.8" height="2.2" width="2.8">
              <feGaussianBlur stdDeviation="4" />
            </filter>

            <!--LED pins-->
            <rect
              x="2.5099"
              y="20.382"
              width="2.1514"
              height="9.8273"
              fill="#8c8c8c"
            />
            <path
              d="m12.977 30.269c0-1.1736-0.86844-2.5132-1.8916-3.4024-0.41616-0.3672-1.1995-1.0015-1.1995-1.4249v-5.4706h-2.1614v5.7802c0 1.0584 0.94752 1.8785 1.9462 2.7482 0.44424 0.37584 1.3486 1.2496 1.3486 1.7694"
              fill="#8c8c8c"
            />
            <path
              d="m14.173 13.001v-5.9126c0-3.9132-3.168-7.0884-7.0855-7.0884-3.9125 0-7.0877 3.1694-7.0877 7.0884v13.649c1.4738 1.651 4.0968 2.7526 7.0877 2.7526 4.6195 0 8.3686-2.6179 8.3686-5.8594v-1.5235c-7.4e-4 -1.1426-0.47444-2.2039-1.283-3.1061z"
              opacity=".3"
            />
            <path
              d="m14.173 13.001v-5.9126c0-3.9132-3.168-7.0884-7.0855-7.0884-3.9125 0-7.0877 3.1694-7.0877 7.0884v13.649c1.4738 1.651 4.0968 2.7526 7.0877 2.7526 4.6195 0 8.3686-2.6179 8.3686-5.8594v-1.5235c-7.4e-4 -1.1426-0.47444-2.2039-1.283-3.1061z"
              fill="#e6e6e6"
              opacity=".5"
            />
            <path
              d="m14.173 13.001v3.1054c0 2.7389-3.1658 4.9651-7.0855 4.9651-3.9125 2e-5 -7.0877-2.219-7.0877-4.9651v4.6296c1.4738 1.6517 4.0968 2.7526 7.0877 2.7526 4.6195 0 8.3686-2.6179 8.3686-5.8586l-4e-5 -1.5235c-7e-4 -1.1419-0.4744-2.2032-1.283-3.1054z"
              fill="#d1d1d1"
              opacity=".9"
            />
            <g>
              <path
                d="m14.173 13.001v3.1054c0 2.7389-3.1658 4.9651-7.0855 4.9651-3.9125 2e-5 -7.0877-2.219-7.0877-4.9651v4.6296c1.4738 1.6517 4.0968 2.7526 7.0877 2.7526 4.6195 0 8.3686-2.6179 8.3686-5.8586l-4e-5 -1.5235c-7e-4 -1.1419-0.4744-2.2032-1.283-3.1054z"
                opacity=".7"
              />
              <path
                d="m14.173 13.001v3.1054c0 2.7389-3.1658 4.9651-7.0855 4.9651-3.9125 2e-5 -7.0877-2.219-7.0877-4.9651v3.1054c1.4738 1.6502 4.0968 2.7526 7.0877 2.7526 4.6195 0 8.3686-2.6179 8.3686-5.8586-7.4e-4 -1.1412-0.47444-2.2025-1.283-3.1047z"
                opacity=".25"
              />
              <ellipse
                cx="7.0877"
                cy="16.106"
                rx="7.087"
                ry="4.9608"
                opacity=".25"
              />
            </g>
            <polygon
              points="2.2032 16.107 3.1961 16.107 3.1961 13.095 6.0156 13.095 10.012 8.8049 3.407 8.8049 2.2032 9.648"
              fill="#666666"
            />
            <polygon
              points="11.215 9.0338 7.4117 13.095 11.06 13.095 11.06 16.107 11.974 16.107 11.974 8.5241 10.778 8.5241"
              fill="#666666"
            />
            <path
              d="m14.173 13.001v-5.9126c0-3.9132-3.168-7.0884-7.0855-7.0884-3.9125 0-7.0877 3.1694-7.0877 7.0884v13.649c1.4738 1.651 4.0968 2.7526 7.0877 2.7526 4.6195 0 8.3686-2.6179 8.3686-5.8594v-1.5235c-7.4e-4 -1.1426-0.47444-2.2039-1.283-3.1061z"
              fill="${t}"
              opacity=".65"
            />
            <g fill="#ffffff">
              <path
                d="m10.388 3.7541 1.4364-0.2736c-0.84168-1.1318-2.0822-1.9577-3.5417-2.2385l0.25416 1.0807c0.76388 0.27072 1.4068 0.78048 1.8511 1.4314z"
                opacity=".5"
              />
              <path
                d="m0.76824 19.926v1.5199c0.64872 0.5292 1.4335 0.97632 2.3076 1.3169v-1.525c-0.8784-0.33624-1.6567-0.78194-2.3076-1.3118z"
                opacity=".5"
              />
              <path
                d="m11.073 20.21c-0.2556 0.1224-0.52992 0.22968-0.80568 0.32976-0.05832 0.01944-0.11736 0.04032-0.17784 0.05832-0.56376 0.17928-1.1614 0.31896-1.795 0.39456-0.07488 0.0094-0.1512 0.01872-0.22464 0.01944-0.3204 0.03024-0.64368 0.05832-0.97056 0.05832-0.14832 0-0.30744-0.01512-0.4716-0.02376-1.2002-0.05688-2.3306-0.31464-3.2976-0.73944l-2e-5 -8.3895v-4.8254c0-1.471 0.84816-2.7295 2.0736-3.3494l-0.02232-0.05328-1.2478-1.512c-1.6697 1.003-2.79 2.8224-2.79 4.9118v11.905c-0.04968-0.04968-0.30816-0.30888-0.48024-0.52992l-0.30744 0.6876c1.4011 1.4818 3.8088 2.4617 6.5426 2.4617 1.6798 0 3.2371-0.37368 4.5115-1.0022l-0.52704-0.40896-0.01006 0.0072z"
                opacity=".5"
              />
            </g>
            <g class="light" style="display: ${r ? "" : "none"}">
              <ellipse
                cx="8"
                cy="10"
                rx="10"
                ry="10"
                fill="${n}"
                filter="url(#light2)"
                style="opacity: ${s}"
              ></ellipse>
              <ellipse
                cx="8"
                cy="10"
                rx="2"
                ry="2"
                fill="white"
                filter="url(#light1)"
              ></ellipse>
              <ellipse
                cx="8"
                cy="10"
                rx="3"
                ry="3"
                fill="white"
                filter="url(#light1)"
                style="opacity: ${s}"
              ></ellipse>
            </g>
          </g>
          <g class="pin-group">
            ${this.pinInfo.map((l) => p`
                    <circle @click=${this._onPinClick} 
                    id="${"pt-" + this.id + "-" + l.name}" 
                    data-value="${JSON.stringify(l)}" 
                    class="pin-target" 
                    r="2px" 
                    cx=${l.x} 
                    cy=${l.y} ><title>${l.name}</title></circle>`)}
          </g>
        </svg>
        <span class="led-label">${this.label}</span>
    `;
  }
};
z([
  o({ type: Boolean })
], _.prototype, "isActive", 2);
z([
  o({ type: Boolean })
], _.prototype, "value", 2);
z([
  o()
], _.prototype, "brightness", 2);
z([
  o()
], _.prototype, "color", 2);
z([
  o()
], _.prototype, "lightColor", 2);
z([
  o()
], _.prototype, "label", 2);
z([
  o()
], _.prototype, "rotationTransform", 2);
z([
  o({ type: Boolean })
], _.prototype, "flip", 2);
z([
  o({ type: Boolean })
], _.prototype, "isDragged", 2);
_ = z([
  k("led-component")
], _);
const ve = b({
  tagName: "led-component",
  elementClass: _,
  react: $,
  events: {
    onPininfoChange: "pininfo-change",
    onPinClicked: "pin-clicked"
  }
}), F0 = 9.5, Jt = 2.08;
function* Zt(t, e) {
  let i = 28.9;
  for (let n = 0; n < 25; n++)
    yield H0(t, `${t.namePreface}.${n + 1}`, i), yield H0(e, `${e.namePreface}.${n + 1}`, i), i += (n + 1) % 5 === 0 ? Jt * F0 : F0;
}
function H0(t, e, i) {
  return {
    ...t,
    name: e,
    x: i
  };
}
function V0(t, e) {
  return Array.from(Zt(t, e));
}
const Qt = [
  {
    name: "1t.a",
    x: 26,
    y: 51,
    signals: []
  },
  {
    name: "2t.a",
    x: 35.600000000114,
    y: 51,
    signals: []
  },
  {
    name: "3t.a",
    x: 45.200000000228,
    y: 51,
    signals: []
  },
  {
    name: "4t.a",
    x: 54.800000000341996,
    y: 51,
    signals: []
  },
  {
    name: "5t.a",
    x: 64.400000000456,
    y: 51,
    signals: []
  },
  {
    name: "6t.a",
    x: 74.00000000057,
    y: 51,
    signals: []
  },
  {
    name: "7t.a",
    x: 83.60000000068399,
    y: 51,
    signals: []
  },
  {
    name: "8t.a",
    x: 93.200000000798,
    y: 51,
    signals: []
  },
  {
    name: "9t.a",
    x: 102.800000000912,
    y: 51,
    signals: []
  },
  {
    name: "10t.a",
    x: 112.40000000102599,
    y: 51,
    signals: []
  },
  {
    name: "11t.a",
    x: 122.00000000114,
    y: 51,
    signals: []
  },
  {
    name: "12t.a",
    x: 131.600000001254,
    y: 51,
    signals: []
  },
  {
    name: "13t.a",
    x: 141.20000000136798,
    y: 51,
    signals: []
  },
  {
    name: "14t.a",
    x: 150.80000000148198,
    y: 51,
    signals: []
  },
  {
    name: "15t.a",
    x: 160.400000001596,
    y: 51,
    signals: []
  },
  {
    name: "16t.a",
    x: 170.00000000171,
    y: 51,
    signals: []
  },
  {
    name: "17t.a",
    x: 179.600000001824,
    y: 51,
    signals: []
  },
  {
    name: "18t.a",
    x: 189.20000000193798,
    y: 51,
    signals: []
  },
  {
    name: "19t.a",
    x: 198.80000000205197,
    y: 51,
    signals: []
  },
  {
    name: "20t.a",
    x: 208.400000002166,
    y: 51,
    signals: []
  },
  {
    name: "21t.a",
    x: 218.00000000228,
    y: 51,
    signals: []
  },
  {
    name: "22t.a",
    x: 227.60000000239398,
    y: 51,
    signals: []
  },
  {
    name: "23t.a",
    x: 237.20000000250798,
    y: 51,
    signals: []
  },
  {
    name: "24t.a",
    x: 246.80000000262197,
    y: 51,
    signals: []
  },
  {
    name: "25t.a",
    x: 256.40000000273596,
    y: 51,
    signals: []
  },
  {
    name: "26t.a",
    x: 266.00000000285,
    y: 51,
    signals: []
  },
  {
    name: "27t.a",
    x: 275.60000000296395,
    y: 51,
    signals: []
  },
  {
    name: "28t.a",
    x: 285.200000003078,
    y: 51,
    signals: []
  },
  {
    name: "29t.a",
    x: 294.800000003192,
    y: 51,
    signals: []
  },
  {
    name: "30t.a",
    x: 304.400000003306,
    y: 51,
    signals: []
  },
  {
    name: "1t.b",
    x: 26,
    y: 60.600000000114,
    signals: []
  },
  {
    name: "2t.b",
    x: 35.600000000114,
    y: 60.600000000114,
    signals: []
  },
  {
    name: "3t.b",
    x: 45.200000000228,
    y: 60.600000000114,
    signals: []
  },
  {
    name: "4t.b",
    x: 54.800000000341996,
    y: 60.600000000114,
    signals: []
  },
  {
    name: "5t.b",
    x: 64.400000000456,
    y: 60.600000000114,
    signals: []
  },
  {
    name: "6t.b",
    x: 74.00000000057,
    y: 60.600000000114,
    signals: []
  },
  {
    name: "7t.b",
    x: 83.60000000068399,
    y: 60.600000000114,
    signals: []
  },
  {
    name: "8t.b",
    x: 93.200000000798,
    y: 60.600000000114,
    signals: []
  },
  {
    name: "9t.b",
    x: 102.800000000912,
    y: 60.600000000114,
    signals: []
  },
  {
    name: "10t.b",
    x: 112.40000000102599,
    y: 60.600000000114,
    signals: []
  },
  {
    name: "11t.b",
    x: 122.00000000114,
    y: 60.600000000114,
    signals: []
  },
  {
    name: "12t.b",
    x: 131.600000001254,
    y: 60.600000000114,
    signals: []
  },
  {
    name: "13t.b",
    x: 141.20000000136798,
    y: 60.600000000114,
    signals: []
  },
  {
    name: "14t.b",
    x: 150.80000000148198,
    y: 60.600000000114,
    signals: []
  },
  {
    name: "15t.b",
    x: 160.400000001596,
    y: 60.600000000114,
    signals: []
  },
  {
    name: "16t.b",
    x: 170.00000000171,
    y: 60.600000000114,
    signals: []
  },
  {
    name: "17t.b",
    x: 179.600000001824,
    y: 60.600000000114,
    signals: []
  },
  {
    name: "18t.b",
    x: 189.20000000193798,
    y: 60.600000000114,
    signals: []
  },
  {
    name: "19t.b",
    x: 198.80000000205197,
    y: 60.600000000114,
    signals: []
  },
  {
    name: "20t.b",
    x: 208.400000002166,
    y: 60.600000000114,
    signals: []
  },
  {
    name: "21t.b",
    x: 218.00000000228,
    y: 60.600000000114,
    signals: []
  },
  {
    name: "22t.b",
    x: 227.60000000239398,
    y: 60.600000000114,
    signals: []
  },
  {
    name: "23t.b",
    x: 237.20000000250798,
    y: 60.600000000114,
    signals: []
  },
  {
    name: "24t.b",
    x: 246.80000000262197,
    y: 60.600000000114,
    signals: []
  },
  {
    name: "25t.b",
    x: 256.40000000273596,
    y: 60.600000000114,
    signals: []
  },
  {
    name: "26t.b",
    x: 266.00000000285,
    y: 60.600000000114,
    signals: []
  },
  {
    name: "27t.b",
    x: 275.60000000296395,
    y: 60.600000000114,
    signals: []
  },
  {
    name: "28t.b",
    x: 285.200000003078,
    y: 60.600000000114,
    signals: []
  },
  {
    name: "29t.b",
    x: 294.800000003192,
    y: 60.600000000114,
    signals: []
  },
  {
    name: "30t.b",
    x: 304.400000003306,
    y: 60.600000000114,
    signals: []
  },
  {
    name: "1t.c",
    x: 26,
    y: 70.200000000228,
    signals: []
  },
  {
    name: "2t.c",
    x: 35.600000000114,
    y: 70.200000000228,
    signals: []
  },
  {
    name: "3t.c",
    x: 45.200000000228,
    y: 70.200000000228,
    signals: []
  },
  {
    name: "4t.c",
    x: 54.800000000341996,
    y: 70.200000000228,
    signals: []
  },
  {
    name: "5t.c",
    x: 64.400000000456,
    y: 70.200000000228,
    signals: []
  },
  {
    name: "6t.c",
    x: 74.00000000057,
    y: 70.200000000228,
    signals: []
  },
  {
    name: "7t.c",
    x: 83.60000000068399,
    y: 70.200000000228,
    signals: []
  },
  {
    name: "8t.c",
    x: 93.200000000798,
    y: 70.200000000228,
    signals: []
  },
  {
    name: "9t.c",
    x: 102.800000000912,
    y: 70.200000000228,
    signals: []
  },
  {
    name: "10t.c",
    x: 112.40000000102599,
    y: 70.200000000228,
    signals: []
  },
  {
    name: "11t.c",
    x: 122.00000000114,
    y: 70.200000000228,
    signals: []
  },
  {
    name: "12t.c",
    x: 131.600000001254,
    y: 70.200000000228,
    signals: []
  },
  {
    name: "13t.c",
    x: 141.20000000136798,
    y: 70.200000000228,
    signals: []
  },
  {
    name: "14t.c",
    x: 150.80000000148198,
    y: 70.200000000228,
    signals: []
  },
  {
    name: "15t.c",
    x: 160.400000001596,
    y: 70.200000000228,
    signals: []
  },
  {
    name: "16t.c",
    x: 170.00000000171,
    y: 70.200000000228,
    signals: []
  },
  {
    name: "17t.c",
    x: 179.600000001824,
    y: 70.200000000228,
    signals: []
  },
  {
    name: "18t.c",
    x: 189.20000000193798,
    y: 70.200000000228,
    signals: []
  },
  {
    name: "19t.c",
    x: 198.80000000205197,
    y: 70.200000000228,
    signals: []
  },
  {
    name: "20t.c",
    x: 208.400000002166,
    y: 70.200000000228,
    signals: []
  },
  {
    name: "21t.c",
    x: 218.00000000228,
    y: 70.200000000228,
    signals: []
  },
  {
    name: "22t.c",
    x: 227.60000000239398,
    y: 70.200000000228,
    signals: []
  },
  {
    name: "23t.c",
    x: 237.20000000250798,
    y: 70.200000000228,
    signals: []
  },
  {
    name: "24t.c",
    x: 246.80000000262197,
    y: 70.200000000228,
    signals: []
  },
  {
    name: "25t.c",
    x: 256.40000000273596,
    y: 70.200000000228,
    signals: []
  },
  {
    name: "26t.c",
    x: 266.00000000285,
    y: 70.200000000228,
    signals: []
  },
  {
    name: "27t.c",
    x: 275.60000000296395,
    y: 70.200000000228,
    signals: []
  },
  {
    name: "28t.c",
    x: 285.200000003078,
    y: 70.200000000228,
    signals: []
  },
  {
    name: "29t.c",
    x: 294.800000003192,
    y: 70.200000000228,
    signals: []
  },
  {
    name: "30t.c",
    x: 304.400000003306,
    y: 70.200000000228,
    signals: []
  },
  {
    name: "1t.d",
    x: 26,
    y: 79.800000000342,
    signals: []
  },
  {
    name: "2t.d",
    x: 35.600000000114,
    y: 79.800000000342,
    signals: []
  },
  {
    name: "3t.d",
    x: 45.200000000228,
    y: 79.800000000342,
    signals: []
  },
  {
    name: "4t.d",
    x: 54.800000000341996,
    y: 79.800000000342,
    signals: []
  },
  {
    name: "5t.d",
    x: 64.400000000456,
    y: 79.800000000342,
    signals: []
  },
  {
    name: "6t.d",
    x: 74.00000000057,
    y: 79.800000000342,
    signals: []
  },
  {
    name: "7t.d",
    x: 83.60000000068399,
    y: 79.800000000342,
    signals: []
  },
  {
    name: "8t.d",
    x: 93.200000000798,
    y: 79.800000000342,
    signals: []
  },
  {
    name: "9t.d",
    x: 102.800000000912,
    y: 79.800000000342,
    signals: []
  },
  {
    name: "10t.d",
    x: 112.40000000102599,
    y: 79.800000000342,
    signals: []
  },
  {
    name: "11t.d",
    x: 122.00000000114,
    y: 79.800000000342,
    signals: []
  },
  {
    name: "12t.d",
    x: 131.600000001254,
    y: 79.800000000342,
    signals: []
  },
  {
    name: "13t.d",
    x: 141.20000000136798,
    y: 79.800000000342,
    signals: []
  },
  {
    name: "14t.d",
    x: 150.80000000148198,
    y: 79.800000000342,
    signals: []
  },
  {
    name: "15t.d",
    x: 160.400000001596,
    y: 79.800000000342,
    signals: []
  },
  {
    name: "16t.d",
    x: 170.00000000171,
    y: 79.800000000342,
    signals: []
  },
  {
    name: "17t.d",
    x: 179.600000001824,
    y: 79.800000000342,
    signals: []
  },
  {
    name: "18t.d",
    x: 189.20000000193798,
    y: 79.800000000342,
    signals: []
  },
  {
    name: "19t.d",
    x: 198.80000000205197,
    y: 79.800000000342,
    signals: []
  },
  {
    name: "20t.d",
    x: 208.400000002166,
    y: 79.800000000342,
    signals: []
  },
  {
    name: "21t.d",
    x: 218.00000000228,
    y: 79.800000000342,
    signals: []
  },
  {
    name: "22t.d",
    x: 227.60000000239398,
    y: 79.800000000342,
    signals: []
  },
  {
    name: "23t.d",
    x: 237.20000000250798,
    y: 79.800000000342,
    signals: []
  },
  {
    name: "24t.d",
    x: 246.80000000262197,
    y: 79.800000000342,
    signals: []
  },
  {
    name: "25t.d",
    x: 256.40000000273596,
    y: 79.800000000342,
    signals: []
  },
  {
    name: "26t.d",
    x: 266.00000000285,
    y: 79.800000000342,
    signals: []
  },
  {
    name: "27t.d",
    x: 275.60000000296395,
    y: 79.800000000342,
    signals: []
  },
  {
    name: "28t.d",
    x: 285.200000003078,
    y: 79.800000000342,
    signals: []
  },
  {
    name: "29t.d",
    x: 294.800000003192,
    y: 79.800000000342,
    signals: []
  },
  {
    name: "30t.d",
    x: 304.400000003306,
    y: 79.800000000342,
    signals: []
  },
  {
    name: "1t.e",
    x: 26,
    y: 89.400000000456,
    signals: []
  },
  {
    name: "2t.e",
    x: 35.600000000114,
    y: 89.400000000456,
    signals: []
  },
  {
    name: "3t.e",
    x: 45.200000000228,
    y: 89.400000000456,
    signals: []
  },
  {
    name: "4t.e",
    x: 54.800000000341996,
    y: 89.400000000456,
    signals: []
  },
  {
    name: "5t.e",
    x: 64.400000000456,
    y: 89.400000000456,
    signals: []
  },
  {
    name: "6t.e",
    x: 74.00000000057,
    y: 89.400000000456,
    signals: []
  },
  {
    name: "7t.e",
    x: 83.60000000068399,
    y: 89.400000000456,
    signals: []
  },
  {
    name: "8t.e",
    x: 93.200000000798,
    y: 89.400000000456,
    signals: []
  },
  {
    name: "9t.e",
    x: 102.800000000912,
    y: 89.400000000456,
    signals: []
  },
  {
    name: "10t.e",
    x: 112.40000000102599,
    y: 89.400000000456,
    signals: []
  },
  {
    name: "11t.e",
    x: 122.00000000114,
    y: 89.400000000456,
    signals: []
  },
  {
    name: "12t.e",
    x: 131.600000001254,
    y: 89.400000000456,
    signals: []
  },
  {
    name: "13t.e",
    x: 141.20000000136798,
    y: 89.400000000456,
    signals: []
  },
  {
    name: "14t.e",
    x: 150.80000000148198,
    y: 89.400000000456,
    signals: []
  },
  {
    name: "15t.e",
    x: 160.400000001596,
    y: 89.400000000456,
    signals: []
  },
  {
    name: "16t.e",
    x: 170.00000000171,
    y: 89.400000000456,
    signals: []
  },
  {
    name: "17t.e",
    x: 179.600000001824,
    y: 89.400000000456,
    signals: []
  },
  {
    name: "18t.e",
    x: 189.20000000193798,
    y: 89.400000000456,
    signals: []
  },
  {
    name: "19t.e",
    x: 198.80000000205197,
    y: 89.400000000456,
    signals: []
  },
  {
    name: "20t.e",
    x: 208.400000002166,
    y: 89.400000000456,
    signals: []
  },
  {
    name: "21t.e",
    x: 218.00000000228,
    y: 89.400000000456,
    signals: []
  },
  {
    name: "22t.e",
    x: 227.60000000239398,
    y: 89.400000000456,
    signals: []
  },
  {
    name: "23t.e",
    x: 237.20000000250798,
    y: 89.400000000456,
    signals: []
  },
  {
    name: "24t.e",
    x: 246.80000000262197,
    y: 89.400000000456,
    signals: []
  },
  {
    name: "25t.e",
    x: 256.40000000273596,
    y: 89.400000000456,
    signals: []
  },
  {
    name: "26t.e",
    x: 266.00000000285,
    y: 89.400000000456,
    signals: []
  },
  {
    name: "27t.e",
    x: 275.60000000296395,
    y: 89.400000000456,
    signals: []
  },
  {
    name: "28t.e",
    x: 285.200000003078,
    y: 89.400000000456,
    signals: []
  },
  {
    name: "29t.e",
    x: 294.800000003192,
    y: 89.400000000456,
    signals: []
  },
  {
    name: "30t.e",
    x: 304.400000003306,
    y: 89.400000000456,
    signals: []
  },
  {
    name: "1b.f",
    x: 26,
    y: 118.200000000798,
    signals: []
  },
  {
    name: "2b.f",
    x: 35.600000000114,
    y: 118.200000000798,
    signals: []
  },
  {
    name: "3b.f",
    x: 45.200000000228,
    y: 118.200000000798,
    signals: []
  },
  {
    name: "4b.f",
    x: 54.800000000341996,
    y: 118.200000000798,
    signals: []
  },
  {
    name: "5b.f",
    x: 64.400000000456,
    y: 118.200000000798,
    signals: []
  },
  {
    name: "6b.f",
    x: 74.00000000057,
    y: 118.200000000798,
    signals: []
  },
  {
    name: "7b.f",
    x: 83.60000000068399,
    y: 118.200000000798,
    signals: []
  },
  {
    name: "8b.f",
    x: 93.200000000798,
    y: 118.200000000798,
    signals: []
  },
  {
    name: "9b.f",
    x: 102.800000000912,
    y: 118.200000000798,
    signals: []
  },
  {
    name: "10b.f",
    x: 112.40000000102599,
    y: 118.200000000798,
    signals: []
  },
  {
    name: "11b.f",
    x: 122.00000000114,
    y: 118.200000000798,
    signals: []
  },
  {
    name: "12b.f",
    x: 131.600000001254,
    y: 118.200000000798,
    signals: []
  },
  {
    name: "13b.f",
    x: 141.20000000136798,
    y: 118.200000000798,
    signals: []
  },
  {
    name: "14b.f",
    x: 150.80000000148198,
    y: 118.200000000798,
    signals: []
  },
  {
    name: "15b.f",
    x: 160.400000001596,
    y: 118.200000000798,
    signals: []
  },
  {
    name: "16b.f",
    x: 170.00000000171,
    y: 118.200000000798,
    signals: []
  },
  {
    name: "17b.f",
    x: 179.600000001824,
    y: 118.200000000798,
    signals: []
  },
  {
    name: "18b.f",
    x: 189.20000000193798,
    y: 118.200000000798,
    signals: []
  },
  {
    name: "19b.f",
    x: 198.80000000205197,
    y: 118.200000000798,
    signals: []
  },
  {
    name: "20b.f",
    x: 208.400000002166,
    y: 118.200000000798,
    signals: []
  },
  {
    name: "21b.f",
    x: 218.00000000228,
    y: 118.200000000798,
    signals: []
  },
  {
    name: "22b.f",
    x: 227.60000000239398,
    y: 118.200000000798,
    signals: []
  },
  {
    name: "23b.f",
    x: 237.20000000250798,
    y: 118.200000000798,
    signals: []
  },
  {
    name: "24b.f",
    x: 246.80000000262197,
    y: 118.200000000798,
    signals: []
  },
  {
    name: "25b.f",
    x: 256.40000000273596,
    y: 118.200000000798,
    signals: []
  },
  {
    name: "26b.f",
    x: 266.00000000285,
    y: 118.200000000798,
    signals: []
  },
  {
    name: "27b.f",
    x: 275.60000000296395,
    y: 118.200000000798,
    signals: []
  },
  {
    name: "28b.f",
    x: 285.200000003078,
    y: 118.200000000798,
    signals: []
  },
  {
    name: "29b.f",
    x: 294.800000003192,
    y: 118.200000000798,
    signals: []
  },
  {
    name: "30b.f",
    x: 304.400000003306,
    y: 118.200000000798,
    signals: []
  },
  {
    name: "1b.g",
    x: 26,
    y: 127.800000000912,
    signals: []
  },
  {
    name: "2b.g",
    x: 35.600000000114,
    y: 127.800000000912,
    signals: []
  },
  {
    name: "3b.g",
    x: 45.200000000228,
    y: 127.800000000912,
    signals: []
  },
  {
    name: "4b.g",
    x: 54.800000000341996,
    y: 127.800000000912,
    signals: []
  },
  {
    name: "5b.g",
    x: 64.400000000456,
    y: 127.800000000912,
    signals: []
  },
  {
    name: "6b.g",
    x: 74.00000000057,
    y: 127.800000000912,
    signals: []
  },
  {
    name: "7b.g",
    x: 83.60000000068399,
    y: 127.800000000912,
    signals: []
  },
  {
    name: "8b.g",
    x: 93.200000000798,
    y: 127.800000000912,
    signals: []
  },
  {
    name: "9b.g",
    x: 102.800000000912,
    y: 127.800000000912,
    signals: []
  },
  {
    name: "10b.g",
    x: 112.40000000102599,
    y: 127.800000000912,
    signals: []
  },
  {
    name: "11b.g",
    x: 122.00000000114,
    y: 127.800000000912,
    signals: []
  },
  {
    name: "12b.g",
    x: 131.600000001254,
    y: 127.800000000912,
    signals: []
  },
  {
    name: "13b.g",
    x: 141.20000000136798,
    y: 127.800000000912,
    signals: []
  },
  {
    name: "14b.g",
    x: 150.80000000148198,
    y: 127.800000000912,
    signals: []
  },
  {
    name: "15b.g",
    x: 160.400000001596,
    y: 127.800000000912,
    signals: []
  },
  {
    name: "16b.g",
    x: 170.00000000171,
    y: 127.800000000912,
    signals: []
  },
  {
    name: "17b.g",
    x: 179.600000001824,
    y: 127.800000000912,
    signals: []
  },
  {
    name: "18b.g",
    x: 189.20000000193798,
    y: 127.800000000912,
    signals: []
  },
  {
    name: "19b.g",
    x: 198.80000000205197,
    y: 127.800000000912,
    signals: []
  },
  {
    name: "20b.g",
    x: 208.400000002166,
    y: 127.800000000912,
    signals: []
  },
  {
    name: "21b.g",
    x: 218.00000000228,
    y: 127.800000000912,
    signals: []
  },
  {
    name: "22b.g",
    x: 227.60000000239398,
    y: 127.800000000912,
    signals: []
  },
  {
    name: "23b.g",
    x: 237.20000000250798,
    y: 127.800000000912,
    signals: []
  },
  {
    name: "24b.g",
    x: 246.80000000262197,
    y: 127.800000000912,
    signals: []
  },
  {
    name: "25b.g",
    x: 256.40000000273596,
    y: 127.800000000912,
    signals: []
  },
  {
    name: "26b.g",
    x: 266.00000000285,
    y: 127.800000000912,
    signals: []
  },
  {
    name: "27b.g",
    x: 275.60000000296395,
    y: 127.800000000912,
    signals: []
  },
  {
    name: "28b.g",
    x: 285.200000003078,
    y: 127.800000000912,
    signals: []
  },
  {
    name: "29b.g",
    x: 294.800000003192,
    y: 127.800000000912,
    signals: []
  },
  {
    name: "30b.g",
    x: 304.400000003306,
    y: 127.800000000912,
    signals: []
  },
  {
    name: "1b.h",
    x: 26,
    y: 137.400000001026,
    signals: []
  },
  {
    name: "2b.h",
    x: 35.600000000114,
    y: 137.400000001026,
    signals: []
  },
  {
    name: "3b.h",
    x: 45.200000000228,
    y: 137.400000001026,
    signals: []
  },
  {
    name: "4b.h",
    x: 54.800000000341996,
    y: 137.400000001026,
    signals: []
  },
  {
    name: "5b.h",
    x: 64.400000000456,
    y: 137.400000001026,
    signals: []
  },
  {
    name: "6b.h",
    x: 74.00000000057,
    y: 137.400000001026,
    signals: []
  },
  {
    name: "7b.h",
    x: 83.60000000068399,
    y: 137.400000001026,
    signals: []
  },
  {
    name: "8b.h",
    x: 93.200000000798,
    y: 137.400000001026,
    signals: []
  },
  {
    name: "9b.h",
    x: 102.800000000912,
    y: 137.400000001026,
    signals: []
  },
  {
    name: "10b.h",
    x: 112.40000000102599,
    y: 137.400000001026,
    signals: []
  },
  {
    name: "11b.h",
    x: 122.00000000114,
    y: 137.400000001026,
    signals: []
  },
  {
    name: "12b.h",
    x: 131.600000001254,
    y: 137.400000001026,
    signals: []
  },
  {
    name: "13b.h",
    x: 141.20000000136798,
    y: 137.400000001026,
    signals: []
  },
  {
    name: "14b.h",
    x: 150.80000000148198,
    y: 137.400000001026,
    signals: []
  },
  {
    name: "15b.h",
    x: 160.400000001596,
    y: 137.400000001026,
    signals: []
  },
  {
    name: "16b.h",
    x: 170.00000000171,
    y: 137.400000001026,
    signals: []
  },
  {
    name: "17b.h",
    x: 179.600000001824,
    y: 137.400000001026,
    signals: []
  },
  {
    name: "18b.h",
    x: 189.20000000193798,
    y: 137.400000001026,
    signals: []
  },
  {
    name: "19b.h",
    x: 198.80000000205197,
    y: 137.400000001026,
    signals: []
  },
  {
    name: "20b.h",
    x: 208.400000002166,
    y: 137.400000001026,
    signals: []
  },
  {
    name: "21b.h",
    x: 218.00000000228,
    y: 137.400000001026,
    signals: []
  },
  {
    name: "22b.h",
    x: 227.60000000239398,
    y: 137.400000001026,
    signals: []
  },
  {
    name: "23b.h",
    x: 237.20000000250798,
    y: 137.400000001026,
    signals: []
  },
  {
    name: "24b.h",
    x: 246.80000000262197,
    y: 137.400000001026,
    signals: []
  },
  {
    name: "25b.h",
    x: 256.40000000273596,
    y: 137.400000001026,
    signals: []
  },
  {
    name: "26b.h",
    x: 266.00000000285,
    y: 137.400000001026,
    signals: []
  },
  {
    name: "27b.h",
    x: 275.60000000296395,
    y: 137.400000001026,
    signals: []
  },
  {
    name: "28b.h",
    x: 285.200000003078,
    y: 137.400000001026,
    signals: []
  },
  {
    name: "29b.h",
    x: 294.800000003192,
    y: 137.400000001026,
    signals: []
  },
  {
    name: "30b.h",
    x: 304.400000003306,
    y: 137.400000001026,
    signals: []
  },
  {
    name: "1b.i",
    x: 26,
    y: 147.00000000114,
    signals: []
  },
  {
    name: "2b.i",
    x: 35.600000000114,
    y: 147.00000000114,
    signals: []
  },
  {
    name: "3b.i",
    x: 45.200000000228,
    y: 147.00000000114,
    signals: []
  },
  {
    name: "4b.i",
    x: 54.800000000341996,
    y: 147.00000000114,
    signals: []
  },
  {
    name: "5b.i",
    x: 64.400000000456,
    y: 147.00000000114,
    signals: []
  },
  {
    name: "6b.i",
    x: 74.00000000057,
    y: 147.00000000114,
    signals: []
  },
  {
    name: "7b.i",
    x: 83.60000000068399,
    y: 147.00000000114,
    signals: []
  },
  {
    name: "8b.i",
    x: 93.200000000798,
    y: 147.00000000114,
    signals: []
  },
  {
    name: "9b.i",
    x: 102.800000000912,
    y: 147.00000000114,
    signals: []
  },
  {
    name: "10b.i",
    x: 112.40000000102599,
    y: 147.00000000114,
    signals: []
  },
  {
    name: "11b.i",
    x: 122.00000000114,
    y: 147.00000000114,
    signals: []
  },
  {
    name: "12b.i",
    x: 131.600000001254,
    y: 147.00000000114,
    signals: []
  },
  {
    name: "13b.i",
    x: 141.20000000136798,
    y: 147.00000000114,
    signals: []
  },
  {
    name: "14b.i",
    x: 150.80000000148198,
    y: 147.00000000114,
    signals: []
  },
  {
    name: "15b.i",
    x: 160.400000001596,
    y: 147.00000000114,
    signals: []
  },
  {
    name: "16b.i",
    x: 170.00000000171,
    y: 147.00000000114,
    signals: []
  },
  {
    name: "17b.i",
    x: 179.600000001824,
    y: 147.00000000114,
    signals: []
  },
  {
    name: "18b.i",
    x: 189.20000000193798,
    y: 147.00000000114,
    signals: []
  },
  {
    name: "19b.i",
    x: 198.80000000205197,
    y: 147.00000000114,
    signals: []
  },
  {
    name: "20b.i",
    x: 208.400000002166,
    y: 147.00000000114,
    signals: []
  },
  {
    name: "21b.i",
    x: 218.00000000228,
    y: 147.00000000114,
    signals: []
  },
  {
    name: "22b.i",
    x: 227.60000000239398,
    y: 147.00000000114,
    signals: []
  },
  {
    name: "23b.i",
    x: 237.20000000250798,
    y: 147.00000000114,
    signals: []
  },
  {
    name: "24b.i",
    x: 246.80000000262197,
    y: 147.00000000114,
    signals: []
  },
  {
    name: "25b.i",
    x: 256.40000000273596,
    y: 147.00000000114,
    signals: []
  },
  {
    name: "26b.i",
    x: 266.00000000285,
    y: 147.00000000114,
    signals: []
  },
  {
    name: "27b.i",
    x: 275.60000000296395,
    y: 147.00000000114,
    signals: []
  },
  {
    name: "28b.i",
    x: 285.200000003078,
    y: 147.00000000114,
    signals: []
  },
  {
    name: "29b.i",
    x: 294.800000003192,
    y: 147.00000000114,
    signals: []
  },
  {
    name: "30b.i",
    x: 304.400000003306,
    y: 147.00000000114,
    signals: []
  },
  {
    name: "1b.j",
    x: 26,
    y: 156.600000001254,
    signals: []
  },
  {
    name: "2b.j",
    x: 35.600000000114,
    y: 156.600000001254,
    signals: []
  },
  {
    name: "3b.j",
    x: 45.200000000228,
    y: 156.600000001254,
    signals: []
  },
  {
    name: "4b.j",
    x: 54.800000000341996,
    y: 156.600000001254,
    signals: []
  },
  {
    name: "5b.j",
    x: 64.400000000456,
    y: 156.600000001254,
    signals: []
  },
  {
    name: "6b.j",
    x: 74.00000000057,
    y: 156.600000001254,
    signals: []
  },
  {
    name: "7b.j",
    x: 83.60000000068399,
    y: 156.600000001254,
    signals: []
  },
  {
    name: "8b.j",
    x: 93.200000000798,
    y: 156.600000001254,
    signals: []
  },
  {
    name: "9b.j",
    x: 102.800000000912,
    y: 156.600000001254,
    signals: []
  },
  {
    name: "10b.j",
    x: 112.40000000102599,
    y: 156.600000001254,
    signals: []
  },
  {
    name: "11b.j",
    x: 122.00000000114,
    y: 156.600000001254,
    signals: []
  },
  {
    name: "12b.j",
    x: 131.600000001254,
    y: 156.600000001254,
    signals: []
  },
  {
    name: "13b.j",
    x: 141.20000000136798,
    y: 156.600000001254,
    signals: []
  },
  {
    name: "14b.j",
    x: 150.80000000148198,
    y: 156.600000001254,
    signals: []
  },
  {
    name: "15b.j",
    x: 160.400000001596,
    y: 156.600000001254,
    signals: []
  },
  {
    name: "16b.j",
    x: 170.00000000171,
    y: 156.600000001254,
    signals: []
  },
  {
    name: "17b.j",
    x: 179.600000001824,
    y: 156.600000001254,
    signals: []
  },
  {
    name: "18b.j",
    x: 189.20000000193798,
    y: 156.600000001254,
    signals: []
  },
  {
    name: "19b.j",
    x: 198.80000000205197,
    y: 156.600000001254,
    signals: []
  },
  {
    name: "20b.j",
    x: 208.400000002166,
    y: 156.600000001254,
    signals: []
  },
  {
    name: "21b.j",
    x: 218.00000000228,
    y: 156.600000001254,
    signals: []
  },
  {
    name: "22b.j",
    x: 227.60000000239398,
    y: 156.600000001254,
    signals: []
  },
  {
    name: "23b.j",
    x: 237.20000000250798,
    y: 156.600000001254,
    signals: []
  },
  {
    name: "24b.j",
    x: 246.80000000262197,
    y: 156.600000001254,
    signals: []
  },
  {
    name: "25b.j",
    x: 256.40000000273596,
    y: 156.600000001254,
    signals: []
  },
  {
    name: "26b.j",
    x: 266.00000000285,
    y: 156.600000001254,
    signals: []
  },
  {
    name: "27b.j",
    x: 275.60000000296395,
    y: 156.600000001254,
    signals: []
  },
  {
    name: "28b.j",
    x: 285.200000003078,
    y: 156.600000001254,
    signals: []
  },
  {
    name: "29b.j",
    x: 294.800000003192,
    y: 156.600000001254,
    signals: []
  },
  {
    name: "30b.j",
    x: 304.400000003306,
    y: 156.600000001254,
    signals: []
  }
];
var te = Object.defineProperty, ee = Object.getOwnPropertyDescriptor, k0 = (t, e, i, n) => {
  for (var s = n > 1 ? void 0 : n ? ee(e, i) : e, r = t.length - 1, a; r >= 0; r--)
    (a = t[r]) && (s = (n ? a(e, i, s) : a(s)) || s);
  return n && s && te(e, i, s), s;
};
let Q = class extends m {
  constructor() {
    super(...arguments), this.rotationTransform = 0, this.isActive = !1, this.isDragged = !1, this.topPowerPins = V0({
      namePreface: "tp",
      x: 28.9,
      y: 13.6,
      signals: [
        {
          type: "power",
          signal: "VCC"
        }
      ]
    }, {
      namePreface: "tn",
      x: 28.9,
      y: 23.3,
      signals: [
        {
          type: "power",
          signal: "GND"
        }
      ]
    }), this.bottomPowerPins = V0({
      namePreface: "bp",
      x: 28.9,
      y: 186.3,
      signals: [
        {
          type: "power",
          signal: "VCC"
        }
      ]
    }, {
      namePreface: "bn",
      x: 28.9,
      y: 196.3,
      signals: [
        {
          type: "power",
          signal: "GND"
        }
      ]
    }), this.pinInfo = [
      ...this.topPowerPins,
      ...this.bottomPowerPins,
      ...Qt
    ];
  }
  get rotatedPinInfo() {
    return this.pinInfo.map(
      (t) => A(t, this.rotationTransform)
    );
  }
  static get styles() {
    return [S, w``];
  }
  _onPinClick(t) {
    this.dispatchEvent(
      new CustomEvent("pin-clicked", {
        detail: {
          data: t.target.dataset.value,
          id: t.target.id,
          clientX: t.clientX,
          clientY: t.clientY
        }
      })
    );
  }
  update(t) {
    super.update(t), t.has("flip") && this.dispatchEvent(
      new CustomEvent("pininfo-change", { detail: this.pinInfo })
    ), t.has("rotationTransform") && this.dispatchEvent(
      new CustomEvent("pininfo-change", { detail: this.rotatedPinInfo })
    );
  }
  render() {
    return v`
        <svg viewBox="0 0 322.921 207.874"
             width="322.921px"
             height="207.874px"
             style="top: 400.2px;  left: -256.4px; user-select: none; text-rendering: geometricprecision;"
             class="${this.isActive && !this.isDragged ? "active" : ""} component-svg">
<!--          <g transform="rotate(${this.rotationTransform})" style="transform-origin: 50% 50%;">-->
            <defs>
              <pattern id="points" width="2.54mm" height="2.54mm" patternUnits="userSpaceOnUse" x="0" y="3">
                <rect width="1mm" height="1mm" fill-opacity="0.5"></rect>
              </pattern>
              <pattern id="points-wide" width="2.54mm" height="2.54mm" patternUnits="userSpaceOnUse" x="5.3" y="5.5">
                <rect width="1mm" height="1mm" fill-opacity="0.5"></rect>
              </pattern>
            </defs>
            <rect fill="#eeefed" width="327.149" height="207.874" rx="3"></rect>
            <rect x="5.669" y="100" width="310" height="7" fill="#e3e3e3"></rect>
            <g transform="matrix(1, 0, 0, 1, 14, 5)">
              <g transform="scale(0.5)">
                <line x1="4" x2="17" y1="10.5" y2="10.5" stroke="#F97466" stroke-width="1"></line>
                <line y1="4" y2="17" x1="10.5" x2="10.5" stroke="#F97466" stroke-width="1"></line>
              </g>
              <g transform="translate(0 18) scale(0.5)">
                <line y1="4" y2="17" x1="10.5" x2="10.5" stroke="#55d2fd" stroke-width="1"></line>
              </g>
            </g>
            <g transform="matrix(1, 0, 0, 1, -7, 1)">
              <rect x="34.016" y="5" width="273" height="1" fill-opacity="0.5" fill="#F97466"></rect>
              <rect transform="translate(34, -1.8)" y="12.55" width="44" height="3.6mm" fill="url(#points)"></rect>
              <rect transform="translate(91.6, -1.8)" y="12.55" width="44" height="3.6mm" fill="url(#points)"></rect>
              <rect transform="translate(149.2, -1.8)" y="12.55" width="44" height="3.6mm" fill="url(#points)"></rect>
              <rect transform="translate(206.8, -1.8)" y="12.55" width="44" height="3.6mm" fill="url(#points)"></rect>
              <rect transform="translate(264.4, -1.8)" y="12.55" width="44" height="3.6mm" fill="url(#points)"></rect>
              <rect x="34.016" y="30" width="273" height="1" fill-opacity="0.5" fill="#55d2fd"></rect>
              <g transform="matrix(0.5, 0, 0, 0.5, 597, 0)">
                <line x1="-568" x2="-555" y1="10.5" y2="10.5" stroke="#F97466" stroke-width="1"></line>
                <line y1="4" y2="17" x1="-561.5" x2="-561.5" stroke="#F97466" stroke-width="1"></line>
              </g>
              <g transform="matrix(0.5, 0, 0, 0.5, 597, 23)">
                <line y1="4" y2="17" x1="-562" x2="-562" stroke="#55d2fd" stroke-width="1"></line>
              </g>
            </g>
            <g transform="matrix(1, 0, 0, 1, 0, 5)">
              <text font-size="7px" opacity="0.6" style="white-space: pre;">
                <tspan x="16" y="47">a</tspan>
                <tspan x="16" y="57">b</tspan>
                <tspan x="16" y="65">c</tspan>
                <tspan x="16" y="76">d</tspan>
                <tspan x="16" y="85">e</tspan>
                <tspan x="312" y="47">a</tspan>
                <tspan x="312" y="57">b</tspan>
                <tspan x="312" y="65">c</tspan>
                <tspan x="312" y="76">d</tspan>
                <tspan x="312" y="85">e</tspan>
              </text>
              <text font-size="7px" opacity="0.6" id="breadboard-numbers" style="white-space: pre;">
                <tspan x="25" y="38">1</tspan>
                <tspan x="63" y="38">5</tspan>
                <tspan x="108" y="38">10</tspan>
                <tspan x="156" y="38">15</tspan>
                <tspan x="204" y="38">20</tspan>
                <tspan x="252" y="38">25</tspan>
                <tspan x="300" y="38">30</tspan>
              </text>
              <text font-size="7px" opacity="0.6" style="white-space: pre;" transform="matrix(1, 0, 0, 1, 0, 126)">
                <tspan x="25" y="38">1</tspan>
                <tspan x="63" y="38">5</tspan>
                <tspan x="108" y="38">10</tspan>
                <tspan x="156" y="38">15</tspan>
                <tspan x="204" y="38">20</tspan>
                <tspan x="252" y="38">25</tspan>
                <tspan x="300" y="38">30</tspan>
              </text>
              <rect x="18.898" y="40" width="292.052" height="49.134" fill="url(#points-wide)" style=""></rect>
            </g>
            <g transform="matrix(1, 0, 0, 1, 0, 73)">
              <text font-size="7px" opacity="0.6" style="white-space: pre;">
                <tspan x="16" y="47">f</tspan>
                <tspan x="16" y="57">g</tspan>
                <tspan x="16" y="67">h</tspan>
                <tspan x="17" y="76">i</tspan>
                <tspan x="17" y="85">j</tspan>
                <tspan x="312" y="47">f</tspan>
                <tspan x="312" y="57">g</tspan>
                <tspan x="312" y="67">h</tspan>
                <tspan x="312" y="76">i</tspan>
                <tspan x="312" y="85">j</tspan>
              </text>
              <rect x="18.898" y="40" width="288.289" height="49.134" fill="url(#points-wide)" style=""></rect>
            </g>
            <g transform="matrix(1, 0, 0, 1, 15, 173)">
              <g transform="scale(0.5)">
                <line x1="4" x2="17" y1="10.5" y2="10.5" stroke="#F97466" stroke-width="1"></line>
                <line y1="4" y2="17" x1="10.5" x2="10.5" stroke="#F97466" stroke-width="1"></line>
              </g>
              <g transform="translate(0 21) scale(0.5)">
                <line y1="4" y2="17" x1="10.5" x2="10.5" stroke="#55d2fd" stroke-width="1"></line>
              </g>
            </g>
            <g transform="matrix(1, 0, 0, 1, -7, 176)" style="transform-origin: -2px 12.5px;">
              <rect x="34.016" width="273" height="1" fill-opacity="0.5" fill="#F97466" style=""></rect>
              <rect transform="translate(34,-4)" y="12.55" width="44" height="3.6mm" fill="url(#points)"></rect>
              <rect transform="translate(91.6,-4)" y="12.55" width="44" height="3.6mm" fill="url(#points)"></rect>
              <rect transform="translate(149.2,-4)" y="12.55" width="44" height="3.6mm" fill="url(#points)"></rect>
              <rect transform="translate(206.8,-4)" y="12.55" width="44" height="3.6mm" fill="url(#points)"></rect>
              <rect transform="translate(264.4,-4)" y="12.55" width="44" height="3.6mm" fill="url(#points)"></rect>
              <rect x="34.016" y="27" width="273" height="1" fill-opacity="0.5" fill="#55d2fd"></rect>
              <g transform="matrix(0.5, 0, 0, 0.5, 596, -5)">
                <line x1="-568" x2="-555" y1="10.5" y2="10.5" stroke="#F97466" stroke-width="1"></line>
                <line y1="4" y2="17" x1="-561.5" x2="-561.5" stroke="#F97466" stroke-width="1"></line>
              </g>
              <g transform="matrix(0.5, 0, 0, 0.5, 596, 18)">
                <line y1="4" y2="17" x1="-562" x2="-562" stroke="#55d2fd" stroke-width="1"></line>
              </g>
            </g>

            <g class="pin-group">
              ${this.pinInfo.map((t) => p`
                      <circle @click=${this._onPinClick} 
                      id="${"pt-" + this.id + "-" + t.name}" 
                      data-value="${JSON.stringify(t)}" 
                      class="pin-target" 
                      r="2px" 
                      cx=${t.x} 
                      cy=${t.y} ><title>${t.name}</title></circle>`)}
            </g>
<!--          </g>-->
          
        </svg>
    `;
  }
};
k0([
  o()
], Q.prototype, "rotationTransform", 2);
k0([
  o({ type: Boolean })
], Q.prototype, "isActive", 2);
k0([
  o({ type: Boolean })
], Q.prototype, "isDragged", 2);
Q = k0([
  k("breadboard-mini")
], Q);
const ke = b({
  tagName: "breadboard-mini",
  elementClass: Q,
  react: $,
  events: {
    onPininfoChange: "pininfo-change",
    onPinClicked: "pin-clicked"
  }
});
var ie = Object.defineProperty, se = Object.getOwnPropertyDescriptor, $0 = (t, e, i, n) => {
  for (var s = n > 1 ? void 0 : n ? se(e, i) : e, r = t.length - 1, a; r >= 0; r--)
    (a = t[r]) && (s = (n ? a(e, i, s) : a(s)) || s);
  return n && s && ie(e, i, s), s;
};
let t0 = class extends m {
  constructor() {
    super(...arguments), this.rotationTransform = 0, this.isActive = !0, this.isDragged = !1, this.pinInfo = [
      { name: "1", x: 8, y: 38, signals: [] },
      { name: "2", x: 18, y: 38, signals: [] }
    ];
  }
  static get styles() {
    return [S, w``];
  }
  get rotatedPinInfo() {
    return this.pinInfo.map(
      (t) => A(t, this.rotationTransform)
    );
  }
  _onPinClick(t) {
    console.log("pin clicked"), this.dispatchEvent(
      new CustomEvent("pin-clicked", {
        detail: {
          data: t.target.dataset.value,
          id: t.target.id,
          clientX: t.clientX,
          clientY: t.clientY
        }
      })
    );
  }
  update(t) {
    t.has("flip") && this.dispatchEvent(
      new CustomEvent("pininfo-change", { detail: this.pinInfo })
    ), t.has("rotationTransform") && this.dispatchEvent(
      new CustomEvent("pininfo-change", { detail: this.rotatedPinInfo })
    ), super.update(t);
  }
  /**
   * Renders an SVG element with predefined styles and attributes.
   *
   * @returns {string} The SVG element as a string in HTML format.
   */
  render() {
    const t = "rgb(147, 145, 145)", e = "0.2px", i = "none", n = "matrix(0.9999999999999999, 0, 0, 0.9999999999999999, -8.881784197001252e-16, -8.881784197001252e-16)";
    return v`
      <svg
        class="${this.isActive && !this.isDragged ? "active" : ""} component-svg"
        viewBox="0 0 30 46"
        width="30px"
        height="46px"
      >
        <g transform="scale(5.2)">
          <path
            style="stroke: ${t}; stroke-linecap: round; fill: ${i}; stroke-width: ${e};"
            d="M 1.344 4.105 C 1.464 4.254 1.513 4.53 1.559 4.854 C 1.579 4.995 1.579 7.225 1.58 7.236"
            transform=${n}
          ></path>
          <path
            style="stroke: ${t}; stroke-linecap: round; fill: ${i}; stroke-width: ${e}; transform-origin: 3.7225px 5.7255px;"
            d="M 3.592 7.291 C 3.725 7.142 3.779 6.866 3.83 6.542 C 3.852 6.401 3.852 4.171 3.853 4.16"
            transform="matrix(-1, 0, 0, -1, -9.53674e-7, 0)"
          ></path>
          <ellipse
            style="stroke: rgb(223, 114, 5); fill: rgb(231, 215, 151); stroke-width: ${e};"
            cx="2.672"
            cy="2.295"
            rx="2.53"
            ry="2.124"
            transform=${n}
          ></ellipse>
          <path
            style="fill: ${i}; stroke: rgb(223, 114, 5); stroke-width: ${e};"
            d="M 3.877 0.468 C 3.736 0.747 3.061 0.737 2.454 0.755 C 1.848 0.773 1.31 0.818 1.441 1.205 C 1.531 1.47 2.14 1.394 2.738 1.335 C 3.335 1.276 3.974 1.33 3.98 1.588 C 3.991 2.017 3.384 1.986 2.731 1.961 C 2.078 1.936 1.411 1.885 1.415 2.204 C 1.419 2.545 2.072 2.527 2.725 2.506 C 3.378 2.486 4.047 2.462 4.033 2.789 C 4.005 3.404 1.416 2.733 1.432 3.344 C 1.448 3.955 3.863 3.305 3.814 4.097"
            transform=${n}
          ></path>
        </g>
        <g class="pin-group">
          ${this.pinInfo.map((s) => p`<circle 
                            @click=${this._onPinClick} 
                            id="${"pt-" + this.id + "-" + s.name}" 
                            data-value="${JSON.stringify(s)}" 
                            class="pin-target" r="2px" 
                            cx=${s.x} 
                            cy=${s.y} ><title>${s.name}</title></circle>`)}
        </g>
      </svg>
    `;
  }
};
$0([
  o()
], t0.prototype, "rotationTransform", 2);
$0([
  o()
], t0.prototype, "isActive", 2);
$0([
  o({ type: Boolean })
], t0.prototype, "isDragged", 2);
t0 = $0([
  k("photoresistor-component")
], t0);
const $e = b({
  tagName: "photoresistor-component",
  elementClass: t0,
  react: $,
  events: {
    onPininfoChange: "pininfo-change",
    onPinClicked: "pin-clicked"
  }
});
var ne = Object.defineProperty, re = Object.getOwnPropertyDescriptor, I = (t, e, i, n) => {
  for (var s = n > 1 ? void 0 : n ? re(e, i) : e, r = t.length - 1, a; r >= 0; r--)
    (a = t[r]) && (s = (n ? a(e, i, s) : a(s)) || s);
  return n && s && ne(e, i, s), s;
};
let P = class extends m {
  constructor() {
    super(...arguments), this.angle = 0, this.stepSize = 18, this.pressed = !1, this.minValue = 0, this.maxValue = 360, this.rotationTransform = 0, this.isActive = !1, this.isDragged = !1, this.arrowTimer = null, this.pinInfo = [
      { name: "CLK", y: 110, x: 24.5, number: 1, signals: [] },
      { name: "DT", y: 110, x: 33.5, number: 2, signals: [] },
      { name: "SW", y: 110, x: 42.5, number: 3, signals: [] },
      { name: "VCC", y: 110, x: 52, number: 4, signals: [_t()] },
      { name: "GND", y: 110, x: 61.5, number: 5, signals: [Ct()] }
    ];
  }
  static get styles() {
    return [
      S,
      w`
        svg {
          user-select: none;
        }

        .arrow-container {
          cursor: pointer;
        }

        svg:hover .arrow {
          fill: #666;
          stroke: #666;
          stroke-width: 1.5px;
          transition: stroke-width 0.3s;
        }

        .arrow-container:hover .arrow {
          fill: white;
        }

        svg:hover .handle:hover {
          stroke: #ccc;
        }

        svg:hover .handle.active {
          fill: white;
          stroke: white;
        }

        .handle {
          cursor: pointer;
        }

        g[tabindex]:focus {
          outline: none;
        }

        g[tabindex]:focus + .focus-indicator {
          opacity: 1;
        }
      `
    ];
  }
  get rotatedPinInfo() {
    return this.pinInfo.map(
      (t) => A(t, this.rotationTransform)
    );
  }
  _onPinClick(t) {
    this.dispatchEvent(
      new CustomEvent("pin-clicked", {
        detail: {
          data: t.target.dataset.value,
          id: t.target.id,
          clientX: t.clientX,
          clientY: t.clientY
        }
      })
    );
  }
  update(t) {
    t.has("flip") && this.dispatchEvent(
      new CustomEvent("pininfo-change", { detail: this.pinInfo })
    ), t.has("rotationTransform") && this.dispatchEvent(
      new CustomEvent("pininfo-change", { detail: this.rotatedPinInfo })
    ), super.update(t);
  }
  render() {
    return v`
      <svg
        class="${this.isActive && !this.isDragged ? "active" : ""} component-svg"
        viewBox="0 0 70 120"
        width="70px"
        height="120px"
      >
        <g transform="scale(1.28)">
          <g gorn="0.3" id="breadboard" style="display:inline">
            <g gorn="0.3.0" stroke="none">
              <g transform="scale(26.458334)">
                <path
                  d="M0,0.00315575L0,2.78875L2.03557,2.78875L2.03557,0.00315575ZM0.211546,0.321333a0.160704,0.160704,0,0,1,0.00271284,0,0.160704,0.160704,0,0,1,0.160722,0.160722,0.160704,0.160704,0,0,1,-0.160722,0.160722,0.160704,0.160704,0,0,1,-0.160667,-0.160722,0.160704,0.160704,0,0,1,0.157954,-0.160722zm0.00271284,1.82132A0.160704,0.160704,0,0,1,0.374981,2.30337,0.160704,0.160704,0,0,1,0.214259,2.46409,0.160704,0.160704,0,0,1,0.0535927,2.30337,0.160704,0.160704,0,0,1,0.214259,2.14265Z"
                  fill="#333333"
                  fill-opacity="1"
                  gorn="0.3.0.0.0.0"
                  id="rect833"
                  stroke="none"
                  stroke-width="0.0544252"
                  style="stroke-linecap:round;stroke-linejoin:round"
                ></path>
              </g>
              <circle
                cx="5.66929"
                cy="12.7546"
                fill="none"
                fill-opacity="1"
                gorn="0.3.0.1"
                id="ellipse874"
                r="4.96063"
                stroke="#ffffff"
                stroke-dasharray="none"
                stroke-opacity="1"
                stroke-width="0.566929"
                style="stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;"
              ></circle>
              <circle
                cx="5.66929"
                cy="60.9435"
                fill="none"
                fill-opacity="1"
                gorn="0.3.0.2"
                id="circle876"
                r="4.96063"
                stroke="#ffffff"
                stroke-dasharray="none"
                stroke-opacity="1"
                stroke-width="0.566929"
                style="stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;"
              ></circle>
              <rect
                fill="none"
                fill-opacity="1"
                gorn="0.3.0.3"
                height="8.35301"
                id="rect888"
                stroke="#ffffff"
                stroke-dasharray="none"
                stroke-opacity="1"
                stroke-width="0.595967"
                style="stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;"
                width="37.3883"
                x="14.8964"
                y="61.7673"
              ></rect>
              <g gorn="0.3.0.4" id="g1015">
                <g transform="rotate(90)">
                  <g
                    aria-label="CLK"
                    fill="#ffffff"
                    font-size="169.334"
                    gorn="0.3.0.4.0.0.0"
                    id="text896"
                    stroke-dasharray="none"
                    stroke-width="0.751181"
                    style="line-height:1.25;font-family:OCRA;-inkscape-font-specification:'OCRA, Normal';stroke-miterlimit:4;"
                  >
                    <path
                      d="m48.6454,-46.5732q0,-0.317999,0.144,-0.618001l0.606002,-1.224q0.0959981,-0.216,0.317999,-0.353999,0.228002,-0.144,0.498002,-0.144l1.116,0q0.126003,0,0.216003,0.09,0.09,0.09,0.09,0.209999,0,0.126,-0.09,0.216,-0.09,0.0900028,-0.216003,0.0900028l-1.116,0q-0.186001,0,-0.264002,0.167998l-0.618001,1.218q-0.0779981,0.168001,-0.0779981,0.348001,0,0.18,0.0779981,0.348001l0.618001,1.218q0.0780009,0.168001,0.264002,0.168001l1.116,0q0.126003,0,0.216003,0.09,0.09,0.09,0.09,0.209999,0,0.126,-0.09,0.216,-0.09,0.09,-0.216003,0.09l-1.116,0q-0.264002,0,-0.486,-0.144,-0.216003,-0.144,-0.324003,-0.36,-0.443999,-0.846,-0.612,-1.218,-0.144,-0.306,-0.144,-0.618001z"
                      fill="#ffffff"
                      font-size="5973.71"
                      gorn="0.3.0.4.0.0.0.0"
                      id="path1308"
                      stroke-dasharray="none"
                      stroke-width="0.751181"
                      style="stroke-miterlimit:4;"
                    ></path>
                    <path
                      d="m52.9812,-44.2332l0,-4.38001q0,-0.119999,0.0839991,-0.209999,0.09,-0.09,0.216,-0.09,0.126,0,0.216,0.09,0.09,0.09,0.09,0.209999l0,3.77402l2.076,0q0.126,0,0.216,0.09,0.09,0.09,0.09,0.209999,0,0.126,-0.09,0.216,-0.09,0.09,-0.216,0.09z"
                      fill="#ffffff"
                      font-size="5973.71"
                      gorn="0.3.0.4.0.0.0.1"
                      id="path1310"
                      stroke-dasharray="none"
                      stroke-width="0.751181"
                      style="stroke-miterlimit:4;"
                    ></path>
                    <path
                      d="m57.3171,-44.5391l0,-4.07401q0,-0.119999,0.0840019,-0.209999,0.09,-0.09,0.216,-0.09,0.126,0,0.216,0.09,0.09,0.09,0.09,0.209999l0,1.38l1.878,-1.608q0.09,-0.072,0.198,-0.072,0.126,0,0.216,0.09,0.09,0.09,0.09,0.209999,0,0.144,-0.108,0.234l-2.112,1.806,2.112,1.806q0.108,0.09,0.108,0.227999,0,0.126,-0.09,0.216,-0.09,0.09,-0.216,0.09,-0.108,0,-0.198,-0.072l-1.878,-1.608l0,1.374q0,0.126,-0.09,0.216,-0.09,0.09,-0.216,0.09,-0.126,0,-0.216,-0.09,-0.0840019,-0.09,-0.0840019,-0.216z"
                      fill="#ffffff"
                      font-size="5973.71"
                      gorn="0.3.0.4.0.0.0.2"
                      id="path1312"
                      stroke-dasharray="none"
                      stroke-width="0.751181"
                      style="stroke-miterlimit:4;"
                    ></path>
                  </g>
                </g>
                <g transform="rotate(90)">
                  <g
                    aria-label="DT"
                    fill="#ffffff"
                    font-size="169.334"
                    gorn="0.3.0.4.1.0.0"
                    id="text900"
                    stroke-dasharray="none"
                    stroke-width="0.751181"
                    style="line-height:1.25;font-family:OCRA;-inkscape-font-specification:'OCRA, Normal';stroke-miterlimit:4;"
                  >
                    <path
                      d="m48.6454,-37.1565q0,-0.120002,0.0839991,-0.210002,0.09,-0.09,0.216,-0.09l0.294001,0l0,-3.46802l-0.294001,0q-0.126,0,-0.216,-0.09,-0.0839991,-0.09,-0.0839991,-0.216,0,-0.120002,0.0839991,-0.210002,0.09,-0.09,0.216,-0.09l1.116,0q0.264002,0,0.480002,0.144,0.221998,0.144003,0.330001,0.360003l0.612,1.218q0.150001,0.311998,0.150001,0.618001,0,0.306,-0.150001,0.618001l-0.606002,1.224q-0.0960009,0.216003,-0.324,0.360003,-0.222001,0.137999,-0.492001,0.137999l-1.116,0q-0.126,0,-0.216,-0.09,-0.0839991,-0.09,-0.0839991,-0.216zm1.2,-0.300002l0.216,0q0.186001,0,0.264002,-0.167998l0.618001,-1.218q0.0839991,-0.204001,0.0839991,-0.348001,0,-0.18,-0.0839991,-0.348001l-0.618001,-1.218q-0.0780009,-0.168001,-0.264002,-0.168001l-0.216,0z"
                      fill="#ffffff"
                      font-size="5973.71"
                      gorn="0.3.0.4.1.0.0.0"
                      id="path1315"
                      stroke-dasharray="none"
                      stroke-width="0.751181"
                      style="stroke-miterlimit:4;"
                    ></path>
                    <path
                      d="m52.9812,-40.7205l0,-0.810003l2.988,0l0,0.810003q0,0.126,-0.09,0.216,-0.09,0.09,-0.216,0.09,-0.126,0,-0.216,-0.09,-0.0839991,-0.09,-0.0839991,-0.216l0,-0.204001l-0.588002,0l0,3.76801q0,0.126,-0.09,0.216,-0.09,0.09,-0.209999,0.09,-0.126003,0,-0.216003,-0.09,-0.09,-0.09,-0.09,-0.216l0,-3.76801l-0.582001,0l0,0.204001q0,0.126,-0.09,0.216,-0.09,0.09,-0.216,0.09,-0.126,0,-0.216,-0.09,-0.0839991,-0.09,-0.0839991,-0.216z"
                      fill="#ffffff"
                      font-size="5973.71"
                      gorn="0.3.0.4.1.0.0.1"
                      id="path1317"
                      stroke-dasharray="none"
                      stroke-width="0.751181"
                      style="stroke-miterlimit:4;"
                    ></path>
                  </g>
                </g>
                <g transform="rotate(90)">
                  <g
                    aria-label="SW"
                    fill="#ffffff"
                    font-size="169.334"
                    gorn="0.3.0.4.2.0.0"
                    id="text904"
                    stroke-dasharray="none"
                    stroke-width="0.751181"
                    style="line-height:1.25;font-family:OCRA;-inkscape-font-specification:'OCRA, Normal';stroke-miterlimit:4;"
                  >
                    <path
                      d="m48.6454,-30.5739q0,-0.126003,0.0839991,-0.216003,0.09,-0.09,0.216,-0.09,0.126,0,0.216003,0.09,0.09,0.09,0.09,0.216003,0,0.0839991,0.0599981,0.144,0.0600009,0.0599981,0.144,0.0599981l1.494,0q0.0780009,0,0.0780009,-0.0779981l-2.244,-2.89199q-0.137999,-0.192002,-0.137999,-0.420001l0,-0.018q0,-0.27,0.198,-0.468003,0.204001,-0.198,0.480002,-0.198l1.494,0q0.330001,0,0.570002,0.240001,0.246002,0.240001,0.246002,0.570002,0,0.126,-0.09,0.216,-0.09,0.09,-0.216003,0.09,-0.126,0,-0.216,-0.09,-0.0839991,-0.09,-0.0839991,-0.216,0,-0.0780009,-0.0659991,-0.138002,-0.0600009,-0.0659991,-0.144003,-0.0659991l-1.494,0q-0.072,0,-0.072,0.0600009l0,0.018,0,0.0239981l2.232,2.86801q0.150001,0.18,0.150001,0.420001,-0.0120019,0.281999,-0.210002,0.486,-0.191999,0.198,-0.474001,0.198l-1.494,0q-0.329998,0,-0.569999,-0.240001,-0.240001,-0.240001,-0.240001,-0.569999z"
                      fill="#ffffff"
                      font-size="5973.71"
                      gorn="0.3.0.4.2.0.0.0"
                      id="path1320"
                      stroke-dasharray="none"
                      stroke-width="0.751181"
                      style="stroke-miterlimit:4;"
                    ></path>
                    <path
                      d="m52.9812,-30.4957l0,-3.64802q0,-0.120002,0.0839991,-0.210002,0.09,-0.09,0.216,-0.09,0.126,0,0.216,0.09,0.09,0.09,0.09,0.210002l0,3.48599l0.168001,0.288l0.246002,0q0.0119991,-0.018,0.072,-0.131998,0.0599981,-0.114001,0.0959981,-0.174002l0,-1.938q0,-0.126,0.09,-0.210002,0.09,-0.09,0.216003,-0.09,0.119999,0,0.209999,0.09,0.09,0.0840019,0.09,0.210002l0,1.938q0.036,0.0600009,0.0960009,0.174002,0.0599981,0.113998,0.072,0.131998l0.245999,0l0.174002,-0.288l0,-3.48599q0,-0.120002,0.0839991,-0.210002,0.09,-0.09,0.216,-0.09,0.126,0,0.216,0.09,0.09,0.09,0.09,0.210002l0,3.64802l-0.342,0.582001q-0.09,0.150001,-0.263999,0.150001l-0.588002,0q-0.191999,0,-0.299999,-0.209999,-0.126003,0.209999,-0.306003,0.209999l-0.582001,0q-0.18,0,-0.27,-0.150001z"
                      fill="#ffffff"
                      font-size="5973.71"
                      gorn="0.3.0.4.2.0.0.1"
                      id="path1322"
                      stroke-dasharray="none"
                      stroke-width="0.751181"
                      style="stroke-miterlimit:4;"
                    ></path>
                  </g>
                </g>
                <g transform="rotate(90)">
                  <g
                    aria-label=" +"
                    fill="#ffffff"
                    font-size="169.334"
                    gorn="0.3.0.4.3.0.0"
                    id="text912"
                    stroke-dasharray="none"
                    stroke-width="0.751181"
                    style="line-height:1.25;font-family:OCRA;-inkscape-font-specification:'OCRA, Normal';stroke-miterlimit:4;"
                  >
                    <path
                      d="m53.0651,-24.8012q-0.0839991,-0.0900003,-0.0839991,-0.216,0,-0.126,0.0839991,-0.216001,0.09,-0.09,0.216,-0.09l0.888001,0l0,-0.888001q0,-0.12,0.09,-0.21,0.09,-0.0900003,0.216003,-0.0900003,0.119999,0,0.209999,0.0900003,0.09,0.09,0.09,0.21l0,0.888001l0.888001,0q0.126,0,0.216,0.09,0.09,0.0900003,0.09,0.216001,0,0.126,-0.09,0.216,-0.09,0.0840002,-0.216,0.0840002l-0.888001,0l0,0.888001q0,0.126,-0.09,0.216001,-0.09,0.09,-0.209999,0.09,-0.126003,0,-0.216003,-0.09,-0.09,-0.0900003,-0.09,-0.216001l0,-0.888001l-0.888001,0q-0.126,0,-0.216,-0.0840002z"
                      fill="#ffffff"
                      font-size="5973.71"
                      gorn="0.3.0.4.3.0.0.0"
                      id="path1325"
                      stroke-dasharray="none"
                      stroke-width="0.751181"
                      style="stroke-miterlimit:4;"
                    ></path>
                  </g>
                </g>
                <g transform="rotate(90)">
                  <g
                    aria-label="GND"
                    fill="#ffffff"
                    font-size="169.334"
                    gorn="0.3.0.4.4.0.0"
                    id="text908"
                    stroke-dasharray="none"
                    stroke-width="0.751181"
                    style="line-height:1.25;font-family:OCRA;-inkscape-font-specification:'OCRA, Normal';stroke-miterlimit:4;"
                  >
                    <path
                      d="m48.6454,-16.5025l0,-1.626q0,-0.414,0.252,-0.738l0.816001,-1.056q0.27,-0.348001,0.720003,-0.348001l0.893999,0q0.126003,0,0.216003,0.0900003,0.09,0.09,0.09,0.21,0,0.126,-0.09,0.216001,-0.09,0.09,-0.216003,0.09l-0.893999,0q-0.150001,0,-0.240001,0.12l-0.816001,1.044q-0.126,0.168,-0.126,0.372002l0,1.626q0,0.126,0.09,0.216001,0.09,0.09,0.209999,0.09l1.17,0q0.119999,0,0.209999,-0.09,0.0960009,-0.0900003,0.0960009,-0.216001l0,-0.618001l-0.594,0q-0.126,0,-0.216003,-0.0840002,-0.0839991,-0.09,-0.0839991,-0.216,0,-0.126,0.0839991,-0.216,0.0900028,-0.09,0.216003,-0.09l1.2,0l0,1.224q0,0.372002,-0.270003,0.642002,-0.27,0.270001,-0.641999,0.270001l-1.17,0q-0.378,0,-0.642002,-0.264,-0.263999,-0.27,-0.263999,-0.648z"
                      fill="#ffffff"
                      font-size="5973.71"
                      gorn="0.3.0.4.4.0.0.0"
                      id="path1328"
                      stroke-dasharray="none"
                      stroke-width="0.751181"
                      style="stroke-miterlimit:4;"
                    ></path>
                    <path
                      d="m52.9812,-15.8966l0,-4.374l0.798001,0l1.584,3.61202l0,-3.312q0,-0.12,0.0839991,-0.21,0.09,-0.0900003,0.216,-0.0900003,0.126,0,0.216,0.0900003,0.09,0.09,0.09,0.21L55.9692,-15.5906l-0.803999,0l-1.578,-3.6l0,3.294q0,0.126,-0.09,0.216,-0.09,0.0900003,-0.216,0.0900003,-0.126,0,-0.216,-0.0900003,-0.0839991,-0.09,-0.0839991,-0.216z"
                      fill="#ffffff"
                      font-size="5973.71"
                      gorn="0.3.0.4.4.0.0.1"
                      id="path1330"
                      stroke-dasharray="none"
                      stroke-width="0.751181"
                      style="stroke-miterlimit:4;"
                    ></path>
                    <path
                      d="m57.3171,-15.8966q0,-0.12,0.0840019,-0.21,0.09,-0.0900003,0.216,-0.0900003l0.294001,0L57.9112,-19.6646l-0.294001,0q-0.126,0,-0.216,-0.09,-0.0840019,-0.0900003,-0.0840019,-0.216001,0,-0.12,0.0840019,-0.21,0.09,-0.0900003,0.216,-0.0900003l1.116,0q0.263999,0,0.479999,0.144,0.222001,0.144,0.330001,0.36l0.612,1.218q0.150001,0.312001,0.150001,0.618001,0,0.306,-0.150001,0.618001l-0.605999,1.224q-0.0960009,0.216,-0.324,0.36Q59.0031,-15.5906,58.7333,-15.5906l-1.116,0q-0.126,0,-0.216,-0.0900003,-0.0840019,-0.09,-0.0840019,-0.216zm1.2,-0.299999l0.216,0q0.185998,0,0.263999,-0.168l0.618001,-1.218q0.0840019,-0.204,0.0840019,-0.348001,0,-0.18,-0.0840019,-0.348001l-0.618001,-1.218q-0.0780009,-0.168,-0.263999,-0.168l-0.216,0z"
                      fill="#ffffff"
                      font-size="5973.71"
                      gorn="0.3.0.4.4.0.0.2"
                      id="path1332"
                      stroke-dasharray="none"
                      stroke-width="0.751181"
                      style="stroke-miterlimit:4;"
                    ></path>
                  </g>
                </g>
              </g>
            </g>
            <g gorn="0.3.1" id="grpPinblock" style="display:inline">
              <g transform="scale(26.458334)">
                <path
                  d="m0.642832,2.35702,-0.0535927,0.0535371l0,0.164985L0.642832,2.62913l0.164985,0l0.0535371,-0.0535927l0,-0.164985l-0.0535371,-0.0535371z"
                  fill="#4d4d4d"
                  fill-opacity="1"
                  gorn="0.3.1.0.0.0"
                  id="rect961"
                  stroke="none"
                  stroke-dasharray="none"
                  stroke-opacity="1"
                  stroke-width="0.0166844"
                  style="stroke-linecap:round;stroke-linejoin:bevel;stroke-miterlimit:4;"
                ></path>
              </g>
              <path
                d="m24.2085,62.3628,-1.41797,1.4165l0,4.36524l1.41797,1.41797l4.36524,0l1.4165,-1.41797l0,-4.36524l-1.4165,-1.4165z"
                fill="#4d4d4d"
                fill-opacity="1"
                gorn="0.3.1.1"
                id="path979"
                stroke="none"
                stroke-dasharray="none"
                stroke-opacity="1"
                stroke-width="0.441442"
                style="stroke-linecap:round;stroke-linejoin:bevel;stroke-miterlimit:4;"
              ></path>
              <path
                d="M31.4084,62.3628,29.9906,63.7792l0,4.36524l1.41797,1.41797l4.36524,0l1.4165,-1.41797l0,-4.36524l-1.4165,-1.4165z"
                fill="#4d4d4d"
                fill-opacity="1"
                gorn="0.3.1.2"
                id="path981"
                stroke="none"
                stroke-dasharray="none"
                stroke-opacity="1"
                stroke-width="0.441442"
                style="stroke-linecap:round;stroke-linejoin:bevel;stroke-miterlimit:4;"
              ></path>
              <path
                d="M38.6084,62.3628,37.1906,63.7792l0,4.36524l1.41797,1.41797l4.36524,0l1.4165,-1.41797l0,-4.36524l-1.4165,-1.4165z"
                fill="#4d4d4d"
                fill-opacity="1"
                gorn="0.3.1.3"
                id="path983"
                stroke="none"
                stroke-dasharray="none"
                stroke-opacity="1"
                stroke-width="0.441442"
                style="stroke-linecap:round;stroke-linejoin:bevel;stroke-miterlimit:4;"
              ></path>
              <path
                d="m45.8084,62.3628,-1.41797,1.4165l0,4.36524l1.41797,1.41797l4.36524,0l1.4165,-1.41797l0,-4.36524l-1.4165,-1.4165z"
                fill="#4d4d4d"
                fill-opacity="1"
                gorn="0.3.1.4"
                id="path985"
                stroke="none"
                stroke-dasharray="none"
                stroke-opacity="1"
                stroke-width="0.441442"
                style="stroke-linecap:round;stroke-linejoin:bevel;stroke-miterlimit:4;"
              ></path>

              <!-- PINS -->
              <rect
                fill="#c8c8c8"
                fill-opacity="1"
                gorn="0.3.1.5"
                height="21.8268"
                id="rect1028"
                rx="1.41732"
                stroke="none"
                stroke-dasharray="none"
                stroke-opacity="1"
                stroke-width="0.566929"
                style="stroke-linecap:round;stroke-linejoin:bevel;stroke-miterlimit:4;"
                width="2.15433"
                x="18.1134"
                y="64.885"
              ></rect>
              <rect
                fill="#c8c8c8"
                fill-opacity="1"
                gorn="0.3.1.6"
                height="21.8268"
                id="rect1030"
                rx="1.41732"
                stroke="none"
                stroke-dasharray="none"
                stroke-opacity="1"
                stroke-width="0.566929"
                style="stroke-linecap:round;stroke-linejoin:bevel;stroke-miterlimit:4;"
                width="2.15433"
                x="25.2567"
                y="64.885"
              ></rect>
              <rect
                fill="#c8c8c8"
                fill-opacity="1"
                gorn="0.3.1.7"
                height="21.8268"
                id="rect1032"
                rx="1.41732"
                stroke="none"
                stroke-dasharray="none"
                stroke-opacity="1"
                stroke-width="0.566929"
                style="stroke-linecap:round;stroke-linejoin:bevel;stroke-miterlimit:4;"
                width="2.15433"
                x="32.4567"
                y="64.885"
              ></rect>
              <rect
                fill="#c8c8c8"
                fill-opacity="1"
                gorn="0.3.1.8"
                height="21.8268"
                id="rect1034"
                rx="1.41732"
                stroke="none"
                stroke-dasharray="none"
                stroke-opacity="1"
                stroke-width="0.566929"
                style="stroke-linecap:round;stroke-linejoin:bevel;stroke-miterlimit:4;"
                width="2.15433"
                x="39.6567"
                y="64.885"
              ></rect>
              <rect
                fill="#c8c8c8"
                fill-opacity="1"
                gorn="0.3.1.9"
                height="21.8268"
                id="rect1036"
                rx="1.41732"
                stroke="none"
                stroke-dasharray="none"
                stroke-opacity="1"
                stroke-width="0.566929"
                style="stroke-linecap:round;stroke-linejoin:bevel;stroke-miterlimit:4;"
                width="2.15433"
                x="46.8567"
                y="64.885"
              ></rect>
              <rect
                fill="#f2f2f2"
                fill-opacity="1"
                gorn="0.3.1.10"
                height="3.68504"
                id="rect1038"
                rx="0.850394"
                stroke="none"
                stroke-dasharray="none"
                stroke-opacity="1"
                stroke-width="0.223561"
                style="stroke-linecap:round;stroke-linejoin:bevel;stroke-miterlimit:4;"
                width="1.98425"
                x="46.9134"
                y="65.0551"
              ></rect>
              <rect
                fill="#f2f2f2"
                fill-opacity="1"
                gorn="0.3.1.11"
                height="3.68504"
                id="rect1040"
                rx="0.850394"
                stroke="none"
                stroke-dasharray="none"
                stroke-opacity="1"
                stroke-width="0.223561"
                style="stroke-linecap:round;stroke-linejoin:bevel;stroke-miterlimit:4;"
                width="1.98425"
                x="39.7134"
                y="65.0551"
              ></rect>
              <rect
                fill="#f2f2f2"
                fill-opacity="1"
                gorn="0.3.1.12"
                height="3.68504"
                id="rect1042"
                rx="0.850394"
                stroke="none"
                stroke-dasharray="none"
                stroke-opacity="1"
                stroke-width="0.223561"
                style="stroke-linecap:round;stroke-linejoin:bevel;stroke-miterlimit:4;"
                width="1.98425"
                x="32.5134"
                y="65.0551"
              ></rect>
              <rect
                fill="#f2f2f2"
                fill-opacity="1"
                gorn="0.3.1.13"
                height="3.68504"
                id="rect1044"
                rx="0.850394"
                stroke="none"
                stroke-dasharray="none"
                stroke-opacity="1"
                stroke-width="0.223561"
                style="stroke-linecap:round;stroke-linejoin:bevel;stroke-miterlimit:4;"
                width="1.98425"
                x="25.3134"
                y="65.0551"
              ></rect>
              <rect
                fill="#f2f2f2"
                fill-opacity="1"
                gorn="0.3.1.14"
                height="3.68504"
                id="rect1046"
                rx="0.850394"
                stroke="none"
                stroke-dasharray="none"
                stroke-opacity="1"
                stroke-width="0.223561"
                style="stroke-linecap:round;stroke-linejoin:bevel;stroke-miterlimit:4;"
                width="1.98425"
                x="18.1417"
                y="65.0551"
              ></rect>
            </g>
            <g transform="matrix(35.2778, 0, 0, -35.2778, 15.6332, 45.5215)">
              <g gorn="0.3.2.0.0" id="rotaryEncoder">
                <rect
                  fill="#cccccc"
                  gorn="0.3.2.0.0.2"
                  height="0.076"
                  id="rect4426"
                  width="0.049"
                  x="0.657"
                  y="0.998"
                ></rect>
                <rect
                  fill="#cccccc"
                  gorn="0.3.2.0.0.3"
                  height="0.076"
                  id="rect4428"
                  width="0.049"
                  x="0.453"
                  y="0.998"
                ></rect>
                <rect
                  fill="#cccccc"
                  gorn="0.3.2.0.0.4"
                  height="0.076"
                  id="rect4430"
                  width="0.049"
                  x="0.249"
                  y="0.998"
                ></rect>
                <g
                  class="switch-handle"
                  gorn="0.3.2.0.0.5"
                  id="g4434"
                  tabindex="0"
                  @keydown=${this.keydown}
                  @keyup=${this.keyup}
                >
                  <path
                    d="M0.783723,0.99805L0.134164,0.99805c-0.0511937,0,-0.0928346,-0.0416976,-0.0928346,-0.0928913L0.0413291,0.125717C0.0413291,0.0745228,0.0829701,0.0328819,0.134164,0.0328819l0.649559,0c0.0511937,0,0.0928346,0.0416409,0.0928346,0.0928346l0,0.779443c0,0.051222,-0.0416409,0.0928913,-0.0928346,0.0928913zM0.134164,0.0578835C0.0967748,0.0578835,0.0663307,0.0882992,0.0663307,0.125717l0,0.779443c0,0.0374173,0.0304157,0.0678898,0.0678331,0.0678898l0.649559,0c0.037389,0,0.0678331,-0.0304441,0.0678331,-0.0678898L0.851556,0.125717c0,-0.037389,-0.0304157,-0.0678331,-0.0678331,-0.0678331z"
                    gorn="0.3.2.0.0.5.0"
                    id="path4432"
                    stroke="#999999"
                    stroke-opacity="1"
                    stroke-width="0.0283465"
                  ></path>
                </g>
                <path
                  d="m0.857962,0.898271c0,0.0436252,-0.0353197,0.0789449,-0.0789449,0.0789449L0.14091,0.977216c-0.0435969,0,-0.0789449,-0.0353197,-0.0789449,-0.0789449L0.0619654,0.132605c0,-0.0435685,0.035348,-0.0789449,0.0789449,-0.0789449l0.638107,0c0.0435685,0,0.0789165,0.0353764,0.0789165,0.0789449z"
                  fill="#ababab"
                  gorn="0.3.2.0.0.8"
                  id="path4440"
                ></path>
                <rect
                  fill="#777777"
                  fill-opacity="1"
                  gorn="0.3.2.0.0.12"
                  height="0.122858"
                  id="rect5136"
                  stroke="none"
                  stroke-dasharray="none"
                  stroke-opacity="1"
                  stroke-width="0.0281234"
                  style="stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;"
                  width="0.855108"
                  x="0.0309316"
                  y="0.452864"
                ></rect>
                <circle
                  cx="0.459043"
                  cy="0.514828"
                  fill="#878787"
                  gorn="0.3.2.0.0.13"
                  id="circle4450"
                  r="0.230315"
                  stroke="#777777"
                  stroke-width="0.0283465"
                ></circle>
                <circle
                  cx="0.459043"
                  cy="0.514828"
                  fill="#878787"
                  gorn="0.3.2.0.0.14"
                  id="circle4452"
                  r="0.184252"
                ></circle>
                <circle
                  cx="0.46"
                  cy="0.514"
                  gorn="0.3.2.0.0.15"
                  id="circle4454"
                  r="0.184"
                  style="fill: rgb(200, 200, 200);"
                ></circle>
                <path
                  transform="rotate(${this.angle}, 0, 0)"
                  fill="#565658"
                  stroke="#060606"
                  stroke-width=".02"
                  class="handle ${this.pressed ? "active" : ""}"
                  @mousedown=${this.press}
                  @mouseup=${this.release}
                  @mouseleave=${this.release}
                  style="transform-origin: 0.462px 0.508px;"
                  d="M 0.3 0.523 C 0.3 0.431 0.372 0.356 0.46 0.355 C 0.548 0.354 0.619 0.428 0.619 0.519 L 0.3 0.523 Z"
                  transform="matrix(1, 0.000001, -0.000001, 1, 0, 0)"
                ></path>

                <!-- Right Arrow-->
                <g
                  class="arrow-container"
                  @click=${this.clockwiseStep}
                  @mousedown=${this.clockwiseArrowPress}
                  @mouseup=${this.arrowRelease}
                  @mouseleave=${this.arrowRelease}
                >
                  <path
                    class="arrow"
                    d="M 0.724 0.895 C 0.644 0.868 0.607 0.81 0.622 0.722 C 0.622 0.716 0.623 0.707 0.626 0.706 C 0.63 0.703 0.631 0.704 0.632 0.704 C 0.633 0.704 0.634 0.704 0.636 0.706 C 0.649 0.765 0.684 0.811 0.736 0.823 C 0.742 0.811 0.745 0.771 0.75 0.773 C 0.756 0.774 0.817 0.862 0.827 0.876 C 0.811 0.889 0.733 0.945 0.719 0.942 C 0.719 0.942 0.722 0.908 0.724 0.896 L 0.724 0.895 Z"
                    fill="#b3b3b3"
                    stroke="#022"
                    class="arrow"
                    style="stroke-width: 0.0150124px; transform-box: fill-box; transform-origin: 50% 50%;"
                    transform="matrix(-0.121869, -0.992546, 0.992546, -0.121869, 0, 0)"
                  ></path>
                </g>
                <g
                  class="arrow-container"
                  @click=${this.counterClockwiseStep}
                  @mousedown=${this.counterclockwiseArrowPress}
                  @mouseup=${this.arrowRelease}
                  @mouseleave=${this.arrowRelease}
                >
                  <path
                    class="arrow"
                    d="M 0.226 0.749 C 0.144 0.776 0.107 0.832 0.122 0.918 C 0.123 0.923 0.123 0.932 0.126 0.934 C 0.129 0.936 0.13 0.936 0.132 0.936 C 0.133 0.935 0.134 0.935 0.135 0.934 C 0.149 0.876 0.184 0.831 0.238 0.819 C 0.244 0.831 0.245 0.87 0.251 0.868 C 0.258 0.867 0.32 0.782 0.329 0.768 C 0.314 0.755 0.233 0.701 0.22 0.703 C 0.22 0.703 0.223 0.736 0.226 0.748 L 0.226 0.749 Z"
                    fill="#b3b3b3"
                    stroke="#000"
                    class="arrow"
                    style="stroke-width: 0.0150124px; transform-box: fill-box; transform-origin: 50% 50%;"
                    transform="matrix(0.139173, -0.990268, 0.990268, 0.139173, 0, 0)"
                  ></path>
                </g>
              </g>
            </g>
            <rect
              fill="none"
              fill-opacity="1"
              gorn="0.3.3"
              height="2.83465"
              id="connector0pin"
              stroke="none"
              stroke-dasharray="none"
              stroke-width="1.26296"
              style="stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;"
              width="2.15433"
              x="18.1134"
              y="82.2047"
            ></rect>
            <rect
              fill="none"
              fill-opacity="1"
              gorn="0.3.4"
              height="2.83465"
              id="connector1pin"
              stroke="none"
              stroke-dasharray="none"
              stroke-width="1.26297"
              style="stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;"
              width="2.15433"
              x="25.2567"
              y="82.2047"
            ></rect>
            <rect
              fill="none"
              fill-opacity="1"
              gorn="0.3.5"
              height="2.83465"
              id="connector2pin"
              stroke="none"
              stroke-dasharray="none"
              stroke-width="1.26296"
              style="stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;"
              width="2.15433"
              x="32.4567"
              y="82.2047"
            ></rect>
            <rect
              fill="none"
              fill-opacity="1"
              gorn="0.3.6"
              height="2.83465"
              id="connector3pin"
              stroke="none"
              stroke-dasharray="none"
              stroke-width="1.26296"
              style="stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;"
              width="2.15433"
              x="39.6567"
              y="82.2047"
            ></rect>
            <rect
              fill="none"
              fill-opacity="1"
              gorn="0.3.7"
              height="2.83465"
              id="connector4pin"
              stroke="none"
              stroke-dasharray="none"
              stroke-width="1.26296"
              style="stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;"
              width="2.15433"
              x="46.8567"
              y="82.2047"
            ></rect>
          </g>
        </g>

        <!-- pin targets -->
        <g class="pin-group">
          ${this.pinInfo.map((t) => p`<circle id="${"pt-" + this.id + "-" + t.name}" 
                            @click=${this._onPinClick} data-value="${JSON.stringify(t)}" 
                            class="pin-target" r="2px" cx=${t.x} cy=${t.y} ><title>${t.name}</title></circle>`)}
        </g>
      </svg>
    `;
  }
  /**
   * Performs a clockwise step rotation.
   *
   * @private
   * @method clockwiseStep
   * @memberof ClassName
   *
   * @return {void}
   */
  clockwiseStep() {
    this.angle = (this.angle - this.stepSize) % this.maxValue, this.dispatchEvent(new InputEvent("rotate-cw"));
  }
  /**
   * Performs a counter-clockwise step rotation.
   * @private
   * @method
   *
   * @returns {void}
   */
  counterClockwiseStep() {
    this.angle = (this.angle + this.stepSize + this.maxValue) % this.maxValue, this.dispatchEvent(new InputEvent("rotate-ccw"));
  }
  /**
   * Presses the button, dispatching a 'button-press' event if the button is not already pressed.
   *
   * @private
   * @memberOf Button
   * @function press
   *
   * @return {void}
   */
  press() {
    this.pressed || (this.dispatchEvent(new InputEvent("button-press")), this.pressed = !0);
  }
  /**
   * Releases the button if it is currently pressed.
   *
   * @private
   * @memberOf ClassName
   *
   * @return {void}
   */
  release() {
    this.pressed && (this.dispatchEvent(new InputEvent("button-release")), this.pressed = !1);
  }
  /**
   * Performs a counterclockwise arrow key press action repeatedly at a fixed interval.
   *
   * @private
   *
   * @return {void} Returns nothing.
   */
  counterclockwiseArrowPress() {
    this.arrowTimer = setInterval(() => {
      this.counterClockwiseStep();
    }, 300);
  }
  /**
   * Simulates a clockwise arrow press by continuously calling the `clockwiseStep` method at a set interval.
   *
   * @private
   * @returns {void}
   */
  clockwiseArrowPress() {
    this.arrowTimer = setInterval(() => {
      this.clockwiseStep();
    }, 300);
  }
  /**
   * Releases the arrow timer if it exists.
   *
   * @private
   * @return {void}
   */
  arrowRelease() {
    this.arrowTimer != null && (clearInterval(this.arrowTimer), this.arrowTimer = null);
  }
  /**
   * Handles the keydown event.
   *
   * @param {KeyboardEvent} e - The keydown event.
   * @private
   */
  keydown(t) {
    switch (t.key) {
      case "ArrowUp":
      case "ArrowRight":
        this.clockwiseStep(), t.preventDefault();
        break;
      case "ArrowDown":
      case "ArrowLeft":
        this.counterClockwiseStep(), t.preventDefault();
        break;
      case " ":
        this.press(), t.preventDefault();
        break;
    }
  }
  /**
   * Handles the keyup event.
   *
   * @param {KeyboardEvent} e - The keyboard event object.
   * @private
   */
  keyup(t) {
    switch (t.key) {
      case " ":
        t.preventDefault(), this.release();
        break;
    }
  }
};
I([
  o()
], P.prototype, "angle", 2);
I([
  o()
], P.prototype, "stepSize", 2);
I([
  o()
], P.prototype, "pressed", 2);
I([
  o()
], P.prototype, "minValue", 2);
I([
  o()
], P.prototype, "maxValue", 2);
I([
  o()
], P.prototype, "rotationTransform", 2);
I([
  o({ type: Boolean })
], P.prototype, "isActive", 2);
I([
  o({ type: Boolean })
], P.prototype, "isDragged", 2);
P = I([
  k("rotary-encoder")
], P);
const be = b({
  tagName: "rotary-encoder",
  elementClass: P,
  react: $,
  events: {
    rotateCw: "rotate-cw",
    rotateCCw: "rotate-ccw",
    onPininfoChange: "pininfo-change",
    onPinClicked: "pin-clicked"
  }
}), X0 = 3.78;
var ae = Object.defineProperty, oe = Object.getOwnPropertyDescriptor, E = (t, e, i, n) => {
  for (var s = n > 1 ? void 0 : n ? oe(e, i) : e, r = t.length - 1, a; r >= 0; r--)
    (a = t[r]) && (s = (n ? a(e, i, s) : a(s)) || s);
  return n && s && ae(e, i, s), s;
};
let u = class extends m {
  constructor() {
    super(...arguments), this.color = "red", this.offColor = "#444", this.background = "black", this.digits = 1, this.colon = !0, this.colonValue = !1, this.pins = "top", this.values = [0, 0, 0, 0, 0, 0, 0, 0], this.rotationTransform = 0, this.isActive = !1, this.isDragged = !1;
  }
  get pinInfo() {
    const t = (e) => {
      const { startX: i, cols: n, bottomY: s } = this.pinPositions, r = (e - 1) % n, a = 1 - Math.floor((e - 1) / n), c = i + 1.27 + (a ? r : n - r - 1) * 2.54, h = (this.pins === "top", a ? s + 1 : 1);
      return { number: e, x: c * X0, y: h * X0 };
    };
    switch (this.digits) {
      case 4:
        return this.pins === "side" ? [
          { name: "CLK", number: 4, x: 274, y: 45, signals: [], description: "Clock input pin" },
          { name: "DIO", number: 3, x: 274, y: 60, signals: [], description: "Data I/O pin" },
          { name: "VCC", number: 2, x: 274, y: 74, signals: [], description: "Power supply pin" },
          { name: "GND", number: 1, x: 274, y: 88, signals: [], description: "Ground pin" }
        ] : [
          { name: "A", ...t(13), signals: [], description: "Segment A" },
          { name: "B", ...t(9), signals: [], description: "Segment B" },
          { name: "C", ...t(4), signals: [], description: "Segment C" },
          { name: "D", ...t(2), signals: [], description: "Segment D" },
          { name: "E", ...t(1), signals: [], description: "Segment E" },
          { name: "F", ...t(12), signals: [], description: "Segment F" },
          { name: "G", ...t(5), signals: [], description: "Segment G" },
          {
            name: "DP",
            ...t(3),
            signals: [],
            description: "Decimal Point"
          },
          {
            name: "DIG1",
            ...t(14),
            signals: [],
            description: "Digit 1 Common"
          },
          {
            name: "DIG2",
            ...t(11),
            signals: [],
            description: "Digit 2 Common"
          },
          {
            name: "DIG3",
            ...t(10),
            signals: [],
            description: "Digit 3 Common"
          },
          {
            name: "DIG4",
            ...t(6),
            signals: [],
            description: "Digit 4 Common"
          },
          { name: "COM", ...t(7), signals: [], description: "Common pin" },
          { name: "CLN", ...t(8), signals: [], description: "Colon" }
        ];
      case 3:
        return [
          { name: "A", ...t(11), signals: [], description: "Segment A" },
          { name: "B", ...t(7), signals: [], description: "Segment B" },
          { name: "C", ...t(4), signals: [], description: "Segment C" },
          { name: "D", ...t(2), signals: [], description: "Segment D" },
          { name: "E", ...t(1), signals: [], description: "Segment E" },
          { name: "F", ...t(10), signals: [], description: "Segment F" },
          { name: "G", ...t(5), signals: [], description: "Segment G" },
          {
            name: "DP",
            ...t(3),
            signals: [],
            description: "Decimal Point"
          },
          {
            name: "DIG1",
            ...t(12),
            signals: [],
            description: "Digit 1 Common"
          },
          {
            name: "DIG2",
            ...t(9),
            signals: [],
            description: "Digit 2 Common"
          },
          {
            name: "DIG3",
            ...t(8),
            signals: [],
            description: "Digit 3 Common"
          }
        ];
      case 2:
        return [
          {
            name: "DIG1",
            ...t(8),
            signals: [],
            description: "Digit 1 Common"
          },
          {
            name: "DIG2",
            ...t(7),
            signals: [],
            description: "Digit 2 Common"
          },
          { name: "A", ...t(10), signals: [], description: "Segment A" },
          { name: "B", ...t(9), signals: [], description: "Segment B" },
          { name: "C", ...t(1), signals: [], description: "Segment C" },
          { name: "D", ...t(4), signals: [], description: "Segment D" },
          { name: "E", ...t(3), signals: [], description: "Segment E" },
          { name: "F", ...t(6), signals: [], description: "Segment F" },
          { name: "G", ...t(5), signals: [], description: "Segment G" },
          {
            name: "DP",
            ...t(2),
            signals: [],
            description: "Decimal Point"
          }
        ];
      case 1:
      default:
        return [
          { name: "COM.1", ...t(3), signals: [], description: "Common" },
          { name: "COM.2", ...t(8), signals: [], description: "Common" },
          { name: "A", ...t(7), signals: [], description: "Segment A" },
          { name: "B", ...t(6), signals: [], description: "Segment B" },
          { name: "C", ...t(4), signals: [], description: "Segment C" },
          { name: "D", ...t(2), signals: [], description: "Segment D" },
          { name: "E", ...t(1), signals: [], description: "Segment E" },
          { name: "F", ...t(9), signals: [], description: "Segment F" },
          { name: "G", ...t(10), signals: [], description: "Segment G" },
          {
            name: "DP",
            ...t(5),
            signals: [],
            description: "Decimal Point"
          }
        ];
    }
  }
  get rotatedPinInfo() {
    return this.pinInfo.map(
      (t) => A(t, this.rotationTransform)
    );
  }
  static get styles() {
    return [
      S,
      w`
        polygon {
          transform: scale(0.9);
          transform-origin: 50% 50%;
          transform-box: fill-box;
        }
      `
    ];
  }
  get pinPositions() {
    const { digits: t } = this, i = Math.ceil((t === 4 ? 14 : t === 3 ? 12 : 10) / 2);
    return {
      startX: (12.55 * t - i * 2.54) / 2,
      bottomY: this.pins === "extend" ? 21 : 18,
      cols: i
    };
  }
  get yOffset() {
    return this.pins === "extend" ? 2 : 0;
  }
  update(t) {
    (t.has("digits") || t.has("pins")) && this.dispatchEvent(new CustomEvent("pininfo-change")), super.update(t);
  }
  renderDigit(t, e) {
    const i = (n) => this.values[e + n] ? this.color : this.offColor;
    return p`
      <g transform="skewX(-8) translate(${t}, ${this.yOffset + 2.8 + 9}) scale(0.81)">
        <polygon points="2 0 8 0 9 1 8 2 2 2 1 1" fill="${i(0)}" />
        <polygon points="10 2 10 8 9 9 8 8 8 2 9 1" fill="${i(1)}" />
        <polygon points="10 10 10 16 9 17 8 16 8 10 9 9" fill="${i(2)}" />
        <polygon points="8 18 2 18 1 17 2 16 8 16 9 17" fill="${i(3)}" />
        <polygon points="0 16 0 10 1 9 2 10 2 16 1 17" fill="${i(4)}" />
        <polygon points="0 8 0 2 1 1 2 2 2 8 1 9" fill=${i(5)} />
        <polygon points="2 8 8 8 9 9 8 10 2 10 1 9" fill=${i(6)} />
      </g>
      <circle cx="${t + 7.2}" cy="${this.yOffset + 16 + 9}" r="0.89" fill="${i(7)}" />
    `;
  }
  renderColon() {
    const { yOffset: t } = this, e = 1.5 + 12.7 * Math.round(this.digits / 2) + 10, i = this.colonValue ? this.color : this.offColor;
    return p`
      <g transform="skewX(-8)"  fill="${i}">
        <circle cx="${e}" cy="${t + 6.75 + 8}" r="0.89" />
        <circle cx="${e}" cy="${t + 14.25 + 8}" r="0.89" />
      </g>
    `;
  }
  renderPins() {
    if (this.pins === "side")
      return p`<g transform="scale(0.81) translate(76, ${this.yOffset + 2.8 + 10})">
        <path d="M 0.919 14.006 L 0 14.925 L 0 17.755 L 0.919 18.675 L 3.75 18.675 L 4.668 17.755 L 4.668 14.925 L 3.75 14.006 L 0.919 14.006 Z" fill="#282828" fill-opacity="1" gorn="0.3.1.1" id="path979" stroke="none" stroke-dasharray="none" stroke-opacity="1" stroke-width="0.441442" style="stroke-linecap: round; stroke-linejoin: bevel; stroke-miterlimit: 4; transform-origin: 2.334px 16.3405px;" transform="matrix(0, -1, 1, 0, 0.000003814697, -9.53674e-7)"></path>
        <path d="M 0.92 9.338 L 0.001 10.256 L 0.001 13.087 L 0.92 14.006 L 3.75 14.006 L 4.669 13.087 L 4.669 10.256 L 3.75 9.338 L 0.92 9.338 Z" fill="#282828" fill-opacity="1" gorn="0.3.1.2" id="path981" stroke="none" stroke-dasharray="none" stroke-opacity="1" stroke-width="0.441442" style="stroke-linecap: round; stroke-linejoin: bevel; stroke-miterlimit: 4; transform-origin: 2.335px 11.672px;" transform="matrix(0, -1, 1, 0, -0.000005722046, 0)"></path>
        <path d="M 0.92 4.669 L 0.001 5.588 L 0.001 8.418 L 0.92 9.338 L 3.75 9.338 L 4.669 8.418 L 4.669 5.588 L 3.75 4.669 L 0.92 4.669 Z" fill="#282828" fill-opacity="1" gorn="0.3.1.3" id="path983" stroke="none" stroke-dasharray="none" stroke-opacity="1" stroke-width="0.441442" style="stroke-linecap: round; stroke-linejoin: bevel; stroke-miterlimit: 4; transform-origin: 2.335px 7.0035px;" transform="matrix(0, -1, 1, 0, -0.000004768372, -0.000001430511)"></path>
        <path d="M 0.92 0 L 0.001 0.919 L 0.001 3.749 L 0.92 4.668 L 3.75 4.668 L 4.669 3.749 L 4.669 0.919 L 3.75 0 L 0.92 0 Z" fill="#282828" fill-opacity="1" gorn="0.3.1.4" id="path985" stroke="none" stroke-dasharray="none" stroke-opacity="1" stroke-width="0.441442" style="stroke-linecap: round; stroke-linejoin: bevel; stroke-miterlimit: 4; transform-origin: 2.335px 2.334px;" transform="matrix(0, -1, 1, 0, -0.000001238426, -0.00000500679)"></path>
        <rect fill="#c8c8c8" fill-opacity="1" gorn="0.3.1.6" height="14.153" id="rect1030" rx="1.417" stroke="none" stroke-dasharray="none" stroke-opacity="1" stroke-width="0.566929" style="stroke-linecap: round; stroke-linejoin: bevel; stroke-miterlimit: 4; transform-origin: 5.2255px 9.3755px;" width="1.397" x="4.527" y="2.299" transform="matrix(0, -1, 1, 0, 3.486674964428, 7.001343727112)"></rect>
        <rect fill="#c8c8c8" fill-opacity="1" gorn="0.3.1.7" height="14.153" id="rect1032" rx="1.417" stroke="none" stroke-dasharray="none" stroke-opacity="1" stroke-width="0.566929" style="stroke-linecap: round; stroke-linejoin: bevel; stroke-miterlimit: 4; transform-origin: 9.8945px 9.3755px;" width="1.397" x="9.196" y="2.299" transform="matrix(0, -1, 1, 0, -1.182327091694, 2.332341194153)"></rect>
        <rect fill="#c8c8c8" fill-opacity="1" gorn="0.3.1.8" height="14.153" id="rect1034" rx="1.417" stroke="none" stroke-dasharray="none" stroke-opacity="1" stroke-width="0.566929" style="stroke-linecap: round; stroke-linejoin: bevel; stroke-miterlimit: 4; transform-origin: 14.5625px 9.3755px;" width="1.397" x="13.864" y="2.299" transform="matrix(0, -1, 1, 0, -5.850327074528, -2.335658073425)"></rect>
        <rect fill="#c8c8c8" fill-opacity="1" gorn="0.3.1.9" height="14.153" id="rect1036" rx="1.417" stroke="none" stroke-dasharray="none" stroke-opacity="1" stroke-width="0.566929" style="stroke-linecap: round; stroke-linejoin: bevel; stroke-miterlimit: 4; transform-origin: 19.2315px 9.3755px;" width="1.397" x="18.533" y="2.299" transform="matrix(0, -1, 1, 0, -10.51932913065, -7.00465965271)"></rect>
        <rect fill="#f2f2f2" fill-opacity="1" gorn="0.3.1.10" height="2.389" id="rect1038" rx="0.85" stroke="none" stroke-dasharray="none" stroke-opacity="1" stroke-width="0.223561" style="stroke-linecap: round; stroke-linejoin: bevel; stroke-miterlimit: 4; transform-origin: 19.212px 3.6045px;" width="1.286" x="18.569" y="2.41" transform="matrix(0, -1, 1, 0, -16.270828306675, -1.214159250259)"></rect>
        <rect fill="#f2f2f2" fill-opacity="1" gorn="0.3.1.11" height="2.389" id="rect1040" rx="0.85" stroke="none" stroke-dasharray="none" stroke-opacity="1" stroke-width="0.223561" style="stroke-linecap: round; stroke-linejoin: bevel; stroke-miterlimit: 4; transform-origin: 14.544px 3.6045px;" width="1.286" x="13.901" y="2.41" transform="matrix(0, -1, 1, 0, -11.602826178074, 3.453842878342)"></rect>
        <rect fill="#f2f2f2" fill-opacity="1" gorn="0.3.1.12" height="2.389" id="rect1042" rx="0.85" stroke="none" stroke-dasharray="none" stroke-opacity="1" stroke-width="0.223561" style="stroke-linecap: round; stroke-linejoin: bevel; stroke-miterlimit: 4; transform-origin: 9.876px 3.6045px;" width="1.286" x="9.233" y="2.41" transform="matrix(0, -1, 1, 0, -6.934826910496, 8.121841192245)"></rect>
        <rect fill="#f2f2f2" fill-opacity="1" gorn="0.3.1.13" height="2.389" id="rect1044" rx="0.85" stroke="none" stroke-dasharray="none" stroke-opacity="1" stroke-width="0.223561" style="stroke-linecap: round; stroke-linejoin: bevel; stroke-miterlimit: 4; transform-origin: 5.207px 3.6045px;" width="1.286" x="4.564" y="2.41" transform="matrix(0, -1, 1, 0, -2.265825092793, 12.790841341019)"></rect>
      </g>`;
    {
      const { cols: t, bottomY: e, startX: i } = this.pinPositions;
      return p`
      <g fill="url(#pin-pattern)" transform="translate(${i}, 0)">
        <rect height="2" width=${t * 2.54} ></rect>
        <rect height="2" width=${t * 2.54} transform="translate(0, ${e})" />
      </g>
    `;
    }
  }
  renderPinTargets() {
    return this.pins === "side" ? p`
        <g class="pin-group" transform="translate(-2, 0)">
          ${this.pinInfo.map((t) => p`<circle id="${"pt-" + this.id + "-" + t.name}" 
                                @click=${this._onPinClick} 
                                data-value="${JSON.stringify(t)}" 
                                class="pin-target" 
                                r="2px" 
                                cx=${t.x} 
                                cy=${t.y} ><title>${t.name}</title></circle>`)}
        </g>
    ` : p`
        <g class="pin-group" transform="translate(-2, 0)">
          ${this.pinInfo.map((t) => p`<circle id="${"pt-" + this.id + "-" + t.name}" 
                                @click=${this._onPinClick} 
                                data-value="${JSON.stringify(t)}" 
                                class="pin-target" 
                                r="2px" 
                                cx=${t.x} 
                                cy=${t.y} ><title>${t.name}</title></circle>`)}
        </g>
    `;
  }
  _onPinClick(t) {
    this.dispatchEvent(
      new CustomEvent("pin-clicked", {
        detail: {
          data: t.target.dataset.value,
          id: t.target.id,
          clientX: t.clientX,
          clientY: t.clientY
        }
      })
    );
  }
  render() {
    const { digits: t, colon: e, pins: i, yOffset: n } = this, s = 47.24 * t, r = s + 58, l = (i === "extend" ? 87 : 83.14) + 46, c = [], h = 32;
    for (let d = 0; d < t; d++)
      c.push(this.renderDigit(3.5 + d * 12.7 + 10, d * 8));
    return v`
      <svg
          width="${r + 60}px"
          height="${l}px"
          viewBox="0 0 ${r} ${l}"
          xmlns="http://www.w3.org/2000/svg"
          class="${this.isActive && !this.isDragged ? "active" : ""} component-svg"
      >
        <rect x="0" y="0" width="${r}" height="${l}" fill="#1c5481"/>
        <rect x="${h}" y="${h}" width="${s}" height="75.6"/>

        <circle cx="12" cy="12" r=6 fill="#fff" />
        <circle cx="${r - 10}" cy="12" r=6 fill="#fff" />
        <circle cx="12" cy="${l - 10}" r=6 fill="#fff" />
        <circle cx="${r - 10}" cy="${l - 10}" r=6 fill="#fff" />
        
        <g transform="scale(3.7)">
          <defs>
            <pattern
                id="pin-pattern"
                height="2"
                width="2.54"
                patternUnits="userSpaceOnUse"
            >
              ${i === "extend" ? p`<rect x="1.02" y="0" height="2" width="0.5" fill="#aaa" />` : p`<circle cx="1.27" cy="1" r=0.5 fill="#aaa" />`}
            </pattern>
          </defs>

          ${c}<!-- -->
          ${e ? this.renderColon() : null}<!-- -->
          ${i !== "none" ? this.renderPins() : null}
          
          <text style="fill: #fff; font-family:'Arial'; font-weight: lighter; font-size: 3.5px; white-space: pre;"
                x="21" y="33" transform="matrix(0.9999999999999999, 0, 0, 0.9999999999999999, 0, -1.4210854715202004e-14)">4-Digit Display</text>
        </g>


        <!-- PIN TARGETS -->
        ${this.renderPinTargets()}
      </svg>
    `;
  }
};
E([
  o()
], u.prototype, "color", 2);
E([
  o()
], u.prototype, "offColor", 2);
E([
  o()
], u.prototype, "background", 2);
E([
  o({ type: Number })
], u.prototype, "digits", 2);
E([
  o({ type: Boolean })
], u.prototype, "colon", 2);
E([
  o({ type: Boolean })
], u.prototype, "colonValue", 2);
E([
  o()
], u.prototype, "pins", 2);
E([
  o({ type: Array })
], u.prototype, "values", 2);
E([
  o()
], u.prototype, "rotationTransform", 2);
E([
  o({ type: Boolean })
], u.prototype, "isActive", 2);
E([
  o({ type: Boolean })
], u.prototype, "isDragged", 2);
u = E([
  k("seven-segment-display")
], u);
const Ce = b({
  tagName: "seven-segment-display",
  elementClass: u,
  react: $,
  events: {
    onPininfoChange: "pininfo-change",
    onPinClicked: "pin-clicked"
  }
});
var le = Object.defineProperty, ce = Object.getOwnPropertyDescriptor, K = (t, e, i, n) => {
  for (var s = n > 1 ? void 0 : n ? ce(e, i) : e, r = t.length - 1, a; r >= 0; r--)
    (a = t[r]) && (s = (n ? a(e, i, s) : a(s)) || s);
  return n && s && le(e, i, s), s;
};
let T = class extends m {
  constructor() {
    super(...arguments), this.pins = !1, this.flipVertical = !1, this.brightness = 1, this.lightColor = null, this.rotationTransform = 0, this.isActive = !1, this.screenWidth = 252, this.screenHeight = 135;
  }
  get pinInfo() {
    return [
      {
        name: "VCC",
        x: 74,
        y: 11,
        signals: [{ type: "power", signal: "VCC" }]
      },
      {
        name: "GND",
        x: 92,
        y: 11,
        signals: [{ type: "power", signal: "GND" }]
      },
      {
        name: "SCK",
        x: 110,
        y: 11,
        signals: [s0("SCK")]
      },
      {
        name: "SDA",
        x: 128,
        y: 11,
        signals: [i0("SDA")]
      }
    ];
  }
  get rotatedPinInfo() {
    return this.pinInfo.map(
      (t) => A(t, this.rotationTransform)
    );
  }
  static get styles() {
    return [
      S,
      w`
        .container {
          position: relative;
        }

        .container > canvas {
          position: absolute;
        }

        .defaultText {
          //transform: rotate(270deg);
          fill: #fff;
          font-size: 4px;
          text-anchor: end;
          font-family: monospace;
        }

        .mounting {
          display: inline;
          fill: #ffffff;
          stroke: #cccccc;
          stroke-width: 2.38122;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-dasharray: none;
          stroke-opacity: 1;
        }
      `
    ];
  }
  firstUpdated() {
    this.dispatchEvent(new CustomEvent("canvas-ready"));
  }
  update(t) {
    t.has("flip") && this.dispatchEvent(new CustomEvent("pininfo-change")), t.has("rotationTransform") && this.dispatchEvent(
      new CustomEvent("pininfo-change", { detail: this.rotatedPinInfo })
    ), super.update(t);
  }
  renderPins() {
    return p`
      <g fill="url(#pin-pattern)" transform="translate(35, 5)">
        <rect height="2" width="40" />
      </g>
    `;
  }
  _onPinClick(t) {
    this.dispatchEvent(
      new CustomEvent("pin-clicked", {
        detail: {
          data: t.target.dataset.value,
          id: t.target.id,
          clientX: t.clientX,
          clientY: t.clientY
        }
      })
    );
  }
  render() {
    const { screenWidth: t, screenHeight: e, flipVertical: i } = this, n = i ? "left:64px;top:21px;" : "left:20px;top:64px;";
    return v`
      <div class="${this.isActive ? "active" : ""} container">
        <svg
          width="200"
          height="200"
          class="component-svg"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g transform="scale(1.8)">
            <defs>
              <pattern
                id="pin-pattern"
                height="2"
                width="10"
                patternUnits="userSpaceOnUse"
              >
                ${p`<circle cx="1.27" cy="1" r=1 fill="#aaa" transform="translate(4.4, 0)" />`}
              </pattern>
            </defs>
            <g id="g14">
              <path
                id="path4"
                style="display:inline;opacity:1;fill:#2c6488;fill-opacity:1;stroke:none;stroke-width:6.472;stroke-linecap:butt;stroke-linejoin:miter;stroke-dasharray:none;stroke-opacity:1"
                d="m 39.644609,108.18306 v 110.60927 h 24.787117 c -0.02513,-0.14347 0.04474,-0.29341 0.208256,-0.39067 -0.01351,-0.74557 -0.04973,-3.33542 0.178801,-5.84926 0.263486,-2.89841 3.86488,-2.45928 3.86488,-2.45928 h 52.698077 c 2.98624,0 2.81068,2.81016 2.81068,2.81016 l 0.0837,5.77484 c 0.0501,0.0335 0.0903,0.072 0.1204,0.11421 h 25.8563 V 108.18306 Z m 61.212801,110.60927 c 0.0276,0.001 0.0551,0.002 0.0827,0.003 -1.8e-4,-0.001 -3.4e-4,-0.002 -5.1e-4,-0.003 z"
                transform="translate(-39.644608,-108.18306)"
              />
              <circle
                class="mounting"
                id="path1"
                cx="47.171043"
                cy="116.18284"
                r="5.8093867"
                transform="translate(-39.644608,-108.18306)"
              />
              <circle
                class="mounting"
                id="path1-8"
                cx="142.44882"
                cy="116.31425"
                r="5.8093867"
                transform="translate(-39.644608,-108.18306)"
              />
              <circle
                class="mounting"
                id="path1-7"
                cx="46.984741"
                cy="210.81032"
                r="5.8093867"
                transform="translate(-39.644608,-108.18306)"
              />
              <circle
                class="mounting"
                id="path1-8-4"
                cx="142.26253"
                cy="210.94173"
                r="5.8093867"
                transform="translate(-39.644608,-108.18306)"
              />
              <path
                id="path14"
                style="opacity:1;fill:#000000;fill-opacity:1;stroke:none;stroke-width:5.72149;stroke-linecap:butt;stroke-linejoin:miter;stroke-dasharray:none;stroke-opacity:1"
                d="m 28.240095,85.185747 c 0,0 0.564602,-3.655604 -4.351454,-3.655604 -4.916056,0 62.249206,0.04908 62.249206,0.04908 0,0 -4.161622,0.32441 -4.375363,3.665282 -0.213743,3.340871 -53.522389,-0.05876 -53.522389,-0.05876 z m -0.164479,-3.066 53.7874,-0.206443 v 21.381576 l -53.7874,0.20645 z"
              />
              <rect
                style="display:inline;opacity:1;fill:#000000;fill-opacity:0.890196;stroke:#232323;stroke-width:6.40877;stroke-linecap:butt;stroke-linejoin:miter;stroke-dasharray:none;stroke-opacity:1"
                id="rect4"
                width="102"
                height="58"
                x="3.9252076"
                y="20.676497"
              />
              <rect
                style="opacity:0.6;fill:#000000;fill-opacity:1;stroke:none;stroke-width:6.472;stroke-linecap:butt;stroke-linejoin:miter;stroke-dasharray:none;stroke-opacity:1"
                id="rect6"
                width="41.346756"
                height="7.6294613"
                x="34.927223"
                y="2.5302274"
              />
              ${this.renderPins()}

              <text
                x="44.6"
                y="14"
                id="defaultText"
                fill="#fff"
                class="defaultText"
              >
                GND
              </text>
              <text
                x="54.2"
                y="14"
                id="defaultText"
                fill="#fff"
                class="defaultText"
              >
                VCC
              </text>
              <text
                x="64.6"
                y="14"
                id="defaultText"
                fill="#fff"
                class="defaultText"
              >
                SCL
              </text>
              <text
                x="74.6"
                y="14"
                id="defaultText"
                fill="#fff"
                class="defaultText"
              >
                SDA
              </text>
            </g>
          </g>

          <g class="pin-group">
            ${this.pinInfo.map((s) => p`<circle @click=${this._onPinClick} 
                                id="${"pt-" + this.id + "-" + s.name}" 
                                data-value="${JSON.stringify(s)}" 
                                class="pin-target" 
                                r="2px"
                                cx=${s.x} cy=${s.y} ><title>${s.name}</title>
                        </circle>`)}
          </g>
        </svg>

        <canvas
          height="${this.flipVertical ? t : e}"
          width="${this.flipVertical ? e : t}"
          style=${n}
        ></canvas>
      </div>
    `;
  }
};
K([
  o()
], T.prototype, "pins", 2);
K([
  o()
], T.prototype, "flipVertical", 2);
K([
  o()
], T.prototype, "brightness", 2);
K([
  o()
], T.prototype, "lightColor", 2);
K([
  o()
], T.prototype, "rotationTransform", 2);
K([
  o()
], T.prototype, "isActive", 2);
T = K([
  k("oled-display-component")
], T);
const _e = b({
  tagName: "oled-display-component",
  elementClass: T,
  react: $,
  events: {
    onPininfoChange: "pininfo-change",
    onPinClicked: "pin-clicked"
  }
});
var he = Object.defineProperty, pe = Object.getOwnPropertyDescriptor, L = (t, e, i, n) => {
  for (var s = n > 1 ? void 0 : n ? pe(e, i) : e, r = t.length - 1, a; r >= 0; r--)
    (a = t[r]) && (s = (n ? a(e, i, s) : a(s)) || s);
  return n && s && he(e, i, s), s;
};
let D = class extends m {
  constructor() {
    super(...arguments), this.ledRed = 0, this.ledGreen = 0, this.ledBlue = 0, this.rotationTransform = 0, this.isActive = !1, this.isDragged = !1, this.flip = !1, this.pinInfo = [
      { name: "R", x: -12, y: 31, signals: [] },
      { name: "COM", x: -1.5, y: 38, signals: [] },
      { name: "G", x: 7.2, y: 31, signals: [] },
      { name: "B", x: 17, y: 31, signals: [] }
    ];
  }
  get rotatedPinInfo() {
    return this.pinInfo.map(
      (t) => A(t, this.rotationTransform)
    );
  }
  static get styles() {
    return [S, w``];
  }
  _onPinClick(t) {
    this.dispatchEvent(
      new CustomEvent("pin-clicked", {
        detail: {
          data: t.target.dataset.value,
          id: t.target.id,
          clientX: t.clientX,
          clientY: t.clientY
        }
      })
    );
  }
  update(t) {
    t.has("flip") && this.dispatchEvent(
      new CustomEvent("pininfo-change", { detail: this.pinInfo })
    ), t.has("rotationTransform") && this.dispatchEvent(
      new CustomEvent("pininfo-change", { detail: this.rotatedPinInfo })
    ), super.update(t);
  }
  render() {
    const { ledRed: t, ledGreen: e, ledBlue: i } = this, n = Math.max(t, e, i), s = n ? 0.2 + n * 0.6 : 0, r = this.flip ? -1.2 : 1.2;
    return v`
      <svg
        width="54.7677"
        height="73"
        class="${this.isActive && !this.isDragged ? "active" : ""} component-svg"
        viewBox="-25 -20 54.7677 73"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g transform="scale(${r} 1.2) translate(${this.flip ? -15 : 0} 0)">
          <!-- LED Legs -->
          <g
            fill="none"
            stroke="#9D9999"
            stroke-linecap="round"
            stroke-width="1.5px"
          >
            <path d="m4.1 15.334 3.0611 9.971" />
            <path
              d="m8 14.4 5.9987 4.0518 1.1777 6.5679"
              stroke-linejoin="round"
            />
            <path
              d="m-4.3 14.184-5.0755 5.6592-0.10206 6.1694"
              stroke-linejoin="round"
            />
            <path d="m-1.1 15.607-0.33725 18.4" />
          </g>

          <!-- LED Body -->
          <path
            d="m8.3435 5.65v-5.9126c0-3.9132-3.168-7.0884-7.0855-7.0884-3.9125 0-7.0877 3.1694-7.0877 7.0884v13.649c1.4738 1.651 4.0968 2.7526 7.0877 2.7526 4.6195 0 8.3686-2.6179 8.3686-5.8594v-1.5235c-7.4e-4 -1.1426-0.47444-2.2039-1.283-3.1061z"
            opacity=".3"
          />
          <path
            d="m8.3435 5.65v-5.9126c0-3.9132-3.168-7.0884-7.0855-7.0884-3.9125 0-7.0877 3.1694-7.0877 7.0884v13.649c1.4738 1.651 4.0968 2.7526 7.0877 2.7526 4.6195 0 8.3686-2.6179 8.3686-5.8594v-1.5235c-7.4e-4 -1.1426-0.47444-2.2039-1.283-3.1061z"
            fill="#e6e6e6"
            opacity=".5"
          />
          <path
            d="m8.3435 5.65v3.1054c0 2.7389-3.1658 4.9651-7.0855 4.9651-3.9125 2e-5 -7.0877-2.219-7.0877-4.9651v4.6296c1.4738 1.6517 4.0968 2.7526 7.0877 2.7526 4.6195 0 8.3686-2.6179 8.3686-5.8586l-4e-5 -1.5235c-7e-4 -1.1419-0.4744-2.2032-1.283-3.1054z"
            fill="#d1d1d1"
            opacity=".9"
          />
          <g transform="translate(-5.8295 -7.351)">
            <path
              d="m14.173 13.001v3.1054c0 2.7389-3.1658 4.9651-7.0855 4.9651-3.9125 2e-5 -7.0877-2.219-7.0877-4.9651v4.6296c1.4738 1.6517 4.0968 2.7526 7.0877 2.7526 4.6195 0 8.3686-2.6179 8.3686-5.8586l-4e-5 -1.5235c-7e-4 -1.1419-0.4744-2.2032-1.283-3.1054z"
              opacity=".7"
            />
            <path
              d="m14.173 13.001v3.1054c0 2.7389-3.1658 4.9651-7.0855 4.9651-3.9125 2e-5 -7.0877-2.219-7.0877-4.9651v3.1054c1.4738 1.6502 4.0968 2.7526 7.0877 2.7526 4.6195 0 8.3686-2.6179 8.3686-5.8586-7.4e-4 -1.1412-0.47444-2.2025-1.283-3.1047z"
              opacity=".25"
            />
            <ellipse
              cx="7.0877"
              cy="16.106"
              rx="7.087"
              ry="4.9608"
              opacity=".25"
            />
          </g>
          <polygon
            transform="translate(-5.8295 -7.351)"
            points="3.1961 13.095 6.0156 13.095 10.012 8.8049 3.407 8.8049 2.2032 9.648 2.2032 16.107 3.1961 16.107"
            fill="#666"
          />
          <polygon
            transform="translate(-5.8295 -7.351)"
            points="11.06 13.095 11.06 16.107 11.974 16.107 11.974 8.5241 10.778 8.5241 11.215 9.0338 7.4117 13.095"
            fill="#666"
          />
          <path
            d="m8.3435 5.65v-5.9126c0-3.9132-3.168-7.0884-7.0855-7.0884-3.9125 0-7.0877 3.1694-7.0877 7.0884v13.649c1.4738 1.651 4.0968 2.7526 7.0877 2.7526 4.6195 0 8.3686-2.6179 8.3686-5.8594v-1.5235c-7.4e-4 -1.1426-0.47444-2.2039-1.283-3.1061z"
            fill="white"
            opacity=".65"
          />
          <g transform="translate(-5.8295 -7.351)" fill="#fff">
            <path
              d="m10.388 3.7541 1.4364-0.2736c-0.84168-1.1318-2.0822-1.9577-3.5417-2.2385l0.25416 1.0807c0.76388 0.27072 1.4068 0.78048 1.8511 1.4314z"
              opacity=".5"
            />
            <path
              d="m0.76824 19.926v1.5199c0.64872 0.5292 1.4335 0.97632 2.3076 1.3169v-1.525c-0.8784-0.33624-1.6567-0.78194-2.3076-1.3118z"
              opacity=".5"
            />
            <path
              d="m11.073 20.21c-0.2556 0.1224-0.52992 0.22968-0.80568 0.32976-0.05832 0.01944-0.11736 0.04032-0.17784 0.05832-0.56376 0.17928-1.1614 0.31896-1.795 0.39456-0.07488 0.0094-0.1512 0.01872-0.22464 0.01944-0.3204 0.03024-0.64368 0.05832-0.97056 0.05832-0.14832 0-0.30744-0.01512-0.4716-0.02376-1.2002-0.05688-2.3306-0.31464-3.2976-0.73944l-2e-5 -8.3895v-4.8254c0-1.471 0.84816-2.7295 2.0736-3.3494l-0.02232-0.05328-1.2478-1.512c-1.6697 1.003-2.79 2.8224-2.79 4.9118v11.905c-0.04968-0.04968-0.30816-0.30888-0.48024-0.52992l-0.30744 0.6876c1.4011 1.4818 3.8088 2.4617 6.5426 2.4617 1.6798 0 3.2371-0.37368 4.5115-1.0022l-0.52704-0.40896-0.01006 0.0072z"
              opacity=".5"
            />
          </g>

          <filter id="ledFilter" x="-0.8" y="-0.8" height="5.2" width="5.8">
            <feGaussianBlur stdDeviation="4" />
          </filter>
          <filter id="ledFilterRed" x="-0.8" y="-0.8" height="5.2" width="5.8">
            <feGaussianBlur stdDeviation="${t * 3}" />
          </filter>
          <filter
            id="ledFilterGreen"
            x="-0.8"
            y="-0.8"
            height="5.2"
            width="5.8"
          >
            <feGaussianBlur stdDeviation="${e * 3}" />
          </filter>
          <filter id="ledFilterBlue" x="-0.8" y="-0.8" height="5.2" width="5.8">
            <feGaussianBlur stdDeviation="${i * 3}" />
          </filter>

          <circle
            cx="1.7"
            cy="3"
            r="${t * 5 + 2}"
            fill="rgb(255, 0, 0)"
            opacity="${Math.min(t * 20, 0.3)}"
            filter="url(#ledFilterRed)"
          />
          <circle
            cx="2.7"
            cy="5"
            r="${e * 5 + 2}"
            fill="rgb(0, 255, 0)"
            opacity="${Math.min(e * 20, 0.3)}"
            filter="url(#ledFilterGreen)"
          />
          <circle
            cx="0.7"
            cy="5"
            r="${i * 5 + 2}"
            fill="rgb(1,85,253)"
            opacity="${Math.min(i * 20, 0.3)}"
            filter="url(#ledFilterBlue)"
          />

          <circle
            cx="1.7"
            cy="4"
            r="10"
            fill="rgb(${t * 255}, ${e * 255 + i * 90}, ${i * 255})"
            filter="url(#ledFilter)"
            opacity="${s}"
          />

          <!-- Grey hollow around the LED -->
          <circle
            cx="1.7"
            cy="4"
            r="13"
            stroke="#666"
            stroke-width="1"
            fill="none"
            filter="url(#ledFilter)"
            opacity="${s}"
          />
        </g>

        <g class="pin-group">
          ${this.pinInfo.map((a) => p`<circle id="${"pt-" + this.id + "-" + a.name}" 
@click=${this._onPinClick} data-value="${JSON.stringify(a)}" class="pin-target" r="2px" cx=${a.x} cy=${a.y} ><title>${a.name}</title></circle>`)}
        </g>
      </svg>
    `;
  }
};
L([
  o()
], D.prototype, "ledRed", 2);
L([
  o()
], D.prototype, "ledGreen", 2);
L([
  o()
], D.prototype, "ledBlue", 2);
L([
  o()
], D.prototype, "rotationTransform", 2);
L([
  o({ type: Boolean })
], D.prototype, "isActive", 2);
L([
  o({ type: Boolean })
], D.prototype, "isDragged", 2);
L([
  o({ type: Boolean })
], D.prototype, "flip", 2);
D = L([
  k("rgb-led-component")
], D);
const Se = b({
  tagName: "rgb-led-component",
  elementClass: D,
  react: $,
  events: {
    onPininfoChange: "pininfo-change",
    onPinClicked: "pin-clicked"
  }
});
export {
  Q as BreadboardMini,
  G as BuzzerElement,
  F as CustomKeypadComponent,
  H as DipSwitch3Component,
  Ct as GND,
  x as HeroBoardElement,
  _ as LEDElement,
  V as MembraneKeypadComponent,
  T as OLEDDisplayComponent,
  t0 as PhotoresistorComponent,
  D as RGBLedComponent,
  ke as ReactBreadboardMini,
  ye as ReactBuzzerComponent,
  me as ReactCustomKeypadComponent,
  xe as ReactDipSwitch3Component,
  fe as ReactHeroBoardElement,
  ve as ReactLEDElement,
  ue as ReactMembraneKeypadComponent,
  _e as ReactOLEDDisplay,
  $e as ReactPhotoresistor,
  Se as ReactRGBLEDComponent,
  we as ReactResistorComponent,
  be as ReactRotaryEncoder,
  Ce as ReactSevenSegmentComponent,
  X as ResistorComponent,
  P as RotaryEncoderComponent,
  u as SevenSegmentComponent,
  _t as VCC,
  R as analog,
  i0 as i2c,
  s0 as spi,
  q0 as usart
};
