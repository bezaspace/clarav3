from __future__ import annotations

from datetime import date, timedelta
from typing import Any


def _lcg(seed: int):
    state = seed
    while True:
        state = (1664525 * state + 1013904223) & 0xFFFFFFFF
        yield state / 2**32


def _rand_range(rng, minimum: int, maximum: int) -> int:
    return minimum + int(next(rng) * (maximum - minimum + 1))


def _rand_float(rng, minimum: float, maximum: float, precision: int = 1) -> float:
    value = minimum + next(rng) * (maximum - minimum)
    return round(value, precision)


def _build_diet_history(rng) -> list[dict[str, Any]]:
    start = date(2026, 4, 1)
    rows = []
    for i in range(30):
        d = start + timedelta(days=i)
        rows.append(
            {
                "date": d.strftime("%d %b"),
                "carbs": _rand_range(rng, 150, 200),
                "protein": _rand_range(rng, 60, 89),
                "fats": _rand_range(rng, 40, 59),
                "fiber": _rand_range(rng, 20, 29),
                "vitamins": _rand_range(rng, 60, 99),
                "minerals": _rand_range(rng, 40, 69),
            }
        )
    return rows


def _build_mental_history(rng) -> list[dict[str, Any]]:
    start = date(2026, 4, 1)
    rows = []
    for i in range(30):
        d = start + timedelta(days=i)
        rows.append(
            {
                "date": d.strftime("%d %b"),
                "moodScore": _rand_range(rng, 6, 10),
                "sleepHours": _rand_float(rng, 5, 8),
                "deepSleepHours": _rand_float(rng, 1.5, 3),
            }
        )
    return rows


def _build_adherence_rows(rng):
    today = date.today()
    rows = []
    for i in range(56):
        d = today - timedelta(days=55 - i)
        rand = next(rng)
        if rand < 0.05:
            level = 1
        elif rand < 0.1:
            level = 2
        elif rand < 0.15:
            level = 3
        else:
            level = 4
        rows.append(
            {
                "id": i,
                "level": level,
                "date": d.day,
                "month": d.month - 1,
                "monthName": d.strftime("%b"),
                "fullDate": d.isoformat(),
            }
        )
    return rows


def get_seed_payload() -> dict[str, Any]:
    diet_rng = _lcg(1029)
    mental_rng = _lcg(2058)
    adherence_rng = _lcg(3096)

    return {
        "dashboard": {
            "profile": {
                "name": "Harsha",
                "age": 32,
                "bloodType": "O+ Positive",
                "prakriti": "Vata-Pitta",
                "status": "Metabolic Reset Phase",
                "allergies": ["Peanuts", "Dust Mites", "Penicillin"],
                "conditions": ["Mild Hypertension (Managed)", "Seasonal Asthma"],
                "history": [
                    {"year": "2021", "event": "ACL Reconstruction (Right Knee)"},
                    {"year": "2018", "event": "Appendectomy"},
                ],
                "targets": [
                    {"goal": "HbA1c Optimization", "current": "6.2%", "aim": "5.4%", "effort": "High"},
                    {"goal": "CRP Reduction", "current": "3.2 mg/L", "aim": "1.0 mg/L", "effort": "Medium"},
                ],
            },
            "todaysSchedule": [
                {"id": 1, "time": "06:00 AM", "title": "Morning Meditation & Pranayama", "type": "Mind", "duration": "25 min", "status": "completed"},
                {"id": 2, "time": "06:30 AM", "title": "Yoga & Core Workout", "type": "Body", "duration": "45 min", "status": "completed"},
                {"id": 3, "time": "07:30 AM", "title": "Morning Tea: Ginger Masala & Almonds", "type": "Diet", "duration": "80 kcal", "status": "completed"},
                {"id": 4, "time": "08:00 AM", "title": "Triphala Churna", "type": "Medicine", "duration": "Empty Stomach", "status": "completed"},
                {"id": 5, "time": "09:00 AM", "title": "Breakfast: Vegetable Poha & Curd", "type": "Diet", "duration": "320 kcal", "status": "completed"},
                {"id": 6, "time": "09:30 AM", "title": "Multivitamin", "type": "Medicine", "duration": "After Breakfast", "status": "completed"},
                {"id": 7, "time": "11:30 AM", "title": "Mid-Day Snack: 1 Seasonal Fruit", "type": "Diet", "duration": "90 kcal", "status": "pending"},
                {"id": 8, "time": "01:30 PM", "title": "Lunch: Jowar Rotis, Dal Tadka, Salad", "type": "Diet", "duration": "450 kcal", "status": "pending"},
                {"id": 9, "time": "04:30 PM", "title": "Evening Snack: Sprouted Moong Salad", "type": "Diet", "duration": "150 kcal", "status": "pending"},
                {"id": 10, "time": "08:00 PM", "title": "Dinner: Khichdi & Buttermilk", "type": "Diet", "duration": "350 kcal", "status": "pending"},
                {"id": 11, "time": "09:30 PM", "title": "Gratitude Journal & Reflection", "type": "Mind", "duration": "15 min", "status": "pending"},
                {"id": 12, "time": "09:45 PM", "title": "Ashwagandha", "type": "Medicine", "duration": "Before Sleep", "status": "pending"},
                {"id": 13, "time": "10:00 PM", "title": "Screen Down Time", "type": "Mind", "duration": "1 hour before sleep", "status": "pending"},
            ],
        },
        "care_products": [
            {"id": "1", "name": "A2 Desi Cow Ghee", "category": "Groceries", "price": 950, "originalPrice": 1100, "unit": "500ml", "rating": 4.9, "image": "🍯", "tag": "Best Seller", "isOffer": True},
            {"id": "2", "name": "Organic Ragi (Finger Millet)", "category": "Groceries", "price": 85, "unit": "1kg", "rating": 4.7, "image": "🌾"},
            {"id": "3", "name": "Cold Pressed Groundnut Oil", "category": "Groceries", "price": 240, "unit": "1L", "rating": 4.8, "image": "🫗"},
            {"id": "4", "name": "High Protein Paneer", "category": "Groceries", "price": 120, "unit": "200g", "rating": 4.6, "image": "🧀"},
            {"id": "5", "name": "Sourdough Whole Wheat Bread", "category": "Groceries", "price": 75, "unit": "400g", "rating": 4.5, "image": "🍞"},
            {"id": "6", "name": "Organic Turmeric (Lakadong)", "category": "Groceries", "price": 180, "unit": "200g", "rating": 5.0, "image": "🫚", "tag": "High Curcumin"},
            {"id": "7", "name": "Pink Himalayan Salt", "category": "Groceries", "price": 95, "unit": "1kg", "rating": 4.7, "image": "🧂"},
            {"id": "8", "name": "Stevia Natural Sweetener", "category": "Groceries", "price": 350, "unit": "100g", "rating": 4.4, "image": "🍃"},
            {"id": "9", "name": "Ashwagandha Gold Capsules", "category": "Ayurveda", "price": 499, "originalPrice": 599, "unit": "60 caps", "rating": 4.8, "image": "💊", "isOffer": True},
            {"id": "10", "name": "Chyawanprash (Sugar-Free)", "category": "Ayurveda", "price": 550, "unit": "500g", "rating": 4.9, "image": "🏺"},
            {"id": "11", "name": "Triphala Effervescent Tabs", "category": "Ayurveda", "price": 299, "unit": "15 tabs", "rating": 4.7, "image": "🥤"},
            {"id": "12", "name": "Brahmi Brain Tonic", "category": "Ayurveda", "price": 180, "unit": "200ml", "rating": 4.6, "image": "🧪"},
            {"id": "13", "name": "Neem & Tulsi Skin Elixir", "category": "Ayurveda", "price": 250, "unit": "100ml", "rating": 4.5, "image": "🌿"},
            {"id": "14", "name": "Shilajit (Pure Resin)", "category": "Ayurveda", "price": 1250, "unit": "20g", "rating": 5.0, "image": "🖤", "tag": "Premium"},
            {"id": "15", "name": "Amrit Kalash 5-in-1", "category": "Ayurveda", "price": 890, "unit": "600g", "rating": 4.8, "image": "✨"},
            {"id": "16", "name": "Eco-Friendly Cork Yoga Mat", "category": "Fitness", "price": 1850, "originalPrice": 2200, "unit": "6mm", "rating": 4.9, "image": "🧘", "isOffer": True},
            {"id": "17", "name": "Copper Water Bottle (Lacquered)", "category": "Fitness", "price": 750, "unit": "1L", "rating": 4.7, "image": "🧴"},
            {"id": "18", "name": "Resistance Band Set (5)", "category": "Fitness", "price": 950, "unit": "Set", "rating": 4.6, "image": "🎗️"},
            {"id": "19", "name": "Whey Protein Isolate (Kulfi)", "category": "Fitness", "price": 2850, "unit": "1kg", "rating": 4.8, "image": "💪", "tag": "New Flavor"},
            {"id": "20", "name": "Creatine Monohydrate", "category": "Fitness", "price": 850, "unit": "250g", "rating": 4.7, "image": "⚡"},
            {"id": "21", "name": "Massage Foam Roller", "category": "Fitness", "price": 550, "unit": "1 unit", "rating": 4.5, "image": "🩹"},
            {"id": "22", "name": "BPA-Free Gym Shaker", "category": "Fitness", "price": 299, "unit": "700ml", "rating": 4.4, "image": "🥤"},
            {"id": "23", "name": "Multivitamin for Men/Women", "category": "Medication", "price": 650, "originalPrice": 850, "unit": "60 tabs", "rating": 4.8, "image": "💊", "isOffer": True},
            {"id": "24", "name": "Vitamin D3 60K IU", "category": "Medication", "price": 120, "unit": "4 softgels", "rating": 4.9, "image": "☀️"},
            {"id": "25", "name": "Omega-3 Fish Oil", "category": "Medication", "price": 950, "unit": "60 caps", "rating": 4.7, "image": "🐟"},
            {"id": "26", "name": "Melatonin Sleep Support", "category": "Medication", "price": 350, "unit": "30 gummies", "rating": 4.6, "image": "🌙"},
            {"id": "27", "name": "Quick Relief Digestion Fizz", "category": "Medication", "price": 45, "unit": "6 sachets", "rating": 4.5, "image": "🧊"},
            {"id": "28", "name": "Organic Eye Drops", "category": "Medication", "price": 150, "unit": "10ml", "rating": 4.6, "image": "💧"},
            {"id": "29", "name": "Ayurvedic Anti-Cold Balm", "category": "Medication", "price": 65, "unit": "25g", "rating": 4.8, "image": "💆"},
            {"id": "30", "name": "Blood Pressure Monitor", "category": "Medication", "price": 2450, "unit": "Digital", "rating": 4.9, "image": "🩺", "tag": "Certified"},
        ],
        "care_professionals": [
            {"id": "1", "name": "Dr. Aarav Sharma", "specialty": "Cardiologist", "type": "Doctor", "experience": "15 years", "rating": 4.9, "reviews": 1200, "location": "Gurugram, HR", "price": 1000, "availability": "Today", "image": "👨‍⚕️", "isOnline": True},
            {"id": "2", "name": "Dr. Ishani Patel", "specialty": "Psychiatrist", "type": "Doctor", "experience": "10 years", "rating": 4.8, "reviews": 850, "location": "Mumbai, MH", "price": 1500, "availability": "Tomorrow", "image": "👩‍⚕️", "isOnline": True},
            {"id": "3", "name": "Dr. Vikram Reddy", "specialty": "Endocrinologist", "type": "Doctor", "experience": "20 years", "rating": 5.0, "reviews": 2100, "location": "Hyderabad, TS", "price": 1200, "availability": "Today", "image": "👨‍⚕️", "isOnline": False},
            {"id": "4", "name": "Dr. Ananya Iyer", "specialty": "Dermatologist", "type": "Doctor", "experience": "8 years", "rating": 4.7, "reviews": 600, "location": "Chennai, TN", "price": 800, "availability": "24 Apr", "image": "👩‍⚕️", "isOnline": True},
            {"id": "5", "name": "Dr. Sameer Khan", "specialty": "General Physician", "type": "Doctor", "experience": "12 years", "rating": 4.6, "reviews": 1500, "location": "Delhi, DL", "price": 500, "availability": "Today", "image": "👨‍⚕️", "isOnline": True},
            {"id": "10", "name": "Dr. Kavita Nair", "specialty": "Psychiatrist", "type": "Doctor", "experience": "14 years", "rating": 4.9, "reviews": 1100, "location": "Bangalore, KA", "price": 2000, "availability": "Today", "image": "👩‍⚕️", "isOnline": True},
            {"id": "11", "name": "Dr. Siddharth Malhotra", "specialty": "Clinical Psychologist", "type": "Doctor", "experience": "9 years", "rating": 4.8, "reviews": 750, "location": "Pune, MH", "price": 1800, "availability": "Tomorrow", "image": "👨‍⚕️", "isOnline": True},
            {"id": "12", "name": "Dr. Riya Sen", "specialty": "Child Psychologist", "type": "Doctor", "experience": "6 years", "rating": 4.7, "reviews": 320, "location": "Kolkata, WB", "price": 1200, "availability": "25 Apr", "image": "👩‍⚕️", "isOnline": True},
            {"id": "13", "name": "Dr. Amit Trivedi", "specialty": "Addiction Psychiatrist", "type": "Doctor", "experience": "18 years", "rating": 5.0, "reviews": 900, "location": "Ahmedabad, GJ", "price": 2500, "availability": "Today", "image": "👨‍⚕️", "isOnline": False},
            {"id": "14", "name": "Dr. Neha Kapoor", "specialty": "Gynecologist", "type": "Doctor", "experience": "16 years", "rating": 4.9, "reviews": 3400, "location": "Chandigarh, CH", "price": 1200, "availability": "Today", "image": "👩‍⚕️", "isOnline": True},
            {"id": "15", "name": "Dr. Arjun Mehra", "specialty": "Orthopedic Surgeon", "type": "Doctor", "experience": "22 years", "rating": 4.8, "reviews": 2800, "location": "Ludhiana, PB", "price": 1500, "availability": "Tomorrow", "image": "👨‍⚕️", "isOnline": False},
            {"id": "16", "name": "Dr. Priya Varma", "specialty": "Neurologist", "type": "Doctor", "experience": "13 years", "rating": 4.9, "reviews": 1200, "location": "Jaipur, RJ", "price": 1800, "availability": "Today", "image": "👩‍⚕️", "isOnline": True},
            {"id": "17", "name": "Dr. Rajesh Bansal", "specialty": "Gastroenterologist", "type": "Doctor", "experience": "19 years", "rating": 4.7, "reviews": 1900, "location": "Indore, MP", "price": 1000, "availability": "26 Apr", "image": "👨‍⚕️", "isOnline": True},
            {"id": "18", "name": "Dr. Sunita Deshmukh", "specialty": "Ayurvedic MD", "type": "Doctor", "experience": "25 years", "rating": 5.0, "reviews": 4500, "location": "Nashik, MH", "price": 800, "availability": "Today", "image": "👩‍⚕️", "isOnline": True},
            {"id": "19", "name": "Dr. Varun Joshi", "specialty": "Urologist", "type": "Doctor", "experience": "10 years", "rating": 4.6, "reviews": 800, "location": "Surat, GJ", "price": 1200, "availability": "Tomorrow", "image": "👨‍⚕️", "isOnline": False},
            {"id": "20", "name": "Dr. Shalini Singh", "specialty": "ENT Specialist", "type": "Doctor", "experience": "11 years", "rating": 4.8, "reviews": 1300, "location": "Lucknow, UP", "price": 700, "availability": "Today", "image": "👩‍⚕️", "isOnline": True},
            {"id": "l1", "name": "AyuCare Diagnostics", "specialty": "Full Body Checkup", "type": "Lab", "rating": 4.8, "reviews": 5000, "location": "Indiranagar, Bangalore", "price": 2999, "availability": "Home Collection", "image": "🔬", "isOnline": False},
            {"id": "l2", "name": "ThyroCloud Labs", "specialty": "Thyroid & Hormones", "type": "Lab", "rating": 4.7, "reviews": 12000, "location": "Multiple Locations", "price": 499, "availability": "Home Collection", "image": "🧪", "isOnline": False},
            {"id": "l3", "name": "Metric Pathology", "specialty": "Biomarker Specialist", "type": "Lab", "rating": 4.9, "reviews": 3200, "location": "Whitefield, Bangalore", "price": 1500, "availability": "Walk-in", "image": "🧬", "isOnline": False},
            {"id": "l4", "name": "Wellness Path Labs", "specialty": "Advanced Imaging", "type": "Lab", "rating": 4.6, "reviews": 2100, "location": "South Delhi", "price": 5000, "availability": "Appointment Only", "image": "📡", "isOnline": False},
            {"id": "l5", "name": "Dr. Lal PathLabs", "specialty": "NABL Certified", "type": "Lab", "rating": 4.8, "reviews": 45000, "location": "Pan-India", "price": 1200, "availability": "Home Collection", "image": "🏢", "isOnline": False},
            {"id": "l6", "name": "Metropolis Healthcare", "specialty": "Comprehensive Profiles", "type": "Lab", "rating": 4.7, "reviews": 38000, "location": "Pan-India", "price": 1800, "availability": "Home Collection", "image": "🔬", "isOnline": False},
            {"id": "l7", "name": "Apollo Diagnostics", "specialty": "Specialized Testing", "type": "Lab", "rating": 4.9, "reviews": 15000, "location": "Mumbai & Chennai", "price": 2500, "availability": "Walk-in", "image": "🏥", "isOnline": False},
            {"id": "l8", "name": "SRL Diagnostics", "specialty": "Reference Lab", "type": "Lab", "rating": 4.6, "reviews": 22000, "location": "Pan-India", "price": 900, "availability": "Appointment Only", "image": "🧪", "isOnline": False},
            {"id": "l9", "name": "Suburban Diagnostics", "specialty": "Home Collection Expert", "type": "Lab", "rating": 4.5, "reviews": 9000, "location": "Pune & Mumbai", "price": 600, "availability": "Home Collection", "image": "🏢", "isOnline": False},
            {"id": "l10", "name": "Hitech Diagnostics", "specialty": "Genetics & IVF", "type": "Lab", "rating": 4.8, "reviews": 4000, "location": "Hyderabad", "price": 4500, "availability": "Advanced Booking", "image": "🧬", "isOnline": False},
        ],
        "care_food": [
            {"id": "f1", "restaurant": "FitKitchen", "name": "Quinoa Paneer Salad", "category": "Healthy", "price": 299, "rating": 4.6, "time": "30 min", "image": "🥗", "offer": "Free Delivery", "veg": True},
            {"id": "f2", "restaurant": "AyurDine", "name": "Sattvic Thali", "category": "Indian", "price": 250, "rating": 4.8, "time": "40 min", "image": "🍱", "veg": True},
            {"id": "f3", "restaurant": "ProteinHouse", "name": "Grilled Chicken Breast", "category": "Keto", "price": 350, "rating": 4.5, "time": "25 min", "image": "🍗", "offer": "20% OFF", "veg": False},
            {"id": "f4", "restaurant": "SmoothieBar", "name": "Green Detox Smoothie", "category": "Beverages", "price": 150, "rating": 4.7, "time": "15 min", "image": "🥤", "veg": True},
            {"id": "f5", "restaurant": "Leafy", "name": "Millet Khichdi", "category": "Comfort Food", "price": 180, "rating": 4.9, "time": "35 min", "image": "🍲", "veg": True},
            {"id": "f6", "restaurant": "OvenStory", "name": "Multigrain Veg Pizza", "category": "Italian", "price": 320, "rating": 4.4, "time": "45 min", "image": "🍕", "veg": True},
            {"id": "f7", "restaurant": "BowlCompany", "name": "Teriyaki Tofu Bowl", "category": "Asian", "price": 280, "rating": 4.5, "time": "30 min", "image": "🍜", "veg": True},
            {"id": "f8", "restaurant": "WrapIt", "name": "Egg White Wholewheat Wrap", "category": "Snacks", "price": 190, "rating": 4.6, "time": "20 min", "image": "🌯", "veg": False},
            {"id": "f9", "restaurant": "SweetTruth", "name": "Sugar-free Oat Cookies", "category": "Dessert", "price": 120, "rating": 4.7, "time": "25 min", "image": "🍪", "offer": "Buy 1 Get 1", "veg": True},
            {"id": "f10", "restaurant": "SushiGo", "name": "Salmon Avocado Roll", "category": "Japanese", "price": 450, "rating": 4.8, "time": "50 min", "image": "🍣", "veg": False},
        ],
        "journal_tasks": [
            {"id": "1", "title": "Morning Vipassana Meditation", "status": "completed", "priority": "high", "category": "Mind", "dueDate": "Today"},
            {"id": "2", "title": "Buy high-protein groceries", "status": "in-progress", "priority": "medium", "category": "Shopping", "dueDate": "Today"},
            {"id": "3", "title": "Consultation with Dr. Ishani", "status": "todo", "priority": "high", "category": "Health", "dueDate": "Tomorrow"},
            {"id": "4", "title": "Update biomarker tracking", "status": "todo", "priority": "medium", "category": "Optimization", "dueDate": "25 Apr"},
            {"id": "5", "title": "Read 20 pages of 'Atomic Habits'", "status": "in-progress", "priority": "low", "category": "Growth", "dueDate": "Today"},
            {"id": "6", "title": "Pre-workout meal prep", "status": "todo", "priority": "medium", "category": "Body", "dueDate": "Today"},
            {"id": "7", "title": "Book full body lab test", "status": "completed", "priority": "high", "category": "Health", "dueDate": "Yesterday"},
        ],
        "journal_entries": [
            {"id": "1", "date": "23 April, 2026", "title": "Morning Clarity", "excerpt": "Woke up feeling exceptionally refreshed today. The new sleep routine is clearly working...", "mood": "Happy", "tags": ["Sleep", "Mindfulness"]},
            {"id": "2", "date": "22 April, 2026", "title": "Post-Workout Reflection", "excerpt": "Felt strong during the session, but noticed some tightness in the lower back. Need to focus on mobility tomorrow...", "mood": "Productive", "tags": ["Fitness", "Reflection"]},
            {"id": "3", "date": "21 April, 2026", "title": "Balanced Diet Struggles", "excerpt": "Had a slight slip up with the diet today at the office party. Choosing to forgive myself and get back on track...", "mood": "Neutral", "tags": ["Diet", "Self-Care"]},
        ],
        "biomarkers": [
            {"id": "1", "name": "HbA1c", "category": "Metabolic", "baseline": 6.2, "goal": 5.4, "unit": "%", "status": "concerning", "description": "Average blood sugar over 3 months."},
            {"id": "2", "name": "Vitamin D3", "category": "Nutrients", "baseline": 18.5, "goal": 50.0, "unit": "ng/mL", "status": "critical", "description": "Bone health and immunity."},
            {"id": "3", "name": "Vitamin B12", "category": "Nutrients", "baseline": 210, "goal": 500, "unit": "pg/mL", "status": "concerning", "description": "Nerve function and energy."},
            {"id": "4", "name": "Total Cholesterol", "category": "Metabolic", "baseline": 240, "goal": 190, "unit": "mg/dL", "status": "concerning", "description": "Overall lipid levels."},
            {"id": "5", "name": "HDL Cholesterol", "category": "Metabolic", "baseline": 38, "goal": 55, "unit": "mg/dL", "status": "concerning", "description": "\"Good\" cholesterol."},
            {"id": "6", "name": "LDL Cholesterol", "category": "Metabolic", "baseline": 160, "goal": 110, "unit": "mg/dL", "status": "concerning", "description": "\"Bad\" cholesterol."},
            {"id": "7", "name": "Triglycerides", "category": "Metabolic", "baseline": 185, "goal": 140, "unit": "mg/dL", "status": "concerning", "description": "Blood fats."},
            {"id": "8", "name": "hs-CRP", "category": "Inflammation", "baseline": 3.2, "goal": 1.0, "unit": "mg/L", "status": "critical", "description": "Systemic inflammation marker."},
            {"id": "9", "name": "Ferritin", "category": "Nutrients", "baseline": 25, "goal": 80, "unit": "ng/mL", "status": "concerning", "description": "Iron stores."},
            {"id": "10", "name": "TSH", "category": "Hormones", "baseline": 4.8, "goal": 2.5, "unit": "mIU/L", "status": "concerning", "description": "Thyroid function."},
            {"id": "11", "name": "Morning Cortisol", "category": "Hormones", "baseline": 22, "goal": 15, "unit": "mcg/dL", "status": "concerning", "description": "Stress hormone levels."},
            {"id": "12", "name": "Fasting Insulin", "category": "Metabolic", "baseline": 15.0, "goal": 5.0, "unit": "uIU/mL", "status": "concerning", "description": "Insulin sensitivity."},
            {"id": "13", "name": "Hemoglobin", "category": "Nutrients", "baseline": 12.5, "goal": 14.5, "unit": "g/dL", "status": "normal", "description": "Oxygen transport."},
            {"id": "14", "name": "Magnesium", "category": "Nutrients", "baseline": 1.7, "goal": 2.2, "unit": "mg/dL", "status": "concerning", "description": "Muscle and nerve function."},
            {"id": "15", "name": "Omega-3 Index", "category": "Nutrients", "baseline": 3.5, "goal": 8.0, "unit": "%", "status": "critical", "description": "Cardiovascular protection."},
            {"id": "16", "name": "VO2 Max", "category": "Physiology", "baseline": 32, "goal": 40, "unit": "mL/kg/min", "status": "concerning", "description": "Aerobic fitness capacity."},
            {"id": "17", "name": "Resting Heart Rate", "category": "Physiology", "baseline": 78, "goal": 62, "unit": "BPM", "status": "concerning", "description": "Cardiovascular efficiency."},
            {"id": "18", "name": "HRV", "category": "Physiology", "baseline": 25, "goal": 45, "unit": "ms", "status": "concerning", "description": "Resilience to stress."},
            {"id": "19", "name": "Bone T-Score", "category": "Physiology", "baseline": -1.8, "goal": -1.0, "unit": "", "status": "concerning", "description": "Bone density comparison."},
            {"id": "20", "name": "ALT (Liver)", "category": "Metabolic", "baseline": 45, "goal": 25, "unit": "U/L", "status": "concerning", "description": "Liver health indicator."},
        ],
        "biomarkers_summary": {
            "title": "Biological Optimization",
            "optimizationGoal": "Metabolic Health Focus",
            "phase": "Phase 1",
            "currentBaselineLabel": "April 2026",
            "metricsAnalyzed": 20,
            "nextRetest": "July 2026",
            "daysRemaining": 92,
            "priorityRisks": 3,
            "priorityRisksLabel": "Inflammation & Vit D",
        },
        "diet": {
            "historyData": _build_diet_history(diet_rng),
            "sattvicGoal": 12,
        },
        "mental_health": {
            "historyData": _build_mental_history(mental_rng),
            "adherenceData": [
                {"subject": "Meditation", "A": 85, "fullMark": 100},
                {"subject": "Breathwork", "A": 70, "fullMark": 100},
                {"subject": "Journaling", "A": 90, "fullMark": 100},
                {"subject": "Sleep Routine", "A": 65, "fullMark": 100},
                {"subject": "Reading", "A": 80, "fullMark": 100},
            ],
            "quickStats": {"zenStreak": "14 Days", "avgSleep": "7.2 Hrs", "moodIndex": "Optimal"},
        },
        "workouts": {
            "workoutData": [
                {"subject": "Yoga", "A": 120, "fullMark": 150},
                {"subject": "Endurance", "A": 98, "fullMark": 150},
                {"subject": "Strength", "A": 86, "fullMark": 150},
                {"subject": "Cardio", "A": 99, "fullMark": 150},
                {"subject": "Flexibility", "A": 85, "fullMark": 150},
                {"subject": "Balance", "A": 65, "fullMark": 150},
            ],
            "sessions": [
                {"type": "Morning Yoga", "duration": "45 min", "intensity": "Moderate", "cals": "180 kcal"},
                {"type": "Evening Walk", "duration": "30 min", "intensity": "Light", "cals": "120 kcal"},
            ],
            "milestone": {"title": "12km Endurance", "achievedDate": "April 22, 2026"},
        },
        "medication": {
            "overview": {"adherence": "92%", "streak": "12 day streak achieved.", "refill": "Ashwagandha", "refillText": "Refill needed in 4 days."},
            "adherenceRows": _build_adherence_rows(adherence_rng),
        },
    }
