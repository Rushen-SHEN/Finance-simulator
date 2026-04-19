// replace-s17.mjs — Rewrite s17 slide with 4 chart panels
import { readFileSync, writeFileSync } from 'fs';

const htmlPath = 'public/roadshow-slides.html';
let raw = readFileSync(htmlPath, 'utf8');
console.log('Original length:', raw.length);

// Find s17 section boundaries
const s17Start = raw.indexOf('<section class="slide" id="s17"');
const s18Start = raw.indexOf('<section class="slide" id="s18"');

if (s17Start < 0 || s18Start < 0) {
  console.error('Could not find s17 or s18 boundaries!');
  process.exit(1);
}

// Find </section> before s18
const s17End = raw.lastIndexOf('</section>', s18Start);
console.log(`s17: ${s17Start} to ${s17End + '</section>'.length}`);

const newS17 = `<section class="slide" id="s17" data-title="\u6536\u5165\u7ED3\u6784\u4E0E\u76C8\u5229\u8DEF\u5F84">
    <div class="frame">
      <div class="inner">
        <div class="slide-header fade-up">
          <div>
            <div class="eyebrow">Financial Appendix II</div>
            <h1 class="title">\u6536\u5165\u7ED3\u6784\u4E0E\u76C8\u5229\u8DEF\u5F84</h1>
            <p class="subtitle">\u786C\u4EF6\u3001SaaS\u3001\u5347\u7EA7\u670D\u52A1\u548C\u6388\u6743/\u91CC\u7A0B\u7891\u6536\u5165\u5171\u540C\u6784\u6210\u5341\u5E74\u671F\u6536\u5165\u66F2\u7EBF\uFF0C\u5176\u4E2D\u88C5\u673A\u901F\u5EA6\u4E0E\u7EED\u7EA6\u7387\u662F\u6700\u5173\u952E\u7684\u653E\u5927\u53D8\u91CF\u3002</p>
          </div>
          <div class="slide-note">
            <span class="chip projected">\u6536\u5165\u5206\u89E3</span>
            <span class="chip projected">\u76C8\u5229\u8DEF\u5F84</span>
          </div>
        </div>

        <div class="s17-grid">
          <!-- ===== TOP ROW ===== -->
          <div class="s17-card fade-up">
            <div class="s17-card-title">\u6536\u5165\u6784\u6210 6\u6761\u7EBF\uFF08\u4E07\u5143\uFF09</div>
            <div class="s17-chart s17-chart-rev-stack">
              <svg viewBox="0 0 520 280" preserveAspectRatio="xMidYMid meet"></svg>
            </div>
            <div class="s17-legend">
              <span class="s17-leg" style="--lc:#5B8DEF;">\u25A0 \u786C\u4EF6\u76F4\u9500</span>
              <span class="s17-leg" style="--lc:#8BB4F0;">\u25A0 \u786C\u4EF6\u7ECF\u9500\u5546</span>
              <span class="s17-leg" style="--lc:#F0A050;">\u25A0 \u5347\u7EA7</span>
              <span class="s17-leg" style="--lc:#6BC5A0;">\u25A0 SaaS\u76F4\u9500</span>
              <span class="s17-leg" style="--lc:#9B7FD4;">\u25A0 SaaS\u7ECF\u9500\u5546</span>
              <span class="s17-leg" style="--lc:#4AC0B0;">\u25A0 \u6388\u6743\u91D1</span>
              <span class="s17-leg" style="--lc:var(--muted);">\u2501 \u603B\u6536\u5165</span>
            </div>
          </div>
          <div class="s17-card fade-up">
            <div class="s17-card-title">\u6E20\u9053\u7ED3\u6784\u5360\u6BD4\uFF08\u76F4\u9500 vs \u7ECF\u9500\u5546 vs \u6388\u6743\u91D1\uFF09</div>
            <div class="s17-chart s17-chart-channel">
              <svg viewBox="0 0 520 280" preserveAspectRatio="xMidYMid meet"></svg>
            </div>
            <div class="s17-legend">
              <span class="s17-leg" style="--lc:#7EB6F0;">\u25A0 \u76F4\u9500%</span>
              <span class="s17-leg" style="--lc:#9B7FD4;">\u25A0 \u7ECF\u9500\u5546\u6E20\u9053%</span>
              <span class="s17-leg" style="--lc:#4AC0B0;">\u25A0 \u6388\u6743\u91D1%</span>
            </div>
          </div>

          <!-- ===== BOTTOM ROW ===== -->
          <div class="s17-card fade-up">
            <div class="s17-card-title">\u76C8\u5229\u8DEF\u5F84 \u2014 <span data-field="s17-ebitda-year">EBITDA Year 2\u8F6C\u6B63</span></div>
            <div class="s17-subtitle">EBITDA\u4E0E\u51C0\u5229\u6DA6\uFF08\u4E07\u5143\uFF09</div>
            <div class="s17-chart s17-chart-profit">
              <svg viewBox="0 0 520 280" preserveAspectRatio="xMidYMid meet"></svg>
            </div>
            <div class="s17-legend">
              <span class="s17-leg" style="--lc:#F06060;">\u25A0 EBITDA</span>
              <span class="s17-leg" style="--lc:#4AC0B0;">\u25A0 \u51C0\u5229\u6DA6</span>
            </div>
          </div>
          <div class="s17-card fade-up">
            <div class="s17-card-title">\u7D2F\u8BA1\u90E8\u7F72 vs \u6D3B\u8DC3\u4ED8\u8D39\u5E8A\u4F4D</div>
            <div class="s17-chart s17-chart-beds">
              <svg viewBox="0 0 520 280" preserveAspectRatio="xMidYMid meet"></svg>
            </div>
            <div class="s17-legend">
              <span class="s17-leg" style="--lc:#7EB6F0;">\u25A0 \u7D2F\u8BA1\u90E8\u7F72</span>
              <span class="s17-leg" style="--lc:#4AC0B0;">\u25A0 \u6D3B\u8DC3\u4ED8\u8D39</span>
            </div>
          </div>
        </div>

        <div class="source-box"><strong>\u8BF4\u660E\uFF1A</strong>\u672C\u9875\u56FE\u8868\u7531Finance Simulator\u53C2\u6570\u9762\u677F\u5B9E\u65F6\u9A71\u52A8\uFF0C\u6570\u636E\u81EA\u52A8\u66F4\u65B0\u3002</div>
      </div>
    </div>
  </section>`;

const before = raw.substring(0, s17Start);
const after = raw.substring(s17End + '</section>'.length);
raw = before + newS17 + after;
console.log('New length:', raw.length);

writeFileSync(htmlPath, raw, 'utf8');

// Verify
const verify = readFileSync(htmlPath, 'utf8');
console.log('Verify s17-grid:', verify.indexOf('s17-grid'));
console.log('Verify s17-chart-rev-stack:', verify.indexOf('s17-chart-rev-stack'));
console.log('Verify s18 still exists:', verify.indexOf('id="s18"'));
console.log('Done!');
