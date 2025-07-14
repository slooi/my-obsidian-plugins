import { Plugin, Menu, TFile, Notice, App, PluginManifest } from 'obsidian';
import { EditorState, Prec } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";

export default class MyToolKitPlugin extends Plugin {
	insertTabsOn: boolean;
	constructor(app: App, manifest: PluginManifest) {
		super(app, manifest);
		this.insertTabsOn = true
	}
	async onload() {
		// Add context menu item to images in preview
		this.registerDomEvent(document, 'contextmenu', async (event: MouseEvent) => {
			console.log("AAAAAAAAASKDJASKJDAKJSD ASDKJASH DKAHKDHASKDH")
			await imageRightClickCopyFeature(event)
		});

		// Create the keymap
		const keyBindings = [
			{
				key: "Tab",
				run: (view: EditorView) => {
					if (!this.insertTabsOn) return false;

					// Get editor from active view
					const editor = this.app.workspace.activeEditor?.editor;
					if (!editor) return false;

					editor.replaceSelection("\t");
					return true; // prevent further handling
				}
			},
			{
				key: "Mod-Shift-d",
				run: () => {
					this.insertTabsOn = !this.insertTabsOn;
					console.log("Toggled insertTabsOn:", this.insertTabsOn);
					new Notice(`Insert tab chars: ${renderTabToIndentStatusBar()}`);
					return true;
				}
			}
		];

		this.registerEditorExtension(
			Prec.highest(
				keymap.of(keyBindings)
			)
		);



		// ✅ Add icon to the status bar
		const statusBarItemEl = this.addStatusBarItem();

		const textSpan = document.createElement("span");
		const renderTabToIndentStatusBar = () => {
			const onOffText = `${this.insertTabsOn ? "ON" : "OFF"}`
			textSpan.textContent = `Insert tab chars: ${onOffText}`;
			return onOffText
		}
		statusBarItemEl.appendChild(textSpan);
		statusBarItemEl.addClass("toggle-tab-feature")
		statusBarItemEl.insertAdjacentHTML("afterend", "<style>.toggle-tab-feature:hover{background-color:var(--background-modifier-hover)}</style>")
		statusBarItemEl.addEventListener("click", e => {
			this.insertTabsOn = !this.insertTabsOn
			console.log("this.insertTabsOn", this.insertTabsOn)
			renderTabToIndentStatusBar()
		})
		renderTabToIndentStatusBar()
		// Text next to it:


	}
}


async function imageRightClickCopyFeature(event: MouseEvent) {
	const target = event.target as HTMLElement;

	// Only trigger on <img> elements
	if (target.tagName === 'IMG') {
		const img = target as HTMLImageElement;

		// Create our own menu
		const menu = new Menu();
		menu.addItem((item) => {
			item.setIcon('clipboard-copy')
				.setTitle('Copy to clipboard')
				.onClick(async () => {
					await copyImageToClipboardAsPng(img);
				});
		});

		// Open at mouse position
		menu.showAtPosition({ x: event.pageX, y: event.pageY });

		// Prevent default Obsidian menu
		event.preventDefault();
	}
}

function copyImageToClipboardAsPng(img: HTMLImageElement) {
	try {
		const image = new Image();
		image.crossOrigin = 'anonymous'; // helps with some src issues
		image.src = img.src;

		image.onload = async () => {
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');
			canvas.width = image.naturalWidth;
			canvas.height = image.naturalHeight;

			if (!ctx) {
				new Notice('❌ Failed to get canvas context.');
				return;
			}

			ctx.drawImage(image, 0, 0);
			canvas.toBlob(async (blob) => {
				if (!blob) {
					new Notice('❌ Failed to convert image to PNG.');
					return;
				}

				await navigator.clipboard.write([
					new ClipboardItem({ 'image/png': blob })
				]);

				new Notice('✅ Image copied!');
			}, 'image/png');
		};

		image.onerror = () => {
			new Notice('❌ Failed to load image.');
		};
	} catch (err) {
		console.error(err);
		new Notice('❌ Failed to copy image.');
	}
}