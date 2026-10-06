export const template =
  '<section class="layout-row" aria-labelledby="{{instance}}-foundation-title">\n        <h2 class="section-rail" id="{{instance}}-foundation-title">{{heading}}</h2>\n        <div class="section-body">\n          <dl class="foundation-grid">{{items}}</dl>\n        </div>\n      </section>';
export const rows = {
  items:
    '<div><dt><a class="text-link" href="{{url}}">{{title}}</a>{{secondary}}</dt><dd>{{description}}</dd></div>',
};
