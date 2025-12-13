// ============================================================
// ГОЙДАБЛОКС - ФИЗИКА И ДВИЖЕНИЕ
// ============================================================

const Physics = {
    // Основное обновление
    update(delta) {
        if (GameState.currentVehicle) {
            this.updateVehicle(delta);
        } else {
            this.updatePlayer(delta);
        }
        
        this.updateCamera(delta);
        this.checkInteractables();
    },
    
    // ===== ОБНОВЛЕНИЕ ИГРОКА =====
    updatePlayer(delta) {
        const player = GameState.player;
        const keys = GameState.keys;
        
        // Получаем направление движения из клавиш
        let moveX = 0;
        let moveZ = 0;
        
        if (keys['KeyW']) moveZ = -1;
        if (keys['KeyS']) moveZ = 1;
        if (keys['KeyA']) moveX = -1;
        if (keys['KeyD']) moveX = 1;
        
        // Нормализация диагонального движения
        const length = Math.sqrt(moveX * moveX + moveZ * moveZ);
        if (length > 0) {
            moveX /= length;
            moveZ /= length;
        }
        
        // Бег
        const isRunning = keys['ShiftLeft'] || keys['ShiftRight'];
        let speed = isRunning ? CONFIG.runSpeed : CONFIG.walkSpeed;
        
        // Выносливость
        if (isRunning && length > 0) {
            GameState.playerStamina -= CONFIG.staminaDrain * delta;
            if (GameState.playerStamina <= 0) {
                GameState.playerStamina = 0;
                speed = CONFIG.walkSpeed;
            }
        } else {
            GameState.playerStamina = Math.min(
                CONFIG.maxStamina,
                GameState.playerStamina + CONFIG.staminaRegen * delta
            );
        }
        
        // ===== ПРАВИЛЬНОЕ ВРАЩЕНИЕ ДВИЖЕНИЯ ПО КАМЕРЕ =====
        // Это ключевое исправление! Поворачиваем вектор движения по углу камеры
        if (length > 0) {
            const cameraAngle = GameState.cameraAngleX;
            
            // Вращаем вектор движения относительно направления камеры
            const rotatedX = moveX * Math.cos(cameraAngle) + moveZ * Math.sin(cameraAngle);
            const rotatedZ = -moveX * Math.sin(cameraAngle) + moveZ * Math.cos(cameraAngle);
            
            // Вычисляем новую позицию
            const newX = player.position.x + rotatedX * speed * delta;
            const newZ = player.position.z + rotatedZ * speed * delta;
            
            // Проверка коллизий и применение движения
            if (!this.checkCollision(newX, player.position.z, player.position.y)) {
                player.position.x = newX;
            }
            if (!this.checkCollision(player.position.x, newZ, player.position.y)) {
                player.position.z = newZ;
            }
            
            // Поворот модели игрока в направлении движения
            const targetAngle = Math.atan2(rotatedX, rotatedZ);
            player.rotation.y = Utils.lerp(
                player.rotation.y,
                targetAngle,
                0.15
            );
            
            // Анимация ходьбы
            const walkSpeed = isRunning ? 1.5 : 1;
            PlayerFactory.animateWalk(player, Date.now() * 0.001, walkSpeed);
        } else {
            // Сброс анимации когда стоим
            PlayerFactory.resetAnimation(player);
        }
        
        // Прыжок
        if (keys['Space'] && GameState.playerOnGround) {
            GameState.playerVelocity.y = CONFIG.jumpForce;
            GameState.playerOnGround = false;
        }
        
        // Гравитация
        GameState.playerVelocity.y += CONFIG.gravity * delta;
        player.position.y += GameState.playerVelocity.y * delta;
        
        // Земля
        if (player.position.y <= 1) {
            player.position.y = 1;
            GameState.playerVelocity.y = 0;
            GameState.playerOnGround = true;
        }
    },
    
    // ===== ОБНОВЛЕНИЕ ТРАНСПОРТА =====
    updateVehicle(delta) {
        const vehicle = GameState.currentVehicle;
        const keys = GameState.keys;
        
        // Проверка топлива
        if (GameState.vehicleFuel <= 0) {
            NotificationSystem.error('Закончилось топливо!');
            InputManager.exitVehicle();
            return;
        }
        
        // Ускорение/торможение
        const maxSpeed = vehicle.userData.maxSpeed || CONFIG.carMaxSpeed;
        
        if (keys['KeyW'] && GameState.vehicleFuel > 0) {
            GameState.vehicleSpeed += CONFIG.carAcceleration * delta;
            GameState.vehicleFuel -= CONFIG.fuelConsumption * delta;
        } else if (keys['KeyS']) {
            GameState.vehicleSpeed -= CONFIG.carAcceleration * 0.8 * delta;
        } else {
            // Трение / инерция
            GameState.vehicleSpeed *= 0.98;
        }
        
        // Тормоз
        if (keys['Space']) {
            if (Math.abs(GameState.vehicleSpeed) > 5) {
                GameState.vehicleSpeed *= 0.92;
            } else {
                GameState.vehicleSpeed *= 0.8;
            }
        }
        
        // Ограничение скорости
        GameState.vehicleSpeed = Utils.clamp(GameState.vehicleSpeed, -maxSpeed * 0.3, maxSpeed);
        
        // Поворот (только при движении)
        const turnSpeed = CONFIG.carTurnSpeed * (Math.abs(GameState.vehicleSpeed) / maxSpeed);
        if (Math.abs(GameState.vehicleSpeed) > 1) {
            if (keys['KeyA']) {
                vehicle.rotation.y += turnSpeed * delta * Math.sign(GameState.vehicleSpeed);
            }
            if (keys['KeyD']) {
                vehicle.rotation.y -= turnSpeed * delta * Math.sign(GameState.vehicleSpeed);
            }
        }
        
        // Движение вперёд
        const forward = new THREE.Vector3(0, 0, 1);
        forward.applyQuaternion(vehicle.quaternion);
        
        const newX = vehicle.position.x + forward.x * GameState.vehicleSpeed * delta;
        const newZ = vehicle.position.z + forward.z * GameState.vehicleSpeed * delta;
        
        // Коллизии
        if (!this.checkVehicleCollision(newX, newZ, vehicle)) {
            vehicle.position.x = newX;
            vehicle.position.z = newZ;
        } else {
            // Отскок при столкновении
            GameState.vehicleSpeed *= -0.3;
            NotificationSystem.error('БАМ! Столкновение!');
        }
        
        // Вращение колёс
        const wheelRotation = GameState.vehicleSpeed * delta * 2;
        if (vehicle.userData.wheels) {
            vehicle.userData.wheels.forEach(wheel => {
                wheel.rotation.x += wheelRotation;
            });
        }
        
        // Синхронизация позиции игрока с машиной
        GameState.player.position.copy(vehicle.position);
        GameState.player.position.y = 1;
        
        // Обновление HUD
        document.getElementById('speedometer').innerHTML = 
            `${Math.abs(Math.round(GameState.vehicleSpeed))} <span>км/ч</span>`;
        document.getElementById('fuel-fill').style.width = `${GameState.vehicleFuel}%`;
    },
    
    // ===== ОБНОВЛЕНИЕ КАМЕРЫ =====
    updateCamera(delta) {
        // Плавное следование камеры
        GameState.cameraAngleX = Utils.lerp(
            GameState.cameraAngleX,
            GameState.targetCameraAngleX,
            CONFIG.cameraSmoothing
        );
        GameState.cameraAngleY = Utils.lerp(
            GameState.cameraAngleY,
            GameState.targetCameraAngleY,
            CONFIG.cameraSmoothing
        );
        
        // Целевой объект
        const target = GameState.currentVehicle || GameState.player;
        
        // Параметры камеры
        const distance = GameState.currentVehicle 
            ? CONFIG.cameraDistance * 1.8 
            : CONFIG.cameraDistance;
        const height = GameState.currentVehicle 
            ? CONFIG.cameraHeight * 2 
            : CONFIG.cameraHeight;
        
        // Вычисляем позицию камеры
        const camX = target.position.x + 
            Math.sin(GameState.cameraAngleX) * Math.cos(GameState.cameraAngleY) * distance;
        const camY = target.position.y + 
            Math.sin(GameState.cameraAngleY) * distance + height;
        const camZ = target.position.z + 
            Math.cos(GameState.cameraAngleX) * Math.cos(GameState.cameraAngleY) * distance;
        
        GameState.camera.position.set(camX, camY, camZ);
        
        // Точка фокуса
        const lookAtY = target.position.y + (GameState.currentVehicle ? 1.5 : 1.2);
        GameState.camera.lookAt(target.position.x, lookAtY, target.position.z);
    },
    
    // ===== ПРОВЕРКА КОЛЛИЗИЙ ИГРОКА =====
    checkCollision(x, z, y) {
        const radius = CONFIG.playerRadius;
        
        for (const building of GameState.buildings) {
            const col = building.userData?.collision;
            if (!col) continue;
            
            // Вычисляем границы с учётом позиции здания
            const bx = building.position.x;
            const bz = building.position.z;
            const halfW = col.width / 2;
            const halfD = col.depth / 2;
            
            // Проверка пересечения
            if (x + radius > bx - halfW &&
                x - radius < bx + halfW &&
                z + radius > bz - halfD &&
                z - radius < bz + halfD &&
                y < col.height) {
                return true;
            }
        }
        
        return false;
    },
    
    // ===== ПРОВЕРКА КОЛЛИЗИЙ ТРАНСПОРТА =====
    checkVehicleCollision(x, z, currentVehicle) {
        const col = currentVehicle.userData?.collision;
        if (!col) return false;
        
        const halfW = col.width / 2;
        const halfD = col.depth / 2;
        
        // Проверка со зданиями
        for (const building of GameState.buildings) {
            const bcol = building.userData?.collision;
            if (!bcol) continue;
            
            const bx = building.position.x;
            const bz = building.position.z;
            const bHalfW = bcol.width / 2;
            const bHalfD = bcol.depth / 2;
            
            if (x + halfW > bx - bHalfW &&
                x - halfW < bx + bHalfW &&
                z + halfD > bz - bHalfD &&
                z - halfD < bz + bHalfD) {
                return true;
            }
        }
        
        // Проверка с другими машинами
        for (const vehicle of GameState.vehicles) {
            if (vehicle === currentVehicle) continue;
            
            const vcol = vehicle.userData?.collision;
            if (!vcol) continue;
            
            const vx = vehicle.position.x;
            const vz = vehicle.position.z;
            const vHalfW = vcol.width / 2;
            const vHalfD = vcol.depth / 2;
            
            if (x + halfW > vx - vHalfW &&
                x - halfW < vx + vHalfW &&
                z + halfD > vz - vHalfD &&
                z - halfD < vz + vHalfD) {
                return true;
            }
        }
        
        return false;
    },
    
    // ===== ПРОВЕРКА ИНТЕРАКТИВНЫХ ОБЪЕКТОВ =====
    checkInteractables() {
        let nearest = null;
        let minDist = 5;
        
        const playerPos = GameState.player.position;
        
        // Проверка интерактивных объектов
        for (const obj of GameState.interactables) {
            const dist = Utils.distance(playerPos, obj.position);
            if (dist < minDist && obj.userData?.interactable) {
                minDist = dist;
                nearest = obj;
            }
        }
        
        // Проверка машин (если не в машине)
        if (!GameState.currentVehicle) {
            for (const vehicle of GameState.vehicles) {
                const dist = Utils.distance(playerPos, vehicle.position);
                if (dist < 4 && dist < minDist) {
                    minDist = dist;
                    nearest = {
                        userData: {
                            interactable: {
                                prompt: 'Нажмите <span class="key">F</span> чтобы сесть в машину'
                            }
                        },
                        position: vehicle.position
                    };
                }
            }
        }
        
        GameState.nearbyInteractable = nearest;
        
        // Обновление UI подсказки
        const prompt = document.getElementById('interaction-prompt');
        if (nearest && nearest.userData?.interactable && !GameState.currentDialog) {
            prompt.innerHTML = nearest.userData.interactable.prompt;
            prompt.style.display = 'block';
        } else {
            prompt.style.display = 'none';
        }
    }
};

// ===== МЕНЕДЖЕР NPC =====
const NPCManager = {
    update(delta) {
        const playerPos = GameState.player.position;
        
        for (const npc of GameState.npcs) {
            NPCFactory.updateNPC(npc, delta, playerPos);
        }
    }
};

// ===== МЕНЕДЖЕР ВРЕМЕНИ =====
const TimeManager = {
    update(delta) {
        // Время суток
        GameState.gameTime += delta * (24 * 60 / CONFIG.dayLength);
        if (GameState.gameTime >= 24 * 60) GameState.gameTime = 0;
        
        // Освещение
        const hour = GameState.gameTime / 60;
        let sunIntensity;
        let ambientIntensity;
        let skyColor;
        
        if (hour >= 6 && hour < 8) {
            // Рассвет
            const t = (hour - 6) / 2;
            sunIntensity = Utils.lerp(0.1, 0.8, t);
            ambientIntensity = Utils.lerp(0.2, 0.5, t);
            skyColor = Utils.mixColors(COLORS.skyNight, COLORS.skySunset, t);
        } else if (hour >= 8 && hour < 18) {
            // День
            sunIntensity = 0.8;
            ambientIntensity = 0.5;
            skyColor = COLORS.skyDay;
        } else if (hour >= 18 && hour < 20) {
            // Закат
            const t = (hour - 18) / 2;
            sunIntensity = Utils.lerp(0.8, 0.3, t);
            ambientIntensity = Utils.lerp(0.5, 0.3, t);
            skyColor = Utils.mixColors(COLORS.skyDay, COLORS.skySunset, t);
        } else if (hour >= 20 && hour < 22) {
            // Сумерки
            const t = (hour - 20) / 2;
            sunIntensity = Utils.lerp(0.3, 0.1, t);
            ambientIntensity = Utils.lerp(0.3, 0.2, t);
            skyColor = Utils.mixColors(COLORS.skySunset, COLORS.skyNight, t);
        } else {
            // Ночь
            sunIntensity = 0.1;
            ambientIntensity = 0.2;
            skyColor = COLORS.skyNight;
        }
        
        // Обновление сцены
        const sun = GameState.scene.children.find(c => c instanceof THREE.DirectionalLight);
        if (sun) {
            sun.intensity = sunIntensity;
        }
        
        const ambient = GameState.scene.children.find(c => c instanceof THREE.AmbientLight);
        if (ambient) {
            ambient.intensity = ambientIntensity;
        }
        
        GameState.scene.background = new THREE.Color(skyColor);
        GameState.scene.fog.color = new THREE.Color(skyColor);
        
        // Погода
        this.updateWeather();
    },
    
    updateWeather() {
        // Простая система погоды (можно расширить)
        const weatherElement = document.getElementById('weather');
        const hour = GameState.gameTime / 60;
        
        if (hour >= 6 && hour < 20) {
            weatherElement.textContent = 'Ясно ☀️';
        } else {
            weatherElement.textContent = 'Ясно 🌙';
        }
    }
};