/* eslint-disable prefer-const */
/* eslint-disable no-unused-vars */
/* eslint-disable no-inline-comments */
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require ('fs');

const height = 800;
const width = 600;
const margin = 50;
const fontSize = 12;

async function createFile() {
	const pdfDoc = await PDFDocument.create();
	const page = pdfDoc.addPage([width, height]);
	const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
	let y = height;
	const maxWidth = width - 2 * margin;
	const headers = ['Header 1', 'Header 2', 'Header 3'];
	const data = [
		['Row 1 Col 1', 'Row 1 Col 2', 'Row 1 Col 3'],
		['Row 2 Col 1', 'Row 2 Col 2', 'Row 2 Col 3'],
		['Row 3 Col 1', 'Row 3 Col 2', 'Row 3 Col 3'],
		['Row 4 Col 1', 'Row 4 Col 2', 'Row 4 Col 3'],
		['Row 5 Col 1', 'Row 5 Col 2', 'Row 5 Col 3'],
		['Row 6 Col 1', 'Row 6 Col 2', 'Row 6 Col 3'],
		['Row 1 Col 1', 'Row 1 Col 2', 'Row 1 Col 3'],
		['Row 2 Col 1', 'Row 2 Col 2', 'Row 2 Col 3'],
		['Row 3 Col 1', 'Row 3 Col 2', 'Row 3 Col 3'],
		['Row 4 Col 1', 'Row 4 Col 2', 'Row 4 Col 3'],
		['Row 5 Col 1', 'Row 5 Col 2', 'Row 5 Col 3'],
		['Row 6 Col 1', 'Row 6 Col 2', 'Row 6 Col 3'],
		['Row 1 Col 1', 'Row 1 Col 2', 'Row 1 Col 3'],
		['Row 2 Col 1', 'Row 2 Col 2', 'Row 2 Col 3'],
		['Row 3 Col 1', 'Row 3 Col 2', 'Row 3 Col 3'],
		['Row 4 Col 1', 'Row 4 Col 2', 'Row 4 Col 3'],
		['Row 5 Col 1', 'Row 5 Col 2', 'Row 5 Col 3'],
		['Row 6 Col 1', 'Row 6 Col 2', 'Row 6 Col 3'],
		['Row 1 Col 1', 'Row 1 Col 2', 'Row 1 Col 3'],
		['Row 2 Col 1', 'Row 2 Col 2', 'Row 2 Col 3'],
		['Row 3 Col 1', 'Row 3 Col 2', 'Row 3 Col 3'],
		['Row 4 Col 1', 'Row 4 Col 2', 'Row 4 Col 3'],
		['Row 5 Col 1', 'Row 5 Col 2', 'Row 5 Col 3'],
		['Row 6 Col 1', 'Row 6 Col 2', 'Row 6 Col 3'],
		['Row 1 Col 1', 'Row 1 Col 2', 'Row 1 Col 3'],
		['Row 2 Col 1', 'Row 2 Col 2', 'Row 2 Col 3'],
		['Row 3 Col 1', 'Row 3 Col 2', 'Row 3 Col 3'],
		['Row 4 Col 1', 'Row 4 Col 2', 'Row 4 Col 3'],
		['Row 5 Col 1', 'Row 5 Col 2', 'Row 5 Col 3'],
		['Row 6 Col 1', 'Row 6 Col 2', 'Row 6 Col 3'],
		['Row 1 Col 1', 'Row 1 Col 2', 'Row 1 Col 3'],
		['Row 2 Col 1', 'Row 2 Col 2', 'Row 2 Col 3'],
		['Row 3 Col 1', 'Row 3 Col 2', 'Row 3 Col 3'],
		['Row 4 Col 1', 'Row 4 Col 2', 'Row 4 Col 3'],
		['Row 5 Col 1', 'Row 5 Col 2', 'Row 5 Col 3'],
		['Row 6 Col 1', 'Row 6 Col 2', 'Row 6 Col 3'],
		['Row 1 Col 1', 'Row 1 Col 2', 'Row 1 Col 3'],
		['Row 2 Col 1', 'Row 2 Col 2', 'Row 2 Col 3'],
		['Row 3 Col 1', 'Row 3 Col 2', 'Row 3 Col 3'],
		['Row 4 Col 1', 'Row 4 Col 2', 'Row 4 Col 3'],
		['Row 5 Col 1', 'Row 5 Col 2', 'Row 5 Col 3'],
		['Row 6 Col 1', 'Row 6 Col 2', 'Row 6 Col 3'],
		['Row 1 Col 1', 'Row 1 Col 2', 'Row 1 Col 3'],
		['Row 2 Col 1', 'Row 2 Col 2', 'Row 2 Col 3'],
		['Row 3 Col 1', 'Row 3 Col 2', 'Row 3 Col 3'],
		['Row 4 Col 1', 'Row 4 Col 2', 'Row 4 Col 3'],
		['Row 5 Col 1', 'Row 5 Col 2', 'Row 5 Col 3'],
		['Row 6 Col 1', 'Row 6 Col 2', 'Row 6 Col 3'],
	];
	y = await createImage('./Files/banner.png', page, pdfDoc, 0, y, 600, 50);
	y = await createTable(headers, data, page, pdfDoc, margin, font, fontSize, y, maxWidth);
	const pdfBytes = await pdfDoc.save();
	fs.writeFileSync('./Files/file.pdf', pdfBytes);
}
async function createImage(imagePath, page, pdfDoc, y, imgX, imgY) {
	const imgBytes = fs.readFileSync(imagePath);
	const img = await pdfDoc.embedPng(imgBytes);
	y -= imgY;
	if (y < margin) {
		y = height;
		page = pdfDoc.addPage([width, height]);
		y = await createImage('./Files/banner.png', page, pdfDoc, 0, y, width, margin);
	}
	page.drawImage(img, {
		x: margin,
		y,
		width:imgX,
		height:imgY,
	});
	y -= 30;
	return y;
}

async function createTable(headers, data, page, pdfDoc, font, y, maxWidth) {
	const cellWidth = maxWidth / data[0].length;
	const cellHeight = 20;
	drawTableRow(page, headers, margin, y, cellWidth, cellHeight, font, fontSize, true);
	for (let i = 0; i < data.length; i++) {
		y -= cellHeight;
		if (y < margin) {
			y = height;
			page = pdfDoc.addPage([width, height]);
			y = await createImage('./Files/banner.png', page, pdfDoc, 0, y, width, margin);
		}
		drawTableRow(page, data[i], margin, y, cellWidth, cellHeight, font, fontSize, false, i % 2 === 0);
	}
	y -= 30;
	return y;
}

function drawTableRow(page, row, startX, y, cellWidth, cellHeight, font, isHeader, isEven) {
	const color = rgb(0, 0, 0);
	const bgColor = isHeader ? rgb(0.0706, 0.3686, 0.1608) : isEven ? rgb(1, 1, 1) : rgb(0.83922, 1, 0.79608);
	const fontColor = isHeader ? rgb(1, 1, 1) : rgb(0, 0, 0);
	row.forEach((cell, i) => {
		const x = startX + i * cellWidth;
		page.drawRectangle({
			x,
			y: y - cellHeight,
			width: cellWidth,
			height: cellHeight,
			color: bgColor,
		});
		page.drawRectangle({
			x,
			y: y - cellHeight,
			width: cellWidth,
			height: cellHeight,
			borderWidth: 1,
			borderColor: color,
		});
		page.drawText(cell, {
			x: x + 5,
			y: y - cellHeight + (cellHeight - fontSize) / 2,
			size: fontSize,
			font: font,
			color: fontColor,
		});
	});
}

createFile();