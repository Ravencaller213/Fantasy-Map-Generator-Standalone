"use strict";

if (window.electronAPI) {
  // Native file open dialog instead of browser file input
  const mapToLoad = document.getElementById("mapToLoad");
  if (mapToLoad) {
    mapToLoad.click = async function () {
      const result = await window.electronAPI.openFile();
      if (!result.ok) return;
      const blob = new Blob([result.data]);
      uploadMap(blob);
    };
  }

  // Hotkeys dialog triggered from the Help menu
  window.electronAPI.onShowHotkeys(() => showHotkeysDialog());
}

function showHotkeysDialog() {
  const id = "electronHotkeysDialog";
  if (!document.getElementById(id)) {
    const el = document.createElement("div");
    el.id = id;
    el.innerHTML = `
      <table style="border-collapse:collapse;width:100%;font-size:0.95em">
        <thead><tr>
          <th style="text-align:left;padding:4px 8px;border-bottom:1px solid #aaa">Key</th>
          <th style="text-align:left;padding:4px 8px;border-bottom:1px solid #aaa">Action</th>
        </tr></thead>
        <tbody>
          <tr><td colspan="2" style="padding:6px 8px 2px;font-weight:600;color:#888">General</td></tr>
          <tr><td>F1</td><td>Hotkeys (this dialog)</td></tr>
          <tr><td>F2</td><td>Generate new map</td></tr>
          <tr><td>F6 / Ctrl+S</td><td>Save map to file</td></tr>
          <tr><td>F9</td><td>Quick load from storage</td></tr>
          <tr><td>Tab</td><td>Toggle options panel</td></tr>
          <tr><td>Escape</td><td>Close dialogs</td></tr>
          <tr><td>Ctrl+Z / Ctrl+Y</td><td>Undo / Redo</td></tr>
          <tr><td>Ctrl+Q</td><td>Toggle save reminder</td></tr>
          <tr><td>0</td><td>Reset zoom</td></tr>
          <tr><td>1–9</td><td>Zoom to level</td></tr>
          <tr><td>Arrow keys</td><td>Pan map</td></tr>
          <tr><td>+ / -</td><td>Zoom in / out (or adjust brush)</td></tr>
          <tr><td>[ / ]</td><td>Decrease / increase brush size</td></tr>
          <tr><td colspan="2" style="padding:6px 8px 2px;font-weight:600;color:#888">Editors (Shift or Alt+Shift)</td></tr>
          <tr><td>Shift+H</td><td>Heightmap editor</td></tr>
          <tr><td>Shift+B</td><td>Biomes editor</td></tr>
          <tr><td>Shift+S</td><td>States editor</td></tr>
          <tr><td>Shift+P</td><td>Provinces editor</td></tr>
          <tr><td>Shift+D</td><td>Diplomacy editor</td></tr>
          <tr><td>Shift+L</td><td>Coastline editor</td></tr>
          <tr><td>Shift+C</td><td>Cultures editor</td></tr>
          <tr><td>Shift+N</td><td>Namesbase editor</td></tr>
          <tr><td>Shift+Z</td><td>Zones editor</td></tr>
          <tr><td>Shift+R</td><td>Religions editor</td></tr>
          <tr><td>Shift+Y</td><td>Emblem editor</td></tr>
          <tr><td>Shift+Q</td><td>Units editor</td></tr>
          <tr><td>Shift+O</td><td>Notes editor</td></tr>
          <tr><td colspan="2" style="padding:6px 8px 2px;font-weight:600;color:#888">Overviews (Shift or Alt+Shift)</td></tr>
          <tr><td>Shift+A</td><td>Charts overview</td></tr>
          <tr><td>Shift+T</td><td>Burgs overview</td></tr>
          <tr><td>Shift+U</td><td>Routes overview</td></tr>
          <tr><td>Shift+V</td><td>Rivers overview</td></tr>
          <tr><td>Shift+M</td><td>Military overview</td></tr>
          <tr><td>Shift+K</td><td>Markers overview</td></tr>
          <tr><td>Shift+E</td><td>Cell details</td></tr>
          <tr><td colspan="2" style="padding:6px 8px 2px;font-weight:600;color:#888">Layer toggles</td></tr>
          <tr><td>X</td><td>Texture</td></tr>
          <tr><td>H</td><td>Height</td></tr>
          <tr><td>Q</td><td>Lakes</td></tr>
          <tr><td>B</td><td>Biomes</td></tr>
          <tr><td>E</td><td>Cells</td></tr>
          <tr><td>G</td><td>Grid</td></tr>
          <tr><td>O</td><td>Coordinates</td></tr>
          <tr><td>W</td><td>Compass</td></tr>
          <tr><td>V</td><td>Rivers</td></tr>
          <tr><td>F</td><td>Relief icons</td></tr>
          <tr><td>C</td><td>Cultures</td></tr>
          <tr><td>S</td><td>States</td></tr>
          <tr><td>P</td><td>Provinces</td></tr>
          <tr><td>Z</td><td>Zones</td></tr>
          <tr><td>D</td><td>Borders</td></tr>
          <tr><td>R</td><td>Religions</td></tr>
          <tr><td>U</td><td>Routes</td></tr>
          <tr><td>T</td><td>Temperature</td></tr>
          <tr><td>N</td><td>Population</td></tr>
          <tr><td>J</td><td>Ice</td></tr>
          <tr><td>A</td><td>Precipitation</td></tr>
          <tr><td>Y</td><td>Emblems</td></tr>
          <tr><td>L</td><td>Labels</td></tr>
          <tr><td>I</td><td>Burg icons</td></tr>
          <tr><td>M</td><td>Military</td></tr>
          <tr><td>K</td><td>Markers</td></tr>
          <tr><td>=</td><td>Rulers</td></tr>
          <tr><td>/</td><td>Scale bar</td></tr>
          <tr><td>[</td><td>Vignette</td></tr>
          <tr><td colspan="2" style="padding:6px 8px 2px;font-weight:600;color:#888">Tools</td></tr>
          <tr><td>!</td><td>Add burg</td></tr>
          <tr><td>@</td><td>Add label</td></tr>
          <tr><td>#</td><td>Add river</td></tr>
          <tr><td>$</td><td>Create route</td></tr>
          <tr><td>%</td><td>Add marker</td></tr>
        </tbody>
      </table>`;
    el.querySelectorAll("td:first-child").forEach(td => {
      td.style.cssText = "padding:3px 8px;white-space:nowrap;font-family:monospace;color:#c8a;min-width:120px";
    });
    el.querySelectorAll("td:last-child").forEach(td => {
      td.style.cssText = "padding:3px 8px";
    });
    document.body.appendChild(el);
  }

  $(`#${id}`).dialog({
    title: "Hotkeys",
    resizable: false,
    width: 420,
    maxHeight: 600,
    position: {my: "center", at: "center", of: "svg"},
    buttons: {Close: function () { $(this).dialog("close"); }}
  });
}
