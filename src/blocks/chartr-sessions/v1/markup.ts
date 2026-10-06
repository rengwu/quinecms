export const template =
  '<section class="layout-row" id="{{anchor}}" aria-labelledby="{{instance}}-sessions-title">\n        <div class="section-rail" aria-hidden="true">{{label}}</div>\n        <div class="section-body">\n          <div class="continuity">\n            <div class="continuity-intro">\n              <h2 id="{{instance}}-sessions-title">{{heading}}</h2>\n            </div>\n            <div class="continuity-details">{{items}}</div>\n          </div>\n        </div>\n      </section>';
export const rows = {
  items:
    '<article><h3>{{title}}</h3><div class="chartr-rich">{{body}}</div></article>',
};
