import { css as M, property as p, state as _, query as $t, customElement as Q, nothing as d, repeat as oe, html as s } from "@umbraco-cms/backoffice/external/lit";
import { UmbTextStyles as Tt } from "@umbraco-cms/backoffice/style";
import { UmbLitElement as ee } from "@umbraco-cms/backoffice/lit-element";
import { umbConfirmModal as Tr } from "@umbraco-cms/backoffice/modal";
import { UMB_VARIANT_CONTEXT as Ds } from "@umbraco-cms/backoffice/variant";
import { UMB_AUTH_CONTEXT as Ps } from "@umbraco-cms/backoffice/auth";
import { C as Zi, B as xr, b as Ar, c as Os, S as Ls, D as xt, d as _e, e as ce, f as Dr, g as Pr, h as De, N as At, i as Ye, U as qe, j as Dt, A as ks, R as Is, P as Pe, k as Or, l as Ns, m as Rs, n as Bs, E as Ms, o as Fs, p as Lr, q as mi, r as zs, s as Qi, t as kr, u as Vs, v as Us, w as Gs, x as Hs, y as Ks, z as Ys, G as Ir, H as Pt, I as Nr, J as Rr, K as Br, L as Me, M as qs, O as Mr, Q as Ws, T as js, V as Xs, W as er, X as tr, Y as Wt, Z as Js, _ as Zs, $ as Qs, a0 as el, a1 as tl, a2 as il, a3 as Ot, a4 as ir, a5 as rl, a6 as ol, a7 as al, a8 as nl, a9 as sl, aa as ll, ab as cl, ac as ul, ad as pl, ae as dl, af as hl, ag as fl, ah as _l, ai as ml, aj as yl, ak as vl, al as gl, am as bl, an as Cl, ao as Sl, ap as wl, aq as El, ar as $l, as as Tl, at as xl, au as rr, av as Al, aw as Dl, ax as jt, ay as Pl, az as Ol, aA as Ll, aB as kl, aC as Fr, aD as Il, aE as Nl } from "./bundle.manifests-BYeq-CGR.js";
import { debounce as yi } from "@umbraco-cms/backoffice/utils";
import { UMB_EDIT_DOCUMENT_WORKSPACE_PATH_PATTERN as Rl } from "@umbraco-cms/backoffice/document";
import { UMB_NOTIFICATION_CONTEXT as or } from "@umbraco-cms/backoffice/notification";
import { umbHttpClient as Ht } from "@umbraco-cms/backoffice/http-client";
function be() {
  return {
    id: crypto.randomUUID(),
    contentTypeAlias: "",
    propertyAlias: "",
    filterOperator: "",
    propertyValue: "",
    fromDate: "",
    toDate: ""
  };
}
const zr = {
  system: Ls,
  contentType: Zi,
  composition: Os,
  blockGrid: Ar,
  blockList: xr,
  general: Zi
}, Vr = {
  system: De,
  contentType: Pr,
  composition: Dr,
  blockGrid: ce,
  blockList: _e,
  general: xt
};
function ar(e) {
  return e?.localeCompare("Umbraco.BlockList", void 0, {
    sensitivity: "accent"
  }) === 0;
}
function vi(e) {
  switch (e) {
    case De:
      return "system";
    case Dr:
      return "composition";
    case ce:
      return "blockGrid";
    case _e:
      return "blockList";
    case Pr:
      return "contentType";
    default:
      return "general";
  }
}
function Ur(e) {
  if (e.isContainer)
    return ar(e.containerEditorAlias) ? "blockList" : "blockGrid";
  if (e.containerAlias)
    return e.sourceCategory === "BlockList" || ar(e.containerEditorAlias) ? "blockList" : "blockGrid";
  switch (e.sourceCategory) {
    case "System":
      return "system";
    case "Composition":
      return "composition";
    case "ContentType":
      return "contentType";
    case "BlockGrid":
      return "blockGrid";
    case "BlockList":
      return "blockList";
    default:
      return vi(
        e.groupName?.trim() || xt
      );
  }
}
function gi(e) {
  return zr[Ur(e)];
}
function Bl(e) {
  return zr[vi(e)];
}
function Ml(e) {
  return Vr[Ur(e)];
}
function Fl(e) {
  return Vr[vi(e)];
}
function G(e) {
  const t = e.trim();
  return !t || t.localeCompare(ks, void 0, {
    sensitivity: "accent"
  }) === 0 ? !0 : Is.some(
    (i) => i.localeCompare(t, void 0, {
      sensitivity: "accent"
    }) === 0
  );
}
function zl(e) {
  return e.filter((t) => !G(t));
}
function We(e) {
  return e.filter(
    (t) => !G(t.alias)
  );
}
function bi(e) {
  if (!e)
    return "";
  const t = e.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2").replace(/[-_]/g, " ");
  return t.charAt(0).toUpperCase() + t.slice(1);
}
function Xt(e, t) {
  return e ? t.find(
    (r) => r.alias.localeCompare(e, void 0, {
      sensitivity: "accent"
    }) === 0
  )?.name ?? bi(e) : "";
}
function Gr(e) {
  return e.name.localeCompare(e.alias, void 0, {
    sensitivity: "accent"
  }) !== 0 && e.name.localeCompare(
    bi(e.alias),
    void 0,
    { sensitivity: "accent" }
  ) !== 0;
}
function Vl(e) {
  return Gr(e) ? `${e.name} (${e.alias})` : e.name;
}
function Ul(e, t) {
  const i = t.trim().toLowerCase();
  return i ? e.name.toLowerCase().includes(i) || e.alias.toLowerCase().includes(i) : !0;
}
function ut(e) {
  const t = e.trim();
  return Ms.some(
    (i) => i.localeCompare(t, void 0, { sensitivity: "accent" }) === 0
  );
}
function U(e) {
  return e === "EntireSite";
}
function je(e) {
  const t = We(e);
  return [
    {
      alias: At,
      name: "Node Name",
      filterType: "Text",
      groupName: De,
      groupSortOrder: Number.MAX_SAFE_INTEGER,
      sortOrder: 0,
      sourceCategory: "System"
    },
    {
      alias: Ye,
      name: "Create Date",
      filterType: "Date",
      groupName: De,
      groupSortOrder: Number.MAX_SAFE_INTEGER,
      sortOrder: 1,
      sourceCategory: "System"
    },
    {
      alias: qe,
      name: "Update Date",
      filterType: "Date",
      groupName: De,
      groupSortOrder: Number.MAX_SAFE_INTEGER,
      sortOrder: 2,
      sourceCategory: "System"
    },
    {
      alias: Dt,
      name: "Content Type Alias",
      filterType: "Dropdown",
      groupName: De,
      groupSortOrder: Number.MAX_SAFE_INTEGER,
      sortOrder: 3,
      sourceCategory: "System",
      options: t.map((i) => ({
        label: i.name,
        value: i.alias
      }))
    }
  ];
}
function Le(e, t, i, r, o) {
  if (i)
    return U(r) ? je(o).find(
      (a) => a.alias === i
    ) : Kr(
      e,
      t,
      i
    );
}
function Hr(e) {
  return e === Ye || e === qe;
}
function ue(e, t) {
  return Hr(t);
}
function Ci(e, t) {
  return e?.filterType === "Date" || Hr(t);
}
function Kr(e, t, i) {
  if (!(!t || !i))
    return e[t]?.find(
      (r) => r.alias === i
    );
}
const Gl = [
  { label: "True", value: "1" },
  { label: "False", value: "0" }
];
function Yr(e) {
  return e?.editorAlias?.localeCompare("Umbraco.TrueFalse", void 0, {
    sensitivity: "accent"
  }) === 0;
}
function re(e) {
  return Yr(e) ? "Dropdown" : e?.filterType ?? "Text";
}
function Hl(e, t) {
  return Xe(e) ? [...Or, "IsEmpty", "IsNotEmpty"] : ke(e) ? ["IsEmpty", "IsNotEmpty"] : ue(e, t) ? Ns : e?.filterType === "Date" ? [
    "Equals",
    "NotEquals",
    "GreaterThan",
    "GreaterThanOrEqual",
    "LessThan",
    "LessThanOrEqual",
    "IsEmpty",
    "IsNotEmpty"
  ] : e?.filterType === "Number" ? Rs : e?.filterType === "Dropdown" || e?.filterType === "MultiSelect" ? ["Equals", "NotEquals", "IsEmpty", "IsNotEmpty"] : Bs;
}
function qr(e, t) {
  return t === "Number" ? !1 : e === "Contains" || e === "StartsWith" || e === "EndsWith";
}
function Kl(e, t, i) {
  return !t || !i || Ci(e, t) ? !1 : i !== "IsEmpty" && i !== "IsNotEmpty";
}
function Yl(e) {
  return e.replace(/([A-Z])/g, " $1").replace(/^./, (t) => t.toUpperCase()).trim();
}
function J(e) {
  return e?.isFilterable !== !1;
}
function ql(e, t, i = "") {
  if (!t)
    return e;
  const r = i.trim();
  return e.filter((o) => J(o) ? !0 : r ? o.alias.localeCompare(r, void 0, {
    sensitivity: "accent"
  }) === 0 : !1);
}
function Wl(e, t, i = "") {
  const r = ql(
    e,
    t,
    i
  );
  if (!t)
    return r;
  const o = new Set(r.map((n) => n.alias)), a = e.filter(
    (n) => we(n) && !o.has(n.alias)
  );
  return a.length === 0 ? r : [...r, ...a];
}
function ke(e) {
  return e?.isContainer === !0;
}
function Xe(e) {
  return !e || !ke(e) ? !1 : e.sourceCategory === "BlockGrid" ? !0 : e.editorAlias?.localeCompare("Umbraco.BlockGrid", void 0, {
    sensitivity: "accent"
  }) === 0 || e.containerEditorAlias?.localeCompare("Umbraco.BlockGrid", void 0, {
    sensitivity: "accent"
  }) === 0;
}
function ve(e) {
  return !!(e?.containerAlias && !e.isContainer);
}
function we(e) {
  return !e || !ve(e) ? !1 : e.sourceCategory === "BlockGrid" ? !0 : e.containerEditorAlias?.localeCompare("Umbraco.BlockGrid", void 0, {
    sensitivity: "accent"
  }) === 0;
}
function Fe(e) {
  if (ve(e))
    return J(e) ? "indexed" : "notIndexed";
}
function B(e) {
  return e.name || e.alias;
}
function Ie(e) {
  const t = e.displayPath;
  if (t && t.length > 0)
    return t[t.length - 1] ?? B(e);
  const i = B(e);
  if (i.includes(Pe)) {
    const r = i.split(Pe);
    return r[r.length - 1]?.trim() || i;
  }
  return i;
}
function jl(e) {
  const t = Se(e), i = [];
  return e.containerName?.trim() && i.push(e.containerName.trim()), e.elementTypeName?.trim() && i.push(e.elementTypeName.trim()), {
    prefix: i.join(Fs),
    leaf: t
  };
}
function Wr(e) {
  const t = e.containerProperty ? B(e.containerProperty) : void 0;
  if (t)
    return t;
  const i = e.containerEditorLabel;
  return i && !e.containerName.includes(`(${i})`) ? `${e.containerName} (${i})` : e.containerName;
}
function jr(e) {
  return e.containerProperty ? gi(e.containerProperty) : e.containerEditorLabel === ce ? Ar : e.containerEditorLabel === _e ? xr : "icon-folder";
}
function ze(e) {
  return e.elementTypes.reduce(
    (t, i) => t + i.properties.length,
    0
  );
}
function nr(e) {
  if (e.containerEditorAlias) {
    if (e.containerEditorAlias.localeCompare("Umbraco.BlockGrid", void 0, {
      sensitivity: "accent"
    }) === 0)
      return ce;
    if (e.containerEditorAlias.localeCompare("Umbraco.BlockList", void 0, {
      sensitivity: "accent"
    }) === 0)
      return _e;
  }
}
function Se(e) {
  const t = e.displayPath;
  return t && t.length > 0 ? t[t.length - 1] ?? B(e) : Ie(e);
}
function me(e) {
  if (e.isContainer)
    return Se(e);
  if (ve(e)) {
    const t = Se(e), i = e.elementTypeName?.trim();
    if (i)
      return `${i}${Pe}${t}`;
  }
  return Se(e);
}
function Xr(e) {
  if (ve(e)) {
    const i = e.containerName?.trim();
    if (i)
      return i;
  }
  if (e.sourceCategory === "Composition") {
    const i = e.sourceName?.trim();
    if (i)
      return i;
  }
  const t = Lt(e);
  if (t !== xt)
    return t;
}
function Xl(e) {
  const t = Xr(e);
  if (!t)
    return !1;
  const i = me(e);
  return i.localeCompare(t, void 0, { sensitivity: "accent" }) !== 0 && !i.toLowerCase().includes(t.toLowerCase());
}
function Si(e) {
  return B(e).localeCompare(e.alias, void 0, {
    sensitivity: "accent"
  }) !== 0;
}
function Jl(e, t) {
  const i = t.trim().toLowerCase();
  if (!i)
    return !0;
  const r = B(e).toLowerCase(), o = e.alias.toLowerCase(), a = Lt(e).toLowerCase(), n = e.sourceName?.toLowerCase() ?? "", l = e.containerName?.toLowerCase() ?? "", v = e.elementTypeName?.toLowerCase() ?? "", g = (e.displayPath ?? []).join(" ").toLowerCase(), x = Ie(e).toLowerCase(), K = Se(e).toLowerCase(), O = me(e).toLowerCase(), pe = (e.displayPath ?? []).join(Pe).toLowerCase();
  return r.includes(i) || x.includes(i) || K.includes(i) || O.includes(i) || pe.includes(i) || o.includes(i) || a.includes(i) || n.includes(i) || l.includes(i) || v.includes(i) || g.includes(i);
}
function Zl(e, t, i) {
  if (i)
    return i.search(t);
  const r = t.trim();
  return r ? [...e].filter((o) => Jl(o, r)).sort(
    (o, a) => me(o).localeCompare(
      me(a),
      void 0,
      { sensitivity: "base" }
    )
  ) : [];
}
function Lt(e) {
  return e.groupName?.trim() || xt;
}
function Ql(e) {
  if (e.elementTypeAlias)
    return e.elementTypeAlias;
  const t = e.alias.split("__");
  return t.length >= 3 ? t[1] ?? "_unknown" : "_unknown";
}
function ec(e, t) {
  return e.elementTypeName ?? e.sourceName ?? t;
}
function tc(e, t) {
  const i = Ql(t), r = `${e.containerKey}::${i}`, o = ec(t, i), a = e.elementTypes.get(r), n = t.sortOrder ?? Number.MAX_SAFE_INTEGER;
  e.elementTypes.set(r, {
    elementTypeKey: r,
    elementTypeAlias: i,
    elementTypeName: o,
    sortOrder: Math.min(a?.sortOrder ?? n, n),
    properties: [...a?.properties ?? [], t]
  });
}
function ic(e) {
  return {
    containerKey: e.containerKey,
    containerName: e.containerName,
    containerEditorLabel: e.containerEditorLabel,
    containerProperty: e.containerProperty,
    elementTypes: [...e.elementTypes.values()].sort(
      (t, i) => t.sortOrder - i.sortOrder || t.elementTypeName.localeCompare(i.elementTypeName, void 0, {
        sensitivity: "base"
      })
    ).map((t) => ({
      elementTypeKey: t.elementTypeKey,
      elementTypeAlias: t.elementTypeAlias,
      elementTypeName: t.elementTypeName,
      properties: Jr(t.properties)
    }))
  };
}
function rc(e) {
  const t = /* @__PURE__ */ new Map();
  for (const i of e) {
    const r = Lt(i), o = i.groupSortOrder ?? Number.MAX_SAFE_INTEGER - 100, a = t.get(r) ?? {
      sortOrder: o,
      direct: [],
      containers: /* @__PURE__ */ new Map()
    };
    if (a.sortOrder = Math.min(a.sortOrder, o), i.isContainer) {
      const n = i.containerAlias ?? i.alias, l = a.containers.get(n);
      a.containers.set(n, {
        containerKey: n,
        containerName: i.containerName ?? B(i),
        containerEditorLabel: nr(i),
        containerProperty: i,
        elementTypes: l?.elementTypes ?? /* @__PURE__ */ new Map()
      }), t.set(r, a);
      continue;
    }
    if (i.containerAlias) {
      const n = i.containerAlias, l = a.containers.get(n), v = i.containerName ?? l?.containerName ?? n, g = {
        containerKey: n,
        containerName: v,
        containerEditorLabel: l?.containerEditorLabel ?? nr(i),
        containerProperty: l?.containerProperty,
        elementTypes: l?.elementTypes ?? /* @__PURE__ */ new Map()
      };
      tc(g, i), a.containers.set(n, g), t.set(r, a);
      continue;
    }
    a.direct.push(i), t.set(r, a);
  }
  return [...t.entries()].sort(
    (i, r) => i[1].sortOrder - r[1].sortOrder || i[0].localeCompare(r[0], void 0, { sensitivity: "base" })
  ).map(([i, r]) => ({
    name: i,
    sortOrder: r.sortOrder,
    properties: Jr(r.direct),
    containers: [...r.containers.values()].sort(
      (o, a) => o.containerName.localeCompare(a.containerName, void 0, {
        sensitivity: "base"
      })
    ).map((o) => ic(o))
  }));
}
function oc(e) {
  return e.reduce((t, i) => {
    const r = i.containers.filter(
      (a) => a.containerProperty
    ).length, o = i.containers.reduce(
      (a, n) => a + ze(n),
      0
    );
    return t + i.properties.length + r + o;
  }, 0);
}
function Jr(e) {
  return [...e].sort(
    (t, i) => (t.sortOrder ?? 0) - (i.sortOrder ?? 0) || B(t).localeCompare(
      B(i),
      void 0,
      { sensitivity: "base" }
    )
  );
}
function ac(e, t, i = "Select operator...") {
  return [
    { name: i, value: "", selected: !t },
    ...e.map((r) => ({
      name: Yl(r),
      value: r,
      selected: r === t
    }))
  ];
}
function nc(e, t, i = "Select value") {
  const r = Yr(e) ? Gl : e?.options ?? [];
  return r.length === 0 ? [{ name: i, value: "", selected: !0 }] : [
    { name: i, value: "", selected: !t },
    ...r.map((o) => ({
      name: o.label,
      value: o.value,
      selected: o.value === t
    }))
  ];
}
function Je(e) {
  return e.split(",").map((t) => t.trim()).filter(Boolean);
}
function sc(e) {
  return e.join(",");
}
function lc(e, t) {
  return Je(e).includes(t);
}
function cc(e, t = "All") {
  return t !== "All" ? !0 : e.some(
    (i) => i.contentTypeAlias.trim() !== "" || i.propertyAlias.trim() !== "" || i.propertyValue.trim() !== "" || i.fromDate.trim() !== "" || i.toDate.trim() !== ""
  );
}
function uc(e) {
  return e.filter(
    (t) => !!t.filterOperator && !G(t.contentTypeAlias)
  ).map((t) => ({
    contentTypeAlias: t.contentTypeAlias.trim(),
    propertyAlias: t.propertyAlias.trim(),
    filterOperator: t.filterOperator,
    propertyValue: t.propertyValue.trim(),
    fromDate: t.fromDate.trim() || void 0,
    toDate: t.toDate.trim() || void 0
  }));
}
function pc(e, t) {
  return {
    name: e.trim(),
    filterType: t.filterType,
    pageSize: t.pageSize,
    searchCultureMode: t.searchCultureMode,
    culture: t.searchCultureMode === "SpecificCulture" && t.culture.trim() || void 0,
    conditions: uc(t.conditions)
  };
}
function dc(e) {
  return e.length === 0 ? [be()] : e.map((t) => ({
    id: crypto.randomUUID(),
    contentTypeAlias: t.contentTypeAlias ?? "",
    propertyAlias: t.propertyAlias ?? "",
    filterOperator: t.filterOperator ?? "",
    propertyValue: t.propertyValue ?? "",
    fromDate: t.fromDate ?? "",
    toDate: t.toDate ?? ""
  }));
}
function hc(e) {
  const t = /* @__PURE__ */ new Set();
  for (const i of e.conditions) {
    const r = i.contentTypeAlias?.trim();
    r && t.add(r);
  }
  return [...t];
}
function fc(e, t) {
  const i = t.trim().toLowerCase();
  return i ? e.name.toLowerCase().includes(i) : !0;
}
function _c(e) {
  const t = e.conditions.length, i = t === 1 ? "1 condition" : `${t} conditions`;
  return `${e.name} (${i})`;
}
const Zr = "phases.filterNodes.savedFilterLastUsed";
function wi() {
  try {
    const e = localStorage.getItem(Zr);
    if (!e)
      return {};
    const t = JSON.parse(e);
    return t && typeof t == "object" ? t : {};
  } catch {
    return {};
  }
}
function Qr(e) {
  try {
    localStorage.setItem(Zr, JSON.stringify(e));
  } catch {
  }
}
function mc(e) {
  if (!e)
    return;
  const t = wi();
  t[e] = (/* @__PURE__ */ new Date()).toISOString(), Qr(t);
}
function yc(e) {
  if (!e)
    return;
  const t = wi();
  e in t && (delete t[e], Qr(t));
}
function vc(e) {
  if (e)
    return wi()[e];
}
function gc(e, t = /* @__PURE__ */ new Date()) {
  const i = new Date(e);
  if (Number.isNaN(i.getTime()))
    return "";
  const r = t.getTime() - i.getTime(), o = Math.round(r / 6e4);
  if (o < 1)
    return "just now";
  if (o < 60)
    return `${o} minute${o === 1 ? "" : "s"} ago`;
  const a = Math.round(o / 60);
  if (a < 24)
    return `${a} hour${a === 1 ? "" : "s"} ago`;
  const n = Math.round(a / 24);
  return n < 7 ? `${n} day${n === 1 ? "" : "s"} ago` : new Intl.DateTimeFormat(void 0, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(i);
}
function bc(e) {
  const t = vc(e);
  if (!t)
    return;
  const i = gc(t);
  return i ? `Last used ${i}` : void 0;
}
function eo(e, t, i = Lr) {
  return e.length <= i ? {
    items: e,
    truncated: !1,
    totalCount: e.length
  } : t ? {
    items: e.slice(0, i),
    truncated: !0,
    totalCount: e.length
  } : {
    items: e.slice(0, i),
    truncated: !0,
    totalCount: e.length
  };
}
function Cc(e, t = Lr) {
  const i = oc(e);
  if (i <= t)
    return {
      groups: e,
      truncated: !1,
      totalPropertyCount: i
    };
  const r = [];
  let o = t;
  for (const a of e) {
    if (o <= 0)
      break;
    const n = Sc(a, o);
    o -= to(n), r.push(n);
  }
  return {
    groups: r,
    truncated: !0,
    totalPropertyCount: i
  };
}
function to(e) {
  const t = e.containers.filter(
    (r) => r.containerProperty
  ).length, i = e.containers.reduce(
    (r, o) => r + ze(o),
    0
  );
  return e.properties.length + t + i;
}
function Sc(e, t) {
  if (to(e) <= t)
    return e;
  let i = t;
  const r = e.properties.slice(0, i);
  i -= r.length;
  const o = [];
  for (const a of e.containers) {
    if (i <= 0)
      break;
    const n = wc(a, i);
    i -= sr(n), sr(n) > 0 && o.push(n);
  }
  return {
    ...e,
    properties: r,
    containers: o
  };
}
function sr(e) {
  return (e.containerProperty ? 1 : 0) + ze(e);
}
function wc(e, t) {
  let i = t;
  const r = e.containerProperty && i > 0 ? e.containerProperty : void 0;
  r && (i -= 1);
  const o = [];
  for (const a of e.elementTypes) {
    if (i <= 0)
      break;
    const n = a.properties.slice(0, i);
    n.length !== 0 && (i -= n.length, o.push({
      ...a,
      properties: n
    }));
  }
  return {
    ...e,
    containerProperty: r,
    elementTypes: o
  };
}
function Ze(e, t, i, r, o) {
  return i ? r ? `Showing ${t} of ${e} ${o}. Refine your search to see more.` : `${e} ${o}. Type to narrow the list.` : "";
}
const Ec = M`
  :host {
    display: block;
    width: 100%;
    min-width: 0;
  }

  .saved-filter-combobox {
    position: relative;
    width: 100%;
    min-width: 0;
  }

  .saved-filter-combobox__status {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  uui-combobox {
    width: 100%;
    min-width: 0;
  }

  .saved-filter-option {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    min-width: 0;
  }

  .saved-filter-option__name {
    color: var(--uui-color-text);
    font-size: var(--uui-type-default-size);
    line-height: 1.2;
  }

  .saved-filter-option__meta {
    color: var(--uui-color-text-alt);
    font-size: var(--uui-type-small-size);
    line-height: 1.2;
  }

  .saved-filter-option__empty {
    color: var(--uui-color-text-alt);
    font-size: var(--uui-type-small-size);
    font-style: italic;
    line-height: 1.2;
  }
`;
var $c = Object.defineProperty, Tc = Object.getOwnPropertyDescriptor, io = (e) => {
  throw TypeError(e);
}, se = (e, t, i, r) => {
  for (var o = r > 1 ? void 0 : r ? Tc(t, i) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (o = (r ? n(t, i, o) : n(o)) || o);
  return r && o && $c(t, i, o), o;
}, ro = (e, t, i) => t.has(e) || io("Cannot " + i), oo = (e, t, i) => (ro(e, t, "read from private field"), i ? i.call(e) : t.get(e)), lr = (e, t, i) => t.has(e) ? io("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), Ne = (e, t, i) => (ro(e, t, "access private method"), i), pt, ge, ao, no, so, Jt;
let Z = class extends ee {
  constructor() {
    super(...arguments), lr(this, ge), this.savedFilters = [], this.value = "", this.label = "Saved search", this.placeholder = "Search saved searches...", this.disabled = !1, this.loading = !1, this._filteredSavedFilters = [], this._searchStatusMessage = "", this._isSearching = !1, lr(this, pt, yi((e) => {
      Ne(this, ge, Jt).call(this, e);
    }, mi));
  }
  updated(e) {
    e.has("savedFilters") && Ne(this, ge, Jt).call(this, "");
  }
  disconnectedCallback() {
    oo(this, pt).cancel(), super.disconnectedCallback();
  }
  async focus() {
    await this.updateComplete, await this._combobox?.focus?.();
  }
  render() {
    const e = this.loading ? "Loading saved searches…" : this.placeholder;
    return s`
      <div class="saved-filter-combobox">
        <uui-combobox
          id="saved-filter-combobox"
          class="saved-filters__select"
          label=${this.label}
          .value=${this.value}
          placeholder=${e}
          ?disabled=${this.disabled || this.loading || this.savedFilters.length === 0}
          @search=${Ne(this, ge, no)}
          @change=${Ne(this, ge, so)}
        >
          <uui-combobox-list>
            ${oe(
      this._filteredSavedFilters,
      (t) => t.id,
      (t) => Ne(this, ge, ao).call(this, t)
    )}
            ${this._filteredSavedFilters.length === 0 ? s`
                  <uui-combobox-list-option disabled value="">
                    <span class="saved-filter-option__empty">No matching saved searches</span>
                  </uui-combobox-list-option>
                ` : d}
          </uui-combobox-list>
        </uui-combobox>
        <span class="saved-filter-combobox__status" aria-live="polite">
          ${this._searchStatusMessage}
        </span>
      </div>
    `;
  }
};
pt = /* @__PURE__ */ new WeakMap();
ge = /* @__PURE__ */ new WeakSet();
ao = function(e) {
  const t = _c(e);
  return s`
      <uui-combobox-list-option .value=${e.id} .displayValue=${t}>
        <span class="saved-filter-option">
          <span class="saved-filter-option__name">${e.name}</span>
          <span class="saved-filter-option__meta">
            ${e.conditions.length}
            ${e.conditions.length === 1 ? "condition" : "conditions"}
          </span>
        </span>
      </uui-combobox-list-option>
    `;
};
no = function(e) {
  const t = e.currentTarget.search ?? "";
  oo(this, pt).call(this, t);
};
so = function(e) {
  const t = String(
    e.currentTarget.value ?? ""
  );
  t && this.dispatchEvent(
    new CustomEvent("filter-saved-filter-change", {
      detail: { value: t },
      bubbles: !0,
      composed: !0
    })
  );
};
Jt = function(e) {
  const t = e.trim();
  this._isSearching = !!t;
  const i = this.savedFilters.filter(
    (o) => fc(o, e)
  ), r = eo(i, this._isSearching);
  this._filteredSavedFilters = r.items, this._searchStatusMessage = Ze(
    r.totalCount,
    r.items.length,
    r.truncated,
    this._isSearching,
    "saved searches"
  );
};
Z.styles = [Ec];
se([
  p({ type: Array })
], Z.prototype, "savedFilters", 2);
se([
  p({ type: String })
], Z.prototype, "value", 2);
se([
  p({ type: String })
], Z.prototype, "label", 2);
se([
  p({ type: String })
], Z.prototype, "placeholder", 2);
se([
  p({ type: Boolean })
], Z.prototype, "disabled", 2);
se([
  p({ type: Boolean })
], Z.prototype, "loading", 2);
se([
  _()
], Z.prototype, "_filteredSavedFilters", 2);
se([
  _()
], Z.prototype, "_searchStatusMessage", 2);
se([
  _()
], Z.prototype, "_isSearching", 2);
se([
  $t("#saved-filter-combobox")
], Z.prototype, "_combobox", 2);
Z = se([
  Q("filter-saved-filter-combobox")
], Z);
const $e = M`
  :host {
    --fn-space-section: var(--uui-size-space-5);
    --fn-space-block: var(--uui-size-space-4);
    --fn-space-inline: var(--uui-size-space-3);
    --fn-radius: var(--uui-border-radius);
    --fn-surface-muted: color-mix(
      in srgb,
      var(--uui-color-surface-alt) 72%,
      var(--uui-color-surface)
    );
    --fn-surface-inset: color-mix(
      in srgb,
      var(--uui-color-surface-alt) 55%,
      var(--uui-color-surface)
    );
    --fn-summary-surface: color-mix(
      in srgb,
      var(--uui-color-selected) 7%,
      var(--uui-color-surface)
    );
    --fn-summary-accent: var(--uui-color-selected);
  }
`, Ei = M`
  .fn-section-header {
    display: flex;
    flex-direction: column;
    gap: var(--uui-size-space-1);
  }

  .fn-section-header__title {
    margin: 0;
    font-size: var(--uui-type-h6-size, 1rem);
    font-weight: 700;
    line-height: 1.25;
    letter-spacing: -0.01em;
  }

  .fn-section-header__description {
    margin: 0;
    color: var(--uui-color-text-alt);
    font-size: var(--uui-type-small-size);
    line-height: 1.45;
    max-width: 42rem;
  }

  .fn-section-header__meta {
    color: var(--uui-color-text-alt);
    font-weight: 600;
  }
`, xc = [
  $e,
  Ei,
  M`
    :host {
      display: block;
      width: 100%;
    }

    .saved-filters {
      display: flex;
      flex-direction: column;
      gap: var(--fn-space-block);
    }

    .saved-filters__empty {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: var(--uui-size-space-2);
      padding: var(--fn-space-block);
      border-radius: var(--fn-radius);
      background: var(--fn-surface-muted);
    }

    .saved-filters__empty-title {
      margin: 0;
      color: var(--uui-color-text);
      font-size: var(--uui-type-default-size);
      font-weight: 600;
      line-height: 1.3;
    }

    .saved-filters__empty-text {
      margin: 0;
      color: var(--uui-color-text-alt);
      font-size: var(--uui-type-small-size);
      line-height: 1.5;
      max-width: 36rem;
    }

    .saved-filters__toolbar {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-end;
      gap: var(--fn-space-inline);
      padding: var(--fn-space-inline) var(--fn-space-block);
      border-radius: var(--fn-radius);
      background: var(--fn-surface-muted);
    }

    .saved-filters__primary {
      display: flex;
      flex-direction: column;
      gap: var(--uui-size-space-1);
      flex: 1 1 16rem;
      min-width: 14rem;
    }

    .saved-filters__select {
      width: 100%;
    }

    .saved-filters__usage {
      margin: 0;
      color: var(--uui-color-text-alt);
      font-size: var(--uui-type-small-size);
      line-height: 1.4;
    }

    .saved-filters__actions {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: flex-end;
      gap: var(--uui-size-space-2);
      margin-left: auto;
    }

    .saved-filters__save-form {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-end;
      gap: var(--fn-space-inline);
      padding: var(--fn-space-inline) var(--fn-space-block);
      border-radius: var(--fn-radius);
      background: var(--fn-surface-inset);
    }

    .saved-filters__save-form uui-input {
      flex: 1 1 16rem;
      min-width: 14rem;
    }

    .saved-filters__save-actions {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--uui-size-space-2);
    }

    uui-select,
    uui-input {
      width: 100%;
    }

    @media (max-width: 720px) {
      .saved-filters__toolbar {
        flex-direction: column;
        align-items: stretch;
      }

      .saved-filters__actions {
        width: 100%;
        margin-left: 0;
        justify-content: stretch;
      }

      .saved-filters__actions uui-button {
        flex: 1 1 auto;
      }

      .saved-filters__save-form {
        flex-direction: column;
        align-items: stretch;
      }

      .saved-filters__save-actions {
        width: 100%;
      }

      .saved-filters__save-actions uui-button {
        flex: 1 1 auto;
      }
    }
  `
];
var Ac = Object.defineProperty, Dc = Object.getOwnPropertyDescriptor, lo = (e) => {
  throw TypeError(e);
}, de = (e, t, i, r) => {
  for (var o = r > 1 ? void 0 : r ? Dc(t, i) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (o = (r ? n(t, i, o) : n(o)) || o);
  return r && o && Ac(t, i, o), o;
}, Pc = (e, t, i) => t.has(e) || lo("Cannot " + i), Oc = (e, t, i) => t.has(e) ? lo("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), ie = (e, t, i) => (Pc(e, t, "access private method"), i), W, co, uo, po, $i, ho, fo, _o, mo, yo, vo;
const Lc = "filter-nodes-saved-filter-load", kc = "filter-nodes-saved-filter-save", Ic = "filter-nodes-saved-filter-delete";
let ae = class extends ee {
  constructor() {
    super(...arguments), Oc(this, W), this.savedFilters = [], this.selectedSavedFilterId = "", this.loading = !1, this.saving = !1, this.disabled = !1, this.saveDisabled = !1, this._showSaveForm = !1, this._saveName = "";
  }
  render() {
    const e = this.savedFilters.length, t = e > 0, i = ie(this, W, $i).call(this), r = i ? bc(i.id) : void 0;
    return s`
      <div class="saved-filters">
        ${ie(this, W, co).call(this, e)}
        ${!this.loading && !t ? ie(this, W, uo).call(this) : d}
        <div class="saved-filters__toolbar">
          <div class="saved-filters__primary">
            <filter-saved-filter-combobox
              class="saved-filters__select"
              .savedFilters=${this.savedFilters}
              .value=${this.selectedSavedFilterId}
              ?loading=${this.loading}
              ?disabled=${this.disabled}
              @filter-saved-filter-change=${ie(this, W, fo)}
            ></filter-saved-filter-combobox>
            ${r ? s`
                  <p class="saved-filters__usage">${r}</p>
                ` : d}
          </div>

          <div class="saved-filters__actions">
            ${this.selectedSavedFilterId ? s`
                  <uui-button
                    look="secondary"
                    label="Delete saved search"
                    ?disabled=${ie(this, W, ho).call(this)}
                    @click=${ie(this, W, vo)}
                  >
                    <uui-icon name="icon-trash"></uui-icon>
                    Delete
                  </uui-button>
                ` : d}
            <uui-button
              look="primary"
              label="Save current search"
              ?disabled=${this.disabled || this.saving || this.saveDisabled}
              @click=${ie(this, W, _o)}
            >
              <uui-icon name="icon-save"></uui-icon>
              Save current search
            </uui-button>
          </div>
        </div>

        ${this._showSaveForm ? ie(this, W, po).call(this) : d}
      </div>
    `;
  }
  resetSaveForm() {
    this._showSaveForm = !1, this._saveName = "";
  }
};
W = /* @__PURE__ */ new WeakSet();
co = function(e) {
  return s`
      <header class="fn-section-header saved-filters__header">
        <h3 class="fn-section-header__title">
          Saved searches
          <span class="fn-section-header__meta">(${this.loading ? "…" : e})</span>
        </h3>
        <p class="fn-section-header__description">
          Load a search you have saved before, or save the conditions below for next time.
        </p>
      </header>
    `;
};
uo = function() {
  return s`
      <div class="saved-filters__empty">
        <p class="saved-filters__empty-title">No saved searches yet</p>
        <p class="saved-filters__empty-text">
          Build a search below, then choose
          <strong>Save current search</strong> to reuse it later.
        </p>
      </div>
    `;
};
po = function() {
  return s`
      <div class="saved-filters__save-form">
        <uui-input
          label="Search name"
          placeholder="e.g. Published articles from last month"
          maxlength=${zs}
          .value=${this._saveName}
          ?disabled=${this.saving}
          @input=${(e) => {
    this._saveName = e.target.value;
  }}
        ></uui-input>
        <div class="saved-filters__save-actions">
          <uui-button
            look="secondary"
            label="Cancel"
            ?disabled=${this.saving}
            @click=${ie(this, W, mo)}
          >
            Cancel
          </uui-button>
          <uui-button
            look="primary"
            label="Save search"
            ?disabled=${this.saving || !this._saveName.trim()}
            @click=${ie(this, W, yo)}
          >
            ${this.saving ? "Saving…" : "Save"}
          </uui-button>
        </div>
      </div>
    `;
};
$i = function() {
  if (this.selectedSavedFilterId)
    return this.savedFilters.find(
      (e) => e.id === this.selectedSavedFilterId
    );
};
ho = function() {
  return this.disabled || this.loading || this.saving;
};
fo = function(e) {
  const t = e.detail.value;
  t && this.dispatchEvent(
    new CustomEvent(Lc, {
      detail: { savedFilterId: t },
      bubbles: !0,
      composed: !0
    })
  );
};
_o = function() {
  this._showSaveForm = !this._showSaveForm, this._showSaveForm || (this._saveName = "");
};
mo = function() {
  this._showSaveForm = !1, this._saveName = "";
};
yo = function() {
  const e = this._saveName.trim();
  e && this.dispatchEvent(
    new CustomEvent(kc, {
      detail: { name: e },
      bubbles: !0,
      composed: !0
    })
  );
};
vo = async function() {
  const e = this.selectedSavedFilterId;
  if (!e)
    return;
  const i = ie(this, W, $i).call(this)?.name ?? "this search";
  await Tr(this, {
    headline: "Delete saved search",
    content: `Delete "${i}"? This cannot be undone.`,
    color: "warning",
    confirmLabel: "Delete"
  }).catch(() => !1) !== !1 && this.dispatchEvent(
    new CustomEvent(Ic, {
      detail: { savedFilterId: e },
      bubbles: !0,
      composed: !0
    })
  );
};
ae.styles = [Tt, ...xc];
de([
  p({ type: Array })
], ae.prototype, "savedFilters", 2);
de([
  p({ type: String })
], ae.prototype, "selectedSavedFilterId", 2);
de([
  p({ type: Boolean })
], ae.prototype, "loading", 2);
de([
  p({ type: Boolean })
], ae.prototype, "saving", 2);
de([
  p({ type: Boolean })
], ae.prototype, "disabled", 2);
de([
  p({ type: Boolean })
], ae.prototype, "saveDisabled", 2);
de([
  _()
], ae.prototype, "_showSaveForm", 2);
de([
  _()
], ae.prototype, "_saveName", 2);
ae = de([
  Q("filter-nodes-saved-filters")
], ae);
function Nc(e, t) {
  const i = e[0];
  return i ? !U(t) && !i.contentTypeAlias.trim() ? "Choose a content type for your first condition." : i.propertyAlias.trim() ? i.filterOperator ? "Complete the value, then click Search." : "Choose how to compare the field value." : "Choose which field to search on." : "Add a condition to start building your search.";
}
function Rc(e, t) {
  return e.length !== t.length ? !1 : e.every((i, r) => {
    const o = t[r];
    return i.contentTypeAlias === o.contentTypeAlias && i.propertyAlias === o.propertyAlias && i.filterOperator === o.filterOperator && i.propertyValue === o.propertyValue && i.fromDate === o.fromDate && i.toDate === o.toDate;
  });
}
function Kt(e) {
  return e.map((t) => ({ ...t }));
}
function go(e) {
  const t = e.filter(
    (i) => J(i)
  ).length;
  return {
    searchable: t,
    hidden: e.length - t,
    total: e.length
  };
}
function Bc(e) {
  if (e.hidden <= 0)
    return;
  const t = e.searchable === 1 ? "property" : "properties";
  return `Showing ${e.searchable} searchable ${t} (${e.hidden} hidden). Uncheck "Hide properties that can't be searched" to show all.`;
}
function Mc(e) {
  if (e.hidden <= 0)
    return;
  const t = e.searchable === 1 ? "property" : "properties";
  return `${e.searchable} searchable ${t} (${e.hidden} hidden)`;
}
const bo = "Select date range...", Zt = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "last7Days", label: "Last 7 Days" },
  { id: "last30Days", label: "Last 30 Days" },
  { id: "thisMonth", label: "This Month" },
  { id: "lastMonth", label: "Last Month" },
  { id: "custom", label: "Custom Range" }
];
function Fc(e) {
  return e === "custom";
}
function cr(e) {
  const t = e.getFullYear(), i = String(e.getMonth() + 1).padStart(2, "0"), r = String(e.getDate()).padStart(2, "0");
  return `${t}-${i}-${r}`;
}
function Qt(e, t = /* @__PURE__ */ new Date()) {
  const i = Co(t);
  switch (e) {
    case "custom":
      return;
    case "today":
      return xe(i, i);
    case "yesterday": {
      const r = Yt(i, -1);
      return xe(r, r);
    }
    case "last7Days":
      return xe(Yt(i, -6), i);
    case "last30Days":
      return xe(Yt(i, -29), i);
    case "thisMonth":
      return xe(
        new Date(i.getFullYear(), i.getMonth(), 1),
        i
      );
    case "lastMonth": {
      const r = new Date(i.getFullYear(), i.getMonth() - 1, 1), o = new Date(i.getFullYear(), i.getMonth(), 0);
      return xe(r, o);
    }
    default:
      return;
  }
}
function Ti(e, t, i, r, o) {
  const a = e.trim(), n = t.trim(), l = i.trim();
  if (o === "custom" && r !== "Between") {
    if (!l)
      return "";
    for (const v of Zt) {
      if (v.id === "custom")
        continue;
      const g = Qt(v.id);
      if (g?.isSingleDay && g.fromDate === l)
        return v.id;
    }
    return "custom";
  }
  if (!a && !n)
    return "";
  for (const v of Zt) {
    if (v.id === "custom")
      continue;
    const g = Qt(v.id);
    if (g && g.fromDate === a && g.toDate === n)
      return v.id;
  }
  return "custom";
}
function zc(e, t = bo) {
  return [
    { name: t, value: "", selected: !e },
    ...Zt.map((i) => ({
      name: i.label,
      value: i.id,
      selected: i.id === e
    }))
  ];
}
function Co(e) {
  return new Date(e.getFullYear(), e.getMonth(), e.getDate());
}
function Yt(e, t) {
  const i = new Date(e);
  return i.setDate(i.getDate() + t), Co(i);
}
function xe(e, t) {
  const i = cr(e), r = cr(t);
  return {
    fromDate: i,
    toDate: r,
    isSingleDay: i === r
  };
}
const Vc = {
  today: "today",
  yesterday: "yesterday",
  last7Days: "within the last 7 days",
  last30Days: "within the last 30 days",
  thisMonth: "within this month",
  lastMonth: "within last month"
};
function Uc(e, t, i) {
  if (e.length === 0)
    return {
      parts: [],
      placeholder: "Add conditions above to preview your search."
    };
  const r = t === "Any" ? "OR" : "AND", o = [];
  return e.forEach((a, n) => {
    o.push({
      kind: "keyword",
      keyword: n === 0 ? "WHERE" : r
    }), o.push({
      kind: "condition",
      text: Gc(a, i)
    });
  }), {
    parts: o,
    placeholder: "Add conditions above to preview your search."
  };
}
function Gc(e, t) {
  const i = U(t.searchScope), r = e.contentTypeAlias.trim(), o = e.propertyAlias.trim();
  if (!o)
    return i ? "…" : `${r ? Xt(r, t.contentTypes) : "…"}${Qi}…`;
  const a = Le(
    t.propertyMetadataByContentType,
    r,
    o,
    t.searchScope,
    t.contentTypes
  ), n = Hc(
    e,
    a,
    o
  );
  return i ? n : `${r && !G(r) ? Xt(r, t.contentTypes) : "…"}${Qi}${n}`;
}
function Hc(e, t, i) {
  const r = qc(t, i), o = e.filterOperator, a = re(t), n = ue(t, i);
  if (!o)
    return `${r} …`;
  if (o === "IsEmpty" || o === "IsNotEmpty")
    return `${r} ${Ce(o, a, n)}`;
  const l = Kc(
    e,
    r,
    o,
    a,
    n
  );
  if (l)
    return l;
  const v = Yc(
    e,
    o,
    t,
    a
  );
  return v ? `${r} ${Ce(o, a, n)} ${v}` : `${r} ${Ce(o, a, n)} …`;
}
function Kc(e, t, i, r, o) {
  if (r !== "Date" && !o)
    return;
  const a = o ? "system" : "custom";
  if (i === "Between") {
    const l = Ti(
      e.fromDate,
      e.toDate,
      e.propertyValue,
      i,
      a
    );
    if (l && l !== "custom")
      return `${t} is ${Vc[l]}`;
    const v = e.fromDate.trim(), g = e.toDate.trim();
    return v && g ? `${t} is between ${v} and ${g}` : v || g ? `${t} is between ${v || "…"} and ${g || "…"}` : `${t} is between …`;
  }
  if (o) {
    const v = i === "LessThan" || i === "LessThanOrEqual" ? e.toDate.trim() : e.fromDate.trim();
    return v ? `${t} ${Ce(i, "Date", !0)} ${v}` : `${t} ${Ce(i, "Date", !0)} …`;
  }
  const n = e.propertyValue.trim();
  return n ? `${t} ${Ce(i, "Date", !1)} ${n}` : `${t} ${Ce(i, "Date", !1)} …`;
}
function Yc(e, t, i, r) {
  const o = e.propertyValue.trim();
  if (!o)
    return "";
  if (r === "MultiSelect") {
    const a = Je(o).map(
      (n) => i?.options?.find((l) => l.value === n)?.label ?? n
    );
    return ur(a.join(", "));
  }
  if (r === "Dropdown") {
    const a = i?.options?.find((n) => n.value === o)?.label ?? o;
    return pr(a) ?? a;
  }
  return qr(t, r) ? ur(o) : pr(o) ?? o;
}
function Ce(e, t, i) {
  const r = t === "Date" || i;
  switch (e) {
    case "Contains":
      return "contains";
    case "StartsWith":
      return "starts with";
    case "EndsWith":
      return "ends with";
    case "Equals":
      return r ? "is on" : "equals";
    case "NotEquals":
      return r ? "is not on" : "does not equal";
    case "GreaterThan":
      return r ? "is after" : "is greater than";
    case "GreaterThanOrEqual":
      return r ? "is on or after" : "is at least";
    case "LessThan":
      return r ? "is before" : "is less than";
    case "LessThanOrEqual":
      return r ? "is on or before" : "is at most";
    case "Between":
      return "is between";
    case "IsEmpty":
      return "is empty";
    case "IsNotEmpty":
      return "is not empty";
    default:
      return e;
  }
}
function qc(e, t) {
  return e?.name ? e.name : t === Ye ? "Create Date" : t === qe ? "Update Date" : t === At ? "Node Name" : t === Dt ? "Content Type Alias" : t;
}
function ur(e) {
  return `"${e}"`;
}
function pr(e) {
  const t = e.trim().toLowerCase();
  if (t === "true" || t === "1")
    return "True";
  if (t === "false" || t === "0")
    return "False";
}
function Wc(e, t) {
  return e !== "Any" || t.length <= 1 ? !0 : !t.some(
    (i) => i.filterOperator === "IsEmpty" || i.filterOperator === "IsNotEmpty"
  );
}
function kt(e, t, i = "All") {
  if (e.length === 0)
    return {
      isValid: !1,
      errors: []
    };
  const r = [];
  for (const o of e)
    r.push(...Xc(o, t));
  return Wc(i, e) ? {
    isValid: r.length === 0,
    errors: r,
    firstError: r[0]
  } : {
    isValid: !1,
    errors: r,
    message: "Any condition cannot be used with multiple Is Empty / Is Not Empty filters. Switch to All conditions instead."
  };
}
function jc(e) {
  const t = {};
  for (const i of e)
    t[i.conditionId] = {
      ...t[i.conditionId],
      [i.field]: i.message
    };
  return t;
}
function Xc(e, t) {
  const i = [], r = U(t.searchScope), o = e.contentTypeAlias.trim(), a = e.propertyAlias.trim(), n = e.filterOperator;
  if (r || (!o || G(o)) && i.push({
    conditionId: e.id,
    field: "contentTypeAlias",
    message: "Select a content type."
  }), !a)
    return i.push({
      conditionId: e.id,
      field: "propertyAlias",
      message: "Select a property."
    }), i;
  if (r && !ut(a))
    return i.push({
      conditionId: e.id,
      field: "propertyAlias",
      message: "Select a valid system property."
    }), i;
  if (!n)
    return i.push({
      conditionId: e.id,
      field: "filterOperator",
      message: "Select an operator."
    }), i;
  const l = Le(
    t.propertyMetadataByContentType,
    o,
    a,
    t.searchScope,
    t.contentTypes
  );
  return l && !J(l) ? (i.push({
    conditionId: e.id,
    field: "propertyAlias",
    message: "This block property cannot be searched yet. Ask an administrator to enable block property search."
  }), i) : l && ke(l) && !Xe(l) && n !== "IsEmpty" && n !== "IsNotEmpty" ? (i.push({
    conditionId: e.id,
    field: "filterOperator",
    message: "Block properties only support Is empty and Is not empty when checking whether blocks exist."
  }), i) : (i.push(
    ...Jc(
      e,
      t,
      a,
      n
    )
  ), i);
}
function Jc(e, t, i, r) {
  if (r === "IsEmpty" || r === "IsNotEmpty")
    return [];
  const o = Le(
    t.propertyMetadataByContentType,
    e.contentTypeAlias.trim(),
    i,
    t.searchScope,
    t.contentTypes
  );
  return ue(o, i) ? Zc(e, r) : re(o) === "Date" && r === "Between" ? So(e) : re(o) === "Date" ? Qc(e) : re(o) === "MultiSelect" ? eu(e) : tu(e);
}
function Zc(e, t) {
  return t === "Between" ? So(e) : t === "LessThan" || t === "LessThanOrEqual" ? e.toDate.trim() ? [] : [
    {
      conditionId: e.id,
      field: "toDate",
      message: "Enter an end date."
    }
  ] : e.fromDate.trim() ? [] : [
    {
      conditionId: e.id,
      field: "fromDate",
      message: "Enter a start date."
    }
  ];
}
function So(e) {
  const t = e.fromDate.trim(), i = e.toDate.trim();
  if (!t && !i)
    return [
      {
        conditionId: e.id,
        field: "dateRange",
        message: "Select a date range."
      }
    ];
  const r = [];
  return t || r.push({
    conditionId: e.id,
    field: "fromDate",
    message: "Enter a start date."
  }), i || r.push({
    conditionId: e.id,
    field: "toDate",
    message: "Enter an end date."
  }), r;
}
function Qc(e) {
  return e.propertyValue.trim() ? [] : [
    {
      conditionId: e.id,
      field: "propertyValue",
      message: "Enter a date."
    }
  ];
}
function eu(e) {
  return Je(e.propertyValue).length === 0 ? [
    {
      conditionId: e.id,
      field: "propertyValue",
      message: "Select at least one value."
    }
  ] : [];
}
function tu(e) {
  return e.propertyValue.trim() ? [] : [
    {
      conditionId: e.id,
      field: "propertyValue",
      message: "Enter a value."
    }
  ];
}
function iu(e) {
  return Xe(e) || we(e) ? ce : _e;
}
function ru(e) {
  return !ve(e) || !J(e) ? !1 : (e.indexedFieldAliases?.map((i) => i.trim()).filter(Boolean) ?? []).length > 0;
}
function ou(e) {
  return ke(e) || ve(e);
}
function wo(e) {
  return Vs.replace(
    "{blockEditor}",
    e
  );
}
function Eo(e) {
  if (!(!e || !ou(e))) {
    if (ru(e))
      return {
        mode: "dedicated",
        label: Gs,
        description: Us
      };
    if (ke(e) || ve(e)) {
      const t = iu(e);
      return {
        mode: "container",
        label: kr,
        description: wo(t)
      };
    }
  }
}
function au() {
  return {
    mode: "container",
    label: kr,
    description: wo(ce)
  };
}
const nu = {
  "Umbraco.TextBox": "Textstring",
  "Umbraco.TextArea": "Textarea",
  "Umbraco.TinyMCE": "Rich text",
  "Umbraco.RichText": "Rich text",
  "Umbraco.Integer": "Numeric",
  "Umbraco.Decimal": "Numeric",
  "Umbraco.Slider": "Slider",
  "Umbraco.TrueFalse": "True/false",
  "Umbraco.DropDown.Flexible": "Dropdown",
  "Umbraco.RadioButtonList": "Radio button list",
  "Umbraco.CheckBoxList": "Checkbox list",
  "Umbraco.DateTime": "Date picker",
  "Umbraco.DateOnly": "Date picker",
  "Umbraco.DateTimeUnspecified": "Date picker",
  "Umbraco.DateTimeWithTimeZone": "Date picker",
  "Umbraco.BlockGrid": "Block Grid",
  "Umbraco.BlockList": "Block List",
  "Umbraco.MediaPicker3": "Media picker",
  "Umbraco.MultiUrlPicker": "Multi URL picker",
  "Umbraco.ContentPicker": "Content picker",
  "Umbraco.MultiNodeTreePicker": "Multinode treepicker",
  "Umbraco.ColorPicker": "Color picker",
  "Umbraco.Label": "Label",
  "Umbraco.EmailAddress": "Email address"
}, su = {
  System: "System",
  ContentType: "Content Type",
  Composition: "Compositions",
  BlockGrid: "Block Grid",
  BlockList: "Block List"
};
function lu(e, t) {
  if (!e)
    return du(t);
  const i = nu[e];
  return i || (e.startsWith("Umbraco.") ? e.slice(8).replace(/([A-Z])/g, " $1").trim() : e);
}
function cu(e) {
  if (e.sourceCategory)
    return su[e.sourceCategory] ?? e.sourceCategory;
  if (e.containerEditorAlias) {
    if (e.containerEditorAlias.localeCompare("Umbraco.BlockGrid", void 0, {
      sensitivity: "accent"
    }) === 0)
      return "Block Grid";
    if (e.containerEditorAlias.localeCompare("Umbraco.BlockList", void 0, {
      sensitivity: "accent"
    }) === 0)
      return "Block List";
  }
  return "Content Type";
}
function uu(e) {
  const t = e.indexedFieldAliases?.map((i) => i.trim()).filter(Boolean) ?? [];
  if (t.length > 0)
    return t.join(", ");
  if (J(e) && !ve(e) || J(e))
    return e.alias;
}
function dr(e) {
  return e ? "Yes" : "No";
}
function pu(e) {
  const t = J(e), i = e.elementTypeName?.trim(), r = uu(e), o = ke(e), a = Eo(e);
  return {
    propertyName: B(e),
    propertyType: lu(
      e.editorAlias,
      e.filterType
    ),
    source: cu(e),
    sourceIcon: gi(e),
    blockType: i || void 0,
    searchable: t,
    searchableLabel: t ? dr(!0) : we(e) ? Rr : dr(!1),
    searchableDescription: t ? Xe(e) ? Ys : o ? "You can check whether this block area has any content (Is empty / Is not empty)." : Ir : we(e) ? Pt : Nr,
    searchMode: a ? { label: a.label, description: a.description } : void 0,
    searchField: r,
    cultureLabel: e.variesByCulture ? Hs : Ks,
    showTechnicalDetails: !!r,
    isBlockContainer: o
  };
}
function du(e) {
  switch (e) {
    case "Number":
      return "Numeric";
    case "MultiSelect":
      return "Multi-select";
    default:
      return e;
  }
}
function hu(e) {
  return e?.localeCompare("Umbraco.BlockGrid", void 0, {
    sensitivity: "accent"
  }) === 0;
}
function ei(e) {
  return e?.localeCompare("Umbraco.BlockList", void 0, {
    sensitivity: "accent"
  }) === 0;
}
function qt(e) {
  return e ? e.sourceCategory === "BlockGrid" || e.sourceCategory === "BlockList" ? !0 : hu(e.containerEditorAlias) || ei(e.containerEditorAlias) : !1;
}
function fu(e) {
  return e.isContainer ? e.containerAlias ?? e.alias : e.containerAlias;
}
function _u(e, t) {
  return e?.sourceCategory === "BlockList" ? _e : e?.sourceCategory === "BlockGrid" ? ce : ei(e?.containerEditorAlias) ? _e : ei(t.containerEditorAlias) ? _e : ce;
}
function mu(e, t, i) {
  return e?.containerName ?? t.containerName ?? i;
}
function nt(e) {
  return [...new Set([...e].filter(Boolean))].sort(
    (t, i) => t.localeCompare(i, void 0, { sensitivity: "base" })
  );
}
function hr(e) {
  return me(e).split(
    Pe
  ).join(" › ");
}
function yu(e) {
  const t = e[0];
  return t && Se(t).trim() || void 0;
}
function vu(e, t) {
  if (!qt(t))
    return;
  const i = fu(t);
  if (!i)
    return;
  const r = e.find(
    (O) => O.isContainer && O.alias === i
  );
  if (r && !qt(r))
    return;
  const o = e.filter(
    (O) => O.containerAlias === i && !O.isContainer && qt(O)
  ), a = nt(
    o.map(
      (O) => O.elementTypeName ?? O.sourceName ?? ""
    )
  ), n = nt(
    o.map((O) => hr(O))
  ), l = [], v = [];
  for (const O of o) {
    const pe = hr(O);
    if (J(O)) {
      l.push(pe);
      continue;
    }
    v.push(pe);
  }
  const g = _u(
    r,
    t
  ), x = g === ce, K = t.isContainer === !0;
  return {
    containerName: mu(
      r,
      t,
      i
    ),
    blockEditorLabel: g,
    isBlockGrid: x,
    isContainerSelected: K,
    blockGridExampleValue: x ? yu(o) : void 0,
    discoveryDiagnostics: r?.blockDiscoveryDiagnostics,
    examineDiagnostics: x ? r?.blockExamineDiagnostics : void 0,
    propertySearchMode: Eo(t),
    elementTypes: a,
    propertiesFound: n,
    searchableProperties: nt(l),
    nonSearchableProperties: nt(v)
  };
}
const gu = "filter-condition-change", bu = "filter-condition-load-properties", Cu = "filter-condition-remove";
function Su() {
  return {
    contentTypeAlias: "",
    propertyAlias: "",
    filterOperator: "",
    propertyValue: "",
    fromDate: "",
    toDate: ""
  };
}
const wu = M`
  --uui-select-height: 2.125rem;
  --uui-select-font-size: var(--uui-type-default-size);
  --uui-select-padding-y: var(--uui-size-space-1);
  --uui-select-padding-x: var(--uui-size-space-2);
  --uui-select-border-color: transparent;
  --uui-select-border-color-hover: transparent;
  --uui-select-background-color: var(--uui-color-surface);
  --uui-input-height: 2.125rem;
  --uui-input-border-color: transparent;
  --uui-input-background-color: var(--uui-color-surface);
`, Eu = M`
  --uui-select-height: 2.125rem;
  --uui-select-font-size: var(--uui-type-small-size);
  --uui-select-padding-y: var(--uui-size-space-1);
  --uui-select-padding-x: var(--uui-size-space-2);
  --uui-select-border-color: transparent;
  --uui-select-border-color-hover: transparent;
  --uui-select-background-color: transparent;
`, $u = M`
  --uui-select-height: 2.125rem;
  --uui-select-font-size: var(--uui-type-default-size);
  --uui-select-padding-y: var(--uui-size-space-1);
  --uui-select-padding-x: var(--uui-size-space-2);
  --uui-select-border-color: transparent;
  --uui-select-border-color-hover: transparent;
  --uui-select-background-color: var(--uui-color-surface);
  --uui-input-height: 2.125rem;
  --uui-input-border-color: transparent;
  --uui-input-background-color: var(--uui-color-surface);
`, Tu = [
  $e,
  M`
  :host {
    display: block;
    width: 100%;
  }

  .condition-row {
    width: 100%;
    padding: var(--uui-size-space-1) 0;
    box-sizing: border-box;
  }

  .condition-row__sentence {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: var(--uui-size-space-3);
    width: 100%;
    min-width: 0;
  }

  .condition-row__keyword {
    flex-shrink: 0;
    align-self: center;
    width: 3.25rem;
    font-family: var(--uui-font-family-mono, ui-monospace, monospace);
    font-size: var(--uui-type-small-size);
    font-weight: 700;
    letter-spacing: 0.08em;
    line-height: 1;
    text-transform: uppercase;
    user-select: none;
  }

  .condition-row__keyword--where {
    color: var(--uui-color-selected);
    font-size: var(--uui-type-default-size);
    letter-spacing: 0.1em;
  }

  .condition-row__keyword--join {
    color: var(--uui-color-text-alt);
  }

  .condition-row__fields {
    display: grid;
    grid-template-columns:
      minmax(6.5rem, 1.05fr)
      minmax(6rem, 1.05fr)
      minmax(5.5rem, 0.75fr)
      minmax(7rem, 1.15fr);
    align-items: start;
    gap: var(--uui-size-space-2) var(--uui-size-space-3);
    min-width: 0;
  }

  .condition-row__fields--entire-site {
    grid-template-columns:
      minmax(6.5rem, 1.15fr)
      minmax(5.5rem, 0.75fr)
      minmax(7rem, 1.2fr);
  }

  .condition-row__token {
    display: flex;
    flex-direction: column;
    gap: var(--uui-size-space-1);
    min-width: 0;
  }

  .condition-row__token--content-type,
  .condition-row__token--property {
    min-width: 0;
  }

  .condition-row__token--content-type .condition-row__control,
  .condition-row__token--property .condition-row__control,
  .condition-row__token--content-type filter-content-type-combobox,
  .condition-row__token--property filter-property-combobox {
    ${wu}
    width: 100%;
    font-weight: 600;
    color: var(--uui-color-text);
  }

  .condition-row__token--content-type.condition-row__token--empty
    .condition-row__control,
  .condition-row__token--content-type.condition-row__token--empty
    filter-content-type-combobox,
  .condition-row__token--property.condition-row__token--empty
    .condition-row__control,
  .condition-row__token--property.condition-row__token--empty
    filter-property-combobox {
    color: var(--uui-color-text-alt);
    font-style: italic;
    font-weight: 500;
  }

  .condition-row__token--operator .condition-row__control {
    ${Eu}
    width: 100%;
    font-weight: 500;
    color: var(--uui-color-text-alt);
  }

  .condition-row__token--operator.condition-row__token--filled
    .condition-row__control {
    color: var(--uui-color-text);
    font-weight: 500;
  }

  .condition-row__token--value .condition-row__control {
    ${$u}
    width: 100%;
    font-weight: 600;
    color: var(--uui-color-text);
  }

  .condition-row__token--ghost {
    min-width: 0;
  }

  .condition-row__ghost {
    display: flex;
    align-items: center;
    min-height: 2.125rem;
    padding: 0 var(--uui-size-space-1);
    color: var(--uui-color-text-alt);
    font-size: var(--uui-type-small-size);
    font-style: italic;
    font-weight: 500;
    line-height: 1.2;
    opacity: 0.65;
  }

  .condition-row__token--operator .condition-row__ghost {
    font-size: var(--uui-type-small-size);
  }

  .condition-row__token--value .condition-row__ghost {
    font-size: var(--uui-type-default-size);
  }

  .condition-row__control {
    width: 100%;
  }

  .condition-row__value {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--uui-size-space-1);
    width: 100%;
    min-width: 0;
  }

  .condition-row__value--literal .condition-row__control {
    flex: 1 1 5rem;
    min-width: 4rem;
    width: auto;
  }

  .condition-row__quote {
    flex-shrink: 0;
    color: var(--uui-color-text-alt);
    font-size: var(--uui-type-default-size);
    font-weight: 500;
    line-height: 1;
    user-select: none;
  }

  .condition-row__date-value {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--uui-size-space-2);
    width: 100%;
    min-width: 0;
  }

  .condition-row__date-range-select {
    display: flex;
    flex-direction: column;
    gap: var(--uui-size-space-1);
    flex: 1 1 10rem;
    min-width: 8rem;
  }

  .condition-row__date-range {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    gap: var(--uui-size-space-2);
    width: 100%;
  }

  .condition-row__date-field {
    display: flex;
    flex-direction: column;
    gap: var(--uui-size-space-1);
    flex: 1 1 8rem;
    min-width: 7rem;
  }

  .condition-row__field-error {
    margin: 0;
    color: var(--uui-color-danger);
    font-size: var(--uui-type-small-size);
    line-height: 1.3;
    width: 100%;
  }

  .condition-row__multi-select--error {
    box-shadow: inset 0 0 0 1px var(--uui-color-danger);
  }

  .condition-row__multi-select {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--uui-size-space-2);
    width: 100%;
    min-height: 2.125rem;
    padding: var(--uui-size-space-1) var(--uui-size-space-2);
    border-radius: var(--fn-radius);
    background: var(--fn-surface-muted);
  }

  .condition-row__multi-select-option {
    display: flex;
    align-items: center;
    gap: var(--uui-size-space-2);
    color: var(--uui-color-text);
    font-size: var(--uui-type-small-size);
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
  }

  .condition-row__remove {
    flex-shrink: 0;
    align-self: center;
    opacity: 0.55;
    transition: opacity 150ms ease;
  }

  .condition-row:hover .condition-row__remove,
  .condition-row:focus-within .condition-row__remove {
    opacity: 0.75;
  }

  .condition-row__remove:hover,
  .condition-row__remove:focus-within {
    opacity: 1;
  }

  .condition-row__remove uui-button {
    --uui-button-height: 1.75rem;
    color: var(--uui-color-text-alt);
  }

  .condition-row__value uui-input [slot="append"] {
    display: flex;
    align-items: center;
  }

  .condition-row__value uui-input [slot="append"] uui-button {
    color: var(--uui-color-text-alt);
  }

  uui-select,
  uui-input,
  uui-combobox {
    min-width: 0;
  }

  @media (max-width: 960px) {
    .condition-row__fields,
    .condition-row__fields--entire-site {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .condition-row__token--value {
      grid-column: 1 / -1;
    }
  }

  @media (max-width: 640px) {
    .condition-row__sentence {
      grid-template-columns: 1fr auto;
      align-items: start;
      gap: var(--uui-size-space-2);
    }

    .condition-row__keyword {
      grid-column: 1 / -1;
      width: auto;
    }

    .condition-row__fields,
    .condition-row__fields--entire-site {
      grid-column: 1;
      grid-template-columns: 1fr;
    }

    .condition-row__token--value {
      grid-column: auto;
    }

    .condition-row__remove {
      grid-column: 2;
      grid-row: 2;
      align-self: start;
    }

    .condition-row__date-range {
      flex-direction: column;
    }
  }
`
], xu = M`
  :host {
    display: block;
    width: 100%;
    min-width: 0;
  }

  .content-type-combobox {
    position: relative;
    width: 100%;
    min-width: 0;
  }

  .content-type-combobox__status {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  uui-combobox {
    width: 100%;
    min-width: 0;
  }

  .content-type-option {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    min-width: 0;
  }

  .content-type-option__name {
    color: var(--uui-color-text);
    font-size: var(--uui-type-default-size);
    line-height: 1.2;
  }

  .content-type-option__alias {
    color: var(--uui-color-text-alt);
    font-family: var(--uui-font-family-mono, ui-monospace, monospace);
    font-size: var(--uui-type-small-size);
    line-height: 1.2;
  }

  .content-type-option__empty {
    color: var(--uui-color-text-alt);
    font-size: var(--uui-type-small-size);
    font-style: italic;
    line-height: 1.2;
  }
`;
var Au = Object.defineProperty, Du = Object.getOwnPropertyDescriptor, $o = (e) => {
  throw TypeError(e);
}, te = (e, t, i, r) => {
  for (var o = r > 1 ? void 0 : r ? Du(t, i) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (o = (r ? n(t, i, o) : n(o)) || o);
  return r && o && Au(t, i, o), o;
}, To = (e, t, i) => t.has(e) || $o("Cannot " + i), xo = (e, t, i) => (To(e, t, "read from private field"), i ? i.call(e) : t.get(e)), fr = (e, t, i) => t.has(e) ? $o("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), Ae = (e, t, i) => (To(e, t, "access private method"), i), dt, fe, Ao, Do, Po, Oo, ti;
let q = class extends ee {
  constructor() {
    super(...arguments), fr(this, fe), this.value = "", this.contentTypes = [], this.label = "Content type", this.placeholder = "Search content type...", this.disabled = !1, this.error = !1, this.loading = !1, this.ariaDescribedBy = "", this._filteredContentTypes = [], this._searchStatusMessage = "", fr(this, dt, yi((e) => {
      Ae(this, fe, ti).call(this, e);
    }, mi));
  }
  updated(e) {
    e.has("contentTypes") && Ae(this, fe, ti).call(this, "");
  }
  disconnectedCallback() {
    xo(this, dt).cancel(), super.disconnectedCallback();
  }
  async focus() {
    await this.updateComplete, await this._combobox?.focus?.();
  }
  render() {
    const e = this.loading ? "Loading…" : this.placeholder;
    return s`
      <div class="content-type-combobox">
        <uui-combobox
          id="content-type-combobox"
          class="condition-row__control"
          label=${this.label}
          .value=${this.value}
          placeholder=${e}
          aria-describedby=${this.ariaDescribedBy || d}
          ?disabled=${this.disabled || this.loading}
          ?error=${this.error}
          @search=${Ae(this, fe, Do)}
          @change=${Ae(this, fe, Po)}
        >
          <uui-combobox-list>
            ${oe(
      this._filteredContentTypes,
      (t) => t.alias,
      (t) => Ae(this, fe, Ao).call(this, t)
    )}
            ${this._filteredContentTypes.length === 0 ? s`
                  <uui-combobox-list-option disabled value="">
                    <span class="content-type-option__empty">No matching content types</span>
                  </uui-combobox-list-option>
                ` : ""}
          </uui-combobox-list>
        </uui-combobox>
        <span class="content-type-combobox__status" aria-live="polite">
          ${this._searchStatusMessage}
        </span>
      </div>
    `;
  }
};
dt = /* @__PURE__ */ new WeakMap();
fe = /* @__PURE__ */ new WeakSet();
Ao = function(e) {
  const t = Gr(e);
  return s`
      <uui-combobox-list-option
        .value=${e.alias}
        .displayValue=${Vl(e)}
      >
        <span class="content-type-option">
          <span class="content-type-option__name">${e.name}</span>
          ${t ? s`<span class="content-type-option__alias">${e.alias}</span>` : ""}
        </span>
      </uui-combobox-list-option>
    `;
};
Do = function(e) {
  const t = e.currentTarget.search ?? "";
  xo(this, dt).call(this, t);
};
Po = function(e) {
  const t = String(
    e.currentTarget.value ?? ""
  );
  this.dispatchEvent(
    new CustomEvent("filter-content-type-change", {
      detail: { value: t },
      bubbles: !0,
      composed: !0
    })
  );
};
Oo = function(e) {
  return We(this.contentTypes).filter(
    (t) => Ul(t, e)
  );
};
ti = function(e) {
  const t = !!e.trim(), i = Ae(this, fe, Oo).call(this, e), r = eo(i, t);
  this._filteredContentTypes = r.items, this._searchStatusMessage = i.length === 0 && t ? "No matching document types." : Ze(
    r.totalCount,
    r.items.length,
    r.truncated,
    t,
    "document types"
  );
};
q.styles = [xu];
te([
  p({ type: String })
], q.prototype, "value", 2);
te([
  p({ type: Array })
], q.prototype, "contentTypes", 2);
te([
  p({ type: String })
], q.prototype, "label", 2);
te([
  p({ type: String })
], q.prototype, "placeholder", 2);
te([
  p({ type: Boolean })
], q.prototype, "disabled", 2);
te([
  p({ type: Boolean })
], q.prototype, "error", 2);
te([
  p({ type: Boolean })
], q.prototype, "loading", 2);
te([
  p({ type: String, attribute: "aria-describedby" })
], q.prototype, "ariaDescribedBy", 2);
te([
  _()
], q.prototype, "_filteredContentTypes", 2);
te([
  _()
], q.prototype, "_searchStatusMessage", 2);
te([
  $t("#content-type-combobox")
], q.prototype, "_combobox", 2);
q = te([
  Q("filter-content-type-combobox")
], q);
const _r = /* @__PURE__ */ new WeakMap();
function It(e) {
  const t = _r.get(e);
  if (t)
    return t;
  const i = Pu(e);
  return _r.set(e, i), i;
}
function mr(e) {
  return It(e);
}
function Pu(e) {
  const t = rc(e), i = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Map();
  for (const a of t)
    for (const n of a.containers)
      i.set(n.containerKey, n.elementTypes), r.set(
        n.containerKey,
        n.elementTypes.reduce(
          (l, v) => l + v.properties.length,
          0
        )
      );
  const o = e.map((a) => ({
    property: a,
    searchText: Lu(a),
    sortLabel: me(a)
  }));
  return {
    properties: e,
    grouped: t,
    searchIndex: o,
    search(a) {
      const n = a.trim().toLowerCase();
      return n ? o.filter((l) => l.searchText.includes(n)).sort(
        (l, v) => l.sortLabel.localeCompare(v.sortLabel, void 0, {
          sensitivity: "base"
        })
      ).map((l) => l.property) : [];
    },
    getBrowseGroups(a) {
      return t.map((n) => ({
        ...n,
        containers: n.containers.map(
          (l) => Ou(l, a, i)
        )
      }));
    },
    getContainerElementTypes(a) {
      return i.get(a) ?? [];
    },
    getContainerNestedPropertyCount(a) {
      return r.get(a) ?? 0;
    },
    createCollapseState(a, n) {
      return ku(
        t,
        i,
        a,
        n
      );
    }
  };
}
function Ou(e, t, i) {
  return t.has(e.containerKey) ? {
    ...e,
    elementTypes: i.get(e.containerKey) ?? e.elementTypes
  } : {
    ...e,
    elementTypes: []
  };
}
function Lu(e) {
  return [
    B(e),
    Ie(e),
    Se(e),
    me(e),
    e.alias,
    Lt(e),
    e.sourceName,
    e.containerName,
    e.elementTypeName,
    ...e.displayPath ?? [],
    (e.displayPath ?? []).join(Pe)
  ].map((i) => i?.trim().toLowerCase()).filter(Boolean).join(" ");
}
function ku(e, t, i, r) {
  if (e.length === 0)
    return {
      collapsedGroups: /* @__PURE__ */ new Set(),
      collapsedContainers: /* @__PURE__ */ new Set(),
      collapsedElementTypes: /* @__PURE__ */ new Set(),
      hydratedContainers: /* @__PURE__ */ new Set()
    };
  if (e.reduce(
    (x, K) => x + K.properties.length + K.containers.reduce(
      (O, pe) => O + (pe.containerProperty ? 1 : 0) + (t.get(pe.containerKey)?.reduce(
        (at, Ji) => at + Ji.properties.length,
        0
      ) ?? 0),
      0
    ),
    0
  ) <= r) {
    const x = /* @__PURE__ */ new Set();
    if (i)
      for (const K of e)
        for (const O of K.containers)
          ii(O, t, i) && x.add(O.containerKey);
    return {
      collapsedGroups: /* @__PURE__ */ new Set(),
      collapsedContainers: /* @__PURE__ */ new Set(),
      collapsedElementTypes: /* @__PURE__ */ new Set(),
      hydratedContainers: x
    };
  }
  const a = /* @__PURE__ */ new Set(), n = /* @__PURE__ */ new Set(), l = /* @__PURE__ */ new Set(), v = /* @__PURE__ */ new Set();
  let g;
  for (const x of e)
    if (Iu(x, t, i)) {
      g = x.name;
      break;
    }
  for (const x of e) {
    x.name !== g && a.add(x.name);
    for (const K of x.containers) {
      ii(
        K,
        t,
        i
      ) ? v.add(K.containerKey) : n.add(K.containerKey);
      const pe = t.get(K.containerKey) ?? K.elementTypes;
      for (const at of pe)
        at.properties.some(
          (As) => As.alias === i
        ) || l.add(at.elementTypeKey);
    }
  }
  return {
    collapsedGroups: a,
    collapsedContainers: n,
    collapsedElementTypes: l,
    hydratedContainers: v
  };
}
function Iu(e, t, i) {
  return i ? e.properties.some((r) => r.alias === i) ? !0 : e.containers.some(
    (r) => ii(r, t, i)
  ) : !1;
}
function ii(e, t, i) {
  return i ? e.containerProperty?.alias === i ? !0 : (t.get(e.containerKey) ?? e.elementTypes).some(
    (o) => o.properties.some((a) => a.alias === i)
  ) : !1;
}
function Lo(e, t, i) {
  const r = e.length, o = Math.min(
    t,
    r,
    i
  ), a = r > i;
  return {
    items: e.slice(0, o),
    visibleCount: o,
    totalCount: r,
    hasMore: o < r && o < i,
    truncated: a
  };
}
function Nu(e, t, i, r) {
  return Math.min(e + i, t, r);
}
function Ru(e, t, i, r = 48) {
  return e + t >= i - r;
}
const Bu = M`
  :host {
    display: block;
    width: 100%;
    min-width: 0;
  }

  .property-combobox {
    position: relative;
    width: 100%;
    min-width: 0;
  }

  .property-combobox__status {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  uui-combobox {
    width: 100%;
    min-width: 0;
  }

  .property-group {
    display: flex;
    flex-direction: column;
    min-width: 0;
    content-visibility: auto;
    contain-intrinsic-size: auto 2.5rem;
  }

  .property-group + .property-group {
    box-shadow: inset 0 1px 0 color-mix(in srgb, var(--uui-color-border) 35%, transparent);
  }

  .property-group__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--uui-size-space-2);
    width: 100%;
    margin: 0;
    padding: var(--uui-size-space-2) var(--uui-size-space-3);
    border: 0;
    background: transparent;
    color: var(--uui-color-text);
    font-size: var(--uui-type-small-size);
    font-weight: 700;
    letter-spacing: 0.04em;
    line-height: 1.2;
    text-align: left;
    text-transform: uppercase;
    cursor: pointer;
  }

  .property-group__header:hover {
    background: color-mix(in srgb, var(--uui-color-surface-alt) 65%, transparent);
  }

  .property-group__title {
    display: flex;
    align-items: center;
    gap: var(--uui-size-space-2);
    min-width: 0;
  }

  .property-group__name {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .property-group__count {
    flex-shrink: 0;
    color: var(--uui-color-text-alt);
    font-size: var(--uui-type-small-size);
    font-weight: 600;
  }

  .property-group__header uui-symbol-expand {
    flex-shrink: 0;
    color: var(--uui-color-text-alt);
  }

  .property-container {
    display: flex;
    flex-direction: column;
    min-width: 0;
    margin-top: var(--uui-size-space-1);
    border-radius: var(--uui-border-radius, 3px);
    background: color-mix(in srgb, var(--uui-color-surface-alt) 20%, transparent);
    box-shadow: inset 0 1px 0 color-mix(in srgb, var(--uui-color-border) 20%, transparent);
    content-visibility: auto;
    contain-intrinsic-size: auto 2.75rem;
  }

  .property-container__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--uui-size-space-2);
    width: 100%;
    margin: 0;
    padding: var(--uui-size-space-2) var(--uui-size-space-3);
    border: 0;
    background: transparent;
    color: var(--uui-color-text);
    font-size: var(--uui-type-default-size);
    font-weight: 700;
    line-height: 1.2;
    text-align: left;
    cursor: pointer;
  }

  .property-container__header:hover {
    background: color-mix(in srgb, var(--uui-color-surface-alt) 55%, transparent);
  }

  .property-container__title {
    display: flex;
    align-items: center;
    gap: var(--uui-size-space-2);
    min-width: 0;
  }

  .property-container__icon {
    flex-shrink: 0;
    color: var(--uui-color-text-alt);
  }

  .property-container__name {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .property-container__count {
    flex-shrink: 0;
    color: var(--uui-color-text-alt);
    font-size: var(--uui-type-small-size);
    font-weight: 600;
  }

  .property-container__header uui-symbol-expand {
    flex-shrink: 0;
    color: var(--uui-color-text-alt);
  }

  .property-container__container-option {
    margin: 0 var(--uui-size-space-2) var(--uui-size-space-1);
    padding-left: var(--uui-size-space-5);
    border-left: 2px solid color-mix(in srgb, var(--uui-color-border) 45%, transparent);
  }

  .property-element-type {
    display: flex;
    flex-direction: column;
    min-width: 0;
    margin: 0 var(--uui-size-space-2) var(--uui-size-space-1);
    padding-left: var(--uui-size-space-4);
    border-left: 2px solid color-mix(in srgb, var(--uui-color-border) 35%, transparent);
  }

  .property-element-type__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--uui-size-space-2);
    width: 100%;
    margin: 0;
    padding: var(--uui-size-space-2) var(--uui-size-space-2);
    border: 0;
    background: transparent;
    color: var(--uui-color-text);
    font-size: var(--uui-type-small-size);
    font-weight: 600;
    line-height: 1.2;
    text-align: left;
    cursor: pointer;
  }

  .property-element-type__header:hover {
    background: color-mix(in srgb, var(--uui-color-surface-alt) 45%, transparent);
    border-radius: var(--uui-border-radius, 3px);
  }

  .property-element-type__title {
    display: flex;
    align-items: center;
    gap: var(--uui-size-space-2);
    min-width: 0;
  }

  .property-element-type__icon {
    flex-shrink: 0;
    color: var(--uui-color-text-alt);
  }

  .property-element-type__name {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .property-element-type__count {
    flex-shrink: 0;
    color: var(--uui-color-text-alt);
    font-size: var(--uui-type-small-size);
    font-weight: 500;
  }

  .property-element-type__header uui-symbol-expand {
    flex-shrink: 0;
    color: var(--uui-color-text-alt);
  }

  .property-element-type__properties {
    display: flex;
    flex-direction: column;
    min-width: 0;
    padding-left: var(--uui-size-space-5);
  }

  .property-option {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    min-width: 0;
    content-visibility: auto;
    contain-intrinsic-size: auto 2.25rem;
  }

  .property-combobox__list {
    max-height: inherit;
  }

  .property-option__header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--uui-size-space-2);
    min-width: 0;
  }

  .property-option__label {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--uui-size-space-2);
    min-width: 0;
  }

  .property-source-icon {
    flex-shrink: 0;
    color: var(--uui-color-text-alt);
  }

  .property-source-icon--nested {
    --uui-icon-size: var(--uui-type-small-size);
  }

  .property-option__name {
    min-width: 0;
    color: var(--uui-color-text);
    font-size: var(--uui-type-default-size);
    line-height: 1.2;
  }

  .property-option__index-badge {
    --uui-badge-position: relative;
    --uui-badge-inset: auto;
    flex-shrink: 0;
  }

  .property-option__alias {
    color: var(--uui-color-text-alt);
    font-family: var(--uui-font-family-mono, ui-monospace, monospace);
    font-size: var(--uui-type-small-size);
    line-height: 1.2;
  }

  .property-option--container .property-option__name {
    font-weight: 600;
  }

  .property-option__breadcrumb-prefix {
    color: var(--uui-color-text-alt);
    font-weight: 400;
  }

  .property-option__breadcrumb {
    display: inline;
    min-width: 0;
  }

  .property-combobox__hint {
    margin: var(--uui-size-space-1) 0 0;
    color: var(--uui-color-text-alt);
    font-size: var(--uui-type-small-size);
    line-height: 1.35;
  }

  .property-option--nested .property-option__name {
    font-size: var(--uui-type-small-size);
    font-weight: 400;
  }

  .property-option--nested .property-option__alias {
    padding-left: var(--uui-size-space-1);
  }

  .property-option--search-result .property-option__name {
    font-weight: 500;
  }

  .property-option__context {
    padding-left: calc(var(--uui-icon-size, 1rem) + var(--uui-size-space-2));
    color: var(--uui-color-text-alt);
    font-size: var(--uui-type-small-size);
    line-height: 1.2;
  }

  .property-option--disabled .property-option__name {
    color: var(--uui-color-text-alt);
  }

  .property-option--tooltip {
    position: relative;
    outline: none;
  }

  .property-option--tooltip:focus-visible {
    border-radius: var(--uui-border-radius, 3px);
    outline: 2px solid var(--uui-color-focus);
    outline-offset: 2px;
  }

  .property-option__tooltip {
    position: absolute;
    left: 0;
    bottom: calc(100% + var(--uui-size-space-1, 3px));
    z-index: 10000;
    display: none;
    width: max-content;
    max-width: min(22rem, 70vw);
    padding: var(--uui-size-space-2) var(--uui-size-space-3);
    border-radius: var(--uui-border-radius, 3px);
    background: var(--uui-color-surface);
    color: var(--uui-color-text);
    box-shadow: var(--uui-shadow-depth-3);
    font-size: var(--uui-type-small-size);
    line-height: 1.4;
    pointer-events: none;
  }

  .property-option__tooltip-guidance {
    display: block;
    margin-top: var(--uui-size-space-2);
    color: var(--uui-color-text-alt);
  }

  .property-option--tooltip:hover .property-option__tooltip,
  .property-option--tooltip:focus-visible .property-option__tooltip,
  .property-option--tooltip:focus-within .property-option__tooltip {
    display: block;
  }

  .property-option__empty {
    color: var(--uui-color-text-alt);
    font-size: var(--uui-type-small-size);
    font-style: italic;
    line-height: 1.2;
  }

  .property-block-grid-tree {
    display: flex;
    flex-direction: column;
    gap: var(--uui-size-space-2);
    min-width: 0;
    padding: var(--uui-size-space-2) var(--uui-size-space-3) var(--uui-size-space-3);
  }

  .property-block-grid-tree__element-type {
    display: flex;
    flex-direction: column;
    gap: var(--uui-size-space-1);
    min-width: 0;
  }

  .property-block-grid-tree__element-type-name {
    color: var(--uui-color-text);
    font-size: var(--uui-type-small-size);
    font-weight: 600;
    line-height: 1.3;
  }

  .property-block-grid-tree__properties {
    display: flex;
    flex-direction: column;
    gap: var(--uui-size-space-1);
    min-width: 0;
    padding-left: var(--uui-size-space-2);
  }

  .property-block-grid-tree__property {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    min-width: 0;
  }

  .property-block-grid-tree__property-line {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: var(--uui-size-space-2);
    min-width: 0;
  }

  .property-block-grid-tree__glyph {
    flex-shrink: 0;
    width: 1.25rem;
    color: var(--uui-color-text-alt);
    font-family: var(--uui-font-family-mono, ui-monospace, monospace);
    font-size: var(--uui-type-small-size);
    line-height: 1.2;
    text-align: center;
  }

  .property-block-grid-tree__glyph--continuation {
    color: color-mix(in srgb, var(--uui-color-text-alt) 70%, transparent);
  }

  .property-block-grid-tree__property-name {
    min-width: 0;
    color: var(--uui-color-text);
    font-size: var(--uui-type-small-size);
    line-height: 1.2;
  }

  .property-block-grid-tree__property-alias {
    padding-left: calc(1.25rem + var(--uui-size-space-2));
    color: var(--uui-color-text-alt);
    font-family: var(--uui-font-family-mono, ui-monospace, monospace);
    font-size: var(--uui-type-small-size);
    line-height: 1.2;
  }

  .property-block-grid-tree__property--info {
    position: relative;
    padding: var(--uui-size-space-1) 0;
    color: var(--uui-color-text-alt);
    cursor: default;
    user-select: none;
  }

  .property-block-grid-tree__property--info .property-block-grid-tree__property-name {
    color: var(--uui-color-text-alt);
  }

  .property-block-grid-tree__property--info:hover .property-option__tooltip,
  .property-block-grid-tree__property--info:focus-within .property-option__tooltip {
    display: block;
  }

  .property-block-grid-tree__index-badge {
    color: var(--uui-color-warning, #f0ad4e);
    font-size: var(--uui-type-small-size);
    line-height: 1.2;
  }

  .property-block-grid-tree__selectable-option {
    min-width: 0;
  }

  .property-block-grid-tree__property--selectable .property-block-grid-tree__property-name {
    font-weight: 500;
  }

  .property-block-grid-tree__container-search {
    display: flex;
    flex-direction: column;
    gap: var(--uui-size-space-1);
    min-width: 0;
    margin-top: var(--uui-size-space-2);
    padding-top: var(--uui-size-space-2);
    border-top: 1px solid color-mix(in srgb, var(--uui-color-border) 35%, transparent);
  }

  .property-block-grid-tree__container-search-label {
    margin: 0;
    color: var(--uui-color-text);
    font-size: var(--uui-type-small-size);
    font-weight: 600;
    line-height: 1.3;
  }

  .property-block-grid-tree__container-search-item {
    display: flex;
    align-items: center;
    gap: var(--uui-size-space-2);
    min-width: 0;
  }

  .property-block-grid-tree__marker {
    flex-shrink: 0;
    width: 1.25rem;
    font-size: var(--uui-type-small-size);
    line-height: 1.2;
    text-align: center;
  }

  .property-block-grid-tree__marker--positive {
    color: var(--uui-color-positive, #2bc37c);
    font-weight: 700;
  }
`, ko = "This property cannot be searched yet.", Io = Nr, Mu = Ir;
function Oe(e) {
  return e && we(e) ? Pt : `${ko} ${Io}`;
}
function Nt() {
  return Mu;
}
var Fu = Object.defineProperty, zu = Object.getOwnPropertyDescriptor, No = (e) => {
  throw TypeError(e);
}, I = (e, t, i, r) => {
  for (var o = r > 1 ? void 0 : r ? zu(t, i) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (o = (r ? n(t, i, o) : n(o)) || o);
  return r && o && Fu(t, i, o), o;
}, xi = (e, t, i) => t.has(e) || No("Cannot " + i), ne = (e, t, i) => (xi(e, t, "read from private field"), i ? i.call(e) : t.get(e)), st = (e, t, i) => t.has(e) ? No("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), Be = (e, t, i, r) => (xi(e, t, "write to private field"), t.set(e, i), i), f = (e, t, i) => (xi(e, t, "access private method"), i), X, Ve, ht, h, Ro, Bo, Mo, Fo, zo, Vo, Uo, Go, Ho, Ko, Yo, Rt, Ai, qo, Di, Wo, Bt, Mt, jo, ri, Pi, Xo, Jo, Qe, Oi, Zo, Qo, oi, Ue, ai, ea, Li, ta, ki, Ft, zt;
let P = class extends ee {
  constructor() {
    super(...arguments), st(this, h), this.value = "", this.properties = [], this.label = "Field", this.placeholder = Br, this.disabled = !1, this.error = !1, this.loading = !1, this.ariaDescribedBy = "", this.hiddenPropertiesHint = "", this._filteredGroups = [], this._flatSearchResults = [], this._searchMatchCount = 0, this._searchVisibleCount = Me, this._hydratedContainers = /* @__PURE__ */ new Set(), this._collapsedGroups = /* @__PURE__ */ new Set(), this._collapsedContainers = /* @__PURE__ */ new Set(), this._collapsedElementTypes = /* @__PURE__ */ new Set(), this._isSearching = !1, this._searchStatusMessage = "", st(this, X), st(this, Ve, []), st(this, ht, yi((e) => {
      f(this, h, ri).call(this, e);
    }, mi));
  }
  updated(e) {
    if (e.has("properties")) {
      Be(this, X, It(this.properties)), this._isSearching = !1, this._flatSearchResults = [], this._searchMatchCount = 0, this._searchVisibleCount = Me;
      const t = ne(this, X).createCollapseState(
        this.value,
        qs
      );
      this._collapsedGroups = new Set(t.collapsedGroups), this._collapsedContainers = new Set(t.collapsedContainers), this._collapsedElementTypes = new Set(t.collapsedElementTypes), this._hydratedContainers = new Set(t.hydratedContainers), f(this, h, ri).call(this, "");
    }
  }
  disconnectedCallback() {
    ne(this, ht).cancel(), super.disconnectedCallback();
  }
  async focus() {
    await this.updateComplete, await this._combobox?.focus?.();
  }
  render() {
    const e = this.loading ? "Loading…" : this.placeholder, t = this._isSearching ? this._flatSearchResults.length > 0 : this._filteredGroups.some((i) => f(this, h, ki).call(this, i));
    return s`
      <div class="property-combobox">
        <uui-combobox
          id="property-combobox"
          class="condition-row__control"
          label=${this.label}
          .value=${this.value}
          placeholder=${e}
          aria-describedby=${this.ariaDescribedBy || d}
          ?disabled=${this.disabled || this.loading}
          ?error=${this.error}
          @search=${f(this, h, jo)}
          @change=${f(this, h, Qo)}
        >
          <uui-combobox-list
            id="property-combobox-list"
            class="property-combobox__list"
            @scroll=${f(this, h, Jo)}
          >
            ${this._isSearching ? oe(
      this._flatSearchResults,
      (i) => i.alias,
      (i) => f(this, h, Yo).call(this, i)
    ) : oe(
      this._filteredGroups,
      (i) => i.name,
      (i) => f(this, h, Ro).call(this, i)
    )}
            ${t ? d : s`
                  <uui-combobox-list-option disabled value="">
                    <span class="property-option__empty">
                      ${f(this, h, Wo).call(this)}
                    </span>
                  </uui-combobox-list-option>
                `}
          </uui-combobox-list>
        </uui-combobox>
        ${this.hiddenPropertiesHint ? s`<p class="property-combobox__hint">${this.hiddenPropertiesHint}</p>` : d}
        <span class="property-combobox__status" aria-live="polite">
          ${this._searchStatusMessage}
        </span>
      </div>
    `;
  }
};
X = /* @__PURE__ */ new WeakMap();
Ve = /* @__PURE__ */ new WeakMap();
ht = /* @__PURE__ */ new WeakMap();
h = /* @__PURE__ */ new WeakSet();
Ro = function(e) {
  if (!f(this, h, ki).call(this, e))
    return d;
  const t = f(this, h, ea).call(this, e.name);
  return s`
      <div class="property-group">
        <button
          type="button"
          class="property-group__header"
          aria-expanded=${!t}
          @click=${(i) => f(this, h, oi).call(this, i, e.name)}
          @keydown=${(i) => f(this, h, Qe).call(this, i, () => f(this, h, oi).call(this, i, e.name))}
        >
          <span class="property-group__title">
            <uui-icon
              class="property-source-icon"
              name=${Bl(e.name)}
              title=${Fl(e.name)}
            ></uui-icon>
            <span class="property-group__name">${e.name}</span>
          </span>
          <span class="property-group__count">(${f(this, h, Ft).call(this, e)})</span>
          <uui-symbol-expand .open=${!t}></uui-symbol-expand>
        </button>
        ${t ? d : s`
              ${oe(
    e.properties,
    (i) => i.alias,
    (i) => f(this, h, Rt).call(this, i)
  )}
              ${oe(
    e.containers,
    (i) => i.containerKey,
    (i) => f(this, h, Bo).call(this, i)
  )}
            `}
      </div>
    `;
};
Bo = function(e) {
  if (f(this, h, Mo).call(this, e))
    return f(this, h, Fo).call(this, e);
  const t = f(this, h, Li).call(this, e.containerKey), i = Wr(e), r = jr(e);
  return s`
      <div class="property-container">
        <button
          type="button"
          class="property-container__header"
          aria-expanded=${!t}
          @click=${(o) => f(this, h, Ue).call(this, o, e.containerKey)}
          @keydown=${(o) => f(this, h, Qe).call(this, o, () => f(this, h, Ue).call(this, o, e.containerKey))}
        >
          <span class="property-container__title">
            <uui-icon
              class="property-container__icon"
              name=${r}
            ></uui-icon>
            <span class="property-container__name">${i}</span>
          </span>
          <span class="property-container__count"
            >(${f(this, h, zt).call(this, e)})</span
          >
          <uui-symbol-expand .open=${!t}></uui-symbol-expand>
        </button>
        ${t ? d : s`
              ${e.containerProperty ? s`
                    <div class="property-container__container-option">
                      ${f(this, h, Rt).call(this, e.containerProperty, {
    isContainer: !0
  })}
                    </div>
                  ` : d}
              ${oe(
    f(this, h, Oi).call(this, e),
    (o) => o.elementTypeKey,
    (o) => f(this, h, Ko).call(this, o)
  )}
            `}
      </div>
    `;
};
Mo = function(e) {
  return e.containerProperty ? Xe(e.containerProperty) : e.containerEditorLabel === ce;
};
Fo = function(e) {
  const t = f(this, h, Li).call(this, e.containerKey), i = Wr(e), r = jr(e), o = f(this, h, Oi).call(this, e);
  return s`
      <div class="property-container property-container--block-grid">
        <button
          type="button"
          class="property-container__header"
          aria-expanded=${!t}
          @click=${(a) => f(this, h, Ue).call(this, a, e.containerKey)}
          @keydown=${(a) => f(this, h, Qe).call(this, a, () => f(this, h, Ue).call(this, a, e.containerKey))}
        >
          <span class="property-container__title">
            <uui-icon
              class="property-container__icon"
              name=${r}
            ></uui-icon>
            <span class="property-container__name">${i}</span>
          </span>
          <span class="property-container__count"
            >(${f(this, h, zt).call(this, e)})</span
          >
          <uui-symbol-expand .open=${!t}></uui-symbol-expand>
        </button>
        ${t ? d : s`
              <div class="property-block-grid-tree" role="tree">
                ${oe(
    o,
    (a) => a.elementTypeKey,
    (a) => f(this, h, zo).call(this, a)
  )}
                ${f(this, h, Ho).call(this, e)}
              </div>
            `}
      </div>
    `;
};
zo = function(e) {
  const t = e.properties;
  return s`
      <div
        class="property-block-grid-tree__element-type"
        role="group"
        aria-label=${e.elementTypeName}
      >
        <div class="property-block-grid-tree__element-type-name">
          ${e.elementTypeName}
        </div>
        <div class="property-block-grid-tree__properties" role="group">
          ${oe(
    t,
    (i) => i.alias,
    (i, r) => f(this, h, Vo).call(this, i, r, t.length)
  )}
        </div>
      </div>
    `;
};
Vo = function(e, t, i) {
  const r = t === i - 1, o = r ? "└" : "├", a = r ? " " : "│";
  if (J(e))
    return f(this, h, Uo).call(this, e, o);
  const n = Ie(e), l = f(this, h, Bt).call(this, e.alias);
  return s`
      <div
        class="property-block-grid-tree__property property-block-grid-tree__property--info"
        role="treeitem"
        aria-disabled="true"
        aria-describedby=${l}
        title=${Oe(e)}
      >
        <div class="property-block-grid-tree__property-line">
          <span class="property-block-grid-tree__glyph" aria-hidden="true"
            >${o}</span
          >
          <span class="property-block-grid-tree__property-name"
            >${n}</span
          >
        </div>
        <div class="property-block-grid-tree__property-line">
          <span
            class="property-block-grid-tree__glyph property-block-grid-tree__glyph--continuation"
            aria-hidden="true"
            >${a}</span
          >
          ${f(this, h, Go).call(this, e)}
        </div>
        <span id=${l} class="property-option__tooltip" role="tooltip">
          <span class="property-option__tooltip-message"
            >${Pt}</span
          >
        </span>
      </div>
    `;
};
Uo = function(e, t) {
  const i = B(e), r = Ie(e), o = Si(e);
  return s`
      <uui-combobox-list-option
        class="property-block-grid-tree__selectable-option"
        .value=${e.alias}
        .displayValue=${i}
        role="treeitem"
        title=${Nt()}
      >
        <span class="property-block-grid-tree__property property-block-grid-tree__property--selectable">
          <span class="property-block-grid-tree__property-line">
            <span class="property-block-grid-tree__glyph" aria-hidden="true"
              >${t}</span
            >
            <span class="property-block-grid-tree__property-name"
              >${r}</span
            >
            ${f(this, h, Mt).call(this, e)}
          </span>
          ${o ? s`<span class="property-block-grid-tree__property-alias"
                >${e.alias}</span
              >` : d}
        </span>
      </uui-combobox-list-option>
    `;
};
Go = function(e) {
  return s`
      <span
        class="property-block-grid-tree__index-badge"
        title=${Oe(e)}
      >
        ${Mr}
      </span>
    `;
};
Ho = function(e) {
  const t = e.containerProperty;
  if (!t)
    return d;
  const i = B(t), r = B(t);
  return s`
      <div class="property-block-grid-tree__container-search" role="group">
        <p class="property-block-grid-tree__container-search-label">
          ${Ws}
        </p>
        <uui-combobox-list-option
          class="property-block-grid-tree__selectable-option"
          .value=${t.alias}
          .displayValue=${i}
          role="treeitem"
        >
          <span
            class="property-block-grid-tree__container-search-item property-block-grid-tree__property--selectable"
          >
            <span
              class="property-block-grid-tree__marker property-block-grid-tree__marker--positive"
              aria-hidden="true"
              >✓</span
            >
            <span class="property-block-grid-tree__property-name"
              >${r}</span
            >
          </span>
        </uui-combobox-list-option>
      </div>
    `;
};
Ko = function(e) {
  const t = f(this, h, ta).call(this, e.elementTypeKey);
  return s`
      <div class="property-element-type">
        <button
          type="button"
          class="property-element-type__header"
          aria-expanded=${!t}
          @click=${(i) => f(this, h, ai).call(this, i, e.elementTypeKey)}
          @keydown=${(i) => f(this, h, Qe).call(this, i, () => f(this, h, ai).call(this, i, e.elementTypeKey))}
        >
          <span class="property-element-type__title">
            <uui-icon
              class="property-element-type__icon"
              name=${js}
            ></uui-icon>
            <span class="property-element-type__name"
              >${e.elementTypeName}</span
            >
          </span>
          <span class="property-element-type__count"
            >(${e.properties.length})</span
          >
          <uui-symbol-expand .open=${!t}></uui-symbol-expand>
        </button>
        ${t ? d : s`
              <div class="property-element-type__properties">
                ${oe(
    e.properties,
    (i) => i.alias,
    (i) => f(this, h, Rt).call(this, i, { nestedInBlock: !0 })
  )}
              </div>
            `}
      </div>
    `;
};
Yo = function(e) {
  const t = me(e), i = B(e), r = Xl(e), o = r ? Xr(e) : void 0, a = Si(e), n = J(e), l = Fe(e) === "notIndexed", v = Fe(e) === "indexed", g = l ? f(this, h, Bt).call(this, e.alias) : void 0, x = l ? Oe(e) : v ? Nt() : void 0;
  return s`
      <uui-combobox-list-option
        .value=${e.alias}
        .displayValue=${i}
        ?disabled=${!n}
        title=${x ?? d}
      >
        <span
          class="property-option property-option--search-result ${n ? "" : "property-option--disabled"} ${l ? "property-option--tooltip" : ""}"
          aria-describedby=${g ?? d}
        >
          <span class="property-option__header">
            ${f(this, h, Ai).call(this, e)}
            <span class="property-option__label">
              <span class="property-option__name">${t}</span>
              ${f(this, h, Mt).call(this, e)}
            </span>
          </span>
          ${r && o ? s`<span class="property-option__context">${o}</span>` : d}
          ${a ? s`<span class="property-option__alias">${e.alias}</span>` : d}
          ${l && g ? f(this, h, Di).call(this, e, g) : d}
        </span>
      </uui-combobox-list-option>
    `;
};
Rt = function(e, t = {}) {
  const { isContainer: i = !1, nestedInBlock: r = !1 } = t, o = B(e), a = Si(e), n = J(e), l = Fe(e) === "notIndexed", v = Fe(e) === "indexed", g = l ? f(this, h, Bt).call(this, e.alias) : void 0, x = l ? Oe(e) : v ? Nt() : void 0;
  return s`
      <uui-combobox-list-option
        .value=${e.alias}
        .displayValue=${o}
        ?disabled=${!n}
        title=${x ?? d}
      >
        <span
          class="property-option ${i ? "property-option--container" : ""} ${r ? "property-option--nested" : ""} ${n ? "" : "property-option--disabled"} ${l ? "property-option--tooltip" : ""}"
          aria-describedby=${g ?? d}
        >
          <span class="property-option__header">
            ${f(this, h, Ai).call(this, e, r)}
            <span class="property-option__label">
              ${f(this, h, qo).call(this, e, { nestedInBlock: r, isContainer: i })}
              ${f(this, h, Mt).call(this, e)}
            </span>
          </span>
          ${a ? s`<span class="property-option__alias">${e.alias}</span>` : ""}
          ${l && g ? f(this, h, Di).call(this, e, g) : d}
        </span>
      </uui-combobox-list-option>
    `;
};
Ai = function(e, t = !1) {
  return s`
      <uui-icon
        class="property-source-icon ${t ? "property-source-icon--nested" : ""}"
        name=${gi(e)}
        title=${Ml(e)}
      ></uui-icon>
    `;
};
qo = function(e, t = {}) {
  const { nestedInBlock: i = !1, isContainer: r = !1 } = t;
  if (i) {
    const a = jl(e);
    if (a.prefix)
      return s`
          <span class="property-option__breadcrumb">
            <span class="property-option__breadcrumb-prefix"
              >${a.prefix} › </span
            >
            <span class="property-option__name">${a.leaf}</span>
          </span>
        `;
  }
  const o = r ? B(e) : i ? Ie(e) : B(e);
  return s`<span class="property-option__name">${o}</span>`;
};
Di = function(e, t) {
  return we(e) ? s`
        <span id=${t} class="property-option__tooltip" role="tooltip">
          <span class="property-option__tooltip-message"
            >${Pt}</span
          >
        </span>
      ` : s`
      <span id=${t} class="property-option__tooltip" role="tooltip">
        <span class="property-option__tooltip-message"
          >${ko}</span
        >
        <span class="property-option__tooltip-guidance"
          >${Io}</span
        >
      </span>
    `;
};
Wo = function() {
  return this._isSearching ? "No matching properties." : this.hiddenPropertiesHint ? `No searchable properties shown. ${Xs}` : "No matching properties.";
};
Bt = function(e) {
  return `block-property-tooltip-${e.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
};
Mt = function(e) {
  const t = Fe(e);
  return t === "indexed" ? s`
        <uui-badge
          class="property-option__index-badge"
          color="positive"
          look="secondary"
          label=${er}
          title=${Nt()}
        >
          ${er}
        </uui-badge>
      ` : t === "notIndexed" ? we(e) ? s`
          <uui-badge
            class="property-option__index-badge"
            color="warning"
            look="secondary"
            label=${Rr}
            title=${Oe(e)}
          >
            ${Mr}
          </uui-badge>
        ` : s`
        <uui-badge
          class="property-option__index-badge"
          look="placeholder"
          label=${tr}
          title=${Oe(e)}
        >
          ${tr}
        </uui-badge>
      ` : d;
};
jo = function(e) {
  const t = e.currentTarget.search ?? "";
  ne(this, ht).call(this, t);
};
ri = function(e) {
  if (ne(this, X) ?? Be(this, X, It(this.properties)), this._isSearching = !!e.trim(), this._isSearching) {
    const t = Zl(
      this.properties,
      e,
      ne(this, X)
    );
    Be(this, Ve, t);
    const i = Lo(
      t,
      Me,
      Wt
    );
    this._searchMatchCount = i.totalCount, this._searchVisibleCount = i.visibleCount, this._flatSearchResults = i.items, this._filteredGroups = [], this._searchStatusMessage = i.totalCount === 0 ? "No matching properties." : Ze(
      i.totalCount,
      i.visibleCount,
      i.truncated || i.hasMore,
      !0,
      "properties"
    );
    return;
  }
  this._flatSearchResults = [], this._searchMatchCount = 0, this._searchVisibleCount = Me, Be(this, Ve, []), f(this, h, Pi).call(this);
};
Pi = function() {
  ne(this, X) ?? Be(this, X, It(this.properties));
  const e = ne(this, X).getBrowseGroups(this._hydratedContainers), t = Cc(e);
  this._filteredGroups = t.groups;
  const i = t.groups.reduce(
    (r, o) => r + f(this, h, Ft).call(this, o),
    0
  );
  this._searchStatusMessage = t.totalPropertyCount === 0 ? "" : Ze(
    t.totalPropertyCount,
    i,
    t.truncated,
    !1,
    "properties"
  );
};
Xo = function() {
  if (!this._isSearching || !ne(this, X))
    return;
  const e = Nu(
    this._searchVisibleCount,
    this._searchMatchCount,
    Me,
    Wt
  );
  if (e === this._searchVisibleCount)
    return;
  const t = Lo(
    ne(this, Ve),
    e,
    Wt
  );
  this._searchVisibleCount = t.visibleCount, this._flatSearchResults = t.items, this._searchStatusMessage = Ze(
    t.totalCount,
    t.visibleCount,
    t.truncated || t.hasMore,
    !0,
    "properties"
  );
};
Jo = function(e) {
  if (!this._isSearching)
    return;
  const t = e.currentTarget;
  Ru(
    t.scrollTop,
    t.clientHeight,
    t.scrollHeight
  ) && f(this, h, Xo).call(this);
};
Qe = function(e, t) {
  e.key !== "Enter" && e.key !== " " || (e.preventDefault(), e.stopPropagation(), t());
};
Oi = function(e) {
  return this._hydratedContainers.has(e.containerKey) ? ne(this, X)?.getContainerElementTypes(e.containerKey) ?? e.elementTypes : e.elementTypes;
};
Zo = function(e) {
  if (this._hydratedContainers.has(e))
    return;
  const t = new Set(this._hydratedContainers);
  t.add(e), this._hydratedContainers = t, this._isSearching || f(this, h, Pi).call(this);
};
Qo = function(e) {
  const t = String(
    e.currentTarget.value ?? ""
  ), i = this.properties.find(
    (r) => r.alias === t
  );
  i && !J(i) || this.dispatchEvent(
    new CustomEvent("filter-property-change", {
      detail: { value: t },
      bubbles: !0,
      composed: !0
    })
  );
};
oi = function(e, t) {
  e.preventDefault(), e.stopPropagation();
  const i = new Set(this._collapsedGroups);
  i.has(t) ? i.delete(t) : i.add(t), this._collapsedGroups = i;
};
Ue = function(e, t) {
  e.preventDefault(), e.stopPropagation();
  const i = new Set(this._collapsedContainers);
  i.has(t) ? (i.delete(t), f(this, h, Zo).call(this, t)) : i.add(t), this._collapsedContainers = i;
};
ai = function(e, t) {
  e.preventDefault(), e.stopPropagation();
  const i = new Set(this._collapsedElementTypes);
  i.has(t) ? i.delete(t) : i.add(t), this._collapsedElementTypes = i;
};
ea = function(e) {
  return this._collapsedGroups.has(e);
};
Li = function(e) {
  return this._collapsedContainers.has(e);
};
ta = function(e) {
  return this._collapsedElementTypes.has(e);
};
ki = function(e) {
  return f(this, h, Ft).call(this, e) > 0;
};
Ft = function(e) {
  const t = e.containers.filter(
    (r) => r.containerProperty
  ).length, i = e.containers.reduce(
    (r, o) => r + f(this, h, zt).call(this, o),
    0
  );
  return e.properties.length + t + i;
};
zt = function(e) {
  const t = this._hydratedContainers.has(e.containerKey) ? ze(e) : ne(this, X)?.getContainerNestedPropertyCount(
    e.containerKey
  ) ?? ze(e);
  return (e.containerProperty ? 1 : 0) + t;
};
P.styles = [Bu];
I([
  p({ type: String })
], P.prototype, "value", 2);
I([
  p({ type: Array })
], P.prototype, "properties", 2);
I([
  p({ type: String })
], P.prototype, "label", 2);
I([
  p({ type: String })
], P.prototype, "placeholder", 2);
I([
  p({ type: Boolean })
], P.prototype, "disabled", 2);
I([
  p({ type: Boolean })
], P.prototype, "error", 2);
I([
  p({ type: Boolean })
], P.prototype, "loading", 2);
I([
  p({ type: String, attribute: "aria-describedby" })
], P.prototype, "ariaDescribedBy", 2);
I([
  p({ type: String })
], P.prototype, "hiddenPropertiesHint", 2);
I([
  _()
], P.prototype, "_filteredGroups", 2);
I([
  _()
], P.prototype, "_flatSearchResults", 2);
I([
  _()
], P.prototype, "_searchMatchCount", 2);
I([
  _()
], P.prototype, "_searchVisibleCount", 2);
I([
  _()
], P.prototype, "_hydratedContainers", 2);
I([
  _()
], P.prototype, "_collapsedGroups", 2);
I([
  _()
], P.prototype, "_collapsedContainers", 2);
I([
  _()
], P.prototype, "_collapsedElementTypes", 2);
I([
  _()
], P.prototype, "_isSearching", 2);
I([
  _()
], P.prototype, "_searchStatusMessage", 2);
I([
  $t("#property-combobox")
], P.prototype, "_combobox", 2);
P = I([
  Q("filter-property-combobox")
], P);
const Vu = [
  $e,
  M`
    :host {
      display: block;
      width: 100%;
      min-width: 0;
    }

    .property-information {
      margin-top: var(--uui-size-space-2);
      margin-left: calc(3.25rem + var(--uui-size-space-3));
      display: flex;
      flex-direction: column;
      gap: var(--uui-size-space-2);
    }

    .property-information__summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
      gap: var(--uui-size-space-2) var(--uui-size-space-3);
      padding: var(--uui-size-space-2) var(--uui-size-space-3);
      border-radius: var(--fn-radius);
      background: var(--fn-surface-inset);
      box-shadow: inset 0 0 0 1px
        color-mix(in srgb, var(--uui-color-border) 35%, transparent);
    }

    .property-information__summary-item {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
      min-width: 0;
    }

    .property-information__summary-label {
      margin: 0;
      color: var(--uui-color-text-alt);
      font-size: var(--uui-type-small-size);
      font-weight: 600;
      line-height: 1.2;
    }

    .property-information__summary-value {
      margin: 0;
      color: var(--uui-color-text);
      font-size: var(--uui-type-small-size);
      line-height: 1.3;
      overflow-wrap: anywhere;
    }

    .property-information__summary-value--source {
      display: flex;
      align-items: center;
      gap: var(--uui-size-space-1);
    }

    .property-information__source-icon {
      flex-shrink: 0;
      color: var(--uui-color-text-alt);
    }

    .property-information__summary-value--positive {
      color: var(--uui-color-positive, #007e3a);
      font-weight: 600;
    }

    .property-information__summary-value--muted {
      color: var(--uui-color-text-alt);
      font-weight: 600;
    }

    .property-information__search-summary {
      padding: var(--uui-size-space-2) var(--uui-size-space-3);
      border-radius: var(--fn-radius);
      background: var(--fn-surface-inset);
      box-shadow: inset 0 0 0 1px
        color-mix(in srgb, var(--uui-color-border) 35%, transparent);
    }

    .property-information__search-summary-title {
      margin: 0 0 var(--uui-size-space-2);
      color: var(--uui-color-text-alt);
      font-size: var(--uui-type-small-size);
      font-weight: 700;
      letter-spacing: 0.04em;
      line-height: 1.2;
      text-transform: uppercase;
    }

    .property-information__search-summary-sections {
      display: grid;
      gap: var(--uui-size-space-2);
    }

    .property-information__section-toggle {
      display: inline-flex;
      align-items: center;
      gap: var(--uui-size-space-2);
      width: 100%;
      margin: 0;
      padding: var(--uui-size-space-1) var(--uui-size-space-2);
      border: 0;
      border-radius: var(--fn-radius);
      background: var(--fn-surface-inset);
      box-shadow: inset 0 0 0 1px
        color-mix(in srgb, var(--uui-color-border) 35%, transparent);
      color: var(--uui-color-text-alt);
      font-size: var(--uui-type-small-size);
      font-weight: 600;
      line-height: 1.2;
      text-align: left;
      cursor: pointer;
    }

    .property-information__section-toggle:hover {
      color: var(--uui-color-text);
    }

    .property-information__section-panel {
      padding: var(--uui-size-space-2) var(--uui-size-space-3);
      border-radius: var(--fn-radius);
      background: var(--fn-surface-inset);
      box-shadow: inset 0 0 0 1px
        color-mix(in srgb, var(--uui-color-border) 35%, transparent);
    }

    .property-information__list {
      display: grid;
      grid-template-columns: minmax(6.5rem, auto) minmax(0, 1fr);
      gap: var(--uui-size-space-1) var(--uui-size-space-3);
      margin: 0;
    }

    .property-information__term {
      margin: 0;
      color: var(--uui-color-text-alt);
      font-size: var(--uui-type-small-size);
      font-weight: 600;
      line-height: 1.3;
    }

    .property-information__value {
      margin: 0;
      color: var(--uui-color-text);
      font-size: var(--uui-type-small-size);
      line-height: 1.3;
      overflow-wrap: anywhere;
    }

    .property-information__value--mono {
      font-family: var(--uui-font-family-mono, ui-monospace, monospace);
      font-weight: 500;
    }

    .property-information__description {
      margin: var(--uui-size-space-1) 0 0;
      color: var(--uui-color-text-alt);
      font-size: var(--uui-type-small-size);
      font-weight: 400;
      line-height: 1.35;
    }

    .property-information__subsection-title {
      margin: var(--uui-size-space-2) 0 var(--uui-size-space-1);
      color: var(--uui-color-text);
      font-size: var(--uui-type-small-size);
      font-weight: 700;
      line-height: 1.2;
    }

    .property-information__subsection-title:first-child {
      margin-top: 0;
    }

    .property-information__subsection-title--examine {
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    .property-information__item-list {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .property-information__item {
      display: flex;
      align-items: flex-start;
      gap: var(--uui-size-space-1);
      color: var(--uui-color-text);
      font-size: var(--uui-type-small-size);
      line-height: 1.3;
      overflow-wrap: anywhere;
    }

    .property-information__marker {
      flex-shrink: 0;
      width: 0.875rem;
      font-weight: 700;
      line-height: 1.3;
      text-align: center;
    }

    .property-information__item--positive .property-information__marker {
      color: var(--uui-color-positive, #007e3a);
    }

    .property-information__item--negative .property-information__marker,
    .property-information__item--warning .property-information__marker {
      color: var(--uui-color-text-alt);
    }

    .property-information__item--warning .property-information__marker {
      color: var(--uui-color-warning, #f5a524);
    }

    .property-information__empty {
      margin: 0;
      color: var(--uui-color-text-alt);
      font-size: var(--uui-type-small-size);
      font-style: italic;
      line-height: 1.3;
    }

    .property-information__tip,
    .property-information__guidance-intro,
    .property-information__guidance-lead,
    .property-information__guidance-outcome {
      margin: 0;
      color: var(--uui-color-text-alt);
      font-size: var(--uui-type-small-size);
      line-height: 1.35;
    }

    .property-information__guidance {
      display: flex;
      flex-direction: column;
      gap: var(--uui-size-space-1);
      margin-top: var(--uui-size-space-2);
    }

    .property-information__operator-list {
      display: flex;
      flex-wrap: wrap;
      gap: var(--uui-size-space-1);
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .property-information__operator-list li {
      padding: 0.125rem var(--uui-size-space-2);
      border-radius: var(--fn-radius);
      background: color-mix(in srgb, var(--uui-color-surface) 80%, transparent);
      color: var(--uui-color-text);
      font-size: var(--uui-type-small-size);
      line-height: 1.3;
    }

    .property-information__example {
      display: flex;
      flex-wrap: wrap;
      gap: var(--uui-size-space-1);
      padding: var(--uui-size-space-1) var(--uui-size-space-2);
      border-radius: var(--fn-radius);
      background: color-mix(in srgb, var(--uui-color-surface) 80%, transparent);
    }

    .property-information__example-line {
      color: var(--uui-color-text);
      font-size: var(--uui-type-small-size);
      font-weight: 600;
      line-height: 1.3;
    }

    .property-information__example-line--value {
      font-family: var(--uui-font-family-mono, ui-monospace, monospace);
      font-weight: 500;
    }

    .property-information__editor-label {
      margin-left: var(--uui-size-space-1);
      color: var(--uui-color-text-alt);
      font-weight: 500;
    }

    @media (max-width: 48rem) {
      .property-information {
        margin-left: 0;
      }

      .property-information__summary {
        grid-template-columns: 1fr 1fr;
      }

      .property-information__list {
        grid-template-columns: 1fr;
      }
    }
  `
];
var Uu = Object.defineProperty, Gu = Object.getOwnPropertyDescriptor, ia = (e) => {
  throw TypeError(e);
}, et = (e, t, i, r) => {
  for (var o = r > 1 ? void 0 : r ? Gu(t, i) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (o = (r ? n(t, i, o) : n(o)) || o);
  return r && o && Uu(t, i, o), o;
}, Hu = (e, t, i) => t.has(e) || ia("Cannot " + i), Ku = (e, t, i) => t.has(e) ? ia("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), N = (e, t, i) => (Hu(e, t, "access private method"), i), L, ra, oa, ni, aa, na, sa, la, ca, ua, pa, Ge, si, da, ha, fa;
let Ee = class extends ee {
  constructor() {
    super(...arguments), Ku(this, L), this._propertyInformationOpen = !1, this._developerDiagnosticsOpen = !1;
  }
  render() {
    const e = this.details;
    if (!e)
      return d;
    const t = this.blockDiagnostics, i = N(this, L, da).call(this, e, t);
    return s`
      <section class="property-information" aria-label="Property information">
        ${N(this, L, ra).call(this, e)}
        ${t ? N(this, L, oa).call(this, t) : d}
        ${N(this, L, ni).call(this, Js, this._propertyInformationOpen, () => N(this, L, ha).call(this), N(this, L, aa).call(this, e, t))}
        ${i ? N(this, L, ni).call(this, Zs, this._developerDiagnosticsOpen, () => N(this, L, fa).call(this), N(this, L, la).call(this, e, t)) : d}
      </section>
    `;
  }
};
L = /* @__PURE__ */ new WeakSet();
ra = function(e) {
  return s`
      <div class="property-information__summary" aria-label="Property summary">
        <div class="property-information__summary-item">
          <p class="property-information__summary-label">
            ${Qs}
          </p>
          <p
            class="property-information__summary-value ${e.searchable ? "property-information__summary-value--positive" : "property-information__summary-value--muted"}"
          >
            ${e.searchable ? "✓ Searchable" : e.searchableLabel}
          </p>
        </div>
        <div class="property-information__summary-item">
          <p class="property-information__summary-label">
            ${el}
          </p>
          <p class="property-information__summary-value">${e.propertyType}</p>
        </div>
        <div class="property-information__summary-item">
          <p class="property-information__summary-label">
            ${tl}
          </p>
          <p
            class="property-information__summary-value property-information__summary-value--source"
          >
            <uui-icon
              class="property-information__source-icon"
              name=${e.sourceIcon}
              title=${e.source}
            ></uui-icon>
            <span>${e.source}</span>
          </p>
        </div>
        <div class="property-information__summary-item">
          <p class="property-information__summary-label">
            ${il}
          </p>
          <p class="property-information__summary-value">${e.cultureLabel}</p>
        </div>
        ${e.searchMode ? s`
              <div class="property-information__summary-item">
                <p class="property-information__summary-label">
                  ${Ot}
                </p>
                <p class="property-information__summary-value">
                  ${e.searchMode.label}
                </p>
              </div>
            ` : d}
      </div>
    `;
};
oa = function(e) {
  return s`
      <div
        class="property-information__search-summary"
        aria-label=${ir}
      >
        <p class="property-information__search-summary-title">
          ${ir}
        </p>
        <div class="property-information__search-summary-sections">
          ${N(this, L, Ge).call(this, rl, e.searchableProperties, "positive")}
          ${N(this, L, Ge).call(this, e.isBlockGrid ? ol : al, e.nonSearchableProperties, e.isBlockGrid ? "warning" : "negative")}
        </div>
      </div>
    `;
};
ni = function(e, t, i, r) {
  return s`
      <button
        type="button"
        class="property-information__section-toggle"
        aria-expanded=${t}
        @click=${i}
      >
        <uui-symbol-expand .open=${t}></uui-symbol-expand>
        <span>${e}</span>
      </button>
      ${t ? s`<div class="property-information__section-panel">${r}</div>` : d}
    `;
};
aa = function(e, t) {
  return s`
      <dl class="property-information__list">
        ${N(this, L, si).call(this, "Property", e.propertyName)}
        ${e.blockType ? N(this, L, si).call(this, "Block type", e.blockType) : d}
        <dt class="property-information__term">Details</dt>
        <dd class="property-information__value">
          <p class="property-information__description">
            ${e.searchableDescription}
          </p>
        </dd>
        ${e.searchMode ? s`
              <dt class="property-information__term">${Ot}</dt>
              <dd class="property-information__value">
                <p class="property-information__description">
                  ${e.searchMode.description}
                </p>
              </dd>
            ` : d}
      </dl>
      ${t ? N(this, L, na).call(this, t) : d}
    `;
};
na = function(e) {
  return s`
      <dl class="property-information__list">
        <dt class="property-information__term">${nl}</dt>
        <dd class="property-information__value">
          ${e.containerName}
          <span class="property-information__editor-label"
            >(${e.blockEditorLabel})</span
          >
        </dd>
      </dl>
      ${e.isBlockGrid && e.isContainerSelected ? N(this, L, sa).call(this, e) : e.isBlockGrid ? d : s`<p class="property-information__tip">${sl}</p>`}
      ${e.propertySearchMode && !(e.isBlockGrid && e.isContainerSelected && e.examineDiagnostics) ? s`
            <p class="property-information__subsection-title">
              ${Ot}
            </p>
            <p class="property-information__description">
              ${e.propertySearchMode.description}
            </p>
          ` : d}
    `;
};
sa = function(e) {
  const t = e.blockGridExampleValue ?? "value";
  return s`
      <div class="property-information__guidance">
        <p class="property-information__guidance-intro">
          ${ll}
        </p>
        <p class="property-information__guidance-lead">
          ${cl}
        </p>
        <ul class="property-information__operator-list">
          ${dl.map(
    (i) => s`<li>${i}</li>`
  )}
        </ul>
        <p class="property-information__guidance-lead">
          ${ul}
        </p>
        <div class="property-information__example" aria-label="Example Block Grid filter">
          <span class="property-information__example-line"
            >${e.containerName}</span
          >
          <span class="property-information__example-line">Contains</span>
          <span
            class="property-information__example-line property-information__example-line--value"
            >"${t}"</span
          >
        </div>
        <p class="property-information__guidance-outcome">
          ${pl}
        </p>
      </div>
    `;
};
la = function(e, t) {
  return s`
      ${t?.discoveryDiagnostics ? s`
            <dl class="property-information__list">
              <dt class="property-information__term">
                ${hl}
              </dt>
              <dd class="property-information__value">
                ${t.discoveryDiagnostics.configurationLoaded ? "Yes" : "No"}
              </dd>
              <dt class="property-information__term">
                ${fl}
              </dt>
              <dd class="property-information__value">
                ${t.discoveryDiagnostics.allowedBlocksCount}
              </dd>
              <dt class="property-information__term">
                ${_l}
              </dt>
              <dd class="property-information__value">
                ${t.discoveryDiagnostics.resolvedElementTypesCount}
              </dd>
              <dt class="property-information__term">
                ${ml}
              </dt>
              <dd class="property-information__value">
                ${t.discoveryDiagnostics.resolvedPropertiesCount}
              </dd>
            </dl>
          ` : d}
      ${N(this, L, ca).call(this, e, t)}
      ${t?.isBlockGrid && t.examineDiagnostics ? N(this, L, ua).call(this, t.examineDiagnostics) : d}
      ${t ? N(this, L, pa).call(this, t) : d}
    `;
};
ca = function(e, t) {
  const i = t?.examineDiagnostics;
  return !!e.searchField || !!i ? s`
      <p class="property-information__subsection-title">
        ${yl}
      </p>
      <dl class="property-information__list">
        ${e.searchField ? s`
              <dt class="property-information__term">${vl}</dt>
              <dd
                class="property-information__value property-information__value--mono"
              >
                ${e.searchField}
              </dd>
            ` : d}
        ${i ? s`
              <dt class="property-information__term">
                ${gl}
              </dt>
              <dd
                class="property-information__value property-information__value--mono"
              >
                ${i.containerField}
              </dd>
              <dt class="property-information__term">
                ${bl}
              </dt>
              <dd class="property-information__value">
                ${i.containerIndexed ? "Yes" : "No"}
              </dd>
              <dt class="property-information__term">
                ${Cl}
              </dt>
              <dd class="property-information__value">${i.elementFieldsDetected}</dd>
              <dt class="property-information__term">
                ${Sl}
              </dt>
              <dd class="property-information__value">${i.dedicatedPropertyFields}</dd>
            ` : d}
      </dl>
    ` : d;
};
ua = function(e) {
  const t = au();
  return s`
      <p
        class="property-information__subsection-title property-information__subsection-title--examine"
      >
        ${wl}
      </p>
      <dl class="property-information__list">
        <dt class="property-information__term">${Ot}</dt>
        <dd class="property-information__value">${t.label}</dd>
        <dt class="property-information__term">${El}</dt>
        <dd class="property-information__value">
          <p class="property-information__description">${e.explanation}</p>
        </dd>
      </dl>
    `;
};
pa = function(e) {
  return s`
      <p class="property-information__subsection-title">
        ${$l}
      </p>
      ${N(this, L, Ge).call(this, Tl, e.elementTypes, "neutral")}
      ${N(this, L, Ge).call(this, xl, e.propertiesFound, "neutral")}
    `;
};
Ge = function(e, t, i) {
  return s`
      <section aria-label=${e}>
        <p class="property-information__subsection-title">${e}</p>
        ${t.length === 0 ? s`<p class="property-information__empty">None</p>` : s`
              <ul class="property-information__item-list">
                ${t.map(
    (r) => s`
                    <li
                      class="property-information__item property-information__item--${i}"
                    >
                      ${i === "positive" ? s`<span class="property-information__marker" aria-hidden="true"
                            >✓</span
                          >` : i === "negative" ? s`<span class="property-information__marker" aria-hidden="true"
                              >✗</span
                            >` : i === "warning" ? s`<span class="property-information__marker" aria-hidden="true"
                                >⚠</span
                              >` : d}
                      <span>${r}</span>
                    </li>
                  `
  )}
              </ul>
            `}
      </section>
    `;
};
si = function(e, t) {
  return s`
      <dt class="property-information__term">${e}</dt>
      <dd class="property-information__value">${t}</dd>
    `;
};
da = function(e, t) {
  return !!(t?.discoveryDiagnostics || t?.isBlockGrid && t.examineDiagnostics || e.searchField || t && (t.elementTypes.length > 0 || t.propertiesFound.length > 0));
};
ha = function() {
  this._propertyInformationOpen = !this._propertyInformationOpen;
};
fa = function() {
  this._developerDiagnosticsOpen = !this._developerDiagnosticsOpen;
};
Ee.styles = [Vu];
et([
  p({ attribute: !1 })
], Ee.prototype, "details", 2);
et([
  p({ attribute: !1 })
], Ee.prototype, "blockDiagnostics", 2);
et([
  _()
], Ee.prototype, "_propertyInformationOpen", 2);
et([
  _()
], Ee.prototype, "_developerDiagnosticsOpen", 2);
Ee = et([
  Q("filter-property-information")
], Ee);
var Yu = Object.defineProperty, qu = Object.getOwnPropertyDescriptor, _a = (e) => {
  throw TypeError(e);
}, k = (e, t, i, r) => {
  for (var o = r > 1 ? void 0 : r ? qu(t, i) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (o = (r ? n(t, i, o) : n(o)) || o);
  return r && o && Yu(t, i, o), o;
}, Ii = (e, t, i) => t.has(e) || _a("Cannot " + i), Wu = (e, t, i) => (Ii(e, t, "read from private field"), t.get(e)), yr = (e, t, i) => t.has(e) ? _a("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), ju = (e, t, i, r) => (Ii(e, t, "write to private field"), t.set(e, i), i), u = (e, t, i) => (Ii(e, t, "access private method"), i), ft, c, ma, He, ya, va, ga, ba, Ca, Te, Y, ye, Sa, Vt, wa, Ea, $a, Ta, xa, Aa, Da, Pa, Oa, tt, La, ka, li, Ia, Na, Ra, Ni, Ri, Ba, Ma, Fa, za, Va, Ua, Bi, Ga, V, Ha, Ka, Ut;
let D = class extends ee {
  constructor() {
    super(...arguments), yr(this, c), this.conditionId = "", this.connectorLabel = "WHERE", this.searchScope = "ContentType", this.contentTypes = [], this.propertyMetadata = [], this.propertyHiddenHint = "", this.propertyMetadataByContentType = {}, this.loadingProperties = !1, this.loadingContentTypes = !1, this.disabled = !1, this.removeDisabled = !1, this.showValidation = !1, this.fieldErrors = {}, this._contentTypeAlias = "", this._propertyAlias = "", this._filterOperator = "", this._propertyValue = "", this._fromDate = "", this._toDate = "", this._dateShortcut = "", yr(this, ft);
  }
  connectedCallback() {
    super.connectedCallback(), u(this, c, li).call(this);
  }
  willUpdate(e) {
    super.willUpdate(e), (e.has("conditionId") || e.has("seed") || e.has("searchScope")) && u(this, c, li).call(this);
  }
  render() {
    const e = u(this, c, tt).call(this), t = u(this, c, La).call(this), i = u(this, c, ka).call(this), r = Hl(
      e,
      this._propertyAlias
    ), o = Kl(
      e,
      this._propertyAlias,
      this._filterOperator
    ), a = Ci(e, this._propertyAlias), n = We(this.contentTypes), l = U(this.searchScope);
    return s`
      <div
        class="condition-row${l ? " condition-row--entire-site" : ""}"
        data-condition-id=${this.conditionId}
      >
        <div
          class="condition-row__sentence"
          role="group"
          aria-label="Filter condition"
        >
          <span
            class="condition-row__keyword ${u(this, c, ma).call(this)}"
            aria-hidden="true"
          >
            ${this.connectorLabel}
          </span>
          <div
            class="condition-row__fields${l ? " condition-row__fields--entire-site" : ""}"
          >
            ${l ? d : u(this, c, ya).call(this, this._contentTypeAlias, n, this.loadingContentTypes)}
            ${u(this, c, ga).call(this, this._propertyAlias, l ? this.loadingProperties || this.propertyMetadata.length === 0 : !this._contentTypeAlias || this.loadingProperties || this.propertyMetadata.length === 0)}
            ${this._propertyAlias ? u(this, c, Ca).call(this, "filterOperator", "Comparison", this._filterOperator, ac(
      r,
      this._filterOperator,
      "operator"
    ), (v) => u(this, c, Ra).call(this, u(this, c, Ut).call(this, v)), !1, "condition-row__token--operator") : u(this, c, He).call(this, "field", "condition-row__token--operator")}
            ${this._propertyAlias ? s`
                  <div class="condition-row__token condition-row__token--value">
                    ${u(this, c, Sa).call(this, e, a, o)}
                  </div>
                ` : u(this, c, He).call(this, "value", "condition-row__token--value")}
          </div>
          ${this.removeDisabled ? d : s`
                <div class="condition-row__remove">
                  <uui-button
                    look="default"
                    compact
                    label="Remove condition"
                    ?disabled=${this.disabled}
                    @click=${u(this, c, Ga)}
                  >
                    <uui-icon name="icon-wrong"></uui-icon>
                  </uui-button>
                </div>
              `}
        </div>
        ${t ? s`
              <filter-property-information
                .details=${t}
                .blockDiagnostics=${i}
              ></filter-property-information>
            ` : d}
      </div>
    `;
  }
  focusField(e) {
    this.renderRoot.querySelector(
      `[data-field="${e}"]`
    )?.focus?.();
  }
};
ft = /* @__PURE__ */ new WeakMap();
c = /* @__PURE__ */ new WeakSet();
ma = function() {
  return this.connectorLabel === "WHERE" ? "condition-row__keyword--where" : "condition-row__keyword--join";
};
He = function(e, t = "") {
  return s`
      <div class="condition-row__token condition-row__token--ghost ${t}">
        <span class="condition-row__ghost">${e}</span>
      </div>
    `;
};
ya = function(e, t, i = !1) {
  const r = u(this, c, Y).call(this, "contentTypeAlias");
  return s`
      <div
        class="condition-row__token condition-row__token--content-type ${!!e ? "condition-row__token--filled" : "condition-row__token--empty"}"
      >
        <filter-content-type-combobox
          data-field="contentTypeAlias"
          .value=${e}
          .contentTypes=${t}
          label="Content type"
          placeholder=${i ? "Loading…" : "Search content type..."}
          aria-describedby=${r ? u(this, c, ye).call(this, "contentTypeAlias") : d}
          ?disabled=${this.disabled}
          ?error=${!!r}
          ?loading=${i}
          @filter-content-type-change=${u(this, c, va)}
        ></filter-content-type-combobox>
        ${r ? s`<p id=${u(this, c, ye).call(this, "contentTypeAlias")} class="condition-row__field-error">${r}</p>` : d}
      </div>
    `;
};
va = function(e) {
  u(this, c, Ia).call(this, e.detail.value);
};
ga = function(e, t = !1) {
  const i = u(this, c, Y).call(this, "propertyAlias"), r = !!e, o = this.loadingProperties;
  return s`
      <div
        class="condition-row__token condition-row__token--property ${r ? "condition-row__token--filled" : "condition-row__token--empty"}"
      >
        <filter-property-combobox
          data-field="propertyAlias"
          .value=${e}
          .properties=${this.propertyMetadata}
          .hiddenPropertiesHint=${this.propertyHiddenHint}
          label="Field"
          placeholder=${o ? "Loading…" : Br}
          aria-describedby=${i ? u(this, c, ye).call(this, "propertyAlias") : d}
          ?disabled=${this.disabled || t}
          ?error=${!!i}
          ?loading=${o}
          @filter-property-change=${u(this, c, ba)}
        ></filter-property-combobox>
        ${i ? s`<p id=${u(this, c, ye).call(this, "propertyAlias")} class="condition-row__field-error">${i}</p>` : d}
      </div>
    `;
};
ba = function(e) {
  u(this, c, Na).call(this, e.detail.value);
};
Ca = function(e, t, i, r, o, a = !1, n = "") {
  const l = u(this, c, Y).call(this, e);
  return s`
      <div
        class="condition-row__token ${n} ${!!i ? "condition-row__token--filled" : "condition-row__token--empty"}"
      >
        <uui-select
          class="condition-row__control"
          data-field=${e}
          label=${t}
          .value=${i}
          .options=${r}
          ?disabled=${this.disabled || a}
          ?error=${!!l}
          @change=${o}
        ></uui-select>
        ${l ? s`<p id=${u(this, c, ye).call(this, e)} class="condition-row__field-error">${l}</p>` : d}
      </div>
    `;
};
Te = function(e, t, i = {}) {
  const r = u(this, c, Y).call(this, e), o = i.literal ?? !1;
  return s`
      <div
        class="condition-row__value${o ? " condition-row__value--literal" : ""}"
      >
        ${o ? s`<span class="condition-row__quote" aria-hidden="true">"</span>` : d}
        ${t}
        ${o ? s`<span class="condition-row__quote" aria-hidden="true">"</span>` : d}
        ${r ? s`<p id=${u(this, c, ye).call(this, e)} class="condition-row__field-error">${r}</p>` : d}
      </div>
    `;
};
Y = function(e) {
  if (this.showValidation)
    return this.fieldErrors[e];
};
ye = function(e) {
  return `condition-${this.conditionId}-${e}-error`;
};
Sa = function(e, t, i) {
  if (!this._filterOperator)
    return u(this, c, He).call(this, "value");
  if (t)
    return u(this, c, Aa).call(this, e);
  if (!i)
    return u(this, c, He).call(this, "—");
  switch (re(e)) {
    case "Dropdown":
      return u(this, c, Ea).call(this, e);
    case "MultiSelect":
      return u(this, c, xa).call(this, e);
    case "Number":
      return u(this, c, wa).call(this);
    default:
      return u(this, c, Vt).call(this, e);
  }
};
Vt = function(e) {
  const t = u(this, c, Y).call(this, "propertyValue"), i = re(e), r = qr(
    this._filterOperator,
    i
  );
  return u(this, c, Te).call(this, "propertyValue", s`
        <uui-input
          class="condition-row__control"
          data-field="propertyValue"
          label="Value"
          placeholder="value"
          .value=${this._propertyValue}
          ?disabled=${this.disabled}
          ?error=${!!t}
          @change=${u(this, c, Ni)}
        >
          ${u(this, c, Ri).call(this)}
        </uui-input>
      `, { literal: r });
};
wa = function() {
  const e = u(this, c, Y).call(this, "propertyValue");
  return u(this, c, Te).call(this, "propertyValue", s`
        <uui-input
          class="condition-row__control"
          data-field="propertyValue"
          type="number"
          label="Value"
          placeholder="value"
          .value=${this._propertyValue}
          ?disabled=${this.disabled}
          ?error=${!!e}
          @change=${u(this, c, Ni)}
        >
          ${u(this, c, Ri).call(this)}
        </uui-input>
      `);
};
Ea = function(e) {
  if (e?.alias === Dt)
    return u(this, c, $a).call(this);
  if ((e?.options ?? []).length === 0)
    return u(this, c, Vt).call(this, e);
  const i = u(this, c, Y).call(this, "propertyValue");
  return u(this, c, Te).call(this, "propertyValue", s`
        <uui-select
          class="condition-row__control"
          data-field="propertyValue"
          label="Value"
          placeholder="value"
          .value=${this._propertyValue}
          .options=${nc(
    e,
    this._propertyValue
  )}
          ?disabled=${this.disabled}
          ?error=${!!i}
          @change=${(r) => u(this, c, V).call(this, {
    propertyValue: u(this, c, Ut).call(this, r)
  })}
        ></uui-select>
      `);
};
$a = function() {
  const e = u(this, c, Y).call(this, "propertyValue"), t = We(this.contentTypes);
  return u(this, c, Te).call(this, "propertyValue", s`
        <filter-content-type-combobox
          data-field="propertyValue"
          .value=${this._propertyValue}
          .contentTypes=${t}
          label="Value"
          placeholder="Search document type..."
          aria-describedby=${e ? u(this, c, ye).call(this, "propertyValue") : d}
          ?disabled=${this.disabled}
          ?error=${!!e}
          ?loading=${this.loadingContentTypes}
          @filter-content-type-change=${u(this, c, Ta)}
        ></filter-content-type-combobox>
      `);
};
Ta = function(e) {
  u(this, c, V).call(this, { propertyValue: e.detail.value });
};
xa = function(e) {
  const t = e?.options ?? [];
  if (t.length === 0)
    return u(this, c, Vt).call(this, e);
  const i = u(this, c, Y).call(this, "propertyValue");
  return u(this, c, Te).call(this, "propertyValue", s`
        <div
          class="condition-row__multi-select${i ? " condition-row__multi-select--error" : ""}"
          data-field="propertyValue"
        >
          ${t.map(
    (r) => s`
              <label class="condition-row__multi-select-option">
                <uui-checkbox
                  .checked=${lc(
      this._propertyValue,
      r.value
    )}
                  ?disabled=${this.disabled}
                  @change=${(o) => u(this, c, Ma).call(this, r.value, o.target.checked)}
                ></uui-checkbox>
                <span>${r.label}</span>
              </label>
            `
  )}
        </div>
      `);
};
Aa = function(e) {
  return this._filterOperator === "Between" ? u(this, c, Oa).call(this) : u(this, c, Da).call(this, e);
};
Da = function(e) {
  const t = ue(
    e,
    this._propertyAlias
  ), i = this._filterOperator === "LessThan" || this._filterOperator === "LessThanOrEqual", r = i ? "toDate" : t ? "fromDate" : "propertyValue", o = "Date", a = i ? this._toDate : t ? this._fromDate : this._propertyValue, n = u(this, c, Y).call(this, r);
  return u(this, c, Te).call(this, r, s`
        <uui-input
          class="condition-row__control"
          data-field=${r}
          type="date"
          label=${o}
          .value=${a}
          ?disabled=${this.disabled}
          ?error=${!!n}
          @change=${(l) => u(this, c, Pa).call(this, l, r)}
        ></uui-input>
      `);
};
Pa = function(e, t) {
  const i = e.target.value;
  if (this._dateShortcut = "", t === "toDate") {
    u(this, c, V).call(this, { toDate: i, fromDate: "", propertyValue: "" });
    return;
  }
  if (t === "fromDate") {
    u(this, c, V).call(this, { fromDate: i, toDate: "", propertyValue: "" });
    return;
  }
  u(this, c, V).call(this, { propertyValue: i, fromDate: "", toDate: "" });
};
Oa = function() {
  const e = u(this, c, Y).call(this, "dateRange"), t = u(this, c, Y).call(this, "fromDate"), i = u(this, c, Y).call(this, "toDate"), r = Fc(this._dateShortcut);
  return s`
      <div class="condition-row__value">
        <div class="condition-row__date-value">
          <div class="condition-row__date-range-select">
            <uui-select
              class="condition-row__control"
              data-field="dateRange"
              label="Date range"
              placeholder=${bo}
              .value=${this._dateShortcut}
              .options=${zc(this._dateShortcut)}
              ?disabled=${this.disabled}
              ?error=${!!e}
              @change=${u(this, c, Va)}
            ></uui-select>
            ${e ? s`<p class="condition-row__field-error">${e}</p>` : d}
          </div>
          ${r ? s`
                <div class="condition-row__date-range">
                  <div class="condition-row__date-field">
                    <uui-input
                      class="condition-row__control"
                      data-field="fromDate"
                      type="date"
                      label="From date"
                      .value=${this._fromDate}
                      ?disabled=${this.disabled}
                      ?error=${!!t}
                      @change=${u(this, c, Fa)}
                    ></uui-input>
                    ${t ? s`<p class="condition-row__field-error">${t}</p>` : d}
                  </div>
                  <div class="condition-row__date-field">
                    <uui-input
                      class="condition-row__control"
                      data-field="toDate"
                      type="date"
                      label="To date"
                      .value=${this._toDate}
                      ?disabled=${this.disabled}
                      ?error=${!!i}
                      @change=${u(this, c, za)}
                    ></uui-input>
                    ${i ? s`<p class="condition-row__field-error">${i}</p>` : d}
                  </div>
                </div>
              ` : d}
        </div>
      </div>
    `;
};
tt = function() {
  return this.propertyMetadata.find(
    (e) => e.alias === this._propertyAlias
  );
};
La = function() {
  if (!this._propertyAlias)
    return;
  const e = Le(
    this.propertyMetadataByContentType,
    this._contentTypeAlias,
    this._propertyAlias,
    this.searchScope,
    this.contentTypes
  );
  if (e)
    return pu(e);
};
ka = function() {
  if (!this._propertyAlias)
    return;
  const e = Le(
    this.propertyMetadataByContentType,
    this._contentTypeAlias,
    this._propertyAlias,
    this.searchScope,
    this.contentTypes
  );
  if (!e)
    return;
  const t = U(this.searchScope) ? je(this.contentTypes) : this.propertyMetadataByContentType[this._contentTypeAlias] ?? [];
  return vu(t, e);
};
li = function() {
  if (!this.conditionId)
    return;
  const e = this.seed ?? Su(), t = JSON.stringify({
    conditionId: this.conditionId,
    searchScope: this.searchScope,
    contentTypeAlias: e.contentTypeAlias,
    propertyAlias: e.propertyAlias,
    filterOperator: e.filterOperator,
    propertyValue: e.propertyValue,
    fromDate: e.fromDate,
    toDate: e.toDate
  });
  Wu(this, ft) !== t && (this._contentTypeAlias = e.contentTypeAlias, this._propertyAlias = e.propertyAlias, this._filterOperator = e.filterOperator, this._propertyValue = e.propertyValue, this._fromDate = e.fromDate, this._toDate = e.toDate, this._dateShortcut = u(this, c, Bi).call(this), ju(this, ft, t));
};
Ia = function(e) {
  G(e) && (e = ""), e !== this._contentTypeAlias && (u(this, c, V).call(this, {
    contentTypeAlias: e,
    propertyAlias: "",
    propertyValue: "",
    fromDate: "",
    toDate: "",
    filterOperator: ""
  }), this._dateShortcut = "", e && u(this, c, Ka).call(this, e));
};
Na = function(e) {
  if (e === this._propertyAlias)
    return;
  const t = {
    propertyAlias: e,
    propertyValue: "",
    fromDate: "",
    toDate: "",
    filterOperator: ""
  };
  u(this, c, V).call(this, t), this._dateShortcut = "";
};
Ra = function(e) {
  if (e === this._filterOperator)
    return;
  const t = u(this, c, tt).call(this), i = Ci(t, this._propertyAlias) && !ue(t, this._propertyAlias), r = { filterOperator: e };
  if (!e)
    r.propertyValue = "", r.fromDate = "", r.toDate = "";
  else if (e === "IsEmpty" || e === "IsNotEmpty")
    r.propertyValue = "", r.fromDate = "", r.toDate = "";
  else if (i) {
    if (e === "Between") {
      const o = this._propertyValue.trim();
      o && (r.fromDate = o, r.toDate = o, r.propertyValue = "");
    } else if (this._filterOperator === "Between") {
      const o = this._fromDate.trim(), a = this._toDate.trim();
      (o && o === a || o) && (r.propertyValue = o), r.fromDate = "", r.toDate = "";
    }
  }
  u(this, c, V).call(this, r), this._dateShortcut = u(this, c, Bi).call(this);
};
Ni = function(e) {
  u(this, c, V).call(this, {
    propertyValue: e.target.value
  });
};
Ri = function() {
  return !this._propertyValue.trim() || this.disabled ? d : s`
      <uui-button
        slot="append"
        type="button"
        compact
        label="Clear value"
        ?disabled=${this.disabled}
        @click=${u(this, c, Ba)}
      >
        <uui-icon name="icon-delete"></uui-icon>
      </uui-button>
    `;
};
Ba = function(e) {
  e.stopPropagation(), e.preventDefault(), u(this, c, V).call(this, { propertyValue: "" });
};
Ma = function(e, t) {
  const i = [...Je(this._propertyValue)];
  if (t)
    i.includes(e) || i.push(e);
  else {
    const r = i.indexOf(e);
    r >= 0 && i.splice(r, 1);
  }
  u(this, c, V).call(this, {
    propertyValue: sc(i)
  });
};
Fa = function(e) {
  this._dateShortcut = "custom", u(this, c, V).call(this, {
    fromDate: e.target.value
  });
};
za = function(e) {
  this._dateShortcut = "custom", u(this, c, V).call(this, {
    toDate: e.target.value
  });
};
Va = function(e) {
  const t = u(this, c, Ut).call(this, e);
  if (!t) {
    this._dateShortcut = "", u(this, c, V).call(this, {
      fromDate: "",
      toDate: "",
      propertyValue: ""
    });
    return;
  }
  if (t === "custom") {
    this._dateShortcut = "custom";
    return;
  }
  const i = Qt(t);
  if (!i)
    return;
  const r = u(this, c, tt).call(this), o = ue(
    r,
    this._propertyAlias
  );
  this._dateShortcut = t, u(this, c, V).call(this, u(this, c, Ua).call(this, i, o));
};
Ua = function(e, t) {
  return t ? this._filterOperator === "Between" ? { fromDate: e.fromDate, toDate: e.toDate } : this._filterOperator === "LessThan" || this._filterOperator === "LessThanOrEqual" ? { toDate: e.toDate, fromDate: "" } : { fromDate: e.fromDate, toDate: "" } : this._filterOperator === "Between" ? {
    fromDate: e.fromDate,
    toDate: e.toDate,
    propertyValue: ""
  } : e.isSingleDay ? {
    propertyValue: e.fromDate,
    fromDate: "",
    toDate: ""
  } : {
    fromDate: e.fromDate,
    toDate: "",
    propertyValue: ""
  };
};
Bi = function() {
  const e = u(this, c, tt).call(this), t = ue(
    e,
    this._propertyAlias
  );
  return Ti(
    this._fromDate,
    this._toDate,
    this._propertyValue,
    this._filterOperator,
    t ? "system" : "custom"
  );
};
Ga = function() {
  this.dispatchEvent(
    new CustomEvent(Cu, {
      detail: { conditionId: this.conditionId },
      bubbles: !0,
      composed: !0
    })
  );
};
V = function(e) {
  e.contentTypeAlias !== void 0 && (this._contentTypeAlias = e.contentTypeAlias), e.propertyAlias !== void 0 && (this._propertyAlias = e.propertyAlias), e.filterOperator !== void 0 && (this._filterOperator = e.filterOperator), e.propertyValue !== void 0 && (this._propertyValue = e.propertyValue), e.fromDate !== void 0 && (this._fromDate = e.fromDate), e.toDate !== void 0 && (this._toDate = e.toDate), u(this, c, Ha).call(this);
};
Ha = function() {
  this.dispatchEvent(
    new CustomEvent(gu, {
      detail: {
        conditionId: this.conditionId,
        contentTypeAlias: this._contentTypeAlias,
        propertyAlias: this._propertyAlias,
        filterOperator: this._filterOperator,
        propertyValue: this._propertyValue,
        fromDate: this._fromDate,
        toDate: this._toDate
      },
      bubbles: !0,
      composed: !0
    })
  );
};
Ka = function(e) {
  this.dispatchEvent(
    new CustomEvent(bu, {
      detail: {
        conditionId: this.conditionId,
        contentTypeAlias: e
      },
      bubbles: !0,
      composed: !0
    })
  );
};
Ut = function(e) {
  return String(e.target.value ?? "");
};
D.styles = [...Tu];
k([
  p({ type: String, attribute: "data-condition-id" })
], D.prototype, "conditionId", 2);
k([
  p({ type: String })
], D.prototype, "connectorLabel", 2);
k([
  p({ type: String })
], D.prototype, "searchScope", 2);
k([
  p({ type: Array })
], D.prototype, "contentTypes", 2);
k([
  p({ type: Array })
], D.prototype, "propertyMetadata", 2);
k([
  p({ type: String })
], D.prototype, "propertyHiddenHint", 2);
k([
  p({ type: Object })
], D.prototype, "propertyMetadataByContentType", 2);
k([
  p({ type: Boolean })
], D.prototype, "loadingProperties", 2);
k([
  p({ type: Boolean })
], D.prototype, "loadingContentTypes", 2);
k([
  p({ type: Boolean })
], D.prototype, "disabled", 2);
k([
  p({ type: Boolean })
], D.prototype, "removeDisabled", 2);
k([
  p({ type: Object, attribute: !1 })
], D.prototype, "seed", 2);
k([
  p({ type: Boolean })
], D.prototype, "showValidation", 2);
k([
  p({ type: Object, attribute: !1 })
], D.prototype, "fieldErrors", 2);
k([
  _()
], D.prototype, "_contentTypeAlias", 2);
k([
  _()
], D.prototype, "_propertyAlias", 2);
k([
  _()
], D.prototype, "_filterOperator", 2);
k([
  _()
], D.prototype, "_propertyValue", 2);
k([
  _()
], D.prototype, "_fromDate", 2);
k([
  _()
], D.prototype, "_toDate", 2);
k([
  _()
], D.prototype, "_dateShortcut", 2);
D = k([
  Q("filter-condition-row")
], D);
const Xu = [
  $e,
  Ei,
  M`
    :host {
      display: block;
      width: 100%;
    }

    .filter-builder {
      display: flex;
      flex-direction: column;
      gap: var(--fn-space-block);
    }

    .filter-builder__draft-banner {
      margin: 0;
    }

    .filter-builder__toolbar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--fn-space-inline);
      padding: var(--fn-space-inline) var(--fn-space-block);
      border-radius: var(--fn-radius);
      background: var(--fn-surface-muted);
    }

    .filter-builder__toolbar-group {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--uui-size-space-2);
      min-width: 0;
    }

    .filter-builder__toolbar-divider {
      flex-shrink: 0;
      align-self: stretch;
      width: 1px;
      min-height: 1.75rem;
      background: color-mix(in srgb, var(--uui-color-border) 45%, transparent);
    }

    .filter-builder__toolbar-group--match,
    .filter-builder__toolbar-group--scope {
      flex: 0 1 auto;
    }

    .filter-builder__toolbar-select {
      width: 100%;
    }

    .filter-builder__toolbar-select--match {
      flex: 0 1 11rem;
      min-width: 9rem;
    }

    .filter-builder__toolbar-select--scope {
      flex: 0 1 14rem;
      min-width: 11rem;
    }

    .filter-builder__toolbar-group--properties {
      flex: 1 1 auto;
      min-width: 0;
    }

    .filter-builder__toolbar-checkbox {
      width: 100%;
    }

    .filter-builder__toolbar-summary {
      color: var(--uui-color-text-alt);
      font-size: var(--uui-type-small-size);
      line-height: 1.35;
    }

    .filter-builder__control-label {
      margin: 0;
      color: var(--uui-color-text-alt);
      font-size: var(--uui-type-small-size);
      font-weight: 600;
      white-space: nowrap;
    }

    .filter-builder__query {
      display: flex;
      flex-direction: column;
      gap: var(--uui-size-space-2);
      padding: var(--uui-size-space-2) var(--fn-space-inline);
      border-radius: var(--fn-radius);
      background: var(--fn-surface-muted);
    }

    .filter-builder__clause + .filter-builder__clause {
      padding-top: var(--uui-size-space-2);
      border-top: none;
      box-shadow: inset 0 1px 0 color-mix(in srgb, var(--uui-color-border) 35%, transparent);
    }

    .filter-builder__summary {
      display: flex;
      flex-direction: column;
      gap: var(--uui-size-space-2);
      padding: var(--fn-space-inline) var(--fn-space-block);
      border-radius: var(--fn-radius);
      background: var(--fn-summary-surface);
      box-shadow: inset 3px 0 0 var(--fn-summary-accent);
    }

    .filter-builder__summary-heading {
      margin: 0;
      color: var(--uui-color-text);
      font-size: var(--uui-type-small-size);
      font-weight: 700;
      letter-spacing: 0.04em;
      line-height: 1.2;
      text-transform: uppercase;
    }

    .filter-builder__summary-placeholder {
      margin: 0;
      color: var(--uui-color-text-alt);
      font-family: var(--uui-font-family-mono, ui-monospace, monospace);
      font-size: var(--uui-type-small-size);
      font-style: italic;
      line-height: 1.5;
    }

    .filter-builder__query-preview {
      display: flex;
      flex-direction: column;
      gap: var(--uui-size-space-1);
      padding: var(--fn-space-inline);
      border-radius: calc(var(--fn-radius) - 2px);
      background: color-mix(in srgb, var(--uui-color-surface) 82%, transparent);
      overflow-x: auto;
    }

    .filter-builder__query-keyword,
    .filter-builder__query-condition {
      margin: 0;
      font-family: var(--uui-font-family-mono, ui-monospace, monospace);
      font-size: var(--uui-type-small-size);
      line-height: 1.55;
      white-space: pre-wrap;
      word-break: break-word;
    }

    .filter-builder__query-keyword {
      color: var(--fn-summary-accent);
      font-weight: 700;
      letter-spacing: 0.08em;
    }

    .filter-builder__query-condition {
      color: var(--uui-color-text);
      padding-left: var(--uui-size-space-2);
    }

    .filter-builder__query-keyword + .filter-builder__query-condition {
      margin-top: calc(var(--uui-size-space-1) * -0.5);
    }

    .filter-builder__query-condition + .filter-builder__query-keyword {
      margin-top: var(--uui-size-space-2);
    }

    .filter-builder__add {
      display: flex;
      align-items: center;
    }

    .filter-builder__action-bar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: var(--fn-space-inline);
      padding-top: var(--fn-space-inline);
      margin-top: calc(var(--uui-size-space-1) * -1);
    }

    .filter-builder__action-status {
      display: flex;
      align-items: center;
      gap: var(--uui-size-space-2);
      flex: 1 1 12rem;
      min-width: 0;
    }

    .filter-builder__action-status-icon {
      flex-shrink: 0;
      font-size: 1rem;
      color: var(--uui-color-positive);
    }

    .filter-builder__ready {
      margin: 0;
      color: var(--uui-color-positive);
      font-size: var(--uui-type-small-size);
      line-height: 1.4;
    }

    .filter-builder__action-hint {
      margin: 0;
      color: var(--uui-color-text-alt);
      font-size: var(--uui-type-small-size);
      line-height: 1.4;
    }

    .filter-builder__actions {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: flex-end;
      gap: var(--uui-size-space-2);
      margin-left: auto;
    }

    @media (max-width: 720px) {
      .filter-builder__toolbar {
        flex-direction: column;
        align-items: stretch;
      }

      .filter-builder__toolbar-divider {
        display: none;
      }

      .filter-builder__toolbar-group {
        flex-direction: column;
        align-items: stretch;
      }

      .filter-builder__toolbar-select {
        width: 100%;
      }

      .filter-builder__action-bar {
        flex-direction: column;
        align-items: stretch;
      }

      .filter-builder__actions {
        width: 100%;
        justify-content: stretch;
      }

      .filter-builder__actions uui-button {
        flex: 1 1 auto;
      }
    }
  `
];
var Ju = Object.defineProperty, Zu = Object.getOwnPropertyDescriptor, Ya = (e) => {
  throw TypeError(e);
}, F = (e, t, i, r) => {
  for (var o = r > 1 ? void 0 : r ? Zu(t, i) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (o = (r ? n(t, i, o) : n(o)) || o);
  return r && o && Ju(t, i, o), o;
}, Qu = (e, t, i) => t.has(e) || Ya("Cannot " + i), ep = (e, t, i) => t.has(e) ? Ya("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), y = (e, t, i) => (Qu(e, t, "access private method"), i), m, it, qa, Wa, ja, Xa, Mi, Ja, Za, Qa, en, tn, rn, on, an, nn, sn, ln, Fi, cn, un, ci, pn, zi, dn, hn, fn, _n, mn, yn, vn, Vi, gn, bn, Cn, Sn, rt, wn;
const tp = [
  { value: "All", label: "All conditions" },
  { value: "Any", label: "Any condition" }
];
function ip(e) {
  return tp.map((t) => ({
    name: t.label,
    value: t.value,
    selected: t.value === e
  }));
}
const rp = [
  { value: "ContentType", label: "Selected content types" },
  { value: "EntireSite", label: "Entire site" }
];
function op(e) {
  return rp.map((t) => ({
    name: t.label,
    value: t.value,
    selected: t.value === e
  }));
}
const ap = [
  { value: "AllCultures", label: Pl },
  { value: "CurrentCulture", label: Ol },
  { value: "SpecificCulture", label: Ll }
];
function np(e) {
  return ap.map((t) => ({
    name: t.label,
    value: t.value,
    selected: t.value === e
  }));
}
function sp(e, t) {
  return e.map((i) => ({
    name: i.name,
    value: i.isoCode,
    selected: i.isoCode === t
  }));
}
const lp = "filter-nodes-filter-type-change", cp = "filter-nodes-search-scope-change", up = "filter-nodes-search-culture-mode-change", pp = "filter-nodes-culture-change", dp = "filter-nodes-show-searchable-properties-only-change", hp = "filter-nodes-condition-change", fp = "filter-nodes-condition-remove", _p = "filter-nodes-condition-add", mp = "filter-nodes-search", yp = "filter-nodes-clear-all";
let R = class extends ee {
  constructor() {
    super(...arguments), ep(this, m), this.filterType = "All", this.searchScope = "ContentType", this.searchCultureMode = "AllCultures", this.culture = "", this.languages = [], this.loadingLanguages = !1, this.conditions = [], this.contentTypes = [], this.propertyMetadataByContentType = {}, this.loading = !1, this.loadingMetadata = !1, this.loadingPropertyContentTypeAliases = [], this.hasSearched = !1, this.hasDraftChanges = !1, this.showSearchablePropertiesOnly = !0, this._showValidation = !1, this._fieldErrorsByConditionId = {};
  }
  render() {
    const e = y(this, m, it).call(this), t = kt(
      this.conditions,
      e,
      this.filterType
    ), i = t.isValid;
    return s`
      <div class="filter-builder" @keydown=${y(this, m, cn)}>
        ${y(this, m, sn).call(this)}
        ${y(this, m, Za).call(this)}
        ${y(this, m, en).call(this)}
        ${y(this, m, Qa).call(this, i)}
        <div class="filter-builder__query">
          ${this.conditions.map(
      (r, o) => y(this, m, qa).call(this, r, o)
    )}
        </div>
        ${y(this, m, ja).call(this)}
        ${y(this, m, ln).call(this)}
        ${y(this, m, Ja).call(this, i, t.message)}
      </div>
    `;
  }
};
m = /* @__PURE__ */ new WeakSet();
it = function() {
  return {
    propertyMetadataByContentType: this.propertyMetadataByContentType,
    searchScope: this.searchScope,
    contentTypes: this.contentTypes
  };
};
qa = function(e, t) {
  const i = t === 0 ? "WHERE" : y(this, m, Wa).call(this);
  return s`
      <div class="filter-builder__clause">
        <filter-condition-row
          .conditionId=${e.id}
          .connectorLabel=${i}
          .searchScope=${this.searchScope}
          .contentTypes=${this.contentTypes}
          .propertyMetadata=${y(this, m, pn).call(this, e)}
          .propertyMetadataByContentType=${this.propertyMetadataByContentType}
          .propertyHiddenHint=${y(this, m, un).call(this, e)}
          .loadingProperties=${y(this, m, dn).call(this, e)}
          .loadingContentTypes=${this.loadingMetadata && (U(this.searchScope) || !e.contentTypeAlias)}
          .disabled=${this.loading}
          .removeDisabled=${this.conditions.length === 1}
          .showValidation=${this._showValidation}
          .fieldErrors=${this._fieldErrorsByConditionId[e.id] ?? {}}
          .seed=${e}
          @filter-condition-change=${y(this, m, hn)}
          @filter-condition-load-properties=${y(this, m, fn)}
          @filter-condition-remove=${y(this, m, _n)}
        ></filter-condition-row>
      </div>
    `;
};
Wa = function() {
  return this.filterType === "Any" ? "OR" : "AND";
};
ja = function() {
  const e = Uc(
    this.conditions,
    this.filterType,
    y(this, m, it).call(this)
  );
  return s`
      <div
        class="filter-builder__summary"
        role="region"
        aria-label="Search summary"
        aria-live="polite"
      >
        <p class="filter-builder__summary-heading">Search summary</p>
        ${e.parts.length === 0 ? s`
              <p class="filter-builder__summary-placeholder">
                ${e.placeholder}
              </p>
            ` : s`
              <div class="filter-builder__query-preview">
                ${e.parts.map((t) => y(this, m, Xa).call(this, t))}
              </div>
            `}
      </div>
    `;
};
Xa = function(e) {
  return e.kind === "keyword" ? s`
        <p class="filter-builder__query-keyword">${e.keyword}</p>
      ` : s`
      <p class="filter-builder__query-condition">${e.text}</p>
    `;
};
Mi = function(e) {
  return !(!e || this.loading || this.loadingMetadata || this._showValidation && Object.keys(this._fieldErrorsByConditionId).length > 0);
};
Ja = function(e, t) {
  const i = y(this, m, Mi).call(this, e);
  return s`
      <div class="filter-builder__action-bar" role="toolbar" aria-label="Search actions">
        <div class="filter-builder__action-status">
          ${i ? s`
                <uui-icon
                  class="filter-builder__action-status-icon"
                  name="icon-check"
                ></uui-icon>
                <p class="filter-builder__ready" role="status">
                  Your search is ready to run. Press Ctrl+Enter to search.
                </p>
              ` : s`
                <p class="filter-builder__action-hint" role="status">
                  ${this._showValidation ? "Please fix the highlighted fields below." : t ?? Nc(this.conditions, this.searchScope)}
                </p>
              `}
        </div>
        <div class="filter-builder__actions">
          <uui-button
            look="secondary"
            label="Clear search"
            ?disabled=${this.loading}
            @click=${y(this, m, wn)}
          >
            Clear
          </uui-button>
          <uui-button
            look="primary"
            color="positive"
            label=${i ? "Search content" : "Search content (complete your conditions first)"}
            ?disabled=${!i}
            @click=${y(this, m, Fi)}
          >
            <uui-icon name="icon-search"></uui-icon>
            Search
          </uui-button>
        </div>
      </div>
    `;
};
Za = function() {
  return !this.hasSearched || !this.hasDraftChanges ? d : s`
      <uui-alert
        class="filter-builder__draft-banner"
        headline="Search not up to date"
        detail="Your conditions have changed. Click Search to refresh the results."
        color="warning"
      ></uui-alert>
    `;
};
Qa = function(e) {
  return e || this._showValidation ? d : d;
};
en = function() {
  return s`
      <div
        class="filter-builder__toolbar"
        role="toolbar"
        aria-label="Search builder options"
      >
        <div class="filter-builder__toolbar-group filter-builder__toolbar-group--match">
          <span class="filter-builder__control-label">Match</span>
          <uui-select
            class="filter-builder__toolbar-select filter-builder__toolbar-select--match"
            label="Match mode"
            .value=${this.filterType}
            .options=${ip(this.filterType)}
            @change=${y(this, m, rn)}
          ></uui-select>
        </div>
        <div class="filter-builder__toolbar-divider" aria-hidden="true"></div>
        <div class="filter-builder__toolbar-group filter-builder__toolbar-group--scope">
          <span class="filter-builder__control-label">Search scope</span>
          <uui-select
            class="filter-builder__toolbar-select filter-builder__toolbar-select--scope"
            label="Search scope"
            .value=${this.searchScope}
            .options=${op(this.searchScope)}
            @change=${y(this, m, on)}
          ></uui-select>
        </div>
        <div class="filter-builder__toolbar-divider" aria-hidden="true"></div>
        <div class="filter-builder__toolbar-group filter-builder__toolbar-group--culture">
          <span class="filter-builder__control-label">${rr}</span>
          <uui-select
            class="filter-builder__toolbar-select filter-builder__toolbar-select--culture"
            label=${rr}
            .value=${this.searchCultureMode}
            .options=${np(this.searchCultureMode)}
            @change=${y(this, m, an)}
          ></uui-select>
          ${this.searchCultureMode === "SpecificCulture" ? s`
                <uui-select
                  class="filter-builder__toolbar-select filter-builder__toolbar-select--language"
                  label=${Dl}
                  .value=${this.culture}
                  .options=${sp(this.languages, this.culture)}
                  ?disabled=${this.loadingLanguages || this.languages.length === 0}
                  @change=${y(this, m, nn)}
                ></uui-select>
              ` : d}
        </div>
        <div class="filter-builder__toolbar-divider" aria-hidden="true"></div>
        <div
          class="filter-builder__toolbar-group filter-builder__toolbar-group--properties"
        >
          <uui-checkbox
            class="filter-builder__toolbar-checkbox"
            label=${Al}
            .checked=${this.showSearchablePropertiesOnly}
            ?disabled=${this.loading}
            @change=${y(this, m, tn)}
          ></uui-checkbox>
          ${y(this, m, ci).call(this) ? s`
                <span class="filter-builder__toolbar-summary"
                  >${y(this, m, ci).call(this)}</span
                >
              ` : d}
        </div>
      </div>
    `;
};
tn = function(e) {
  const t = !!e.target.checked;
  t !== this.showSearchablePropertiesOnly && y(this, m, vn).call(this, t);
};
rn = function(e) {
  const t = String(e.target.value ?? "");
  t !== "All" && t !== "Any" || t !== this.filterType && y(this, m, mn).call(this, t);
};
on = function(e) {
  const t = String(e.target.value ?? "");
  t !== "ContentType" && t !== "EntireSite" || t !== this.searchScope && y(this, m, yn).call(this, t);
};
an = function(e) {
  const t = String(e.target.value ?? "");
  t !== "AllCultures" && t !== "CurrentCulture" && t !== "SpecificCulture" || t !== this.searchCultureMode && this.dispatchEvent(
    new CustomEvent(up, {
      detail: { searchCultureMode: t },
      bubbles: !0,
      composed: !0
    })
  );
};
nn = function(e) {
  const t = String(e.target.value ?? "");
  !t || t === this.culture || this.dispatchEvent(
    new CustomEvent(pp, {
      detail: { culture: t },
      bubbles: !0,
      composed: !0
    })
  );
};
sn = function() {
  return s`
      <header class="fn-section-header filter-builder__header">
        <h3 class="fn-section-header__title">Search builder</h3>
        <p class="fn-section-header__description">
          Add conditions, review the summary, then search your content.
        </p>
      </header>
    `;
};
ln = function() {
  const e = this.conditions.length < jt;
  return s`
      <div class="filter-builder__add">
        <uui-button
          look="secondary"
          label="Add condition"
          ?disabled=${!e || this.loading}
          @click=${y(this, m, bn)}
        >
          <uui-icon name="icon-add"></uui-icon>
          Add condition
        </uui-button>
      </div>
    `;
};
Fi = async function() {
  const e = y(this, m, it).call(this), t = kt(
    this.conditions,
    e,
    this.filterType
  );
  if (!t.isValid) {
    this._showValidation = !0, this._fieldErrorsByConditionId = jc(
      t.errors
    ), await this.updateComplete, y(this, m, Sn).call(this, t.firstError);
    return;
  }
  y(this, m, rt).call(this), y(this, m, Cn).call(this);
};
cn = function(e) {
  if (e.key !== "Enter" || !(e.ctrlKey || e.metaKey))
    return;
  const t = y(this, m, it).call(this), i = kt(
    this.conditions,
    t,
    this.filterType
  ).isValid;
  y(this, m, Mi).call(this, i) && (e.preventDefault(), y(this, m, Fi).call(this));
};
un = function(e) {
  if (!this.showSearchablePropertiesOnly)
    return "";
  const t = U(this.searchScope) ? je(this.contentTypes) : y(this, m, zi).call(this, e);
  return t.length === 0 ? "" : Bc(go(t)) ?? "";
};
ci = function() {
  if (!this.showSearchablePropertiesOnly)
    return;
  const e = U(this.searchScope) ? je(this.contentTypes) : [
    ...new Set(
      this.conditions.map((t) => t.contentTypeAlias.trim()).filter(
        (t) => t && !G(t)
      )
    )
  ].flatMap(
    (t) => this.propertyMetadataByContentType[t] ?? []
  );
  if (e.length !== 0)
    return Mc(
      go(e)
    );
};
pn = function(e) {
  const t = U(this.searchScope) ? je(this.contentTypes) : y(this, m, zi).call(this, e);
  return Wl(
    t,
    this.showSearchablePropertiesOnly,
    e.propertyAlias
  );
};
zi = function(e) {
  const t = e.contentTypeAlias;
  return !t || G(t) ? [] : this.propertyMetadataByContentType[t] ?? [];
};
dn = function(e) {
  if (U(this.searchScope))
    return !1;
  const t = e.contentTypeAlias.trim();
  return !t || G(t) ? !1 : this.loadingPropertyContentTypeAliases.includes(t);
};
hn = function(e) {
  const { conditionId: t, ...i } = e.detail;
  y(this, m, rt).call(this), y(this, m, Vi).call(this, t, i);
};
fn = function(e) {
  const { conditionId: t, contentTypeAlias: i } = e.detail;
  y(this, m, Vi).call(this, t, { contentTypeAlias: i });
};
_n = function(e) {
  y(this, m, gn).call(this, e.detail.conditionId);
};
mn = function(e) {
  this.dispatchEvent(
    new CustomEvent(lp, {
      detail: { filterType: e },
      bubbles: !0,
      composed: !0
    })
  );
};
yn = function(e) {
  y(this, m, rt).call(this), this.dispatchEvent(
    new CustomEvent(cp, {
      detail: { searchScope: e },
      bubbles: !0,
      composed: !0
    })
  );
};
vn = function(e) {
  this.dispatchEvent(
    new CustomEvent(dp, {
      detail: { showSearchablePropertiesOnly: e },
      bubbles: !0,
      composed: !0
    })
  );
};
Vi = function(e, t) {
  this.dispatchEvent(
    new CustomEvent(hp, {
      detail: { conditionId: e, patch: t },
      bubbles: !0,
      composed: !0
    })
  );
};
gn = function(e) {
  this.dispatchEvent(
    new CustomEvent(fp, {
      detail: { conditionId: e },
      bubbles: !0,
      composed: !0
    })
  );
};
bn = function() {
  this.dispatchEvent(
    new CustomEvent(_p, {
      bubbles: !0,
      composed: !0
    })
  );
};
Cn = function() {
  this.dispatchEvent(
    new CustomEvent(mp, {
      bubbles: !0,
      composed: !0
    })
  );
};
Sn = function(e) {
  if (!e)
    return;
  this.renderRoot.querySelector(
    `filter-condition-row[data-condition-id="${e.conditionId}"]`
  )?.focusField(e.field);
};
rt = function() {
  this._showValidation = !1, this._fieldErrorsByConditionId = {};
};
wn = function() {
  y(this, m, rt).call(this), this.dispatchEvent(
    new CustomEvent(yp, {
      bubbles: !0,
      composed: !0
    })
  );
};
R.styles = [Tt, ...Xu];
F([
  p({ type: String })
], R.prototype, "filterType", 2);
F([
  p({ type: String })
], R.prototype, "searchScope", 2);
F([
  p({ type: String })
], R.prototype, "searchCultureMode", 2);
F([
  p({ type: String })
], R.prototype, "culture", 2);
F([
  p({ type: Array })
], R.prototype, "languages", 2);
F([
  p({ type: Boolean })
], R.prototype, "loadingLanguages", 2);
F([
  p({ type: Array })
], R.prototype, "conditions", 2);
F([
  p({ type: Array })
], R.prototype, "contentTypes", 2);
F([
  p({ type: Object })
], R.prototype, "propertyMetadataByContentType", 2);
F([
  p({ type: Boolean })
], R.prototype, "loading", 2);
F([
  p({ type: Boolean })
], R.prototype, "loadingMetadata", 2);
F([
  p({ type: Array })
], R.prototype, "loadingPropertyContentTypeAliases", 2);
F([
  p({ type: Boolean })
], R.prototype, "hasSearched", 2);
F([
  p({ type: Boolean })
], R.prototype, "hasDraftChanges", 2);
F([
  p({ type: Boolean })
], R.prototype, "showSearchablePropertiesOnly", 2);
F([
  _()
], R.prototype, "_showValidation", 2);
F([
  _()
], R.prototype, "_fieldErrorsByConditionId", 2);
R = F([
  Q("filter-nodes-filter-builder")
], R);
const vp = "filter-active-filters-remove", gp = [
  $e,
  M`
    :host {
      display: block;
      width: 100%;
    }

    .active-filters {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--uui-size-space-2) var(--fn-space-inline);
      padding: var(--fn-space-inline) 0;
    }

    .active-filters__label {
      margin: 0;
      color: var(--uui-color-text-alt);
      font-size: var(--uui-type-small-size);
      font-weight: 600;
      white-space: nowrap;
    }

    .active-filters__chips {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--uui-size-space-2);
      flex: 1;
      min-width: 0;
    }

    .active-filters__chip {
      display: inline-flex;
      align-items: center;
      gap: var(--uui-size-space-1);
      max-width: 100%;
      font-weight: 600;
    }

    .active-filters__chip-label {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .active-filters__remove {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      width: 1.25rem;
      height: 1.25rem;
      padding: 0;
      border: none;
      border-radius: var(--fn-radius);
      background: transparent;
      color: inherit;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 700;
      line-height: 1;
      opacity: 0.72;
      transition: opacity 150ms ease;
    }

    .active-filters__remove:hover {
      opacity: 1;
    }

    .active-filters__remove:focus-visible {
      outline: 2px solid var(--uui-color-focus);
      outline-offset: 1px;
    }

    .active-filters__remove:disabled {
      cursor: not-allowed;
      opacity: 0.4;
    }
  `
];
var bp = Object.defineProperty, Cp = Object.getOwnPropertyDescriptor, En = (e) => {
  throw TypeError(e);
}, Ui = (e, t, i, r) => {
  for (var o = r > 1 ? void 0 : r ? Cp(t, i) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (o = (r ? n(t, i, o) : n(o)) || o);
  return r && o && bp(t, i, o), o;
}, Sp = (e, t, i) => t.has(e) || En("Cannot " + i), wp = (e, t, i) => t.has(e) ? En("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), $n = (e, t, i) => (Sp(e, t, "access private method"), i), _t, Tn, xn;
let Ke = class extends ee {
  constructor() {
    super(...arguments), wp(this, _t), this.badges = [], this.loading = !1;
  }
  render() {
    if (this.badges.length !== 0)
      return s`
      <div class="active-filters" role="region" aria-label="Active filters">
        <p class="active-filters__label">Active filters</p>
        <div class="active-filters__chips">
          ${this.badges.map((e) => $n(this, _t, Tn).call(this, e))}
        </div>
      </div>
    `;
  }
};
_t = /* @__PURE__ */ new WeakSet();
Tn = function(e) {
  return s`
      <uui-tag look="secondary" class="active-filters__chip">
        <span class="active-filters__chip-label">${e.label}</span>
        <button
          type="button"
          class="active-filters__remove"
          aria-label=${`Remove filter ${e.label}`}
          title="Remove filter"
          ?disabled=${this.loading}
          @click=${() => $n(this, _t, xn).call(this, e.conditionId, e.kind)}
        >
          <span aria-hidden="true">×</span>
        </button>
      </uui-tag>
    `;
};
xn = function(e, t) {
  this.dispatchEvent(
    new CustomEvent(vp, {
      detail: { conditionId: e, kind: t },
      bubbles: !0,
      composed: !0
    })
  );
};
Ke.styles = [...gp];
Ui([
  p({ type: Array })
], Ke.prototype, "badges", 2);
Ui([
  p({ type: Boolean })
], Ke.prototype, "loading", 2);
Ke = Ui([
  Q("filter-active-filters")
], Ke);
const Gi = "(Not Published)", Hi = "(Unavailable)", An = "(Not published)";
function Dn(e) {
  const t = e?.trim();
  return !t || t === "—" ? !1 : t !== Gi && t !== An && t !== Hi;
}
function Pn(e) {
  const t = e?.trim();
  return t ? t === An ? Gi : t : Hi;
}
function Ep(e, t, i) {
  const r = [];
  for (const o of e) {
    const a = o.propertyValue.trim(), n = o.filterOperator;
    if (!a || !n || !Or.includes(n) || i && o.contentTypeAlias && o.contentTypeAlias !== i)
      continue;
    const l = Kr(
      t,
      o.contentTypeAlias,
      o.propertyAlias
    );
    $p(o.propertyAlias, l) && r.push({
      term: a,
      operator: n
    });
  }
  return r;
}
function $p(e, t) {
  return e === At ? !0 : re(t) === "Text";
}
function Tp(e, t) {
  if (!e || t.length === 0)
    return [{ text: e, highlight: !1 }];
  const i = Ap(
    t.flatMap((a) => xp(e, a))
  );
  if (i.length === 0)
    return [{ text: e, highlight: !1 }];
  const r = [];
  let o = 0;
  for (const [a, n] of i)
    o < a && r.push({ text: e.slice(o, a), highlight: !1 }), r.push({ text: e.slice(a, n), highlight: !0 }), o = n;
  return o < e.length && r.push({ text: e.slice(o), highlight: !1 }), r;
}
function xp(e, t) {
  const i = t.term;
  if (!i)
    return [];
  const r = e.toLowerCase(), o = i.toLowerCase();
  switch (t.operator) {
    case "Contains": {
      const a = [];
      let n = 0;
      for (; n < e.length; ) {
        const l = r.indexOf(o, n);
        if (l === -1)
          break;
        a.push([l, l + i.length]), n = l + i.length;
      }
      return a;
    }
    case "StartsWith":
      return r.startsWith(o) ? [[0, i.length]] : [];
    case "EndsWith":
      return r.endsWith(o) ? [[e.length - i.length, e.length]] : [];
    case "Equals":
      return r === o ? [[0, e.length]] : [];
    default:
      return [];
  }
}
function Ap(e) {
  if (e.length === 0)
    return [];
  const t = [...e].sort((r, o) => r[0] - o[0]), i = [t[0]];
  for (let r = 1; r < t.length; r += 1) {
    const o = t[r], a = i[i.length - 1];
    o[0] <= a[1] ? a[1] = Math.max(a[1], o[1]) : i.push(o);
  }
  return i;
}
function Dp(e) {
  return Rl.generateAbsolute({
    unique: e
  });
}
const Pp = [
  {
    name: "Id",
    alias: "id",
    allowSorting: !0,
    width: "6rem",
    align: "right"
  },
  {
    name: "Name",
    alias: "name",
    elementName: "filter-results-name-column",
    allowSorting: !0
  },
  {
    name: "Content type",
    alias: "contentType",
    allowSorting: !0,
    width: "12rem"
  },
  {
    name: "Parent name",
    alias: "parentName",
    allowSorting: !1,
    width: "12rem",
    clipText: !0
  },
  {
    name: "Created",
    alias: "createDate",
    allowSorting: !0,
    width: "12rem"
  },
  {
    name: "Updated",
    alias: "updateDate",
    allowSorting: !0,
    width: "12rem"
  },
  {
    name: kl,
    alias: "matchedCulture",
    allowSorting: !1,
    width: "12rem",
    clipText: !0
  },
  {
    name: "URL",
    alias: "url",
    elementName: "filter-results-url-column",
    allowSorting: !1,
    width: "14rem"
  },
  {
    name: "Actions",
    alias: "actions",
    elementName: "filter-results-actions-column",
    allowSorting: !1,
    width: "11rem",
    align: "right"
  }
], Op = {
  allowSelection: !1,
  hideIcon: !0
};
function Lp(e, t) {
  const i = e !== "AllCultures" || t.some((r) => !!r.matchedCulture?.trim());
  return Pp.filter(
    (r) => r.alias !== "matchedCulture" || i
  );
}
function On(e, t = [], i = {}) {
  return e.map(
    (r) => kp(r, t, i)
  );
}
function kp(e, t = [], i = {}) {
  const r = Dp(e.key), o = Ep(
    t,
    i,
    e.contentTypeAlias
  ), a = {
    name: e.name,
    editPath: r,
    nameSegments: Tp(e.name, o)
  }, n = {
    editPath: r,
    url: Dn(e.url) ? e.url?.trim() : void 0
  };
  return {
    id: e.key,
    entityType: "document",
    data: [
      { columnAlias: "id", value: String(e.id) },
      { columnAlias: "name", value: a },
      {
        columnAlias: "contentType",
        value: e.contentTypeAlias ?? "—"
      },
      {
        columnAlias: "parentName",
        value: e.parentName?.trim() || "—"
      },
      {
        columnAlias: "createDate",
        value: vr(e.createDate)
      },
      {
        columnAlias: "updateDate",
        value: vr(e.updateDate)
      },
      {
        columnAlias: "matchedCulture",
        value: e.matchedCulture?.trim() || "—"
      },
      {
        columnAlias: "url",
        value: Pn(e.url)
      },
      { columnAlias: "actions", value: n }
    ]
  };
}
function vr(e) {
  if (!e)
    return "—";
  const t = new Date(e);
  return Number.isNaN(t.getTime()) ? e : t.toLocaleString();
}
function Ip(e) {
  return e === "id" || e === "name" || e === "contentType" || e === "parentName" || e === "createDate" || e === "updateDate" || e === "matchedCulture" || e === "url" || e === "actions";
}
function Np(e, t = []) {
  if (e.length === 0)
    return `empty:${gr(t)}`;
  const i = e[0]?.key ?? "", r = e[e.length - 1]?.key ?? "";
  return `${e.length}:${i}:${r}:${gr(t)}`;
}
function gr(e) {
  return e.map(
    (t) => `${t.contentTypeAlias}|${t.propertyAlias}|${t.filterOperator}|${t.propertyValue}`
  ).join(";");
}
const Ln = "filter-results-page-change", Rp = "filter-results-page-size-change", Bp = "filter-results-sort-change", Mp = [
  "Find pages updated in the last 7 days",
  "Find pages created this month",
  "Search by content name",
  "Search for content with empty fields",
  "Search across the entire site"
], le = {
  column: "name",
  descending: !1
}, Fp = [
  $e,
  Ei,
  M`
    :host {
      display: flex;
      flex-direction: column;
      gap: var(--fn-space-block);
      width: 100%;
    }

    .results-grid {
      display: flex;
      flex-direction: column;
      gap: var(--fn-space-block);
      position: relative;
    }

    .results-grid__table {
      position: relative;
      min-height: 8rem;
      overflow-x: auto;
      border-radius: var(--fn-radius);
      background: var(--fn-surface-muted);
    }

    .results-grid__table--loading {
      opacity: 0.55;
      pointer-events: none;
    }

    .results-grid__loading {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: color-mix(in srgb, var(--uui-color-surface) 70%, transparent);
      z-index: 1;
    }

    .results-grid__pagination {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: flex-end;
      gap: var(--fn-space-inline);
      padding-top: var(--uui-size-space-1);
    }

    .results-grid__page-jump {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-end;
      gap: var(--uui-size-space-2);
    }

    .results-grid__page-jump-input {
      width: 5.5rem;
      min-width: 5.5rem;
    }

    .results-grid__feedback {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: var(--fn-space-inline);
      padding: var(--fn-space-inline) var(--fn-space-block);
      border-radius: var(--fn-radius);
      background: var(--fn-surface-muted);
    }

    .results-grid__page-size {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--uui-size-space-2);
    }

    .results-grid__page-size-label {
      color: var(--uui-color-text-alt);
      font-size: var(--uui-type-small-size);
      white-space: nowrap;
    }

    .results-grid__summary {
      margin: 0;
      color: var(--uui-color-text-alt);
      font-size: var(--uui-type-small-size);
    }

    uui-pagination {
      display: block;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      gap: var(--uui-size-space-2);
      padding: var(--fn-space-block);
      color: var(--uui-color-text-alt);
      border-radius: var(--fn-radius);
      background: var(--fn-surface-muted);
    }

    .empty-state--initial {
      align-items: flex-start;
      text-align: left;
    }

    .empty-state__title {
      margin: 0;
      color: var(--uui-color-text);
      font-size: var(--uui-type-default-size);
      font-weight: 600;
      line-height: 1.3;
    }

    .empty-state__description {
      margin: var(--uui-size-space-1) 0 0;
      font-size: var(--uui-type-small-size);
      line-height: 1.45;
    }

    .empty-state--initial .empty-state__title,
    .empty-state--initial .empty-state__description {
      margin: 0;
    }

    .empty-state__examples-label {
      margin: var(--uui-size-space-2) 0 0;
      color: var(--uui-color-text);
      font-size: var(--uui-type-small-size);
      font-weight: 600;
      line-height: 1.3;
    }

    .empty-state__examples {
      margin: var(--uui-size-space-1) 0 0;
      padding-left: var(--uui-size-space-5);
      font-size: var(--uui-type-small-size);
      line-height: 1.5;
    }

    .empty-state__examples li + li {
      margin-top: var(--uui-size-space-1);
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--fn-space-inline);
      min-height: 7rem;
      padding: var(--fn-space-block);
      color: var(--uui-color-text-alt);
      border-radius: var(--fn-radius);
      background: var(--fn-surface-muted);
    }

    .loading-state__label {
      margin: 0;
      font-size: var(--uui-type-small-size);
    }

    @media (max-width: 720px) {
      .results-grid__feedback {
        flex-direction: column;
        align-items: flex-start;
      }

      .results-grid__page-size {
        width: 100%;
      }

      .results-grid__pagination {
        flex-direction: column;
        align-items: stretch;
      }

      .results-grid__page-jump {
        width: 100%;
      }

      .results-grid__page-jump-input {
        flex: 1 1 auto;
        width: auto;
      }
    }
  `
], mt = "Edit node (opens in new tab)", yt = "Open URL (opens in new tab)", br = "Copy URL";
var zp = Object.defineProperty, Vp = Object.getOwnPropertyDescriptor, kn = (e) => {
  throw TypeError(e);
}, In = (e, t, i, r) => {
  for (var o = r > 1 ? void 0 : r ? Vp(t, i) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (o = (r ? n(t, i, o) : n(o)) || o);
  return r && o && zp(t, i, o), o;
}, Up = (e, t, i) => t.has(e) || kn("Cannot " + i), Gp = (e, t, i) => t.has(e) ? kn("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), Cr = (e, t, i) => (Up(e, t, "access private method"), i), lt, ui;
let vt = class extends ee {
  constructor() {
    super(...arguments), Gp(this, lt);
  }
  render() {
    const e = this.value?.name?.trim();
    if (!e)
      return s`—`;
    const t = this.value?.editPath, i = this.value?.nameSegments ?? [{ text: e, highlight: !1 }];
    return t ? s`
      <a
        class="name-link"
        href=${t}
        target="_blank"
        rel="noopener noreferrer"
        title=${mt}
        aria-label=${`${mt}: ${e}`}
      >
        ${Cr(this, lt, ui).call(this, i)}
      </a>
    ` : Cr(this, lt, ui).call(this, i);
  }
};
lt = /* @__PURE__ */ new WeakSet();
ui = function(e) {
  return oe(
    e,
    (t, i) => i,
    (t) => t.highlight ? s`<mark class="name-highlight">${t.text}</mark>` : t.text
  );
};
vt.styles = [
  M`
      :host {
        display: block;
        min-width: 0;
      }

      .name-link {
        display: inline-block;
        max-width: 100%;
        color: var(--uui-color-interactive);
        font-weight: 500;
        text-decoration: none;
      }

      .name-link:hover {
        text-decoration: underline;
      }

      .name-link:focus-visible {
        outline: 2px solid var(--uui-color-focus);
        outline-offset: 2px;
        border-radius: 2px;
      }

      .name-highlight {
        background-color: var(--uui-color-focus, #ffd966);
        color: inherit;
        font-weight: 600;
        padding: 0 0.1em;
        border-radius: 2px;
      }
    `
];
In([
  p({ attribute: !1 })
], vt.prototype, "value", 2);
vt = In([
  Q("filter-results-name-column")
], vt);
var Hp = Object.defineProperty, Kp = Object.getOwnPropertyDescriptor, Nn = (e) => {
  throw TypeError(e);
}, Rn = (e, t, i, r) => {
  for (var o = r > 1 ? void 0 : r ? Kp(t, i) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (o = (r ? n(t, i, o) : n(o)) || o);
  return r && o && Hp(t, i, o), o;
}, Yp = (e, t, i) => t.has(e) || Nn("Cannot " + i), qp = (e, t, i) => t.has(e) ? Nn("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), Wp = (e, t, i) => (Yp(e, t, "access private method"), i), pi, Bn;
let gt = class extends ee {
  constructor() {
    super(...arguments), qp(this, pi);
  }
  render() {
    const e = Pn(this.value);
    return Dn(e) ? s`
      <a
        class="url-link"
        href=${e}
        target="_blank"
        rel="noopener noreferrer"
        title=${yt}
        aria-label=${`${yt}: ${e}`}
      >
        ${e}
      </a>
    ` : s`
        <span
          class="url-status ${Wp(this, pi, Bn).call(this, e)}"
          title=${e}
        >
          ${e}
        </span>
      `;
  }
};
pi = /* @__PURE__ */ new WeakSet();
Bn = function(e) {
  return e === Gi ? "url-status--not-published" : e === Hi ? "url-status--unavailable" : "";
};
gt.styles = [
  M`
      :host {
        display: block;
        min-width: 0;
        max-width: 16rem;
      }

      .url-link,
      .url-status {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .url-link {
        color: var(--uui-color-interactive);
        text-decoration: none;
      }

      .url-link:hover {
        text-decoration: underline;
      }

      .url-status {
        color: var(--uui-color-text-alt);
        font-style: italic;
      }

      .url-status--not-published,
      .url-status--unavailable {
        cursor: help;
      }
    `
];
Rn([
  p({ attribute: !1 })
], gt.prototype, "value", 2);
gt = Rn([
  Q("filter-results-url-column")
], gt);
var jp = Object.defineProperty, Xp = Object.getOwnPropertyDescriptor, Mn = (e) => {
  throw TypeError(e);
}, Fn = (e, t, i, r) => {
  for (var o = r > 1 ? void 0 : r ? Xp(t, i) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (o = (r ? n(t, i, o) : n(o)) || o);
  return r && o && jp(t, i, o), o;
}, Jp = (e, t, i) => t.has(e) || Mn("Cannot " + i), Zp = (e, t, i) => t.has(e) ? Mn("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), Qp = (e, t, i) => (Jp(e, t, "access private method"), i), di, zn;
let bt = class extends ee {
  constructor() {
    super(...arguments), Zp(this, di);
  }
  render() {
    if (!this.value)
      return d;
    const { editPath: e, url: t } = this.value;
    return s`
      <uui-button-group>
        <uui-button
          compact
          look="secondary"
          href=${e}
          target="_blank"
          rel="noopener noreferrer"
          label=${mt}
          title=${mt}
        >
          <uui-icon name="icon-edit"></uui-icon>
        </uui-button>
        ${t ? s`
              <uui-button
                compact
                look="secondary"
                href=${t}
                target="_blank"
                rel="noopener noreferrer"
                label=${yt}
                title=${yt}
              >
                <uui-icon name="icon-globe"></uui-icon>
              </uui-button>
              <uui-button
                compact
                look="secondary"
                label=${br}
                title=${br}
                @click=${() => Qp(this, di, zn).call(this, t)}
              >
                <uui-icon name="icon-clipboard-copy"></uui-icon>
              </uui-button>
            ` : d}
      </uui-button-group>
    `;
  }
};
di = /* @__PURE__ */ new WeakSet();
zn = async function(e) {
  try {
    await navigator.clipboard.writeText(e), (await this.getContext(or))?.peek("positive", {
      data: {
        headline: "Copied",
        message: "URL copied to clipboard."
      }
    });
  } catch {
    (await this.getContext(or))?.peek("danger", {
      data: {
        headline: "Copy failed",
        message: "Unable to copy the URL to the clipboard."
      }
    });
  }
};
bt.styles = [
  M`
      :host {
        display: block;
      }

      uui-button-group {
        display: inline-flex;
        flex-wrap: nowrap;
      }
    `
];
Fn([
  p({ attribute: !1 })
], bt.prototype, "value", 2);
bt = Fn([
  Q("filter-results-actions-column")
], bt);
var ed = Object.defineProperty, td = Object.getOwnPropertyDescriptor, Vn = (e) => {
  throw TypeError(e);
}, H = (e, t, i, r) => {
  for (var o = r > 1 ? void 0 : r ? td(t, i) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (o = (r ? n(t, i, o) : n(o)) || o);
  return r && o && ed(t, i, o), o;
}, Ki = (e, t, i) => t.has(e) || Vn("Cannot " + i), id = (e, t, i) => (Ki(e, t, "read from private field"), t.get(e)), Sr = (e, t, i) => t.has(e) ? Vn("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), rd = (e, t, i, r) => (Ki(e, t, "write to private field"), t.set(e, i), i), $ = (e, t, i) => (Ki(e, t, "access private method"), i), Ct, w, Un, Gn, Hn, ot, Kn, hi, Yn, qn, Wn, Yi, jn, Xn, Jn, Zn, Qn, qi, es, ts, is, rs, os, as;
let z = class extends ee {
  constructor() {
    super(...arguments), Sr(this, w), this.results = [], this.searchCultureMode = "AllCultures", this.loading = !1, this.hasSearched = !1, this.currentPage = 1, this.totalPages = 0, this.totalCount = 0, this.pageSize = 20, this.sortColumn = le.column, this.sortDescending = le.descending, this.conditions = [], this.propertyMetadataByContentType = {}, this._tableItems = On([]), this._pageJumpValue = "", Sr(this, Ct, "");
  }
  willUpdate(e) {
    super.willUpdate(e), e.has("currentPage") && (this._pageJumpValue = String(this.currentPage)), (e.has("results") || e.has("conditions") || e.has("propertyMetadataByContentType") || e.has("searchCultureMode")) && $(this, w, as).call(this);
  }
  render() {
    return $(this, w, Un).call(this) ? $(this, w, hi).call(this, "initial") : $(this, w, Gn).call(this) ? $(this, w, Kn).call(this) : $(this, w, Hn).call(this) ? s`
        <div class="results-grid">
          ${$(this, w, ot).call(this, "No matches for this search")}
          ${$(this, w, Yi).call(this)}
          ${$(this, w, hi).call(this, "no-results")}
        </div>
      ` : $(this, w, qn).call(this);
  }
};
Ct = /* @__PURE__ */ new WeakMap();
w = /* @__PURE__ */ new WeakSet();
Un = function() {
  return !this.hasSearched && this.results.length === 0 && !this.loading;
};
Gn = function() {
  return this.loading && this.results.length === 0;
};
Hn = function() {
  return this.hasSearched && this.results.length === 0 && !this.loading;
};
ot = function(e) {
  return s`
      <header class="fn-section-header results-grid__header">
        <h3 class="fn-section-header__title">Results</h3>
        ${e ? s`<p class="fn-section-header__description">${e}</p>` : d}
      </header>
    `;
};
Kn = function() {
  return s`
      <div class="results-grid">
        ${$(this, w, ot).call(this)}
        <div class="loading-state" role="status" aria-live="polite" aria-busy="true">
          <uui-loader></uui-loader>
          <p class="loading-state__label">Searching your content…</p>
        </div>
      </div>
    `;
};
hi = function(e) {
  if (e === "initial")
    return $(this, w, Yn).call(this);
  const t = $(this, w, is).call(this, e);
  return s`
      <div class="empty-state">
        <h4 class="empty-state__title">${t.title}</h4>
        <p class="empty-state__description">${t.description}</p>
      </div>
    `;
};
Yn = function() {
  return s`
      <div class="results-grid">
        ${$(this, w, ot).call(this)}
        <div class="empty-state empty-state--initial">
          <h4 class="empty-state__title">No search executed yet</h4>
          <p class="empty-state__description">
            Build a query above and click Search to view matching content.
          </p>
          <p class="empty-state__examples-label">Helpful examples:</p>
          <ul class="empty-state__examples">
            ${Mp.map(
    (e) => s`<li>${e}</li>`
  )}
          </ul>
        </div>
      </div>
    `;
};
qn = function() {
  const e = this.totalCount > 0 ? `${this.totalCount} matching ${this.totalCount === 1 ? "item" : "items"} found` : "Matching content", t = Lp(this.searchCultureMode, this.results);
  return s`
      <div class="results-grid">
        ${$(this, w, ot).call(this, e)}

        ${$(this, w, Yi).call(this)}

        <div
          class="results-grid__table ${this.loading ? "results-grid__table--loading" : ""}"
        >
          ${this.loading ? $(this, w, Wn).call(this) : d}
          <umb-table
            .config=${Op}
            .columns=${t}
            .items=${this._tableItems}
            .orderingColumn=${this.sortColumn}
            .orderingDesc=${this.sortDescending}
            ?sortable=${!this.loading}
            @ordered=${$(this, w, rs)}
          ></umb-table>
        </div>

        ${$(this, w, Xn).call(this)}
      </div>
    `;
};
Wn = function() {
  return s`
      <div class="results-grid__loading" role="status" aria-live="polite" aria-busy="true">
        <uui-loader></uui-loader>
      </div>
    `;
};
Yi = function() {
  if (this.hasSearched)
    return s`
      <div class="results-grid__feedback" role="status" aria-live="polite">
        <p class="results-grid__summary">${$(this, w, es).call(this)}</p>
        <div class="results-grid__page-size">
          <span class="results-grid__page-size-label">Page size</span>
          <uui-button-group>
            ${Fr.map((e) => $(this, w, jn).call(this, e))}
          </uui-button-group>
        </div>
      </div>
    `;
};
jn = function(e) {
  return s`
      <uui-button
        look=${this.pageSize === e ? "primary" : "secondary"}
        label=${`Show ${e} results per page`}
        ?disabled=${this.loading}
        @click=${() => $(this, w, ts).call(this, e)}
      >
        ${e}
      </uui-button>
    `;
};
Xn = function() {
  if (!(!this.hasSearched || this.totalPages <= 1))
    return s`
      <div class="results-grid__pagination">
        <uui-pagination
          .current=${this.currentPage}
          .total=${this.totalPages}
          firstlabel="First"
          previouslabel="Previous"
          nextlabel="Next"
          lastlabel="Last"
          ?disabled=${this.loading}
          @change=${$(this, w, os)}
        ></uui-pagination>
        ${$(this, w, Jn).call(this)}
      </div>
    `;
};
Jn = function() {
  return s`
      <div class="results-grid__page-jump">
        <uui-input
          class="results-grid__page-jump-input"
          label="Go to page"
          type="number"
          min="1"
          max=${this.totalPages}
          .value=${this._pageJumpValue}
          ?disabled=${this.loading}
          @input=${$(this, w, Zn)}
          @keydown=${$(this, w, Qn)}
        ></uui-input>
        <uui-button
          look="secondary"
          label="Go to page"
          ?disabled=${this.loading}
          @click=${$(this, w, qi)}
        >
          Go
        </uui-button>
      </div>
    `;
};
Zn = function(e) {
  this._pageJumpValue = e.target.value;
};
Qn = function(e) {
  e.key === "Enter" && (e.preventDefault(), $(this, w, qi).call(this));
};
qi = function() {
  const e = Number.parseInt(this._pageJumpValue, 10);
  !Number.isFinite(e) || e < 1 || e > this.totalPages || e === this.currentPage || this.loading || this.dispatchEvent(
    new CustomEvent(Ln, {
      detail: { page: e },
      bubbles: !0,
      composed: !0
    })
  );
};
es = function() {
  const e = `Page ${this.currentPage}`, t = `${this.pageSize} per page`;
  if (this.totalCount <= 0)
    return `${e} · No matches · ${t}`;
  const i = (this.currentPage - 1) * this.pageSize + 1, r = Math.min(this.currentPage * this.pageSize, this.totalCount);
  return `${e} · Showing ${i}–${r} of ${this.totalCount} · ${t}`;
};
ts = function(e) {
  e === this.pageSize || this.loading || this.dispatchEvent(
    new CustomEvent(Rp, {
      detail: { pageSize: e },
      bubbles: !0,
      composed: !0
    })
  );
};
is = function(e) {
  return e === "no-results" ? {
    title: "No matches found",
    description: "Nothing matched your search. Try broadening your conditions or removing one, then search again."
  } : {
    title: "Find content faster",
    description: "Add conditions above to search your content."
  };
};
rs = function(e) {
  if (this.loading)
    return;
  const t = e.target, i = t.orderingColumn;
  if (!Ip(i))
    return;
  const r = {
    column: i,
    descending: t.orderingDesc
  };
  this.dispatchEvent(
    new CustomEvent(Bp, {
      detail: r,
      bubbles: !0,
      composed: !0
    })
  );
};
os = function(e) {
  const i = e.target?.current;
  !i || i === this.currentPage || this.loading || this.dispatchEvent(
    new CustomEvent(Ln, {
      detail: { page: i },
      bubbles: !0,
      composed: !0
    })
  );
};
as = function() {
  const e = Np(this.results, this.conditions);
  e !== id(this, Ct) && (rd(this, Ct, e), this._tableItems = On(
    this.results,
    this.conditions,
    this.propertyMetadataByContentType
  ));
};
z.styles = [Tt, ...Fp];
H([
  p({ type: Array })
], z.prototype, "results", 2);
H([
  p({ type: String })
], z.prototype, "searchCultureMode", 2);
H([
  p({ type: Boolean })
], z.prototype, "loading", 2);
H([
  p({ type: Boolean })
], z.prototype, "hasSearched", 2);
H([
  p({ type: Number })
], z.prototype, "currentPage", 2);
H([
  p({ type: Number })
], z.prototype, "totalPages", 2);
H([
  p({ type: Number })
], z.prototype, "totalCount", 2);
H([
  p({ type: Number })
], z.prototype, "pageSize", 2);
H([
  p({ type: String })
], z.prototype, "sortColumn", 2);
H([
  p({ type: Boolean })
], z.prototype, "sortDescending", 2);
H([
  p({ type: Array })
], z.prototype, "conditions", 2);
H([
  p({ attribute: !1 })
], z.prototype, "propertyMetadataByContentType", 2);
H([
  _()
], z.prototype, "_tableItems", 2);
H([
  _()
], z.prototype, "_pageJumpValue", 2);
z = H([
  Q("filter-results-grid")
], z);
function wr(e, t) {
  return `${e}:${t}`;
}
function fi(e, t) {
  return Le(
    t.propertyMetadataByContentType,
    e.contentTypeAlias.trim(),
    e.propertyAlias.trim(),
    t.searchScope,
    t.contentTypes
  );
}
function Er(e, t, i, r, o) {
  if (t === "IsEmpty" || t === "IsNotEmpty")
    return {
      ...i ? { contentTypeAlias: i } : {},
      propertyAlias: e,
      filterOperator: t
    };
  if (ue(o, e)) {
    if (t === "Between") {
      const n = r.fromDate.trim(), l = r.toDate.trim();
      if (!n && !l)
        return;
    } else if (t === "LessThan" || t === "LessThanOrEqual") {
      if (!r.toDate.trim())
        return;
    } else if (!r.fromDate.trim())
      return;
    return {
      ...i ? { contentTypeAlias: i } : {},
      propertyAlias: e,
      filterOperator: t,
      fromDate: r.fromDate || void 0,
      toDate: r.toDate || void 0
    };
  }
  if (re(o) === "Date" && t === "Between") {
    const n = r.fromDate.trim(), l = r.toDate.trim();
    return !n || !l ? void 0 : {
      ...i ? { contentTypeAlias: i } : {},
      propertyAlias: e,
      filterOperator: t,
      fromDate: n,
      toDate: l
    };
  }
  const a = r.propertyValue.trim();
  if (a)
    return {
      ...i ? { contentTypeAlias: i } : {},
      propertyAlias: e,
      filterOperator: t,
      propertyValue: a
    };
}
function ns(e, t) {
  const i = e.propertyAlias.trim(), r = e.filterOperator;
  if (!i) {
    if (U(t.searchScope))
      return;
    const n = e.contentTypeAlias.trim();
    return !n || G(n) ? void 0 : { contentTypeAlias: n };
  }
  if (!r)
    return;
  if (U(t.searchScope)) {
    if (!ut(i))
      return;
    const n = fi(e, t);
    return Er(
      i,
      r,
      void 0,
      e,
      n
    );
  }
  const o = e.contentTypeAlias.trim();
  if (!o || G(o))
    return;
  const a = fi(e, t);
  return Er(
    i,
    r,
    o,
    e,
    a
  );
}
function od(e, t) {
  const i = [], r = U(t.searchScope);
  for (const o of e) {
    const a = o.contentTypeAlias.trim(), n = o.propertyAlias.trim();
    if (!r && !n && a) {
      i.push({
        badgeId: wr(o.id, "contentType"),
        conditionId: o.id,
        kind: "contentType",
        label: Xt(
          a,
          t.contentTypes
        )
      });
      continue;
    }
    if (!n)
      continue;
    const l = fi(o, t);
    if (!pd(o, l))
      continue;
    const v = ld(o, l);
    v && i.push({
      badgeId: wr(o.id, "expression"),
      conditionId: o.id,
      kind: "expression",
      label: v
    });
  }
  return i;
}
function ad(e, t, i) {
  const r = e.filter(
    (o) => o.id !== t
  );
  return r.length > 0 ? r : [be()];
}
function nd(e, t) {
  return e.some(
    (i) => ns(i, t) !== void 0
  );
}
const sd = {
  today: "Today",
  yesterday: "Yesterday",
  last7Days: "Last 7 Days",
  last30Days: "Last 30 Days",
  thisMonth: "This Month",
  lastMonth: "Last Month"
};
function ld(e, t) {
  const i = e.propertyAlias.trim(), r = hd(t, i), o = re(t), a = ue(t, i), n = e.filterOperator;
  if (!n)
    return "";
  const l = cd(
    e,
    i,
    r,
    n,
    a,
    o
  );
  if (l)
    return l;
  if (n === "IsEmpty" || n === "IsNotEmpty")
    return `${r} ${ct(n, o, a)}`;
  if (a)
    return dd(e, r, n);
  if (o === "Date") {
    if (n === "Between") {
      const g = e.fromDate.trim(), x = e.toDate.trim();
      if (g && x)
        return `${r} between ${g} and ${x}`;
    }
    return `${r} ${ct(n, o, !1)} ${e.propertyValue}`;
  }
  const v = ud(
    e.propertyValue,
    t
  );
  return `${r} ${ct(n, o, a)} ${v}`;
}
function cd(e, t, i, r, o, a) {
  if (r !== "Between" || a !== "Date" && !o)
    return;
  const n = Ti(
    e.fromDate,
    e.toDate,
    e.propertyValue,
    r,
    o ? "system" : "custom"
  );
  if (!n || n === "custom")
    return;
  const l = sd[n];
  return t === qe ? `Updated ${l}` : t === Ye ? `Created ${l}` : `${i} ${l}`;
}
function ud(e, t) {
  const i = re(t);
  if (i === "MultiSelect")
    return Je(e).map(
      (r) => t?.options?.find((o) => o.value === r)?.label ?? r
    ).join(", ");
  if (i === "Dropdown") {
    const r = t?.options?.find((o) => o.value === e)?.label ?? e;
    return $r(r) ?? r;
  }
  return $r(e) ?? e;
}
function pd(e, t) {
  const i = e.filterOperator;
  return i ? i === "IsEmpty" || i === "IsNotEmpty" ? !0 : ue(t, e.propertyAlias) ? i === "Between" ? !!(e.fromDate.trim() || e.toDate.trim()) : i === "LessThan" || i === "LessThanOrEqual" ? e.toDate.trim() !== "" : e.fromDate.trim() !== "" : re(t) === "Date" && i === "Between" ? !!(e.fromDate.trim() && e.toDate.trim()) : e.propertyValue.trim() !== "" : !1;
}
function dd(e, t, i) {
  if (i === "Between") {
    const a = e.fromDate.trim(), n = e.toDate.trim();
    return a && n ? `${t} between ${a} and ${n}` : a ? `${t} on or after ${a}` : n ? `${t} on or before ${n}` : `${t} between`;
  }
  const o = i === "LessThan" || i === "LessThanOrEqual" ? e.toDate.trim() : e.fromDate.trim();
  return `${t} ${ct(i, "Date", !0)} ${o}`;
}
function hd(e, t) {
  return e?.name ? e.name : t === Ye ? "Create Date" : t === qe ? "Update Date" : t === At ? "Node Name" : t === Dt ? "Content Type Alias" : t;
}
function ct(e, t, i) {
  const r = t === "Date" || i;
  switch (e) {
    case "Contains":
      return "contains";
    case "StartsWith":
      return "starts with";
    case "EndsWith":
      return "ends with";
    case "Equals":
      return r ? "on" : "=";
    case "NotEquals":
      return r ? "not on" : "≠";
    case "GreaterThan":
      return r ? "after" : ">";
    case "GreaterThanOrEqual":
      return r ? "on or after" : "≥";
    case "LessThan":
      return r ? "before" : "<";
    case "LessThanOrEqual":
      return r ? "on or before" : "≤";
    case "Between":
      return "between";
    case "IsEmpty":
      return "is empty";
    case "IsNotEmpty":
      return "is not empty";
    default:
      return e;
  }
}
function $r(e) {
  const t = e.trim().toLowerCase();
  if (t === "true" || t === "1")
    return "True";
  if (t === "false" || t === "0")
    return "False";
}
const fd = {
  id: "id",
  name: "nodeName",
  contentType: "__NodeTypeAlias",
  createDate: "createDate",
  updateDate: "updateDate"
};
function _d(e, t) {
  return {
    field: fd[e] ?? "nodeName",
    direction: t ? "Descending" : "Ascending"
  };
}
class j extends Error {
  constructor(t, i, r) {
    super(t), this.name = "FilterApiError", this.status = i, this.title = r?.title, this.detail = r?.detail, this.instance = r?.instance, this.validationErrors = r?.validationErrors, r?.cause !== void 0 && (this.cause = r.cause);
  }
  /**
   * Creates a {@link FilterApiError} from a non-success {@link Response}.
   */
  static async fromResponse(t) {
    const i = await md(t);
    return j.fromProblem(i, t);
  }
  /**
   * Creates a {@link FilterApiError} from a parsed API problem payload.
   * Use this when the HTTP client has already consumed the response body.
   */
  static fromProblem(t, i) {
    const r = i.status;
    if (typeof t == "string")
      return new j(
        t || i.statusText || "The Filter Nodes API request failed.",
        r
      );
    if (t && yd(t)) {
      const o = t.errors ?? {}, a = Object.values(o).flat();
      return new j(
        a[0] ?? t.detail ?? t.title ?? i.statusText,
        r,
        {
          title: t.title,
          detail: t.detail,
          instance: t.instance,
          validationErrors: o
        }
      );
    }
    return t ? new j(
      t.detail ?? t.title ?? i.statusText,
      r,
      {
        title: t.title,
        detail: t.detail,
        instance: t.instance
      }
    ) : new j(
      i.statusText || "The Filter Nodes API request failed.",
      r
    );
  }
}
async function md(e) {
  if ((e.headers.get("content-type") ?? "").includes("json"))
    try {
      return await e.json();
    } catch {
      return;
    }
}
function yd(e) {
  return "errors" in e && e.errors !== void 0;
}
const Wi = "state-changed";
function vd() {
  return {
    loading: !1,
    loadingMetadata: !1,
    loadingPropertyContentTypeAliases: [],
    contentTypes: [],
    propertyMetadataByContentType: {},
    filterType: "All",
    searchScope: "ContentType",
    searchCultureMode: "AllCultures",
    culture: "",
    languages: [],
    loadingLanguages: !1,
    conditions: [be()],
    appliedConditions: [],
    appliedFilterType: "All",
    results: [],
    page: 1,
    pageSize: Nl,
    totalCount: 0,
    totalPages: 0,
    hasPreviousPage: !1,
    hasNextPage: !1,
    hasSearched: !1,
    savedFilters: [],
    loadingSavedFilters: !1,
    savingSavedFilter: !1,
    selectedSavedFilterId: "",
    sortColumn: le.column,
    sortDescending: le.descending,
    showSearchablePropertiesOnly: Il
  };
}
class gd extends EventTarget {
  #i;
  #r;
  #o;
  #e = vd();
  constructor(t) {
    super(), this.#i = t;
  }
  getState() {
    return this.#e;
  }
  async initialize() {
    await Promise.all([
      this.#u(),
      this.#c(),
      this.#p()
    ]);
  }
  setSearchCultureMode(t) {
    if (t === this.#e.searchCultureMode)
      return;
    const i = t === "SpecificCulture" ? this.#e.culture || this.#e.languages[0]?.isoCode || "" : t === "CurrentCulture" ? this.#e.culture : "";
    this.#t({
      searchCultureMode: t,
      culture: i,
      errorMessage: void 0
    });
  }
  setCulture(t) {
    t !== this.#e.culture && this.#t({ culture: t, errorMessage: void 0 });
  }
  setCurrentBackofficeCulture(t) {
    const i = t?.trim() ?? "";
    this.#e.searchCultureMode !== "CurrentCulture" || i === this.#e.culture || this.#t({ culture: i });
  }
  setFilterType(t) {
    this.#t({ filterType: t, errorMessage: void 0 });
  }
  setShowSearchablePropertiesOnly(t) {
    t !== this.#e.showSearchablePropertiesOnly && this.#t({ showSearchablePropertiesOnly: t, errorMessage: void 0 });
  }
  setSearchScope(t) {
    if (t === this.#e.searchScope)
      return;
    const i = this.#e.conditions.map((r) => t === "EntireSite" ? {
      ...r,
      contentTypeAlias: "",
      propertyAlias: ut(r.propertyAlias) ? r.propertyAlias : "",
      propertyValue: "",
      fromDate: "",
      toDate: "",
      filterOperator: ut(r.propertyAlias) ? r.filterOperator : ""
    } : {
      ...be(),
      id: r.id
    });
    this.#t({
      searchScope: t,
      conditions: i,
      selectedSavedFilterId: "",
      errorMessage: void 0
    });
  }
  addCondition() {
    if (this.#e.conditions.length >= jt) {
      this.#t({
        errorMessage: `A maximum of ${jt} conditions is allowed.`
      });
      return;
    }
    this.#t({
      conditions: [...this.#e.conditions, be()],
      errorMessage: void 0
    });
  }
  removeCondition(t) {
    const i = this.#e.conditions.filter(
      (r) => r.id !== t
    );
    this.#t({
      conditions: i.length > 0 ? i : [be()],
      errorMessage: void 0
    });
  }
  async updateCondition(t, i) {
    const r = i.contentTypeAlias !== void 0 && G(i.contentTypeAlias) ? { ...i, contentTypeAlias: "" } : i, o = this.#e.conditions.map((n) => {
      if (n.id !== t)
        return n;
      const l = { ...n, ...r };
      return r.contentTypeAlias !== void 0 && r.contentTypeAlias !== n.contentTypeAlias && (l.propertyAlias = "", l.propertyValue = "", l.fromDate = "", l.toDate = "", l.filterOperator = ""), r.propertyAlias !== void 0 && r.propertyAlias !== n.propertyAlias && (l.propertyValue = "", l.fromDate = "", l.toDate = "", l.filterOperator = ""), l;
    });
    this.#t({ conditions: o, errorMessage: void 0 });
    const a = o.find(
      (n) => n.id === t
    );
    !U(this.#e.searchScope) && a?.contentTypeAlias && !G(a.contentTypeAlias) && (r.contentTypeAlias !== void 0 || r.propertyAlias === "") && await this.#d(a.contentTypeAlias);
  }
  async search() {
    await this.#n(1);
  }
  async goToPage(t) {
    t < 1 || t === this.#e.page || this.#e.totalPages > 0 && t > this.#e.totalPages || await this.#n(t);
  }
  async setPageSize(t) {
    t !== this.#e.pageSize && Fr.includes(t) && (this.#t({ pageSize: t, page: 1 }), this.#e.hasSearched && await this.#n(1));
  }
  async setSort(t, i) {
    t === this.#e.sortColumn && i === this.#e.sortDescending || (this.#t({
      sortColumn: t,
      sortDescending: i,
      page: 1
    }), this.#e.hasSearched && await this.#n(1));
  }
  clearAll() {
    this.#r?.abort(), this.#r = void 0, this.#o?.abort(), this.#o = void 0, this.#t({
      loading: !1,
      loadingMetadata: !1,
      loadingPropertyContentTypeAliases: [],
      filterType: "All",
      searchScope: "ContentType",
      searchCultureMode: "AllCultures",
      culture: "",
      conditions: [be()],
      appliedConditions: [],
      appliedFilterType: "All",
      results: [],
      page: 1,
      totalCount: 0,
      totalPages: 0,
      hasPreviousPage: !1,
      hasNextPage: !1,
      hasSearched: !1,
      selectedSavedFilterId: "",
      sortColumn: le.column,
      sortDescending: le.descending,
      errorMessage: void 0
    });
  }
  async removeActiveFilterBadgeAndSearch(t, i) {
    const r = this.#e.appliedConditions.length > 0 ? this.#e.appliedConditions : this.#e.conditions, o = ad(
      r,
      t
    );
    this.#t({
      conditions: o,
      appliedConditions: Kt(o),
      filterType: this.#e.appliedFilterType,
      errorMessage: void 0
    }), this.#e.hasSearched && await this.#n(1, { allowPartialConditions: !0 });
  }
  async saveCurrentFilter(t) {
    const i = t.trim();
    if (!i) {
      this.#t({ errorMessage: "Saved filter name is required." });
      return;
    }
    if (U(this.#e.searchScope)) {
      this.#t({
        errorMessage: "Entire site searches cannot be saved. Switch to selected content type mode to save a filter."
      });
      return;
    }
    this.#t({ savingSavedFilter: !0, errorMessage: void 0 });
    try {
      const r = pc(i, this.#e), o = await this.#i.saveSavedFilter(r);
      this.#t({
        savingSavedFilter: !1,
        selectedSavedFilterId: o.id,
        savedFilters: this.#s([
          ...this.#e.savedFilters.filter((a) => a.id !== o.id),
          o
        ])
      });
    } catch (r) {
      this.#t({
        savingSavedFilter: !1,
        errorMessage: this.#a(r)
      });
    }
  }
  async loadSavedFilter(t) {
    const i = this.#e.savedFilters.find(
      (r) => r.id === t
    );
    if (i) {
      mc(i.id), this.#o?.abort(), this.#o = void 0, this.#t({
        selectedSavedFilterId: i.id,
        errorMessage: void 0
      });
      try {
        await this.#h(hc(i)), this.#t({
          filterType: i.filterType,
          searchScope: "ContentType",
          searchCultureMode: i.searchCultureMode ?? "AllCultures",
          culture: i.culture ?? "",
          conditions: dc(i.conditions),
          appliedConditions: [],
          appliedFilterType: "All",
          pageSize: i.pageSize,
          page: 1,
          results: [],
          totalCount: 0,
          totalPages: 0,
          hasPreviousPage: !1,
          hasNextPage: !1,
          sortColumn: le.column,
          sortDescending: le.descending
        }), await this.#n(1);
      } catch (r) {
        this.#t({
          errorMessage: this.#a(r)
        });
      }
    }
  }
  async deleteSavedFilter(t) {
    if (t) {
      this.#t({ loadingSavedFilters: !0, errorMessage: void 0 });
      try {
        await this.#i.deleteSavedFilter(t), yc(t), this.#t({
          loadingSavedFilters: !1,
          selectedSavedFilterId: this.#e.selectedSavedFilterId === t ? "" : this.#e.selectedSavedFilterId,
          savedFilters: this.#e.savedFilters.filter(
            (i) => i.id !== t
          )
        });
      } catch (i) {
        this.#t({
          loadingSavedFilters: !1,
          errorMessage: this.#a(i)
        });
      }
    }
  }
  clearSelectedSavedFilter() {
    this.#e.selectedSavedFilterId && this.#t({ selectedSavedFilterId: "" });
  }
  destroy() {
    this.#r?.abort(), this.#r = void 0, this.#o?.abort(), this.#o = void 0;
  }
  async #c() {
    this.#t({ loadingSavedFilters: !0, errorMessage: void 0 });
    try {
      const t = await this.#i.getSavedFilters();
      this.#t({
        loadingSavedFilters: !1,
        savedFilters: this.#s(t.filters ?? [])
      });
    } catch (t) {
      this.#t({
        loadingSavedFilters: !1,
        errorMessage: this.#a(t)
      });
    }
  }
  #s(t) {
    return [...t].sort(
      (i, r) => i.name.localeCompare(r.name, void 0, { sensitivity: "base" })
    );
  }
  async #u() {
    this.#r?.abort(), this.#r = new AbortController(), this.#t({ loadingMetadata: !0, errorMessage: void 0 });
    try {
      const t = await this.#i.getContentTypes(
        this.#r.signal
      );
      this.#t({
        contentTypes: this.#y(t),
        loadingMetadata: !1
      });
    } catch (t) {
      if (t instanceof DOMException && t.name === "AbortError")
        return;
      this.#t({
        loadingMetadata: !1,
        errorMessage: this.#a(t)
      });
    }
  }
  async #p() {
    this.#t({ loadingLanguages: !0 });
    try {
      const t = await this.#i.getLanguages();
      this.#t({
        languages: t.languages ?? [],
        loadingLanguages: !1
      });
    } catch (t) {
      this.#t({
        languages: [],
        loadingLanguages: !1,
        errorMessage: this.#a(t)
      });
    }
  }
  async #d(t) {
    if (!(G(t) || this.#e.propertyMetadataByContentType[t])) {
      this.#f(t);
      try {
        const r = (await this.#i.getProperties(
          t,
          this.#r?.signal
        )).properties ?? [];
        mr(r), this.#t({
          propertyMetadataByContentType: {
            ...this.#e.propertyMetadataByContentType,
            [t]: r
          }
        });
      } catch (i) {
        if (i instanceof DOMException && i.name === "AbortError")
          return;
        this.#t({
          errorMessage: this.#a(i)
        });
      } finally {
        this.#_(t);
      }
    }
  }
  async #h(t) {
    const i = t.filter(
      (r) => !G(r) && !this.#e.propertyMetadataByContentType[r]
    );
    if (i.length !== 0) {
      this.#t({
        loadingPropertyContentTypeAliases: [
          .../* @__PURE__ */ new Set([
            ...this.#e.loadingPropertyContentTypeAliases,
            ...i
          ])
        ],
        errorMessage: void 0
      });
      try {
        const r = await this.#i.getPropertiesBatch(
          i,
          this.#r?.signal
        ), o = { ...this.#e.propertyMetadataByContentType };
        for (const a of r.items ?? []) {
          const n = a.properties ?? [];
          mr(n), o[a.contentTypeAlias] = n;
        }
        this.#t({
          propertyMetadataByContentType: o
        });
      } catch (r) {
        if (r instanceof DOMException && r.name === "AbortError")
          return;
        this.#t({
          errorMessage: this.#a(r)
        });
      } finally {
        this.#t({
          loadingPropertyContentTypeAliases: this.#e.loadingPropertyContentTypeAliases.filter(
            (r) => !i.includes(r)
          )
        });
      }
    }
  }
  #f(t) {
    this.#e.loadingPropertyContentTypeAliases.includes(t) || this.#t({
      loadingPropertyContentTypeAliases: [
        ...this.#e.loadingPropertyContentTypeAliases,
        t
      ],
      errorMessage: void 0
    });
  }
  #_(t) {
    this.#e.loadingPropertyContentTypeAliases.includes(t) && this.#t({
      loadingPropertyContentTypeAliases: this.#e.loadingPropertyContentTypeAliases.filter(
        (i) => i !== t
      )
    });
  }
  async #n(t, i = {}) {
    const r = this.#l();
    if (i.allowPartialConditions ?? !1) {
      if (!nd(this.#e.conditions, r)) {
        this.#o?.abort(), this.#o = void 0, this.#t({
          loading: !1,
          hasSearched: !0,
          appliedConditions: Kt(this.#e.conditions),
          appliedFilterType: this.#e.filterType,
          results: [],
          page: 1,
          totalCount: 0,
          totalPages: 0,
          hasPreviousPage: !1,
          hasNextPage: !1,
          errorMessage: void 0
        });
        return;
      }
    } else if (!kt(
      this.#e.conditions,
      r,
      this.#e.filterType
    ).isValid)
      return;
    this.#o?.abort(), this.#o = new AbortController();
    const a = this.#m(t);
    this.#t({
      loading: !0,
      page: t,
      errorMessage: void 0
    });
    try {
      const n = await this.#i.search(
        a,
        this.#o.signal
      );
      this.#t({
        loading: !1,
        hasSearched: !0,
        appliedConditions: Kt(this.#e.conditions),
        appliedFilterType: this.#e.filterType,
        results: n.items,
        page: n.page,
        pageSize: n.pageSize,
        totalCount: n.totalCount,
        totalPages: n.totalPages,
        hasPreviousPage: n.hasPreviousPage,
        hasNextPage: n.hasNextPage
      });
    } catch (n) {
      if (n instanceof DOMException && n.name === "AbortError")
        return;
      this.#t({
        loading: !1,
        hasSearched: !0,
        results: [],
        totalCount: 0,
        totalPages: 0,
        hasPreviousPage: !1,
        hasNextPage: !1,
        errorMessage: this.#a(n)
      });
    }
  }
  #m(t) {
    const i = this.#l();
    return {
      filterType: this.#e.filterType,
      searchCultureMode: this.#e.searchCultureMode,
      culture: this.#v(),
      paging: {
        page: t,
        pageSize: this.#e.pageSize
      },
      sort: _d(this.#e.sortColumn, this.#e.sortDescending),
      conditions: this.#e.conditions.map((r) => ns(r, i)).filter((r) => r !== void 0)
    };
  }
  #l() {
    return {
      propertyMetadataByContentType: this.#e.propertyMetadataByContentType,
      searchScope: this.#e.searchScope,
      contentTypes: this.#e.contentTypes
    };
  }
  #y(t) {
    return t.contentTypes?.length ? We(t.contentTypes) : zl(t.aliases ?? []).map((i) => ({
      alias: i,
      name: bi(i)
    }));
  }
  #v() {
    return this.#e.searchCultureMode === "AllCultures" ? void 0 : this.#e.culture.trim() || void 0;
  }
  #a(t) {
    if (t instanceof j) {
      if (t.validationErrors) {
        const i = Object.values(t.validationErrors).flat();
        if (i.length > 0)
          return i.join(" ");
      }
      return t.detail ?? t.message;
    }
    return t instanceof Error ? t.message : "An unexpected error occurred.";
  }
  #t(t) {
    this.#e = { ...this.#e, ...t }, this.dispatchEvent(
      new CustomEvent(Wi, {
        detail: this.#e
      })
    );
  }
}
const bd = "/umbraco/phasesumbracofilternodes/api/v1", he = {
  contentTypes: "contenttypes",
  languages: "languages",
  properties: (e) => `properties/${encodeURIComponent(e)}`,
  propertiesBatch: "properties/batch",
  search: "search",
  savedFilters: "savedfilters",
  savedFilter: (e) => `savedfilters/${encodeURIComponent(e)}`
}, Cd = [
  {
    scheme: "bearer",
    type: "http"
  }
];
class Sd {
  get(t, i) {
    return this.#i("GET", t, void 0, i);
  }
  post(t, i, r) {
    return this.#i("POST", t, i, r);
  }
  delete(t, i) {
    return this.#i("DELETE", t, void 0, i);
  }
  async #i(t, i, r, o) {
    const n = {
      url: Ed(i),
      security: Cd,
      signal: o,
      ...r !== void 0 ? { body: r } : {}
    }, l = t === "GET" ? await Ht.get(n) : t === "POST" ? await Ht.post(n) : await Ht.delete(n);
    return this.#r(l);
  }
  async #r(t) {
    const { data: i, error: r, response: o } = t;
    if (r || !o.ok)
      throw j.fromProblem(
        r,
        o
      );
    if (o.status !== 204)
      return i;
  }
}
function wd() {
  return new Sd();
}
function Ed(e) {
  const t = e.replace(/^\/+/, "");
  return `${bd.replace(/\/+$/, "")}/${t}`;
}
class $d {
  #i;
  constructor(t) {
    this.#i = t;
  }
  /**
   * Gets the document type aliases available for filtering.
   */
  async getContentTypes(t) {
    return this.#i.get(
      he.contentTypes,
      t
    );
  }
  /**
   * Gets the installed languages available for culture-specific filtering.
   */
  async getLanguages(t) {
    return this.#i.get(
      he.languages,
      t
    );
  }
  /**
   * Gets the filterable property aliases for a document type.
   */
  async getProperties(t, i) {
    const r = t?.trim();
    if (!r)
      throw new j("Content type alias is required.", 400, {
        title: "Bad Request",
        detail: "The content type alias is required.",
        instance: "contentTypeAlias"
      });
    return this.#i.get(
      he.properties(r),
      i
    );
  }
  /**
   * Gets filterable property metadata for multiple document types.
   */
  async getPropertiesBatch(t, i) {
    const r = [
      ...new Set(
        t.map((o) => o?.trim()).filter((o) => !!o)
      )
    ];
    if (r.length === 0)
      throw new j("At least one content type alias is required.", 400, {
        title: "Bad Request",
        detail: "At least one content type alias is required.",
        instance: "contentTypeAliases"
      });
    return this.#i.post(
      he.propertiesBatch,
      { contentTypeAliases: r },
      i
    );
  }
  /**
   * Searches content nodes using the specified filter criteria.
   */
  async search(t, i) {
    if (!t)
      throw new j("Filter request is required.", 400, {
        title: "Bad Request",
        detail: "The request body is required.",
        instance: "request"
      });
    return this.#i.post(
      he.search,
      t,
      i
    );
  }
  /**
   * Gets saved filters for the current backoffice user.
   */
  async getSavedFilters(t) {
    return this.#i.get(
      he.savedFilters,
      t
    );
  }
  /**
   * Saves a filter configuration for the current backoffice user.
   */
  async saveSavedFilter(t, i) {
    if (!t?.name?.trim())
      throw new j("Saved filter name is required.", 400, {
        title: "Bad Request",
        detail: "Name is required.",
        instance: "name"
      });
    return this.#i.post(
      he.savedFilters,
      t,
      i
    );
  }
  /**
   * Deletes a saved filter for the current backoffice user.
   */
  async deleteSavedFilter(t, i) {
    const r = t?.trim();
    if (!r)
      throw new j("Saved filter id is required.", 400, {
        title: "Bad Request",
        detail: "The saved filter id is required.",
        instance: "savedFilterId"
      });
    await this.#i.delete(
      he.savedFilter(r),
      i
    );
  }
}
function Td(e) {
  return new $d(wd());
}
const xd = [
  $e,
  M`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }

    umb-body-layout {
      height: 100%;
    }

    .workspace-view {
      display: flex;
      flex-direction: column;
      gap: var(--fn-space-block);
      max-width: 80rem;
      margin: 0 auto;
      padding: var(--fn-space-block) var(--fn-space-section);
      box-sizing: border-box;
    }

    .workspace-view__card {
      --uui-box-default-padding: var(--fn-space-section);

      display: flex;
      flex-direction: column;
      gap: var(--fn-space-inline);
    }

    .workspace-view__card--results {
      flex: 1;
      min-height: 0;
    }

    .workspace-view__error {
      display: block;
    }

    @media (max-width: 720px) {
      .workspace-view {
        padding: var(--fn-space-inline);
        gap: var(--fn-space-inline);
      }

      .workspace-view__card {
        --uui-box-default-padding: var(--fn-space-block);
      }
    }
  `
];
var Ad = Object.defineProperty, Dd = Object.getOwnPropertyDescriptor, ss = (e) => {
  throw TypeError(e);
}, E = (e, t, i, r) => {
  for (var o = r > 1 ? void 0 : r ? Dd(t, i) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (o = (r ? n(t, i, o) : n(o)) || o);
  return r && o && Ad(t, i, o), o;
}, ji = (e, t, i) => t.has(e) || ss("Cannot " + i), b = (e, t, i) => (ji(e, t, "read from private field"), t.get(e)), Re = (e, t, i) => t.has(e) ? ss("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), St = (e, t, i, r) => (ji(e, t, "write to private field"), t.set(e, i), i), A = (e, t, i) => (ji(e, t, "access private method"), i), wt, Et, C, Gt, T, ls, cs, _i, Xi, us, ps, ds, hs, fs, _s, ms, ys, vs, gs, bs, Cs, Ss, ws, Es, $s, Ts, xs;
let S = class extends ee {
  constructor() {
    super(...arguments), Re(this, T), Re(this, wt), Re(this, Et), Re(this, C), Re(this, Gt, (e) => {
      const t = e.detail;
      A(this, T, Xi).call(this, t);
    }), this._loading = !1, this._loadingMetadata = !1, this._loadingPropertyContentTypeAliases = [], this._filterType = "All", this._searchScope = "ContentType", this._searchCultureMode = "AllCultures", this._culture = "", this._languages = [], this._loadingLanguages = !1, this._showSearchablePropertiesOnly = !0, this._conditions = [], this._appliedConditions = [], this._appliedFilterType = "All", this._contentTypes = [], this._propertyMetadataByContentType = {}, this._results = [], this._page = 1, this._pageSize = 20, this._totalCount = 0, this._totalPages = 0, this._hasSearched = !1, this._sortColumn = le.column, this._sortDescending = le.descending, this._savedFilters = [], this._loadingSavedFilters = !1, this._savingSavedFilter = !1, this._selectedSavedFilterId = "";
  }
  connectedCallback() {
    super.connectedCallback(), this.consumeContext(Ps, (e) => {
      e && (St(this, wt, e), this.observe(e.isAuthorized, (t) => {
        if (!t) {
          A(this, T, _i).call(this);
          return;
        }
        A(this, T, cs).call(this);
      }));
    }), this.consumeContext(Ds, (e) => {
      e && (St(this, Et, e), this.observe(e.appCulture, (t) => {
        b(this, C)?.setCurrentBackofficeCulture(t);
      }));
    });
  }
  disconnectedCallback() {
    A(this, T, _i).call(this), super.disconnectedCallback();
  }
  render() {
    return s`
      <umb-body-layout main-no-padding>
        <div class="workspace-view">
          ${this._errorMessage ? A(this, T, ls).call(this) : d}

          <uui-box class="workspace-view__card">
            <filter-nodes-saved-filters
              .savedFilters=${this._savedFilters}
              .selectedSavedFilterId=${this._selectedSavedFilterId}
              .loading=${this._loadingSavedFilters}
              .saving=${this._savingSavedFilter}
              .disabled=${this._loading}
              .saveDisabled=${this._searchScope === "EntireSite"}
              @filter-nodes-saved-filter-load=${A(this, T, $s)}
              @filter-nodes-saved-filter-save=${A(this, T, Ts)}
              @filter-nodes-saved-filter-delete=${A(this, T, xs)}
            ></filter-nodes-saved-filters>
          </uui-box>

          <uui-box class="workspace-view__card">
            <filter-nodes-filter-builder
              .filterType=${this._filterType}
              .searchScope=${this._searchScope}
              .searchCultureMode=${this._searchCultureMode}
              .culture=${this._culture}
              .languages=${this._languages}
              .loadingLanguages=${this._loadingLanguages}
              .conditions=${this._conditions}
              .hasSearched=${this._hasSearched}
              .hasDraftChanges=${A(this, T, us).call(this)}
              .contentTypes=${this._contentTypes}
              .propertyMetadataByContentType=${this._propertyMetadataByContentType}
              .loading=${this._loading}
              .loadingMetadata=${this._loadingMetadata}
              .loadingPropertyContentTypeAliases=${this._loadingPropertyContentTypeAliases}
              .showSearchablePropertiesOnly=${this._showSearchablePropertiesOnly}
              @filter-nodes-filter-type-change=${A(this, T, ps)}
              @filter-nodes-search-scope-change=${A(this, T, ds)}
              @filter-nodes-search-culture-mode-change=${A(this, T, hs)}
              @filter-nodes-culture-change=${A(this, T, fs)}
              @filter-nodes-show-searchable-properties-only-change=${A(this, T, _s)}
              @filter-nodes-condition-change=${A(this, T, ms)}
              @filter-nodes-condition-remove=${A(this, T, ys)}
              @filter-nodes-condition-add=${A(this, T, vs)}
              @filter-nodes-search=${A(this, T, gs)}
              @filter-nodes-clear-all=${A(this, T, Cs)}
            ></filter-nodes-filter-builder>
          </uui-box>

          <uui-box class="workspace-view__card workspace-view__card--results">
            ${this._hasSearched ? s`
                  <filter-active-filters
                    .badges=${od(this._appliedConditions, {
      propertyMetadataByContentType: this._propertyMetadataByContentType,
      searchScope: this._searchScope,
      contentTypes: this._contentTypes
    })}
                    .loading=${this._loading}
                    @filter-active-filters-remove=${A(this, T, bs)}
                  ></filter-active-filters>
                ` : d}
            <filter-results-grid
              .results=${this._results}
              .searchCultureMode=${this._searchCultureMode}
              .conditions=${this._appliedConditions}
              .propertyMetadataByContentType=${this._propertyMetadataByContentType}
              .loading=${this._loading}
              .hasSearched=${this._hasSearched}
              .currentPage=${this._page}
              .totalPages=${this._totalPages}
              .totalCount=${this._totalCount}
              .pageSize=${this._pageSize}
              .sortColumn=${this._sortColumn}
              .sortDescending=${this._sortDescending}
              @filter-results-page-change=${A(this, T, Ss)}
              @filter-results-page-size-change=${A(this, T, ws)}
              @filter-results-sort-change=${A(this, T, Es)}
            ></filter-results-grid>
          </uui-box>
        </div>
      </umb-body-layout>
    `;
  }
};
wt = /* @__PURE__ */ new WeakMap();
Et = /* @__PURE__ */ new WeakMap();
C = /* @__PURE__ */ new WeakMap();
Gt = /* @__PURE__ */ new WeakMap();
T = /* @__PURE__ */ new WeakSet();
ls = function() {
  return s`
      <uui-alert
        class="workspace-view__error"
        headline="Something went wrong"
        .detail=${this._errorMessage}
        color="danger"
      ></uui-alert>
    `;
};
cs = function() {
  if (!b(this, wt) || b(this, C))
    return;
  const e = Td();
  St(this, C, new gd(e)), b(this, C).addEventListener(
    Wi,
    b(this, Gt)
  ), A(this, T, Xi).call(this, b(this, C).getState()), b(this, C).initialize();
};
_i = function() {
  b(this, C)?.removeEventListener(
    Wi,
    b(this, Gt)
  ), b(this, C)?.destroy(), St(this, C, void 0);
};
Xi = function(e) {
  this._loading = e.loading, this._loadingMetadata = e.loadingMetadata, this._loadingPropertyContentTypeAliases = e.loadingPropertyContentTypeAliases, this._filterType = e.filterType, this._searchScope = e.searchScope, this._searchCultureMode = e.searchCultureMode, this._culture = e.culture, this._languages = e.languages, this._loadingLanguages = e.loadingLanguages, this._showSearchablePropertiesOnly = e.showSearchablePropertiesOnly, this._conditions = e.conditions, this._appliedConditions = e.appliedConditions, this._appliedFilterType = e.appliedFilterType, this._contentTypes = e.contentTypes, this._propertyMetadataByContentType = e.propertyMetadataByContentType, this._results = e.results, this._page = e.page, this._pageSize = e.pageSize, this._totalCount = e.totalCount, this._totalPages = e.totalPages, this._hasSearched = e.hasSearched, this._errorMessage = e.errorMessage, this._savedFilters = e.savedFilters, this._loadingSavedFilters = e.loadingSavedFilters, this._savingSavedFilter = e.savingSavedFilter, this._selectedSavedFilterId = e.selectedSavedFilterId, this._sortColumn = e.sortColumn, this._sortDescending = e.sortDescending;
};
us = function() {
  return this._hasSearched ? this._filterType !== this._appliedFilterType || !Rc(this._conditions, this._appliedConditions) : !1;
};
ps = function(e) {
  b(this, C)?.setFilterType(e.detail.filterType);
};
ds = function(e) {
  b(this, C)?.setSearchScope(e.detail.searchScope);
};
hs = function(e) {
  b(this, C)?.setSearchCultureMode(e.detail.searchCultureMode), e.detail.searchCultureMode === "CurrentCulture" && b(this, Et)?.getAppCulture().then((t) => {
    b(this, C)?.setCurrentBackofficeCulture(t);
  });
};
fs = function(e) {
  b(this, C)?.setCulture(e.detail.culture);
};
_s = function(e) {
  b(this, C)?.setShowSearchablePropertiesOnly(
    e.detail.showSearchablePropertiesOnly
  );
};
ms = function(e) {
  b(this, C)?.updateCondition(
    e.detail.conditionId,
    e.detail.patch
  );
};
ys = function(e) {
  b(this, C)?.removeCondition(e.detail.conditionId);
};
vs = function() {
  b(this, C)?.addCondition();
};
gs = function() {
  b(this, C)?.search();
};
bs = function(e) {
  b(this, C)?.removeActiveFilterBadgeAndSearch(
    e.detail.conditionId,
    e.detail.kind
  );
};
Cs = async function() {
  if (!b(this, C))
    return;
  const e = b(this, C).getState();
  cc(
    e.conditions,
    e.filterType
  ) && await Tr(this, {
    headline: "Clear search",
    content: "This will remove all conditions and clear your results. Are you sure?",
    color: "warning",
    confirmLabel: "Clear"
  }).catch(() => !1) === !1 || b(this, C).clearAll();
};
Ss = function(e) {
  b(this, C)?.goToPage(e.detail.page);
};
ws = function(e) {
  b(this, C)?.setPageSize(e.detail.pageSize);
};
Es = function(e) {
  b(this, C)?.setSort(e.detail.column, e.detail.descending);
};
$s = function(e) {
  b(this, C)?.loadSavedFilter(e.detail.savedFilterId);
};
Ts = async function(e) {
  b(this, C) && (await b(this, C).saveCurrentFilter(e.detail.name), b(this, C).getState().errorMessage || this._savedFiltersElement?.resetSaveForm());
};
xs = function(e) {
  b(this, C)?.deleteSavedFilter(e.detail.savedFilterId);
};
S.styles = [
  Tt,
  ...xd
];
E([
  _()
], S.prototype, "_loading", 2);
E([
  _()
], S.prototype, "_loadingMetadata", 2);
E([
  _()
], S.prototype, "_loadingPropertyContentTypeAliases", 2);
E([
  _()
], S.prototype, "_filterType", 2);
E([
  _()
], S.prototype, "_searchScope", 2);
E([
  _()
], S.prototype, "_searchCultureMode", 2);
E([
  _()
], S.prototype, "_culture", 2);
E([
  _()
], S.prototype, "_languages", 2);
E([
  _()
], S.prototype, "_loadingLanguages", 2);
E([
  _()
], S.prototype, "_showSearchablePropertiesOnly", 2);
E([
  _()
], S.prototype, "_conditions", 2);
E([
  _()
], S.prototype, "_appliedConditions", 2);
E([
  _()
], S.prototype, "_appliedFilterType", 2);
E([
  _()
], S.prototype, "_contentTypes", 2);
E([
  _()
], S.prototype, "_propertyMetadataByContentType", 2);
E([
  _()
], S.prototype, "_results", 2);
E([
  _()
], S.prototype, "_page", 2);
E([
  _()
], S.prototype, "_pageSize", 2);
E([
  _()
], S.prototype, "_totalCount", 2);
E([
  _()
], S.prototype, "_totalPages", 2);
E([
  _()
], S.prototype, "_hasSearched", 2);
E([
  _()
], S.prototype, "_errorMessage", 2);
E([
  _()
], S.prototype, "_sortColumn", 2);
E([
  _()
], S.prototype, "_sortDescending", 2);
E([
  _()
], S.prototype, "_savedFilters", 2);
E([
  _()
], S.prototype, "_loadingSavedFilters", 2);
E([
  _()
], S.prototype, "_savingSavedFilter", 2);
E([
  _()
], S.prototype, "_selectedSavedFilterId", 2);
E([
  $t("filter-nodes-saved-filters")
], S.prototype, "_savedFiltersElement", 2);
S = E([
  Q("filter-nodes-workspace-view")
], S);
export {
  S as element
};
//# sourceMappingURL=index-BonkGSFG.js.map
