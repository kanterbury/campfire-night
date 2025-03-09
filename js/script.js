document.addEventListener('DOMContentLoaded', function() {
    // 要素の取得
    const backgroundLayer = document.querySelector('.background-layer');
    const scrollObserver = document.querySelector('.scroll-observer');
    const fire = document.querySelector('.fire');
    const flames = document.querySelectorAll('.flame');
    const embers = document.querySelector('.embers');
    const scrollIndicator = document.querySelector('.scroll-indicator');
    const logs = document.querySelector('.logs');
    
    // 色の定義
    const sunsetColor = '#FF7F50'; // 夕焼け（オレンジ）
    const nightColor = '#0A0A1A';  // 夜（より暗いダークブルー）
    const dawnColor = '#FF7F50';   // 朝焼け（オレンジ）
    const logColor = '#8B4513';    // 薪の色（茶色）
    const charcoalColor = '#222';  // 炭の色（黒）
    
    // スクロールインジケーターのテキスト要素と矢印要素を取得
    const scrollText = scrollIndicator.querySelector('p');
    const arrowDown = scrollIndicator.querySelector('.arrow-down');
    
    // テキスト表示状態を追跡する変数
    let isNightTextVisible = true;
    let isMorningTextVisible = false;
    
    // スクロール位置に応じた変化を制御
    window.addEventListener('scroll', function() {
        // スクロール位置の計算（0～1の範囲）
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPosition = window.scrollY;
        const scrollProgress = scrollPosition / scrollHeight;
        
        // 背景色の変化
        updateBackground(scrollProgress);
        
        // 火のアニメーション
        updateFire(scrollProgress);
        
        // 薪の色の変化（炭化）
        updateLogs(scrollProgress);
        
        // 初期状態（最上部）
        if (scrollProgress < 0.05) {
            if (!isNightTextVisible) {
                // 最上部に戻ったら「スクロールして一夜を過ごす」テキストを表示
                scrollText.textContent = 'スクロールして一夜を過ごす';
                arrowDown.style.display = 'block';
                scrollIndicator.style.opacity = '0.8';
                isNightTextVisible = true;
                isMorningTextVisible = false;
            }
        }
        // 最下部に近づいたら
        else if (scrollProgress >= 0.95) {
            if (!isMorningTextVisible) {
                // 「いい夜でしたね」テキストを表示
                scrollText.textContent = 'いい夜でしたね';
                arrowDown.style.display = 'none';
                scrollIndicator.style.opacity = '0.8';
                isMorningTextVisible = true;
            }
        }
    });
    
    // 背景色の更新（より緩やかな変化）
    function updateBackground(progress) {
        let color;
        
        if (progress < 0.05) {
            // 夕焼け（オレンジ）
            color = sunsetColor;
        } else if (progress < 0.45) {
            // 夕焼けから夜への変化（より長い時間をかける）
            const nightProgress = (progress - 0.05) / 0.4;
            color = blendColors(sunsetColor, nightColor, nightProgress);
            
            // 夜に変わり始めるタイミングでテキストをフェードアウト
            if (nightProgress > 0.1 && isNightTextVisible) {
                // 「スクロールして一夜を過ごす」テキストをフェードアウト
                scrollIndicator.style.opacity = '0';
                isNightTextVisible = false;
                console.log('Night text faded out');
            }
        } else if (progress < 0.55) {
            // 夜（ダークブルー）
            color = nightColor;
            
            // 夜の間はテキストを非表示に
            if (isNightTextVisible) {
                scrollIndicator.style.opacity = '0';
                isNightTextVisible = false;
            }
        } else if (progress < 0.95) {
            // 夜から朝焼けへの変化（より長い時間をかける）
            const dawnProgress = (progress - 0.55) / 0.4;
            color = blendColors(nightColor, dawnColor, dawnProgress);
            
            // 朝の色に完全に切り替わったタイミングでテキストをフェードイン
            if (dawnProgress >= 0.99 && !isMorningTextVisible) {
                // 「いい夜でしたね」テキストをフェードイン
                scrollText.textContent = 'いい夜でしたね';
                arrowDown.style.display = 'none';
                scrollIndicator.style.opacity = '0.8';
                isMorningTextVisible = true;
                console.log('Morning text faded in');
            }
        } else {
            // 朝焼け（オレンジ）
            color = dawnColor;
        }
        
        backgroundLayer.style.backgroundColor = color;
    }
    
    // 薪の色を更新（炭化する効果）- よりスムーズな変化と明確な色の変化
    function updateLogs(progress) {
        // スクロール位置が0.4（40%）を超えたあたりから薪が炭化し始める
        let currentColor;
        
        if (progress < 0.4) {
            // 通常の薪の色
            currentColor = logColor;
        } else if (progress < 0.7) {
            // 徐々に炭化 - イージング関数を使用してよりスムーズな変化
            const charProgress = (progress - 0.4) / 0.3;
            // イージング関数（二次関数）を適用
            const easedProgress = charProgress * charProgress;
            currentColor = blendColors(logColor, charcoalColor, easedProgress);
            
            // デバッグログ
            console.log('Log Color Changing:', easedProgress);
        } else {
            // 完全に炭化
            currentColor = charcoalColor;
        }
        
        // メインの薪の色を設定
        logs.style.backgroundColor = currentColor;
        
        // 疑似要素の色も変更（CSSカスタムプロパティを使用）
        document.documentElement.style.setProperty('--log-color', currentColor);
        
        // 左右の薪（疑似要素）が確実に表示されるようにする
        // 直接スタイルを適用
        const logsBeforeAfter = `
            .logs:before, .logs:after {
                content: '';
                position: absolute;
                width: 140px;
                height: 30px;
                background-color: ${currentColor} !important;
                border-radius: 5px;
                transition: background-color 1s ease;
            }
            
            .logs:before {
                transform: rotate(25deg);
                left: -30px;
                bottom: 10px;
            }
            
            .logs:after {
                transform: rotate(-25deg);
                right: -30px;
                bottom: 10px;
            }
        `;
        
        // 既存のスタイル要素を探すか、新しく作成
        let styleEl = document.getElementById('dynamic-log-style');
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = 'dynamic-log-style';
            document.head.appendChild(styleEl);
        }
        
        // スタイルを更新
        styleEl.textContent = logsBeforeAfter;
    }
    
    // 火のアニメーションの更新（スクロール範囲に合わせて調整）- より派手に
    function updateFire(progress) {
        console.log('Scroll Progress:', progress);
        
        // 全ての火の粉要素を取得
        const emberElements = document.querySelectorAll('.ember');
        
        if (progress < 0.05) {
            // 薪のみ表示
            fire.style.opacity = '0';
            embers.style.opacity = '0';
        } else if (progress < 0.15) {
            // 火が着き始める - より派手に
            const fireStart = (progress - 0.05) / 0.1;
            // イージング関数を適用して、より自然な開始に
            const easedStart = Math.pow(fireStart, 1.5);
            console.log('Fire Starting:', easedStart);
            
            fire.style.opacity = easedStart.toString();
            embers.style.opacity = (easedStart * 0.7).toString();
            
            // 炎の大きさを調整（より大きく）
            flames.forEach((flame, index) => {
                // 新しい基本の高さ（より高く）
                const baseHeights = [90, 75, 85, 70, 65, 60, 55, 50, 45]; // flame1-9の基本の高さ
                const baseHeight = baseHeights[index] || 60;
                
                // 炎の高さをより派手に
                flame.style.height = `${baseHeight * easedStart}px`;
                
                // 炎の幅も調整
                const baseWidths = [22, 20, 21, 19, 18, 17, 16, 15, 14]; // flame1-9の基本の幅
                const baseWidth = baseWidths[index] || 15;
                flame.style.width = `${baseWidth * easedStart}px`;
                
                // 発光効果を強化
                const glowIntensity = 2 + 8 * easedStart; // 0.5から2.5の範囲
                flame.style.filter = `blur(${1 * easedStart}px)`;
                flame.style.boxShadow = `0 0 ${glowIntensity}px ${glowIntensity / 2}px rgba(255, 69, 0, ${0.3 + 0.4 * easedStart})`;
            });
            
            // 火の粉のアニメーションも調整
            emberElements.forEach(ember => {
                ember.style.opacity = (easedStart * 0.7).toString();
            });
        } else if (progress < 0.35) {
            // 火が大きくなる - より派手に
            const fireGrow = (progress - 0.15) / 0.2;
            // イージング関数を適用して、より自然な成長に
            const easedGrow = 0.5 * (1 - Math.cos(Math.PI * fireGrow));
            console.log('Fire Growing:', easedGrow);
            
            fire.style.opacity = '1';
            embers.style.opacity = (0.7 + easedGrow * 0.3).toString();
            
            // 炎の大きさを調整（より大きく）
            flames.forEach((flame, index) => {
                const baseHeights = [90, 75, 85, 70, 65, 60, 55, 50, 45]; // flame1-9の基本の高さ
                const baseHeight = baseHeights[index] || 60;
                
                // 炎の高さをより派手に（最大2倍まで）
                flame.style.height = `${baseHeight * (1 + easedGrow)}px`;
                
                // 炎の幅も調整
                const baseWidths = [22, 20, 21, 19, 18, 17, 16, 15, 14]; // flame1-9の基本の幅
                const baseWidth = baseWidths[index] || 15;
                flame.style.width = `${baseWidth * (1 + easedGrow * 0.3)}px`;
                
                // 発光効果を強化
                const glowIntensity = 5 + 10 * easedGrow; // 5から15の範囲
                flame.style.filter = `blur(${1 + 0.5 * easedGrow}px)`;
                flame.style.boxShadow = `0 0 ${glowIntensity}px ${glowIntensity / 2}px rgba(255, 69, 0, ${0.5 + 0.5 * easedGrow})`;
            });
            
            // 火の粉のアニメーションも調整
            emberElements.forEach((ember, index) => {
                // 火の粉の大きさを調整
                const baseSize = 6 + (index % 3) * 2; // 6から10の範囲
                const size = baseSize * (1 + easedGrow * 0.5);
                ember.style.width = `${size}px`;
                ember.style.height = `${size}px`;
                
                // 発光効果を強化
                const glowIntensity = 6 + 6 * easedGrow; // 6から12の範囲
                ember.style.boxShadow = `0 0 ${glowIntensity}px ${glowIntensity / 3}px rgba(255, 165, 0, ${0.6 + 0.4 * easedGrow})`;
            });
        } else if (progress < 0.65) {
            // 火が最大 - より派手に
            console.log('Fire at Maximum');
            fire.style.opacity = '1';
            embers.style.opacity = '1';
            
            // 炎の大きさを最大に（より大きく）
            flames.forEach((flame, index) => {
                const baseHeights = [90, 75, 85, 70, 65, 60, 55, 50, 45]; // flame1-9の基本の高さ
                const baseHeight = baseHeights[index] || 60;
                
                // 炎の高さをより派手に（2倍）
                flame.style.height = `${baseHeight * 2}px`;
                
                // 炎の幅も調整
                const baseWidths = [22, 20, 21, 19, 18, 17, 16, 15, 14]; // flame1-9の基本の幅
                const baseWidth = baseWidths[index] || 15;
                flame.style.width = `${baseWidth * 1.3}px`;
                
                // 発光効果を最大に
                flame.style.filter = `blur(1.5px)`;
                flame.style.boxShadow = `0 0 15px 7.5px rgba(255, 69, 0, 1)`;
            });
            
            // 火の粉のアニメーションも最大に
            emberElements.forEach((ember, index) => {
                // 火の粉の大きさを最大に
                const baseSize = 6 + (index % 3) * 2; // 6から10の範囲
                ember.style.width = `${baseSize * 1.5}px`;
                ember.style.height = `${baseSize * 1.5}px`;
                
                // 発光効果を最大に
                ember.style.boxShadow = `0 0 12px 4px rgba(255, 165, 0, 1)`;
            });
        } else if (progress < 0.75) {
            // 火が小さくなる - より派手に
            const fireShrink = (progress - 0.65) / 0.1;
            // イージング関数を適用して、より自然な縮小に
            const easedShrink = fireShrink * (2 - fireShrink);
            console.log('Fire Shrinking:', easedShrink);
            
            fire.style.opacity = (1 - easedShrink * 0.3).toString();
            embers.style.opacity = (1 - easedShrink * 0.5).toString();
            
            // 炎の大きさを調整（縮小）
            flames.forEach((flame, index) => {
                const baseHeights = [90, 75, 85, 70, 65, 60, 55, 50, 45]; // flame1-9の基本の高さ
                const baseHeight = baseHeights[index] || 60;
                
                // 炎の高さを縮小（2倍から1倍へ）
                flame.style.height = `${baseHeight * (2 - easedShrink)}px`;
                
                // 炎の幅も調整
                const baseWidths = [22, 20, 21, 19, 18, 17, 16, 15, 14]; // flame1-9の基本の幅
                const baseWidth = baseWidths[index] || 15;
                flame.style.width = `${baseWidth * (1.3 - easedShrink * 0.3)}px`;
                
                // 発光効果を弱める
                const glowIntensity = 15 - 10 * easedShrink; // 15から5の範囲
                flame.style.filter = `blur(${1.5 - 0.5 * easedShrink}px)`;
                flame.style.boxShadow = `0 0 ${glowIntensity}px ${glowIntensity / 2}px rgba(255, 69, 0, ${1 - 0.5 * easedShrink})`;
            });
            
            // 火の粉のアニメーションも調整
            emberElements.forEach((ember, index) => {
                // 火の粉の大きさを調整
                const baseSize = 6 + (index % 3) * 2; // 6から10の範囲
                const size = baseSize * (1.5 - easedShrink * 0.5);
                ember.style.width = `${size}px`;
                ember.style.height = `${size}px`;
                
                // 発光効果を弱める
                const glowIntensity = 12 - 6 * easedShrink; // 12から6の範囲
                ember.style.boxShadow = `0 0 ${glowIntensity}px ${glowIntensity / 3}px rgba(255, 165, 0, ${1 - 0.4 * easedShrink})`;
            });
        } else {
            // 火が消える - より派手に
            const fireEnd = (progress - 0.75) / 0.25;
            // イージング関数を適用して、より自然な消滅に
            const easedEnd = Math.pow(fireEnd, 0.7);
            console.log('Fire Ending:', easedEnd);
            
            fire.style.opacity = (0.7 - easedEnd * 0.7).toString();
            embers.style.opacity = (0.5 - easedEnd * 0.5).toString();
            
            // 炎の大きさを調整（消滅）
            flames.forEach((flame, index) => {
                const baseHeights = [90, 75, 85, 70, 65, 60, 55, 50, 45]; // flame1-9の基本の高さ
                const baseHeight = baseHeights[index] || 60;
                
                // 炎の高さを消滅
                flame.style.height = `${baseHeight * (1 - easedEnd * 0.8)}px`;
                
                // 炎の幅も調整
                const baseWidths = [22, 20, 21, 19, 18, 17, 16, 15, 14]; // flame1-9の基本の幅
                const baseWidth = baseWidths[index] || 15;
                flame.style.width = `${baseWidth * (1 - easedEnd * 0.2)}px`;
                
                // 発光効果を弱める
                const glowIntensity = 5 - 5 * easedEnd; // 5から0の範囲
                flame.style.filter = `blur(${1 - 0.5 * easedEnd}px)`;
                flame.style.boxShadow = `0 0 ${glowIntensity}px ${glowIntensity / 2}px rgba(255, 69, 0, ${0.5 - 0.5 * easedEnd})`;
            });
            
            // 火の粉のアニメーションも調整
            emberElements.forEach((ember, index) => {
                // 火の粉の大きさを調整
                const baseSize = 6 + (index % 3) * 2; // 6から10の範囲
                const size = baseSize * (1 - easedEnd * 0.5);
                ember.style.width = `${size}px`;
                ember.style.height = `${size}px`;
                
                // 発光効果を弱める
                const glowIntensity = 6 - 6 * easedEnd; // 6から0の範囲
                ember.style.boxShadow = `0 0 ${glowIntensity}px ${glowIntensity / 3}px rgba(255, 165, 0, ${0.6 - 0.6 * easedEnd})`;
            });
        }
    }
    
    // 2つの色を混ぜる関数
    function blendColors(color1, color2, ratio) {
        // 色をRGB形式に変換
        const rgb1 = hexToRgb(color1);
        const rgb2 = hexToRgb(color2);
        
        // 色を混ぜる
        const r = Math.round(rgb1.r * (1 - ratio) + rgb2.r * ratio);
        const g = Math.round(rgb1.g * (1 - ratio) + rgb2.g * ratio);
        const b = Math.round(rgb1.b * (1 - ratio) + rgb2.b * ratio);
        
        // RGB形式に戻す
        return `rgb(${r}, ${g}, ${b})`;
    }
    
    // HEX形式の色をRGB形式に変換する関数
    function hexToRgb(hex) {
        // #を削除
        hex = hex.replace('#', '');
        
        // RGBに変換
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        
        return { r, g, b };
    }
    
    // 初期化
    console.log('DOM Content Loaded');
    
    // 初期スクロール位置に応じた状態の設定
    const initialScroll = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
    updateBackground(initialScroll);
    updateFire(initialScroll);
    updateLogs(initialScroll);
    
    // 初期状態で薪の疑似要素の色を設定
    document.documentElement.style.setProperty('--log-color', logColor);
});
