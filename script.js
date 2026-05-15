if (!localStorage.getItem("loggedIn")) {
    window.location.href = "login.html";
}

class GymManager {

    constructor() {

        this.members =
            JSON.parse(localStorage.getItem("members")) || [];

        this.payments =
            JSON.parse(localStorage.getItem("payments")) || [];

        this.attendance =
            JSON.parse(localStorage.getItem("attendance")) || [];

        this.init();
    }

    // =========================
    // INITIALIZE
    // =========================

    init() {

        this.bindEvents();

        this.renderAll();

        this.updateDashboard();
    }

    // =========================
    // EVENTS
    // =========================

    bindEvents() {

        document.getElementById("memberForm")
            .addEventListener("submit",
                (e) => this.addMember(e));

        document.getElementById("paymentForm")
            .addEventListener("submit",
                (e) => this.addPayment(e));

        document.getElementById("attendanceForm")
            .addEventListener("submit",
                (e) => this.markAttendance(e));
    }

    // =========================
    // ADD MEMBER
    // =========================

    addMember(e) {

        e.preventDefault();

        const formData = new FormData(e.target);

        const joinDate =
            formData.get("joinDate");

        const plan =
            formData.get("plan");

        let expiryDate =
            new Date(joinDate);

        if (plan === "3 Months") {

            expiryDate.setMonth(
                expiryDate.getMonth() + 3
            );
        }

        else if (plan === "6 Months") {

            expiryDate.setMonth(
                expiryDate.getMonth() + 6
            );
        }

        else {

            expiryDate.setMonth(
                expiryDate.getMonth() + 12
            );
        }

        expiryDate =
            expiryDate.toISOString().split("T")[0];

        const member = {

            id: Date.now(),

            name: formData.get("name"),

            phone: formData.get("phone"),

            plan: plan,

            joinDate: joinDate,

            expiryDate: expiryDate
        };

        this.members.unshift(member);

        this.saveData();

        this.renderAll();

        this.updateDashboard();

        e.target.reset();

        alert("✅ Member Added Successfully");
    }

    // =========================
    // ADD PAYMENT
    // =========================

    addPayment(e) {

        e.preventDefault();

        const memberId =
            parseInt(
                document.getElementById("paymentMember").value
            );

        const amount =
            parseFloat(
                document.getElementById("paymentAmount").value
            );

        if (!memberId || !amount) {

            alert("⚠ Fill all payment details");

            return;
        }

        // UNIQUE RECEIPT NUMBER

        const receiptNo =
            "PP-" + Math.floor(Math.random() * 1000000);

        const payment = {

            id: Date.now(),

            receiptNo: receiptNo,

            memberId: memberId,

            amount: amount,

            date:
                new Date().toLocaleDateString(),

            status: "Paid"
        };

        this.payments.unshift(payment);

        this.saveData();

        this.renderPayments();

        this.updateDashboard();

        e.target.reset();

        alert("💰 Payment Added Successfully");
    }

    // =========================
    // ATTENDANCE
    // =========================

    markAttendance(e) {

        e.preventDefault();

        const memberId =
            parseInt(
                document.getElementById("attendanceMember").value
            );

        const today =
            new Date().toISOString().split("T")[0];

        const already =
            this.attendance.find(a =>
                a.memberId === memberId &&
                a.date === today
            );

        if (already) {

            alert("⚠ Attendance already marked");

            return;
        }

        const attendance = {

            id: Date.now(),

            memberId,

            date: today
        };

        this.attendance.unshift(attendance);

        this.saveData();

        this.renderAttendance();

        this.updateDashboard();

        e.target.reset();

        alert("✅ Attendance Marked");
    }

    // =========================
    // MEMBERS LIST
    // =========================

    renderMembers() {

        const container =
            document.getElementById("membersList");

        container.innerHTML = "";

        if (this.members.length === 0) {

            container.innerHTML =
                "<p>No Members Found</p>";

            return;
        }

        this.members.forEach(member => {

            container.innerHTML += `

            <div class="card p-3 mb-3 shadow-sm">

                <h5>${member.name}</h5>

                <p>📞 ${member.phone}</p>

                <p>🏋️ ${member.plan}</p>

                <p>📅 Join: ${member.joinDate}</p>

                <p>⏳ Expiry: ${member.expiryDate}</p>

                <div class="d-flex gap-2 flex-wrap">

                    <button
                    class="btn btn-warning btn-sm"
                    onclick="gym.sendReminder(${member.id})">

                    Reminder

                    </button>

                    <button
                    class="btn btn-primary btn-sm"
                    onclick="gym.renewMembership(${member.id})">

                    Renew

                    </button>

                    <button
                    class="btn btn-danger btn-sm"
                    onclick="gym.deleteMember(${member.id})">

                    Delete

                    </button>

                </div>

            </div>
            `;
        });
    }

    // =========================
    // PAYMENTS LIST
    // =========================

    renderPayments() {

        const container =
            document.getElementById("paymentList");

        container.innerHTML = "";

        if (this.payments.length === 0) {

            container.innerHTML =
                "<p>No Payments Found</p>";

            return;
        }

        this.payments.forEach(payment => {

            const member =
                this.members.find(
                    m => m.id === payment.memberId
                );

            container.innerHTML += `

            <div class="card p-3 mb-3 shadow-sm">

                <h5>
                ${member ? member.name : "Unknown"}
                </h5>

                <p>💵 ₹${payment.amount}</p>

                <p>🧾 ${payment.receiptNo}</p>

                <p>📅 ${payment.date}</p>

                <div class="d-flex gap-2 flex-wrap">

                    <button
                    class="btn btn-success btn-sm"
                    onclick="gym.generateReceipt(${payment.id})">

                    PDF Receipt

                    </button>

                    <button
                    class="btn btn-dark btn-sm"
                    onclick="gym.sendReceipt(${payment.id})">

                    WhatsApp Receipt

                    </button>

                </div>

            </div>
            `;
        });
    }

    // =========================
    // ATTENDANCE LIST
    // =========================

    renderAttendance() {

        const container =
            document.getElementById("attendanceList");

        container.innerHTML = "";

        this.attendance.forEach(record => {

            const member =
                this.members.find(
                    m => m.id === record.memberId
                );

            container.innerHTML += `

            <div class="card p-3 mb-3 shadow-sm">

                <h5>
                ${member ? member.name : "Unknown"}
                </h5>

                <p>📅 ${record.date}</p>

            </div>
            `;
        });
    }

    // =========================
    // SELECT OPTIONS
    // =========================

    populateSelects() {

        const selects = [
            "paymentMember",
            "attendanceMember"
        ];

        selects.forEach(id => {

            const select =
                document.getElementById(id);

            select.innerHTML =
                `<option value="">
                Select Member
                </option>`;

            this.members.forEach(member => {

                select.innerHTML += `

                <option value="${member.id}">
                ${member.name}
                </option>
                `;
            });
        });
    }

    // =========================
    // WHATSAPP REMINDER
    // =========================

    sendReminder(id) {

        const member =
            this.members.find(m => m.id === id);

        const message =
`🏋️ POWER PULSE GYM

Hello ${member.name},

Your membership expires on:

${member.expiryDate}

Please renew soon.

Thank You 💪`;

        window.open(
`https://wa.me/91${member.phone}?text=${encodeURIComponent(message)}`
        );
    }

    // =========================
    // WHATSAPP RECEIPT
    // =========================

    sendReceipt(id) {

        const payment =
            this.payments.find(p => p.id === id);

        const member =
            this.members.find(
                m => m.id === payment.memberId
            );

        const message =
`🏋️ POWER PULSE RECEIPT

Receipt No:
${payment.receiptNo}

Member:
${member.name}

Amount:
₹${payment.amount}

Date:
${payment.date}

Status:
Paid

Thank You 💪`;

        window.open(
`https://wa.me/91${member.phone}?text=${encodeURIComponent(message)}`
        );
    }

    // =========================
    // PDF RECEIPT
    // =========================

    generateReceipt(id) {

        try {

            const payment =
                this.payments.find(
                    p => p.id === id
                );

            if (!payment) {

                alert("Payment Not Found");

                return;
            }

            const member =
                this.members.find(
                    m => m.id === payment.memberId
                );

            if (!member) {

                alert("Member Not Found");

                return;
            }

            // FIX OLD PAYMENTS

            if (!payment.receiptNo) {

                payment.receiptNo =
                    "PP-" + payment.id;

                this.saveData();
            }

            // CHECK jsPDF

            if (!window.jspdf) {

                alert("jsPDF Library Missing");

                return;
            }

            const { jsPDF } =
                window.jspdf;

            const doc =
                new jsPDF();

            // HEADER

            doc.setFillColor(220, 53, 69);

            doc.rect(0, 0, 220, 30, "F");

            doc.setTextColor(255, 255, 255);

            doc.setFontSize(24);

            doc.text(
                "POWER PULSE GYM",
                45,
                18
            );

            // TITLE

            doc.setTextColor(0, 0, 0);

            doc.setFontSize(18);

            doc.text(
                "PAYMENT RECEIPT",
                65,
                45
            );

            doc.line(20, 50, 190, 50);

            // DETAILS

            doc.setFontSize(13);

            let y = 70;

            doc.text(
                `Receipt No : ${payment.receiptNo}`,
                20,
                y
            );

            y += 15;

            doc.text(
                `Member Name : ${member.name}`,
                20,
                y
            );

            y += 15;

            doc.text(
                `Phone : ${member.phone}`,
                20,
                y
            );

            y += 15;

            doc.text(
                `Plan : ${member.plan}`,
                20,
                y
            );

            y += 15;

            doc.text(
                `Join Date : ${member.joinDate}`,
                20,
                y
            );

            y += 15;

            doc.text(
                `Expiry Date : ${member.expiryDate}`,
                20,
                y
            );

            y += 15;

            doc.text(
                `Amount Paid : ₹${payment.amount}`,
                20,
                y
            );

            y += 15;

            doc.text(
                `Payment Date : ${payment.date}`,
                20,
                y
            );

            y += 25;

            // FOOTER

            doc.setFontSize(15);

            doc.setTextColor(40, 167, 69);

            doc.text(
                "Thank You For Your Payment 💪",
                40,
                y
            );

            // SAVE PDF

            doc.save(
                `${member.name}-Receipt.pdf`
            );
        }

        catch (error) {

            console.log(error);

            alert("Receipt Generation Failed");
        }
    }

    // =========================
    // RENEW MEMBERSHIP
    // =========================

    renewMembership(id) {

        const member =
            this.members.find(m => m.id === id);

        let expiry =
            new Date(member.expiryDate);

        if (member.plan === "3 Months") {

            expiry.setMonth(
                expiry.getMonth() + 3
            );
        }

        else if (member.plan === "6 Months") {

            expiry.setMonth(
                expiry.getMonth() + 6
            );
        }

        else {

            expiry.setMonth(
                expiry.getMonth() + 12
            );
        }

        member.expiryDate =
            expiry.toISOString().split("T")[0];

        this.saveData();

        this.renderMembers();

        alert("✅ Membership Renewed");
    }

    // =========================
    // DELETE MEMBER
    // =========================

    deleteMember(id) {

        if (confirm("Delete Member?")) {

            this.members =
                this.members.filter(
                    m => m.id !== id
                );

            this.payments =
                this.payments.filter(
                    p => p.memberId !== id
                );

            this.attendance =
                this.attendance.filter(
                    a => a.memberId !== id
                );

            this.saveData();

            this.renderAll();

            this.updateDashboard();

            alert("🗑 Member Deleted");
        }
    }

    // =========================
    // DASHBOARD
    // =========================

    updateDashboard() {

        document.getElementById("totalMembers")
            .textContent =
            this.members.length;

        const revenue =
            this.payments.reduce(
                (sum, p) => sum + p.amount,
                0
            );

        document.getElementById("totalRevenue")
            .textContent =
            `₹${revenue}`;

        const today =
            new Date().toISOString().split("T")[0];

        const todayAttendance =
            this.attendance.filter(
                a => a.date === today
            ).length;

        const percent =
            this.members.length > 0
                ?
                Math.round(
                    (todayAttendance / this.members.length) * 100
                )
                :
                0;

        document.getElementById("attendancePercent")
            .textContent =
            `${percent}%`;
    }

    // =========================
    // SAVE DATA
    // =========================

    saveData() {

        localStorage.setItem(
            "members",
            JSON.stringify(this.members)
        );

        localStorage.setItem(
            "payments",
            JSON.stringify(this.payments)
        );

        localStorage.setItem(
            "attendance",
            JSON.stringify(this.attendance)
        );
    }

    // =========================
    // RENDER ALL
    // =========================

    renderAll() {

        this.renderMembers();

        this.renderPayments();

        this.renderAttendance();

        this.populateSelects();
    }
}

// =========================
// START APP
// =========================

const gym =
    new GymManager();

// =========================
// LOGOUT
// =========================

function logout() {

    localStorage.removeItem("loggedIn");

    window.location.href =
        "login.html";
}
