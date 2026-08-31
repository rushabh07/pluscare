import axios from "axios";

const API = "http://localhost:5000/api";

async function testServicesFlow() {
    console.log("🚀 Testing Full Services Module Flow...");

    try {
        // 1. Get services
        const servicesRes = await axios.get(`${API}/services`);
        console.log(`✅ GET /api/services: ${servicesRes.data.services.length} services returned.`);

        const targetService = servicesRes.data.services[0];
        console.log(`Target Service: ${targetService.name} ($${targetService.price})`);

        // 2. Get service details
        const detailsRes = await axios.get(`${API}/services/${targetService._id}`);
        console.log(`✅ GET /api/services/${targetService._id}: loaded details.`);

        // 3. Login Patient
        let patientToken;
        try {
            const patientLogin = await axios.post(`${API}/users/login`, {
                email: "patient@pluscare.com",
                password: "Password123!",
            });
            patientToken = patientLogin.data.token;
            console.log(`✅ Patient Logged In: ${patientLogin.data.fullName}`);
        } catch (e) {
            const patientReg = await axios.post(`${API}/users/register`, {
                fullName: "Alice Johnson",
                email: "patient@pluscare.com",
                phone: "+15559876543",
                password: "Password123!",
                role: "Patient",
            });
            patientToken = patientReg.data.token;
            console.log(`✅ Patient Registered & Logged In: ${patientReg.data.fullName}`);
        }

        // 4. Login Doctor
        let doctorToken, doctorId;
        try {
            const doctorLogin = await axios.post(`${API}/users/login`, {
                email: "doctor1@pluscare.com",
                password: "Password123!",
            });
            doctorToken = doctorLogin.data.token;
            doctorId = doctorLogin.data._id;
            console.log(`✅ Doctor Logged In: ${doctorLogin.data.fullName}`);
        } catch (e) {
            const doctorReg = await axios.post(`${API}/users/register`, {
                fullName: "Dr. Sarah Jenkins",
                email: "doctor1@pluscare.com",
                phone: "+15552345678",
                password: "Password123!",
                role: "Doctor",
                specialization: "Cardiology",
            });
            doctorToken = doctorReg.data.token;
            doctorId = doctorReg.data._id;
            console.log(`✅ Doctor Registered & Logged In: ${doctorReg.data.fullName}`);
        }

        // 5. Create a new service booking
        const bookingDate = new Date();
        bookingDate.setDate(bookingDate.getDate() + 5);

        const createBookingRes = await axios.post(
            `${API}/bookings`,
            {
                serviceId: targetService._id,
                providerId: doctorId,
                bookingDate: bookingDate.toISOString(),
                timeSlot: "03:00 PM",
                address: "123 Innovation Way, Tech Park",
                notes: "End-to-end test booking",
            },
            { headers: { Authorization: `Bearer ${patientToken}` } }
        );
        const newBooking = createBookingRes.data;
        console.log(`✅ POST /api/bookings created booking ID: ${newBooking._id}`);

        // 6. Verify duplicate conflict prevention
        try {
            await axios.post(
                `${API}/bookings`,
                {
                    serviceId: targetService._id,
                    providerId: doctorId,
                    bookingDate: bookingDate.toISOString(),
                    timeSlot: "03:00 PM",
                    address: "Duplicate Address",
                },
                { headers: { Authorization: `Bearer ${patientToken}` } }
            );
            console.error("❌ Conflict test failed: Duplicate booking was incorrectly allowed!");
        } catch (conflictErr) {
            console.log(`✅ Conflict prevention working! Rejection message: "${conflictErr.response?.data?.message}"`);
        }

        // 7. Doctor advances status step by step: Accepted -> On The Way -> Started -> Completed
        const statusSteps = ["Accepted", "On The Way", "Started", "Completed"];
        for (const status of statusSteps) {
            const statusRes = await axios.put(
                `${API}/bookings/${newBooking._id}/status`,
                { status },
                { headers: { Authorization: `Bearer ${doctorToken}` } }
            );
            console.log(`✅ Status updated to: ${statusRes.data.status}`);
        }

        // 8. Patient leaves review on completed booking
        const reviewRes = await axios.post(
            `${API}/reviews`,
            {
                bookingId: newBooking._id,
                rating: 5,
                comment: "Automated test review: outstanding service quality!",
            },
            { headers: { Authorization: `Bearer ${patientToken}` } }
        );
        console.log(`✅ Review posted! ID: ${reviewRes.data._id}, Rating: ${reviewRes.data.rating}`);

        // 9. Login Admin and check live stats
        let adminToken;
        try {
            const adminLogin = await axios.post(`${API}/users/login`, {
                email: "admin@pluscare.com",
                password: "adminpassword",
            });
            adminToken = adminLogin.data.token;
        } catch (e) {
            const adminReg = await axios.post(`${API}/users/register`, {
                fullName: "System Admin",
                email: "admin@pluscare.com",
                phone: "+15550001111",
                password: "AdminPassword123!",
                role: "Admin",
            });
            adminToken = adminReg.data.token;
        }

        const statsRes = await axios.get(`${API}/admin/stats/services`, {
            headers: { Authorization: `Bearer ${adminToken}` },
        });
        console.log("✅ GET /api/admin/stats/services:", statsRes.data);

        console.log("\n🎉 ALL SERVICES MODULE FLOW TESTS PASSED PERFECTLY!");
    } catch (err) {
        console.error("❌ Test Failed:", err.response?.data || err.message);
    }
}

testServicesFlow();
