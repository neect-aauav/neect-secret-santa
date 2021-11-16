const deleteIcon = () => {
	const binWrapper = document.createElement("div");
	binWrapper.classList.add("delete-icon");
	const bin = document.createElement("img");
	binWrapper.appendChild(bin);
	bin.src = "../static/images/trash.png";
	bin.title = "Remove Member";
	bin.alt = "Remove";
	return binWrapper;
}

document.getElementsByClassName("plus")[0].addEventListener("click", () => {
	// add more members
	const membersWrapper = document.getElementById("members");
	for (let i = 0; i < (membersWrapper.childElementCount % 2 !== 0 ? 2 : 1); i++) {
		const wrapper = document.createElement("div");
		membersWrapper.appendChild(wrapper);
		wrapper.classList = "member";
		
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

		wrapper.appendChild(deleteIcon());
	}

	// add bins to any rows that don't have it yet
	Array.from(document.getElementById("members").children)
		.filter(child => child.getElementsByClassName("delete-icon").length === 0)
		.forEach(child => child.appendChild(deleteIcon()));

});

document.addEventListener("mouseover", e => {
	const target = e.target;

	if (target.closest(".member")) {
		target.closest(".member").style.backgroundColor = "#b1ffe2";
	}
});

document.addEventListener("mouseout", e => {
	const target = e.target;

	if (target.closest(".member")) {
		target.closest(".member").style.removeProperty("background-color");
	}
});

document.addEventListener("click", e => {
	const target = e.target;

	// remove row
	if (target.closest(".delete-icon")) {
		target.closest(".member").remove();

		const membersWrapper = document.getElementById("members");
		// if only two rows left, remove bins
		if (membersWrapper.childElementCount === 2)
			Array.from(membersWrapper.children)
				.map(child => child.getElementsByClassName("delete-icon")[0])
				.forEach(bin => bin.remove());
		
		// if odd number of rows, change button
		Array.from(document.getElementsByTagName("button"))
			.filter(btn => btn.type === "submit")[0]
			.disabled = membersWrapper.childElementCount % 2 !== 0;
	}
});