(() => {
  "use strict";

  const SVG_NS = "http://www.w3.org/2000/svg";
  const HEART_PATH = "M12 21s-7.5-4.6-10-9.1C.6 8.6 2 5 5.4 4.2 8 3.6 10 5 12 7.5 14 5 16 3.6 18.6 4.2 22 5 23.4 8.6 22 11.9 19.5 16.4 12 21 12 21z";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const $ = (id) => document.getElementById(id);

  // ---------- utilidades ----------
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // explosão de coraçõezinhos para momentos de comemoração
  function burstHearts(x, y, count = 16) {
    const layer = $("heartBurst");
    if (!layer || reducedMotion) return;
    const frag = document.createDocumentFragment();
    const particles = [];
    for (let i = 0; i < count; i++) {
      const heart = document.createElementNS(SVG_NS, "svg");
      heart.setAttribute("viewBox", "0 0 24 24");
      heart.setAttribute("class", "heart-particle");
      const path = document.createElementNS(SVG_NS, "path");
      path.setAttribute("d", HEART_PATH);
      heart.appendChild(path);
      const size = 10 + Math.random() * 14;
      const angle = Math.random() * Math.PI * 2;
      const dist = 60 + Math.random() * 120;
      const s = heart.style;
      s.width = s.height = size + "px";
      s.left = x + "px";
      s.top = y + "px";
      s.setProperty("--dx", Math.cos(angle) * dist + "px");
      s.setProperty("--dy", Math.sin(angle) * dist - 40 + "px");
      s.animationDelay = Math.random() * 0.15 + "s";
      particles.push(heart);
      frag.appendChild(heart);
    }
    layer.appendChild(frag);
    setTimeout(() => particles.forEach((p) => p.remove()), 1900);
  }

  function burstFrom(el, count) {
    const r = el.getBoundingClientRect();
    burstHearts(r.left + r.width / 2, r.top + r.height / 2, count);
  }

  // um único listener de scroll/resize, agrupado por requestAnimationFrame
  const scrollTasks = [];
  let scrollTicking = false;
  function requestScrollUpdate() {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => {
      scrollTicking = false;
      for (const task of scrollTasks) task();
    });
  }
  window.addEventListener("scroll", requestScrollUpdate, { passive: true });
  window.addEventListener("resize", requestScrollUpdate, { passive: true });

  // ---------- nome, ambiente e barra de progresso ----------
  function initName() {
    const nameEl = document.querySelector("h1.name");
    if (!nameEl || reducedMotion) return;
    const text = nameEl.textContent;
    nameEl.setAttribute("aria-label", text);
    nameEl.textContent = "";
    let letterIndex = 0;
    for (const char of text) {
      const span = document.createElement("span");
      span.setAttribute("aria-hidden", "true");
      span.className = "name-letter" + (char === " " ? " is-space" : "");
      span.textContent = char;
      if (char !== " ") span.style.setProperty("--i", letterIndex++);
      nameEl.appendChild(span);
    }
  }

  function initAmbient() {
    const scrollFill = $("scrollFill");
    const glowEl = $("glow");
    scrollTasks.push(() => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollFill) scrollFill.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
      if (glowEl && !reducedMotion) glowEl.style.transform = `translate3d(0, ${(-y * 0.04).toFixed(1)}px, 0)`;
    });

    if (reducedMotion) return;

    // pétalas (menos no celular, para poupar bateria)
    const petals = $("petals");
    if (petals) {
      const count = window.innerWidth < 600 ? 9 : 14;
      const frag = document.createDocumentFragment();
      for (let i = 0; i < count; i++) {
        const p = document.createElement("div");
        p.className = "petal";
        p.innerHTML = `<svg viewBox="0 0 24 24"><path d="${HEART_PATH}"/></svg>`;
        const size = 10 + Math.random() * 16;
        p.style.width = p.style.height = size + "px";
        p.style.left = Math.random() * 100 + "vw";
        p.style.animationDuration = 12 + Math.random() * 14 + "s";
        p.style.animationDelay = Math.random() * -20 + "s";
        frag.appendChild(p);
      }
      petals.appendChild(frag);
    }

    // luz e brilhos que seguem o cursor — só no computador
    if (!finePointer) return;
    const spotlight = $("spotlight");
    let lastSpark = 0;
    window.addEventListener("pointermove", (e) => {
      if (spotlight) {
        spotlight.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
        spotlight.classList.add("active");
      }
      const now = performance.now();
      if (now - lastSpark < 70) return;
      lastSpark = now;
      const spark = document.createElement("div");
      spark.className = "cursor-spark";
      spark.style.left = e.clientX + (Math.random() * 6 - 3) + "px";
      spark.style.top = e.clientY + (Math.random() * 6 - 3) + "px";
      document.body.appendChild(spark);
      setTimeout(() => spark.remove(), 950);
    }, { passive: true });
    document.documentElement.addEventListener("pointerleave", () => spotlight?.classList.remove("active"));
  }

  // ---------- revelações ao rolar ----------
  function initReveal() {
    const revealEls = document.querySelectorAll(".reveal");
    const titleEls = document.querySelectorAll(".page-title");
    if (!("IntersectionObserver" in window)) {
      revealEls.forEach((el) => el.classList.add("in"));
      titleEls.forEach((el) => el.classList.add("title-in"));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add(entry.target.classList.contains("page-title") ? "title-in" : "in");
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach((el) => observer.observe(el));
    titleEls.forEach((el) => observer.observe(el));
  }

  // ---------- envelope e carta ----------
  let openLetter = () => {};

  function initEnvelope() {
    const scene = $("scene");
    const envelope = $("envelope");
    const envelopeLink = $("envelopeLink");
    const letterSection = $("letterSection");
    const seal = envelope?.querySelector(".seal");
    if (!envelope || !letterSection) return;

    const showLetter = () => letterSection.classList.add("visible");

    openLetter = (e) => {
      e?.preventDefault();
      if (envelope.classList.contains("open")) {
        showLetter();
        letterSection.scrollIntoView({ behavior: "smooth" });
        return;
      }
      scene?.classList.add("open");
      const proceed = () => {
        envelope.classList.add("open");
        showLetter();
        setTimeout(() => letterSection.scrollIntoView({ behavior: "smooth" }), reducedMotion ? 0 : 950);
      };
      if (seal && !reducedMotion) {
        seal.classList.add("cracking");
        setTimeout(proceed, 220);
      } else {
        proceed();
      }
    };

    envelopeLink?.addEventListener("click", openLetter);

    // se ela rolar a página sem tocar no selo, a carta aparece mesmo assim
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => {
        // também dispara se a página já abriu rolada para depois da carta
        if (entries.some((en) => en.isIntersecting || en.boundingClientRect.top < 0)) {
          showLetter();
          $("chapterNav")?.classList.add("show");
          io.disconnect();
        }
      }, { threshold: 0.12 });
      io.observe(letterSection);
    } else {
      showLetter();
    }
  }

  // ---------- navegação por capítulos ----------
  function initChapterNav() {
    const nav = $("chapterNav");
    const dots = Array.from(document.querySelectorAll(".chapter-dot"));
    if (!nav || !dots.length) return;
    const sections = dots.map((d) => $(d.dataset.target));

    dots.forEach((dot, i) => {
      dot.addEventListener("click", () => {
        const target = sections[i];
        if (!target) return;
        if (target.id === "letterSection") openLetter();
        else target.scrollIntoView({ behavior: "smooth" });
      });
    });

    let activeIndex = -1;
    scrollTasks.push(() => {
      const marker = window.innerHeight * 0.42;
      let best = -1;
      let bestDistance = Infinity;
      sections.forEach((section, i) => {
        if (!section) return;
        const rect = section.getBoundingClientRect();
        const distance = rect.top <= marker && rect.bottom >= marker
          ? 0
          : Math.min(Math.abs(rect.top - marker), Math.abs(rect.bottom - marker));
        if (distance < bestDistance) {
          bestDistance = distance;
          best = i;
        }
      });
      if (best === activeIndex || best < 0) return;
      activeIndex = best;
      dots.forEach((dot, i) => {
        dot.classList.toggle("active", i === best);
        if (i === best) dot.setAttribute("aria-current", "true");
        else dot.removeAttribute("aria-current");
      });
    });
  }

  // ---------- jogo da memória ----------
  function initMemory() {
    const grid = $("memoryGrid");
    const status = $("gameStatus");
    const reset = $("gameReset");
    if (!grid || !status) return;

    const symbols = ["✉️", "📿", "🎵", "💍", "🌹", "⭐"];
    let firstCard = null, lock = false, moves = 0, matches = 0;

    const build = () => {
      firstCard = null; lock = false; moves = 0; matches = 0;
      status.textContent = "tentativas: 0";
      grid.innerHTML = "";
      const frag = document.createDocumentFragment();
      shuffle([...symbols, ...symbols]).forEach((symbol, i) => {
        const card = document.createElement("button");
        card.type = "button";
        card.className = "memory-card";
        card.dataset.symbol = symbol;
        card.setAttribute("aria-label", `carta ${i + 1}, virada para baixo`);
        card.innerHTML = `
          <span class="memory-card-inner">
            <span class="memory-card-face memory-card-back" aria-hidden="true">♡</span>
            <span class="memory-card-face memory-card-front" aria-hidden="true">${symbol}</span>
          </span>`;
        card.addEventListener("click", () => flip(card, i));
        frag.appendChild(card);
      });
      grid.appendChild(frag);
    };

    const flip = (card, i) => {
      if (lock || card === firstCard || card.classList.contains("matched")) return;
      card.classList.add("flipped");
      card.setAttribute("aria-label", `carta ${i + 1}: ${card.dataset.symbol}`);
      if (!firstCard) {
        firstCard = card;
        return;
      }
      moves++;
      status.textContent = `tentativas: ${moves}`;
      if (firstCard.dataset.symbol === card.dataset.symbol) {
        for (const c of [firstCard, card]) {
          c.classList.add("matched");
          c.disabled = true;
        }
        firstCard = null;
        if (++matches === symbols.length) {
          setTimeout(() => {
            status.textContent = `você achou todos os pares em ${moves} tentativas! 💛 te amo.`;
            burstFrom(grid, 18);
          }, 400);
        }
      } else {
        lock = true;
        const a = firstCard;
        firstCard = null;
        setTimeout(() => {
          for (const c of [a, card]) {
            c.classList.remove("flipped");
            c.setAttribute("aria-label", c.getAttribute("aria-label").replace(/:.*$/, ", virada para baixo"));
          }
          lock = false;
        }, 800);
      }
    };

    reset?.addEventListener("click", build);
    build();
  }

  // ---------- jogo da velha ----------
  function initTicTac() {
    const grid = $("tictacGrid");
    const status = $("tictacStatus");
    const reset = $("tictacReset");
    if (!grid || !status) return;

    const PLAYERS = ["❤️", "✦"];
    const WIN_LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
    let board, turn, cells;

    const finish = (message) => {
      status.textContent = message;
      cells.forEach((c) => (c.disabled = true));
    };

    const play = (i) => {
      if (board[i]) return;
      const mark = PLAYERS[turn];
      board[i] = mark;
      cells[i].textContent = mark;
      cells[i].disabled = true;
      cells[i].setAttribute("aria-label", `casa ${i + 1}: ${mark}`);

      const winLine = WIN_LINES.find(([a, b, c]) => board[a] && board[a] === board[b] && board[a] === board[c]);
      if (winLine) {
        winLine.forEach((idx) => cells[idx].classList.add("win"));
        finish(`${mark} venceu essa rodada!`);
        burstFrom(grid, 16);
        return;
      }
      if (board.every(Boolean)) {
        finish("empate! bora desempatar com um beijo 😘");
        return;
      }
      turn = 1 - turn;
      status.textContent = `vez do ${PLAYERS[turn]}`;
    };

    const build = () => {
      board = Array(9).fill(null);
      turn = 0;
      status.textContent = `vez do ${PLAYERS[turn]}`;
      grid.innerHTML = "";
      cells = Array.from({ length: 9 }, (_, i) => {
        const cell = document.createElement("button");
        cell.type = "button";
        cell.className = "tictac-cell";
        cell.setAttribute("aria-label", `casa ${i + 1}, vazia`);
        cell.addEventListener("click", () => play(i));
        grid.appendChild(cell);
        return cell;
      });
    };

    reset?.addEventListener("click", build);
    build();
  }

  // ---------- música ----------
  function initMusic() {
    const audio = $("bgMusic");
    const btn = $("musicPlayBtn");
    if (!audio || !btn) return;
    const vinyl = $("vinyl");
    const tonearm = $("tonearm");
    audio.volume = 0.6;

    const setPlaying = (on) => {
      btn.classList.toggle("playing", on);
      btn.setAttribute("aria-pressed", String(on));
      btn.setAttribute("aria-label", on ? "Pausar música" : "Tocar música");
      vinyl?.classList.toggle("spinning", on);
      tonearm?.classList.toggle("playing", on);
    };

    btn.addEventListener("click", () => {
      if (audio.paused) {
        audio.play().catch((err) => console.warn("Não foi possível tocar a música:", err));
      } else {
        audio.pause();
      }
    });
    audio.addEventListener("play", () => setPlaying(true));
    audio.addEventListener("pause", () => setPlaying(false));
  }

  // ---------- sushi ----------
  function initSushi() {
    const board = $("sushiBoard");
    const orderEl = $("sushiOrder");
    const scoreEl = $("sushiScore");
    if (!board || !orderEl || !scoreEl) return;
    const orderNameEl = $("sushiOrderName");
    const orderHintEl = $("sushiOrderHint");
    const roundEl = $("sushiRound");
    const countEl = $("sushiSelectedCount");
    const fillEl = $("sushiSelectionFill");

    const ingredients = [
      { id: "arroz", label: "Arroz", icon: "🍚" },
      { id: "salmao", label: "Salmão", icon: "🍣" },
      { id: "abacate", label: "Abacate", icon: "🥑" },
      { id: "pepino", label: "Pepino", icon: "🥒" },
      { id: "camarao", label: "Camarão", icon: "🍤" },
      { id: "nori", label: "Nori", icon: "🌿" },
      { id: "gergelim", label: "Gergelim", icon: "✨" },
      { id: "molho", label: "Molho tarê", icon: "🥢" },
      { id: "wasabi", label: "Wasabi", icon: "🟢" },
      { id: "manga", label: "Manga", icon: "🥭" },
      { id: "creamcheese", label: "Cream cheese", icon: "🧀" },
      { id: "kani", label: "Kani", icon: "🦀" },
      { id: "cogumelo", label: "Cogumelo", icon: "🍄" },
      { id: "limao", label: "Limão", icon: "🍋" },
      { id: "tempura", label: "Tempurá", icon: "🥟" }
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
    const START_HINT = "Selecione exatamente 3 ingredientes para servir.";

    let score = 0;
    let round = 1;
    let currentOrder = null;
    let selected = new Set();
    let servingTimer = null;

    const setHint = (message, state = "") => {
      orderEl.className = "sushi-order" + (state ? " " + state : "");
      if (orderNameEl) orderNameEl.textContent = currentOrder?.name || "Escolha sua combinação";
      if (orderHintEl) orderHintEl.textContent = message;
    };

    const updateSelectionUi = () => {
      if (countEl) countEl.textContent = String(selected.size);
      if (fillEl) fillEl.style.transform = `scaleX(${selected.size / 3})`;
    };

    const toggle = (button, id) => {
      if (selected.has(id)) {
        selected.delete(id);
      } else if (selected.size < 3) {
        selected.add(id);
      } else {
        setHint("Você já escolheu 3 ingredientes. Sirva o pedido ou limpe a seleção.", "error");
        return;
      }
      const on = selected.has(id);
      button.classList.toggle("selected", on);
      button.setAttribute("aria-pressed", String(on));
      updateSelectionUi();
      setHint(selected.size === 3
        ? "Tudo pronto. Confira a combinação e sirva o sushi."
        : `${selected.size}/3 ingredientes escolhidos. Escolha mais ${3 - selected.size}.`);
    };

    const render = () => {
      selected = new Set();
      // nunca repete o mesmo pedido duas vezes seguidas
      const pool = orders.filter((o) => o !== currentOrder);
      currentOrder = pool[Math.floor(Math.random() * pool.length)];
      if (roundEl) roundEl.textContent = `pedido ${String(round).padStart(2, "0")}`;
      setHint(START_HINT);
      updateSelectionUi();
      board.innerHTML = "";
      const frag = document.createDocumentFragment();
      shuffle([...ingredients]).forEach((item) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "sushi-ingredient";
        button.setAttribute("aria-pressed", "false");
        button.innerHTML = `<span class="ingredient-icon" aria-hidden="true">${item.icon}</span><span class="ingredient-label">${item.label}</span><span class="ingredient-check" aria-hidden="true">✓</span>`;
        button.addEventListener("click", () => toggle(button, item.id));
        frag.appendChild(button);
      });
      board.appendChild(frag);
    };

    const clear = () => {
      selected.clear();
      board.querySelectorAll(".sushi-ingredient").forEach((b) => {
        b.classList.remove("selected");
        b.setAttribute("aria-pressed", "false");
      });
      updateSelectionUi();
      setHint(START_HINT);
    };

    const submit = () => {
      if (selected.size !== 3) {
        setHint("Escolha 3 ingredientes antes de servir.", "error");
        return;
      }
      const isCorrect = currentOrder.items.every((id) => selected.has(id));
      if (isCorrect) {
        score += 10;
        scoreEl.textContent = String(score);
        setHint(`Pedido perfeito! +10 pontos. ${currentOrder.name} ficou lindo para nós.`, "success");
        board.querySelectorAll(".sushi-ingredient.selected").forEach((b) => b.classList.add("correct"));
        burstFrom(board, 12);
        clearTimeout(servingTimer);
        servingTimer = setTimeout(() => {
          round++;
          render();
        }, 1250);
      } else {
        setHint("Quase! Essa combinação precisa de outros ingredientes. Tente novamente.", "error");
        board.classList.remove("shake-board");
        void board.offsetWidth; // reinicia a animação
        board.classList.add("shake-board");
      }
    };

    $("sushiSubmit")?.addEventListener("click", submit);
    $("sushiClear")?.addEventListener("click", clear);
    $("sushiReset")?.addEventListener("click", () => {
      clearTimeout(servingTimer);
      score = 0;
      round = 1;
      scoreEl.textContent = "0";
      render();
    });
    render();
  }

  // ---------- terço de São Bento ----------
  const AVE_TEXT = "Ave Maria, cheia de graça, o Senhor é convosco, bendita sois vós entre as mulheres e bendito é o fruto do vosso ventre, Jesus. Santa Maria, Mãe de Deus, rogai por nós pecadores, agora e na hora da nossa morte. Amém.";
  const PATER_TEXT = "Pai Nosso que estais no céu, santificado seja o Vosso nome, venha a nós o Vosso reino, seja feita a Vossa vontade, assim na terra como no céu. O pão nosso de cada dia nos dai hoje, perdoai as nossas ofensas, assim como nós perdoamos a quem nos tem ofendido, e não nos deixeis cair em tentação, mas livrai-nos do mal. Amém.";
  const GLORIA_TEXT = "Glória ao Pai, ao Filho e ao Espírito Santo. Como era no princípio, agora e sempre. Amém.";
  const OPENING_AVE_INTENTIONS = ["pela Fé", "pela Esperança", "pela Caridade"];
  const SAO_BENTO_INVOCATIONS = [
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
  const ROSARY_START_CAPTION = "Comece pelo crucifixo e siga cada conta no seu próprio ritmo. Esta oração é por nós.";

  function initRosary() {
    const rosary = $("rosary");
    const group = $("rosaryGroup");
    if (!rosary || !group) return;
    group.innerHTML = "";

    const stepEl = $("prayerStep");
    const countEl = $("prayerCount");
    const titleEl = $("prayerTitle");
    const textEl = $("prayerText");
    const fillEl = $("prayerProgressFill");
    const cardEl = $("prayerCard");
    const captionEl = $("rosaryCaption");
    const labelsToggle = $("rosaryLabelsToggle");
    const sequence = [];
    const frag = document.createDocumentFragment();

    const svg = (name, attrs, parent = frag) => {
      const node = document.createElementNS(SVG_NS, name);
      for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
      parent.appendChild(node);
      return node;
    };

    const makeInteractive = (g, ariaLabel, data) => {
      g.setAttribute("tabindex", "0");
      g.setAttribute("role", "button");
      g.setAttribute("aria-label", ariaLabel);
      sequence.push({ el: g, data });
    };

    const bead = (cx, cy, r, kind, ariaLabel, data) => {
      const g = svg("g", { class: `rosary-bead bead-${kind}` });
      g.style.transformOrigin = `${cx}px ${cy}px`;
      svg("circle", { class: "bead-halo", cx, cy, r: r + 3.5 }, g);
      svg("circle", { class: "bead-core", cx, cy, r, fill: kind === "pater" ? "url(#paterGrad)" : "url(#beadGrad)" }, g);
      svg("circle", { class: "bead-shine", cx: cx - r * 0.3, cy: cy - r * 0.35, r: Math.max(0.8, r * 0.28) }, g);
      makeInteractive(g, ariaLabel, data);
      return g;
    };

    const label = (bx, by, side, lines) => {
      const anchorX = side === "left" ? 108 : 282;
      svg("line", { x1: anchorX, y1: by, x2: bx, y2: by, class: "label-line", "marker-end": "url(#labelArrow)" });
      svg("circle", { cx: anchorX, cy: by, r: 1.6, class: "label-dot" });
      const lineHeight = 9.6;
      const startY = by - ((lines.length - 1) * lineHeight) / 2;
      const t = svg("text", { x: anchorX, "text-anchor": side === "left" ? "end" : "start", class: "rosary-label" });
      lines.forEach((ln, i) => {
        const tspan = svg("tspan", { x: anchorX, y: startY + i * lineHeight }, t);
        if (/^\(.*\)$/.test(ln.trim())) tspan.setAttribute("class", "rosary-label-note");
        tspan.textContent = ln;
      });
    };

    // elipse da coroa, com tabela de comprimento de arco para espaçar as contas por igual
    const cx = 195, cy = 232, rx = 68, ry = 148;
    const pointAt = (deg) => {
      const rad = deg * Math.PI / 180;
      return { x: cx + rx * Math.sin(rad), y: cy + ry * Math.cos(rad) };
    };
    const ELLIPSE_STEPS = 720;
    const arcTable = [0];
    let prevPt = pointAt(0);
    for (let i = 1; i <= ELLIPSE_STEPS; i++) {
      const pt = pointAt(i / ELLIPSE_STEPS * 360);
      arcTable.push(arcTable[i - 1] + Math.hypot(pt.x - prevPt.x, pt.y - prevPt.y));
      prevPt = pt;
    }
    const circumference = arcTable[ELLIPSE_STEPS];
    const degAtArc = (targetArc) => {
      const s = ((targetArc % circumference) + circumference) % circumference;
      let lo = 0, hi = ELLIPSE_STEPS;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (arcTable[mid] < s) lo = mid + 1;
        else hi = mid;
      }
      const i1 = lo, i0 = Math.max(0, lo - 1);
      const s0 = arcTable[i0], s1 = arcTable[i1];
      const d0 = i0 / ELLIPSE_STEPS * 360, d1 = i1 / ELLIPSE_STEPS * 360;
      const t = s1 > s0 ? (s - s0) / (s1 - s0) : 0;
      return d0 + (d1 - d0) * t;
    };
    const pointAtArc = (arcLen) => pointAt(degAtArc(arcLen));

    svg("ellipse", { cx, cy, rx, ry, class: "chain-ring", fill: "none" });
    svg("ellipse", { cx, cy, rx: rx - 1, ry: ry - 1, class: "chain-ring-inner", fill: "none" });

    // crucifixo
    const crossCy = 616;
    const crossWrap = svg("g", { transform: `translate(195,${crossCy})` });
    const cross = svg("g", { class: "rosary-bead bead-cross" }, crossWrap);
    cross.style.transformOrigin = "0px 0px";
    cross.innerHTML = `
      <rect class="cross-glow" x="-22" y="-38" width="44" height="76" rx="8" fill="none"/>
      <rect x="-4.5" y="-34" width="9" height="68" rx="3" fill="url(#metalGrad)"/>
      <rect x="-19" y="-16" width="38" height="9" rx="3" fill="url(#metalGrad)"/>
      <circle cx="0" cy="-11.5" r="3.4" fill="#3f0a1a" opacity="0.55"/>`;
    makeInteractive(cross, "Crucifixo — Sinal da Cruz e Credo", {
      step: "1 · Sinal da Cruz e Credo",
      title: "Em nome do Pai",
      text: "Em nome do Pai, do Filho e do Espírito Santo. Amém. Creio em Deus Pai todo-poderoso, criador do céu e da terra, e em Jesus Cristo, seu único Filho, nosso Senhor..."
    });
    label(195, crossCy, "left", ["SINAL DA CRUZ"]);
    label(195, crossCy - 18, "right", ["CREIO EM", "DEUS PAI"]);

    // corrente de abertura: conta grande, três Ave-Marias e, então, a medalha
    const paterCy = 550, ave1Cy = 525, ave2Cy = 503, ave3Cy = 481;
    svg("line", { x1: 195, y1: 442, x2: 195, y2: 476, class: "chain-line" });
    svg("line", { x1: 195, y1: 486, x2: 195, y2: 498, class: "chain-line" });
    svg("line", { x1: 195, y1: 508, x2: 195, y2: 520, class: "chain-line" });
    svg("line", { x1: 195, y1: 530, x2: 195, y2: 542, class: "chain-line" });
    svg("line", { x1: 195, y1: 558, x2: 195, y2: crossCy - 39, class: "chain-line" });
    bead(195, paterCy, 8, "pater", "Conta grande — Pai Nosso", {
      step: "2 · Pai Nosso",
      title: "Pai Nosso",
      text: PATER_TEXT
    });
    label(195, paterCy, "right", ["PAI NOSSO"]);
    [ave1Cy, ave2Cy, ave3Cy].forEach((y, i) => {
      const isLast = i === 2;
      bead(195, y, 5, "ave", `Ave Maria ${i + 1} de 3`, {
        step: isLast ? "5 · 3ª Ave Maria + Glória" : `${i + 3} · ${i + 1}ª Ave Maria`,
        title: isLast ? "Ave Maria + Glória" : "Ave Maria",
        text: isLast
          ? `${AVE_TEXT} (${OPENING_AVE_INTENTIONS[i]})\n\nE, em seguida: ${GLORIA_TEXT}`
          : `${AVE_TEXT} (${OPENING_AVE_INTENTIONS[i]})`
      });
    });
    label(195, ave2Cy, "left", ["AVE MARIA"]);

    // medalha de São Bento
    const medalCy = 415;
    svg("line", { x1: 195, y1: 380, x2: 195, y2: medalCy - 27, class: "chain-line" });
    const medal = svg("g", { class: "rosary-bead bead-medal" });
    medal.style.transformOrigin = `195px ${medalCy}px`;
    medal.innerHTML = `
      <circle class="medal-halo" cx="195" cy="${medalCy}" r="27" fill="none"/>
      <circle class="medal-ring" cx="195" cy="${medalCy}" r="25" fill="url(#metalGrad)"/>
      <circle class="medal-bg" cx="195" cy="${medalCy}" r="21"/>
      <path d="M195 ${medalCy - 14} v28 M181 ${medalCy} h28" class="medal-cross"/>
      <text x="195" y="${medalCy - 7}" text-anchor="middle" class="medal-text">C S P B</text>
      <text x="195" y="${medalCy + 12}" text-anchor="middle" class="medal-text">S. BENTO</text>`;
    makeInteractive(medal, "Medalha de São Bento — Salve Rainha", {
      step: "6 · Medalha de São Bento — Salve Rainha",
      title: "Salve Rainha",
      text: "Salve, Rainha, Mãe de misericórdia, vida, doçura e esperança nossa, salve! A vós bradamos, os degredados filhos de Eva; a vós suspiramos, gemendo e chorando neste vale de lágrimas. Eia, pois, advogada nossa, esses vossos olhos misericordiosos a nós volvei. E, depois deste desterro, mostrai-nos Jesus, bendito fruto do vosso ventre, ó clemente, ó piedosa, ó doce sempre Virgem Maria. Amém. E o sinal da cruz, para seguir pela coroa.\n\nAqui eu guardo a intenção: que São Bento guarde a nossa casa e o nosso caminho, e que a gente continue se escolhendo todos os dias. Por você, Eduarda."
    });
    label(195, medalCy - 12, "left", ["SALVE RAINHA"]);
    label(195, medalCy + 12, "right", ["SINAL DA CRUZ"]);

    // cinco dezenas ao redor da coroa
    let n = 6;
    const GAP_PATER_AVE = 8, GAP_AVE_AVE = 6, GAP_AVE_PATER = 9;
    const unitsPerDecade = GAP_PATER_AVE + 9 * GAP_AVE_AVE + GAP_AVE_PATER;
    const arcUnit = circumference / (unitsPerDecade * 5);
    const SEAM_OFFSET_UNITS = GAP_PATER_AVE + 4 * GAP_AVE_AVE + GAP_AVE_AVE / 2;
    let arcCursor = -SEAM_OFFSET_UNITS * arcUnit;
    SAO_BENTO_INVOCATIONS.forEach((invocation, d) => {
      const p = pointAtArc(arcCursor);
      n++;
      bead(p.x, p.y, 8, "pater", `Pai Nosso — ${d + 1}ª dezena`, {
        step: `${n} · Pai Nosso — ${d + 1}ª dezena`,
        title: `Pai Nosso · ${invocation.title}`,
        text: PATER_TEXT
      });
      label(p.x, p.y, p.x < cx ? "left" : "right", ["PAI NOSSO"]);
      arcCursor += arcUnit * GAP_PATER_AVE;
      for (let k = 1; k <= 10; k++) {
        const q = pointAtArc(arcCursor);
        n++;
        bead(q.x, q.y, 4.6, "ave", `${d + 1}ª dezena — ${invocation.title} ${k} de 10`, {
          step: `${n} · ${d + 1}ª dezena — ${k}/10`,
          title: invocation.title,
          text: invocation.text
        });
        if (k === 5) label(q.x, q.y, q.x < cx ? "left" : "right", invocation.labelLines);
        arcCursor += arcUnit * (k < 10 ? GAP_AVE_AVE : GAP_AVE_PATER);
      }
    });

    group.appendChild(frag);

    // interação
    const total = sequence.length;
    let current = -1;
    let completed = false;
    let completeTimer = null;

    const setCard = (step, title, text) => {
      if (stepEl) stepEl.textContent = step;
      if (titleEl) titleEl.textContent = title;
      if (textEl) textEl.textContent = text;
    };

    const paint = () => {
      sequence.forEach((s, i) => {
        s.el.classList.toggle("prayed", i < current);
        s.el.classList.toggle("current", i === current);
      });
    };

    const show = (index) => {
      if (index < 0 || index >= total) return;
      current = index;
      paint();
      const { data } = sequence[index];
      if (cardEl) {
        cardEl.classList.remove("pulse");
        void cardEl.offsetWidth;
        cardEl.classList.add("pulse");
      }
      setCard(data.step, data.title, data.text);
      if (countEl) countEl.textContent = `${index + 1} / ${total}`;
      if (fillEl) fillEl.style.transform = `scaleX(${(index + 1) / total})`;
      if (index === total - 1 && !completed) {
        completed = true;
        completeTimer = setTimeout(() => {
          setCard(
            "Terço de São Bento completo 💛",
            "Sinal da Cruz",
            "Em nome do Pai, do Filho e do Espírito Santo. Amém. E, no fim, um obrigado: por cada oração que eu fiz pensando em nós, Eduarda."
          );
          if (captionEl) captionEl.textContent = "Você concluiu este momento de oração. Toque em qualquer conta para revisitar uma intenção.";
          burstFrom(rosary, 24);
        }, 1200);
      }
    };

    // no celular o cartão da oração fica abaixo do terço: ao tocar numa conta, traz o texto para a tela
    const revealCard = () => {
      if (!cardEl || window.innerWidth > 650) return;
      const r = cardEl.getBoundingClientRect();
      if (r.top > window.innerHeight * 0.85) {
        cardEl.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "end" });
      }
    };

    sequence.forEach((s, i) => {
      s.el.addEventListener("click", (e) => {
        e.preventDefault();
        show(i);
        revealCard();
      });
      s.el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          show(i);
        }
      });
    });

    $("prayerNext")?.addEventListener("click", () => show(Math.min(current + 1, total - 1)));
    $("prayerReset")?.addEventListener("click", () => {
      clearTimeout(completeTimer);
      current = -1;
      completed = false;
      paint();
      setCard(
        "toque no crucifixo para começar",
        "Uma oração por nós dois",
        "Cada conta guarda uma intenção. Toque no crucifixo e siga comigo, colocando o nosso amor nas mãos de Deus."
      );
      if (countEl) countEl.textContent = `0 / ${total}`;
      if (fillEl) fillEl.style.transform = "scaleX(0)";
      if (captionEl) captionEl.textContent = ROSARY_START_CAPTION;
    });
    if (countEl) countEl.textContent = `0 / ${total}`;

    labelsToggle?.addEventListener("click", () => {
      const hidden = rosary.classList.toggle("labels-hidden");
      labelsToggle.setAttribute("aria-pressed", String(!hidden));
      labelsToggle.textContent = hidden ? "mostrar legendas" : "ocultar legendas";
    });
  }

  // ---------- contador do relacionamento ----------
  function initRelationshipCounter() {
    const counter = $("relationshipCounter");
    const start = new Date(counter?.dataset.start || "");
    if (Number.isNaN(start.getTime())) return;
    const daysEl = $("loveDays");
    const hoursEl = $("loveHours");
    const minutesEl = $("loveMinutes");
    const noteEl = $("counterNote");

    const update = () => {
      const totalMinutes = Math.floor(Math.max(0, Date.now() - start.getTime()) / 60000);
      if (daysEl) daysEl.textContent = String(Math.floor(totalMinutes / 1440));
      if (hoursEl) hoursEl.textContent = String(Math.floor((totalMinutes % 1440) / 60)).padStart(2, "0");
      if (minutesEl) minutesEl.textContent = String(totalMinutes % 60).padStart(2, "0");
    };
    if (noteEl) noteEl.textContent = "desde o começo da nossa história.";
    update();
    // atualiza na virada de cada minuto
    setTimeout(() => {
      update();
      setInterval(update, 60000);
    }, 60000 - (Date.now() % 60000));
  }

  // ---------- coração 3D (carregado depois que a página fica pronta) ----------
  function initHeart3d() {
    const heart = $("romanticHeart");
    const wrap = $("heroHeart3d");
    if (!heart) return;
    const conn = navigator.connection;
    if (conn && (conn.saveData || /2g/.test(conn.effectiveType || ""))) {
      wrap?.remove();
      return;
    }
    const load = async () => {
      try {
        await import("https://unpkg.com/@google/model-viewer@3.5.0/dist/model-viewer.min.js");
        heart.addEventListener("error", () => wrap?.remove(), { once: true });
        heart.src = heart.dataset.src;
        if (!reducedMotion) {
          heart.setAttribute("autoplay", "");
          heart.setAttribute("auto-rotate", "");
          heart.setAttribute("rotation-per-second", "12deg");
        }
      } catch {
        wrap?.remove();
      }
    };
    const schedule = () => ("requestIdleCallback" in window
      ? requestIdleCallback(load, { timeout: 2500 })
      : setTimeout(load, 600));
    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });
  }

  // ---------- início ----------
  initName();
  initAmbient();
  initReveal();
  initEnvelope();
  initChapterNav();
  initMemory();
  initTicTac();
  initMusic();
  initSushi();
  initRosary();
  initRelationshipCounter();
  initHeart3d();
  requestScrollUpdate();
})();
