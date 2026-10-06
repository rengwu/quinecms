export const template =
  '<section class="layout-row" id="{{anchor}}" aria-labelledby="{{instance}}-agents-title">\n        <div class="section-rail" aria-hidden="true">{{label}}</div>\n        <div class="section-body">\n          <div class="agent-heading">\n            <h2 id="{{instance}}-agents-title">{{heading}}</h2>\n          </div>\n          <ul class="agent-grid" aria-label="Terminal agents">{{agents}}</ul>\n        </div>\n      </section>';
export const rows = {
  agents:
    '<li><span class="agent-mark agent-mark--{{mark}}" aria-hidden="true"></span>{{name}}</li>',
};
