document.getElementsByClassName("plus")[0].addEventListener("click", () => {
	// add pair of new member
	const membersContainer = document.getElementById("members");
	for (let i = 0; i < 2; i++) {
		const wrapper = document.createElement("div");
		membersContainer.appendChild(wrapper);
		
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
	}
});

Array.from(document.getElementsByTagName("button"))
	.filter(btn => btn.type == "submit")[0]
	.addEventListener("click", () => {
		// POST number of members
		var xhr = new XMLHttpRequest();
		xhr.open("POST", send, true);
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.send(JSON.stringify({
			members: 5
		}));
	});