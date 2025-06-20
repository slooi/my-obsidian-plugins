import { Plugin, Menu, TFile, Notice } from 'obsidian';

export default class ImageRightClickCopyPlugin extends Plugin {
	async onload() {
		// Add context menu item to images in preview
		this.registerDomEvent(document, 'contextmenu', async (event: MouseEvent) => {
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
							try {
								// Fetch the image as blob
								const response = await fetch(img.src);
								const blob = await response.blob();

								await navigator.clipboard.write([
									new ClipboardItem({ [blob.type]: blob }),
								]);

								new Notice('✅ Image copied to clipboard!');
							} catch (err) {
								console.error(err);
								new Notice('❌ Failed to copy image.');
							}
						});
				});

				// Open at mouse position
				menu.showAtPosition({ x: event.pageX, y: event.pageY });

				// Prevent default Obsidian menu
				event.preventDefault();
			}
		});
	}
}
