import User from "../models/userModel.js";
import Appointment from "../models/appointmentModel.js";
import MedicalRecord from "../models/medicalRecordModel.js";

/**
 * @desc    Get patient dashboard statistics & summary
 * @route   GET /api/patients/dashboard
 * @access  Private (Patient)
 */
export const getDashboard = async (req, res) => {
    try {
        const patientId = req.user._id;

        const appointments = await Appointment.find({ patient: patientId })
            .populate("doctor", "fullName email phone specialization department")
            .sort({ appointmentDate: -1, createdAt: -1 });

        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const total = appointments.length;
        const completed = appointments.filter((a) => a.status === "Completed").length;
        const cancelled = appointments.filter((a) => a.status === "Cancelled").length;
        
        // Upcoming = Pending or Confirmed
        const upcomingAppointments = appointments.filter((a) =>
            ["Pending", "Confirmed"].includes(a.status)
        );
        const upcoming = upcomingAppointments.length;

        // Next upcoming appointment (soonest future date with Pending/Confirmed)
        const futureAppointments = upcomingAppointments.filter(
            (a) => new Date(a.appointmentDate) >= startOfToday
        );

        let nextAppointment = null;
        if (futureAppointments.length > 0) {
            nextAppointment = futureAppointments.sort(
                (a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate)
            )[0];
        } else if (upcomingAppointments.length > 0) {
            nextAppointment = upcomingAppointments[0];
        }

        // Recent appointments (last 5)
        const recentAppointments = appointments.slice(0, 5);

        return res.status(200).json({
            stats: {
                total,
                upcoming,
                completed,
                cancelled,
            },
            total,
            upcoming,
            completed,
            cancelled,
            nextAppointment,
            recentAppointments,
        });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Server Error" });
    }
};

export const getDashboardStats = getDashboard;

/**
 * @desc    Get logged in patient profile
 * @route   GET /api/patients/profile
 * @access  Private (Patient)
 */
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");

        if (!user) {
            return res.status(404).json({ message: "Patient profile not found" });
        }

        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ message: error.message || "Server Error" });
    }
};

/**
 * @desc    Update logged in patient profile
 * @route   PUT /api/patients/profile
 * @access  Private (Patient)
 */
export const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: "Patient profile not found" });
        }

        const { fullName, phone, gender, dob, address } = req.body;

        if (fullName !== undefined) user.fullName = fullName;
        if (phone !== undefined) user.phone = phone;
        if (gender !== undefined) user.gender = gender;
        if (dob !== undefined) user.dob = dob;
        if (address !== undefined) user.address = address;

        const updatedUser = await user.save();

        return res.status(200).json({
            _id: updatedUser._id,
            fullName: updatedUser.fullName,
            email: updatedUser.email,
            phone: updatedUser.phone,
            gender: updatedUser.gender,
            dob: updatedUser.dob,
            role: updatedUser.role,
            address: updatedUser.address,
        });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Server Error" });
    }
};

export const updateMyProfile = updateProfile;

/**
 * @desc    Get all appointments for logged in patient
 * @route   GET /api/patients/appointments
 * @access  Private (Patient)
 */
export const getAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({ patient: req.user._id })
            .populate("doctor", "fullName email phone specialization department")
            .sort({ appointmentDate: -1, createdAt: -1 });

        return res.status(200).json(appointments);
    } catch (error) {
        return res.status(500).json({ message: error.message || "Server Error" });
    }
};

/**
 * @desc    Get single appointment details by ID
 * @route   GET /api/patients/appointments/:id
 * @access  Private (Patient)
 */
export const getAppointmentById = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id)
            .populate("patient", "fullName email phone")
            .populate("doctor", "fullName email phone specialization department");

        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        const patientId = appointment.patient?._id
            ? appointment.patient._id.toString()
            : appointment.patient.toString();

        if (patientId !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to access this appointment" });
        }

        return res.status(200).json(appointment);
    } catch (error) {
        return res.status(500).json({ message: error.message || "Server Error" });
    }
};

/**
 * @desc    Book / create a new appointment
 * @route   POST /api/patients/appointments
 * @access  Private (Patient)
 */
export const createAppointment = async (req, res) => {
    try {
        const { doctor, appointmentDate, timeSlot, department, reason, notes } = req.body;

        if (!doctor || !appointmentDate || !timeSlot || !department) {
            return res.status(400).json({
                message: "Please provide doctor, appointment date, time slot, and department",
            });
        }

        const appointment = await Appointment.create({
            patient: req.user._id,
            doctor,
            appointmentDate,
            timeSlot,
            department,
            reason: reason || "General Checkup",
            notes: notes || "",
            status: "Pending",
        });

        const populated = await Appointment.findById(appointment._id)
            .populate("patient", "fullName email phone")
            .populate("doctor", "fullName email phone specialization department");

        return res.status(201).json(populated);
    } catch (error) {
        return res.status(500).json({ message: error.message || "Server Error" });
    }
};

export const bookAppointment = createAppointment;

/**
 * @desc    Cancel an appointment by ID
 * @route   PUT /api/patients/appointments/:id/cancel
 * @access  Private (Patient)
 */
export const cancelAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        if (appointment.patient.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to cancel this appointment" });
        }

        if (["Completed", "Cancelled"].includes(appointment.status)) {
            return res.status(400).json({
                message: `Cannot cancel an appointment with status "${appointment.status}"`,
            });
        }

        appointment.status = "Cancelled";
        appointment.notes = appointment.notes
            ? `${appointment.notes} | Cancelled by patient`
            : "Cancelled by patient";

        await appointment.save();

        const populated = await Appointment.findById(appointment._id)
            .populate("patient", "fullName email phone")
            .populate("doctor", "fullName email phone specialization department");

        return res.status(200).json(populated);
    } catch (error) {
        return res.status(500).json({ message: error.message || "Server Error" });
    }
};

export const cancelMyAppointment = cancelAppointment;

/**
 * @desc    Get patient's medical records
 * @route   GET /api/patients/medical-records
 * @access  Private (Patient)
 */
export const getMedicalRecords = async (req, res) => {
    try {
        const records = await MedicalRecord.find({ patient: req.user._id })
            .populate("doctor", "fullName email phone specialization department")
            .sort({ createdAt: -1 });

        return res.status(200).json(records);
    } catch (error) {
        return res.status(500).json({ message: error.message || "Server Error" });
    }
};

export const getMyMedicalRecords = getMedicalRecords;
