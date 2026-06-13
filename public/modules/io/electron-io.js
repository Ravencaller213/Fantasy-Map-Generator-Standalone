"use strict";

(function () {
  if (!window.electronAPI) return;

  /* ── 1. Mark document so electron-ui.css rules activate ── */
  document.documentElement.setAttribute("data-electron", "");

  /* ── 2. Inject the electron UI stylesheet ── */
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "electron-ui.css";
  document.head.appendChild(link);

  /* ── 3. Native file open dialog instead of browser file input ── */
  const mapToLoad = document.getElementById("mapToLoad");
  if (mapToLoad) {
    mapToLoad.click = async function () {
      const result = await window.electronAPI.openFile();
      if (!result.ok) return;
      const blob = new Blob([result.data]);
      uploadMap(blob);
    };
  }

  /* ── 4. Auto-show the options panel (no ► button needed) ── */
  const options = document.getElementById("options");
  if (options) options.style.display = "block";

  /* ── 5. Left/right panel placement based on tab position ── */
  function clearPanelSide() {
    document.querySelectorAll(".tabcontent").forEach(el => {
      el.classList.remove("panel-left", "panel-right");
    });
  }

  // Default: layers panel on the left
  const layersContent = document.getElementById("layersContent");
  if (layersContent) layersContent.classList.add("panel-left");

  document.querySelector("div.tab")?.addEventListener("click", function (event) {
    if (event.target.tagName !== "BUTTON") return;
    const btn = event.target;
    const rect = btn.getBoundingClientRect();
    const isLeft = (rect.left + rect.width / 2) < window.innerWidth / 2;
    setTimeout(() => {
      clearPanelSide();
      const visible = document.querySelector(".tabcontent[style*='block']");
      if (visible) visible.classList.add(isLeft ? "panel-left" : "panel-right");
    }, 0);
  });

  /* ── 6. File menu IPC handlers ── */
  window.electronAPI.onMenuNewMap(() => {
    if (typeof regeneratePrompt === "function") regeneratePrompt();
  });
  window.electronAPI.onMenuSave(() => {
    if (typeof saveMap === "function") saveMap("machine");
  });
  window.electronAPI.onMenuLoad(() => {
    if (mapToLoad) mapToLoad.click();
  });
  window.electronAPI.onMenuExport(() => {
    if (typeof showExportPane === "function") showExportPane();
  });

  /* ── 7. Hotkeys dialog ── */
  window.electronAPI.onShowHotkeys(() => showHotkeysDialog());

  function showHotkeysDialog() {
    const id = "electronHotkeysDialog";
    if (!document.getElementById(id)) {
      const el = document.createElement("div");
      el.id = id;
      el.innerHTML = buildHotkeysHTML();
      document.body.appendChild(el);
    }
    $("#" + id).dialog({
      title: "Hotkeys",
      resizable: false,
      width: 420,
      maxHeight: 600,
      position: {my: "center", at: "center", of: "svg"},
      buttons: {Close: function () { $(this).dialog("close"); }},
    });
  }

  function buildHotkeysHTML() {
    const sections = [
      ["General", [
        ["F1", "Hotkeys (this dialog)"], ["F2", "Generate new map"],
        ["F6 / Ctrl+S", "Save map to file"], ["F9", "Quick load from storage"],
        ["Tab", "Toggle options panel"], ["Escape", "Close dialogs"],
        ["Ctrl+Z / Ctrl+Y", "Undo / Redo"], ["Ctrl+Q", "Toggle save reminder"],
        ["0", "Reset zoom"], ["1–9", "Zoom to level"],
        ["Arrow keys", "Pan map"], ["+ / -", "Zoom in / out"],
        ["[ / ]", "Decrease / increase brush size"],
      ]],
      ["Editors (Shift or Alt+Shift)", [
        ["Shift+H", "Heightmap editor"], ["Shift+B", "Biomes editor"],
        ["Shift+S", "States editor"], ["Shift+P", "Provinces editor"],
        ["Shift+D", "Diplomacy editor"], ["Shift+L", "Coastline editor"],
        ["Shift+C", "Cultures editor"], ["Shift+N", "Namesbase editor"],
        ["Shift+Z", "Zones editor"], ["Shift+R", "Religions editor"],
        ["Shift+Y", "Emblem editor"], ["Shift+Q", "Units editor"],
        ["Shift+O", "Notes editor"],
      ]],
      ["Overviews (Shift or Alt+Shift)", [
        ["Shift+A", "Charts"], ["Shift+T", "Burgs"], ["Shift+U", "Routes"],
        ["Shift+V", "Rivers"], ["Shift+M", "Military"], ["Shift+K", "Markers"],
        ["Shift+E", "Cell details"],
      ]],
      ["Layer toggles", [
        ["X","Texture"],["H","Height"],["Q","Lakes"],["B","Biomes"],
        ["E","Cells"],["G","Grid"],["O","Coordinates"],["W","Compass"],
        ["V","Rivers"],["F","Relief icons"],["C","Cultures"],["S","States"],
        ["P","Provinces"],["Z","Zones"],["D","Borders"],["R","Religions"],
        ["U","Routes"],["T","Temperature"],["N","Population"],["J","Ice"],
        ["A","Precipitation"],["Y","Emblems"],["L","Labels"],["I","Burg icons"],
        ["M","Military"],["K","Markers"],["=","Rulers"],["/","Scale bar"],["[","Vignette"],
      ]],
      ["Tools", [
        ["!","Add burg"],["@","Add label"],["#","Add river"],["$","Create route"],["%","Add marker"],
      ]],
    ];

    let html = `<table style="border-collapse:collapse;width:100%;font-size:0.92em">
      <thead><tr>
        <th style="text-align:left;padding:4px 8px;border-bottom:1px solid #aaa;min-width:130px">Key</th>
        <th style="text-align:left;padding:4px 8px;border-bottom:1px solid #aaa">Action</th>
      </tr></thead><tbody>`;
    for (const [section, rows] of sections) {
      html += `<tr><td colspan="2" style="padding:6px 8px 2px;font-weight:600;color:#888;font-family:sans-serif">${section}</td></tr>`;
      for (const [key, action] of rows) {
        html += `<tr>
          <td style="padding:2px 8px;white-space:nowrap;font-family:monospace;color:#7a5c99">${key}</td>
          <td style="padding:2px 8px">${action}</td>
        </tr>`;
      }
    }
    return html + "</tbody></table>";
  }

  /* ── 8. About dialog ── */
  window.electronAPI.onShowAbout(() => showAboutDialog());

  function showAboutDialog() {
    const id = "electronAboutDialog";
    if (!document.getElementById(id)) {
      const el = document.createElement("div");
      el.id = id;
      // Clone the about content from the hidden tab
      const src = document.getElementById("aboutContent");
      el.innerHTML = src
        ? src.innerHTML
        : "<p>Fantasy Map Generator — standalone desktop edition.</p>";
      el.style.cssText = "max-width:460px;font-size:0.9em";
      document.body.appendChild(el);
    }
    $("#" + id).dialog({
      title: "About",
      resizable: false,
      width: 480,
      maxHeight: 560,
      position: {my: "center", at: "center", of: "svg"},
      buttons: {Close: function () { $(this).dialog("close"); }},
    });
  }
})();
