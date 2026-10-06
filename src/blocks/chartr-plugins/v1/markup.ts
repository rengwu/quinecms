export const template =
  '<section class="layout-row" id="{{anchor}}" aria-labelledby="{{instance}}-plugins-title">\n        <div class="section-rail" aria-hidden="true">{{label}}</div>\n        <div class="section-body">\n          <div class="plugin-intro">\n            <h2 id="{{instance}}-plugins-title">{{heading}}</h2>\n            <p>{{description}}</p>\n            <p>{{detail}}</p>\n            <a class="button button-secondary" href="{{actionURL}}">{{actionLabel}}</a>\n          </div>\n          <div class="plugin-bundled">\n            <h3>{{examplesTitle}}</h3>\n            <div class="plugin-examples">{{cards}}</div>\n          </div>\n        </div>\n      </section>';
export const rows = {
  cards:
    '<article><h4><a class="text-link" href="{{url}}">{{title}}</a></h4><p>{{body}}</p></article>',
};
