document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. RIGHT-SIDE SLIDE PANEL SQUEEZE LOGIC (unchanged) ---
    const sidePanel = document.getElementById("medical-modal");
    const openPanelButtons = document.querySelectorAll(".open-modal-btn");
    const closePanelButton = document.querySelector(".close-modal-btn");
    const locationInput = document.getElementById("patient-location");
    const gpsLoader = document.getElementById("gps-loader");
    const detectGpsBtn = document.getElementById("detect-gps-btn");
    
    let globalLat = null;
    let globalLon = null;

    // Open Panel Handler
    openPanelButtons.forEach(button => {
        button.addEventListener("click", () => {
            document.body.classList.add("panel-is-open");
            sidePanel.classList.add("active");
            resetGpsButtonState(); // Ensure cleaner UI on new click loops
        });
    });

    // Close Panel Handler
    closePanelButton.addEventListener("click", () => {
        document.body.classList.remove("panel-is-open");
        sidePanel.classList.remove("active");
    });

    // Reset GPS Button helper
    function resetGpsButtonState() {
        detectGpsBtn.className = "gps-trigger-action";
        detectGpsBtn.innerHTML = `<i class="fa-solid fa-crosshairs"></i> Detect My GPS Location`;
        globalLat = null;
        globalLon = null;
    }

    // --- 2. MULTI-OPTION GEOLOCATION ACCESS ENGINE (unchanged) ---
    detectGpsBtn.addEventListener("click", () => {
        gpsLoader.classList.remove("hidden");
        detectGpsBtn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Reading Satellites...`;
        locationInput.value = "";
        locationInput.disabled = true; // Block input while loading coordinates

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    globalLat = position.coords.latitude;
                    globalLon = position.coords.longitude;

                    // Update UI State to verified green success marker
                    detectGpsBtn.className = "gps-trigger-action success-lock";
                    detectGpsBtn.innerHTML = `<i class="fa-solid fa-circle-check"></i> GPS Coordinates Secured`;
                    
                    locationInput.disabled = false;
                    locationInput.value = `📍 Coordinates Locked (${globalLat.toFixed(5)}, ${globalLon.toFixed(5)})`;
                    gpsLoader.classList.add("hidden");
                },
                (error) => {
                    gpsLoader.classList.add("hidden");
                    locationInput.disabled = false;
                    detectGpsBtn.className = "gps-trigger-action";
                    detectGpsBtn.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Access Denied`;
                    locationInput.placeholder = "Please type your address manually below...";
                    locationInput.focus();
                },
                { enableHighAccuracy: true, timeout: 10000 }
            );
        } else {
            gpsLoader.classList.add("hidden");
            locationInput.disabled = false;
            locationInput.placeholder = "GPS Unsupported. Please type manually.";
        }
    });

    // Reset GPS state clear if user starts typing manually instead
    locationInput.addEventListener("input", () => {
        if (globalLat || globalLon) {
            resetGpsButtonState();
        }
    });

    // --- 3. WHATSAPP PACKAGING SUBMIT (unchanged) ---
    const triageForm = document.getElementById("triage-form");

    triageForm.addEventListener("submit", (e) => {
        e.preventDefault(); 

        let locValue = locationInput.value;
        const nameValue=document.getElementById("patient-name").value;
        const issueValue = document.getElementById("patient-issue").value;
        const phoneNumber = "919729644570";

        // Inject high-precision hyperlink if using GPS parameters
        if (globalLat && globalLon) {
            locValue = `https://maps.google.com/?q=${globalLat},${globalLon}`;
        }

        const customMessage =
                `Hello Meviox,

I need urgent doctor consultation help.

👤 Name: ${nameValue}

🗺️ Location:
${locValue}

🚨 Medical Symptoms:
${issueValue}`;
        const encodedMessage = encodeURIComponent(customMessage);
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

        window.open(whatsappUrl, "_blank");
        
        document.body.classList.remove("panel-is-open");
        sidePanel.classList.remove("active");
        triageForm.reset();
        resetGpsButtonState();
    });

    // --- 4. FAQ ACCORDION ENGINE (unchanged) ---
    const faqQuestions = document.querySelectorAll(".faq-question");
    faqQuestions.forEach(question => {
        question.addEventListener("click", () => {
            const currentItem = question.parentElement;
            document.querySelectorAll(".faq-item").forEach(item => {
                if (item !== currentItem) item.classList.remove("active");
            });
            currentItem.classList.toggle("active");
        });
    });

    // --- EXTRA: close the slide panel by clicking the dimmed overlay ---
    const modalOverlay = document.getElementById("modal-overlay");
    if (modalOverlay) {
        modalOverlay.addEventListener("click", () => {
            document.body.classList.remove("panel-is-open");
            sidePanel.classList.remove("active");
        });
    }

    // --- EXTRA: close the slide panel with the Escape key ---
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && sidePanel.classList.contains("active")) {
            document.body.classList.remove("panel-is-open");
            sidePanel.classList.remove("active");
        }
    });
});

document.addEventListener("DOMContentLoaded", () => {
    // --- 5. EXPERTS "VIEW MORE" + FILTER ENGINE ---
    // MODIFIED: added `manualExpand` tracking so that switching the filter
    // back to "All" restores the original collapsed (first-4-cards) view
    // instead of staying permanently expanded. The View More button is
    // also hidden while a specific filter is active, since "ignore the
    // View More limit while filtering" means every matching card should
    // already be visible — the button has nothing left to reveal.
    const expertsGrid = document.getElementById("experts-grid");
    const viewMoreBtn = document.getElementById("view-more-experts");
    const expertTabs = document.querySelectorAll(".expert-tab");
    const expertCards = document.querySelectorAll(".expert-card");

    // Tracks whether the user manually expanded the grid via the
    // "View More" button (independent of any filter-driven expansion).
    let manualExpand = false;

    function setViewMoreLabel(expanded) {
        viewMoreBtn.classList.toggle("expanded", expanded);
        viewMoreBtn.innerHTML = expanded
            ? `View less <i class="fa-solid fa-chevron-down"></i>`
            : `View more experts <i class="fa-solid fa-chevron-down"></i>`;
    }

    // --- View More / View Less (initial state: only first 4 cards shown,
    //     via the existing .expert-card.extra-expert { display:none } CSS
    //     rule — unchanged from before) ---
    if (viewMoreBtn && expertsGrid) {
        viewMoreBtn.addEventListener("click", () => {
            manualExpand = !manualExpand;
            expertsGrid.classList.toggle("show-all", manualExpand);
            setViewMoreLabel(manualExpand);
        });
    }

    // --- Filter tabs ---
    expertTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            expertTabs.forEach(t => t.classList.remove("active-tab"));
            tab.classList.add("active-tab");

            const filter = tab.dataset.filter;

            // Show/hide cards that don't match the selected specialty
            expertCards.forEach(card => {
                const matches = filter === "all" || card.dataset.role === filter;
                card.setAttribute("data-hidden-by-filter", matches ? "false" : "true");
            });

            if (filter === "all") {
                // Restore the normal View More behaviour: collapsed unless
                // the user had previously clicked "View More" themselves.
                expertsGrid.classList.toggle("show-all", manualExpand);
                if (viewMoreBtn) {
                    viewMoreBtn.style.display = "";
                    setViewMoreLabel(manualExpand);
                }
            } else {
                // A specific specialty is selected: ignore the View More
                // limit entirely and reveal every matching card (including
                // ones marked .extra-expert), then hide the button since
                // there's nothing left for it to reveal.
                expertsGrid.classList.add("show-all");
                if (viewMoreBtn) {
                    viewMoreBtn.style.display = "none";
                }
            }
        });
    });
});

/* ============================================================
   EXTRA: Redesign-only enhancements (do not touch any of the
   functionality wired up above — GPS, WhatsApp, FAQ, filtering)
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {

    // --- Sticky navbar shadow on scroll ---
    const navbar = document.getElementById("navbar");
    if (navbar) {
        const onScroll = () => {
            navbar.classList.toggle("scrolled", window.scrollY > 12);
        };
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
    }

    // --- Mobile hamburger menu ---
    const hamburger = document.getElementById("hamburger");
    const mobileMenu = document.getElementById("mobile-menu");
    if (hamburger && mobileMenu) {
        hamburger.addEventListener("click", () => {
            const isOpen = mobileMenu.classList.toggle("open");
            hamburger.classList.toggle("open", isOpen);
            hamburger.setAttribute("aria-expanded", String(isOpen));
        });

        // Close mobile menu whenever a link or button inside it is tapped
        mobileMenu.querySelectorAll("a, button").forEach(el => {
            el.addEventListener("click", () => {
                mobileMenu.classList.remove("open");
                hamburger.classList.remove("open");
                hamburger.setAttribute("aria-expanded", "false");
            });
        });
    }

    // --- Scroll-reveal fade/slide-up animation ---
    const revealEls = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window && revealEls.length) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("in-view");
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" });

        revealEls.forEach(el => io.observe(el));
    } else {
        // Fallback: just show everything immediately
        revealEls.forEach(el => el.classList.add("in-view"));
    }
});