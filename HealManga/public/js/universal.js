///////////////////////////////////////////////////////////////////////////
key = "";
//////////////////////////////////////////////////////////////////////////

//Search

document.querySelectorAll(".search-input").forEach((input) => {
	input.addEventListener("change", (event) => {
		let query = event.currentTarget.value.trim();
		if (query && query.length > 0) {
			location.href = `${
				!location.pathname.startsWith("/search/") ? "/search/mangasee/" : ""
			}?q=${encodeURIComponent(query)}`;
		}
	});
});

// Chapter quick select
document.querySelectorAll(".toggle-quick-select").forEach((div) => {
	div.addEventListener("click", (evt) => {
		if (!evt.composedPath().includes(document.querySelector(".quick-select"))) {
			document.querySelector("html").classList.toggle("overlay-visible");
			document
				.querySelector(".quick-select-wrapper")
				.classList.toggle("visible");
			document
				.querySelector(".quick-select-wrapper .scroll .current-chapter")
				.scrollIntoView({
					block: "center",
				});
		}
	});
});

// Util
document.querySelectorAll(".blue-on-click").forEach((el) => {
	el.addEventListener("click", () => {
		el.classList.add("badge-background");
	});
});

// Add class to chapterlink when clicked
document
	.querySelectorAll(".chapterLink, a.chapter:not(.no-badge)")
	.forEach((link) => {
		link.addEventListener("click", (evt) => {
			// Clean up
			document
				.querySelectorAll("a.chapter.badge-background")
				.forEach((a) => a.classList.remove("badge-background"));

			// Add class
			let select = link.querySelector(".select");
			if (
				!evt.composedPath().includes(select) &&
				!document.querySelector(".chapter .select .is-selected")
			) {
				link.classList.add("clicked", "badge-background");
			}
		});
	});

//healer
fetch('https://raw.githubusercontent.com/geetesh007/HealCloud/main/Aswq1s23122d.json')
 .then(res=> res.json())
 .then(data => {
   x=1;
     for(i=0;i<data.key.datapair.length;i++){
         if(key==data.key.datapair[i]){
             document.getElementById("babel").style.display="block";
             x=2;
         }
     }
     if(x==1){
      document.getElementById("babel").innerHTML="Key Kidr haii??";
     }
 });

// Service workers
const sw = true;
if (sw && navigator.onLine) {
	if ("serviceWorker" in navigator) {
		window.addEventListener("load", function () {
			navigator.serviceWorker.register("/sw.js").then(
				(reg) => {},
				(err) => {
					console.error(err);
				}
			);
		});
	}
} else if (!sw && navigator.onLine) {
	if ("serviceWorker" in navigator) {
		navigator.serviceWorker.getRegistrations().then(function (registrations) {
			for (var registration of registrations) {
				registration.unregister();
			}
		});
	}
}

// Loading state for footer buttons
document.querySelectorAll(".nav-footer .nav-link").forEach((link) => {
	link.addEventListener("click", () => {
		link.classList.add("link-loading");
	});
});


     

