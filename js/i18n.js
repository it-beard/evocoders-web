const translations = {
  en: {
    "meta.title": "Code Evolution - private AI development club",
    "meta.description":
      "Private AI development club: courses, 800+ member community, news digests, tools and events. Boost your productivity and master AI development.",
    "header.title": "Code Evolution",
    "hero.label": "[ AI + CODE = LEVEL 🆙 ]",
    "hero.subtitle":
      "<b>▓▒░ Code Evolution ░▒▓</b> is a private club for developers* where we learn to pair program with AI, stay up-to-date with the latest developments, and boost our productivity using AI tools.",
    "hero.note":
      "* By developers, we mean anyone with an engineering mindset who writes or wants to write code using AI: software developers, engineers, QAs, designers, and other tech specialists.",
    "mission.title": "//&nbsp;OUR MISSION",
    "mission.text":
      "To build a community of highly sought-after specialists who navigate the world of evolving AI with confidence.",
    "goal.title": "&gt; OUR GOAL",
    "goal.text":
      "Boosting members' productivity and market demand by teaching AI fundamentals, tooling, and facilitating the exchange of experience, knowledge, and professional connections.",
    "theses.title": "[&nbsp;OUR&nbsp;PRINCIPLES&nbsp;]",
    "thesis.1": "AI boosts productivity",
    "thesis.2": "AI won't replace developers",
    "thesis.3":
      "Developers and engineers who use AI are the future of the industry",
    "benefits.title":
      "[&nbsp;WHAT&nbsp;YOU&nbsp;GET&nbsp;]",
    "benefit.content.title": '<i class="fas fa-video"></i>Exclusive Content',
    "benefit.content.text":
      "200+ hours of premium materials: lectures, workshops, interviews, talks, reviews, and community calls. New content added regularly",
    "benefit.content.link":
      '<i class="fas fa-images"></i> Click here to see examples of our content',
    "benefit.courses.title":
      '<i class="fas fa-graduation-cap"></i>Educational Courses',
    "benefit.courses.text":
      "Comprehensive courses on AI fundamentals, AI-powered programming, choosing the right models for development — all on our custom learning platform",
    "benefit.courses.link":
      '<i class="fas fa-images"></i> Click here to see how our courses look',
    "benefit.digests.title": '<i class="fas fa-newspaper"></i>News Digests',
    "benefit.digests.text":
      "Twice monthly, get curated reviews of the most relevant AI and development news, available in both audio and text formats",
    "benefit.digests.link":
      '<i class="fas fa-images"></i> Click here to see digest examples',
    "benefit.community.title": '<i class="fas fa-users"></i>800+ Developers',
    "benefit.community.text":
      "Connect with like-minded developers passionate about AI. Build your network and discover new collaboration opportunities",
    "benefit.tools.title": '<i class="fas fa-tools"></i>450+ Tools',
    "benefit.tools.text":
      "Access our curated collection of 450+ useful AI development tools, over 70 news sources, and tons of helpful resources",
    "benefit.bots.title": '<i class="fas fa-robot"></i>AI Bots',
    "benefit.bots.text":
      "We've built custom AI bots to enhance the club experience: intelligent information search, blind call matching, daily topic summaries, and more.",
    "structure.title": "//&nbsp;CLUB STRUCTURE",
    "structure.p1":
      "Code Evolution is a private Telegram group with themed discussion channels. All club content and activities happen in these channels, though we also extend beyond: public YouTube content, an open Telegram announcement channel, our own course platform, a club bot with AI features, and more.",
    "structure.p2":
      "By subscribing to Code Evolution, you gain access to the group, all associated content, and direct communication with fellow members.",
    "resources.title": "[&nbsp;PUBLIC&nbsp;RESOURCES&nbsp;]",
    "resource.youtube.title": "YouTube",
    "resource.youtube.p":
      "YouTube channel featuring public club content: workshops, interviews, talks, and reviews",
    "resource.telegram.title": "Telegram",
    "resource.telegram.p":
      "Telegram channel with AI and club news, plus announcements of new content releases",
    "resource.calendar.title": "Calendar",  
    "resource.calendar.p":
      "Google calendar showing all past and upcoming club events",
    "cta.title": "&gt;&gt;&nbsp;HOW TO JOIN",
    "cta.p1":
      "Join the club with a monthly or annual subscription. Pay via any bank card or cryptocurrency. We use Tribute and their official Telegram bot for secure payment processing.",
    "cta.btn_month": "Buy monthly subscription <i>(€14)</i>",
    "cta.btn_year": "Buy annual subscription <i>(€140)</i>",
    "cta.p_gift":
      "You can also gift a subscription to a friend or colleague.",
    "cta.p_rules":
      'By purchasing a subscription, you agree to our <a href="rules.html" style="color: var(--retro-cyan); text-decoration: none; text-shadow: 0 0 10px var(--retro-cyan);">club rules</a>.',
    "companies.title": "[&nbsp;FOR&nbsp;COMPANIES&nbsp;]",
    "companies.p1":
      "Code Evolution offers companies a unique way to level up their developers' AI competencies.",
    "companies.p2":
      "With a club subscription, your developers gain access to cutting-edge knowledge and tools that boost productivity, keep them on top of AI trends, give you a competitive edge in the IT market, and improve team loyalty.",
    "companies.btn": "Discuss corporate subscriptions",
    "contact.title": "&gt;&nbsp;CONTACT US",
    "footer.slogan": "▓▒░ U'LL. BE. BACK. ░▒▓",
    "footer.copyright": "©2024-2025 Code Evolution",
    "modal.courses.title":
      '<i class="fas fa-graduation-cap"></i> Educational Courses',
    "modal.content.title": '<i class="fas fa-video"></i> Exclusive Content',
    "modal.digests.title": '<i class="fas fa-newspaper"></i> News Digests',
    "modal.courses.slide1": "Main page of our educational portal - Code Evolution Knowledge Base",
    "modal.courses.slide2": "Introductory lecture from the 'Basic Theory' course",
    "modal.courses.slide3": "First chapter of the 'Models for Development' course",
    "modal.content.slide1": "Exclusive club content example: Workshops 2025",
    "modal.content.slide2": "Exclusive club content example: Community calls 2025",
    "modal.content.slide3": "Interview with Grisha Bakunov",
    "modal.content.slide4": "Workshop: 'Cursor vs Claude Code'",
    "modal.content.slide5": "Interview with Bayram Annakov",
    "modal.content.slide6": "Club call excerpt: Cursor Background Agents",
    "modal.content.slide7": "Content post example: Club call #19",
    "modal.content.slide8": "Content post example: Context Engineering workshop",
    "modal.content.slide9": "Content post example: Qoder IDE overview",
    "modal.content.slide10": "Content post example: Kiro IDE workshop",
    "modal.digests.slide1": "News digest example (audio on YouTube)",
    "modal.digests.slide2": "Digest post example in text format on Telegram",
    "modal.digests.slide3": "Audio digest post on Telegram"
  },
};

window.translations = translations;

document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const lang = urlParams.get("lang");

  if (lang === "en") {
    document.documentElement.lang = "en";
    applyTranslation("en");
  }
});

function applyTranslation(lang) {
  const t = translations[lang];
  if (!t) return;

  // Meta tags
  if (t["meta.title"]) document.title = t["meta.title"];
  if (t["meta.description"]) {
    const descMeta = document.querySelector('meta[name="description"]');
    if (descMeta) descMeta.content = t["meta.description"];
  }

  // Dynamic elements
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (t[key]) {
      el.innerHTML = t[key];

    }
  });

  // Handle placeholders or specific attributes if needed
  // (None in the current set)


}
