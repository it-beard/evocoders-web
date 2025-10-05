document.addEventListener('DOMContentLoaded', function() {
    const battleCityTriggers = document.querySelectorAll('.battle-city');
    const battleCityModal = document.getElementById('battle-city-modal');
    const battleCityClose = document.getElementById('battle-city-close');
    let battleCityGame = null;

    function openBattleCity() {
        battleCityModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        if (!battleCityGame) {
            battleCityGame = new BattleCity('battle-city-game');
            battleCityGame.init();
        } else if (battleCityGame.isPaused && !battleCityGame.isGameOver && !battleCityGame.isVictory) {
            battleCityGame.render();
            battleCityGame.drawPauseScreen();
        }
    }

    function closeBattleCity() {
        battleCityModal.classList.remove('active');
        document.body.style.overflow = '';
        // Do not auto-save mid-level state; simply hide modal
    }

    battleCityTriggers.forEach(trigger => {
        trigger.addEventListener('click', openBattleCity);
    });

    if (battleCityClose) {
        battleCityClose.addEventListener('click', closeBattleCity);
    }

    if (battleCityModal) {
        battleCityModal.addEventListener('click', (e) => {
            if (e.target === battleCityModal) {
                closeBattleCity();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && battleCityModal.classList.contains('active')) {
                closeBattleCity();
            }
        });
    }
});

