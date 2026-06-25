const state = {
  trends: [],
  drafts: [],
  approvals: [
    {
      id: crypto.randomUUID(),
      title: "Connect Etsy and Printify accounts",
      detail: "Create API credentials or manual workflow links before live operations.",
      status: "pending",
    },
  ],
  printifyTasks: [],
};

const trademarkWatch = [
  "disney",
  "barbie",
  "taylor swift",
  "stanley",
  "nike",
  "swiftie",
  "nfl",
  "nba",
  "harry potter",
  "pokemon",
  "hello kitty",
];

const trendSeed = [
  "coquette bow sweatshirt",
  "western bachelorette shirt",
  "pickleball mom tumbler",
  "personalized teacher tote",
  "retro floral phone case",
  "dog mom embroidered crewneck",
  "first home ornament",
  "book club mug",
];

const palette = ["#dcefe5", "#f4d5ca", "#efe2c2", "#dbe8f4", "#eadff0", "#d8ead7"];

const $ = (selector) => document.querySelector(selector);

function normalizeText(value) {
  return value
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function titleCase(value) {
  return value.replace(/\w\S*/g, (word) => word[0].toUpperCase() + word.slice(1).toLowerCase());
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function extractSignals(input) {
  const text = normalizeText(input);
  const phrases = text
    .split(/,|\n|;|\b and \b|\b with \b/)
    .map((part) => part.trim())
    .filter((part) => part.length > 2);

  const words = text.split(" ");
  const windows = [];
  for (let index = 0; index < words.length - 1; index += 1) {
    const phrase = words.slice(index, index + 3).join(" ").trim();
    if (phrase.length > 9) windows.push(phrase);
  }

  return unique([...phrases, ...windows])
    .filter((signal) => signal.length <= 46)
    .slice(0, 8);
}

function riskFlags(signal) {
  return trademarkWatch.filter((term) => signal.includes(term));
}

function productTypeFor(signal, niche) {
  if (signal.includes("mug") || signal.includes("tumbler")) return "drinkware";
  if (signal.includes("tote") || signal.includes("bag")) return "tote bag";
  if (signal.includes("ornament")) return "ornament";
  if (signal.includes("phone")) return "phone case";
  if (signal.includes("shirt") || signal.includes("sweatshirt") || niche === "Apparel") {
    return "apparel";
  }
  return "giftable print-on-demand item";
}

function scoreSignal(signal, niche) {
  let score = 62;
  if (/personal|custom|name|year|initial/.test(signal)) score += 12;
  if (/teacher|mom|bride|pet|dog|book|pickleball|home/.test(signal)) score += 10;
  if (/retro|floral|western|bow|coquette|embroidered/.test(signal)) score += 9;
  if (productTypeFor(signal, niche) !== "giftable print-on-demand item") score += 6;
  if (riskFlags(signal).length) score -= 35;
  return Math.max(12, Math.min(98, score));
}

function analyzeTrends() {
  const input = $("#trendInput").value.trim();
  const niche = $("#nicheSelect").value;
  const strict = $("#riskSelect").value.includes("Strict");
  const signals = extractSignals(input || trendSeed.join(", "));

  state.trends = signals.map((signal, index) => {
    const flags = riskFlags(signal);
    const score = scoreSignal(signal, niche) - (strict && flags.length ? 15 : 0);
    return {
      id: crypto.randomUUID(),
      signal,
      title: titleCase(signal),
      productType: productTypeFor(signal, niche),
      score,
      flags,
      color: palette[index % palette.length],
      tags: unique([
        productTypeFor(signal, niche),
        signal.includes("personal") || signal.includes("custom") ? "personalizable" : "trend-led",
        flags.length ? "review IP" : "low IP risk",
      ]),
    };
  });

  render();
}

function buildPipeline() {
  const source = state.trends.length ? state.trends : trendSeed.map((signal) => ({
    id: crypto.randomUUID(),
    signal,
    title: titleCase(signal),
    productType: productTypeFor(signal, $("#nicheSelect").value),
    score: scoreSignal(signal, $("#nicheSelect").value),
    flags: [],
    tags: ["starter"],
    color: palette[0],
  }));

  state.drafts = source.slice(0, 5).map((trend) => ({
    id: crypto.randomUUID(),
    title: `${trend.title} ${trend.productType === "apparel" ? "Design" : "Bundle"}`,
    trendId: trend.id,
    productType: trend.productType,
    angle: designAngle(trend.signal),
    price: suggestedPrice(trend.productType),
    status: "draft",
  }));

  addApproval(
    "Review product launch pipeline",
    `${state.drafts.length} product drafts are ready for listing copy, mockups, and Printify setup.`
  );
  render();
}

function designAngle(signal) {
  if (signal.includes("teacher")) return "personalized classroom name layout with warm gift copy";
  if (signal.includes("bachelorette") || signal.includes("bride")) return "event-ready group design with color variants";
  if (signal.includes("pet") || signal.includes("dog")) return "custom pet-name design with simple proofing checklist";
  if (signal.includes("book")) return "book club identity design with cozy typography";
  if (signal.includes("pickleball")) return "sport hobby design with playful court motif";
  return "trend-aware design with personalization hook and neutral seasonal variants";
}

function suggestedPrice(productType) {
  const prices = {
    apparel: 34,
    drinkware: 24,
    "tote bag": 27,
    ornament: 18,
    "phone case": 22,
  };
  return prices[productType] || 29;
}

function generateListing() {
  const product = $("#productFocus").value.trim() || state.drafts[0]?.title || "Personalized Gift";
  const audience = $("#audienceFocus").value.trim() || "gift buyers";
  const keywords = unique([
    product.toLowerCase(),
    "personalized gift",
    "print on demand",
    "custom design",
    audience.toLowerCase(),
  ]).slice(0, 13);

  const output = [
    `Title: ${titleCase(product)} | Custom ${titleCase(audience)} Gift`,
    "",
    "Description:",
    `Create a polished made-to-order ${product.toLowerCase()} for ${audience.toLowerCase()}. This draft should use original artwork, avoid protected names/logos, and include a clear personalization field if customization is offered.`,
    "",
    "Photo checklist:",
    "- Main mockup on a neutral background",
    "- Close crop of typography or art detail",
    "- Size/color chart",
    "- Personalization example",
    "- Shipping and production expectation slide",
    "",
    `Tags: ${keywords.join(", ")}`,
  ].join("\n");

  $("#listingOutput").textContent = output;
  addApproval("Review Etsy listing draft", `Draft generated for "${product}" before publishing.`);
  render();
}

function calculateMargin() {
  const base = Number($("#baseCost").value || 0);
  const shipping = Number($("#shippingCost").value || 0);
  const price = Number($("#salePrice").value || 0);
  const etsyFeeEstimate = price * 0.095 + 0.45;
  const profit = price - base - shipping - etsyFeeEstimate;
  const margin = price ? profit / price : 0;
  const width = Math.max(3, Math.min(100, Math.round(margin * 180)));

  $("#marginBar").style.width = `${width}%`;
  $("#marginText").textContent = `Estimated profit: $${profit.toFixed(2)} (${Math.round(
    margin * 100
  )}% margin after estimated Etsy fees).`;
}

function queuePrintifyTask() {
  const product = $("#productFocus").value.trim() || state.drafts[0]?.title || "new product";
  const task = {
    id: crypto.randomUUID(),
    title: `Create Printify product for ${product}`,
    detail:
      "Select provider, upload original artwork, set variants, confirm production cost, order a sample, and sync only after review.",
  };
  state.printifyTasks.unshift(task);
  addApproval("Approve Printify setup", task.detail);
  render();
}

function triageOrder() {
  const input = $("#orderInput").value.trim();
  const text = normalizeText(input);
  const urgent = /before|rush|today|tomorrow|deadline|late|missing|refund/.test(text);
  const customization = /custom|personal|name|color|size|navy|pink|change/.test(text);
  const output = [
    `Priority: ${urgent ? "High" : "Normal"}`,
    `Needs customization review: ${customization ? "Yes" : "No"}`,
    "",
    "Suggested reply draft:",
    urgent
      ? "Thanks for the note. I am checking production timing before confirming so I do not promise a date the fulfillment partner cannot meet."
      : "Thanks for the details. I will review the customization and confirm the proof before production.",
    "",
    "Internal checklist:",
    "- Verify Printify production window",
    "- Confirm selected variant and shipping address",
    "- Send proof if personalization changed",
    "- Queue message for approval before sending",
  ].join("\n");

  $("#orderOutput").textContent = output;
  addApproval("Review customer response", "A message draft is ready but has not been sent.");
  render();
}

function addApproval(title, detail) {
  state.approvals.unshift({
    id: crypto.randomUUID(),
    title,
    detail,
    status: "pending",
  });
}

function approveItem(id) {
  const item = state.approvals.find((approval) => approval.id === id);
  if (item) item.status = "approved";
  render();
}

function clearApproved() {
  state.approvals = state.approvals.filter((approval) => approval.status !== "approved");
  render();
}

function renderTrends() {
  const board = $("#trendBoard");
  if (!state.trends.length) {
    board.innerHTML = `<div class="output-card">No trend analysis yet. Paste Etsy page text or load the sample to start.</div>`;
    return;
  }

  board.innerHTML = state.trends
    .map(
      (trend) => `
        <article class="trend-card">
          <div class="mockup-art" style="--mock:${trend.color}">
            <span>${trend.score}/100</span>
          </div>
          <div class="trend-card-body">
            <h3>${trend.title}</h3>
            <p>${trend.productType} direction. ${
              trend.flags.length ? `Review terms: ${trend.flags.join(", ")}.` : "No watched trademark terms detected."
            }</p>
            <div class="tag-row">
              ${trend.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
            </div>
          </div>
        </article>
      `
    )
    .join("");
}

function renderPipeline() {
  const list = $("#pipelineList");
  if (!state.drafts.length) {
    list.innerHTML = `<div class="output-card">Build the pipeline after analyzing trends.</div>`;
    return;
  }

  list.innerHTML = state.drafts
    .map(
      (draft) => `
        <article class="pipeline-item">
          <div>
            <h3>${draft.title}</h3>
            <p>${draft.angle}</p>
          </div>
          <div class="tag-row">
            <span class="tag">${draft.productType}</span>
            <span class="tag">$${draft.price}</span>
            <span class="tag">${draft.status}</span>
          </div>
          <div class="mini-actions">
            <button type="button" data-focus="${draft.title}">Use in Listing</button>
          </div>
        </article>
      `
    )
    .join("");

  list.querySelectorAll("[data-focus]").forEach((button) => {
    button.addEventListener("click", () => {
      $("#productFocus").value = button.dataset.focus;
      $("#listing-studio").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function renderPrintifyTasks() {
  const list = $("#printifyTasks");
  if (!state.printifyTasks.length) {
    list.innerHTML = `<div class="output-card">No Printify tasks queued yet.</div>`;
    return;
  }

  list.innerHTML = state.printifyTasks
    .map(
      (task) => `
        <article class="task-item">
          <h3>${task.title}</h3>
          <p>${task.detail}</p>
        </article>
      `
    )
    .join("");
}

function renderApprovals() {
  const list = $("#approvalList");
  list.innerHTML = state.approvals
    .map(
      (approval) => `
        <article class="approval-item ${approval.status}">
          <div>
            <h3>${approval.title}</h3>
            <p>${approval.detail}</p>
          </div>
          <div class="mini-actions">
            <button class="secondary-button" type="button" data-approve="${approval.id}">
              ${approval.status === "approved" ? "Approved" : "Mark reviewed"}
            </button>
          </div>
        </article>
      `
    )
    .join("");

  list.querySelectorAll("[data-approve]").forEach((button) => {
    button.addEventListener("click", () => approveItem(button.dataset.approve));
  });
}

function updateCounts() {
  $("#trendCount").textContent = state.trends.length;
  $("#draftCount").textContent = state.drafts.length;
  $("#approvalCount").textContent = state.approvals.filter((item) => item.status === "pending").length;
}

function render() {
  renderTrends();
  renderPipeline();
  renderPrintifyTasks();
  renderApprovals();
  updateCounts();
  calculateMargin();
}

function loadSample() {
  $("#trendInput").value = trendSeed.join(", ");
  analyzeTrends();
}

function startDemo() {
  loadSample();
  $("#live-demo").scrollIntoView({ behavior: "smooth", block: "start" });
}

$("#startDemo")?.addEventListener("click", startDemo);
$("#loadSample").addEventListener("click", loadSample);
$("#analyzeTrends").addEventListener("click", analyzeTrends);
$("#buildPipeline").addEventListener("click", buildPipeline);
$("#generateListing").addEventListener("click", generateListing);
$("#queuePrintify").addEventListener("click", queuePrintifyTask);
$("#triageOrder").addEventListener("click", triageOrder);
$("#clearApproved").addEventListener("click", clearApproved);
["#baseCost", "#shippingCost", "#salePrice"].forEach((selector) => {
  $(selector).addEventListener("input", calculateMargin);
});

render();
