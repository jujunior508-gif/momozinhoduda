(() => {
  // ../../dev-server/src/site/legacy.ts
  function initLegacySite() {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const heartBurstLayer = document.getElementById("heartBurst");
    function burstHearts(originX, originY, count = 16) {
      if (!heartBurstLayer || prefersReducedMotion)
        return;
      for (let i = 0;i < count; i++) {
        const heart = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        heart.setAttribute("viewBox", "0 0 24 24");
        heart.setAttribute("class", "heart-particle");
        heart.innerHTML = '<path d="M12 21s-7.5-4.6-10-9.1C.6 8.6 2 5 5.4 4.2 8 3.6 10 5 12 7.5 14 5 16 3.6 18.6 4.2 22 5 23.4 8.6 22 11.9 19.5 16.4 12 21 12 21z"/>';
        const size = 10 + Math.random() * 14;
        const angle = Math.random() * Math.PI * 2;
        const dist = 60 + Math.random() * 120;
        heart.style.width = size + "px";
        heart.style.height = size + "px";
        heart.style.left = originX + "px";
        heart.style.top = originY + "px";
        heart.style.setProperty("--dx", Math.cos(angle) * dist + "px");
        heart.style.setProperty("--dy", Math.sin(angle) * dist - 40 + "px");
        heart.style.setProperty("--rot", Math.random() * 360 - 180 + "deg");
        heart.style.animationDelay = Math.random() * 0.15 + "s";
        heartBurstLayer.appendChild(heart);
        setTimeout(() => heart.remove(), 1900);
      }
    }
    const nameEl = document.querySelector("h1.name");
    if (nameEl) {
      const text = nameEl.textContent;
      nameEl.textContent = "";
      let letterIndex = 0;
      text.split("").forEach((char) => {
        const span = document.createElement("span");
        span.className = "name-letter" + (char === " " ? " is-space" : "");
        span.textContent = char === " " ? " " : char;
        if (char !== " ") {
          span.style.setProperty("--i", letterIndex);
          letterIndex++;
        }
        nameEl.appendChild(span);
      });
    }
    const glowEl = document.getElementById("glow");
    const scrollFill = document.getElementById("scrollFill");
    if (!prefersReducedMotion) {
      let ticking = false;
      window.addEventListener("scroll", () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            document.documentElement.style.setProperty("--scrollY", window.scrollY);
            const max = document.documentElement.scrollHeight - window.innerHeight;
            const pct = max > 0 ? Math.min(100, window.scrollY / max * 100) : 0;
            if (scrollFill)
              scrollFill.style.width = pct + "%";
            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });
    } else if (scrollFill) {
      window.addEventListener("scroll", () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const pct = max > 0 ? Math.min(100, window.scrollY / max * 100) : 0;
        scrollFill.style.width = pct + "%";
      }, { passive: true });
    }
    const spotlightEl = document.getElementById("spotlight");
    if (!prefersReducedMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      let lastSpark = 0;
      window.addEventListener("pointermove", (e) => {
        if (spotlightEl) {
          spotlightEl.style.setProperty("--mx", e.clientX + "px");
          spotlightEl.style.setProperty("--my", e.clientY + "px");
          spotlightEl.classList.add("active");
        }
        const now = performance.now();
        if (now - lastSpark < 70)
          return;
        lastSpark = now;
        const spark = document.createElement("div");
        spark.className = "cursor-spark";
        spark.style.left = e.clientX + (Math.random() * 6 - 3) + "px";
        spark.style.top = e.clientY + (Math.random() * 6 - 3) + "px";
        document.body.appendChild(spark);
        setTimeout(() => spark.remove(), 950);
      }, { passive: true });
      window.addEventListener("pointerleave", () => {
        if (spotlightEl)
          spotlightEl.classList.remove("active");
      });
    }
    const titleEls = document.querySelectorAll(".page-title");
    if (titleEls.length) {
      const titleObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("title-in");
          }
        });
      }, { threshold: 0.5 });
      titleEls.forEach((el) => titleObserver.observe(el));
    }
    const petalsContainer = document.getElementById("petals");
    const petalCount = 14;
    const petalSVG = `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 2C10 8 6 12 6 18a10 10 0 0020 0c0-6-4-10-10-16z" fill="#9c2b44" opacity="0.7"/>
  </svg>`;
    if (petalsContainer) {
      for (let i = 0;i < petalCount; i++) {
        const p = document.createElement("div");
        p.className = "petal";
        p.innerHTML = petalSVG;
        const size = 10 + Math.random() * 16;
        p.style.width = size + "px";
        p.style.height = size + "px";
        p.style.left = Math.random() * 100 + "vw";
        p.style.animationDuration = 12 + Math.random() * 14 + "s";
        p.style.animationDelay = Math.random() * -20 + "s";
        petalsContainer.appendChild(p);
      }
    }
    const envelope = document.getElementById("envelope");
    const envelopeLink = document.getElementById("envelopeLink");
    const letterSection = document.getElementById("letterSection");
    const hint = document.getElementById("hint");
    const seal = envelope ? envelope.querySelector(".seal") : null;
    function openLetter(e) {
      if (e)
        e.preventDefault();
      if (envelope.classList.contains("open")) {
        letterSection.scrollIntoView({ behavior: "smooth" });
        return;
      }
      hint.style.opacity = "0";
      const proceed = () => {
        envelope.classList.add("open");
        letterSection.classList.add("visible");
        setTimeout(() => {
          letterSection.scrollIntoView({ behavior: "smooth" });
        }, 950);
      };
      if (seal && !prefersReducedMotion) {
        seal.classList.add("cracking");
        setTimeout(proceed, 220);
      } else {
        proceed();
      }
    }
    if (envelopeLink) {
      envelopeLink.addEventListener("click", openLetter);
    }
    const memoryGrid = document.getElementById("memoryGrid");
    const gameStatus = document.getElementById("gameStatus");
    const gameReset = document.getElementById("gameReset");
    if (memoryGrid) {
      let shuffle = function(arr) {
        for (let i = arr.length - 1;i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
      }, buildGame = function() {
        memoryGrid.innerHTML = "";
        deck = shuffle([...symbols, ...symbols]);
        firstCard = null;
        lock = false;
        moves = 0;
        matches = 0;
        gameStatus.textContent = "tentativas: 0";
        deck.forEach((symbol) => {
          const card = document.createElement("div");
          card.className = "memory-card";
          card.dataset.symbol = symbol;
          card.innerHTML = `
          <div class="memory-card-inner">
            <div class="memory-card-face memory-card-back">♡</div>
            <div class="memory-card-face memory-card-front">${symbol}</div>
          </div>`;
          card.addEventListener("click", () => onCardClick(card));
          memoryGrid.appendChild(card);
        });
      }, onCardClick = function(card) {
        if (lock || card.classList.contains("flipped") || card.classList.contains("matched"))
          return;
        card.classList.add("flipped");
        if (!firstCard) {
          firstCard = card;
          return;
        }
        moves++;
        gameStatus.textContent = `tentativas: ${moves}`;
        if (firstCard.dataset.symbol === card.dataset.symbol) {
          firstCard.classList.add("matched");
          card.classList.add("matched");
          firstCard = null;
          matches++;
          if (matches === symbols.length) {
            setTimeout(() => {
              gameStatus.textContent = "você achou todos os pares! \uD83D\uDC9B te amo.";
              const rect = memoryGrid.getBoundingClientRect();
              burstHearts(rect.left + rect.width / 2, rect.top + rect.height / 2, 18);
            }, 400);
          }
        } else {
          lock = true;
          const wrongFirst = firstCard, wrongSecond = card;
          setTimeout(() => {
            wrongFirst.classList.remove("flipped");
            wrongSecond.classList.remove("flipped");
            firstCard = null;
            lock = false;
          }, 800);
        }
      };
      const symbols = ["✉️", "\uD83D\uDCFF", "\uD83C\uDFB5", "\uD83D\uDC8D", "\uD83C\uDF39", "⭐"];
      let deck = [], firstCard = null, lock = false, moves = 0, matches = 0;
      gameReset.addEventListener("click", buildGame);
      buildGame();
    }
    const tictacGrid = document.getElementById("tictacGrid");
    const tictacStatus = document.getElementById("tictacStatus");
    const tictacReset = document.getElementById("tictacReset");
    if (tictacGrid) {
      let buildBoard = function() {
        board = Array(9).fill(null);
        turn = 0;
        finished = false;
        tictacStatus.textContent = `vez do ${PLAYERS[turn]}`;
        tictacGrid.innerHTML = "";
        for (let i = 0;i < 9; i++) {
          const cell = document.createElement("div");
          cell.className = "tictac-cell";
          cell.dataset.index = i;
          cell.addEventListener("click", () => onCellClick(cell, i));
          tictacGrid.appendChild(cell);
        }
      }, checkWinner = function() {
        for (const line of WIN_LINES) {
          const [a, b, c] = line;
          if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return line;
          }
        }
        return null;
      }, onCellClick = function(cell, i) {
        if (finished || board[i])
          return;
        board[i] = PLAYERS[turn];
        cell.textContent = PLAYERS[turn];
        cell.classList.add("taken");
        const winLine = checkWinner();
        if (winLine) {
          finished = true;
          winLine.forEach((idx) => tictacGrid.children[idx].classList.add("win"));
          tictacStatus.textContent = `${PLAYERS[turn]} venceu essa rodada!`;
          const rect = tictacGrid.getBoundingClientRect();
          burstHearts(rect.left + rect.width / 2, rect.top + rect.height / 2, 16);
          return;
        }
        if (board.every((v) => v)) {
          finished = true;
          tictacStatus.textContent = "empate! bora desempatar com um beijo \uD83D\uDE18";
          return;
        }
        turn = 1 - turn;
        tictacStatus.textContent = `vez do ${PLAYERS[turn]}`;
      };
      const PLAYERS = ["❤️", "✦"];
      const WIN_LINES = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
      ];
      let board = [], turn = 0, finished = false;
      tictacReset.addEventListener("click", buildBoard);
      buildBoard();
    }
    const bgMusic = document.getElementById("bgMusic");
    const musicBtn = document.getElementById("musicPlayBtn");
    const playIcon = document.getElementById("playIcon");
    const pauseIcon = document.getElementById("pauseIcon");
    const vinyl = document.getElementById("vinyl");
    const tonearm = document.getElementById("tonearm");
    if (bgMusic && musicBtn) {
      bgMusic.volume = 0.6;
      musicBtn.addEventListener("click", () => {
        if (bgMusic.paused) {
          bgMusic.play().catch((err) => {
            console.log("Não foi possível tocar a música:", err);
          });
        } else {
          bgMusic.pause();
        }
      });
      bgMusic.addEventListener("play", () => {
        playIcon.style.display = "none";
        pauseIcon.style.display = "block";
        musicBtn.classList.add("playing");
        if (vinyl) {
          vinyl.classList.add("spinning");
        }
        if (tonearm) {
          tonearm.classList.add("playing");
        }
      });
      bgMusic.addEventListener("pause", () => {
        playIcon.style.display = "block";
        pauseIcon.style.display = "none";
        musicBtn.classList.remove("playing");
        if (vinyl) {
          vinyl.classList.remove("spinning");
        }
        if (tonearm) {
          tonearm.classList.remove("playing");
        }
      });
    }
    const revealEls = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });
      revealEls.forEach((el) => observer.observe(el));
    } else {
      revealEls.forEach((el) => el.classList.add("in"));
    }
    const chapterNav = document.getElementById("chapterNav");
    const dots = Array.from(document.querySelectorAll(".chapter-dot"));
    const chapterSections = dots.map((d) => document.getElementById(d.dataset.target));
    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        const target = document.getElementById(dot.dataset.target);
        if (target) {
          if (target.id === "letterSection") {
            openLetter();
          }
          target.scrollIntoView({ behavior: "smooth" });
        }
      });
    });
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const idx = chapterSections.indexOf(entry.target);
        if (entry.isIntersecting) {
          dots.forEach((d) => d.classList.remove("active"));
          if (dots[idx])
            dots[idx].classList.add("active");
        }
      });
    }, { threshold: 0.5 });
    chapterSections.forEach((sec) => {
      if (sec)
        navObserver.observe(sec);
    });
    if (letterSection) {
      const showNavObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting || entry.boundingClientRect.top < window.innerHeight) {
            chapterNav.classList.add("show");
          }
        });
      }, { threshold: 0.1 });
      showNavObserver.observe(letterSection);
    }
    const sushiBoard = document.getElementById("sushiBoard");
    const sushiOrderEl = document.getElementById("sushiOrder");
    const sushiScoreEl = document.getElementById("sushiScore");
    const sushiReset = document.getElementById("sushiReset");
    const sushiSubmit = document.getElementById("sushiSubmit");
    if (sushiBoard && sushiOrderEl && sushiScoreEl) {
      const ingredients = [
        { id: "arroz", label: "Arroz", icon: "\uD83C\uDF5A" },
        { id: "salmao", label: "Salmão", icon: "\uD83C\uDF63" },
        { id: "abacate", label: "Abacate", icon: "\uD83E\uDD51" },
        { id: "pepino", label: "Pepino", icon: "\uD83E\uDD52" },
        { id: "camarao", label: "Camarão", icon: "\uD83C\uDF64" },
        { id: "nori", label: "Nori", icon: "\uD83C\uDF3F" },
        { id: "gergelim", label: "Gergelim", icon: "✨" },
        { id: "molho", label: "Molho tarê", icon: "\uD83E\uDD62" },
        { id: "wasabi", label: "Wasabi", icon: "\uD83D\uDFE2" }
      ];
      const orders = [
        { name: "Salmão especial", items: ["arroz", "salmao", "abacate"] },
        { name: "Camarão crocante", items: ["arroz", "camarao", "nori"] },
        { name: "Sushi clássico", items: ["arroz", "salmao", "nori"] },
        { name: "Rolinho fresco", items: ["arroz", "pepino", "abacate"] }
      ];
      let sushiScore = 0;
      let currentOrder;
      let selected = new Set;
      const shuffleIngredients = () => [...ingredients].sort(() => Math.random() - 0.5);
      const renderSushi = () => {
        selected = new Set;
        currentOrder = orders[Math.floor(Math.random() * orders.length)];
        sushiOrderEl.className = "sushi-order";
        sushiOrderEl.textContent = `Pedido: ${currentOrder.name}. Escolha exatamente 3 ingredientes.`;
        sushiBoard.innerHTML = "";
        shuffleIngredients().forEach((item) => {
          const button = document.createElement("button");
          button.type = "button";
          button.className = "sushi-ingredient";
          button.dataset.id = item.id;
          button.setAttribute("aria-pressed", "false");
          button.innerHTML = `<span class="ingredient-icon" aria-hidden="true">${item.icon}</span><span>${item.label}</span>`;
          button.addEventListener("click", () => {
            if (selected.has(item.id)) {
              selected.delete(item.id);
              button.classList.remove("selected");
              button.setAttribute("aria-pressed", "false");
            } else if (selected.size < 3) {
              selected.add(item.id);
              button.classList.add("selected");
              button.setAttribute("aria-pressed", "true");
            }
            sushiOrderEl.className = "sushi-order";
            sushiOrderEl.textContent = `${selected.size}/3 ingredientes escolhidos para ${currentOrder.name}.`;
          });
          sushiBoard.appendChild(button);
        });
      };
      const submitSushi = () => {
        if (selected.size !== 3) {
          sushiOrderEl.className = "sushi-order error";
          sushiOrderEl.textContent = "Escolha 3 ingredientes antes de servir.";
          return;
        }
        const expected = new Set(currentOrder.items);
        const isCorrect = selected.size === expected.size && [...selected].every((item) => expected.has(item));
        if (isCorrect) {
          sushiScore += 10;
          sushiScoreEl.textContent = sushiScore;
          sushiOrderEl.className = "sushi-order success";
          sushiOrderEl.textContent = `Pedido perfeito! +10 pontos. ${currentOrder.name} ficou lindo para nós.`;
          const rect = sushiBoard.getBoundingClientRect();
          burstHearts(rect.left + rect.width / 2, rect.top + rect.height / 2, 12);
          setTimeout(renderSushi, 1100);
        } else {
          sushiOrderEl.className = "sushi-order error";
          sushiOrderEl.textContent = "Quase! Esse pedido precisa de outros ingredientes. Tente novamente.";
        }
      };
      sushiSubmit?.addEventListener("click", submitSushi);
      sushiReset?.addEventListener("click", () => {
        sushiScore = 0;
        sushiScoreEl.textContent = "0";
        renderSushi();
      });
      renderSushi();
    }
  }

  // ../../dev-server/src/site/rosary.ts
  var SVG_NS = "http://www.w3.org/2000/svg";
  var AVE_TEXT = "Ave Maria, cheia de graça, o Senhor é convosco, bendita sois vós entre as mulheres e bendito é o fruto do vosso ventre, Jesus. Santa Maria, Mãe de Deus, rogai por nós pecadores, agora e na hora da nossa morte. Amém.";
  var PATER_TEXT = "Pai Nosso que estais no céu, santificado seja o Vosso nome, venha a nós o Vosso reino, seja feita a Vossa vontade, assim na terra como no céu. O pão nosso de cada dia nos dai hoje, perdoai as nossas ofensas, assim como nós perdoamos a quem nos tem ofendido, e não nos deixeis cair em tentação, mas livrai-nos do mal. Amém.";
  var GLORIA_TEXT = "Glória ao Pai, ao Filho e ao Espírito Santo. Como era no princípio, agora e sempre. Amém.";
  var MYSTERIES = [
    "1ª dezena — pela nossa fé",
    "2ª dezena — pela nossa esperança",
    "3ª dezena — pelo nosso amor",
    "4ª dezena — pela nossa paz",
    "5ª dezena — pelo nosso futuro"
  ];
  var OPENING_AVE_INTENTIONS = ["pela Fé", "pela Esperança", "pela Caridade"];
  function burst(x, y, count = 20) {
    const layer = document.getElementById("heartBurst");
    if (!layer || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    for (let i = 0;i < count; i++) {
      const heart = document.createElementNS(SVG_NS, "svg");
      heart.setAttribute("viewBox", "0 0 24 24");
      heart.setAttribute("class", "heart-particle");
      heart.innerHTML = '<path d="M12 21s-7.5-4.6-10-9.1C.6 8.6 2 5 5.4 4.2 8 3.6 10 5 12 7.5 14 5 16 3.6 18.6 4.2 22 5 23.4 8.6 22 11.9 19.5 16.4 12 21 12 21z"/>';
      const size = 10 + Math.random() * 14;
      const angle = Math.random() * Math.PI * 2;
      const dist = 60 + Math.random() * 120;
      const s = heart.style;
      s.width = size + "px";
      s.height = size + "px";
      s.left = x + "px";
      s.top = y + "px";
      s.setProperty("--dx", Math.cos(angle) * dist + "px");
      s.setProperty("--dy", Math.sin(angle) * dist - 40 + "px");
      s.setProperty("--rot", Math.random() * 360 - 180 + "deg");
      s.animationDelay = Math.random() * 0.15 + "s";
      layer.appendChild(heart);
      setTimeout(() => heart.remove(), 1900);
    }
  }
  function initRosary() {
    const rosary = document.getElementById("rosary");
    const group = document.getElementById("rosaryGroup");
    if (!rosary || !group)
      return;
    group.innerHTML = "";
    const stepEl = document.getElementById("prayerStep");
    const countEl = document.getElementById("prayerCount");
    const titleEl = document.getElementById("prayerTitle");
    const textEl = document.getElementById("prayerText");
    const fillEl = document.getElementById("prayerProgressFill");
    const cardEl = document.getElementById("prayerCard");
    const captionEl = document.getElementById("rosaryCaption");
    const nextBtn = document.getElementById("prayerNext");
    const resetBtn = document.getElementById("prayerReset");
    const sequence = [];
    const el = (name, attrs) => {
      const node = document.createElementNS(SVG_NS, name);
      Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, String(v)));
      group.appendChild(node);
      return node;
    };
    const bead = (cx2, cy2, r, kind, label, data) => {
      const g = document.createElementNS(SVG_NS, "g");
      g.setAttribute("class", `rosary-bead bead-${kind}`);
      g.setAttribute("tabindex", "0");
      g.setAttribute("role", "button");
      g.setAttribute("aria-label", label);
      g.style.transformOrigin = `${cx2}px ${cy2}px`;
      const halo = document.createElementNS(SVG_NS, "circle");
      halo.setAttribute("class", "bead-halo");
      halo.setAttribute("cx", String(cx2));
      halo.setAttribute("cy", String(cy2));
      halo.setAttribute("r", String(r + 3.5));
      const c = document.createElementNS(SVG_NS, "circle");
      c.setAttribute("class", "bead-core");
      c.setAttribute("cx", String(cx2));
      c.setAttribute("cy", String(cy2));
      c.setAttribute("r", String(r));
      c.setAttribute("fill", kind === "pater" ? "url(#paterGrad)" : "url(#beadGrad)");
      const shine = document.createElementNS(SVG_NS, "circle");
      shine.setAttribute("class", "bead-shine");
      shine.setAttribute("cx", String(cx2 - r * 0.3));
      shine.setAttribute("cy", String(cy2 - r * 0.35));
      shine.setAttribute("r", String(Math.max(0.8, r * 0.28)));
      g.append(halo, c, shine);
      group.appendChild(g);
      sequence.push({ el: g, data });
      return g;
    };
    const cx = 100, cy = 178, rx = 78, ry = 112;
    const pointAt = (deg) => {
      const rad = deg * Math.PI / 180;
      return { x: cx + rx * Math.sin(rad), y: cy + ry * Math.cos(rad) };
    };
    el("ellipse", {
      cx,
      cy,
      rx,
      ry,
      class: "chain-ring",
      fill: "none"
    });
    const crossWrap = document.createElementNS(SVG_NS, "g");
    crossWrap.setAttribute("transform", "translate(100,548)");
    group.appendChild(crossWrap);
    const cross = document.createElementNS(SVG_NS, "g");
    cross.setAttribute("class", "rosary-bead bead-cross");
    cross.setAttribute("tabindex", "0");
    cross.setAttribute("role", "button");
    cross.setAttribute("aria-label", "Crucifixo — Sinal da Cruz e Credo");
    cross.style.transformOrigin = "0px 0px";
    cross.innerHTML = `
    <rect class="cross-glow" x="-22" y="-38" width="44" height="76" rx="8" fill="none"/>
    <rect x="-4.5" y="-34" width="9" height="68" rx="3" fill="url(#metalGrad)"/>
    <rect x="-19" y="-16" width="38" height="9" rx="3" fill="url(#metalGrad)"/>
    <circle cx="0" cy="-11.5" r="3.4" fill="#3f0a1a" opacity="0.55"/>`;
    crossWrap.appendChild(cross);
    sequence.push({
      el: cross,
      data: {
        step: "1 · Sinal da Cruz e Credo",
        title: "Em nome do Pai",
        text: "Em nome do Pai, do Filho e do Espírito Santo. Amém. Creio em Deus Pai todo-poderoso, criador do céu e da terra..."
      }
    });
    el("line", { x1: 100, y1: 512, x2: 100, y2: 494, class: "chain-line" });
    const tailY = [486, 460, 438, 416, 390];
    const ty = (i) => tailY[i] ?? 0;
    bead(100, ty(0), 8, "pater", "Conta grande — Pai Nosso", {
      step: "2 · Pai Nosso",
      title: "Pai Nosso",
      text: PATER_TEXT
    });
    for (let i = 1;i <= 3; i++) {
      el("line", { x1: 100, y1: ty(i - 1) - 6, x2: 100, y2: ty(i) + 6, class: "chain-line" });
      bead(100, ty(i), 5, "ave", `Ave Maria ${i} de 3`, {
        step: `${2 + i} · ${i}ª Ave Maria`,
        title: "Ave Maria",
        text: `${AVE_TEXT} (${OPENING_AVE_INTENTIONS[i - 1]})`
      });
    }
    el("line", { x1: 100, y1: ty(3) - 5, x2: 100, y2: ty(4) + 8, class: "chain-line" });
    bead(100, ty(4), 8, "pater", "Conta grande — Glória ao Pai", {
      step: "6 · Glória ao Pai",
      title: "Glória",
      text: GLORIA_TEXT
    });
    el("line", { x1: 100, y1: 382, x2: 100, y2: 356, class: "chain-line" });
    const medal = document.createElementNS(SVG_NS, "g");
    medal.setAttribute("class", "rosary-bead bead-medal");
    medal.setAttribute("tabindex", "0");
    medal.setAttribute("role", "button");
    medal.setAttribute("aria-label", "Medalha de São Bento — intenção");
    medal.style.transformOrigin = "100px 330px";
    medal.innerHTML = `
    <circle class="medal-halo" cx="100" cy="330" r="27" fill="none"/>
    <circle class="medal-ring" cx="100" cy="330" r="25" fill="url(#metalGrad)"/>
    <circle class="medal-bg" cx="100" cy="330" r="21"/>
    <path d="M100 316 v28 M86 330 h28" class="medal-cross"/>
    <text x="100" y="323" text-anchor="middle" class="medal-text">C S P B</text>
    <text x="100" y="342" text-anchor="middle" class="medal-text">S. BENTO</text>`;
    group.appendChild(medal);
    sequence.push({
      el: medal,
      data: {
        step: "7 · Medalha de São Bento",
        title: "A intenção",
        text: "Aqui eu guardo a intenção: que São Bento guarde a nossa casa e o nosso caminho, e que a gente continue se escolhendo todos os dias. Por você, Eduarda."
      }
    });
    el("line", { x1: 100, y1: 305, x2: 100, y2: 290, class: "chain-line" });
    let n = 7;
    for (let d = 0;d < 5; d++) {
      const a0 = 6 + d * 72;
      const p = pointAt(a0);
      n++;
      bead(p.x, p.y, 8, "pater", `Pai Nosso — ${d + 1}ª dezena`, {
        step: `${n} · Pai Nosso — ${d + 1}ª dezena`,
        title: `Pai Nosso · ${MYSTERIES[d]}`,
        text: PATER_TEXT
      });
      for (let k = 1;k <= 10; k++) {
        const a = a0 + 6 + (k - 1) * 6.2;
        const q = pointAt(a);
        n++;
        bead(q.x, q.y, 4.6, "ave", `${d + 1}ª dezena — Ave Maria ${k} de 10`, {
          step: `${n} · ${d + 1}ª dezena — Ave Maria ${k}/10`,
          title: k === 10 ? "Ave Maria + Glória" : "Ave Maria",
          text: k === 10 ? `${AVE_TEXT}

E, ao fechar a dezena: ${GLORIA_TEXT}` : AVE_TEXT
        });
      }
    }
    const total = sequence.length;
    let current = -1;
    let completed = false;
    const paint = () => {
      sequence.forEach((s, i) => {
        s.el.classList.toggle("prayed", i < current);
        s.el.classList.toggle("current", i === current);
      });
    };
    const show = (index) => {
      if (index < 0 || index >= total)
        return;
      current = index;
      paint();
      const { data } = sequence[index];
      if (cardEl) {
        cardEl.classList.remove("pulse");
        cardEl.offsetWidth;
        cardEl.classList.add("pulse");
      }
      if (stepEl)
        stepEl.textContent = data.step;
      if (titleEl)
        titleEl.textContent = data.title;
      if (textEl)
        textEl.textContent = data.text;
      if (countEl)
        countEl.textContent = `${index + 1} / ${total}`;
      if (fillEl)
        fillEl.style.width = (index + 1) / total * 100 + "%";
      if (index === total - 1 && !completed) {
        completed = true;
        setTimeout(() => {
          if (stepEl)
            stepEl.textContent = "Terço completo \uD83D\uDC9B";
          if (titleEl)
            titleEl.textContent = "Salve Rainha";
          if (textEl)
            textEl.textContent = "Salve Rainha, Mãe de misericórdia, vida, doçura e esperança nossa, salve. E, no fim, um obrigado: por cada Ave Maria que eu rezei pensando em nós, Eduarda.";
          if (captionEl)
            captionEl.textContent = "você rezou o terço todo — toque numa conta pra rever qualquer passo.";
          const rect = rosary.getBoundingClientRect();
          burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 24);
        }, 1200);
      }
    };
    sequence.forEach((s, i) => {
      s.el.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        show(i);
      });
      s.el.addEventListener("keydown", (e) => {
        const ke = e;
        if (ke.key === "Enter" || ke.key === " ") {
          e.preventDefault();
          show(i);
        }
      });
    });
    nextBtn?.addEventListener("click", () => show(Math.min(current + 1, total - 1)));
    resetBtn?.addEventListener("click", () => {
      current = -1;
      completed = false;
      paint();
      if (stepEl)
        stepEl.textContent = "toque no crucifixo para começar";
      if (countEl)
        countEl.textContent = `0 / ${total}`;
      if (titleEl)
        titleEl.textContent = "Terço por nós dois";
      if (textEl)
        textEl.textContent = "Cada conta tem a sua oração. Toque no crucifixo e siga comigo — uma intenção por nós, Eduarda.";
      if (fillEl)
        fillEl.style.width = "0%";
      if (captionEl)
        captionEl.textContent = "Comece pelo crucifixo e siga conta por conta — na ordem certa, do jeito que se reza.";
    });
    if (countEl)
      countEl.textContent = `0 / ${total}`;
  }

  // entry.ts
  initLegacySite();
  initRosary();
})();
