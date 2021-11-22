const updateMembersWidth = () => document.getElementById("members").style.width = parseInt(document.getElementById("members").children[0].offsetWidth)+parseInt(getComputedStyle(document.getElementById("members").children[0]).getPropertyValue('padding'))+"px";
const updateSubmitButton = () => document.getElementById("submit-btn").disabled = nmrMembers % 2 !== 0;

const insertUrlParam = (key, value) => {
	let searchParams = new URLSearchParams(window.location.search);
	searchParams.set(key, value);
	let newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?' + searchParams.toString();
	window.history.pushState({path: newurl}, '', newurl);
}

const updateNmrMembersElem = () => {
	document.getElementById("nmr-members").innerText = "Participantes: "+nmrMembers;
	insertUrlParam("members", nmrMembers);
}

updateMembersWidth();
updateSubmitButton();

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

document.getElementsByClassName("side-menu")[0].style.height = (window.innerHeight-document.getElementsByClassName("top")[0].offsetHeight)+"px";

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

document.getElementsByClassName("plus")[0].addEventListener("click", () => {
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
	Array.from(document.getElementsByClassName("delete-icon"))
		.filter(bin => bin.classList.contains("disabled"))
		.forEach(bin => bin.classList.remove("disabled"));

	// enable submit button, if needed
	document.getElementById("submit-btn").disabled = false;
	
	updateMembersWidth();
	updateSubmitButton();
	updateNmrMembersElem();

	const members = document.getElementById("members");
	members.scroll(0, members.offsetHeight);
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
});

document.getElementById("admin-form").getElementsByTagName("input")[0].addEventListener("input", e => document.getElementById("admin-email").value = e.target.value);

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
	if (e.target.classList.contains("checkbox-enabled")) {
		e.target.classList.remove("checkbox-enabled");
		gender = false;
	}
	else {
		e.target.classList.add("checkbox-enabled");
		gender = true;
	}
	updateGender();
});

document.getElementById("ss-title").addEventListener("input", e => insertUrlParam("title", e.target.value));

document.addEventListener("mouseover", e => {
	const target = e.target;

	if (target.closest(".member"))
		target.closest(".member").style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--color-default');

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
		if (nmrMembers <= 2)
			Array.from(document.getElementsByClassName("delete-icon"))
				.filter(bin => !bin.classList.contains("disabled"))
				.forEach(bin => bin.classList.add("disabled"));

		updateSubmitButton();
		updateNmrMembersElem();
	}

	if (!target.closest(".side-menu") && !target.closest(".hamburger-menu") && window.innerWidth < 720 && hamburgerWrapper.classList.contains("hamburger-menu-clicked")) {
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
		if (input.value !== '') {	
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