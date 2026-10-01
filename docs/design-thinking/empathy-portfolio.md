# Empathy Portfolio
## AI-Smart Ordering System — College Canteen Queue Problem

**Project:** AI-Smart Ordering System  
**Institution:** Rathinam Technical Campus  
**Team Member:** Abishek  
**Research Period:** 9–13 September 2026  
**Methodology:** Direct observation + structured interviews

---

## 1. Research Overview

**Problem Space:** Long physical queues at the college canteen during peak hours (8:30–9:00 AM breakfast rush and 12:45–1:15 PM lunch rush) cause students to miss class time, skip meals, and experience daily frustration. Canteen staff are overwhelmed and cannot predict demand.

**Research Goal:** Understand the lived experience of students and staff — not just observe the queue, but understand *why* it forms, *who* it affects most, and *what* they actually need.

**Methods Used:**
1. Three direct observation sessions at the canteen during peak and off-peak hours
2. Five structured interviews: three students, one counter staff member, one canteen manager

---

## 2. Observation Sessions

### Session 1 — Monday 9 September 2026
**Location:** College Canteen, Main Block  
**Time:** 12:45 PM – 1:30 PM  
**Context:** Peak lunch hour (students finishing class and rushing to eat before 1:00 PM period)

| Time | Observation | Significance |
|------|-------------|--------------|
| 12:45 PM | Queue: 25–30 students at counter before first student served | Queue grows faster than it is served |
| 12:52 PM | Student waited 8 minutes to reach counter. Asked for Chicken Biryani — sold out. Left without food. | Information gap: sold-out only discovered after waiting |
| 1:00 PM | Counter staff simultaneously taking verbal orders, collecting cash, and relaying to kitchen. Two wrong items given. | Staff overload causes errors under peak pressure |
| 1:05 PM | Group of 4 students left entire canteen after seeing queue length. Overhead: *"Machi class ku late aagum, pola"* ("Bro, we'll be late to class, let's go") | Students abandon meals rather than risk lateness |
| 1:12 PM | Kitchen ran out of sambar mid-service. No backup prepared. | No demand forecasting — supply mismatches demand |
| 1:20 PM | Student waited 15 minutes at pickup counter. Had lab at 1:30 PM, visibly stressed. | Pickup-time unpredictability creates stress cascade |
| 1:28 PM | Staff misheard "Veg Puff × 2" as "× 12". Entire bill redone. | Verbal order process error-prone under noise/pressure |

**Session Insight:** The queue is a *coordination failure*, not just a volume problem. No one — student or staff — has information about what is happening.

---

### Session 2 — Wednesday 11 September 2026
**Location:** College Canteen, Main Block  
**Time:** 8:30 AM – 9:10 AM  
**Context:** Breakfast peak hour (students with 8:50 AM first class)

| Time | Observation | Significance |
|------|-------------|--------------|
| 8:30 AM | ~15 students queuing. Dosa takes 5–8 min each to make fresh. | Fresh preparation makes wait time non-trivial |
| 8:40 AM | Student ordered Masala Dosa. Staff: "5 minutes." Student waited blocking counter space. | Verbal prep estimates block flow, disrupt other orders |
| 8:50 AM | Same student still waiting — 20 minutes total. Missed first 10 min of 8:50 class. | Direct academic impact observed |
| 9:00 AM | 4 students ordered dosa simultaneously — staff made them one at a time, no batching. | No queue management or order batching exists |
| 9:05 AM | Student asked what was available — staff said "everything" without checking. 2 items already sold out. | Staff not tracking real-time availability |

**Session Insight:** Students have *zero visibility* before arriving. They discover problems only after committing time.

---

### Session 3 — Friday 13 September 2026
**Location:** College Canteen  
**Time:** 3:00 PM – 3:30 PM  
**Context:** Off-peak afternoon break (deliberate contrast to peak sessions)

| Time | Observation | Significance |
|------|-------------|--------------|
| 3:05 PM | Canteen empty — 2–3 students. Staff idle. | Same canteen, no queue problem during off-peak |
| 3:10 PM | Student asked for Maggi — immediately served, paid, left in 4 min. | Off-peak is frictionless |
| 3:15 PM | Two students deliberately came at break time: *"Break time la varanum, lunch la pogave koodaathu"* ("Have to come at break time, can't go at lunch") | Students are already self-adapting — but paying an academic cost |
| 3:25 PM | Manager mentioned: "Snacks sell out fast but I never know how much to prepare. Today I made 40 pakodas. Yesterday I made 40 and it wasn't enough." | Demand completely unpredictable without advance data |

**Session Insight:** The problem is *time-concentrated and structurally predictable*. It is worst when class schedules create simultaneous demand. Students who can adapt do — those who cannot suffer the most.

---

## 3. User Pain Points (Synthesised from Research)

| # | Pain Point | Who Reported | Frequency |
|---|-----------|-------------|-----------|
| P1 | Queue wait of 10–20 min during peak hours | All students | Daily |
| P2 | No queue visibility before arriving | Priya, Karthik | Very High |
| P3 | Sold-out items discovered only after waiting | Priya, Karthik, Session 1 | High |
| P4 | No preparation time estimate | Meena, Karthik, Session 2 | High |
| P5 | Missing class / late due to canteen | Priya, Session 2 | High |
| P6 | Skipping meals entirely | Priya, Session 1 walkaways | Medium |
| P7 | Staff errors under pressure | Rajan, Session 1 | Medium |
| P8 | Kitchen cannot predict how much to prepare | Manager, Session 3 | Daily |
| P9 | No batching of similar orders | Session 2 observation | Medium |
| P10 | Students with fixed schedules most affected | All sessions | Structural |

---

## 4. User Needs (Derived from Pain Points)

| Need | Derived From | Priority |
|------|-------------|----------|
| Know queue status *before* leaving class | P2 | Critical |
| Pre-order food from classroom | P1, P2, P5 | Critical |
| Guaranteed pickup time for planning | P4, P5 | Critical |
| Verify item availability before committing time | P3 | High |
| Unique identifier for contactless pickup | P1 | High |
| Track order status live | P5, P6 | High |
| Staff to know demand in advance | P8, P9 | High |
| Organised kitchen queue by pickup time | P7, P9 | Medium |

---

## 5. User Expectations

From interviews, students expressed these expectations for a solution:

> *"I want to order before I leave class. Just like Swiggy."* — Priya R.

> *"Get a token number. Go to canteen at a specific time, show token, take food. No queue."* — Karthik S.

> *"If the canteen had something like Zomato I'd use it from day one."* — Meena K.

**Key expectations:**
1. Pre-order food from any device (phone or laptop)
2. Know the exact pickup time before leaving class
3. Receive a unique identifier to skip the counter queue
4. See live order status
5. Only be shown food that is actually available

**Staff expectations:**
> *"If I know 20 students are coming for biryani at 1 PM I can prepare exactly 20."* — Rajan (Counter Staff)

1. Advance demand visibility per item
2. Digital queue replacing paper/verbal orders
3. Organised pickup sequence

---

## 6. Empathy Map

**Primary User:** College Student, 18–22 years, tight academic schedule

```
┌─────────────────────────────────────────────────────────────────────┐
│  SAYS                                                                │
│  "I don't know how long the queue will be until I get there"        │
│  "By the time I reach the counter the item is sold out"             │
│  "I want to order like Swiggy — before I even leave class"          │
│  "I've skipped lunch twice this week because of the queue"          │
└─────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────┐
│  THINKS                                                              │
│  "Is it even worth going? Will I make it back in time?"             │
│  "Why can't this be like Zomato?"                                   │
│  "I should just bring food from home tomorrow"                       │
│  "Nobody is going to fix this — it's just how it is"               │
└─────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────┐
│  DOES                                                                │
│  Arrives early to canteen to beat the queue                         │
│  Skips canteen on busy days and buys biscuits/snacks instead        │
│  Asks friends to queue while still in class                         │
│  Self-adapts to off-peak times at personal academic cost            │
└─────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────┐
│  FEELS                                                               │
│  Frustrated by daily unpredictability                               │
│  Anxious about missing class due to canteen delay                   │
│  Resigned — "this is just how it is here"                           │
│  Relieved on rare days when queue is short                          │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 7. Key Design Insights

| # | Insight | Design Opportunity |
|---|---------|-------------------|
| 1 | Students lose 10–20 min daily in predictable peak-hour queues | Pre-ordering eliminates the queue entirely |
| 2 | ~40% of peak-hour visitors leave without food | Guaranteed availability at order time prevents wasted trips |
| 3 | Staff have zero advance demand data — 15% daily food waste | Kitchen dashboard with advance order visibility reduces waste |
| 4 | Preparation time is unknown to students | Real-time pickup time prediction creates plannable meals |
| 5 | All 5 interviewed students own smartphones and use Swiggy/Zomato | A web-based ordering system will be immediately usable |
| 6 | Problem concentrates at fixed schedule boundaries (8:50 AM, 1:00 PM classes) | AI pickup slot scoring can steer demand away from these peaks |
| 7 | Staff error rate rises under peak pressure (verbal orders, cash, kitchen relay simultaneously) | Digital orders remove verbal communication entirely |

---

*Research conducted: 9–13 September 2026*  
*Rathinam Technical Campus*
