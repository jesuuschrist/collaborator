const topbar = document.querySelector(".topbar");
const menuToggle = document.querySelector(".menu-toggle");
const menuLinks = document.querySelectorAll(".menu a");
const faqItems = document.querySelectorAll(".faq-item");
const serviceCards = document.querySelectorAll(".service-card");
const reviewsGrid = document.querySelector(".reviews-grid");
const reviewCards = document.querySelectorAll(".review-card");
const reviewDots = document.querySelectorAll(".reviews-dot");

const syncAnchorOffset = () => {
  if (!topbar) {
    return;
  }

  const topbarStyles = window.getComputedStyle(topbar);
  const stickyTop = Number.parseFloat(topbarStyles.top) || 0;
  const offset = Math.ceil(topbar.offsetHeight + stickyTop + 18);
  document.documentElement.style.setProperty("--header-offset", `${offset}px`);
};

if (menuToggle && topbar) {
  menuToggle.addEventListener("click", () => {
    const isOpen = topbar.classList.toggle("menu-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  menuLinks.forEach((link) => {
    link.addEventListener("click", () => {
      topbar.classList.remove("menu-open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

const syncTopbarScrollState = () => {
  if (!topbar) {
    return;
  }

  topbar.classList.toggle("scrolled", window.scrollY > 12);
};

syncTopbarScrollState();
syncAnchorOffset();
window.addEventListener("scroll", syncTopbarScrollState, { passive: true });
window.addEventListener("resize", syncAnchorOffset);

faqItems.forEach((item) => {
  const button = item.querySelector("button");

  button?.addEventListener("click", () => {
    const isActive = item.classList.contains("active");

    faqItems.forEach((faqItem) => faqItem.classList.remove("active"));

    if (!isActive) {
      item.classList.add("active");
    }
  });
});

serviceCards.forEach((card) => {
  card.setAttribute("tabindex", "0");

  const toggleCard = () => {
    const isOpen = card.classList.contains("is-open");

    serviceCards.forEach((serviceCard) => {
      serviceCard.classList.remove("is-open");
      serviceCard.setAttribute("aria-expanded", "false");
    });

    if (!isOpen) {
      card.classList.add("is-open");
      card.setAttribute("aria-expanded", "true");
    }
  };

  card.setAttribute("role", "button");
  card.setAttribute("aria-expanded", "false");

  card.addEventListener("click", (event) => {
    const interactiveElement = event.target.closest("a, button, input, textarea");
    if (interactiveElement) {
      return;
    }

    toggleCard();
  });

  card.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    toggleCard();
  });
});

if (reviewsGrid) {
  let isDragging = false;
  let startX = 0;
  let startScrollLeft = 0;
  let dragDistance = 0;

  const setActiveReviewDot = (index) => {
    reviewDots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === index);
    });
  };

  const syncReviewDotsToScroll = () => {
    if (!reviewCards.length) {
      return;
    }

    let activeIndex = 0;
    let smallestDistance = Number.POSITIVE_INFINITY;

    reviewCards.forEach((card, index) => {
      const distance = Math.abs(card.offsetLeft - reviewsGrid.scrollLeft);
      if (distance < smallestDistance) {
        smallestDistance = distance;
        activeIndex = index;
      }
    });

    setActiveReviewDot(activeIndex);
  };

  const scrollToReview = (index) => {
    const targetCard = reviewCards[index];
    if (!targetCard) {
      return;
    }

    reviewsGrid.scrollTo({
      left: targetCard.offsetLeft,
      behavior: "smooth",
    });
  };

  const stopDragging = () => {
    if (!isDragging) {
      return;
    }

    isDragging = false;
    reviewsGrid.classList.remove("dragging");

    let activeIndex = 0;
    let smallestDistance = Number.POSITIVE_INFINITY;

    reviewCards.forEach((card, index) => {
      const distance = Math.abs(card.offsetLeft - reviewsGrid.scrollLeft);
      if (distance < smallestDistance) {
        smallestDistance = distance;
        activeIndex = index;
      }
    });

    const threshold = 60;
    if (dragDistance > threshold) {
      activeIndex = Math.max(0, activeIndex - 1);
    } else if (dragDistance < -threshold) {
      activeIndex = Math.min(reviewCards.length - 1, activeIndex + 1);
    }

    scrollToReview(activeIndex);
  };

  reviewsGrid.addEventListener("mousedown", (event) => {
    isDragging = true;
    startX = event.pageX;
    startScrollLeft = reviewsGrid.scrollLeft;
    dragDistance = 0;
    reviewsGrid.classList.add("dragging");
  });

  reviewsGrid.addEventListener("mouseleave", stopDragging);
  reviewsGrid.addEventListener("mouseup", stopDragging);

  reviewsGrid.addEventListener("mousemove", (event) => {
    if (!isDragging) {
      return;
    }

    event.preventDefault();
    const distance = event.pageX - startX;
    dragDistance = distance;
    reviewsGrid.scrollLeft = startScrollLeft - distance;
  });

  reviewsGrid.addEventListener("scroll", syncReviewDotsToScroll, { passive: true });

  reviewDots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      scrollToReview(index);
    });
  });

  syncReviewDotsToScroll();
}
