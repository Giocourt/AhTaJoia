document.addEventListener('DOMContentLoaded', () => {
    const soundboardContainer = document.getElementById('soundboard-container');
    const modal = document.getElementById('settings-modal');
    const closeModalBtn = document.querySelector('.close-btn');
    const soundList = document.getElementById('sound-list');
    let currentPadId = null;

    // --- CONFIGURAÇÃO --- 
    // ADICIONE OS NOMES DOS SEUS ARQUIVOS DE ÁUDIO AQUI DENTRO DESTA LISTA:
    const availableSounds = [
        'ah_ta_joia.mp3',
        // Exemplo: 'meu-som.mp3',
    ];

    const totalPads = 6;
    const defaultConfig = Array(totalPads).fill(null);

    let soundConfig = JSON.parse(localStorage.getItem('soundboardConfig')) || defaultConfig;

    if (soundConfig.length !== totalPads) {
        soundConfig = defaultConfig;
    }

    const saveConfig = () => {
        localStorage.setItem('soundboardConfig', JSON.stringify(soundConfig));
    };

    const createPads = () => {
        soundboardContainer.innerHTML = '';
        for (let i = 0; i < totalPads; i++) {
            const pad = document.createElement('div');
            pad.classList.add('sound-pad');
            pad.dataset.id = i;

            const padName = document.createElement('span');
            padName.classList.add('pad-name');

            const audioSrc = soundConfig[i];
            const audio = new Audio(audioSrc || '');
            audio.id = `audio-${i}`;

            const settingsBtn = document.createElement('button');
            settingsBtn.classList.add('icon-btn', 'settings-btn');
            settingsBtn.innerHTML = '<i class="fas fa-cog"></i>';
            settingsBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                openModal(i);
            });
            pad.appendChild(settingsBtn);

            if (audioSrc) {
                let fileName = audioSrc.split('/').pop();
                padName.textContent = fileName.split('.')[0];

                const removeBtn = document.createElement('button');
                removeBtn.classList.add('icon-btn', 'remove-btn');
                removeBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
                removeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    soundConfig[i] = null;
                    saveConfig();
                    createPads();
                });
                pad.appendChild(removeBtn);

            } else {
                padName.textContent = '[Vazio]';
            }

            pad.appendChild(padName);
            pad.appendChild(audio);
            soundboardContainer.appendChild(pad);

            pad.addEventListener('click', () => {
                if (!soundConfig[i]) return;

                const currentAudio = document.getElementById(`audio-${i}`);
                if (!currentAudio.paused) {
                    currentAudio.currentTime = 0;
                }
                pad.classList.add('playing');
                const playPromise = currentAudio.play();
                if (playPromise !== undefined) {
                    playPromise.catch(() => pad.classList.remove('playing'))
                               .then(() => {
                                    currentAudio.addEventListener('ended', () => pad.classList.remove('playing'), { once: true });
                               });
                }
            });
        }
    };

    const openModal = (padId) => {
        currentPadId = padId;
        soundList.innerHTML = '';

        availableSounds.forEach(soundFile => {
            const option = document.createElement('div');
            option.classList.add('sound-option');
            option.textContent = soundFile;
            option.dataset.sound = `sounds/${soundFile}`;
            option.addEventListener('click', () => {
                selectSound(option.dataset.sound);
            });
            soundList.appendChild(option);
        });
        modal.style.display = 'block';
    };

    const closeModal = () => {
        modal.style.display = 'none';
        currentPadId = null;
    };

    const selectSound = (soundFile) => {
        if (currentPadId !== null) {
            soundConfig[currentPadId] = soundFile;
            saveConfig();
            createPads();
            closeModal();
        }
    };

    closeModalBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            closeModal();
        }
    });

    createPads();
});