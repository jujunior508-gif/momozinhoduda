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
    const setActiveChapter = (activeIndex) => {
      dots.forEach((dot, index) => {
        const isActive = index === activeIndex;
        dot.classList.toggle("active", isActive);
        if (isActive)
          dot.setAttribute("aria-current", "true");
        else
          dot.removeAttribute("aria-current");
      });
    };
    const updateActiveChapter = () => {
      const marker = window.innerHeight * 0.42;
      let activeIndex = -1;
      let closestDistance = Infinity;
      chapterSections.forEach((section, index) => {
        if (!section)
          return;
        const rect = section.getBoundingClientRect();
        if (rect.top <= marker && rect.bottom >= marker) {
          activeIndex = index;
          closestDistance = 0;
          return;
        }
        const distance = Math.min(Math.abs(rect.top - marker), Math.abs(rect.bottom - marker));
        if (distance < closestDistance) {
          closestDistance = distance;
          activeIndex = index;
        }
      });
      if (activeIndex >= 0)
        setActiveChapter(activeIndex);
    };
    let navTicking = false;
    const requestChapterUpdate = () => {
      if (navTicking)
        return;
      navTicking = true;
      window.requestAnimationFrame(() => {
        updateActiveChapter();
        navTicking = false;
      });
    };
    window.addEventListener("scroll", requestChapterUpdate, { passive: true });
    window.addEventListener("resize", requestChapterUpdate, { passive: true });
    requestChapterUpdate();
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
    const sushiOrderNameEl = document.getElementById("sushiOrderName");
    const sushiOrderHintEl = document.getElementById("sushiOrderHint");
    const sushiScoreEl = document.getElementById("sushiScore");
    const sushiRoundEl = document.getElementById("sushiRound");
    const sushiSelectedCountEl = document.getElementById("sushiSelectedCount");
    const sushiSelectionFillEl = document.getElementById("sushiSelectionFill");
    const sushiReset = document.getElementById("sushiReset");
    const sushiClear = document.getElementById("sushiClear");
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
        { id: "wasabi", label: "Wasabi", icon: "\uD83D\uDFE2" },
        { id: "manga", label: "Manga", icon: "\uD83E\uDD6D" },
        { id: "creamcheese", label: "Cream cheese", icon: "\uD83E\uDDC0" },
        { id: "kani", label: "Kani", icon: "\uD83E\uDD80" },
        { id: "cogumelo", label: "Cogumelo", icon: "\uD83C\uDF44" },
        { id: "limao", label: "Limão", icon: "\uD83C\uDF4B" },
        { id: "tempura", label: "Tempurá", icon: "\uD83E\uDD5F" }
      ];
      const orders = [
        { name: "Salmão especial", items: ["arroz", "salmao", "abacate"] },
        { name: "Camarão crocante", items: ["arroz", "camarao", "nori"] },
        { name: "Sushi clássico", items: ["arroz", "salmao", "nori"] },
        { name: "Rolinho fresco", items: ["arroz", "pepino", "abacate"] },
        { name: "Manga tropical", items: ["arroz", "manga", "abacate"] },
        { name: "Salmão cremoso", items: ["arroz", "salmao", "creamcheese"] },
        { name: "Kani refrescante", items: ["arroz", "kani", "pepino"] },
        { name: "Veggie da casa", items: ["arroz", "cogumelo", "abacate"] },
        { name: "Tempurá especial", items: ["arroz", "tempura", "nori"] },
        { name: "Cítrico do casal", items: ["arroz", "limao", "salmao"] }
      ];
      let sushiScore = 0;
      let round = 1;
      let currentOrder;
      let selected = new Set;
      let servingTimer = null;
      const shuffleIngredients = () => [...ingredients].sort(() => Math.random() - 0.5);
      const updateSelectionUi = () => {
        const selectedCount = selected.size;
        if (sushiSelectedCountEl)
          sushiSelectedCountEl.textContent = String(selectedCount);
        if (sushiSelectionFillEl)
          sushiSelectionFillEl.style.width = `${selectedCount / 3 * 100}%`;
      };
      const setOrderHint = (message, state = "") => {
        sushiOrderEl.className = `sushi-order${state ? ` ${state}` : ""}`;
        if (sushiOrderNameEl)
          sushiOrderNameEl.textContent = currentOrder?.name || "Escolha sua combinação";
        if (sushiOrderHintEl)
          sushiOrderHintEl.textContent = message;
      };
      const renderSushi = () => {
        selected = new Set;
        currentOrder = orders[Math.floor(Math.random() * orders.length)];
        if (sushiRoundEl)
          sushiRoundEl.textContent = `pedido ${String(round).padStart(2, "0")}`;
        setOrderHint("Selecione exatamente 3 ingredientes para servir.");
        updateSelectionUi();
        sushiBoard.innerHTML = "";
        shuffleIngredients().forEach((item) => {
          const button = document.createElement("button");
          button.type = "button";
          button.className = "sushi-ingredient";
          button.dataset.id = item.id;
          button.setAttribute("aria-pressed", "false");
          button.innerHTML = `<span class="ingredient-icon" aria-hidden="true">${item.icon}</span><span class="ingredient-label">${item.label}</span><span class="ingredient-check" aria-hidden="true">✓</span>`;
          button.addEventListener("click", () => {
            if (selected.has(item.id)) {
              selected.delete(item.id);
              button.classList.remove("selected");
              button.setAttribute("aria-pressed", "false");
            } else if (selected.size < 3) {
              selected.add(item.id);
              button.classList.add("selected");
              button.setAttribute("aria-pressed", "true");
            } else {
              setOrderHint("Você já escolheu 3 ingredientes. Sirva o pedido ou limpe a seleção.", "error");
              return;
            }
            updateSelectionUi();
            const message = selected.size === 3
              ? "Tudo pronto. Confira a combinação e sirva o sushi."
              : `${selected.size}/3 ingredientes escolhidos. Escolha mais ${3 - selected.size}.`;
            setOrderHint(message);
          });
          sushiBoard.appendChild(button);
        });
      };
      const clearSelection = () => {
        selected.clear();
        sushiBoard.querySelectorAll(".sushi-ingredient").forEach((button) => {
          button.classList.remove("selected");
          button.setAttribute("aria-pressed", "false");
        });
        updateSelectionUi();
        setOrderHint("Selecione exatamente 3 ingredientes para servir.");
      };
      const submitSushi = () => {
        if (selected.size !== 3) {
          setOrderHint("Escolha 3 ingredientes antes de servir.", "error");
          return;
        }
        const expected = new Set(currentOrder.items);
        const isCorrect = selected.size === expected.size && [...selected].every((item) => expected.has(item));
        if (isCorrect) {
          sushiScore += 10;
          sushiScoreEl.textContent = String(sushiScore);
          setOrderHint(`Pedido perfeito! +10 pontos. ${currentOrder.name} ficou lindo para nós.`, "success");
          sushiBoard.querySelectorAll(".sushi-ingredient.selected").forEach((button) => button.classList.add("correct"));
          const rect = sushiBoard.getBoundingClientRect();
          burstHearts(rect.left + rect.width / 2, rect.top + rect.height / 2, 12);
          clearTimeout(servingTimer);
          servingTimer = setTimeout(() => {
            round++;
            renderSushi();
          }, 1250);
        } else {
          setOrderHint("Quase! Essa combinação precisa de outros ingredientes. Tente novamente.", "error");
          sushiBoard.classList.remove("shake-board");
          sushiBoard.offsetWidth;
          sushiBoard.classList.add("shake-board");
        }
      };
      sushiSubmit?.addEventListener("click", submitSushi);
      sushiClear?.addEventListener("click", clearSelection);
      sushiReset?.addEventListener("click", () => {
        clearTimeout(servingTimer);
        sushiScore = 0;
        round = 1;
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
  var OPENING_AVE_INTENTIONS = ["pela Fé", "pela Esperança", "pela Caridade"];
  var SAO_BENTO_INVOCATIONS = [
    {
      title: "A Cruz Sagrada Seja Minha Luz",
      text: "A cruz sagrada seja minha luz, não seja o dragão o meu guia.",
      labelLines: ["A CRUZ SAGRADA", "SEJA MINHA LUZ", "(10x)"]
    },
    {
      title: "Não Seja o Meu Dragão Meu Guia",
      text: "Não seja o meu dragão meu guia.",
      labelLines: ["NÃO SEJA O MEU", "DRAGÃO MEU", "GUIA (10x)"]
    },
    {
      title: "Retira-te, Satanás!",
      text: "Retira-te, Satanás! Nunca me aconselhes coisas vãs.",
      labelLines: ["RETIRA-TE", "SATANÁS!", "(10x)"]
    },
    {
      title: "Nunca Me Aconselhes Coisas Vãs",
      text: "Nunca me aconselhes coisas vãs.",
      labelLines: ["NUNCA ME", "ACONSELHES", "COISAS VÃS", "(10x)"]
    },
    {
      title: "É Mal Que Tu Me Ofereces",
      text: "É mal que tu me ofereces, bebe tu mesmo o teu veneno.",
      labelLines: ["É MAL QUE TU ME", "OFERECES. BEBE", "TU MESMO O TEU", "VENENO (10x)"]
    }
  ];
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
    const label = (bx, by, side, lines) => {
      const anchorX = side === "left" ? 108 : 282;
      const textAnchor = side === "left" ? "end" : "start";
      el("line", {
        x1: anchorX,
        y1: by,
        x2: bx,
        y2: by,
        class: "label-line",
        "marker-end": "url(#labelArrow)"
      });
      const circ = document.createElementNS(SVG_NS, "circle");
      circ.setAttribute("cx", String(anchorX));
      circ.setAttribute("cy", String(by));
      circ.setAttribute("r", "1.6");
      circ.setAttribute("class", "label-dot");
      group.appendChild(circ);
      const lineHeight = 9.6;
      const startY = by - ((lines.length - 1) * lineHeight) / 2;
      const t = document.createElementNS(SVG_NS, "text");
      t.setAttribute("x", String(anchorX));
      t.setAttribute("text-anchor", textAnchor);
      t.setAttribute("class", "rosary-label");
      lines.forEach((ln, i) => {
        const isNote = /^\(.*\)$/.test(ln.trim());
        const tspan = document.createElementNS(SVG_NS, "tspan");
        tspan.setAttribute("x", String(anchorX));
        tspan.setAttribute("y", String(startY + i * lineHeight));
        if (isNote) tspan.setAttribute("class", "rosary-label-note");
        tspan.textContent = ln;
        t.appendChild(tspan);
      });
      group.appendChild(t);
    };
    const cx = 195, cy = 232, rx = 68, ry = 148;
    const pointAt = (deg) => {
      const rad = deg * Math.PI / 180;
      return { x: cx + rx * Math.sin(rad), y: cy + ry * Math.cos(rad) };
    };
    const ELLIPSE_STEPS = 720;
    const arcTable = [0];
    let prevPt = pointAt(0);
    for (let i = 1;i <= ELLIPSE_STEPS; i++) {
      const deg = i / ELLIPSE_STEPS * 360;
      const pt = pointAt(deg);
      arcTable.push(arcTable[i - 1] + Math.hypot(pt.x - prevPt.x, pt.y - prevPt.y));
      prevPt = pt;
    }
    const circumference = arcTable[ELLIPSE_STEPS];
    const degAtArc = (targetArc) => {
      const s = ((targetArc % circumference) + circumference) % circumference;
      let lo = 0, hi = ELLIPSE_STEPS;
      while (lo < hi) {
        const mid = lo + hi >> 1;
        if (arcTable[mid] < s)
          lo = mid + 1;
        else
          hi = mid;
      }
      const i1 = lo, i0 = Math.max(0, lo - 1);
      const s0 = arcTable[i0], s1 = arcTable[i1];
      const d0 = i0 / ELLIPSE_STEPS * 360, d1 = i1 / ELLIPSE_STEPS * 360;
      const frac = s1 > s0 ? (s - s0) / (s1 - s0) : 0;
      return d0 + (d1 - d0) * frac;
    };
    const pointAtArc = (arcLen) => pointAt(degAtArc(arcLen));
    el("ellipse", {
      cx,
      cy,
      rx,
      ry,
      class: "chain-ring",
      fill: "none"
    });
    el("ellipse", { cx, cy, rx: rx - 1, ry: ry - 1, class: "chain-ring-inner", fill: "none" });
    const crossCy = 616;
    const crossWrap = document.createElementNS(SVG_NS, "g");
    crossWrap.setAttribute("transform", `translate(195,${crossCy})`);
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
        text: "Em nome do Pai, do Filho e do Espírito Santo. Amém. Creio em Deus Pai todo-poderoso, criador do céu e da terra, e em Jesus Cristo, seu único Filho, nosso Senhor..."
      }
    });
    label(195, crossCy, "left", ["SINAL DA CRUZ"]);
    label(195, crossCy - 18, "right", ["CREIO EM", "DEUS PAI"]);
    // Corrente de abertura: do crucifixo para cima, a primeira conta é a grande,
    // seguida pelas três Ave-Marias e, só então, pela medalha.
    const paterCy = 550, ave1Cy = 525, ave2Cy = 503, ave3Cy = 481;
    el("line", { x1: 195, y1: 442, x2: 195, y2: 476, class: "chain-line" });
    el("line", { x1: 195, y1: 486, x2: 195, y2: 498, class: "chain-line" });
    el("line", { x1: 195, y1: 508, x2: 195, y2: 520, class: "chain-line" });
    el("line", { x1: 195, y1: 530, x2: 195, y2: 542, class: "chain-line" });
    el("line", { x1: 195, y1: 558, x2: 195, y2: crossCy - 39, class: "chain-line" });
    bead(195, paterCy, 8, "pater", "Conta grande — Pai Nosso", {
      step: "2 · Pai Nosso",
      title: "Pai Nosso",
      text: PATER_TEXT
    });
    label(195, paterCy, "right", ["PAI NOSSO"]);
    [ave1Cy, ave2Cy, ave3Cy].forEach((y, i) => {
      const isLast = i === 2;
      bead(195, y, 5, "ave", `Ave Maria ${i + 1} de 3`, {
        step: isLast ? "5 · 3ª Ave Maria + Glória" : `${2 + i + 1} · ${i + 1}ª Ave Maria`,
        title: isLast ? "Ave Maria + Glória" : "Ave Maria",
        text: isLast ? `${AVE_TEXT} (${OPENING_AVE_INTENTIONS[i]})

E, em seguida: ${GLORIA_TEXT}` : `${AVE_TEXT} (${OPENING_AVE_INTENTIONS[i]})`
      });
    });
    label(195, ave2Cy, "left", ["AVE MARIA"]);
    const medalCy = 415;
    el("line", { x1: 195, y1: 380, x2: 195, y2: medalCy - 27, class: "chain-line" });
    const medal = document.createElementNS(SVG_NS, "g");
    medal.setAttribute("class", "rosary-bead bead-medal");
    medal.setAttribute("tabindex", "0");
    medal.setAttribute("role", "button");
    medal.setAttribute("aria-label", "Medalha de São Bento — Salve Rainha");
    medal.style.transformOrigin = `195px ${medalCy}px`;
    medal.innerHTML = `
    <circle class="medal-halo" cx="195" cy="${medalCy}" r="27" fill="none"/>
    <circle class="medal-ring" cx="195" cy="${medalCy}" r="25" fill="url(#metalGrad)"/>
    <circle class="medal-bg" cx="195" cy="${medalCy}" r="21"/>
    <path d="M195 ${medalCy - 14} v28 M181 ${medalCy} h28" class="medal-cross"/>
    <text x="195" y="${medalCy - 7}" text-anchor="middle" class="medal-text">C S P B</text>
    <text x="195" y="${medalCy + 12}" text-anchor="middle" class="medal-text">S. BENTO</text>`;
    group.appendChild(medal);
    sequence.push({
      el: medal,
      data: {
        step: "6 · Medalha de São Bento — Salve Rainha",
        title: "Salve Rainha",
        text: "Salve, Rainha, Mãe de misericórdia, vida, doçura e esperança nossa, salve! A vós bradamos, os degredados filhos de Eva; a vós suspiramos, gemendo e chorando neste vale de lágrimas. Eia, pois, advogada nossa, esses vossos olhos misericordiosos a nós volvei. E, depois deste desterro, mostrai-nos Jesus, bendito fruto do vosso ventre, ó clemente, ó piedosa, ó doce sempre Virgem Maria. Amém. E o sinal da cruz, para seguir pela coroa.\n\nAqui eu guardo a intenção: que São Bento guarde a nossa casa e o nosso caminho, e que a gente continue se escolhendo todos os dias. Por você, Eduarda."
      }
    });
    label(195, medalCy - 12, "left", ["SALVE RAINHA"]);
    label(195, medalCy + 12, "right", ["SINAL DA CRUZ"]);
    el("line", { x1: 195, y1: medalCy - 27, x2: 195, y2: 380, class: "chain-line" });
    let n = 6;
    const GAP_PATER_AVE = 8, GAP_AVE_AVE = 6, GAP_AVE_PATER = 9;
    const unitsPerDecade = GAP_PATER_AVE + 9 * GAP_AVE_AVE + GAP_AVE_PATER;
    const arcUnit = circumference / (unitsPerDecade * 5);
    const SEAM_OFFSET_UNITS = GAP_PATER_AVE + 4 * GAP_AVE_AVE + GAP_AVE_AVE / 2;
    let arcCursor = -SEAM_OFFSET_UNITS * arcUnit;
    for (let d = 0;d < 5; d++) {
      const invocation = SAO_BENTO_INVOCATIONS[d];
      const p = pointAtArc(arcCursor);
      n++;
      bead(p.x, p.y, 8, "pater", `Pai Nosso — ${d + 1}ª dezena`, {
        step: `${n} · Pai Nosso — ${d + 1}ª dezena`,
        title: `Pai Nosso · ${invocation.title}`,
        text: PATER_TEXT
      });
      label(p.x, p.y, p.x < cx ? "left" : "right", ["PAI NOSSO"]);
      arcCursor += arcUnit * GAP_PATER_AVE;
      for (let k = 1;k <= 10; k++) {
        const q = pointAtArc(arcCursor);
        n++;
        bead(q.x, q.y, 4.6, "ave", `${d + 1}ª dezena — ${invocation.title} ${k} de 10`, {
          step: `${n} · ${d + 1}ª dezena — ${k}/10`,
          title: invocation.title,
          text: invocation.text
        });
        if (k === 5) {
          label(q.x, q.y, q.x < cx ? "left" : "right", invocation.labelLines);
        }
        arcCursor += arcUnit * (k < 10 ? GAP_AVE_AVE : GAP_AVE_PATER);
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
            stepEl.textContent = "Terço de São Bento completo \uD83D\uDC9B";
          if (titleEl)
            titleEl.textContent = "Sinal da Cruz";
          if (textEl)
            textEl.textContent = "Em nome do Pai, do Filho e do Espírito Santo. Amém. E, no fim, um obrigado: por cada oração que eu fiz pensando em nós, Eduarda.";
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
