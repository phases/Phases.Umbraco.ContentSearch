import { css as m, html as n, customElement as p } from "@umbraco-cms/backoffice/external/lit";
import { UmbTextStyles as a } from "@umbraco-cms/backoffice/style";
import { UmbLitElement as d } from "@umbraco-cms/backoffice/lit-element";
const h = m`
  :host {
    display: block;
    width: 100%;
    height: 100%;
  }
`;
var f = Object.getOwnPropertyDescriptor, b = (o, s, c, l) => {
  for (var e = l > 1 ? void 0 : l ? f(s, c) : s, t = o.length - 1, i; t >= 0; t--)
    (i = o[t]) && (e = i(e) || e);
  return e;
};
let r = class extends d {
  render() {
    return n`
      <umb-workspace-editor
        headline="Filter Nodes"
        .enforceNoFooter=${!0}
      ></umb-workspace-editor>
    `;
  }
};
r.styles = [
  a,
  h,
  m`
      :host {
        display: block;
        width: 100%;
        height: 100%;
      }
    `
];
r = b([
  p("filter-nodes-workspace")
], r);
export {
  r as FilterNodesWorkspaceElement,
  r as element
};
//# sourceMappingURL=filter-nodes-workspace.element-B5-dny4o.js.map
