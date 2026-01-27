(async () => {
  const mount = document.getElementById("kb-stage");
  if (!mount || mount.dataset.kobashiInit === "1") return;
  mount.dataset.kobashiInit = "1";
  if (mount.querySelector("canvas")) return;

  const W = 720, H = 720;
  const IMG_A = "https://i.imgur.com/WBM4T7S.png";
  const IMG_B = "https://i.imgur.com/tFFXneb.png";
  const IMG_PAGE = "https://i.imgur.com/mynccVj.png";
  const JSON_URL = "https://akaired.github.io/kobashi-sheet/diary.json";

  if (document.fonts?.ready) await document.fonts.ready;
  if (typeof PIXI === "undefined") return;

  const app = new PIXI.Application();
  await app.init({ width: W, height: H, backgroundAlpha: 0, antialias: true });
  mount.appendChild(app.canvas);

  const stage = new PIXI.Container();
  app.stage.addChild(stage);

  const sceneIntro = new PIXI.Container();
  const sceneDiary = new PIXI.Container();
  sceneDiary.visible = false;
  stage.addChild(sceneIntro, sceneDiary);

  /* =======================
     DIARY DATA
  ======================= */
  let diaryData = null;
  async function loadDiaryJSON() {
    if (diaryData) return diaryData;
    const r = await fetch(JSON_URL, { cache: "no-store" });
    diaryData = await r.json();
    diaryData.chapters.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
    return diaryData;
  }

  /* =======================
     DIARY UI
  ======================= */
  const diaryRoot = new PIXI.Container();
  sceneDiary.addChild(diaryRoot);

  diaryRoot.addChild(new PIXI.Graphics().rect(0, 0, W, H).fill(0x050505));

  const pageTex = await PIXI.Assets.load(IMG_PAGE);
  const page = new PIXI.Sprite(pageTex);
  page.anchor.set(0.5);
  page.x = W / 2;
  page.y = H / 2;
  page.scale.set(Math.max(W / pageTex.width, H / pageTex.height));
  diaryRoot.addChild(page);

  const titleText = new PIXI.Text({
    text: "",
    style: {
      fontFamily: "Cormorant Garamond",
      fontSize: 34,
      fontWeight: "700",
      fill: "#2b1b12"
    }
  });
  titleText.position.set(220, 86);
  diaryRoot.addChild(titleText);

  const bodyText = new PIXI.Text({
    text: "",
    style: {
      fontFamily: "Cormorant Garamond",
      fontSize: 22,
      fill: "#2b1b12",
      wordWrap: true,
      wordWrapWidth: 420,
      lineHeight: 28
    }
  });
  bodyText.position.set(220, 140);
  diaryRoot.addChild(bodyText);

  /* =======================
     STATE (3 LIVELLI)
  ======================= */
  const state = {
    chapterIndex: 0,
    pageIndex: 0,
    blockIndex: 0
  };

  function currentChapter() {
    return diaryData.chapters[state.chapterIndex];
  }

  function currentPage() {
    return currentChapter().pages[state.pageIndex];
  }

  function currentBlock() {
    return currentPage().content[state.blockIndex];
  }

  /* =======================
     RENDER
  ======================= */
  function renderDiary() {
    const ch = currentChapter();
    const pg = currentPage();
    const blk = currentBlock();

    titleText.text = pg.title || ch.tabLabel;

    if (!blk) {
      bodyText.text = "";
      return;
    }

    if (blk.type === "h1") {
      bodyText.text = blk.text.toUpperCase();
    } else if (blk.type === "p") {
      bodyText.text = blk.text;
    } else if (blk.type === "list") {
      bodyText.text = blk.items.map(x => "• " + x).join("\n");
    }
  }

  /* =======================
     NAVIGATION
  ======================= */
  function next() {
    const ch = currentChapter();
    const pg = currentPage();

    if (state.blockIndex < pg.content.length - 1) {
      state.blockIndex++;
    } else if (state.pageIndex < ch.pages.length - 1) {
      state.pageIndex++;
      state.blockIndex = 0;
    } else if (state.chapterIndex < diaryData.chapters.length - 1) {
      state.chapterIndex++;
      state.pageIndex = 0;
      state.blockIndex = 0;
    }
    renderDiary();
  }

  function prev() {
    if (state.blockIndex > 0) {
      state.blockIndex--;
    } else if (state.pageIndex > 0) {
      state.pageIndex--;
      state.blockIndex = currentPage().content.length - 1;
    } else if (state.chapterIndex > 0) {
      state.chapterIndex--;
      state.pageIndex = currentChapter().pages.length - 1;
      state.blockIndex = currentPage().content.length - 1;
    }
    renderDiary();
  }

  /* =======================
     BUTTONS
  ======================= */
  const btnPrev = new PIXI.Text("◀", { fill: "#f0e1c8", fontSize: 26 });
  const btnNext = new PIXI.Text("▶", { fill: "#f0e1c8", fontSize: 26 });

  btnPrev.position.set(300, H - 72);
  btnNext.position.set(W - 330, H - 72);

  btnPrev.eventMode = btnNext.eventMode = "static";
  btnPrev.cursor = btnNext.cursor = "pointer";

  btnPrev.on("pointerdown", prev);
  btnNext.on("pointerdown", next);

  diaryRoot.addChild(btnPrev, btnNext);

  /* =======================
     OPEN / CLOSE
  ======================= */
  function openDiary() {
    sceneIntro.visible = false;
    sceneDiary.visible = true;
    renderDiary();
  }

  function closeDiary() {
    sceneDiary.visible = false;
    sceneIntro.visible = true;
  }

  await loadDiaryJSON();
  openDiary();
})();
