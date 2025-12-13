// ============================================================
// ГОЙДАБЛОКС - ГЕНЕРАТОР ТЕКСТУР
// ============================================================

const TextureGenerator = {
    cache: new Map(),
    
    // Получить или создать текстуру
    getTexture(name, generator) {
        if (this.cache.has(name)) {
            return this.cache.get(name);
        }
        const texture = generator();
        this.cache.set(name, texture);
        return texture;
    },
    
    // Текстура травы
    grass() {
        return this.getTexture('grass', () => {
            return Utils.createCanvasTexture(512, 512, (ctx, w, h) => {
                const gradient = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, w/2);
                gradient.addColorStop(0, '#5A9C3A');
                gradient.addColorStop(1, '#4A8C2A');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, w, h);
                
                // Детали травы
                for (let i = 0; i < 3000; i++) {
                    const shade = Math.random() > 0.5 ? 20 : -20;
                    ctx.fillStyle = `rgba(${74 + shade}, ${140 + shade}, ${42 + shade}, 0.4)`;
                    ctx.fillRect(Math.random() * w, Math.random() * h, 2 + Math.random() * 3, 2 + Math.random() * 3);
                }
                
                // Цветочки
                for (let i = 0; i < 50; i++) {
                    ctx.fillStyle = Math.random() > 0.5 ? '#FFFF99' : '#FFAAAA';
                    ctx.beginPath();
                    ctx.arc(Math.random() * w, Math.random() * h, 2, 0, Math.PI * 2);
                    ctx.fill();
                }
            });
        });
    },
    
    // Текстура асфальта
    asphalt() {
        return this.getTexture('asphalt', () => {
            return Utils.createCanvasTexture(256, 256, (ctx, w, h) => {
                ctx.fillStyle = '#333333';
                ctx.fillRect(0, 0, w, h);
                
                // Трещины и неровности
                for (let i = 0; i < 800; i++) {
                    const shade = Math.random() * 40 - 20;
                    ctx.fillStyle = `rgba(${51 + shade}, ${51 + shade}, ${51 + shade}, 0.5)`;
                    ctx.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 2, 1 + Math.random() * 2);
                }
                
                // Пятна масла
                for (let i = 0; i < 5; i++) {
                    ctx.fillStyle = 'rgba(20, 20, 30, 0.3)';
                    ctx.beginPath();
                    ctx.ellipse(Math.random() * w, Math.random() * h, 10 + Math.random() * 15, 5 + Math.random() * 10, Math.random() * Math.PI, 0, Math.PI * 2);
                    ctx.fill();
                }
            });
        });
    },
    
    // Текстура тротуара
    sidewalk() {
        return this.getTexture('sidewalk', () => {
            return Utils.createCanvasTexture(256, 256, (ctx, w, h) => {
                ctx.fillStyle = '#888888';
                ctx.fillRect(0, 0, w, h);
                
                // Плитка
                ctx.strokeStyle = '#666666';
                ctx.lineWidth = 2;
                const tileSize = 32;
                for (let x = 0; x < w; x += tileSize) {
                    for (let y = 0; y < h; y += tileSize) {
                        ctx.strokeRect(x, y, tileSize, tileSize);
                    }
                }
                
                // Грязь
                for (let i = 0; i < 200; i++) {
                    ctx.fillStyle = `rgba(100, 80, 60, ${Math.random() * 0.2})`;
                    ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
                }
            });
        });
    },
    
    // Текстура панельки
    panelka() {
        return this.getTexture('panelka', () => {
            return Utils.createCanvasTexture(256, 512, (ctx, w, h) => {
                ctx.fillStyle = '#CCCCBB';
                ctx.fillRect(0, 0, w, h);
                
                // Панели
                ctx.strokeStyle = '#AAAAAA';
                ctx.lineWidth = 2;
                for (let y = 0; y < h; y += 64) {
                    ctx.beginPath();
                    ctx.moveTo(0, y);
                    ctx.lineTo(w, y);
                    ctx.stroke();
                }
                
                // Окна
                const windowSize = 24;
                const windowGap = 40;
                for (let y = 20; y < h - windowSize; y += windowGap) {
                    for (let x = 20; x < w - windowSize; x += windowGap) {
                        // Рама
                        ctx.fillStyle = '#555555';
                        ctx.fillRect(x - 2, y - 2, windowSize + 4, windowSize + 4);
                        
                        // Стекло
                        const isLit = Math.random() > 0.5;
                        ctx.fillStyle = isLit ? '#FFFF99' : '#6699AA';
                        ctx.fillRect(x, y, windowSize, windowSize);
                        
                        // Перекрестье
                        ctx.fillStyle = '#555555';
                        ctx.fillRect(x + windowSize/2 - 1, y, 2, windowSize);
                        ctx.fillRect(x, y + windowSize/2 - 1, windowSize, 2);
                    }
                }
                
                // Грязь
                for (let i = 0; i < 100; i++) {
                    ctx.fillStyle = `rgba(100, 90, 80, ${Math.random() * 0.3})`;
                    ctx.fillRect(Math.random() * w, Math.random() * h, 3 + Math.random() * 5, 3 + Math.random() * 5);
                }
            });
        });
    },
    
    // Текстура кирпича
    brick() {
        return this.getTexture('brick', () => {
            return Utils.createCanvasTexture(256, 256, (ctx, w, h) => {
                ctx.fillStyle = '#AA5533';
                ctx.fillRect(0, 0, w, h);
                
                const brickW = 32;
                const brickH = 16;
                ctx.strokeStyle = '#665544';
                ctx.lineWidth = 2;
                
                for (let y = 0; y < h; y += brickH) {
                    const offset = (Math.floor(y / brickH) % 2) * (brickW / 2);
                    for (let x = -brickW + offset; x < w; x += brickW) {
                        // Вариации цвета кирпича
                        const shade = Math.random() * 30 - 15;
                        ctx.fillStyle = `rgb(${170 + shade}, ${85 + shade/2}, ${51 + shade/3})`;
                        ctx.fillRect(x + 1, y + 1, brickW - 2, brickH - 2);
                    }
                }
                
                // Швы
                ctx.fillStyle = '#665544';
                for (let y = 0; y < h; y += brickH) {
                    ctx.fillRect(0, y, w, 2);
                    const offset = (Math.floor(y / brickH) % 2) * (brickW / 2);
                    for (let x = offset; x < w; x += brickW) {
                        ctx.fillRect(x, y, 2, brickH);
                    }
                }
            });
        });
    },
    
    // Текстура стены Кремля
    kremlinWall() {
        return this.getTexture('kremlinWall', () => {
            return Utils.createCanvasTexture(512, 512, (ctx, w, h) => {
                // Основа - красный кирпич
                ctx.fillStyle = '#8B2500';
                ctx.fillRect(0, 0, w, h);
                
                const brickW = 24;
                const brickH = 12;
                
                for (let y = 0; y < h; y += brickH) {
                    const offset = (Math.floor(y / brickH) % 2) * (brickW / 2);
                    for (let x = -brickW + offset; x < w; x += brickW) {
                        const shade = Math.random() * 20 - 10;
                        ctx.fillStyle = `rgb(${139 + shade}, ${37 + shade/2}, 0)`;
                        ctx.fillRect(x + 1, y + 1, brickW - 2, brickH - 2);
                    }
                }
                
                // Зубцы (мерлоны) сверху
                ctx.fillStyle = '#8B2500';
                const merlonW = 32;
                const merlonH = 40;
                for (let x = 0; x < w; x += merlonW * 2) {
                    ctx.fillRect(x, 0, merlonW, merlonH);
                }
            });
        });
    },
    
    // Текстура вывески
    sign(text, bgColor = '#FFFFFF', textColor = '#000000') {
        const key = `sign_${text}_${bgColor}_${textColor}`;
        return this.getTexture(key, () => {
            return Utils.createCanvasTexture(512, 128, (ctx, w, h) => {
                ctx.fillStyle = bgColor;
                ctx.fillRect(0, 0, w, h);
                
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 4;
                ctx.strokeRect(2, 2, w - 4, h - 4);
                
                ctx.fillStyle = textColor;
                ctx.font = 'bold 42px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(text, w/2, h/2);
            });
        });
    },
    
    // Рекламный баннер
    banner(text, subtext = '') {
        const key = `banner_${text}_${subtext}`;
        return this.getTexture(key, () => {
            return Utils.createCanvasTexture(512, 256, (ctx, w, h) => {
                // Фон - триколор
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, w, h/3);
                ctx.fillStyle = '#0039A6';
                ctx.fillRect(0, h/3, w, h/3);
                ctx.fillStyle = '#D52B1E';
                ctx.fillRect(0, 2*h/3, w, h/3);
                
                // Текст
                ctx.fillStyle = '#000000';
                ctx.font = 'bold 36px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(text, w/2, h/2 - 20);
                
                if (subtext) {
                    ctx.font = '24px Arial';
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillText(subtext, w/2, h/2 + 30);
                }
            });
        });
    },
    
    // Текстура номерного знака
    licensePlate(number) {
        const key = `plate_${number}`;
        return this.getTexture(key, () => {
            return Utils.createCanvasTexture(128, 32, (ctx, w, h) => {
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, w, h);
                
                // Синяя полоса
                ctx.fillStyle = '#0039A6';
                ctx.fillRect(w - 25, 0, 25, h);
                
                // Флаг
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(w - 22, 5, 19, 6);
                ctx.fillStyle = '#0039A6';
                ctx.fillRect(w - 22, 11, 19, 6);
                ctx.fillStyle = '#D52B1E';
                ctx.fillRect(w - 22, 17, 19, 6);
                
                // Текст RUS
                ctx.fillStyle = '#FFFFFF';
                ctx.font = 'bold 6px Arial';
                ctx.fillText('RUS', w - 17, 28);
                
                // Номер
                ctx.fillStyle = '#000000';
                ctx.font = 'bold 18px Arial';
                ctx.textAlign = 'left';
                ctx.fillText(number, 5, 22);
                
                // Рамка
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 2;
                ctx.strokeRect(1, 1, w - 2, h - 2);
            });
        });
    },
    
    // Текстура золотого купола
    goldenDome() {
        return this.getTexture('goldenDome', () => {
            return Utils.createCanvasTexture(256, 256, (ctx, w, h) => {
                const gradient = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, w/2);
                gradient.addColorStop(0, '#FFD700');
                gradient.addColorStop(0.5, '#DAA520');
                gradient.addColorStop(1, '#B8860B');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, w, h);
                
                // Блики
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.beginPath();
                ctx.ellipse(w * 0.3, h * 0.3, 30, 20, -Math.PI/4, 0, Math.PI * 2);
                ctx.fill();
            });
        });
    },
    
    // Текстура стекла
    glass() {
        return this.getTexture('glass', () => {
            return Utils.createCanvasTexture(128, 128, (ctx, w, h) => {
                const gradient = ctx.createLinearGradient(0, 0, w, h);
                gradient.addColorStop(0, 'rgba(135, 206, 235, 0.8)');
                gradient.addColorStop(0.5, 'rgba(100, 180, 220, 0.7)');
                gradient.addColorStop(1, 'rgba(135, 206, 235, 0.8)');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, w, h);
                
                // Отражение
                ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(w * 0.3, 0);
                ctx.lineTo(0, h * 0.3);
                ctx.closePath();
                ctx.fill();
            });
        });
    },
    
    // Текстура звезды (для Кремля)
    star() {
        return this.getTexture('star', () => {
            return Utils.createCanvasTexture(128, 128, (ctx, w, h) => {
                ctx.fillStyle = '#CC0000';
                ctx.fillRect(0, 0, w, h);
                
                // Звезда
                ctx.fillStyle = '#FFD700';
                ctx.beginPath();
                const cx = w/2, cy = h/2, spikes = 5, outerRadius = 50, innerRadius = 20;
                let rot = Math.PI / 2 * 3;
                const step = Math.PI / spikes;
                ctx.moveTo(cx, cy - outerRadius);
                for (let i = 0; i < spikes; i++) {
                    let x = cx + Math.cos(rot) * outerRadius;
                    let y = cy + Math.sin(rot) * outerRadius;
                    ctx.lineTo(x, y);
                    rot += step;
                    x = cx + Math.cos(rot) * innerRadius;
                    y = cy + Math.sin(rot) * innerRadius;
                    ctx.lineTo(x, y);
                    rot += step;
                }
                ctx.lineTo(cx, cy - outerRadius);
                ctx.closePath();
                ctx.fill();
            });
        });
    },
    
    // Случайный русский номер
    generatePlateNumber() {
        const letters = 'АВЕКМНОРСТУХ';
        const letter1 = letters[Math.floor(Math.random() * letters.length)];
        const letter2 = letters[Math.floor(Math.random() * letters.length)];
        const letter3 = letters[Math.floor(Math.random() * letters.length)];
        const num = Math.floor(Math.random() * 900 + 100);
        const region = Math.floor(Math.random() * 99 + 1);
        return `${letter1}${num}${letter2}${letter3} ${region}`;
    }
};