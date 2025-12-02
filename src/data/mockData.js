export const SHIPMENT_TYPES = [
    "Priority Stock HUB - Home Delivery",
    "Priority Stock HUB - Store Pick",
    "Stock Hub - Home Delivery",
    "Stock Hub - Store Pick",
    "Warehouse - Home Delivery",
    "Warehouse - Store Pick"
];

const DOCTOR_NAMES = [
    "Dr. Vejas Sai", "Dr. Priya Sharma", "Dr. Amit Patel", "Dr. Sneha Gupta",
    "Dr. Vikram Singh", "Dr. Anjali Verma", "Dr. Rahul Reddy", "Dr. Kavita Iyer",
    "Dr. Sanjay Mehta", "Dr. Neha Joshi"
];

const STATUSES = ["Available", "Unavailable"];

// --- Data Generation Helpers ---

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes * 60000);
}

// --- Generate Master Data (Simulated Database) ---

const DOCTORS = DOCTOR_NAMES.map((name, index) => ({
    id: index + 1,
    name,
    currentStatus: getRandomItem(STATUSES) // Real-time status
}));

const ORDERS = [];
const SESSIONS = [];

const NOW = new Date();
const DAYS_HISTORY = 90;

// Generate history (and future for demo purposes)
// i ranges from -30 (30 days in future) to DAYS_HISTORY (90 days in past)
for (let i = -30; i < DAYS_HISTORY; i++) {
    const date = new Date(NOW);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    DOCTORS.forEach(doctor => {
        // 1. Generate Sessions for this day
        // Randomly decide if doctor worked this day (90% chance)
        if (Math.random() > 0.1) {
            const loginHour = getRandomInt(8, 10);
            const loginTime = new Date(date);
            loginTime.setHours(loginHour, getRandomInt(0, 59));

            const workDurationHours = getRandomInt(6, 10);
            const logoffTime = addMinutes(loginTime, workDurationHours * 60);

            SESSIONS.push({
                doctorId: doctor.id,
                loginTime,
                logoffTime
            });

            // 2. Generate Orders for this session
            // Higher volume: 20 to 50 orders per day
            const ordersCount = getRandomInt(20, 50);
            for (let j = 0; j < ordersCount; j++) {
                const orderTime = addMinutes(loginTime, getRandomInt(0, workDurationHours * 60));

                // Distribute statuses
                const rand = Math.random();
                let status = "Completed";
                if (rand > 0.95) status = "Unclaimed";
                else if (rand > 0.9) status = "Pending";

                // Distribute assignment types
                const assignRand = Math.random();
                let assignType = "Auto";
                if (assignRand > 0.85) assignType = "Manual";
                else if (assignRand > 0.8) assignType = "Reassigned";

                ORDERS.push({
                    id: `${doctor.id}-${i}-${j}`,
                    doctorId: doctor.id,
                    date: orderTime,
                    durationMinutes: getRandomInt(5, 30), // Random duration 5-30 mins
                    shipmentType: getRandomItem(SHIPMENT_TYPES),
                    status, // Completed, Pending, Unclaimed
                    assignType // Auto, Manual, Reassigned
                });
            }
        }
    });
}

// --- API Function ---

export const getDashboardData = (startDateStr, endDateStr) => {
    const startDate = new Date(startDateStr);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(endDateStr);
    endDate.setHours(23, 59, 59, 999);

    return DOCTORS.map(doctor => {
        // Filter data for this doctor within range
        const doctorOrders = ORDERS.filter(o =>
            o.doctorId === doctor.id && o.date >= startDate && o.date <= endDate
        );

        const doctorSessions = SESSIONS.filter(s =>
            s.doctorId === doctor.id && s.loginTime >= startDate && s.loginTime <= endDate
        );

        // Aggregate Metrics
        const metrics = {
            totalAssigned: doctorOrders.length,
            autoAssigned: doctorOrders.filter(o => o.assignType === "Auto").length,
            manualAssigned: doctorOrders.filter(o => o.assignType === "Manual").length,
            reassigned: doctorOrders.filter(o => o.assignType === "Reassigned").length,
            completed: doctorOrders.filter(o => o.status === "Completed").length,
            pending: doctorOrders.filter(o => o.status === "Pending").length,
            unclaimed: doctorOrders.filter(o => o.status === "Unclaimed").length,
        };

        // Calculate Available Hours
        let totalMinutes = 0;
        doctorSessions.forEach(s => {
            const end = s.logoffTime > endDate ? endDate : s.logoffTime; // Cap at query end
            const start = s.loginTime < startDate ? startDate : s.loginTime; // Cap at query start
            const duration = (end - start) / 60000; // minutes
            if (duration > 0) totalMinutes += duration;
        });
        const availableHours = (totalMinutes / 60).toFixed(1);

        // Calculate Idle Time
        // Idle = Total Session Time - Total Order Work Time
        const totalOrderMinutes = doctorOrders.reduce((sum, order) => sum + order.durationMinutes, 0);
        let idleMinutes = totalMinutes - totalOrderMinutes;
        if (idleMinutes < 0) idleMinutes = 0; // Prevent negative if random overlap occurs

        const idleHours = Math.floor(idleMinutes / 60);
        const idleMins = Math.floor(idleMinutes % 60);
        const idleTimeStr = `${idleHours}h ${idleMins}m`;

        const avgOrdersPerHour = availableHours > 0
            ? (metrics.completed / parseFloat(availableHours)).toFixed(1)
            : "0.0";

        // Detailed Shipment Metrics
        const shipmentMetricsMap = {};
        SHIPMENT_TYPES.forEach(type => {
            shipmentMetricsMap[type] = {
                type: type,
                total: 0,
                auto: 0,
                manual: 0,
                reassigned: 0,
                completed: 0,
                pending: 0,
                unclaimed: 0,
                isAutoAssignable: type.includes("Priority") || Math.random() > 0.5 // Demo logic
            };
        });

        doctorOrders.forEach(o => {
            const m = shipmentMetricsMap[o.shipmentType];
            if (m) {
                m.total++;
                if (o.assignType === 'Auto') m.auto++;
                if (o.assignType === 'Manual') m.manual++;
                if (o.assignType === 'Reassigned') m.reassigned++;
                if (o.status === 'Completed') m.completed++;
                if (o.status === 'Pending') m.pending++;
                if (o.status === 'Unclaimed') m.unclaimed++;
            }
        });
        const shipmentMetrics = Object.values(shipmentMetricsMap);

        // Time Data
        const isToday = startDate.toDateString() === new Date().toDateString();
        let timeData = {
            availableHours,
            avgOrdersPerHour,
            idleTime: idleTimeStr,
            loginTime: "-",
            logoffTime: "-"
        };

        if (isToday) {
            // Find today's session
            const todaySession = doctorSessions.find(s => s.loginTime.toDateString() === NOW.toDateString());
            if (todaySession) {
                timeData.loginTime = todaySession.loginTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                timeData.logoffTime = todaySession.logoffTime > NOW ? "-" : todaySession.logoffTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }
        }

        return {
            id: doctor.id,
            name: doctor.name,
            status: doctor.currentStatus, // Always show current real-time status
            metrics,
            timeData,
            shipmentMetrics
        };
    });
};
