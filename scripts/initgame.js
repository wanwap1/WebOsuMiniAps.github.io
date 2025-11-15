// Код Telegram API теперь находится ВНУТРИ функции require
require(["osu", "underscore", "sound", "playback"],
function(Osu, _, sound, Playback) {

    // ----- НАЧАЛО БЛОКА ИНТЕГРАЦИИ (ИСПРАВЛЕНО) -----
    try {
      if (window.Telegram && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp;
    
        // === 1. ПОЛУЧАЕМ ID ПОЛЬЗОВАТЕЛЯ ===
        if (tg.initDataUnsafe.user) {
            window.telegramUser = tg.initDataUnsafe.user;
            console.log("Telegram User Initialized:", window.telegramUser);
        } else {
            // Запасной вариант для гостя
            window.telegramUser = { id: 0, first_name: "Guest", username: "guest" };
        }
        
        // === 2. СООБЩАЕМ TELEGRAM, ЧТО ВСЕ ГОТОВО ===
        tg.ready();

        // === 3. РАСШИРЯЕМ ОКНО (ДЛЯ ПК) ===
        tg.expand();

        // === 4. СКРЫВАЕМ КНОПКУ "НАЗАД" ===
        tg.BackButton.hide();
        
        console.log("Telegram WebApp API: Ready and expanded.");
    
      } else {
        // Это сработает, если ты откроешь игру в обычном браузере
        console.warn("Telegram WebApp API not found. Running in standard browser mode.");
        // Запасной вариант для гостя при тестировании в браузере
        window.telegramUser = { id: 0, first_name: "Guest", username: "guest" };
      }
    } catch (e) {
        console.error("Telegram API error:", e);
        // Запасной вариант на случай ошибки
        window.telegramUser = { id: 0, first_name: "Guest", username: "guest" };
    }
    // ----- КОНЕЦ БЛОКА ИНТЕГРАЦИИ -----


    // ----- НАЧАЛО ТВОЕГО ОРИГИНАЛЬНОГО КОДА -----
    // check for WebGL
    if (!PIXI || !PIXI.utils.isWebGLSupported())
        alert("WebGL is not supported on your device!")
    window.Osu = Osu;
    window.Playback = Playback;
    // setup compatible audio context
    window.AudioContext = window.AudioContext || window.webkitAudioContext;

    // initialize global game variables
    var game = {
        window: window,
        stage: null,
        scene: null,
        updatePlayerActions: function(){},

        // ... (весь твой код 'game' остается здесь) ...
        
        backgroundDimRate: 0.7,
        backgroundBlurRate: 0.0,
        cursorSize: 1.0,
        showhwmouse: false,
        snakein: true,
        snakeout: true,
        masterVolume: 0.7,
        effectVolume: 1.0,
        musicVolume: 1.0,
        beatmapHitsound: true,
        globalOffset: 0,
        allowMouseButton: false,
        allowMouseScroll: true,
        K1keycode: 90,
        K2keycode: 88,
        ESCkeycode: 27,
        ESC2keycode: 27,
        autoplay: false,
        autopilot: false,
        relax: false,
        nightcore: false,
        daycore: false,
        hardrock: false,
        easy: false,
        hidden: false,
        hideNumbers: false,
        hideGreat: false,
        hideFollowPoints: false,
        mouseX: 0, 
        mouseY: 0,
        mouse: null, 
        K1down: false,
        K2down: false,
        M1down: false,
        M2down: false,
        down: false,
        finished : false,
        sample: [{}, {}, {}, {}],
        sampleSet: 1
    };
    window.currentFrameInterval = 16;
    window.game = game;
    if (window.gamesettings)
        window.gamesettings.loadToGame();
    window.skinReady = false;
    window.soundReady = false;
    window.scriptReady = false;
    game.stage = new PIXI.Container();
    game.cursor = null;


    // load skin & game cursor
    PIXI.Assets.load(['fonts/venera.fnt', 'sprites.json']).then((resources) => {
        window.skinReady = true;
        document.getElementById("skin-progress").classList.add("finished");
        document.body.classList.add("skin-ready");
    
        Skin = resources['sprites.json'].textures; // Maintain the same variable assignment
    });
    


    // load sounds
    // load hitsound set
    var sample = [
        'hitsounds/normal-hitnormal.ogg',
        'hitsounds/normal-hitwhistle.ogg',
        'hitsounds/normal-hitfinish.ogg',
        'hitsounds/normal-hitclap.ogg',
        'hitsounds/normal-slidertick.ogg',
        'hitsounds/soft-hitnormal.ogg',
        'hitsounds/soft-hitwhistle.ogg',
        'hitsounds/soft-hitfinish.ogg',
        'hitsounds/soft-hitclap.ogg',
        'hitsounds/soft-slidertick.ogg',
        'hitsounds/drum-hitnormal.ogg',
        'hitsounds/drum-hitwhistle.ogg',
        'hitsounds/drum-hitfinish.ogg',
        'hitsounds/drum-hitclap.ogg',
        'hitsounds/drum-slidertick.ogg',
        'hitsounds/combobreak.ogg',
    ];
    var issafariBrowser = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    if(issafariBrowser){
        sample = sample.map(path => {
            const pathSplited = path.split('.');
            pathSplited.pop();
            pathSplited.push('wav');
            return pathSplited.join('.');
        })
    }
    sounds.whenLoaded = function(){
        game.sample[1].hitnormal = sounds[sample[0]];
        game.sample[1].hitwhistle = sounds[sample[1]];
        game.sample[1].hitfinish = sounds[sample[2]];
        game.sample[1].hitclap = sounds[sample[3]];
        game.sample[1].slidertick = sounds[sample[4]];
        game.sample[2].hitnormal = sounds[sample[5]];
        game.sample[2].hitwhistle = sounds[sample[6]];
        game.sample[2].hitfinish = sounds[sample[7]];
        game.sample[2].hitclap = sounds[sample[8]];
        game.sample[2].slidertick = sounds[sample[9]];
        game.sample[3].hitnormal = sounds[sample[10]];
        game.sample[3].hitwhistle = sounds[sample[11]];
        game.sample[3].hitfinish = sounds[sample[12]];
        game.sample[3].hitclap = sounds[sample[13]];
        game.sample[3].slidertick = sounds[sample[14]];
        game.sampleComboBreak = sounds[sample[15]];
        window.soundReady = true;
        document.getElementById("sound-progress").classList.add("finished");
        document.body.classList.add("sound-ready");
    };
    sounds.load(sample);


    PIXI.Sprite.prototype.bringToFront = function() {
        if (this.parent) {
            var parent = this.parent;
            parent.removeChild(this);
            parent.addChild(this);
        }
    }

    // load script done
    window.scriptReady = true;
    document.getElementById("script-progress").classList.add("finished");
    document.body.classList.add("script-ready");

    // load play history
    if (window.localforage) {
        localforage.getItem("playhistory1000", function(err, item) {
            if (!err && item && item.length) {
                window.playHistory1000 = item;
            }
        })
    }

    // prevent all drag-related events
    window.addEventListener("drag", function(e){e=e||window.event; e.preventDefault(); e.stopPropagation();});
    window.addEventListener("dragend", function(e){e=e||window.event; e.preventDefault(); e.stopPropagation();});
    window.addEventListener("dragenter", function(e){e=e||window.event; e.preventDefault(); e.stopPropagation();});
    window.addEventListener("dragexit", function(e){e=e||window.event; e.preventDefault(); e.stopPropagation();});
    window.addEventListener("dragleave", function(e){e=e||window.event; e.preventDefault(); e.stopPropagation();});
    window.addEventListener("dragover", function(e){e=e||window.event; e.preventDefault(); e.stopPropagation();});
    window.addEventListener("dragstart", function(e){e=e||window.event; e.preventDefault(); e.stopPropagation();});
    window.addEventListener("drop", function(e){e=e||window.event; e.preventDefault(); e.stopPropagation();});
    
    // === НОВЫЙ БЛОК: ОТОБРАЖЕНИЕ ПРОФИЛЯ ===
    // Эта функция попытается вставить имя пользователя в navbar
    function injectUserProfile() {
        // 1. Убедимся, что данные Telegram загружены
        if (!window.telegramUser) {
            console.warn("User data not ready, retrying...");
            setTimeout(injectUserProfile, 200); // Попробовать снова через 200мс
            return;
        }

        // 2. Найдем, куда вставить имя (взято из navbar.html)
        const navRight = document.querySelector(".nav-buttons-right");

        // 3. Если navbar еще не загрузился (из-за fetch), попробуем снова
        if (!navRight) {
            console.warn("Navbar not ready, retrying...");
            setTimeout(injectUserProfile, 200); // Попробовать снова через 200мс
            return;
        }

        // 4. Создаем и вставляем элемент
        const userName = window.telegramUser.first_name || window.telegramUser.username || "Player";
        const profileElement = document.createElement("a");
        profileElement.className = "pseudo button"; // Используем тот же класс, что и другие кнопки
        profileElement.href = "settings.html"; // Сделаем ссылкой на Настройки
        profileElement.innerText = `👤 ${userName}`;
        
        // Добавляем стили, чтобы он выделялся
        profileElement.style.color = "#FFFFFF"; 
        profileElement.style.fontWeight = "bold";
        profileElement.style.borderBottom = "none"; // Уберем подчеркивание при ховере

        // Добавляем его в начало 'nav-buttons-right'
        navRight.prepend(profileElement);
        console.log(`Profile injected for ${userName}`);
    }

    // Запускаем инжектор
    injectUserProfile();
    // === КОНЕЦ НОВОГО БЛОКА ===

});
// ----- КОНЕЦ ТВОЕГО ОРИГИНАЛЬНОГО КОДА -----
