let submitClicked;
let repeated = {
	"name": false,
	"email": false
}

const updateMembersWidth = () => document.getElementById("members").style.width = parseInt(document.getElementById("members").children[0].offsetWidth)+parseInt(getComputedStyle(document.getElementById("members").children[0]).getPropertyValue('padding'))+"px";
updateMembersWidth();

const insertUrlParam = (key, value) => {
	let searchParams = new URLSearchParams(window.location.search);
	searchParams.set(key, value);
	let newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?' + searchParams.toString();
	window.history.replaceState({}, '', newurl);
}

const updateNmrMembersElem = () => {
	if (document.getElementsByClassName("delete-icon"))
		nmrMembers = document.getElementsByClassName("delete-icon").length;
	document.getElementById("nmr-members").innerText = "Participantes: "+nmrMembers;
	insertUrlParam("members", nmrMembers);
}

const updateNmrGenders = () => {
	// timeout to make sure htmlcollection is not empty
	if (document.getElementById("nmr-males")) setTimeout(() => document.getElementById("nmr-males").innerText = `Masculinos: ${Array.from(document.getElementsByTagName("select")).filter(select => select.value == "Masculino").length}`, 0);
	if (document.getElementById("nmr-females")) setTimeout(() => document.getElementById("nmr-females").innerText = `Femininos: ${Array.from(document.getElementsByTagName("select")).filter(select => select.value == "Feminino").length}`, 0);
}

const updatePlusButton = () => {
	const btn = document.getElementsByClassName("plus")[0];
	if (btn) {
		if (nmrMembers < 100) {
			btn.style.removeProperty("cursor");
			btn.style.removeProperty("opacity");
			btn.children[0].title = "Adicionar Novo Membro";
		}
		else {
			btn.style.cursor = "not-allowed";
			btn.style.opacity = "0.3";
			btn.children[0].title = "Atingido Limite Máximo de Membros";
		}
	}
}
updatePlusButton();

const genderSelector = () => {
	const selector = document.createElement("select");
	selector.name = "gender";
	const female = document.createElement("option");
	selector.appendChild(female);
	female.appendChild(document.createTextNode("Feminino"));
	const male = document.createElement("option");
	selector.appendChild(male);
	male.appendChild(document.createTextNode("Masculino"));
	return selector;
}

const updateGender = () => {
	insertUrlParam("gender", gender);
	if (gender) {
		Array.from(document.getElementsByClassName("member"))
			.forEach(member => {
				member.insertBefore(genderSelector(), member.children[member.childElementCount-1]);
			});
	}
	else {
		Array.from(document.getElementsByTagName("select"))
			.forEach(select => select.remove());
	}
	updateMembersWidth();
}

document.getElementsByClassName("side-menu")[0].style.height = (document.documentElement.scrollHeight-document.getElementsByClassName("top")[0].offsetHeight)+"px";

const hamburgerWrapper = document.getElementsByClassName("hamburger-menu")[0];
hamburgerWrapper.addEventListener("click", () => {
	const sideMenu = document.getElementsByClassName("side-menu")[0];
	if (!hamburgerWrapper.classList.contains("hamburger-menu-clicked")) {
		hamburgerWrapper.classList.add("hamburger-menu-clicked");
		sideMenu.classList.remove("side-menu-hidden-left");
		document.getElementsByClassName("hamburger-menu-alert")[0].style.display = "none";
	}
	else {
		hamburgerWrapper.classList.remove("hamburger-menu-clicked");
		sideMenu.classList.add("side-menu-hidden-left");
		if (!document.getElementById("admin-form").checkValidity())
			document.getElementsByClassName("hamburger-menu-alert")[0].style.removeProperty("display");
	}
});

if (window.innerWidth > 1215) {
	setTimeout(() => {
		hamburgerWrapper.dispatchEvent(new MouseEvent("click", {
			"view": window,
			"bubbles": true,
			"cancelable": false
		}));
	}, 500);
}

document.getElementsByClassName("plus")[0].addEventListener("click", e => {
	if (nmrMembers < 100) {
		// add more members
		nmrMembers++;

		const wrapper = document.createElement("div");
		document.getElementById("members").appendChild(wrapper);
		wrapper.classList.add("member");

		const avatar = document.createElement("img");
		wrapper.appendChild(avatar);
		avatar.src="../static/images/gift.png";
		avatar.alt="user";
		avatar.style.opacity="0.3";

		const name = document.createElement("input");
		wrapper.appendChild(name);
		name.type = "text";
		name.placeholder = "Name";
		name.name = "name";
		name.required = true;

		const email = document.createElement("input");
		wrapper.appendChild(email);
		email.type = "email";
		email.placeholder = "Email";
		email.name = "email";
		email.required = true;

		if (gender) wrapper.appendChild(genderSelector());

		const binWrapper = document.createElement("div");
		wrapper.appendChild(binWrapper);
		binWrapper.classList.add("delete-icon");
		const bin = document.createElement("img");
		binWrapper.appendChild(bin);
		bin.src = "../static/images/trash.png";
		bin.title = "Remove Member";
		bin.alt = "Remove";

		// enabled bins that are disabled
		const bins = document.getElementsByClassName("delete-icon");
		if (bins.length > 2) Array.from(bins).forEach(bin => bin.classList.remove("disabled"));
		else binWrapper.classList.add("disabled");

		updateMembersWidth();
		updateNmrMembersElem();
		updateNmrGenders();

		const members = document.getElementById("members");
		members.scroll(0, members.offsetHeight);
	}

	updatePlusButton();
});

document.getElementById("submit-btn").addEventListener("click", () => {
	if (!document.getElementById("admin-email").checkValidity()) {
		const sideMenu = document.getElementsByClassName("side-menu")[0];
		if (sideMenu.classList.contains("side-menu-hidden-left"))
			hamburgerWrapper.dispatchEvent(new MouseEvent("click", {
				"view": window,
				"bubbles": true,
				"cancelable": false
			}));
		setTimeout(() => document.getElementById("admin-form").reportValidity(), 500);
	}
	submitClicked = true;
});

document.getElementById("copy-link-btn").addEventListener("click", e => {
	const target = e.target.parentElement;
	if (window.navigator.clipboard) {
		window.navigator.clipboard.writeText(window.location.href).
			then(() => {
				target.classList.add("hex-62bb9a");
				target.style.transition = "0.5s";
				target.style.transform = "scale(1.4)";
				setTimeout(() => {
					target.classList.remove("hex-62bb9a");
					target.style.removeProperty("transition");
					target.style.removeProperty("transform");
				}, 1000);
			});
	}
	else {
		alert("Can't use navigator clipboard in insecure connection!");
	}
});

document.getElementById("admin-form").getElementsByTagName("input")[0].addEventListener("input", e => document.getElementById("admin-email").value = e.target.value);
document.getElementById("admin-form").getElementsByTagName("input")[1].addEventListener("input", e => document.getElementById("ss-date").value = e.target.value);

if (gender) {
	let time = window.innerWidth > 720 ? 700 : 0;
	setTimeout(() => {
		document.getElementById("consider-gender-btn").dispatchEvent(new MouseEvent("click", {
			"view": window,
			"bubbles": false,
			"cancelable": false
		}));
	}, time);
}

const considerGender = document.getElementById("consider-gender");
document.getElementById("consider-gender-btn").addEventListener("click", e => {
	// disable gender
	if (e.target.classList.contains("checkbox-enabled")) {
		e.target.classList.remove("checkbox-enabled");
		gender = false;

		if (document.getElementById("nmr-males")) document.getElementById("nmr-males").parentElement.remove();
		if (document.getElementById("nmr-females")) document.getElementById("nmr-females").parentElement.remove();
	}
	// enable gender
	else {
		e.target.classList.add("checkbox-enabled");
		gender = true;

		// get second side menu section
		const section = document.getElementsByClassName("side-menu-section")[1].getElementsByClassName("side-menu-listings")[0];
		if (section) {
			[
				{
					id: "nmr-males",
					img_src: "../static/images/male.png"
				},
				{
					id: "nmr-females",
					img_src: "../static/images/female.png"
				}
			].forEach(listing => {
				const wrapper = document.createElement("div");
				section.appendChild(wrapper);
				wrapper.classList.add("listing-row");
				const img = document.createElement("img");
				wrapper.appendChild(img);
				img.src = listing["img_src"];
				img.alt = listing["id"];
				const text = document.createElement("div");
				wrapper.appendChild(text);
				text.id = listing["id"];
			});
			updateNmrGenders();
		}
	}
	updateGender();
});

document.getElementById("ss-title").addEventListener("input", e => insertUrlParam("title", e.target.value));

document.addEventListener("mouseover", e => {
	const target = e.target;

	if (target.closest(".member"))
		target.closest(".member").style.backgroundColor = "#c0c0c0";

	if (target.type === "submit" && !target.disabled)
		target.style.transform = "scale(1.05)";
});

document.addEventListener("mouseout", e => {
	const target = e.target;

	if (target.closest(".member"))
		target.closest(".member").style.removeProperty("background-color");

	if (target.type === "submit" && !target.disabled)
		target.style.removeProperty("transform");
});

document.addEventListener("click", e => {
	const target = e.target;

	// remove row
	if (target.closest(".delete-icon") && nmrMembers > 2) {
		nmrMembers--;

		target.closest(".member").remove();

		// if only two rows left, disable bins
		const bins = document.getElementsByClassName("delete-icon");
		if (bins.length <= 2) Array.from(bins).forEach(bin => bin.classList.add("disabled"));

		updateNmrMembersElem();
		updateNmrGenders();
		updatePlusButton();

		Object.keys(repeated).forEach(name => manageButtonEnableFromDuplicates(document.getElementById("submit-btn"), name));
	}

	if (!target.closest(".side-menu") && !target.closest(".hamburger-menu") && window.innerWidth < 720 && hamburgerWrapper.classList.contains("hamburger-menu-clicked") && target.id !== "submit-btn") {
		hamburgerWrapper.dispatchEvent(new MouseEvent("click", {
			"view": window,
			"bubbles": true,
			"cancelable": false
		}));
	}
});

const manageButtonEnableFromDuplicates = (button, inputName) => {
	// check if submit button can be enabled again, if needed
	if (button.disabled) {
		const values = Array.from(document.getElementsByTagName("INPUT")).
			filter(input => input.name === inputName).
			map(input => input.value);

		// if not repeated values, then reenable button
		if (values.length === new Set(values).size) {
			repeated[inputName] = false;

			// check first if other input names don't have repetitions too
			const temp = repeated;
			delete temp[inputName];
			if (Object.values(temp).every(repeat => !repeat)) {
				button.disabled = false;
				button.title = "Criar os Pares para o Secret Santa";
			}
		}
	}
}

const manageButtonFromDuplicates = (button, target, inputName) => {
	for (let input of document.getElementsByTagName("INPUT")) {
		if (input !== target && input.name === inputName) {
			if (input.value === target.value) {
				button.disabled = true;
				button.title = "Nome ou email duplicado!"
				repeated[inputName] = true;
				break;
			}
		}
	}
	manageButtonEnableFromDuplicates(button, inputName);
}

document.addEventListener("input", e => {
	const target = e.target;

	// update gender number when clicking on gender selector
	if (target.tagName === "SELECT" && target.name === "gender") {
		updateNmrGenders();
	}

	if (target.tagName === "INPUT" && target.name === "name") {
		manageButtonFromDuplicates(document.getElementById("submit-btn"), target, "name");
	}

	if (target.tagName === "INPUT" && target.name === "email") {
		manageButtonFromDuplicates(document.getElementById("submit-btn"), target, "email");
	}

	if (target.id === "event-time") {
		insertUrlParam("date", target.value);
	}
});

// set min date for date input
var today = new Date();
var dd = today.getDate() < 10 ? '0'+today.getDate() : today.getDate();
var mm = today.getMonth() + 1 < 10 ? '0'+(today.getMonth() + 1) : today.getMonth() + 1; // January is 0
var yyyy = today.getFullYear();

today = yyyy + '-' + mm + '-' + dd;
document.getElementById("event-time").setAttribute("min", today);

// swipe right event for mobile
document.addEventListener('swiped-right', () => {
	if (document.getElementsByClassName("hamburger-menu-clicked").length == 0) {
		hamburgerWrapper.dispatchEvent(new MouseEvent("click", {
			"view": window,
			"bubbles": true,
			"cancelable": false
		}));
	}
});

// swipe left event for mobile
document.addEventListener('swiped-left', () => {
	if (document.getElementsByClassName("hamburger-menu-clicked").length > 0) {
		hamburgerWrapper.dispatchEvent(new MouseEvent("click", {
			"view": window,
			"bubbles": true,
			"cancelable": false
		}));
	}
});

window.addEventListener('resize', e => {
	if (e.target.innerWidth > 720)
		updateMembersWidth();

	if (e.target.innerWidth > 1215) {
		if (!hamburgerWrapper.classList.contains("hamburger-menu-clicked")) {
			hamburgerWrapper.dispatchEvent(new MouseEvent("click", {
				"view": window,
				"bubbles": true,
				"cancelable": false
			}));
		}
	}
});

window.onbeforeunload = e => {
	for (const input of Array.from(document.getElementsByTagName("INPUT"))) {
		if (input.value !== '' && !submitClicked) {
			if (!e) e = window.event;
			// e.cancelBubble is supported by IE
			e.cancelBubble = true;
			e.returnValue = 'Deseja mesmo sair?';

			//e.stopPropagation works in Firefox.
			if (e.stopPropagation) {
				e.stopPropagation();
				e.preventDefault();
			}
			break;
		}
	}
}