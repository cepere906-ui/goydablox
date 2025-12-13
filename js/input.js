// ============================================================
// ГОЙДАБЛОКС - УПРАВЛЕНИЕ
// ============================================================

const InputManager = {
    // Инициализация
    init() {
        document.addEventListener('keydown', this.onKeyDown.bind(this));
        document.addEventListener('keyup', this.onKeyUp.bind(this));
        document.addEventListener('mousemove', this.onMouseMove.bind(this));
        document.addEventListener('click', this.onClick.bind(this));
        document.addEventListener('pointerlockchange', this.onPointerLockChange.bind(this));
        window.addEventListener('resize', this.onResize.bind(this));
        
        // Предотвращение контекстного меню
        document.addEventListener('contextmenu', (e) => e.preventDefault());
    },
    
    // Нажатие клавиши
    onKeyDown(e) {
        GameState.keys[e.code] = true;
        
        if (!GameState.isPlaying) return;
        
        // Пауза
        if (e.code === 'Escape') {
            if (GameState.currentDialog) {
                DialogSystem.hide();
            } else {
                this.togglePause();
            }
        }
        
        // Взаимодействие
        if (e.code === 'KeyE' && !GameState.currentDialog && !GameState.isPaused) {
            this.interact();
        }
        
        // Вход/выход из машины
        if (e.code === 'KeyF' && !GameState.currentDialog && !GameState.isPaused) {
            this.toggleVehicle();
        }
        
        // Радио в машине
        if (e.code === 'KeyR' && GameState.currentVehicle) {
            NotificationSystem.info('🎵 Радио: Играет "Калинка-Малинка"');
        }
        
        // Клаксон
        if (e.code === 'KeyH' && GameState.currentVehicle) {
            NotificationSystem.info('📢 БИП-БИП!');
        }
    },
    
    // Отпускание клавиши
    onKeyUp(e) {
        GameState.keys[e.code] = false;
    },
    
    // Движение мыши
    onMouseMove(e) {
        if (!document.pointerLockElement || !GameState.isPlaying || GameState.isPaused) return;
        
        const sensitivity = CONFIG.mouseSensitivity * (parseFloat(document.getElementById('mouse-sensitivity')?.value) || 1);
        
        GameState.targetCameraAngleX -= e.movementX * sensitivity;
        GameState.targetCameraAngleY -= e.movementY * sensitivity;
        GameState.targetCameraAngleY = Utils.clamp(
            GameState.targetCameraAngleY,
            CONFIG.cameraMinAngleY,
            CONFIG.cameraMaxAngleY
        );
    },
    
    // Клик мыши
    onClick() {
        if (GameState.isPlaying && !document.pointerLockElement && !GameState.isPaused) {
            document.getElementById('game-container').requestPointerLock();
        }
    },
    
    // Изменение pointer lock
    onPointerLockChange() {
        if (!document.pointerLockElement && GameState.isPlaying && !GameState.isPaused) {
            // Указатель разблокирован - можно показать подсказку
        }
    },
    
    // Изменение размера окна
    onResize() {
        if (!GameState.camera || !GameState.renderer) return;
        GameState.camera.aspect = window.innerWidth / window.innerHeight;
        GameState.camera.updateProjectionMatrix();
        GameState.renderer.setSize(window.innerWidth, window.innerHeight);
    },
    
    // Переключение паузы
    togglePause() {
        GameState.isPaused = !GameState.isPaused;
        document.getElementById('pause-menu').style.display = GameState.isPaused ? 'flex' : 'none';
        
        if (GameState.isPaused) {
            document.exitPointerLock();
        } else {
            document.getElementById('game-container').requestPointerLock();
        }
    },
    
    // Взаимодействие с объектом
    interact() {
        if (GameState.nearbyInteractable) {
            const interactable = GameState.nearbyInteractable.userData?.interactable;
            if (interactable && interactable.action) {
                interactable.action();
            }
        }
    },
    
    // Вход/выход из машины
    toggleVehicle() {
        if (GameState.currentVehicle) {
            this.exitVehicle();
        } else {
            const nearestVehicle = this.findNearestVehicle();
            if (nearestVehicle) {
                this.enterVehicle(nearestVehicle);
            }
        }
    },
    
    // Поиск ближайшей машины
    findNearestVehicle() {
        let nearest = null;
        let minDist = 5;
        
        GameState.vehicles.forEach(vehicle => {
            const dist = Utils.distance(GameState.player.position, vehicle.position);
            if (dist < minDist) {
                minDist = dist;
                nearest = vehicle;
            }
        });
        
        return nearest;
    },
    
    // Вход в машину
    enterVehicle(vehicle) {
        GameState.currentVehicle = vehicle;
        GameState.player.visible = false;
        GameState.vehicleSpeed = 0;
        GameState.vehicleFuel = vehicle.userData.fuel || 100;
        
        document.getElementById('vehicle-hud').style.display = 'block';
        document.getElementById('instructions').textContent = 'WASD - управление | ПРОБЕЛ - тормоз | F - выйти | R - радио | H - сигнал';
        
        const vehicleNames = {
            lada: 'ЛАДА ГРАНТА',
            niva: 'ЛАДА НИВА',
            bus: 'АВТОБУС',
            police: 'ДПС',
            ambulance: 'СКОРАЯ ПОМОЩЬ',
            kamaz: 'КАМАЗ'
        };
        
        const name = vehicleNames[vehicle.userData.vehicleType] || 'АВТОМОБИЛЬ';
        document.querySelector('#vehicle-hud .vehicle-info').innerHTML = 
            `${name} | <span class="key">F</span> - Выйти | <span class="key">R</span> - Радио`;
        
        NotificationSystem.success(`Вы сели в ${name}!`);
        QuestSystem.complete('find_lada');
    },
    
    // Выход из машины
    exitVehicle() {
        if (!GameState.currentVehicle) return;
        
        // Позиционирование игрока рядом с машиной
        const exitOffset = new THREE.Vector3(3, 0, 0);
        exitOffset.applyQuaternion(GameState.currentVehicle.quaternion);
        GameState.player.position.copy(GameState.currentVehicle.position).add(exitOffset);
        GameState.player.position.y = 1;
        
        // Сохраняем топливо
        GameState.currentVehicle.userData.fuel = GameState.vehicleFuel;
        GameState.currentVehicle = null;
        GameState.player.visible = true;
        GameState.vehicleSpeed = 0;
        
        document.getElementById('vehicle-hud').style.display = 'none';
        document.getElementById('instructions').textContent = 
            'WASD - движение | ПРОБЕЛ - прыжок | SHIFT - бег | E - взаимодействие | F - войти/выйти';
        
        NotificationSystem.info('Вы вышли из машины');
    },
    
    // Получить направление движения
    getMovementDirection() {
        const direction = new THREE.Vector3();
        
        if (GameState.keys['KeyW']) direction.z -= 1;
        if (GameState.keys['KeyS']) direction.z += 1;
        if (GameState.keys['KeyA']) direction.x -= 1;
        if (GameState.keys['KeyD']) direction.x += 1;
        
        return direction;
    },
    
    // Проверка бега
    isRunning() {
        return GameState.keys['ShiftLeft'] || GameState.keys['ShiftRight'];
    },
    
    // Проверка прыжка
    isJumping() {
        return GameState.keys['Space'];
    },
    
    // Проверка торможения
    isBraking() {
        return GameState.keys['Space'];
    }
};