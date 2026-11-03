/* Knowledge base for "Kofi", the Labour Department of Ghana help assistant.
   window.LD_KB: intents used by the local retrieval engine in chatbot.js.
   window.LD_KB_FACTS: compact fact sheet (kept in sync with api/chat.js).
   General guidance only. The Labour Act, 2003 (Act 651) and its regulations are authoritative. */
(function (w) {
  "use strict";

  var GLMIS = { href: "https://glmis.gov.gh", label: "Open GLMIS", glmis: true };
  var GLMIS_REG = { href: "https://glmis.gov.gh", label: "Register on GLMIS", glmis: true };
  var GLMIS_JOBS = { href: "https://glmis.gov.gh", label: "Search jobs on GLMIS", glmis: true };
  var GLMIS_POST = { href: "https://glmis.gov.gh", label: "Post a vacancy on GLMIS", glmis: true };

  w.LD_KB = [
    /* ---------- Small talk ---------- */
    {
      id: "greeting",
      q: ["hello", "hi there", "good morning", "akwaaba", "hey kofi", "how are you"],
      k: ["hello", "hi", "hey", "good morning", "good afternoon", "good evening", "akwaaba", "maakye", "maaha", "maadwo", "ete sen", "chale", "charlie", "boss", "how far", "how are you", "kofi"],
      a: "<p>Akwaaba! I am Kofi, the Labour Department help assistant. I can help you find a job on GLMIS, explain your rights at work (minimum wage, leave, notice, maternity) and show you how to get help from the Department.</p><p>What would you like to know?</p>",
      links: [GLMIS_JOBS, { href: "/workers-rights", label: "Workers' rights" }, { href: "/services", label: "Our services" }]
    },
    {
      id: "capabilities",
      q: ["what can you do", "what can you help me with", "how do you work", "who are you", "are you a robot", "help me"],
      k: ["what can you do", "help me", "who are you", "robot", "bot", "assistant", "options", "menu", "topics"],
      a: "<p>I can answer common questions about:</p><ul><li>Finding work or hiring through <strong>GLMIS</strong>, Ghana's free jobs portal</li><li>Public Employment Centres and job counselling</li><li>Workers' rights: minimum wage, hours, leave, maternity, termination</li><li>Labour complaints, child labour and workplace injuries</li><li>Licensing private employment agencies and avoiding job scams</li></ul><p>I give general guidance, not legal advice.</p>",
      links: [GLMIS, { href: "/faq", label: "FAQ" }, { href: "/contact", label: "Contact us" }]
    },
    {
      id: "thanks",
      q: ["thank you", "thanks a lot", "medaase", "that helps", "ok thanks"],
      k: ["thank", "thanks", "thank you", "medaase", "meda wo ase", "appreciate", "helpful", "great", "nice one", "ok"],
      a: "<p>You are welcome! If you are looking for work, remember to register on GLMIS so employers can find you. Anything else I can help with?</p>",
      links: [GLMIS_REG]
    },
    {
      id: "bye",
      q: ["bye", "goodbye", "see you", "later"],
      k: ["bye", "goodbye", "good bye", "see you", "later", "nantew yie", "gotta go", "cheers"],
      a: "<p>Goodbye, and all the best! You can reopen this chat any time from the <strong>Ask Kofi</strong> button.</p>",
      links: []
    },

    /* ---------- GLMIS ---------- */
    {
      id: "glmis_about",
      q: ["what is glmis", "tell me about glmis", "what is the ghana labour market information system", "glmis meaning"],
      k: ["glmis", "labour market information system", "jobs portal", "job portal", "job website", "job site", "online jobs"],
      a: "<p><strong>GLMIS</strong> (Ghana Labour Market Information System) is the government's free online jobs platform. It connects job seekers with employers across Ghana and publishes labour market information.</p><ul><li>Job seekers create a profile, upload a CV and apply for vacancies</li><li>Employers post vacancies and search for candidates</li><li>Anyone can view labour market data and trends</li></ul>",
      links: [GLMIS, { href: "/glmis", label: "How GLMIS works" }]
    },
    {
      id: "glmis_register",
      q: ["how do i get a job", "how do i find work", "how to register on glmis", "i need a job", "i am unemployed", "how to register as a job seeker", "where can i see vacancies", "how to apply for jobs", "graduate looking for work", "any job openings", "national service done need job"],
      k: ["job", "jobs", "work", "find work", "get a job", "need a job", "looking for work", "vacancy", "vacancies", "job seeker", "jobseeker", "unemployed", "unemployment", "no work", "hustle", "apply", "application", "register", "sign up", "recruitment", "hiring", "employment", "graduate", "nss", "national service", "openings", "job hunt", "searching", "register on glmis", "glmis register", "create account", "create glmis account", "sign up on glmis"],
      a: "<p>The fastest way is to <strong>register on GLMIS</strong>, Ghana's free government jobs portal:</p><ul><li>Go to glmis.gov.gh and create a job seeker account</li><li>Complete your profile, skills and upload your CV</li><li>Search and apply for vacancies, and let employers find you</li></ul><p>You can also visit a <strong>Public Employment Centre</strong> in your region for free job matching and counselling.</p>",
      links: [GLMIS_REG, { href: "/glmis", label: "GLMIS guide" }, { href: "/services", label: "Employment centres" }]
    },
    {
      id: "glmis_employer",
      q: ["how do i post a vacancy", "i want to hire workers", "employer register on glmis", "advertise a job", "find staff for my company", "recruit employees"],
      k: ["post vacancy", "post a vacancy", "shop", "workers", "employees", "post a job", "post job", "advertise", "advert", "hire", "hire staff", "find staff", "recruit staff", "employer account", "employer register", "my company", "my business", "candidates", "workers for my", "staff"],
      a: "<p>Employers can recruit for free on <strong>GLMIS</strong>:</p><ul><li>Create an employer account on glmis.gov.gh</li><li>Post your vacancy with the job description and requirements</li><li>Search job seeker profiles and shortlist candidates</li></ul><p>The Public Employment Centre in your region can also help match you with suitable candidates.</p>",
      links: [GLMIS_POST, { href: "/employers", label: "Employer guide" }]
    },
    {
      id: "glmis_free",
      q: ["is glmis free", "do i pay to register on glmis", "how much does glmis cost", "is there a fee for glmis"],
      k: ["free", "cost", "fee", "fees", "charge", "pay to register", "how much", "money"],
      a: "<p>Yes. <strong>GLMIS is free</strong> for both job seekers and employers. Services at the Public Employment Centres are also free.</p><p>Never pay anyone who asks for money to register you or \"guarantee\" a job.</p>",
      links: [GLMIS_REG, { href: "/glmis", label: "About GLMIS" }]
    },
    {
      id: "glmis_help",
      q: ["i cannot access glmis", "glmis not working", "i forgot my glmis password", "i do not have internet to register", "can someone help me register", "help with glmis account"],
      k: ["cannot access", "can't access", "cant access", "not working", "error", "password", "forgot", "login", "log in", "account", "no internet", "no smartphone", "no phone", "help me register", "assist", "problem", "trouble", "locked"],
      a: "<p>If you have trouble with GLMIS:</p><ul><li>Use the password reset option on the GLMIS login page</li><li>Try another browser or device, or a different network</li><li>Visit your nearest <strong>Public Employment Centre</strong> or Labour Department office. Staff can help you register and update your profile for free</li></ul>",
      links: [GLMIS, { href: "/contact", label: "Find an office" }]
    },
    {
      id: "lmi_data",
      q: ["where can i find labour market data", "unemployment statistics in ghana", "labour market information", "which jobs are in demand", "employment trends"],
      k: ["data", "statistics", "stats", "labour market data", "labour market information", "lmi", "trends", "in demand", "demand", "research", "report", "figures", "skills gap"],
      a: "<p>Labour market information (vacancy trends, in-demand skills and related data) is published on <strong>GLMIS</strong>. It is useful for job seekers choosing a career, employers planning hiring and researchers.</p><p>For official national employment statistics you can also check the Ghana Statistical Service.</p>",
      links: [GLMIS, { href: "/glmis", label: "GLMIS overview" }]
    },
    {
      id: "cv_help",
      q: ["how do i write a cv", "help with my cv", "interview tips", "how to prepare for an interview", "career advice"],
      k: ["cv", "resume", "curriculum vitae", "cover letter", "interview", "career", "career advice", "career guidance", "skills"],
      a: "<p>Tips for a strong application:</p><ul><li>Keep your CV to 1 or 2 pages: contact details, skills, experience, education</li><li>Tailor it to each vacancy and use clear job titles</li><li>Upload it to your <strong>GLMIS</strong> profile so employers can find you</li></ul><p>For free one-on-one career guidance, visit a <strong>Public Employment Centre</strong>.</p>",
      links: [GLMIS_REG, { href: "/services", label: "Job counselling" }]
    },

    /* ---------- Employment centres ---------- */
    {
      id: "pec",
      q: ["what is a public employment centre", "where is the employment centre", "is there a labour office in my region", "employment centre near me", "pec in bono region"],
      k: ["public employment centre", "public employment center", "employment centre", "employment center", "pec", "pecs", "labour office", "office near me", "region", "regional", "district", "odomase", "goaso", "bono", "ahafo", "near me"],
      a: "<p><strong>Public Employment Centres (PECs)</strong> are Labour Department offices in all 16 regions, for example at Odomase (Bono Region) and Goaso (Ahafo Region). Their services are <strong>free</strong>:</p><ul><li>Job matching and placement</li><li>Job counselling and career guidance</li><li>Help registering on GLMIS</li><li>Labour complaints and mediation</li></ul>",
      links: [{ href: "/contact", label: "Find an office" }, { href: "/services", label: "Services" }, GLMIS]
    },
    {
      id: "counselling",
      q: ["do you offer job counselling", "i need career guidance", "i do not know what job to do", "vocational guidance"],
      k: ["counselling", "counseling", "guidance", "counsellor", "advice", "career guidance", "vocational", "what job", "career path"],
      a: "<p>Yes. Our Public Employment Centres offer <strong>free job counselling</strong>: help choosing a career, matching your skills to available work and preparing for interviews.</p><p>Register on GLMIS too, so you see current vacancies.</p>",
      links: [{ href: "/services", label: "Employment services" }, GLMIS_REG]
    },

    /* ---------- Wages and conditions ---------- */
    {
      id: "min_wage",
      q: ["how much is minimum wage now", "what is the minimum wage in 2026", "daily minimum wage ghana", "national daily minimum wage", "minimum wage 2025"],
      k: ["minimum wage", "minimum", "wage", "wages", "ndmw", "daily wage", "least pay", "lowest pay", "2026", "2025", "tripartite"],
      a: "<p>The <strong>National Daily Minimum Wage for 2026 is GH¢21.77</strong> per day, effective <strong>1 January 2026</strong>. In 2025 it was GH¢19.97.</p><p>It is set by the National Tripartite Committee (government, employers and organised labour). No employer may pay a worker below it.</p>",
      links: [{ href: "/workers-rights", label: "Workers' rights" }, { href: "/services#complaints", label: "Report underpayment" }]
    },
    {
      id: "unpaid_salary",
      q: ["my employer has not paid my salary", "my boss is not paying me", "salary arrears", "they owe me money for work", "pay day passed and no salary", "employer deducting my pay"],
      k: ["not paid", "not paying", "unpaid", "owe", "owing", "arrears", "salary", "pay day", "payday", "late salary", "deduction", "deductions", "withheld", "chop my money"],
      a: "<p>Your employer must pay your wages in full and on time, as agreed in your contract. If wages are unpaid or wrongly deducted:</p><ul><li>Raise it with your employer in writing first and keep copies</li><li>If it is not resolved, report to the nearest <strong>Labour Department office</strong> for mediation</li><li>You can then take the matter to the <strong>National Labour Commission</strong></li></ul>",
      links: [{ href: "/services#complaints", label: "File a complaint" }, { href: "/contact", label: "Find an office" }]
    },
    {
      id: "annual_leave",
      q: ["how many days annual leave", "how many leave days do i get", "am i entitled to annual leave", "holiday leave days"],
      k: ["annual leave", "leave", "leave days", "refuse leave", "deny leave", "no leave", "holiday", "holidays", "vacation", "days off", "rest days"],
      a: "<p>Under section 20 of the Labour Act (Act 651), a worker is entitled to <strong>at least 15 working days of paid annual leave</strong> after <strong>12 months of continuous service</strong>.</p><p>Your contract or collective agreement may give more. Leave cannot be given up for money, except where the law or agreement allows.</p>",
      links: [{ href: "/workers-rights", label: "Workers' rights" }, { href: "/faq", label: "FAQ" }]
    },
    {
      id: "working_hours",
      q: ["how many hours should i work", "maximum working hours", "working hours per week", "my boss makes me work 12 hours"],
      k: ["hours", "working hours", "work hours", "per day", "per week", "long hours", "shift", "shifts", "break", "rest"],
      a: "<p>The normal maximum is <strong>8 hours a day</strong> and <strong>40 hours a week</strong>. Work beyond these hours is <strong>overtime</strong> and must be paid at the agreed overtime rate.</p><p>If you are regularly made to work longer without overtime pay, report it to the Labour Department.</p>",
      links: [{ href: "/workers-rights", label: "Workers' rights" }, { href: "/services#complaints", label: "File a complaint" }]
    },
    {
      id: "overtime",
      q: ["do i get paid for overtime", "overtime rate", "can my employer force me to work overtime"],
      k: ["overtime", "extra hours", "extra time", "weekend work", "work on sunday", "public holiday work"],
      a: "<p>Work beyond 8 hours a day or 40 hours a week is <strong>overtime</strong>. It should be paid at the rate set in your contract or collective agreement.</p><p>If overtime is not being paid, keep a record of your hours and report to the nearest Labour Department office.</p>",
      links: [{ href: "/workers-rights", label: "Workers' rights" }, { href: "/services#complaints", label: "File a complaint" }]
    },
    {
      id: "maternity",
      q: ["how many weeks maternity leave", "maternity leave in ghana", "am i paid during maternity leave", "nursing breaks", "pregnant at work rights", "twins maternity leave"],
      k: ["maternity", "pregnant", "pregnancy", "baby", "birth", "nursing", "breastfeed", "breastfeeding", "twins", "delivery", "mother", "new mum", "paternity"],
      a: "<p>A woman worker is entitled to <strong>at least 12 weeks of maternity leave on full pay</strong>, plus <strong>2 extra weeks</strong> for an abnormal delivery or multiple births.</p><ul><li>A nursing mother may take breaks during working hours to nurse her baby</li><li>You cannot be dismissed because you are pregnant or on maternity leave</li></ul>",
      links: [{ href: "/workers-rights", label: "Workers' rights" }, { href: "/services#complaints", label: "Report a problem" }]
    },
    {
      id: "sick_leave",
      q: ["can i take sick leave", "i was sick and my boss deducted pay", "sick leave rules"],
      k: ["sick", "sick leave", "ill", "illness", "medical", "hospital", "doctor"],
      a: "<p>Sick leave terms are usually set by your contract or collective agreement, often supported by a medical certificate. If you are unsure of your rights or think you were treated unfairly, contact your nearest Labour Department office.</p><p>If you were injured at work, ask me about <strong>workmen's compensation</strong>.</p>",
      links: [{ href: "/workers-rights", label: "Workers' rights" }, { href: "/contact", label: "Contact us" }]
    },
    {
      id: "contract",
      q: ["do i need a written contract", "my employer has no contract for me", "employment contract", "appointment letter"],
      k: ["contract", "written contract", "appointment letter", "agreement", "terms", "casual", "temporary", "permanent", "probation"],
      a: "<p>For work of 6 months or more, your employer should give you a <strong>written statement of your main terms</strong> (pay, hours, leave, duties, notice) within 2 months of starting.</p><p>Keep copies of your contract and payslips. If you have problems, the Labour Department can advise.</p>",
      links: [{ href: "/workers-rights", label: "Workers' rights" }, { href: "/employers", label: "Employer duties" }]
    },

    /* ---------- Termination and complaints ---------- */
    {
      id: "termination_notice",
      q: ["how much notice must my employer give", "notice period for termination", "can i be sacked without notice", "how much notice to resign", "pay in lieu of notice"],
      k: ["notice", "notice period", "resign", "resignation", "quit", "pay in lieu", "one month notice", "two weeks notice", "terminate", "termination"],
      a: "<p>Minimum notice under the Labour Act (either side can give pay instead of notice):</p><ul><li>Contract of <strong>3 years or more</strong>: 1 month's notice or 1 month's pay</li><li>Contract <strong>under 3 years</strong>: 2 weeks' notice or 2 weeks' pay</li><li><strong>Week to week</strong> contract: 7 days' notice</li></ul><p>Your contract may give longer notice.</p>",
      links: [{ href: "/workers-rights", label: "Workers' rights" }, { href: "/services#complaints", label: "File a complaint" }]
    },
    {
      id: "unfair_termination",
      q: ["my boss sacked me without notice", "i was fired unfairly", "unfair dismissal", "they sacked me because i am pregnant", "dismissed for joining a union", "wrongful termination"],
      k: ["sack", "sacked", "fire", "fired", "dismiss", "dismissed", "dismissal", "unfair", "wrongful", "unfairly", "laid off", "layoff", "redundant", "redundancy", "lost my job", "kicked out", "chased me"],
      a: "<p>Termination is <strong>unfair</strong> if it is for reasons such as pregnancy, union membership, filing a complaint, illness, or without a valid reason and fair procedure.</p><ul><li>Write down what happened and keep your contract, payslips and letters</li><li>Report to the nearest <strong>Labour Department office</strong> for advice and mediation</li><li>You can file a complaint with the <strong>National Labour Commission</strong></li></ul><p>Meanwhile, keep your job search going on GLMIS.</p>",
      links: [{ href: "/services#complaints", label: "File a complaint" }, GLMIS_JOBS]
    },
    {
      id: "complaint",
      q: ["how do i file a labour complaint", "where do i report my employer", "i want to report my company", "how to make a complaint against my boss", "labour dispute"],
      k: ["complaint", "complain", "report employer", "report my", "report", "dispute", "grievance", "mediation", "petition", "case", "file"],
      a: "<p>How to resolve a workplace problem:</p><ul><li><strong>1.</strong> Raise it with your employer or supervisor, in writing if possible</li><li><strong>2.</strong> If unresolved, go to the nearest <strong>Labour Department office</strong> or Public Employment Centre for advice and mediation</li><li><strong>3.</strong> If still unresolved, take it to the <strong>National Labour Commission</strong></li><li><strong>4.</strong> Finally, the courts</li></ul><p>Bring your contract, payslips and any letters.</p>",
      links: [{ href: "/services#complaints", label: "Complaint steps" }, { href: "/contact", label: "Find an office" }]
    },
    {
      id: "nlc",
      q: ["what is the national labour commission", "how do i go to the nlc", "nlc case"],
      k: ["nlc", "national labour commission", "labour commission", "commission", "tribunal", "court", "lawyer", "sue"],
      a: "<p>The <strong>National Labour Commission (NLC)</strong> is an independent body that settles labour disputes, including unfair termination, through mediation and arbitration.</p><p>Many disputes can be solved earlier with help from the Labour Department, so start at your nearest office.</p>",
      links: [{ href: "/services#complaints", label: "Complaint steps" }, { href: "/contact", label: "Contact us" }]
    },

    /* ---------- Child labour ---------- */
    {
      id: "child_labour_law",
      q: ["what is the minimum age to work in ghana", "can a 14 year old work", "is child labour illegal", "at what age can a child work", "hazardous work age"],
      k: ["child labour", "child labor", "children", "child", "minimum age", "age", "underage", "under age", "14 year", "13 year", "teenager", "kid", "kids", "small boy", "small girl", "children's act", "act 560", "light work", "hazardous"],
      a: "<p>Under the Children's Act, 1998 (Act 560):</p><ul><li>Minimum age for employment: <strong>15 years</strong></li><li>Light work (not harmful, does not affect school): from <strong>13 years</strong></li><li>Hazardous work (mining, fishing at sea, heavy loads, chemicals, night work): <strong>18 years</strong></li><li>No child may do night work between <strong>8pm and 6am</strong></li></ul>",
      links: [{ href: "/child-labour", label: "Child labour" }]
    },
    {
      id: "child_labour_report",
      q: ["how do i report child labour", "my 12 year old nephew is working in a mine", "children working in galamsey", "a child is being forced to work", "report child trafficking", "children carrying loads at the market"],
      k: ["report child", "child labour", "child labor", "child", "children", "nephew", "niece", "galamsey", "mine", "mining", "trafficking", "trafficked", "fishing", "kayayo", "kayayei", "cocoa farm", "forced", "abuse", "year old", "boy", "girl", "carrying loads", "loads", "head porter", "market", "street", "hawking", "selling", "begging", "working child"],
      a: "<p>Thank you for speaking up. Children under 18 must never do hazardous work such as mining or galamsey. You can report to:</p><ul><li>The <strong>Child Labour Unit</strong> of the Labour Department, or any Labour Department office</li><li>Your <strong>District Assembly</strong> or Department of Social Welfare</li><li>The <strong>Police</strong> (DOVVSU), especially if the child is in immediate danger</li></ul><p>Give the location and what you saw. You do not need proof to report.</p>",
      links: [{ href: "/child-labour", label: "Report child labour" }, { href: "/contact", label: "Contact us" }]
    },
    {
      id: "gaap",
      q: ["what is the ghana accelerated action plan against child labour", "what is government doing about child labour", "child labour action plan"],
      k: ["action plan", "child labour action plan", "plan", "national plan", "gaap", "accelerated", "2023-2027", "programme", "program", "government doing", "strategy", "eliminate", "campaign"],
      a: "<p>The <strong>Ghana Accelerated Action Plan Against Child Labour (2023-2027)</strong> guides national efforts to end child labour, working with District Assemblies, communities, employers, cocoa and mining sectors, and partners.</p><p>The Labour Department's Child Labour Unit coordinates much of this work.</p>",
      links: [{ href: "/child-labour", label: "Child labour" }, { href: "/about", label: "About us" }]
    },

    /* ---------- Safety, injury, inspection ---------- */
    {
      id: "compensation",
      q: ["i was injured at work", "workmen's compensation", "accident at work who pays", "compensation for injury at work", "worker died at work"],
      k: ["injury", "injured", "accident", "hurt", "compensation", "workmen", "workmens", "pndcl 187", "disability", "died", "death", "claim", "insurance", "insurer"],
      a: "<p>Under the <strong>Workmen's Compensation Law, 1987 (PNDCL 187)</strong>, a worker injured (or the family of a worker killed) in a work accident may be compensated:</p><ul><li>The employer must report the accident to the <strong>Labour Department</strong></li><li>The worker has a medical assessment of the injury</li><li>The Department assesses the claim and the <strong>employer or its insurer pays</strong></li></ul><p>Get medical care first, then contact your nearest office.</p>",
      links: [{ href: "/services#compensation", label: "Compensation claims" }, { href: "/contact", label: "Find an office" }]
    },
    {
      id: "safety",
      q: ["my workplace is not safe", "occupational health and safety", "no protective equipment at work", "employer does not give ppe"],
      k: ["safety", "safe", "unsafe", "danger", "dangerous", "osh", "occupational", "health and safety", "ppe", "protective", "helmet", "gloves", "boots", "chemicals", "fire"],
      a: "<p>Employers must provide a <strong>safe and healthy workplace</strong>: safe equipment, training, and protective equipment (PPE) where needed, at no cost to the worker.</p><p>A worker may report unsafe conditions to the Labour Department, and should not be punished for doing so.</p>",
      links: [{ href: "/employers", label: "Employer duties" }, { href: "/services#complaints", label: "Report a problem" }]
    },
    {
      id: "inspection",
      q: ["does the labour department inspect workplaces", "labour inspection", "what happens during a labour inspection"],
      k: ["inspection", "inspect", "inspector", "inspectors", "visit", "audit", "compliance", "check"],
      a: "<p>Labour Officers carry out <strong>workplace inspections</strong> to check that employers follow the law on wages, hours, leave, safety, child labour and records.</p><p>Employers should keep proper records and cooperate. Workers can request an inspection by reporting a problem to their nearest office.</p>",
      links: [{ href: "/employers", label: "Employer guide" }, { href: "/services", label: "Services" }]
    },
    {
      id: "employer_duties",
      q: ["what are my obligations as an employer", "employer responsibilities in ghana", "what must an employer do"],
      k: ["employer obligations", "obligations", "responsibilities", "duties", "employer duties", "comply", "employer duties", "employer responsibilities"],
      a: "<p>Key employer duties include:</p><ul><li>Pay at least the minimum wage, on time</li><li>Respect hours, leave and maternity rights</li><li>Give written terms of employment</li><li>Keep a safe workplace and report accidents</li><li>Never employ children in prohibited work</li></ul><p>Recruit for free on <strong>GLMIS</strong>.</p>",
      links: [{ href: "/employers", label: "Employer guide" }, GLMIS_POST]
    },
    {
      id: "union",
      q: ["can i join a trade union", "workers union rights", "my boss says i cannot join a union"],
      k: ["union", "unions", "trade union", "tuc", "collective agreement", "collective bargaining", "strike", "association"],
      a: "<p>Workers in Ghana have the right to form or join a <strong>trade union</strong> of their choice. Dismissing or punishing a worker for union membership is unfair.</p><p>Collective agreements can give better terms than the legal minimum.</p>",
      links: [{ href: "/workers-rights", label: "Workers' rights" }]
    },

    /* ---------- Agencies, scams, migration ---------- */
    {
      id: "agency_license",
      q: ["i want to open a recruitment agency", "how to license a private employment agency", "requirements for employment agency licence", "start a manpower agency", "agency quarterly returns"],
      k: ["agency", "agencies", "recruitment agency", "employment agency", "private employment agency", "manpower", "licence", "license", "licensing", "permit", "open an agency", "start agency", "quarterly returns", "returns", "renew"],
      a: "<p>To operate a <strong>private employment agency</strong> you need a licence:</p><ul><li>Register your company with the <strong>Registrar-General</strong></li><li>Apply to the Minister through the <strong>Labour Department</strong></li><li>Your premises and staff are inspected</li><li>If approved, a licence is issued</li><li>Submit <strong>quarterly returns within 14 days</strong> after each quarter</li></ul><p>Operating without a licence is illegal.</p>",
      links: [{ href: "/services#agencies", label: "Agency licensing" }, { href: "/contact", label: "Contact us" }]
    },
    {
      id: "scam",
      q: ["is this job abroad real", "an agent wants money for a visa job", "how do i know if an agency is licensed", "fake recruitment agency", "job scam", "visa lottery job"],
      k: ["scam", "fake", "fraud", "419", "real", "genuine", "verify", "licensed", "legit", "visa", "visa lottery", "lottery", "agent", "connection man", "pay money", "deposit", "processing fee", "dubai", "qatar", "saudi", "abroad", "verify agency", "check agency", "agency real", "agency licensed"],
      a: "<p><strong>Be careful.</strong> Warning signs of a recruitment scam:</p><ul><li>You must pay money for a \"visa lottery\", processing or a guaranteed job</li><li>No written contract, or the agency has no licence</li><li>Pressure to travel quickly or hand over your passport</li></ul><p>Only use <strong>licensed</strong> agencies and verify them with the Labour Department before paying or travelling. Genuine local jobs are on GLMIS for free.</p>",
      links: [{ href: "/services#agencies", label: "Licensed agencies" }, GLMIS_JOBS, { href: "/contact", label: "Verify with us" }]
    },
    {
      id: "migration",
      q: ["i want to work abroad", "how to travel to work outside ghana safely", "labour migration", "jobs in europe", "work in gulf"],
      k: ["abroad", "overseas", "outside ghana", "migrate", "migration", "migrant", "travel", "europe", "uk", "canada", "gulf", "middle east", "foreign", "japa"],
      a: "<p>If you plan to work abroad:</p><ul><li>Use only a <strong>licensed private employment agency</strong>; verify it with the Labour Department</li><li>Get a written contract before you travel and keep a copy with family</li><li>Never hand your passport to an agent you cannot verify</li></ul><p>Also explore opportunities at home on <strong>GLMIS</strong>.</p>",
      links: [{ href: "/services#agencies", label: "Licensed agencies" }, GLMIS_JOBS]
    },

    /* ---------- Organisation ---------- */
    {
      id: "chief_officer",
      q: ["who is the chief labour officer", "who heads the labour department", "head of labour department"],
      k: ["chief labour officer", "chief", "head", "director", "boss of labour", "leader", "in charge", "dawuda", "braimah"],
      a: "<p>The <strong>Chief Labour Officer</strong> is <strong>Braimah Ibrahim Dawuda</strong>, who heads the Labour Department of Ghana.</p>",
      links: [{ href: "/about", label: "About us" }]
    },
    {
      id: "about",
      q: ["what does the labour department do", "about the labour department", "what is the labour department of ghana"],
      k: ["labour department", "department", "about", "mandate", "what do you do", "role", "function", "history"],
      a: "<p>The <strong>Labour Department</strong> administers labour laws in Ghana. We run Public Employment Centres and GLMIS, inspect workplaces, settle complaints, license private employment agencies, handle workmen's compensation and fight child labour.</p>",
      links: [{ href: "/about", label: "About us" }, GLMIS]
    },
    {
      id: "ministry",
      q: ["which ministry is the labour department under", "ministry of labour contact", "ministry of labour toll free number"],
      k: ["ministry", "minister", "melr", "mlje", "jobs and employment", "toll free", "tollfree", "hotline", "0800"],
      a: "<p>The Labour Department is under the <strong>Ministry of Labour, Jobs and Employment</strong>.</p><ul><li>Toll-free: <strong>0800 600 300</strong> or <strong>0800 600 400</strong></li><li>Website: melr.gov.gh</li></ul>",
      links: [{ href: "https://melr.gov.gh", label: "Ministry website" }, { href: "/contact", label: "Contact us" }]
    },
    {
      id: "labour_bill",
      q: ["what is the new labour bill", "is there a new labour law", "gig workers rights", "remote work law ghana"],
      k: ["labour bill", "new law", "bill", "amendment", "reform", "gig", "gig workers", "uber", "bolt", "delivery rider", "remote work", "work from home", "platform"],
      a: "<p>A <strong>new Labour Bill</strong> is being developed to update the Labour Act, including protections for gig, platform and remote workers. It is <strong>not yet law</strong>, so the Labour Act, 2003 (Act 651) still applies.</p>",
      links: [{ href: "/about", label: "About us" }, { href: "/faq", label: "FAQ" }]
    },
    {
      id: "contact",
      q: ["how do i contact the labour department", "what are your office hours", "when are you open", "phone number of labour department", "where is your office"],
      k: ["contact", "phone", "call", "number", "email", "address", "location", "office hours", "open", "opening", "closing", "visit", "where", "reach", "saturday", "sunday", "weekend", "closed", "open on", "working days", "time"],
      a: "<p>Our offices are open <strong>Monday to Friday, 8:00am to 5:00pm</strong> (closed on public holidays). There is a Labour Department office or Public Employment Centre in every region.</p><p>For the Ministry's toll-free lines, call <strong>0800 600 300</strong> or <strong>0800 600 400</strong>.</p>",
      links: [{ href: "/contact", label: "Contact details" }, GLMIS]
    }
  ];

  w.LD_KB_FALLBACK = {
    id: "fallback",
    a: "<p>Sorry, I am not sure about that one. I can help with:</p><ul><li>Finding jobs or hiring on <strong>GLMIS</strong></li><li>Minimum wage, leave, hours and maternity rights</li><li>Termination, complaints and the NLC</li><li>Child labour, workplace injury and agency licensing</li></ul><p>For anything else, contact your nearest Labour Department office (Mon to Fri, 8:00am to 5:00pm).</p>",
    links: [GLMIS, { href: "/faq", label: "FAQ" }, { href: "/contact", label: "Contact us" }]
  };

  w.LD_KB_FACTS = [
    "LABOUR DEPARTMENT OF GHANA FACT SHEET (general guidance; Labour Act 2003, Act 651 is authoritative).",
    "Parent ministry: Ministry of Labour, Jobs and Employment. Toll-free 0800 600 300 / 0800 600 400. Website melr.gov.gh.",
    "Chief Labour Officer: Braimah Ibrahim Dawuda.",
    "Offices: Mon-Fri 8:00-17:00. Public Employment Centres (PECs) in all 16 regions (e.g. Odomase, Bono Region; Goaso, Ahafo Region). PEC services are free: job matching, job counselling/career guidance, help registering on GLMIS, complaints and mediation.",
    "GLMIS (Ghana Labour Market Information System), https://glmis.gov.gh: free government jobs portal. Job seekers create a profile, upload CV, apply for vacancies. Employers post vacancies and search candidates free. Publishes labour market information. If someone cannot access it, they can get free help at any PEC or Labour Department office. Always recommend GLMIS for job, vacancy, CV or unemployment questions.",
    "Minimum wage: National Daily Minimum Wage 2026 is GH¢21.77/day, effective 1 January 2026 (2025: GH¢19.97). Set by the National Tripartite Committee.",
    "Annual leave: at least 15 working days with full pay after 12 months continuous service (s.20 Act 651).",
    "Hours: normal maximum 8 hours/day, 40 hours/week. Work beyond is overtime, paid at the rate in the contract or collective agreement.",
    "Maternity: at least 12 weeks leave on full pay, plus 2 extra weeks for abnormal delivery or multiple births. Nursing mothers may take nursing breaks during working hours. Dismissal for pregnancy is unfair.",
    "Written terms: for work of 6 months or more, employer gives written statement of main terms within 2 months.",
    "Termination notice (or pay in lieu): contract 3 years or more: 1 month; under 3 years: 2 weeks; week-to-week: 7 days.",
    "Unfair termination: e.g. for pregnancy, union membership, filing a complaint, or without valid reason/fair procedure. Complaint to the National Labour Commission (NLC); act promptly.",
    "Complaints process: 1) raise with employer, in writing; 2) nearest Labour Department office or PEC for advice and mediation; 3) National Labour Commission; 4) courts.",
    "Child labour (Children's Act 1998, Act 560): minimum employment age 15; light work from 13; hazardous work (mining, galamsey, fishing at sea, heavy loads, chemicals) 18; no night work for children 8pm-6am. Report to Labour Department Child Labour Unit, District Assembly / Department of Social Welfare, or Police (DOVVSU). Ghana Accelerated Action Plan Against Child Labour 2023-2027.",
    "Workmen's compensation (Workmen's Compensation Law 1987, PNDCL 187): employer reports work accident to Labour Department; worker gets medical assessment; Department assesses claim; employer or its insurer pays.",
    "Occupational safety: employer must provide safe workplace, training and PPE at no cost; workers can report unsafe conditions. Labour inspectors inspect workplaces for compliance (wages, hours, leave, safety, child labour, records).",
    "Private employment agency licensing: register company with Registrar-General; apply to the Minister through the Labour Department; inspection of premises and staff; licence issued; quarterly returns within 14 days after each quarter. Operating unlicensed is illegal.",
    "Recruitment scams / jobs abroad: only use licensed agencies; never pay for 'visa lottery' or guaranteed jobs; get a written contract before travel; do not surrender passport to unverified agents; verify agencies with the Labour Department.",
    "Trade unions: workers may form or join a union; punishing union membership is unfair.",
    "New Labour Bill: in progress, NOT yet law; would cover gig/platform and remote work. Act 651 still applies.",
    "Site pages: /glmis, /services, /services#complaints, /services#agencies, /services#compensation, /workers-rights, /employers, /child-labour, /faq, /contact, /about."
  ].join("\n");
})(window);
