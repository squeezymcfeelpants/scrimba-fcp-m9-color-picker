//
const apiModes = [
	{
		apiName: 'monochrome',
		label: 'Monochrome',
	},
	{
		apiName: 'monochrome-dark',
		label: 'Monochrome Dark',
	},
	{
		apiName: 'monochrome-light',
		label: 'Monochrome Light',
	},
	{
		apiName: 'analogic',
		label: 'Analogic',
	},
	{
		apiName: 'complement',
		label: 'Complement',
	},
	{
		apiName: 'analogic-complement',
		label: 'Analogic Complement',
	},
	{
		apiName: 'triad',
		label: 'Triad',
	},
	{
		apiName: 'quad',
		label: 'Quad',
	},
];

//
const wedgeContainer = document.getElementById('wedges');
const colorPicker = document.getElementById('color-control');
const colorPickerLabel = document.getElementById('color-control-label');
const modeControl = document.getElementById('mode-control');
const getButton = document.getElementById('get-button');
const messageEl = document.getElementById('message');

//
let updating = false;

//
async function fetchColorSchemeAndUpdate(ev) {
	if (updating) {
		return
	};

	updating = true;
	
	wedgeContainer.classList.add('ghost');
	await wait(300);

	preUpdate();

	const color = (colorPicker.value || '#ffffff').slice(-6);
	const mode = modeControl.value || apiModes[0].apiName;

	fetch(`https://www.thecolorapi.com/scheme?hex=${color}&format=json&mode=${mode}&count=5`)
		.then(res => res.json())
		.then(data => {
			if (data && data.colors) {
				updateColorWedges(data.colors);
			}
		});
}

//
function preUpdate() {
	// hide elements that get hidden on update
	document.querySelectorAll('.hide-on-update').forEach(el => {
		el.classList.add('hide');
	});

	// reset the animation
	document.querySelectorAll('.wedge-piece').forEach(el => {
		el.classList.remove('anim');
	});

	// hide the color labels
	document.querySelectorAll('.wedge-label').forEach(el => {
		el.classList.add('ghost');
	});
}

//
async function updateColorWedges(colors) {
	if (colors) {
		await wait(100);

		// update colors and text
		for (let i = 0; (i < colors.length) && (i < 5); ++i) {
			const color = colors[i].hex.value;

			const piece = document.querySelector(`.wedge-piece[data-id="${i}"]`);
			piece.style.setProperty('--color', color);
			piece.classList.add('anim');

			document.querySelector(`.wedge-label[data-id="${i}"]`).textContent = color;
		}

		wedgeContainer.classList.remove('ghost');

		// show all hidden elements
		document.querySelectorAll('.hide-on-update').forEach(el => {
			el.classList.remove('hide');
		});
		await wait(1000);	// wedge animation

		// show the color labels
		document.querySelectorAll('.wedge-label').forEach(el => {
			el.classList.remove('ghost');
		});

	
		updating = false;
	}
	else {
		updating = false;
	}
}

//
function wait(delayMs) {
	return new Promise((resolve) => {
		setTimeout(resolve, delayMs);
	});
}

//
function displayMessage(msg) {
	messageEl.textContent = msg;
}

//
function updateColorPickerColor(ev) {
	colorPickerLabel.style.backgroundColor = colorPicker.value;
}

//
function onCopyColor(ev) {
	const color = ev.currentTarget.textContent;
	navigator.clipboard.writeText(color)
		.then(() => {
			displayMessage(`Copied ${color} to clipboard`);
		});
}

//
function configModeSelector(modes) {
	document.getElementById('mode-control').innerHTML = modes
		.map(({ apiName, label }) => (`<option value="${apiName}">${label}</option>`))
		.join('');
}

//
function drawWedges() {
	let h = '';
	for (let i = 0; i < 5; ++i) {
		h +=
		`
<div class="wedge-piece hide-on-update hide" data-id="${i}" >
	<svg class="wedge-svg" data-id="${i}" width="200" height="200">
		<path d="M 201 201 L 0 201 A 200 200, 0, 0, 1, 138.6 10.0 L 201 201"/>
	</svg>
	<p class="wedge-label" data-id="${i}">#BADD0${i + 1}</p>
</div>
		`;
	}

	h += `
	<div class="hub hide-on-update hide"></div>
	`;
	
	wedgeContainer.innerHTML = h;
}

//
colorPicker.addEventListener('input', updateColorPickerColor);
getButton.addEventListener('click', fetchColorSchemeAndUpdate);

//
updateColorPickerColor();
configModeSelector(apiModes);
drawWedges();
displayMessage('');

//
document.querySelectorAll('.wedge-label').forEach((el) => {
	el.addEventListener('click', onCopyColor);
});
