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
							await copyImageToClipboardAsPng(img);
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