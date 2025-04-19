  document.addEventListener("DOMContentLoaded", function () {
    const menuToggle = document.getElementById("menu-btn");
    const menuLinks = document.querySelectorAll(".nav-link"); // Adjust the selector as needed

    menuLinks.forEach(link => {
      link.addEventListener("click", () => {
        menuToggle.checked = false; // Hide the menu

        // Get the target section from the link's href (e.g., "#section-03")
        const sectionId = link.getAttribute("href").substring(1); // removes the "#"
        
        // Construct corresponding checkbox ID (e.g., "section-toggle-03")
        const toggleId = sectionId.replace("section-", "handle-");
        const sectionToggle = document.getElementById(toggleId);

        if (sectionToggle) {
          sectionToggle.checked = true;
        }
      });
    });
  });