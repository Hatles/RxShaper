import {Plugin} from "./plugin";

export const exportPlugin: Plugin = (editor, options) => {
  const panels = editor.Panels;

  panels.addPanel({
    id: 'basic-actions',
    el: '.panel__basic-actions',
    buttons: [
      {
        id: 'export-button',
        className: 'btn-export-button',
        label: 'Export',
        command(editor) { alert('Hello World'); }
      }
    ]
  });
}
