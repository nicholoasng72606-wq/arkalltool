(function(){
    "use strict";

    // ==================== i18n 引擎 ====================
    const langConfig = {
        'zh-HK': { file: 'lang/zh-HK.json', name: '廣東話口語' },
        'en':    { file: 'lang/en.json', name: 'English' },
        'zh-TW':    { file: 'lang/zh-TW.json', name: '繁體中文' }
        // 日後加語言只需加一行
    };
    const DEFAULT_LANG = 'zh-HK';
    let currentLang = DEFAULT_LANG;
    let translations = {};  // 當前語言字典
    let langCache = {};     // 已載入嘅語言 cache

    // 偵測瀏覽器語言
    function detectLanguage() {
        const browser = navigator.language || '';
        if (langConfig[browser]) return browser;
        const base = browser.split('-')[0];
        if (langConfig[base]) return base;
        return DEFAULT_LANG;
    }

    // 載入語言檔
    async function loadLanguage(lang) {
        if (langCache[lang]) {
            translations = langCache[lang];
        } else {
            try {
                const resp = await fetch(langConfig[lang].file);
                if (!resp.ok) throw new Error('Fetch failed');
                const data = await resp.json();
                langCache[lang] = data;
                translations = data;
            } catch (e) {
                console.warn(`Failed to load ${lang}, fallback to ${DEFAULT_LANG}`);
                if (lang !== DEFAULT_LANG) {
                    return loadLanguage(DEFAULT_LANG);
                } else {
                    translations = {};
                }
            }
        }
        currentLang = lang;
        applyLanguage();
    }

    // 將翻譯套用到頁面
    function applyLanguage() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const text = t(key);
            if (text !== key) el.textContent = text;
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            el.placeholder = t(key);
        });
        const langNameKey = 'lang_name';
        const btnText = t(langNameKey) || langConfig[currentLang]?.name || currentLang;
        document.querySelector('#langBtn span').textContent = btnText;
        document.dispatchEvent(new CustomEvent('languageChanged'));
    }

    function t(key, placeholders = {}) {
        const keys = key.split('.');
        let val = translations;
        for (const k of keys) {
            if (val && typeof val === 'object' && k in val) {
                val = val[k];
            } else {
                return key;
            }
        }
        if (typeof val !== 'string') return key;
        return val.replace(/\{\{(\w+)\}\}/g, (_, name) => {
            return placeholders.hasOwnProperty(name) ? placeholders[name] : `{{${name}}}`;
        });
    }

    function buildLangSwitcher() {
        const dropdown = document.getElementById('langDropdown');
        dropdown.innerHTML = '';
        for (const [code, cfg] of Object.entries(langConfig)) {
            const opt = document.createElement('div');
            opt.className = 'lang-option';
            opt.textContent = cfg.name;
            opt.addEventListener('click', () => {
                loadLanguage(code);
                dropdown.classList.remove('show');
            });
            dropdown.appendChild(opt);
        }
        document.getElementById('langBtn').addEventListener('click', (e) => {
            e.stopPropagation();
            document.getElementById('langDropdown').classList.toggle('show');
        });
        document.addEventListener('click', () => {
            document.getElementById('langDropdown').classList.remove('show');
        });
    }

    // ==================== 原有遊戲邏輯 ====================
    function six(sixProbi) {
        return Math.floor(Math.random() * 1000) + 1 <= sixProbi * 1000;
    }
    function gacha() {
        let sixed = false;
        let sixProbi = 0.02;
        let gachaNumber = 0;
        for (let i = 1; i <= 50; i++) {
            gachaNumber++;
            if (six(sixProbi)) { sixed = true; break; }
        }
        if (!sixed) {
            for (let j = 51; j < 100; j++) {
                sixProbi = 0.02 + 0.02 * (j - 50);
                gachaNumber++;
                if (six(sixProbi)) break;
            }
        }
        return gachaNumber;
    }
    function r_gacha() {
        let gachaNumber = 0;
        while (true) {
            gachaNumber += gacha();
            if (gachaNumber >= 150) return gachaNumber;
            if (Math.random() < 0.5) return gachaNumber;
        }
    }
    function ol_gacha() {
        let gachaNumber = 0;
        while (true) {
            gachaNumber += gacha();
            if (gachaNumber >= 300) return 300;
            if (Math.floor(Math.random() * 100) + 1 <= 35) return gachaNumber;
        }
    }
    function tl_gacha() {
        let gachaNumber = 0, get = 0;
        while (get < 2) {
            gachaNumber += gacha();
            if (gachaNumber >= 300) return 300;
            if (get === 0 && Math.floor(Math.random()*100)+1 <= 70) get++;
            else if (get === 1 && Math.floor(Math.random()*100)+1 <= 35) return gachaNumber;
        }
    }
    function coop_gacha() {
        let gachaNumber = 0;
        while (true) {
            gachaNumber += gacha();
            if (gachaNumber >= 120) return 120;
            if (Math.random() < 0.5) return gachaNumber;
        }
    }
    function total_gacha(reg, ol, tl, coop) {
        let total = 0;
        for (let i=0; i<reg; i++) total += r_gacha();
        for (let i=0; i<ol; i++) total += ol_gacha();
        for (let i=0; i<tl; i++) total += tl_gacha();
        for (let i=0; i<coop; i++) total += coop_gacha();
        return total;
    }

    function endfield_gacha() {
        let sixed = false;
        let six_probi = 0.008;
        let count = 0;
        for (let i = 1; i <= 65; i++) {
            count++;
            if (Math.random() <= six_probi) { sixed = true; break; }
        }
        if (!sixed) {
            for (let j = 66; j <= 80; j++) {
                six_probi = 0.008 + 0.05 * (j - 65);
                count++;
                if (Math.random() <= six_probi) break;
            }
        }
        return count;
    }
    function endfield_full_gacha() {
        let totalPulls = 0;
        let pity = 0;
        let freePullsUsed = false;
        function normalSinglePull() {
            let isSixStar = false;
            if (pity <= 65) {
                isSixStar = Math.random() < 0.008;
            } else if (pity < 80) {
                let prob = 0.008 + 0.05 * (pity - 65);
                isSixStar = Math.random() < prob;
            } else {
                isSixStar = true;
            }
            return isSixStar;
        }
        while (totalPulls < 120) {
            totalPulls++;
            pity++;
            let gotSixStar = normalSinglePull();
            if (gotSixStar) {
                if (Math.random() < 0.5) return totalPulls;
                else pity = 0;
            }
            if (totalPulls === 30 && !freePullsUsed) {
                freePullsUsed = true;
                for (let k = 0; k < 10; k++) {
                    if (Math.random() < 0.008) {
                        if (Math.random() < 0.5) return 30;
                    }
                }
            }
        }
        return 120;
    }
    function endfield_total_gacha(targetCount) {
        let total = 0;
        for (let i = 0; i < targetCount; i++) total += endfield_full_gacha();
        return total;
    }

   function generateMatlabCode(sortedList, title) {
    const dataStr = sortedList.join(' ');
    return `% ${title} - ${t('matlab.auto_generated')}
% ${t('matlab.instruction')}
data = [${dataStr}];

% ${t('matlab.plot_pdf')}
figure('Name','${title} PMF');
edges = min(data):1:max(data);
histogram(data, edges, 'Normalization', 'pdf');
title('${title} - ${t('matlab.pmf_title')}');
xlabel('${t('matlab.pulls')}');
ylabel('${t('matlab.density')}');
grid on;

% ${t('matlab.plot_cdf')}
figure('Name','${title} CDF with multiple CIs');

n = length(data);
sortedData = sort(data);
p = (1:n)' / n;

x_cdf = zeros(2*n, 1);
y_cdf = zeros(2*n, 1);
for i = 1:n
    x_cdf(2*i-1) = sortedData(i);
    x_cdf(2*i)   = sortedData(i);
    if i == 1
        y_cdf(1) = 0;
        y_cdf(2) = p(1);
    else
        y_cdf(2*i-1) = y_cdf(2*i-2);
        y_cdf(2*i)   = p(i);
    end
end
plot(x_cdf, y_cdf, 'b-', 'LineWidth', 2);
hold on;

z90 = 1.645;
z99 = 2.576;
z9999 = 3.891;
se = sqrt(p .* (1-p) / n);
ci90_lo = max(0, p - z90 * se);
ci90_hi = min(1, p + z90 * se);
ci99_lo = max(0, p - z99 * se);
ci99_hi = min(1, p + z99 * se);
ci9999_lo = max(0, p - z9999 * se);
ci9999_hi = min(1, p + z9999 * se);

x_ci = x_cdf;
y_ci90_lo = zeros(2*n, 1); y_ci90_hi = zeros(2*n, 1);
y_ci99_lo = zeros(2*n, 1); y_ci99_hi = zeros(2*n, 1);
y_ci9999_lo = zeros(2*n, 1); y_ci9999_hi = zeros(2*n, 1);
for i = 1:n
    if i == 1
        y_ci90_lo(1)=0;   y_ci90_lo(2)=ci90_lo(1);
        y_ci90_hi(1)=0;   y_ci90_hi(2)=ci90_hi(1);
        y_ci99_lo(1)=0;   y_ci99_lo(2)=ci99_lo(1);
        y_ci99_hi(1)=0;   y_ci99_hi(2)=ci99_hi(1);
        y_ci9999_lo(1)=0; y_ci9999_lo(2)=ci9999_lo(1);
        y_ci9999_hi(1)=0; y_ci9999_hi(2)=ci9999_hi(1);
    else
        y_ci90_lo(2*i-1)=y_ci90_lo(2*i-2); y_ci90_lo(2*i)=ci90_lo(i);
        y_ci90_hi(2*i-1)=y_ci90_hi(2*i-2); y_ci90_hi(2*i)=ci90_hi(i);
        y_ci99_lo(2*i-1)=y_ci99_lo(2*i-2); y_ci99_lo(2*i)=ci99_lo(i);
        y_ci99_hi(2*i-1)=y_ci99_hi(2*i-2); y_ci99_hi(2*i)=ci99_hi(i);
        y_ci9999_lo(2*i-1)=y_ci9999_lo(2*i-2); y_ci9999_lo(2*i)=ci9999_lo(i);
        y_ci9999_hi(2*i-1)=y_ci9999_hi(2*i-2); y_ci9999_hi(2*i)=ci9999_hi(i);
    end
end

plot(x_ci, y_ci90_lo, 'r--');
plot(x_ci, y_ci90_hi, 'r--');
plot(x_ci, y_ci99_lo, 'g--');
plot(x_ci, y_ci99_hi, 'g--');
plot(x_ci, y_ci9999_lo, 'm--');
plot(x_ci, y_ci9999_hi, 'm--');

title('${title} - ${t('matlab.cdf_title')}');
xlabel('${t('matlab.pulls')}');
ylabel('${t('matlab.cumulative_prob')}');
legend('CDF', ...
       '${t('matlab.ci90_lower')}', '${t('matlab.ci90_upper')}', ...
       '${t('matlab.ci99_lower')}', '${t('matlab.ci99_upper')}', ...
       '${t('matlab.ci9999_lower')}', '${t('matlab.ci9999_upper')}', ...
       'Location', 'best');
grid on;
hold off;
`;
}

    function copyToClipboard(text, successMsg) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                alert(successMsg);
            }).catch(() => {
                fallbackCopy(text, successMsg);
            });
        } else {
            fallbackCopy(text, successMsg);
        }
    }
    function fallbackCopy(text, successMsg) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = 0;
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            alert(successMsg);
        } catch (err) {
            alert(t('copy_fail'));
        }
        document.body.removeChild(textarea);
    }

    const module4 = [20000,20000,30000], module5 = [40000,50000,60000], module6 = [80000,100000,120000];
    const uxp = [41715,58025,76125,106914,161200,255000];
    const uc = [29389,46048,67255,104194,171616,297577];
    const exp = [201211,290411,412411];
    const ec = [235117,400823,618717];

    function parseUpgradeLines(text) {
        const lines = text.trim().split('\n');
        const result = [];
        for (let line of lines) {
            const parts = line.trim().split(/\s+/);
            if (parts.length === 4) {
                const star = parseInt(parts[0]), beg = parseInt(parts[1]), end = parseInt(parts[2]), count = parseInt(parts[3]);
                if (!isNaN(star) && !isNaN(beg) && !isNaN(end) && !isNaN(count))
                    result.push([star, beg, end, count]);
            }
        }
        return result;
    }
    function calcModuleCost(m4, m5, m6) {
        let m4cost = 0, m5cost = 0, m6cost = 0;
        if (m4[0]!==0) m4cost = m4[1]*module4[0] + m4[2]*module4[1] + m4[3]*module4[2];
        if (m5[0]!==0) m5cost = m5[1]*module5[0] + m5[2]*module5[1] + m5[3]*module5[2];
        if (m6[0]!==0) m6cost = m6[1]*module6[0] + m6[2]*module6[1] + m6[3]*module6[2];
        return m4cost + m5cost + m6cost;
    }
    function calcTotalRequirements(upgradeLines, m4, m5, m6) {
        let ecount = [0,0,0];
        let count = [0,0,0,0,0,0];
        for (let line of upgradeLines) {
            const star = line[0], beg = line[1], end = line[2], n = line[3];
            let b = beg;
            if (b === 1) { ecount[star-4] += n; b = 230; }
            const long = (end - b) / 10;
            const short = (b - 230) / 10;
            for (let i=0; i<long; i++) count[i] += n;
            for (let i=0; i<short; i++) count[i] -= n;
        }
        let expNeeded = ecount.reduce((s,v,i)=> s + v*exp[i], 0);
        let cashNeededEC = ecount.reduce((s,v,i)=> s + v*ec[i], 0);
        expNeeded += count.reduce((s,v,i)=> s + v*uxp[i], 0);
        let cashNeededUC = count.reduce((s,v,i)=> s + v*uc[i], 0);
        const moduleCash = calcModuleCost(m4, m5, m6);
        return { exp: expNeeded, cash: cashNeededEC + cashNeededUC + moduleCash };
    }

    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(p=>p.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(btn.dataset.tab).classList.add('active');
            document.dispatchEvent(new CustomEvent('languageChanged'));
        });
    });

    // Gacha UI
    const startBtn = document.getElementById('startSimBtn');
    const queryBtn = document.getElementById('queryBtn');
    const copyMatlabBtn = document.getElementById('copyMatlabBtn');
    const progress = document.getElementById('simProgress');
    const resultDiv = document.getElementById('gachaResult');
    let sortedList = [], oList = [];

    function resetGacha() {
        document.getElementById('regNeed').value = 0;
        document.getElementById('olNeed').value = 0;
        document.getElementById('tlNeed').value = 0;
        document.getElementById('coopNeed').value = 0;
        document.getElementById('simTimes').value = 10000;
        resultDiv.textContent = t('gacha.result_initial');
        progress.value = 0;
        sortedList = []; oList = [];
        queryBtn.disabled = true;
        copyMatlabBtn.disabled = true;
        document.getElementById('simTime').style.display = 'none';
    }
    document.getElementById('resetGachaBtn').addEventListener('click', resetGacha);

    startBtn.addEventListener('click', async () => {
        const startTime = performance.now();
        const reg = parseInt(document.getElementById('regNeed').value) || 0;
        const ol = parseInt(document.getElementById('olNeed').value) || 0;
        const tl = parseInt(document.getElementById('tlNeed').value) || 0;
        const coop = parseInt(document.getElementById('coopNeed').value) || 0;
        const times = parseInt(document.getElementById('simTimes').value) || 10000;
        if (times <= 0) { alert(t('gacha.alert_times')); return; }

        startBtn.disabled = true;
        queryBtn.disabled = true;
        copyMatlabBtn.disabled = true;
        resultDiv.textContent = t('gacha.calculating');
        progress.value = 0;
        sortedList = []; oList = [];

        const chunkSize = 500;
        let results = [];
        function runSimulationChunk(startIdx) {
            const end = Math.min(startIdx + chunkSize, times);
            for (let i=startIdx; i<end; i++) {
                results.push(total_gacha(reg, ol, tl, coop));
            }
            progress.value = (end / times) * 100;
            if (end < times) {
                setTimeout(() => runSimulationChunk(end), 10);
            } else {
                results.sort((a,b)=>a-b);
                sortedList = results;
                const n = sortedList.length;
                if (n===0) {
                    resultDiv.textContent = t('gacha.result_zero');
                    startBtn.disabled = false;
                    return;
                }
                const maxVal = sortedList[n-1];
                oList = new Array(maxVal).fill(0);
                sortedList.forEach(v => oList[v-1]++);
                
                const quantiles = [10,20,30,40,50,60,70,80,90,100];
                const quantVals = quantiles.map(q => sortedList[Math.floor(q/100 * n) - 1] || sortedList[0]);
                const mean = sortedList.reduce((a,b)=>a+b,0)/n;
                const variance = sortedList.reduce((s,x)=> s + (x-mean)**2, 0)/(n-1);
                const sd = Math.sqrt(variance);
                const cv = sd/mean;
                const ci99 = 2.58 * sd / Math.sqrt(n);
                const ci9999 = 3.72 * sd / Math.sqrt(n);
                
                let out = t('gacha.result_total_sims', {n}) + '\n';
                out += t('gacha.result_avg', {mean: mean.toFixed(2)}) + '\n';
                out += t('gacha.result_median', {median: quantVals[4].toFixed(2)}) + '\n';
                out += t('gacha.result_sd', {sd: sd.toFixed(2)}) + '\n';
                out += t('gacha.result_cv', {cv: cv.toFixed(2)}) + '\n';
                out += t('gacha.result_deciles', {deciles: quantVals.join(', ')}) + '\n';
                out += t('gacha.result_ci99', {mean: mean.toFixed(2), ci: ci99.toFixed(2)}) + '\n';
                out += t('gacha.result_ci9999', {mean: mean.toFixed(2), ci: ci9999.toFixed(2)}) + '\n';
                out += '==================================================';
                resultDiv.textContent = out;
                drawGachaChart(sortedList, oList);
                const endTime = performance.now();
                const elapsedSeconds = (endTime - startTime) / 1000;
                document.getElementById('timeDisplay').textContent = elapsedSeconds.toFixed(2);
                document.getElementById('simTime').style.display = 'block';
                startBtn.disabled = false;
                queryBtn.disabled = false;
                copyMatlabBtn.disabled = false;
            }
        }
        runSimulationChunk(0);
    });

    queryBtn.addEventListener('click', () => {
        if (!sortedList.length) { alert(t('gacha.alert_no_sim')); return; }
        const queryWin = document.createElement('div');
        Object.assign(queryWin.style, {
            position:'fixed', top:'30%', left:'35%', background:'#1e2533',
            padding:'24px', borderRadius:'20px', width:'400px', zIndex:'1000',
            boxShadow:'0 0 30px black'
        });
        queryWin.innerHTML = `
            <h3>🔎 ${t('gacha.query_title')}</h3>
            <div style="margin:15px 0;"><label>${t('gacha.query_pull_to_prob')}</label><br>
                <input id="qPull" type="number" placeholder="${t('gacha.query_placeholder_pull')}" style="width:100%">
                <button id="calcProbBtn">${t('gacha.calc')}</button> <span id="probResult"></span>
            </div>
            <div><label>${t('gacha.query_prob_to_pull')}</label><br>
                <input id="qProb" type="number" step="0.1" placeholder="${t('gacha.query_placeholder_prob')}" style="width:100%">
                <button id="calcPullBtn">${t('gacha.calc')}</button> <span id="pullResult"></span>
            </div>
            <button id="closeQuery" style="margin-top:20px;">${t('gacha.close')}</button>
        `;
        document.body.appendChild(queryWin);
        document.getElementById('calcProbBtn').addEventListener('click', ()=>{
            const q = parseInt(document.getElementById('qPull').value);
            if (isNaN(q) || q<=0 || q>oList.length) document.getElementById('probResult').textContent = t('gacha.query_out_of_range');
            else {
                const cum = oList.slice(0,q).reduce((a,b)=>a+b,0);
                const prob = cum / sortedList.length * 100;
                document.getElementById('probResult').textContent = t('gacha.query_prob_result', {prob: prob.toFixed(2)});
            }
        });
        document.getElementById('calcPullBtn').addEventListener('click', ()=>{
            const p = parseFloat(document.getElementById('qProb').value);
            if (isNaN(p) || p<=0 || p>100) document.getElementById('pullResult').textContent = t('gacha.query_prob_range');
            else {
                const idx = Math.floor(p/100 * sortedList.length) - 1;
                document.getElementById('pullResult').textContent = t('gacha.query_pull_result', {pulls: sortedList[Math.max(0,idx)]});
            }
        });
        document.getElementById('closeQuery').addEventListener('click', ()=> queryWin.remove());
    });

    copyMatlabBtn.addEventListener('click', () => {
        if (!sortedList.length) {
            alert(t('gacha.alert_no_sim'));
            return;
        }
        const code = generateMatlabCode(sortedList, t('matlab.arknights_title'));
        copyToClipboard(code, t('gacha.copy_success'));
    });

    // Resource calculator
    let reservedExp = 0, reservedCash = 0;
    const reserveDisplay = document.getElementById('reserveDisplay');
    const modal = document.getElementById('reserveModal');
    
    document.getElementById('setReserveBtn').addEventListener('click', ()=>{
        modal.style.display = 'flex';
        document.getElementById('modalUpgrade').value = document.getElementById('upgradeInput').value;
        ['m4','m5','m6'].forEach((s,idx)=>{
            const star = ['4','5','6'][idx];
            for(let lvl=1;lvl<=3;lvl++){
                document.getElementById(`mm${star}L${lvl}`).value = document.getElementById(`m${star}L${lvl}`).value;
            }
        });
        document.getElementById('modalReserveResult').textContent = '';
    });
    document.getElementById('closeModalBtn').addEventListener('click', ()=> modal.style.display='none');
    document.getElementById('computeReserveBtn').addEventListener('click', ()=>{
        const lines = parseUpgradeLines(document.getElementById('modalUpgrade').value);
        const m4 = [ (document.getElementById('mm4L1').value!='0'||document.getElementById('mm4L2').value!='0'||document.getElementById('mm4L3').value!='0')?1:0,
                     +document.getElementById('mm4L1').value, +document.getElementById('mm4L2').value, +document.getElementById('mm4L3').value ];
        const m5 = [ (document.getElementById('mm5L1').value!='0'||document.getElementById('mm5L2').value!='0'||document.getElementById('mm5L3').value!='0')?1:0,
                     +document.getElementById('mm5L1').value, +document.getElementById('mm5L2').value, +document.getElementById('mm5L3').value ];
        const m6 = [ (document.getElementById('mm6L1').value!='0'||document.getElementById('mm6L2').value!='0'||document.getElementById('mm6L3').value!='0')?1:0,
                     +document.getElementById('mm6L1').value, +document.getElementById('mm6L2').value, +document.getElementById('mm6L3').value ];
        const req = calcTotalRequirements(lines, m4, m5, m6);
        document.getElementById('modalReserveResult').textContent = 
            t('modal.reserve_result', {exp: req.exp.toLocaleString(), cash: req.cash.toLocaleString()});
        modal._tempReserve = req;
    });
    document.getElementById('applyReserveBtn').addEventListener('click', ()=>{
        if (modal._tempReserve) {
            reservedExp = modal._tempReserve.exp;
            reservedCash = modal._tempReserve.cash;
            reserveDisplay.textContent = t('resource.reserve_display_current', {exp: reservedExp.toLocaleString(), cash: reservedCash.toLocaleString()});
        }
        modal.style.display = 'none';
    });

    document.getElementById('calcResourceBtn').addEventListener('click', ()=>{
        const lines = parseUpgradeLines(document.getElementById('upgradeInput').value);
        const m4 = [ (document.getElementById('m4L1').value!='0'||document.getElementById('m4L2').value!='0'||document.getElementById('m4L3').value!='0')?1:0,
                     +document.getElementById('m4L1').value, +document.getElementById('m4L2').value, +document.getElementById('m4L3').value ];
        const m5 = [ (document.getElementById('m5L1').value!='0'||document.getElementById('m5L2').value!='0'||document.getElementById('m5L3').value!='0')?1:0,
                     +document.getElementById('m5L1').value, +document.getElementById('m5L2').value, +document.getElementById('m5L3').value ];
        const m6 = [ (document.getElementById('m6L1').value!='0'||document.getElementById('m6L2').value!='0'||document.getElementById('m6L3').value!='0')?1:0,
                     +document.getElementById('m6L1').value, +document.getElementById('m6L2').value, +document.getElementById('m6L3').value ];
        const {exp: totalExp, cash: totalCash} = calcTotalRequirements(lines, m4, m5, m6);
        
        const remXP = (+document.getElementById('remXP1').value*2000 + +document.getElementById('remXP2').value*1000 +
                       +document.getElementById('remXP3').value*400 + +document.getElementById('remXP4').value*200);
        const remCash = +document.getElementById('remCash').value;
        
        let warning = '';
        if (remXP < reservedExp) warning += t('resource.warning_exp', {diff: (reservedExp-remXP).toLocaleString()}) + '\n';
        if (remCash < reservedCash) warning += t('resource.warning_cash', {diff: (reservedCash-remCash).toLocaleString()}) + '\n';
        if (warning) {
            document.getElementById('resourceResult').textContent = warning + t('resource.warning_refill');
            return;
        }
        
        let needExp = totalExp - (remXP - reservedExp);
        let needCash = totalCash - (remCash - reservedCash);
        if (needExp < 0) needExp = 0;
        if (needCash < 0) needCash = 0;
        
        let dailyXP = +document.getElementById('dailyXP').value;
        let dailyCash = +document.getElementById('dailyCash').value;
        const energy = +document.getElementById('dailyEnergy').value;
        if (document.getElementById('includeMission').checked) {
            dailyXP += 9600 + 24400/7;
            dailyCash += 9500 + 23000/7;
        }
        const baseDays = Math.max( dailyXP>0 ? Math.ceil(needExp/dailyXP) : 0,
                                   dailyCash>0 ? Math.ceil(needCash/dailyCash) : 0 );
        const energyToRes = (energy/36)*10000;
        const mixDaysXP = (dailyXP+energyToRes)>0 ? Math.ceil(needExp/(dailyXP+energyToRes)) : 0;
        const mixDaysCash = (dailyCash+energyToRes)>0 ? Math.ceil(needCash/(dailyCash+energyToRes)) : 0;
        let mixDays = Math.max(mixDaysXP, mixDaysCash);
        if (baseDays < mixDays) mixDays = baseDays;
        const totalRes = needExp+needCash;
        const dailyTotal = dailyXP+dailyCash+energyToRes;
        if (dailyTotal>0) {
            const mixDaysTotal = Math.ceil(totalRes/dailyTotal);
            mixDays = Math.min(mixDays, mixDaysTotal);
        }
        
        let out = t('resource.result_need_exp', {exp: needExp.toLocaleString()}) + '\n';
        out += t('resource.result_need_cash', {cash: needCash.toLocaleString()}) + '\n';
        out += t('resource.result_days_base', {days: baseDays}) + '\n';
        out += t('resource.result_days_mix', {days: mixDays});
        if (reservedExp>0||reservedCash>0) {
            out += '\n\n' + t('resource.result_reserve_note', {exp: reservedExp.toLocaleString(), cash: reservedCash.toLocaleString()});
        }
        document.getElementById('resourceResult').textContent = out;
    });

    document.getElementById('resetResourceBtn').addEventListener('click', ()=>{
        document.getElementById('upgradeInput').value = '5 230 260 1\n6 1 290 1';
        ['m4','m5','m6'].forEach(s=>{ for(let i=1;i<=3;i++) document.getElementById(s+'L'+i).value=0; });
        document.getElementById('remXP1').value=0;document.getElementById('remXP2').value=0;
        document.getElementById('remXP3').value=0;document.getElementById('remXP4').value=0;
        document.getElementById('remCash').value=0;
        document.getElementById('dailyXP').value=0; document.getElementById('dailyCash').value=0;
        document.getElementById('dailyEnergy').value=240;
        document.getElementById('includeMission').checked = false;
        document.getElementById('resourceResult').textContent = '';
        reservedExp = reservedCash = 0;
        reserveDisplay.textContent = t('resource.reserve_display_default');
    });

    // Pulls calculator
    document.getElementById('calcPullsBtn').addEventListener('click', ()=>{
        const orundum = +document.getElementById('orundum').value;
        const ten = +document.getElementById('tenPermits').value;
        const single = +document.getElementById('permits').value;
        const op = +document.getElementById('originite').value;
        const pOnly = ten*10 + single;
        const pullFromOrundum = Math.floor(orundum/600);
        const pullFromOp = Math.floor((180*op + orundum)/600);
        document.getElementById('pullsResult').textContent = 
            t('pulls.result_tickets', {pulls: pOnly + pullFromOrundum}) + '\n' +
            t('pulls.result_all', {pulls: pOnly + pullFromOp});
    });
    document.getElementById('resetPullsBtn').addEventListener('click', ()=>{
        document.getElementById('orundum').value=0; document.getElementById('tenPermits').value=0;
        document.getElementById('permits').value=0; document.getElementById('originite').value=0;
        document.getElementById('pullsResult').textContent = '';
    });

    // Endfield gacha UI
    const efStartBtn = document.getElementById('startEfSimBtn');
    const efQueryBtn = document.getElementById('efQueryBtn');
    const efCopyMatlabBtn = document.getElementById('efCopyMatlabBtn');
    const efProgress = document.getElementById('efProgress');
    const efResultDiv = document.getElementById('efResult');
    let efSortedList = [], efOList = [];

    function resetEndfield() {
        document.getElementById('efTarget').value = 1;
        document.getElementById('efSimTimes').value = 10000;
        efResultDiv.textContent = t('endfield.result_initial');
        efProgress.value = 0;
        efSortedList = [];
        efOList = [];
        efQueryBtn.disabled = true;
        efCopyMatlabBtn.disabled = true;
    }
    document.getElementById('resetEfBtn').addEventListener('click', resetEndfield);

    efStartBtn.addEventListener('click', async () => {
        const target = parseInt(document.getElementById('efTarget').value) || 1;
        const times = parseInt(document.getElementById('efSimTimes').value) || 10000;
        if (times <= 0) { alert(t('endfield.alert_times')); return; }
        if (target <= 0) { alert(t('endfield.alert_target')); return; }

        efStartBtn.disabled = true;
        efQueryBtn.disabled = true;
        efCopyMatlabBtn.disabled = true;
        efResultDiv.textContent = t('endfield.calculating');
        efProgress.value = 0;
        efSortedList = [];
        efOList = [];

        const chunkSize = 500;
        let results = [];
        function runEfSimulation(startIdx) {
            const end = Math.min(startIdx + chunkSize, times);
            for (let i = startIdx; i < end; i++) results.push(endfield_total_gacha(target));
            efProgress.value = (end / times) * 100;
            if (end < times) {
                setTimeout(() => runEfSimulation(end), 10);
            } else {
                results.sort((a,b)=>a-b);
                efSortedList = results;
                const n = efSortedList.length;
                if (n === 0) {
                    efResultDiv.textContent = t('endfield.result_error');
                    efStartBtn.disabled = false;
                    return;
                }
                const maxVal = efSortedList[n-1];
                efOList = new Array(maxVal).fill(0);
                efSortedList.forEach(v => efOList[v-1]++);

                const quantiles = [10,20,30,40,50,60,70,80,90,100];
                const quantVals = quantiles.map(q => efSortedList[Math.floor(q/100 * n) - 1] || efSortedList[0]);
                const mean = efSortedList.reduce((a,b)=>a+b,0)/n;
                const variance = efSortedList.reduce((s,x)=> s + (x-mean)**2, 0)/(n-1);
                const sd = Math.sqrt(variance);
                const cv = sd/mean;
                const ci99 = 2.58 * sd / Math.sqrt(n);
                const ci9999 = 3.72 * sd / Math.sqrt(n);

                let out = t('endfield.result_target', {target}) + '\n';
                out += t('endfield.result_total_sims', {n}) + '\n';
                out += t('endfield.result_avg', {mean: mean.toFixed(2)}) + '\n';
                out += t('endfield.result_median', {median: quantVals[4].toFixed(2)}) + '\n';
                out += t('endfield.result_sd', {sd: sd.toFixed(2)}) + '\n';
                out += t('endfield.result_cv', {cv: cv.toFixed(2)}) + '\n';
                out += t('endfield.result_deciles', {deciles: quantVals.join(', ')}) + '\n';
                out += t('endfield.result_ci99', {mean: mean.toFixed(2), ci: ci99.toFixed(2)}) + '\n';
                out += t('endfield.result_ci9999', {mean: mean.toFixed(2), ci: ci9999.toFixed(2)}) + '\n';
                out += '==================================================';
                efResultDiv.textContent = out;
                efStartBtn.disabled = false;
                efQueryBtn.disabled = false;
                efCopyMatlabBtn.disabled = false;
            }
        }
        runEfSimulation(0);
    });

    efQueryBtn.addEventListener('click', () => {
        if (!efSortedList.length) { alert(t('endfield.alert_no_sim')); return; }
        const queryWin = document.createElement('div');
        Object.assign(queryWin.style, {
            position:'fixed', top:'30%', left:'35%', background:'#1e2533',
            padding:'24px', borderRadius:'20px', width:'400px', zIndex:'1000',
            boxShadow:'0 0 30px black'
        });
        queryWin.innerHTML = `
            <h3>🔎 ${t('endfield.query_title')}</h3>
            <div style="margin:15px 0;"><label>${t('endfield.query_pull_to_prob')}</label><br>
                <input id="efQPull" type="number" placeholder="${t('endfield.query_placeholder_pull')}" style="width:100%">
                <button id="efCalcProbBtn">${t('endfield.calc')}</button> <span id="efProbResult"></span>
            </div>
            <div><label>${t('endfield.query_prob_to_pull')}</label><br>
                <input id="efQProb" type="number" step="0.1" placeholder="${t('endfield.query_placeholder_prob')}" style="width:100%">
                <button id="efCalcPullBtn">${t('endfield.calc')}</button> <span id="efPullResult"></span>
            </div>
            <button id="efCloseQuery" style="margin-top:20px;">${t('endfield.close')}</button>
        `;
        document.body.appendChild(queryWin);
        document.getElementById('efCalcProbBtn').addEventListener('click', ()=>{
            const q = parseInt(document.getElementById('efQPull').value);
            if (isNaN(q) || q<=0 || q>efOList.length) document.getElementById('efProbResult').textContent = t('endfield.query_out_of_range');
            else {
                const cum = efOList.slice(0,q).reduce((a,b)=>a+b,0);
                const prob = cum / efSortedList.length * 100;
                document.getElementById('efProbResult').textContent = t('endfield.query_prob_result', {prob: prob.toFixed(2)});
            }
        });
        document.getElementById('efCalcPullBtn').addEventListener('click', ()=>{
            const p = parseFloat(document.getElementById('efQProb').value);
            if (isNaN(p) || p<=0 || p>100) document.getElementById('efPullResult').textContent = t('endfield.query_prob_range');
            else {
                const idx = Math.floor(p/100 * efSortedList.length) - 1;
                document.getElementById('efPullResult').textContent = t('endfield.query_pull_result', {pulls: efSortedList[Math.max(0,idx)]});
            }
        });
        document.getElementById('efCloseQuery').addEventListener('click', ()=> queryWin.remove());
    });

    efCopyMatlabBtn.addEventListener('click', () => {
        if (!efSortedList.length) {
            alert(t('endfield.alert_no_sim'));
            return;
        }
        const code = generateMatlabCode(efSortedList, t('matlab.endfield_title'));
        copyToClipboard(code, t('endfield.copy_success'));
    });
        // ========== 畫圖功能 (新增) ==========
    let gachaChartInstance = null; // 用嚟記住舊嘅圖，等下次唔會重疊

        function drawGachaChart(sortedList, oList) {
        const container = document.getElementById('gachaChartContainer');
        const canvas = document.getElementById('gachaChart');
        if (!canvas || !container) return;
        if (!sortedList || sortedList.length === 0) return;

        // 顯示容器
        container.style.display = 'block';

        // 銷毀舊圖
        if (gachaChartInstance) {
            gachaChartInstance.destroy();
            gachaChartInstance = null;
        }

        const ctx = canvas.getContext('2d');
        const total = sortedList.length;

        // ----- 第 1 步：完整計算 PDF 同 CDF (全部點，一個都唔跳) -----
        const fullPDF = [];
        const fullCDF = [];
        let cum = 0;

        for (let i = 0; i < oList.length; i++) {
            const pdf = oList[i] / total;
            fullPDF.push(pdf);
            cum += pdf;
            fullCDF.push(cum);
        }

        // ----- 第 2 步：抽樣 (Downsample) 方便畫圖，但拎嘅數值係完整計好嘅 -----
        let step = 1;
        const MAX_POINTS = 600;
        if (oList.length > MAX_POINTS) {
            step = Math.ceil(oList.length / MAX_POINTS);
        }

        const labels = [];
        const pdfData = [];
        const cdfData = [];

        for (let i = 0; i < oList.length; i += step) {
            labels.push(i + 1);
            pdfData.push(fullPDF[i]);
            cdfData.push(fullCDF[i]);
        }

        // 確保最後一點一定包埋 (等 CDF 去到 1.0)
        const lastIdx = oList.length - 1;
        if (labels[labels.length - 1] !== lastIdx + 1) {
            labels.push(lastIdx + 1);
            pdfData.push(fullPDF[lastIdx]);
            cdfData.push(fullCDF[lastIdx]);
        }

        // ----- 第 3 步：畫圖 -----
        gachaChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'PDF (概率密度)',
                        data: pdfData,
                        borderColor: '#4fc3f7',
                        backgroundColor: 'rgba(79, 195, 247, 0.1)',
                        fill: true,
                        pointRadius: 0,
                        tension: 0.2,
                        yAxisID: 'y'
                    },
                    {
                        label: 'CDF (累積概率)',
                        data: cdfData,
                        borderColor: '#ffb74d',
                        backgroundColor: 'rgba(255, 183, 77, 0.05)',
                        fill: false,
                        pointRadius: 0,
                        tension: 0.2,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 2,
                plugins: {
                    title: { display: true, text: '📊 抽卡分佈 (PDF + CDF)', color: '#eee' },
                    legend: { labels: { color: '#ccc' } }
                },
                scales: {
                    x: { 
                        title: { display: true, text: '抽數', color: '#aaa' }, 
                        ticks: { color: '#aaa', maxTicksLimit: 20 } 
                    },
                    y: { 
                        beginAtZero: true, 
                        title: { display: true, text: 'PDF', color: '#aaa' }, 
                        ticks: { color: '#aaa' } 
                    },
                    y1: { 
                        position: 'right', 
                        beginAtZero: true, 
                        // 唔好 set max，等佢自然去到 1.0
                        title: { display: true, text: 'CDF', color: '#aaa' }, 
                        grid: { drawOnChartArea: false }, 
                        ticks: { color: '#aaa' } 
                    }
                }
            }
        });
    }

    // 鍵盤快捷鍵
    window.addEventListener('keydown', (e)=>{
        if (e.ctrlKey) {
            if (e.key === '1') document.querySelector('[data-tab="gacha"]').click();
            else if (e.key === '2') document.querySelector('[data-tab="resource"]').click();
            else if (e.key === '3') document.querySelector('[data-tab="pulls"]').click();
            else if (e.key === '4') document.querySelector('[data-tab="endfield"]').click();
        }
    });

    // 語言變更時更新動態內容
    document.addEventListener('languageChanged', () => {
        if (reservedExp>0 || reservedCash>0) {
            reserveDisplay.textContent = t('resource.reserve_display_current', {exp: reservedExp.toLocaleString(), cash: reservedCash.toLocaleString()});
        } else {
            reserveDisplay.textContent = t('resource.reserve_display_default');
        }
        if (modal.style.display === 'flex' && modal._tempReserve) {
            document.getElementById('modalReserveResult').textContent = 
                t('modal.reserve_result', {exp: modal._tempReserve.exp.toLocaleString(), cash: modal._tempReserve.cash.toLocaleString()});
        }
    });

    // 初始化語言
    buildLangSwitcher();
    loadLanguage(detectLanguage());

})();
