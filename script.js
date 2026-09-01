// respect the user's motion preference throughout
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 
  // ---------------------------------------------------------------------
  // little hearts burst — reused by the rosary, the memory game and jogo da velha
  // ---------------------------------------------------------------------
  const heartBurstLayer = document.getElementById('heartBurst');
  function burstHearts(originX, originY, count = 16){
    if(!heartBurstLayer || prefersReducedMotion) return;
    for(let i = 0; i < count; i++){
      const heart = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      heart.setAttribute('viewBox', '0 0 24 24');
      heart.setAttribute('class', 'heart-particle');
      heart.innerHTML = '<path d="M12 21s-7.5-4.6-10-9.1C.6 8.6 2 5 5.4 4.2 8 3.6 10 5 12 7.5 14 5 16 3.6 18.6 4.2 22 5 23.4 8.6 22 11.9 19.5 16.4 12 21 12 21z"/>';
      const size = 10 + Math.random() * 14;
      const angle = Math.random() * Math.PI * 2;
      const dist = 60 + Math.random() * 120;
      heart.style.width = size + 'px';
      heart.style.height = size + 'px';
      heart.style.left = originX + 'px';
      heart.style.top = originY + 'px';
      heart.style.setProperty('--dx', (Math.cos(angle) * dist) + 'px');
      heart.style.setProperty('--dy', (Math.sin(angle) * dist - 40) + 'px');
      heart.style.setProperty('--rot', (Math.random() * 360 - 180) + 'deg');
      heart.style.animationDelay = (Math.random() * 0.15) + 's';
      heartBurstLayer.appendChild(heart);
      setTimeout(() => heart.remove(), 1900);
    }
  }
 
  // split the hero name into per-letter spans for a staggered rise-in
  const nameEl = document.querySelector('h1.name');
  if(nameEl){
    const text = nameEl.textContent;
    nameEl.textContent = '';
    let letterIndex = 0;
    text.split('').forEach((char) => {
      const span = document.createElement('span');
      span.className = 'name-letter' + (char === ' ' ? ' is-space' : '');
      span.textContent = char === ' ' ? '\u00A0' : char;
      if(char !== ' '){
        span.style.setProperty('--i', letterIndex);
        letterIndex++;
      }
      nameEl.appendChild(span);
    });
  }
 
  // gentle parallax drift on the background glow, tied to scroll position
  const glowEl = document.getElementById('glow');
  const scrollFill = document.getElementById('scrollFill');
  if(!prefersReducedMotion){
    let ticking = false;
    window.addEventListener('scroll', () => {
      if(!ticking){
        window.requestAnimationFrame(() => {
          document.documentElement.style.setProperty('--scrollY', window.scrollY);
          const max = document.documentElement.scrollHeight - window.innerHeight;
          const pct = max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0;
          if(scrollFill) scrollFill.style.width = pct + '%';
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  } else if(scrollFill){
    // still keep the progress bar working, just without the smoothing tied to rAF
    window.addEventListener('scroll', () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0;
      scrollFill.style.width = pct + '%';
    }, { passive: true });
  }
 
  // soft gold sparkle trail + spotlight following the cursor (desktop / fine-pointer only)
  const spotlightEl = document.getElementById('spotlight');
  if(!prefersReducedMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches){
    let lastSpark = 0;
    window.addEventListener('pointermove', (e) => {
      if(spotlightEl){
        spotlightEl.style.setProperty('--mx', e.clientX + 'px');
        spotlightEl.style.setProperty('--my', e.clientY + 'px');
        spotlightEl.classList.add('active');
      }
      const now = performance.now();
      if(now - lastSpark < 70) return;
      lastSpark = now;
      const spark = document.createElement('div');
      spark.className = 'cursor-spark';
      spark.style.left = e.clientX + (Math.random() * 6 - 3) + 'px';
      spark.style.top = e.clientY + (Math.random() * 6 - 3) + 'px';
      document.body.appendChild(spark);
      setTimeout(() => spark.remove(), 950);
    }, { passive: true });
    window.addEventListener('pointerleave', () => {
      if(spotlightEl) spotlightEl.classList.remove('active');
    });
  }
 
  // draw the gold underline beneath section titles once they enter view
  const titleEls = document.querySelectorAll('.page-title');
  if(titleEls.length){
    const titleObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          entry.target.classList.add('title-in');
        }
      });
    }, { threshold: 0.5 });
    titleEls.forEach(el => titleObserver.observe(el));
  }
 
  // floating petals
  const petalsContainer = document.getElementById('petals');
  const petalCount = 14;
  const petalSVG = `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 2C10 8 6 12 6 18a10 10 0 0020 0c0-6-4-10-10-16z" fill="#9c2b44" opacity="0.7"/>
  </svg>`;
 
  if(petalsContainer){
    for(let i=0;i<petalCount;i++){
      const p = document.createElement('div');
      p.className = 'petal';
      p.innerHTML = petalSVG;
      const size = 10 + Math.random()*16;
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      p.style.left = Math.random()*100 + 'vw';
      p.style.animationDuration = (12 + Math.random()*14) + 's';
      p.style.animationDelay = (Math.random()*-20) + 's';
      petalsContainer.appendChild(p);
    }
  }
 
  // envelope open interaction
  const envelope = document.getElementById('envelope');
  const envelopeLink = document.getElementById('envelopeLink');
  const letterSection = document.getElementById('letterSection');
  const hint = document.getElementById('hint');
  const seal = envelope ? envelope.querySelector('.seal') : null;
 
  function openLetter(e){
    if(e) e.preventDefault();
    if(envelope.classList.contains('open')){
      letterSection.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    hint.style.opacity = '0';
 
    const proceed = () => {
      envelope.classList.add('open');
      letterSection.classList.add('visible');
      setTimeout(() => {
        letterSection.scrollIntoView({ behavior: 'smooth' });
      }, 950);
    };
 
    if(seal && !prefersReducedMotion){
      seal.classList.add('cracking');
      setTimeout(proceed, 220);
    } else {
      proceed();
    }
  }
 
  if(envelopeLink){
    envelopeLink.addEventListener('click', openLetter);
    envelopeLink.addEventListener('touchend', openLetter, { passive: false });
  }
 
  // -----------------------------------------------------------------------
  // TERÇO VIRTUAL — toque em qualquer conta para rezar aquele passo.
  // A sequência segue a ordem real de um terço: Sinal da Cruz, Credo,
  // Pai Nosso, 3 Ave Marias, Glória, a intenção na medalha e as 5 dezenas.
  // -----------------------------------------------------------------------
  const rosary = document.getElementById('rosary');
  const rosaryGroup = document.getElementById('rosaryGroup');
  const loopBeadsGroup = document.getElementById('loopBeads');
  const prayerCard = document.getElementById('prayerCard');
  const prayerStepEl = document.getElementById('prayerStep');
  const prayerTitleEl = document.getElementById('prayerTitle');
  const prayerTextEl = document.getElementById('prayerText');
  const prayerProgressFill = document.getElementById('prayerProgressFill');
  const prayerReset = document.getElementById('prayerReset');
  const rosaryCaption = document.getElementById('rosaryCaption');
 
  const PRAYERS = {
    cross: {
      step: 'Sinal da Cruz e Credo',
      title: 'Em nome do Pai',
      text: 'Em nome do Pai, do Filho e do Espírito Santo. Amém. Creio em Deus Pai todo-poderoso, criador do céu e da terra, e em Jesus Cristo, seu único Filho, nosso Senhor.'
    },
    'pai-nosso': {
      step: 'Pai Nosso',
      title: 'Pai Nosso',
      text: 'Pai Nosso que estais no céu, santificado seja o Vosso nome, venha a nós o Vosso reino, seja feita a Vossa vontade, assim na terra como no céu. O pão nosso de cada dia nos dai hoje, perdoai as nossas ofensas, assim como nós perdoamos a quem nos tem ofendido, e não nos deixeis cair em tentação, mas livrai-nos do mal. Amém.'
    },
    'ave-maria': {
      step: 'Ave Maria',
      title: 'Ave Maria',
      text: 'Ave Maria, cheia de graça, o Senhor é convosco, bendita sois vós entre as mulheres e bendito é o fruto do vosso ventre, Jesus. Santa Maria, Mãe de Deus, rogai por nós pecadores, agora e na hora da nossa morte. Amém.'
    },
    gloria: {
      step: 'Glória ao Pai',
      title: 'Glória',
      text: 'Glória ao Pai, ao Filho e ao Espírito Santo. Como era no princípio, agora e sempre. Amém.'
    },
    intention: {
      step: 'Minha intenção',
      title: 'Por nós dois',
      text: 'Aqui, na medalha, eu guardo uma intenção: que a gente continue se escolhendo todos os dias, que os caminhos sejam leves e que esse amor só cresça. Por você, Eduarda.'
    }
  };
 
  const AVE_INTENTIONS = ['pela Fé', 'pela Esperança', 'pela Caridade'];
 
  // build the prayer sequence in the exact order it should be prayed: cross,
  // opening prayers, the medal intention, then 5 decades around the loop —
  // each decade = 1 Pai Nosso (except the 1st) + 10 Ave Marias (the last
  // of which also carries the Glória).
  const prayerSequence = [];
 
  function makeStepFromBead(el, base, extra){
    const data = Object.assign({}, PRAYERS[base]);
    if(extra) Object.assign(data, extra);
    return { el, data };
  }
 
  const crossBead = document.getElementById('crossBead');
  if(crossBead) prayerSequence.push(makeStepFromBead(crossBead, 'cross'));
 
  ['tail-0', 'tail-1', 'tail-2', 'tail-3', 'tail-4'].forEach((idx, i) => {
    const el = document.querySelector(`.rosary-bead[data-idx="${idx}"]`);
    if(!el) return;
    if(i === 0){
      prayerSequence.push(makeStepFromBead(el, 'pai-nosso'));
    } else if(i === 4){
      prayerSequence.push(makeStepFromBead(el, 'gloria'));
    } else {
      const n = i; // 1,2,3
      prayerSequence.push(makeStepFromBead(el, 'ave-maria', {
        step: `${n}ª Ave Maria`,
        text: `Ave Maria, cheia de graça, o Senhor é convosco, bendita sois vós entre as mulheres. (${AVE_INTENTIONS[n-1]})`
      }));
    }
  });
 
  const medalBead = document.getElementById('medalBead');
  if(medalBead) prayerSequence.push(makeStepFromBead(medalBead, 'intention'));
 
  if(loopBeadsGroup){
    const rx = 80, ry = 115, cx = 100, cy = 170;
    const boundaries = [190, 258, 326, 394, 462, 530];
    const svgNS = 'http://www.w3.org/2000/svg';
    const pointAt = (deg) => {
      const rad = deg * Math.PI / 180;
      return { x: cx + rx * Math.sin(rad), y: cy - ry * Math.cos(rad) };
    };
    const addBead = (deg, r, cls, dataAttrs) => {
      const { x, y } = pointAt(deg);
      const circle = document.createElementNS(svgNS, 'circle');
      circle.setAttribute('cx', x.toFixed(1));
      circle.setAttribute('cy', y.toFixed(1));
      circle.setAttribute('r', r);
      circle.setAttribute('class', cls + ' rosary-bead');
      circle.setAttribute('tabindex', '0');
      circle.setAttribute('role', 'button');
      Object.keys(dataAttrs || {}).forEach(k => circle.setAttribute('data-' + k, dataAttrs[k]));
      loopBeadsGroup.appendChild(circle);
      return circle;
    };
    for(let seg = 0; seg < 5; seg++){
      const a0 = boundaries[seg], a1 = boundaries[seg + 1];
      const decadeNumber = seg + 1;
      for(let k = 1; k <= 10; k++){
        const deg = a0 + (a1 - a0) * (k / 11);
        const isLast = k === 10;
        const el = addBead(deg, 4.2, 'bead', { role: 'ave-maria', decade: decadeNumber, k });
        el.setAttribute('aria-label', `${decadeNumber}ª dezena — Ave Maria ${k} de 10`);
        if(isLast){
          prayerSequence.push({ el, data: {
            step: `${decadeNumber}ª dezena — Ave Maria 10 de 10`,
            title: 'Ave Maria + Glória',
            text: `Ave Maria, cheia de graça, o Senhor é convosco... E, ao fechar a ${decadeNumber}ª dezena: Glória ao Pai, ao Filho e ao Espírito Santo.`
          }});
        } else {
          prayerSequence.push({ el, data: {
            step: `${decadeNumber}ª dezena — Ave Maria ${k} de 10`,
            title: 'Ave Maria',
            text: 'Ave Maria, cheia de graça, o Senhor é convosco, bendita sois vós entre as mulheres e bendito é o fruto do vosso ventre, Jesus.'
          }});
        }
      }
      if(seg < 4){
        const nextDecade = decadeNumber + 1;
        const el = addBead(boundaries[seg + 1], 7.5, 'bead-alt', { role: 'pai-nosso', decade: nextDecade });
        el.setAttribute('aria-label', `Pai Nosso — antes da ${nextDecade}ª dezena`);
        prayerSequence.push({ el, data: {
          step: `Pai Nosso — antes da ${nextDecade}ª dezena`,
          title: 'Pai Nosso',
          text: PRAYERS['pai-nosso'].text
        }});
      }
    }
  }
 
  let currentStepIndex = -1;
  let completed = false;
 
  function setBeadVisualState(){
    prayerSequence.forEach((s, i) => {
      s.el.classList.remove('current', 'prayed');
      if(i < currentStepIndex) s.el.classList.add('prayed');
      if(i === currentStepIndex) s.el.classList.add('current');
    });
  }
 
  function showStep(index){
    if(index < 0 || index >= prayerSequence.length) return;
    currentStepIndex = index;
    const { data } = prayerSequence[index];
    setBeadVisualState();
    if(prayerCard){
      prayerCard.classList.remove('pulse');
      void prayerCard.offsetWidth; // restart animation
      prayerCard.classList.add('pulse');
    }
    if(prayerStepEl) prayerStepEl.textContent = data.step;
    if(prayerTitleEl) prayerTitleEl.textContent = data.title;
    if(prayerTextEl) prayerTextEl.textContent = data.text;
    const pct = ((index + 1) / prayerSequence.length) * 100;
    if(prayerProgressFill) prayerProgressFill.style.width = pct + '%';
 
    if(index === prayerSequence.length - 1 && !completed){
      completed = true;
      setTimeout(() => {
        if(prayerStepEl) prayerStepEl.textContent = 'Terço completo 💛';
        if(prayerTitleEl) prayerTitleEl.textContent = 'Salve Rainha';
        if(prayerTextEl) prayerTextEl.textContent = 'Salve Rainha, Mãe de misericórdia, vida, doçura e esperança nossa, salve. E, no fim, um obrigado: por cada Ave Maria que eu rezei pensando em nós, Eduarda. Que esse terço proteja o nosso caminho.';
        if(rosaryCaption) rosaryCaption.textContent = 'você rezou o terço todo — toque numa conta pra rever qualquer passo.';
        if(rosary){
          const rect = rosary.getBoundingClientRect();
          burstHearts(rect.left + rect.width / 2, rect.top + rect.height / 2, 22);
        }
      }, 1400);
    }
  }
 
  if(prayerSequence.length){
    prayerSequence.forEach((s, i) => {
      const activate = (e) => {
        if(e){ e.preventDefault(); e.stopPropagation(); }
        showStep(i);
      };
      s.el.addEventListener('click', (e) => {
        if(rosary && rosary.dataset.wasDragged === '1') return; // ignore click that ends a swing-drag
        activate(e);
      });
      s.el.addEventListener('keydown', (e) => {
        if(e.key === 'Enter' || e.key === ' '){ activate(e); }
      });
    });
  }
 
  if(prayerReset){
    prayerReset.addEventListener('click', () => {
      currentStepIndex = -1;
      completed = false;
      setBeadVisualState();
      if(prayerStepEl) prayerStepEl.textContent = 'toque na cruz para começar';
      if(prayerTitleEl) prayerTitleEl.textContent = 'Terço por nós dois';
      if(prayerTextEl) prayerTextEl.textContent = 'Cada vez que você quiser, toque numa conta do terço e reze comigo — uma intenção por nós, Eduarda.';
      if(prayerProgressFill) prayerProgressFill.style.width = '0%';
      if(rosaryCaption) rosaryCaption.textContent = 'Toque em cada conta pra rezar — arraste pra ele balançar.';
    });
  }
 
  // rosary: drag to swing (kept from the original), with a flag so a
  // drag-release doesn't also fire a bead's click and skip a prayer step
  if(rosary && rosaryGroup){
    let dragging = false;
    let startX = 0;
    let moved = 0;
 
    const onDown = (e) => {
      dragging = true;
      moved = 0;
      rosary.dataset.wasDragged = '0';
      rosary.classList.add('dragging');
      startX = e.clientX;
      rosary.setPointerCapture && e.pointerId != null && rosary.setPointerCapture(e.pointerId);
    };
    const onMove = (e) => {
      if(!dragging) return;
      const dx = e.clientX - startX;
      moved = Math.max(moved, Math.abs(dx));
      if(moved > 6){ rosary.dataset.wasDragged = '1'; }
      const rot = Math.max(-35, Math.min(35, dx / 4));
      rosaryGroup.style.transform = `rotate(${rot}deg)`;
    };
    const onUp = () => {
      if(!dragging) return;
      dragging = false;
      rosary.classList.remove('dragging');
      rosaryGroup.style.transform = 'rotate(0deg)';
      // clear the drag flag a tick later so the resulting click on a bead (if any) is still suppressed
      setTimeout(() => { rosary.dataset.wasDragged = '0'; }, 50);
    };
 
    rosary.addEventListener('pointerdown', onDown);
    rosary.addEventListener('pointermove', onMove);
    rosary.addEventListener('pointerup', onUp);
    rosary.addEventListener('pointerleave', onUp);
    rosary.addEventListener('pointercancel', onUp);
  }
 
  // memory game
  const memoryGrid = document.getElementById('memoryGrid');
  const gameStatus = document.getElementById('gameStatus');
  const gameReset = document.getElementById('gameReset');
  if(memoryGrid){
    const symbols = ['✉️','📿','🎵','💍','🌹','⭐'];
    let deck = [], firstCard = null, lock = false, moves = 0, matches = 0;
 
    function shuffle(arr){
      for(let i = arr.length - 1; i > 0; i--){
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    }
 
    function buildGame(){
      memoryGrid.innerHTML = '';
      deck = shuffle([...symbols, ...symbols]);
      firstCard = null; lock = false; moves = 0; matches = 0;
      gameStatus.textContent = 'tentativas: 0';
      deck.forEach((symbol) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.symbol = symbol;
        card.innerHTML = `
          <div class="memory-card-inner">
            <div class="memory-card-face memory-card-back">♡</div>
            <div class="memory-card-face memory-card-front">${symbol}</div>
          </div>`;
        card.addEventListener('click', () => onCardClick(card));
        memoryGrid.appendChild(card);
      });
    }
 
    function onCardClick(card){
      if(lock || card.classList.contains('flipped') || card.classList.contains('matched')) return;
      card.classList.add('flipped');
      if(!firstCard){
        firstCard = card;
        return;
      }
      moves++;
      gameStatus.textContent = `tentativas: ${moves}`;
      if(firstCard.dataset.symbol === card.dataset.symbol){
        firstCard.classList.add('matched');
        card.classList.add('matched');
        firstCard = null;
        matches++;
        if(matches === symbols.length){
          setTimeout(() => {
            gameStatus.textContent = 'você achou todos os pares! 💛 te amo.';
            const rect = memoryGrid.getBoundingClientRect();
            burstHearts(rect.left + rect.width / 2, rect.top + rect.height / 2, 18);
          }, 400);
        }
      } else {
        lock = true;
        const wrongFirst = firstCard, wrongSecond = card;
        setTimeout(() => {
          wrongFirst.classList.remove('flipped');
          wrongSecond.classList.remove('flipped');
          firstCard = null;
          lock = false;
        }, 800);
      }
    }
 
    gameReset.addEventListener('click', buildGame);
    buildGame();
  }
 
  // tic-tac-toe
  const tictacGrid = document.getElementById('tictacGrid');
  const tictacStatus = document.getElementById('tictacStatus');
  const tictacReset = document.getElementById('tictacReset');
  if(tictacGrid){
    const PLAYERS = ['❤️', '✦'];
    const WIN_LINES = [
      [0,1,2],[3,4,5],[6,7,8],
      [0,3,6],[1,4,7],[2,5,8],
      [0,4,8],[2,4,6]
    ];
    let board = [], turn = 0, finished = false;
 
    function buildBoard(){
      board = Array(9).fill(null);
      turn = 0; finished = false;
      tictacStatus.textContent = `vez do ${PLAYERS[turn]}`;
      tictacGrid.innerHTML = '';
      for(let i = 0; i < 9; i++){
        const cell = document.createElement('div');
        cell.className = 'tictac-cell';
        cell.dataset.index = i;
        cell.addEventListener('click', () => onCellClick(cell, i));
        tictacGrid.appendChild(cell);
      }
    }
 
    function checkWinner(){
      for(const line of WIN_LINES){
        const [a,b,c] = line;
        if(board[a] && board[a] === board[b] && board[a] === board[c]){
          return line;
        }
      }
      return null;
    }
 
    function onCellClick(cell, i){
      if(finished || board[i]) return;
      board[i] = PLAYERS[turn];
      cell.textContent = PLAYERS[turn];
      cell.classList.add('taken');
 
      const winLine = checkWinner();
      if(winLine){
        finished = true;
        winLine.forEach(idx => tictacGrid.children[idx].classList.add('win'));
        tictacStatus.textContent = `${PLAYERS[turn]} venceu essa rodada!`;
        const rect = tictacGrid.getBoundingClientRect();
        burstHearts(rect.left + rect.width / 2, rect.top + rect.height / 2, 16);
        return;
      }
      if(board.every(v => v)){
        finished = true;
        tictacStatus.textContent = 'empate! bora desempatar com um beijo 😘';
        return;
      }
      turn = 1 - turn;
      tictacStatus.textContent = `vez do ${PLAYERS[turn]}`;
    }
 
    tictacReset.addEventListener('click', buildBoard);
    buildBoard();
  }
 
  // música: botão de play/pause dentro da seção (agora tocando "Salvatore")
  const bgMusic = document.getElementById('bgMusic');
  const musicBtn = document.getElementById('musicPlayBtn');
  const playIcon = document.getElementById('playIcon');
  const pauseIcon = document.getElementById('pauseIcon');
  const vinyl = document.getElementById('vinyl');
  const tonearm = document.getElementById('tonearm');
 
  if(bgMusic && musicBtn){
    bgMusic.volume = 0.6; // ajuste o volume aqui (0 a 1)
 
    musicBtn.addEventListener('click', () => {
      if(bgMusic.paused){
        bgMusic.play().catch((err) => {
          console.log('Não foi possível tocar a música:', err);
        });
      } else {
        bgMusic.pause();
      }
    });
 
    bgMusic.addEventListener('play', () => {
      playIcon.style.display = 'none';
      pauseIcon.style.display = 'block';
      musicBtn.classList.add('playing');
      if(vinyl){ vinyl.classList.add('spinning'); }
      if(tonearm){ tonearm.classList.add('playing'); }
    });
 
    bgMusic.addEventListener('pause', () => {
      playIcon.style.display = 'block';
      pauseIcon.style.display = 'none';
      musicBtn.classList.remove('playing');
      if(vinyl){ vinyl.classList.remove('spinning'); }
      if(tonearm){ tonearm.classList.remove('playing'); }
    });
  }
 
  // reveal new sections on scroll
  const revealEls = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('in');
      }
    });
  }, { threshold: 0.3 });
  revealEls.forEach(el => observer.observe(el));
 
  // chapter navigation
  const chapterNav = document.getElementById('chapterNav');
  const dots = Array.from(document.querySelectorAll('.chapter-dot'));
  const chapterSections = dots.map(d => document.getElementById(d.dataset.target));
 
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const target = document.getElementById(dot.dataset.target);
      if(target){
        if(target.id === 'letterSection'){ openLetter(); }
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
 
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const idx = chapterSections.indexOf(entry.target);
      if(entry.isIntersecting){
        dots.forEach(d => d.classList.remove('active'));
        if(dots[idx]) dots[idx].classList.add('active');
      }
    });
  }, { threshold: 0.5 });
 
  chapterSections.forEach(sec => { if(sec) navObserver.observe(sec); });
 
  // show nav once the letter has been opened / scrolled to
  if(letterSection){
    const showNavObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(entry.isIntersecting || entry.boundingClientRect.top < window.innerHeight){
          chapterNav.classList.add('show');
        }
      });
    }, { threshold: 0.1 });
    showNavObserver.observe(letterSection);
  }
 








  // -----------------------------------------------------------------------
  // JOGO DO SUSHI — módulo independente, sem compartilhar estado com os demais jogos
  // -----------------------------------------------------------------------
  const sushiIngredientsEl = document.getElementById('sushiIngredients');
  const sushiPlateEl = document.getElementById('sushiPlate');
  const sushiStatusEl = document.getElementById('sushiStatus');
  const sushiResetEl = document.getElementById('sushiReset');

  if(sushiIngredientsEl && sushiPlateEl && sushiStatusEl){
    const sushiPieces = [
      { kind:'arroz', label:'arroz', icon:'🍚' },
      { kind:'salmão', label:'salmão', icon:'🍣' },
      { kind:'abacate', label:'abacate', icon:'🥑' },
      { kind:'nori', label:'nori', icon:'🌿' }
    ];
    let sushiStep = 0;

    function shuffleSushi(items){
      return [...items].sort(() => Math.random() - .5);
    }

    function buildSushiGame(){
      sushiStep = 0;
      sushiPlateEl.innerHTML = '';
      sushiPlateEl.classList.remove('complete');
      sushiIngredientsEl.innerHTML = '';
      sushiStatusEl.textContent = 'toque nos ingredientes para começar';

      shuffleSushi(sushiPieces).forEach(piece => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'sushi-ingredient';
        button.dataset.kind = piece.kind;
        button.textContent = `${piece.icon} ${piece.label}`;
        button.addEventListener('click', () => chooseSushiIngredient(button, piece));
        sushiIngredientsEl.appendChild(button);
      });
    }

    function chooseSushiIngredient(button, piece){
      if(button.disabled) return;
      const expected = sushiPieces[sushiStep];
      if(piece.kind !== expected.kind){
        sushiStatusEl.textContent = `quase! primeiro coloque ${expected.label}.`;
        sushiPlateEl.animate([{transform:'translateX(-5px)'},{transform:'translateX(5px)'},{transform:'translateX(0)'}], {duration:220});
        return;
      }

      button.disabled = true;
      const placed = document.createElement('div');
      placed.className = 'sushi-piece';
      placed.dataset.kind = piece.kind;
      placed.title = piece.label;
      sushiPlateEl.appendChild(placed);
      sushiStep++;

      if(sushiStep === sushiPieces.length){
        sushiPlateEl.classList.add('complete');
        sushiStatusEl.textContent = 'combinado perfeito! feito com carinho para vocês dois.';
        if(typeof burstHearts === 'function'){
          const rect = sushiPlateEl.getBoundingClientRect();
          burstHearts(rect.left + rect.width / 2, rect.top + rect.height / 2, 18);
        }
      } else {
        sushiStatusEl.textContent = `isso! agora escolha ${sushiPieces[sushiStep].label}.`;
      }
    }

    if(sushiResetEl) sushiResetEl.addEventListener('click', buildSushiGame);
    buildSushiGame();
  }
