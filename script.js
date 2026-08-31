// floating petals
  const petalsContainer = document.getElementById('petals');
  const petalCount = 14;
  const petalSVG = `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 2C10 8 6 12 6 18a10 10 0 0020 0c0-6-4-10-10-16z" fill="#9c2b44" opacity="0.7"/>
  </svg>`;

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

  // envelope open interaction
  const envelope = document.getElementById('envelope');
  const envelopeLink = document.getElementById('envelopeLink');
  const letterSection = document.getElementById('letterSection');
  const hint = document.getElementById('hint');

  function openLetter(e){
    if(e) e.preventDefault();
    if(envelope.classList.contains('open')){
      letterSection.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    envelope.classList.add('open');
    hint.style.opacity = '0';
    letterSection.classList.add('visible');
    setTimeout(() => {
      letterSection.scrollIntoView({ behavior: 'smooth' });
    }, 950);
  }

  envelopeLink.addEventListener('click', openLetter);
  envelopeLink.addEventListener('touchend', openLetter, { passive: false });

  // rosary: generate the loop beads (5 decades of 10 Ave Marias, split by 4 Pai Nosso beads)
  const loopBeadsGroup = document.getElementById('loopBeads');
  if(loopBeadsGroup){
    const rx = 80, ry = 115, cx = 100, cy = 170;
    // boundaries: gap at the bottom for the medal, then 4 Pai Nosso beads dividing 5 decades
    const boundaries = [190, 258, 326, 394, 462, 530];
    const svgNS = 'http://www.w3.org/2000/svg';
    const pointAt = (deg) => {
      const rad = deg * Math.PI / 180;
      return { x: cx + rx * Math.sin(rad), y: cy - ry * Math.cos(rad) };
    };
    const addBead = (deg, r, cls) => {
      const { x, y } = pointAt(deg);
      const circle = document.createElementNS(svgNS, 'circle');
      circle.setAttribute('cx', x.toFixed(1));
      circle.setAttribute('cy', y.toFixed(1));
      circle.setAttribute('r', r);
      circle.setAttribute('class', cls);
      loopBeadsGroup.appendChild(circle);
    };
    for(let seg = 0; seg < 5; seg++){
      const a0 = boundaries[seg], a1 = boundaries[seg + 1];
      for(let k = 1; k <= 10; k++){
        addBead(a0 + (a1 - a0) * (k / 11), 4.2, 'bead');
      }
      if(seg < 4){ addBead(boundaries[seg + 1], 7.5, 'bead-alt'); }
    }
  }

  // rosary: drag to swing
  const rosary = document.getElementById('rosary');
  const rosaryGroup = document.getElementById('rosaryGroup');
  if(rosary && rosaryGroup){
    let dragging = false;
    let startX = 0;

    const onDown = (e) => {
      dragging = true;
      rosary.classList.add('dragging');
      startX = e.clientX;
      rosary.setPointerCapture && e.pointerId != null && rosary.setPointerCapture(e.pointerId);
    };
    const onMove = (e) => {
      if(!dragging) return;
      const dx = e.clientX - startX;
      const rot = Math.max(-35, Math.min(35, dx / 4));
      rosaryGroup.style.transform = `rotate(${rot}deg)`;
    };
    const onUp = () => {
      if(!dragging) return;
      dragging = false;
      rosary.classList.remove('dragging');
      rosaryGroup.style.transform = 'rotate(0deg)';
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
    let anyVisible = false;
    entries.forEach(entry => {
      const idx = chapterSections.indexOf(entry.target);
      if(entry.isIntersecting){
        anyVisible = true;
        dots.forEach(d => d.classList.remove('active'));
        if(dots[idx]) dots[idx].classList.add('active');
      }
    });
  }, { threshold: 0.5 });

  chapterSections.forEach(sec => { if(sec) navObserver.observe(sec); });

  // show nav once the letter has been opened / scrolled to
  const showNavObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting || entry.boundingClientRect.top < window.innerHeight){
        chapterNav.classList.add('show');
      }
    });
  }, { threshold: 0.1 });
  showNavObserver.observe(document.getElementById('letterSection'));
