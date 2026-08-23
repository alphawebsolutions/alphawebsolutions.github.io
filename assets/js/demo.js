(function () {
  "use strict";

  const catalog = window.ALPHA_DEMOS || { demos: [], alpha: {} };
  const config = window.ALPHA_CONFIG || {};
  const key = document.body.dataset.demo;
  const bundled = catalog.demos.find((entry) => entry.key === key);
  if (!bundled) {
    document.getElementById("app").innerHTML = "<p style='padding:40px'>Demo not found.</p>";
    return;
  }

  const state = { demo: normalise(bundled), activeCategory: "All", query: "", remoteLoaded: false };
  const alpha = catalog.alpha;

  const businessProfiles = {
    restaurant: {
      eyebrow: "Dining information",
      title: "Everything guests need to plan a meal",
      intro: "A restaurant website should answer practical questions before a guest leaves home: what is available, what it costs, where to visit and how to reserve.",
      address: "Andheri East, Mumbai, Maharashtra",
      hours: "Daily · 8:00 AM–11:00 PM",
      serviceArea: "Dine-in, takeaway and small-group dining",
      visitMode: "Walk-ins welcome · table requests recommended on weekends",
      mapQuery: "Andheri East Mumbai restaurants",
      capabilities: [["🍽️", "Complete dining menu", "Separate breakfast, mains and desserts with photos, prices and availability labels."], ["🥗", "Dietary guidance", "Vegetarian choices, spice preferences and customisation notes can be shown beside each dish."], ["🪑", "Table requests", "Guests can send the date, time and party size in a ready WhatsApp enquiry."], ["🥡", "Takeaway information", "Preparation guidance, collection options and item-specific enquiries remain easy to find."], ["🎉", "Group dining", "A dedicated enquiry path can collect occasion, guest count and menu preferences."], ["💳", "Payment clarity", "Accepted payment methods, taxes and current offers can be published without cluttering the menu."]],
      owner: ["Add dishes, prices and sold-out labels from Google Sheets.", "Reorder menu categories and replace food photos from Drive.", "Review table, takeaway and group-dining enquiries in one list."],
      policies: [["Availability", "Items and prices are sample content and should be confirmed before ordering."], ["Allergies", "Guests should tell the restaurant about allergies or dietary restrictions before placing an order."], ["Preparation", "Freshly prepared items may require additional time during peak dining hours."], ["Reservations", "A request is not confirmed until the restaurant responds with a table time."]]
    },
    store: {
      eyebrow: "Shopping information",
      title: "A catalogue that supports confident buying",
      intro: "Customers can compare products, understand delivery and exchange terms, and contact the store about the exact item they viewed.",
      address: "Banjara Hills, Hyderabad, Telangana",
      hours: "Monday–Saturday · 10:00 AM–9:00 PM",
      serviceArea: "Store pickup and local Hyderabad delivery",
      visitMode: "Walk-in showroom · bulk orders by appointment",
      mapQuery: "Banjara Hills Hyderabad shopping",
      capabilities: [["📦", "Live product catalogue", "Organise home, lifestyle and gift products with photos, variants and current prices."], ["🟢", "Stock status", "Mark items available, low-stock, preorder or sold out so customers know what to expect."], ["🚚", "Delivery options", "Show serviceable areas, estimated dispatch times and delivery-charge guidance."], ["🧾", "Billing & warranty", "Publish invoice, warranty and manufacturer-support information where it matters."], ["↩️", "Exchange guidance", "Explain eligibility, timelines and product-condition requirements before purchase."], ["🏷️", "Bulk enquiries", "Hotels, offices and gifting customers can send quantity and delivery requirements directly."]],
      owner: ["Create products, variants, prices and offer badges without changing code.", "Upload replacement product images and maintain category order.", "Track product, bulk-order and delivery enquiries separately."],
      policies: [["Stock", "Availability is confirmed only after the store checks the selected variant and quantity."], ["Delivery", "Delivery time and charges depend on postcode, product size and order value."], ["Exchange", "Unused products may be eligible under the store's published exchange window."], ["Colours", "Screen colours can vary slightly; customers may request additional photos before buying."]]
    },
    business: {
      eyebrow: "Consulting engagement",
      title: "From business challenge to a practical roadmap",
      intro: "A professional-services website should explain expertise, engagement stages, deliverables and the best way to begin a confidential conversation.",
      address: "Lower Parel, Mumbai, Maharashtra",
      hours: "Monday–Friday · 9:30 AM–6:30 PM",
      serviceArea: "Mumbai meetings and remote consulting across India",
      visitMode: "Consultations by prior appointment",
      mapQuery: "Lower Parel Mumbai business district",
      capabilities: [["🔎", "Discovery assessment", "Capture goals, constraints and current operations before recommending a solution."], ["🧭", "Strategy workshops", "Present workshop outcomes, decision points and agreed priorities in a clear format."], ["🗺️", "Implementation roadmap", "Show phases, owners, milestones and measurable outputs for each engagement."], ["📊", "Management reporting", "Provide review summaries, action trackers and progress dashboards for decision-makers."], ["🔐", "Confidential enquiries", "Route sensitive requirements through a structured consultation request."], ["🤝", "Ongoing advisory", "Explain retainer scope, review cadence and what support is included each month."]],
      owner: ["Publish services, sector experience and case-study summaries.", "Update consultation availability and downloadable credentials.", "Classify leads by service, urgency and follow-up status."],
      policies: [["Scope", "Final deliverables are agreed in a written proposal before work begins."], ["Confidentiality", "Sensitive business information should be shared only after the engagement process is confirmed."], ["Timelines", "Schedules depend on stakeholder availability, data access and agreed review dates."], ["Outcomes", "Recommendations support decisions; business results depend on implementation and market conditions."]]
    },
    portfolio: {
      eyebrow: "Professional profile",
      title: "Work, capability and availability in one place",
      intro: "A portfolio should help a prospective client understand the person behind the work, review relevant projects and send a useful brief.",
      address: "Bengaluru, Karnataka · remote-friendly",
      hours: "Monday–Friday · 10:00 AM–7:00 PM",
      serviceArea: "Remote projects across India",
      visitMode: "Video calls and in-person meetings by appointment",
      mapQuery: "Bengaluru Karnataka",
      capabilities: [["🧑‍💻", "Clear service packages", "Explain design, development and support options with realistic starting points."], ["🗂️", "Case studies", "Show the problem, approach, responsibilities and outcome instead of only screenshots."], ["🧰", "Skills & tools", "Group technical and creative capabilities so clients can assess fit quickly."], ["📅", "Availability status", "Show whether new work is open and the likely project start window."], ["📄", "CV & credentials", "Provide a concise professional history and optional downloadable profile."], ["✉️", "Project brief", "Collect goals, timeline, budget range and reference links in one enquiry."]],
      owner: ["Add projects and reorder featured work from a simple content sheet.", "Replace portfolio images and update service availability.", "Save project enquiries with budget and timeline context."],
      policies: [["Estimates", "A final quote follows a review of scope, content and integrations."], ["Portfolio use", "Client work is displayed only when permission allows it."], ["Revisions", "Revision rounds and approval stages are defined in the project proposal."], ["Handover", "Files, credentials and documentation are transferred after final payment."]]
    },
    qr: {
      eyebrow: "Fast table experience",
      title: "A menu designed for a quick scan and quick decision",
      intro: "The experience prioritises large tap targets, short descriptions and live availability for customers ordering from busy food-court tables.",
      address: "Baner, Pune, Maharashtra",
      hours: "Daily · 11:00 AM–11:00 PM",
      serviceArea: "Dine-in and takeaway counter service",
      visitMode: "Scan at the table or open the shared menu link",
      mapQuery: "Baner Pune food court",
      capabilities: [["▦", "Table QR access", "Open the current menu directly without an app download or account."], ["⚡", "Fast categories", "Jump between meals, snacks and drinks with one-thumb navigation."], ["⏱️", "Live availability", "Pause sold-out items and highlight limited-time combos during service."], ["🧂", "Order notes", "Let customers mention quantity, spice level and common customisation requests."], ["🥤", "Combo highlights", "Promote value combinations without hiding individual item pricing."], ["⭐", "Feedback prompt", "Offer an easy post-meal feedback or review link from the same page."]],
      owner: ["Update prices and availability during service from a phone-friendly sheet.", "Create time-limited combos and reorder popular categories.", "Separate table, takeaway and catering enquiries."],
      policies: [["Current menu", "The counter confirms final availability and preparation time."], ["Table service", "A WhatsApp request does not replace the outlet's final order confirmation."], ["Customisation", "Ingredient changes depend on kitchen feasibility and may affect price."], ["QR safety", "Guests should use the QR displayed by the outlet and check the website address before ordering."]]
    },
    custom: {
      eyebrow: "Custom digital workflow",
      title: "A website shaped around the business process",
      intro: "Custom projects can combine public pages, forms, dashboards and integrations instead of forcing every requirement into a standard catalogue.",
      address: "Remote studio · serving businesses across India",
      hours: "Monday–Saturday · 9:30 AM–7:00 PM",
      serviceArea: "Pan-India remote discovery and delivery",
      visitMode: "Online discovery call followed by a written scope",
      mapQuery: "India",
      capabilities: [["🧩", "Requirement discovery", "Map users, roles, business rules and the information each workflow needs."], ["📝", "Smart forms", "Build multi-step enquiries, applications, bookings or internal requests."], ["📈", "Dashboards", "Present useful totals, filters and status views for authorised users."], ["🔌", "Integrations", "Connect approved email, payment, calendar, spreadsheet or API services."], ["👥", "Role-based access", "Separate visitor, staff and administrator actions where the project requires it."], ["🛠️", "Support & iteration", "Plan testing, launch support and future phases from the beginning."]],
      owner: ["Configure content, form choices and workflow statuses.", "Review submissions and update records through the admin tools.", "Expand modules later without redesigning the entire public website."],
      policies: [["Scope", "Features, integrations and responsibilities are documented before development."], ["Third-party tools", "External services may have their own fees, limits and terms."], ["Data", "Sensitive data requires an appropriate privacy and access-control plan."], ["Changes", "Requests outside the agreed scope are estimated and scheduled separately."]]
    },
    realestate: {
      eyebrow: "Property information",
      title: "Listings with the details serious buyers expect",
      intro: "Visitors can compare homes, inspect photos, understand costs and request a site visit with the property already identified.",
      address: "Gachibowli, Hyderabad, Telangana",
      hours: "Monday–Saturday · 9:30 AM–7:00 PM",
      serviceArea: "Hyderabad residential sales and rentals",
      visitMode: "Office consultations and site visits by appointment",
      mapQuery: "Gachibowli Hyderabad real estate",
      capabilities: [["🏠", "Detailed listings", "Show configuration, carpet area, furnishing, possession and key highlights."], ["🖼️", "Room-by-room gallery", "Let visitors enlarge exterior, interior and amenity photos."], ["📍", "Locality context", "Explain nearby schools, transit, hospitals and everyday conveniences."], ["🧮", "Cost summary", "Present price, maintenance and major one-time charges as separate figures."], ["📅", "Site-visit requests", "Collect property, date, time and buyer requirement in one message."], ["📑", "Document guidance", "List the basic checks and documents a customer should discuss with an adviser."]],
      owner: ["Add, edit, archive and mark listings as sold or rented.", "Upload property galleries and change featured-property order.", "Track buyer, tenant and owner enquiries with listing context."],
      policies: [["Verification", "All dimensions, approvals and ownership documents should be independently verified."], ["Pricing", "Property prices and availability can change until an agreement is executed."], ["Site visits", "A requested slot is confirmed only after the representative responds."], ["Advice", "Loan, tax and legal information should be confirmed with qualified professionals."]]
    },
    clinic: {
      eyebrow: "Patient information",
      title: "Care information before an appointment",
      intro: "Patients can review doctor information, consultation hours, common services and accessibility details without treating the website as medical advice.",
      address: "Central Tirupati, Andhra Pradesh",
      hours: "Monday–Saturday · 9:00 AM–1:00 PM and 5:00 PM–8:00 PM",
      serviceArea: "Outpatient family consultations",
      visitMode: "Appointments preferred · limited walk-in capacity",
      mapQuery: "Central Tirupati Andhra Pradesh clinic",
      capabilities: [["🩺", "Doctor profiles", "Show qualifications, areas of practice, languages and consultation schedule."], ["📅", "Appointment requests", "Collect patient name, preferred time and reason for visit for staff confirmation."], ["🧪", "Service information", "Explain consultations, preventive care and diagnostic coordination clearly."], ["♿", "Visit accessibility", "Publish lift, wheelchair, parking and attendant information where applicable."], ["📄", "Report guidance", "Tell patients which reports, prescriptions and identity details to bring."], ["🔔", "Clinic updates", "Display holiday hours, doctor leave and temporary schedule changes prominently."]],
      owner: ["Update doctor hours, services and clinic notices instantly.", "Add educational content approved by the clinic.", "Review appointment requests without exposing them publicly."],
      policies: [["Emergency care", "This demo is not for emergencies. Patients should contact local emergency services or the nearest emergency department."], ["Appointments", "Online requests require confirmation from clinic staff."], ["Medical advice", "Website information is general and does not replace a consultation with a qualified clinician."], ["Privacy", "Only essential contact information should be collected through a public enquiry form."]]
    },
    coaching: {
      eyebrow: "Admissions information",
      title: "Courses, batches and learning support explained clearly",
      intro: "Students and parents can compare programmes, check timings, understand the teaching process and request a counselling call.",
      address: "Anna Nagar, Chennai, Tamil Nadu",
      hours: "Weekdays · 4:00 PM–8:30 PM · Weekends · 9:00 AM–6:00 PM",
      serviceArea: "Classroom and selected online batches",
      visitMode: "Counselling and demo classes by registration",
      mapQuery: "Anna Nagar Chennai coaching centre",
      capabilities: [["📚", "Course pathways", "Separate school tuition, exam preparation and skill programmes by learner goal."], ["🕒", "Batch timetable", "Show days, class times, start dates, mode and seat status."], ["👩‍🏫", "Faculty profiles", "Introduce subject expertise and teaching responsibilities without exaggerated claims."], ["📝", "Tests & practice", "Explain assessment frequency, mock tests and progress-review methods."], ["👨‍👩‍👧", "Parent updates", "Describe attendance and progress communication for school programmes."], ["🎟️", "Demo-class registration", "Collect class, subject and preferred batch before the team follows up."]],
      owner: ["Publish courses, fees, batch dates and seat availability.", "Update faculty profiles and admission notices.", "Track counselling, demo-class and admission enquiries."],
      policies: [["Admissions", "Seat availability and eligibility are confirmed after counselling."], ["Fees", "Payment schedule, materials and refund terms should be issued in writing."], ["Results", "Past performance does not guarantee an individual student's outcome."], ["Schedule", "Batch timing may change with prior notice when operationally necessary."]]
    },
    salon: {
      eyebrow: "Appointment information",
      title: "Treatments, timing and preparation without guesswork",
      intro: "Clients can compare services, see starting prices, understand appointment duration and share preferences before arriving.",
      address: "Benz Circle, Vijayawada, Andhra Pradesh",
      hours: "Tuesday–Sunday · 10:00 AM–8:00 PM · Closed Monday",
      serviceArea: "In-studio hair, skin and bridal services",
      visitMode: "Appointments recommended · consultations available",
      mapQuery: "Benz Circle Vijayawada salon",
      capabilities: [["✂️", "Service menu", "Group hair, skin and occasion services with duration and starting price."], ["📅", "Slot requests", "Let clients send service, preferred stylist, date and time for confirmation."], ["🧴", "Preparation notes", "Explain patch tests, arrival time and before-care for selected treatments."], ["✨", "Results gallery", "Show consented, accurately labelled work in an enlargeable gallery."], ["👰", "Bridal planning", "Collect event date, venue, functions and party size for a tailored consultation."], ["🧼", "Hygiene information", "Describe sanitation practices and when single-use tools are used."]],
      owner: ["Update treatments, durations, prices and seasonal packages.", "Upload approved portfolio images and stylist profiles.", "Organise appointment and bridal consultation enquiries."],
      policies: [["Starting prices", "Final price can vary with hair length, product use and selected add-ons."], ["Patch tests", "Some colour or skin services may require a patch test in advance."], ["Appointments", "A requested slot is held only after the salon confirms it."], ["Cancellations", "Late arrival or cancellation terms should be shared during confirmation."]]
    },
    local: {
      eyebrow: "Home-service information",
      title: "Clear service coverage, charges and visit expectations",
      intro: "A local-services website should help a household describe the problem, understand the visit process and recognise the assigned technician.",
      address: "Service operations across Mumbai, Maharashtra",
      hours: "Daily · 8:00 AM–8:00 PM",
      serviceArea: "Selected Mumbai postcodes · home visits only",
      visitMode: "No walk-in counter · technician visit after confirmation",
      mapQuery: "Mumbai Maharashtra",
      capabilities: [["📍", "Postcode coverage", "Show neighbourhoods served before customers submit a request."], ["🧰", "Service catalogue", "Separate electrical, plumbing and appliance work with starting visit charges."], ["🪪", "Technician details", "Share assigned professional name and visit window after confirmation."], ["📷", "Problem photos", "Allow customers to provide optional images through an approved follow-up channel."], ["💵", "Estimate approval", "Explain visit charge, material cost and approval before additional work."], ["🛡️", "Workmanship support", "Publish the support window and exclusions for completed service work."]],
      owner: ["Change service areas, visit charges and availability windows.", "Assign enquiries by trade and update their status.", "Publish seasonal services and temporary closure notices."],
      policies: [["Visit charge", "The basic charge covers inspection; parts and additional labour are quoted separately."], ["Materials", "Replacement parts proceed only after customer approval."], ["Arrival window", "Travel and earlier jobs can affect the estimated arrival time."], ["Safety", "Customers should isolate unsafe equipment and use emergency services where immediate danger exists."]]
    },
    events: {
      eyebrow: "Event planning",
      title: "One digital place for planning and guest information",
      intro: "Event websites can serve two audiences: clients reviewing packages and guests checking the final invitation, venue and schedule.",
      address: "Online consultations · projects across India",
      hours: "Monday–Saturday · 10:00 AM–7:00 PM",
      serviceArea: "Weddings, celebrations and corporate events across India",
      visitMode: "Discovery call followed by venue or planning meetings",
      mapQuery: "India event venues",
      capabilities: [["💌", "Digital invitations", "Create a fast, shareable invitation that looks polished on every phone."], ["🗓️", "Event schedule", "Publish ceremonies, sessions, dress guidance and timely updates."], ["📍", "Venue directions", "Connect verified map links, parking notes and arrival instructions."], ["✅", "Guest RSVP", "Collect attendance, meal preference and guest-count information."], ["🖼️", "Private gallery", "Share selected event photographs with suitable access controls."], ["🎤", "Vendor & agenda pages", "Present speakers, performers, menus or partner information by event type."]],
      owner: ["Update schedules, venues and guest announcements without code.", "Manage RSVP records and export guest information.", "Reuse the structure for future events while changing the design."],
      policies: [["Event details", "Guests should rely on the latest schedule and venue update shared by the host."], ["RSVP", "Each response should identify all attending guests and any requested meal preference."], ["Privacy", "Private galleries and guest lists require appropriate access settings."], ["Services", "Package scope, vendor responsibility and payment stages are confirmed in a written agreement."]]
    },
    bikes: {
      eyebrow: "Rental information",
      title: "Two-wheelers and four-wheelers, compared clearly",
      intro: "Visitors can filter scooters, motorcycles and cars, compare exact model photos and understand the daily rate, documents, kilometre allowance and return terms before enquiring.",
      address: "Viman Nagar, Pune, Maharashtra",
      hours: "Daily · 7:00 AM–9:00 PM",
      serviceArea: "Pune pickup and return · delivery zones can be added",
      visitMode: "Pre-booking recommended · every vehicle subject to document and condition checks",
      mapQuery: "Viman Nagar Pune vehicle rental",
      capabilities: [["⇄", "2 & 4-wheeler filter", "Separate scooters and motorcycles from hatchbacks, SUVs and family cars in one tap."], ["🚘", "Exact model catalogue", "Pair every recognisable vehicle name with its matching reference image, specifications and use case."], ["📆", "Date-based availability", "Collect vehicle type, exact model, pickup date, return date and location in one enquiry."], ["🪪", "Document checklist", "Explain licence, identity proof, age and address requirements before pickup."], ["₹", "Deposit & payment", "Show sample refundable deposit guidance, accepted payment methods and confirmation steps."], ["🛣️", "Kilometre & fuel terms", "Publish the daily allowance, extra-kilometre guidance and same-level fuel policy."], ["📸", "Pickup & return inspection", "Record odometer, fuel, scratches and accessories with photographs at handover and return."], ["🪖", "Safety & travel extras", "List helmets for two-wheelers and optional luggage, child-seat or doorstep-delivery requests for cars."]],
      owner: ["Add two-wheelers and four-wheelers, daily rates, deposits and maintenance blocks.", "Replace exact-model photos while preserving image-source and licence credits.", "Track model-specific date requests, pickup locations and enquiry status.", "Mark vehicles available, reserved, under maintenance or temporarily hidden."],
      policies: [["Eligibility", "A valid driving licence and accepted identity proof are required at pickup."], ["Deposit", "The refundable deposit and payment method are confirmed for the selected model."], ["Condition", "Pickup and return condition should be recorded with photographs."], ["Availability", "Prices and model availability are sample data until the rental team confirms them."]]
    },
    travel: {
      eyebrow: "Trip information",
      title: "Dates, pickup points and inclusions before booking",
      intro: "Destination pages combine recognisable place photography with a concise itinerary, fixed departure dates and clear per-person pricing.",
      address: "Pickup support in Mumbai and Pune, Maharashtra",
      hours: "Monday–Saturday · 9:00 AM–7:00 PM · trip-day support as scheduled",
      serviceArea: "Group departures from selected Mumbai and Pune pickup points",
      visitMode: "Online booking enquiry · pickup details confirmed before departure",
      mapQuery: "Mumbai Maharashtra",
      capabilities: [["🗺️", "Day-wise itinerary", "Show the route, major stops, approximate timings and overnight location."], ["📅", "Fixed departures", "Publish the actual date range, duration and current seat status."], ["🚌", "Pickup points", "List city pickup zones and share the final reporting point before travel."], ["🏨", "Stay & meals", "State accommodation basis, included meals and room-sharing arrangement."], ["✅", "Inclusions & exclusions", "Separate what the price covers from entry fees and personal expenses."], ["🧾", "Traveller checklist", "Explain identity documents, clothing, accessibility and luggage guidance."]],
      owner: ["Add departures, seat status, prices and itinerary changes.", "Maintain destination galleries with source and licence credit.", "Track package, city, traveller count and preferred pickup point."],
      policies: [["Sample schedule", "Dates and prices shown in this demo are illustrative until confirmed by the operator."], ["Changes", "Weather, traffic or official restrictions may require itinerary changes."], ["Cancellations", "Refund and cancellation terms should be reviewed before payment."], ["Fitness & access", "Travellers should check walking, stair and accessibility requirements for each destination."]]
    },
    gaming: {
      eyebrow: "Gaming venue information",
      title: "Hardware, slot rules and group packages upfront",
      intro: "Players can compare setups, understand hourly rates, check venue rules and send the preferred time and player count before visiting.",
      address: "HITEC City, Hyderabad, Telangana",
      hours: "Daily · 12:00 PM–12:00 AM",
      serviceArea: "Walk-in play, reserved booths and group events",
      visitMode: "Walk-ins subject to availability · reservations recommended",
      mapQuery: "HITEC City Hyderabad gaming centre",
      capabilities: [["🖥️", "Hardware specifications", "List GPU class, monitor refresh rate, peripherals and seating by station tier."], ["🎮", "Game-zone pricing", "Separate PC, console, racing and VR rates with session duration."], ["🕹️", "Slot requests", "Collect setup, player count, date and preferred start time."], ["🏆", "Tournaments", "Publish format, eligibility, check-in, prize information and rules."], ["🎂", "Party packages", "Explain reserved stations, duration, host support and food policy."], ["🧑‍🤝‍🧑", "Venue rules", "Make age guidance, account use and acceptable behaviour clear before arrival."]],
      owner: ["Update station rates, available games and maintenance status.", "Publish tournaments and close registration when capacity is reached.", "Separate individual slot, party and competition enquiries."],
      policies: [["Slots", "Requested times are confirmed only after the venue checks station availability."], ["Accounts", "Players should use accounts and content appropriate to the game publisher's terms."], ["Damage", "Guests are responsible for deliberate damage to venue equipment."], ["Age guidance", "Age-rated games and minor access should follow venue and guardian rules."]]
    }
  };

  function normalise(source) {
    const copy = JSON.parse(JSON.stringify(source));
    copy.features = Array.isArray(copy.features) ? copy.features : safeJson(copy.features, []);
    copy.categories = (copy.categories || []).map((category, index) =>
      typeof category === "string" ? { id: `${copy.key}-cat-${index + 1}`, name: category } : category
    );
    copy.items = (copy.items || []).map((item, index) => {
      if (Array.isArray(item)) {
        const category = copy.categories.find((entry) => entry.name === item[0]);
        return { id: `${copy.key}-item-${index + 1}`, category_id: category?.id || "", category: item[0], title: item[1], description: item[2], price: item[3], badge: item[4], image_url: item[5], source_url: item[6] || "", image_credit: item[7] || "", ...(item[8] || {}) };
      }
      const category = copy.categories.find((entry) => entry.id === item.category_id);
      return { ...item, category: item.category || category?.name || "General" };
    });
    return copy;
  }

  function safeJson(value, fallback) {
    try { return JSON.parse(value); } catch { return fallback; }
  }

  function initials(name) {
    return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
  }

  function whatsapp(message) {
    return `https://wa.me/${config.alphaWhatsApp || alpha.whatsapp}?text=${encodeURIComponent(message)}`;
  }

  function featureDetail(feature, d) {
    const value = feature.toLowerCase();
    if (/price|rate/.test(value)) return "Visitors can understand the expected cost before sending an enquiry.";
    if (/photo|gallery|image/.test(value)) return "Clear visuals help customers recognise the exact item, place, service or result.";
    if (/categor|filter|catalogue|menu|treatment|course/.test(value)) return "Organised sections make a larger catalogue quick to scan on any phone.";
    if (/whatsapp|contact|enquir|booking|order|rsvp|admission/.test(value)) return "A pre-filled message helps visitors contact the business without retyping details.";
    if (/date|schedule|timing|batch/.test(value)) return "Important timings and availability stay visible where customers expect them.";
    if (/map|location|coverage|direction/.test(value)) return "Location information can be connected to maps for easier visits and service planning.";
    if (/admin|update|workflow/.test(value)) return "The included admin setup keeps day-to-day changes simple and organised.";
    if (/form|automation|integration/.test(value)) return "Enquiries and external tools can connect to the website as the business grows.";
    if (/profile|case stud|skill|brand|faculty|doctor/.test(value)) return "Trust-building details show customers who is behind the service and why it is credible.";
    if (/availability|offer|badge/.test(value)) return "Availability and special information can be highlighted without cluttering the page.";
    if (/qr|fast|touch|mobile/.test(value)) return "The experience is designed for quick loading, taps and small mobile screens.";
    return `A practical feature that helps visitors understand this ${d.type.toLowerCase()} before they contact the business.`;
  }

  function profileFor(d) {
    return businessProfiles[d.key] || {
      eyebrow: "Business information",
      title: `Useful details for every ${d.type.toLowerCase()} visitor`,
      intro: "This demo brings services, practical information, location details and enquiries together in one mobile-friendly experience.",
      address: `${d.location} · demo service area`,
      hours: "Business hours available on request",
      serviceArea: d.location,
      visitMode: "Please enquire before visiting",
      mapQuery: d.location,
      capabilities: d.features.map((feature) => ["✓", feature, featureDetail(feature, d)]),
      owner: ["Update content, categories and prices from Google Sheets.", "Replace images using Google Drive links.", "Review enquiries from the connected admin page."],
      policies: [["Demo content", "Names, locations, availability and prices are sample information."], ["Confirmation", "Important details should be confirmed directly with the business."], ["Enquiries", "A message is not a confirmed order or appointment."], ["Customisation", "The final website can use the business's verified policies and information."]]
    };
  }

  function journeyFor(d) {
    const journeys = {
      restaurant: [["01", "Browse the menu", "Open categories, view dish photos and compare prices."], ["02", "Choose favourites", "Open any dish for a larger photo and complete description."], ["03", "Place an enquiry", "Send the selected requirement directly through WhatsApp."]],
      qr: [["01", "Scan and open", "Customers reach the mobile menu instantly from a table QR code."], ["02", "Browse quickly", "Touch-friendly categories help them find dishes without waiting."], ["03", "Order or enquire", "A pre-filled WhatsApp message carries the required details."]],
      store: [["01", "Browse products", "Use categories and search to find the right product."], ["02", "Compare details", "Check photos, prices, availability notes and offers."], ["03", "Ask to purchase", "Send a product-specific enquiry in one tap."]],
      realestate: [["01", "Filter listings", "Browse homes by property type and requirement."], ["02", "Review the property", "Open photos, amenities, pricing and location details."], ["03", "Schedule a visit", "Send the exact property name through WhatsApp."]],
      clinic: [["01", "Review care", "Understand doctor profiles, services and clinic timings."], ["02", "Choose a service", "Open complete details before requesting an appointment."], ["03", "Contact the clinic", "Send an appointment request with the visitor’s details."]],
      coaching: [["01", "Explore courses", "Compare programmes, batches, faculty and fee information."], ["02", "Choose a batch", "Open the full course details and upcoming schedule."], ["03", "Enquire for admission", "Send the selected course in a ready WhatsApp message."]],
      salon: [["01", "Choose a treatment", "Browse services and packages by category."], ["02", "Review pricing", "See treatment details, duration notes and starting prices."], ["03", "Request a slot", "Contact the business with the chosen service already included."]],
      events: [["01", "Open the invitation", "Guests see the celebration, schedule and venue in one link."], ["02", "Check every detail", "Maps, timings, galleries and updates stay easy to find."], ["03", "RSVP instantly", "Guests respond from the same mobile-friendly page."]],
      bikes: [["01", "Filter your vehicle type", "Switch between 2-wheelers and 4-wheelers, then compare exact model photos and daily rates."], ["02", "Review model and terms", "Check seats or engine details, kilometre allowance, fuel, deposit and document requirements."], ["03", "Request date availability", "Send the exact model, pickup and return dates, and preferred location directly on WhatsApp."]],
      travel: [["01", "Choose a destination", "Browse real Maharashtra places with clear destination photos."], ["02", "Review the trip", "Check departure dates, duration, inclusions and per-person prices."], ["03", "Reserve your seats", "Send the package name and traveller count on WhatsApp."]],
      gaming: [["01", "Pick a gaming zone", "Compare PCs, consoles, VR sessions and group packages."], ["02", "Select play time", "Review equipment, hourly pricing and party inclusions."], ["03", "Book a slot", "Send the chosen setup and preferred time through WhatsApp."]],
      portfolio: [["01", "Meet the professional", "Read the introduction, skills and experience."], ["02", "Review selected work", "Open project visuals and detailed case studies."], ["03", "Start a conversation", "Send a clear project requirement directly."]],
      business: [["01", "Describe the challenge", "Share the business goal, current process and decision timeline."], ["02", "Review the approach", "Understand workshops, deliverables and engagement options."], ["03", "Book a discovery call", "Send a structured consultation requirement for follow-up."]],
      custom: [["01", "Map the workflow", "Identify users, roles, data and the decisions the application must support."], ["02", "Agree the scope", "Confirm screens, integrations, milestones and responsibilities."], ["03", "Build in phases", "Launch the useful core first, then improve it using real feedback."]],
      local: [["01", "Choose the service", "Select the trade and describe the problem clearly."], ["02", "Confirm the visit", "Share the location and receive an expected visit window."], ["03", "Approve the estimate", "Review labour and material costs before additional work begins."]]
    };
    return journeys[d.key] || [["01", "Understand the service", "Visitors quickly learn what the business offers and who it serves."], ["02", "Review the details", "Services, proof, prices and useful information stay together."], ["03", "Send a requirement", "A direct enquiry includes the website context automatically."]];
  }

  function faqFor(d, profile) {
    const special = {
      bikes: ["How do I check whether a vehicle is available?", "Choose 2-Wheelers or 4-Wheelers, select the exact model and send your pickup and return dates through the availability form. The rental team can then confirm the vehicle, deposit and documents."],
      travel: ["What is included in each tour price?", "Each package summary lists the sample duration and main inclusions. The travel company should confirm pickup point, stay type, meals and exclusions before payment."],
      restaurant: ["Can customers order from this menu?", "Yes. A menu item can open a pre-filled WhatsApp enquiry. Online payment or delivery integrations can also be added if required."],
      clinic: ["Can patients request an appointment?", "Yes. The contact form opens a structured appointment enquiry. Final appointment time is confirmed by the clinic."],
      gaming: ["Can visitors reserve a gaming slot?", "Yes. They can select a setup or package and send the preferred date, time and player count on WhatsApp."]
    };
    return [
      special[d.key] || [`How does a visitor enquire about ${d.service.toLowerCase()}?`, "They can open any item or service and send a pre-filled WhatsApp message containing the relevant context."],
      ["Can prices, photos and categories be changed?", "Yes. The included Google Sheets and Apps Script admin setup supports adding, editing and removing categories and items without rebuilding the website."],
      ["Where is the business located?", `${d.name} is a demonstration website. Its sample area is ${profile.address}. A live customer website should show the business's verified address, hours, service area and map pin.`],
      ["Do the images open in a larger view?", "Yes. Hero, catalogue, gallery and detail images can be tapped or clicked for a full-screen preview."],
      ["Can Alpha Web Solutions customise this demo?", `Yes. Colours, sections, content, domain, forms and features can be adapted for a real ${d.type.toLowerCase()}.`]
    ];
  }

  function galleryMarkup(d) {
    let items = d.items.slice(0, 6);
    if (d.key === "bikes") {
      const twoWheelers = d.items.filter((item) => item.category === "2-Wheelers");
      const fourWheelers = d.items.filter((item) => item.category === "4-Wheelers");
      items = [twoWheelers[0], fourWheelers[0], twoWheelers[1], fourWheelers[1], twoWheelers[2], fourWheelers[2]].filter(Boolean);
    }
    return items.map((item, index) => `<button class="gallery-card ${index === 0 ? "gallery-featured" : ""}" type="button" data-image-src="${escapeHtml(item.image_url)}" data-image-title="${escapeHtml(item.title)}" aria-label="Open ${escapeHtml(item.title)} image"><img src="${escapeHtml(item.image_url)}" alt="${escapeHtml(item.title)}" loading="lazy"><span><small>${escapeHtml(item.category)}</small><strong>${escapeHtml(item.title)}</strong></span><i>＋</i></button>`).join("");
  }

  function heroVisualMarkup(d) {
    if (d.key !== "bikes") {
      return `<button class="hero-photo-button" type="button" data-image-src="${escapeHtml(d.heroImage || d.hero_image)}" data-image-title="${escapeHtml(d.name)}" aria-label="Open ${escapeHtml(d.name)} photo"><img src="${escapeHtml(d.heroImage || d.hero_image)}" alt="${escapeHtml(d.name)}"></button>`;
    }
    const selections = [
      d.items.find((item) => item.category === "2-Wheelers"),
      d.items.find((item) => item.category === "4-Wheelers")
    ].filter(Boolean);
    return `<div class="vehicle-hero-grid">${selections.map((item) => `<button class="vehicle-hero-panel" type="button" data-image-src="${escapeHtml(item.image_url)}" data-image-title="${escapeHtml(item.title)}" aria-label="Open ${escapeHtml(item.title)} image"><img src="${escapeHtml(item.image_url)}" alt="${escapeHtml(item.title)}"><span><small>${escapeHtml(item.category)}</small><strong>${escapeHtml(item.title)}</strong></span></button>`).join("")}</div>`;
  }

  function industryModuleMarkup(d) {
    if (d.key === "bikes") {
      const counts = d.categories.map((category) => {
        const items = d.items.filter((item) => item.category === category.name);
        return { name: category.name, count: items.length, price: items[0]?.price || "Enquire", icon: category.name === "2-Wheelers" ? "🏍️" : "🚗" };
      });
      return `<section class="industry-module rental-module" id="availability"><div class="industry-heading"><div><span class="demo-eyebrow">Plan your rental</span><h2>Filter, compare and request availability</h2></div><p>Choose two wheels for convenient city travel or four wheels for comfort, luggage and group journeys. This demo sends a complete requirement—not a false booking confirmation.</p></div><div class="rental-overview">${counts.map((entry) => `<button type="button" class="rental-type-card" data-rental-category="${escapeHtml(entry.name)}"><i>${entry.icon}</i><span><small>${escapeHtml(entry.name)}</small><strong>${entry.count} exact models</strong><em>From ${escapeHtml(entry.price)}</em></span><b>View models →</b></button>`).join("")}</div><div class="rental-layout"><form class="rental-form" id="rental-availability-form"><span class="sample-badge">Sample availability enquiry</span><h3>Tell us which vehicle and dates you need</h3><p>All fields below are included in the ready WhatsApp message so the rental team can respond with useful information.</p><div class="rental-form-grid"><label><span>Vehicle type</span><select id="rental-type" name="vehicle_type" required>${d.categories.map((category) => `<option value="${escapeHtml(category.name)}">${escapeHtml(category.name)}</option>`).join("")}</select></label><label><span>Exact model</span><select id="rental-model" name="vehicle_model" required></select></label><label><span>Pickup date</span><input id="rental-pickup" name="pickup_date" type="date" required></label><label><span>Return date</span><input id="rental-return" name="return_date" type="date" required></label><label class="rental-location"><span>Preferred pickup area</span><input name="pickup_location" placeholder="Example: Viman Nagar, Pune" required></label></div><button class="demo-button primary" type="submit">Check availability on WhatsApp <span>↗</span></button><small class="rental-disclaimer">Sample rates and availability must be confirmed by the rental business before payment.</small></form><div class="rental-terms"><span class="demo-eyebrow">Before pickup</span><h3>Clear rental checklist</h3><div class="term-grid"><article><i>🪪</i><div><strong>Licence & identity</strong><p>Carry the correct driving licence and accepted identity/address proof.</p></div></article><article><i>₹</i><div><strong>Deposit & payment</strong><p>Confirm the refundable deposit, payment method and cancellation terms.</p></div></article><article><i>⛽</i><div><strong>Fuel & kilometres</strong><p>Review daily allowance, extra-kilometre rate and return fuel level.</p></div></article><article><i>📸</i><div><strong>Condition record</strong><p>Photograph odometer, fuel, body panels and included accessories.</p></div></article></div></div></div></section>`;
    }

    if (d.key === "travel") {
      const cards = d.items.map((item) => {
        const message = `Hi Alpha Web Solutions, I viewed the ${d.name} travel demo and want a similar website. I am interested in the sample trip: ${item.title} (${item.badge}), pickup from ${item.detail_2 || d.location}.`;
        return `<article class="trip-card"><button class="trip-photo" type="button" data-image-src="${escapeHtml(item.image_url || d.heroImage || d.hero_image)}" data-image-title="${escapeHtml(item.title)}" aria-label="Open ${escapeHtml(item.title)} photo"><img src="${escapeHtml(item.image_url || d.heroImage || d.hero_image)}" alt="${escapeHtml(item.title)}" loading="lazy"><span>View destination photo</span></button><div class="trip-content"><div class="trip-topline"><time>${escapeHtml(item.badge || "Date on request")}</time><span class="seat-status">${escapeHtml(item.detail_3 || "Enquire for seats")}</span></div><h3>${escapeHtml(item.title)}</h3><ul><li>🕒 ${escapeHtml(item.detail_1 || "Duration on request")}</li><li>🚌 Pickup: ${escapeHtml(item.detail_2 || d.location)}</li></ul><div class="trip-bottom"><strong>${escapeHtml(item.price || "Enquire")}</strong><a href="${whatsapp(message)}" target="_blank" rel="noopener">Enquire ↗</a></div></div></article>`;
      }).join("");
      return `<section class="industry-module travel-module" id="upcoming"><div class="industry-heading"><div><span class="demo-eyebrow">Upcoming group trips</span><h2>Compare departures before choosing</h2></div><p>Dates, duration, pickup city, current seat note and package price stay together. Every destination image opens full-screen for a closer look.</p></div><div class="travel-layout"><div class="trip-board">${cards}</div><aside class="trip-aside"><span class="sample-badge">Demo departure board</span><h3>A useful travel enquiry includes</h3><ul><li><i>01</i><span><strong>Departure & pickup city</strong><small>The chosen date plus Mumbai or Pune pickup preference.</small></span></li><li><i>02</i><span><strong>Traveller count</strong><small>Adults, children and preferred room-sharing arrangement.</small></span></li><li><i>03</i><span><strong>Food & accessibility</strong><small>Meal preference, mobility needs and other important requests.</small></span></li><li><i>04</i><span><strong>Contact details</strong><small>A phone number so the operator can confirm seats and payment steps.</small></span></li></ul><a class="demo-button primary" href="${whatsapp(`Hi Alpha Web Solutions, I viewed the ${d.name} demo and want a travel website with upcoming trips, itineraries, seat status and booking enquiries.`)}" target="_blank" rel="noopener">Build a travel website <span>↗</span></a><p>Dates, seats and prices shown are realistic sample content for this demonstration and are not live trip inventory.</p></aside></div></section>`;
    }
    return "";
  }

  function render() {
    const d = state.demo;
    document.documentElement.style.setProperty("--primary", d.primary || d.theme_primary || "#2563eb");
    document.documentElement.style.setProperty("--secondary", d.secondary || d.theme_secondary || "#7c3aed");
    document.title = `${d.name} | ${d.type} Demo`;
    const enquiry = whatsapp(`Hi Alpha Web Solutions, I viewed the ${d.service} demo (${d.name}) and want a similar website for my business.`);
    const profile = profileFor(d);
    const journey = journeyFor(d);
    const faqs = faqFor(d, profile);
    const mapEmbed = `https://www.google.com/maps?q=${encodeURIComponent(profile.mapQuery)}&output=embed`;
    const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile.mapQuery)}`;
    const industryNav = d.key === "bikes"
      ? `<a href="#availability">Availability</a>`
      : d.key === "travel"
        ? `<a href="#upcoming">Upcoming trips</a>`
        : `<a href="#details">Features</a>`;
    const referenceNote = d.key === "bikes"
      ? "Every named 2-wheeler and 4-wheeler uses a matching model reference image. Rental prices, deposits and availability are sample demo data."
      : d.key === "travel"
        ? "Each package uses a matching Maharashtra destination photo. Dates, inclusions and prices are sample demo data."
        : "Names, locations, prices, availability and offers on this page are realistic sample content for demonstration.";

    document.getElementById("app").innerHTML = `
      <div class="demo-shell">
        <div class="top-note">This is a live demo created by <a href="${escapeHtml(config.alphaWebsite || alpha.website)}" target="_blank" rel="noopener">Alpha Web Solutions</a></div>
        <header class="demo-header">
          <a class="demo-brand" href="#home"><span class="brand-mark">${escapeHtml(initials(d.name))}</span><span><strong>${escapeHtml(d.name)}</strong><small>${escapeHtml(d.type)}</small></span></a>
          <button class="menu-toggle" aria-label="Open navigation" aria-expanded="false">☰</button>
          <nav class="demo-nav"><a href="#home">Home</a><a href="#browse">Explore</a>${industryNav}<a href="#location">Location</a><a href="#faq">FAQ</a><a class="nav-cta" href="${enquiry}" target="_blank" rel="noopener">Enquire now</a></nav>
        </header>
        <main>
          <section class="demo-hero" id="home">
            <div class="demo-hero-copy"><span class="demo-eyebrow">${escapeHtml(d.eyebrow)}</span><h1>${escapeHtml(d.headline)}</h1><p>${escapeHtml(d.tagline)}</p><div class="hero-actions"><a class="demo-button primary" href="#browse">Explore ${escapeHtml(d.service.replace(" Websites", "").replace(" Sites", ""))} <span>↓</span></a><a class="demo-button secondary" href="${enquiry}" target="_blank" rel="noopener">Contact on WhatsApp <span>↗</span></a></div><div class="hero-features">${d.features.map((feature) => `<span>✓ ${escapeHtml(feature)}</span>`).join("")}</div></div>
            <div class="demo-hero-image">${heroVisualMarkup(d)}<div class="hero-image-label"><div><small>Demo service area</small><b>${escapeHtml(profile.address)}</b></div><button class="share-button" aria-label="Share this demo">↗</button></div></div>
          </section>
          <section class="stats">${(d.stats || []).map((stat) => `<article><b>${escapeHtml(stat[0])}</b><span>${escapeHtml(stat[1])}</span></article>`).join("")}</section>
          <section class="experience-section"><div class="experience-intro"><span class="demo-eyebrow">A complete customer journey</span><h2>Everything visitors need before they contact you</h2><p>This demo is more than a small landing page. It shows how a real business can explain its offer, present visual details, answer questions and collect useful enquiries.</p></div><div class="experience-grid">${d.features.map((feature, index) => `<article><span>${String(index + 1).padStart(2, "0")}</span><h3>${escapeHtml(feature)}</h3><p>${escapeHtml(featureDetail(feature, d))}</p></article>`).join("")}</div></section>
          <section class="demo-section" id="browse"><div class="section-head"><div><span class="demo-eyebrow">Browse the demo</span><h2>${escapeHtml(d.service)}</h2><p>Use the categories and search to explore. Open any card for a larger image, full information and a requirement-specific enquiry.</p></div><div class="catalog-tools"><label class="search-box"><input id="catalog-search" type="search" placeholder="Search ${escapeHtml(d.service.toLowerCase())}..." aria-label="Search content"></label></div></div><div class="catalog-status"><div id="category-tabs" class="category-tabs"></div><p id="catalog-count" aria-live="polite"></p></div><div id="item-grid" class="item-grid"></div><p class="reference-note">ⓘ ${escapeHtml(referenceNote)}</p></section>
          ${industryModuleMarkup(d)}
          <section class="gallery-section" id="gallery"><div class="gallery-heading"><div><span class="demo-eyebrow">Visual gallery</span><h2>See the details clearly</h2></div><p>Tap or click any image to open it in a larger, distraction-free view.</p></div><div class="gallery-grid">${galleryMarkup(d)}</div></section>
          <section class="about" id="about"><div class="about-media"><button class="about-photo-button" type="button" data-image-src="${escapeHtml((d.items[1] || d.items[0])?.image_url || d.heroImage || d.hero_image)}" data-image-title="About ${escapeHtml(d.name)}" aria-label="Open photo about ${escapeHtml(d.name)}"><img src="${escapeHtml((d.items[1] || d.items[0])?.image_url || d.heroImage || d.hero_image)}" alt="About ${escapeHtml(d.name)}"></button><span class="about-stamp">Demo designed for ${escapeHtml(d.type)}</span></div><div class="about-copy"><span class="demo-eyebrow">About ${escapeHtml(d.name)}</span><h2>${escapeHtml(d.aboutTitle || d.about_title)}</h2><p>${escapeHtml(d.aboutText || d.about_text)}</p><div class="feature-list">${d.features.map((feature) => `<div>${escapeHtml(feature)}</div>`).join("")}</div></div></section>
          <section class="journey-section" id="process"><div class="journey-heading"><span class="demo-eyebrow">Simple on every device</span><h2>From interest to enquiry in three clear steps</h2><p>The flow is designed to reduce confusion and help mobile visitors take action quickly.</p></div><div class="journey-grid">${journey.map((step) => `<article><b>${escapeHtml(step[0])}</b><h3>${escapeHtml(step[1])}</h3><p>${escapeHtml(step[2])}</p></article>`).join("")}</div></section>
          <section class="business-section" id="details"><div class="business-heading"><span class="demo-eyebrow">${escapeHtml(profile.eyebrow)}</span><h2>${escapeHtml(profile.title)}</h2><p>${escapeHtml(profile.intro)}</p></div><div class="business-capability-grid">${profile.capabilities.map((capability) => `<article><i>${escapeHtml(capability[0])}</i><h3>${escapeHtml(capability[1])}</h3><p>${escapeHtml(capability[2])}</p></article>`).join("")}</div></section>
          <section class="location-section" id="location"><div class="location-heading"><div><span class="demo-eyebrow">Location & business details</span><h2>Know where, when and how to connect</h2></div><p>These are clearly labelled demo details. A live website would use the business's verified address, map pin, hours, service limits and contact process.</p></div><div class="location-layout"><div class="location-details"><span class="sample-badge">Sample business information</span><div class="detail-list"><article><i>📍</i><div><small>Area / address</small><strong>${escapeHtml(profile.address)}</strong></div></article><article><i>🕒</i><div><small>Opening hours</small><strong>${escapeHtml(profile.hours)}</strong></div></article><article><i>🧭</i><div><small>Service coverage</small><strong>${escapeHtml(profile.serviceArea)}</strong></div></article><article><i>👋</i><div><small>Visit / booking method</small><strong>${escapeHtml(profile.visitMode)}</strong></div></article></div><div class="location-actions"><a class="demo-button primary" href="${escapeHtml(mapLink)}" target="_blank" rel="noopener">Open sample area in Maps <span>↗</span></a><a class="demo-button secondary" href="${enquiry}" target="_blank" rel="noopener">Ask about this design <span>↗</span></a></div></div><div class="location-map"><iframe src="${escapeHtml(mapEmbed)}" title="Map of the sample service area for ${escapeHtml(d.name)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe><p>Map centred on the sample locality — not a verified storefront pin.</p></div></div><div class="operations-grid"><article class="owner-panel"><span class="demo-eyebrow">Easy owner controls</span><h3>What the business can manage</h3><ul>${profile.owner.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul><p>Google Sheets + Apps Script support practical CRUD for categories, items and enquiries.</p></article><div class="policy-panel"><span class="demo-eyebrow">Important information</span><h3>Clear expectations build trust</h3><div class="policy-grid">${profile.policies.map((policy) => `<article><strong>${escapeHtml(policy[0])}</strong><p>${escapeHtml(policy[1])}</p></article>`).join("")}</div></div></div></section>
          <section class="faq-section" id="faq"><div class="faq-heading"><span class="demo-eyebrow">Helpful information</span><h2>Frequently asked questions</h2><p>Give visitors the answers they need before they call or message.</p></div><div class="faq-list">${faqs.map((faq, index) => `<details ${index === 0 ? "open" : ""}><summary>${escapeHtml(faq[0])}<span>＋</span></summary><p>${escapeHtml(faq[1])}</p></details>`).join("")}</div></section>
          <section class="demo-cta"><div><span class="demo-eyebrow">Make this design yours</span><h2>Ready for a website that represents your business properly?</h2><p>Alpha Web Solutions can replace the demo content with your name, services, photos, prices, location and preferred features.</p></div><a class="demo-button primary" href="${enquiry}" target="_blank" rel="noopener">Share your requirement <span>↗</span></a></section>
          <section class="contact" id="contact"><div class="contact-copy"><span class="demo-eyebrow">Contact through the website</span><h2>Want a website like this?</h2><p>This is a demo business. Send your actual business details to Alpha Web Solutions and we’ll customise the design, content and features for you.</p><div class="contact-points"><a href="${enquiry}" target="_blank" rel="noopener"><i>◉</i> WhatsApp Alpha Web Solutions</a><a href="mailto:${escapeHtml(config.alphaEmail || alpha.email)}"><i>✉</i> ${escapeHtml(config.alphaEmail || alpha.email)}</a><a href="${escapeHtml(config.alphaWebsite || alpha.website)}" target="_blank" rel="noopener"><i>↗</i> ${escapeHtml((config.alphaWebsite || alpha.website).replace(/^https?:\/\//, ""))}</a></div></div><form class="contact-form" id="lead-form"><h3>Share your requirement</h3><div class="form-row"><div class="field"><label for="lead-name">Your name</label><input id="lead-name" name="name" required autocomplete="name"></div><div class="field"><label for="lead-phone">Phone / WhatsApp</label><input id="lead-phone" name="phone" required inputmode="tel" autocomplete="tel"></div></div><div class="field"><label for="lead-email">Email (optional)</label><input id="lead-email" name="email" type="email" autocomplete="email"></div><div class="field"><label for="lead-message">What website do you need?</label><textarea id="lead-message" name="message" required placeholder="Tell us about your business and requirements..."></textarea></div><button class="demo-button primary" type="submit">Send requirement on WhatsApp <span>↗</span></button><p class="form-note">Your message opens in WhatsApp. If the data service is connected, a copy is also saved in the admin enquiries list.</p></form></section>
          <aside class="alpha-strip"><img src="../../logo.png" alt="Alpha Web Solutions logo"><div><small>Website designed & managed by</small><strong>Alpha Web Solutions</strong></div><a href="${escapeHtml(config.alphaWebsite || alpha.website)}" target="_blank" rel="noopener">Visit our website ↗</a></aside>
        </main>
        <footer class="demo-footer">${escapeHtml(d.name)} is a demonstration website. <a href="${escapeHtml(config.alphaWebsite || alpha.website)}" target="_blank" rel="noopener">Build your website with Alpha Web Solutions.</a></footer>
        <a class="floating-enquiry" href="${enquiry}" target="_blank" rel="noopener">WhatsApp enquiry</a>
        <div class="modal-backdrop" id="item-modal" role="dialog" aria-modal="true" aria-label="Content details"><div class="modal" id="modal-content"></div></div>
        <div class="image-lightbox" id="image-lightbox" role="dialog" aria-modal="true" aria-label="Image preview"><button class="lightbox-close" type="button" aria-label="Close image preview">×</button><figure><img id="lightbox-image" alt=""><figcaption id="lightbox-caption"></figcaption></figure></div>
        <div class="toast" id="toast"></div>
      </div>`;

    wireNavigation();
    renderCategories();
    renderItems();
    wireForm();
    wireIndustryForms();
    loadRemote();
  }

  function renderCategories() {
    const names = ["All", ...state.demo.categories.map((category) => category.name)];
    document.getElementById("category-tabs").innerHTML = names.map((name) => `<button type="button" data-category="${escapeHtml(name)}" class="${state.activeCategory === name ? "active" : ""}">${escapeHtml(name)}</button>`).join("");
    document.querySelectorAll("[data-category]").forEach((button) => button.addEventListener("click", () => {
      state.activeCategory = button.dataset.category;
      renderCategories();
      renderItems();
    }));
  }

  function renderItems() {
    const query = state.query.toLowerCase();
    const items = state.demo.items.filter((item) => (state.activeCategory === "All" || item.category === state.activeCategory) && `${item.title} ${item.description} ${item.category}`.toLowerCase().includes(query));
    const count = document.getElementById("catalog-count");
    if (count) count.textContent = `Showing ${items.length} of ${state.demo.items.length}`;
    const grid = document.getElementById("item-grid");
    grid.innerHTML = items.length ? items.map((item) => `<article class="item-card"><button class="item-image" type="button" data-image-src="${escapeHtml(item.image_url)}" data-image-title="${escapeHtml(item.title)}" aria-label="Enlarge ${escapeHtml(item.title)} image"><img src="${escapeHtml(item.image_url)}" alt="${escapeHtml(item.title)}" loading="lazy"><span class="badge">${escapeHtml(item.badge || "Featured")}</span><span class="image-hint">Tap to enlarge</span></button><div class="item-body"><span class="item-category">${escapeHtml(item.category)}</span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description)}</p><div class="item-bottom"><strong>${escapeHtml(item.price || "Enquire")}</strong><button type="button" data-item="${escapeHtml(item.id)}">View details →</button></div></div></article>`).join("") : `<div class="empty">No matching results. Try another category or search.</div>`;
    grid.querySelectorAll("[data-item]").forEach((button) => button.addEventListener("click", () => openModal(button.dataset.item)));
    wireImageButtons(grid);
    wireImageFallbacks(grid);
  }

  function openModal(id) {
    const item = state.demo.items.find((entry) => entry.id === id);
    if (!item) return;
    const message = `Hi Alpha Web Solutions, I viewed ${item.title} on the ${state.demo.name} demo and want a similar website for my business.`;
    const parts = String(item.description || "").split("•").map((part) => part.trim()).filter(Boolean);
    const detailMarkup = parts.length > 1
      ? `<p>${escapeHtml(parts[0])}</p><ul class="modal-highlights">${parts.slice(1).map((part) => `<li>${escapeHtml(part)}</li>`).join("")}</ul>`
      : `<p>${escapeHtml(item.description)}</p>`;
    const sourceMarkup = item.source_url
      ? `<a class="image-source" href="${escapeHtml(item.source_url)}" target="_blank" rel="noopener">${escapeHtml(item.image_credit || "Image reference")} ↗</a>`
      : "";
    document.getElementById("modal-content").innerHTML = `<button class="modal-image" type="button" data-image-src="${escapeHtml(item.image_url)}" data-image-title="${escapeHtml(item.title)}" aria-label="Enlarge ${escapeHtml(item.title)} image"><img src="${escapeHtml(item.image_url)}" alt="${escapeHtml(item.title)}"><span class="image-hint">Tap to enlarge</span></button><div class="modal-content"><button class="modal-close" aria-label="Close details">×</button><div class="item-category">${escapeHtml(item.category)} • ${escapeHtml(item.badge || "Featured")}</div><h2>${escapeHtml(item.title)}</h2>${detailMarkup}<strong class="modal-price">${escapeHtml(item.price || "Enquire")}</strong>${sourceMarkup}<div class="modal-actions"><a class="demo-button primary" href="${whatsapp(message)}" target="_blank" rel="noopener">Ask about this website <span>↗</span></a><button class="demo-button secondary modal-close-secondary" type="button">Continue browsing</button></div></div>`;
    const backdrop = document.getElementById("item-modal");
    backdrop.classList.add("open");
    backdrop.querySelector(".modal-close").addEventListener("click", closeModal);
    backdrop.querySelector(".modal-close-secondary").addEventListener("click", closeModal);
    wireImageButtons(backdrop);
    wireImageFallbacks(backdrop);
  }

  function closeModal() { document.getElementById("item-modal").classList.remove("open"); }

  function wireImageButtons(root = document) {
    root.querySelectorAll("[data-image-src]").forEach((button) => {
      button.addEventListener("click", () => openLightbox(button.dataset.imageSrc, button.dataset.imageTitle));
    });
  }

  function wireImageFallbacks(root = document) {
    root.querySelectorAll("img").forEach((element) => {
      if (element.dataset.fallbackWired) return;
      element.dataset.fallbackWired = "true";
      element.addEventListener("error", () => {
        if (element.dataset.fallbackApplied) return;
        element.dataset.fallbackApplied = "true";
        const label = (element.alt || "Photo").slice(0, 42);
        const primary = state.demo.primary || state.demo.theme_primary || "#2563eb";
        const secondary = state.demo.secondary || state.demo.theme_secondary || "#7c3aed";
        const short = initials(label) || "AW";
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#09162f"/><stop offset="1" stop-color="${escapeHtml(primary)}"/></linearGradient><linearGradient id="a" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${escapeHtml(primary)}"/><stop offset="1" stop-color="${escapeHtml(secondary)}"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/><circle cx="600" cy="308" r="128" fill="url(#a)" opacity=".94"/><circle cx="600" cy="308" r="151" fill="none" stroke="#fff" stroke-opacity=".16" stroke-width="2"/><text x="600" y="345" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="96" fill="#fff">${escapeHtml(short)}</text><text x="600" y="548" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="42" fill="#fff">${escapeHtml(label)}</text><text x="600" y="606" text-anchor="middle" font-family="Arial,sans-serif" font-size="24" fill="#cbd9ef">Demo visual preview • Alpha Web Solutions</text></svg>`;
        const fallback = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
        element.src = fallback;
        const imageButton = element.closest("[data-image-src]");
        if (imageButton) imageButton.dataset.imageSrc = fallback;
      });
    });
  }

  function openLightbox(src, title) {
    if (!src) return;
    const lightbox = document.getElementById("image-lightbox");
    const image = document.getElementById("lightbox-image");
    image.src = src;
    image.alt = title || "Image preview";
    document.getElementById("lightbox-caption").textContent = title || "Image preview";
    lightbox.classList.add("open");
    document.body.classList.add("no-scroll");
    lightbox.querySelector(".lightbox-close").focus();
  }

  function closeLightbox() {
    document.getElementById("image-lightbox").classList.remove("open");
    document.body.classList.remove("no-scroll");
  }

  function wireNavigation() {
    const toggle = document.querySelector(".menu-toggle");
    const nav = document.querySelector(".demo-nav");
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => nav.classList.remove("open")));
    document.getElementById("catalog-search").addEventListener("input", (event) => { state.query = event.target.value.trim(); renderItems(); });
    document.querySelector(".share-button").addEventListener("click", sharePage);
    document.getElementById("item-modal").addEventListener("click", (event) => { if (event.target.id === "item-modal") closeModal(); });
    document.getElementById("image-lightbox").addEventListener("click", (event) => { if (event.target.id === "image-lightbox") closeLightbox(); });
    document.querySelector(".lightbox-close").addEventListener("click", closeLightbox);
    document.addEventListener("keydown", (event) => { if (event.key === "Escape") { closeLightbox(); closeModal(); } });
    wireImageButtons();
    wireImageFallbacks();
  }

  async function sharePage() {
    try {
      if (navigator.share) await navigator.share({ title: document.title, text: state.demo.tagline, url: location.href });
      else { await navigator.clipboard.writeText(location.href); toast("Website link copied"); }
    } catch { /* sharing cancelled */ }
  }

  function wireForm() {
    document.getElementById("lead-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const lead = { action: "save_lead", site_key: state.demo.key, name: form.get("name"), phone: form.get("phone"), email: form.get("email"), message: form.get("message"), source_url: location.href };
      if (config.apiUrl) {
        fetch(config.apiUrl, { method: "POST", mode: "no-cors", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(lead) }).catch(() => {});
      }
      const message = `Hi Alpha Web Solutions, I viewed the ${state.demo.name} demo.\n\nName: ${lead.name}\nPhone: ${lead.phone}\nEmail: ${lead.email || "Not provided"}\nRequirement: ${lead.message}`;
      window.open(whatsapp(message), "_blank", "noopener");
      toast("Opening WhatsApp with your requirement");
    });
  }

  function wireIndustryForms() {
    document.querySelectorAll("[data-rental-category]").forEach((button) => {
      button.addEventListener("click", () => {
        state.activeCategory = button.dataset.rentalCategory;
        state.query = "";
        const search = document.getElementById("catalog-search");
        if (search) search.value = "";
        renderCategories();
        renderItems();
        document.getElementById("browse")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });

    const form = document.getElementById("rental-availability-form");
    if (!form) return;
    const type = document.getElementById("rental-type");
    const model = document.getElementById("rental-model");
    const pickup = document.getElementById("rental-pickup");
    const returnDate = document.getElementById("rental-return");
    const today = new Date();
    const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    pickup.min = localToday;
    returnDate.min = localToday;

    const populateModels = () => {
      const matches = state.demo.items.filter((item) => item.category === type.value);
      model.innerHTML = matches.map((item) => `<option value="${escapeHtml(item.title)}">${escapeHtml(item.title)} — ${escapeHtml(item.price)}</option>`).join("");
    };
    type.addEventListener("change", populateModels);
    pickup.addEventListener("change", () => {
      returnDate.min = pickup.value || localToday;
      if (returnDate.value && returnDate.value < returnDate.min) returnDate.value = returnDate.min;
    });
    populateModels();

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      if (String(data.get("return_date")) < String(data.get("pickup_date"))) {
        toast("Return date must be after the pickup date");
        return;
      }
      const message = `Hi Alpha Web Solutions, I viewed the ${state.demo.name} demo and want a similar vehicle-rental website.\n\nSample rental enquiry:\nVehicle type: ${data.get("vehicle_type")}\nExact model: ${data.get("vehicle_model")}\nPickup date: ${data.get("pickup_date")}\nReturn date: ${data.get("return_date")}\nPreferred pickup area: ${data.get("pickup_location")}\n\nPlease help me build a website with 2/4-wheeler filters and availability enquiries.`;
      window.open(whatsapp(message), "_blank", "noopener");
      toast("Opening WhatsApp with the rental requirement");
    });
  }

  function toast(message) {
    const element = document.getElementById("toast");
    element.textContent = message;
    element.classList.add("show");
    window.setTimeout(() => element.classList.remove("show"), 2400);
  }

  function loadRemote() {
    if (!config.apiUrl || state.remoteLoaded) return;
    state.remoteLoaded = true;
    const script = document.createElement("script");
    script.src = `${config.apiUrl}?site=${encodeURIComponent(key)}&callback=AlphaDemos.receive&_=${Date.now()}`;
    script.onerror = () => toast("Showing bundled demo data");
    document.body.appendChild(script);
  }

  window.AlphaDemos = {
    receive(payload) {
      if (!payload || !payload.ok || !payload.site) return;
      const remote = {
        ...state.demo,
        ...payload.site,
        primary: payload.site.theme_primary || state.demo.primary,
        secondary: payload.site.theme_secondary || state.demo.secondary,
        heroImage: payload.site.hero_image || state.demo.heroImage,
        aboutTitle: payload.site.about_title || state.demo.aboutTitle,
        aboutText: payload.site.about_text || state.demo.aboutText,
        stats: safeJson(payload.site.stats, state.demo.stats),
        features: safeJson(payload.site.features, state.demo.features),
        categories: payload.categories,
        items: (payload.items || []).map((item) => ({ ...(state.demo.items.find((entry) => entry.id === item.id) || {}), ...item }))
      };
      state.demo = normalise(remote);
      state.activeCategory = "All";
      state.query = "";
      render();
    }
  };

  render();
})();
