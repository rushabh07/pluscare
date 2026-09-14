import Appointment from "../models/appointmentModel.js";
import { sendAppointmentEmail } from "../services/emailService.js";

/**
 * @desc    Create new appointment
 * @route   POST /api/appointments
 * @access  Private (Patient/Admin/Receptionist)
 */
export const createAppointment = async (req, res) => {
    try {
        if (req.user && req.user.role === "Doctor") {
            return res.status(403).json({
                message: "Only patients can book appointments. Doctors can only view their assigned appointments.",
            });
        }

        const { doctor, appointmentDate, timeSlot, department, reason } = req.body;

        const appointment = new Appointment({
            patient: req.user._id,
            doctor,
            appointmentDate,
            timeSlot,
            department,
            reason: reason || "General Consultation",
        });

        const createdAppointment = await appointment.save();
        const populatedAppointment = await Appointment.findById(createdAppointment._id)
            .populate("patient", "fullName email phone")
            .populate("doctor", "fullName specialization department");

        // Send Email Notification (non-blocking)
        if (populatedAppointment && populatedAppointment.patient?.email) {
            sendAppointmentEmail(
                populatedAppointment,
                populatedAppointment.patient.email,
                populatedAppointment.patient.fullName,
                "booked"
            ).catch((err) => console.error("Appointment email error:", err.message));
        }

        res.status(201).json(populatedAppointment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get user appointments (Patient sees own, Doctor sees assigned, Admin sees all)
 * @route   GET /api/appointments
 * @access  Private
 */
export const getAppointments = async (req, res) => {
    try {
        let filter = {};

        if (req.user.role === "Patient") {
            filter = { patient: req.user._id };
        } else if (req.user.role === "Doctor") {
            filter = { doctor: req.user._id };
        }

        if (req.query.status) {
            filter.status = req.query.status;
        }

        if (req.query.date) {
            const startDate = new Date(req.query.date);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(req.query.date);
            endDate.setHours(23, 59, 59, 999);
            filter.appointmentDate = { $gte: startDate, $lte: endDate };
        }

        const appointments = await Appointment.find(filter)
            .populate("patient", "fullName email phone gender dob")
            .populate("doctor", "fullName specialization department")
            .sort({ appointmentDate: -1 });

        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get appointment by ID
 * @route   GET /api/appointments/:id
 * @access  Private
 */
export const getAppointmentById = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id)
            .populate("patient", "fullName email phone gender dob")
            .populate("doctor", "fullName specialization department");

        if (appointment) {
            if (
                req.user.role === "Doctor" &&
                appointment.doctor._id.toString() !== req.user._id.toString()
            ) {
                return res.status(403).json({ message: "Not authorized to view this appointment" });
            }
            res.json(appointment);
        } else {
            res.status(404).json({ message: "Appointment not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Update appointment status (Confirm/Cancel/Complete)
 * @route   PUT /api/appointments/:id/status
 * @access  Private (Doctor/Receptionist/Admin)
 */
export const updateAppointmentStatus = async (req, res) => {
    try {
        const { status, notes } = req.body;
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        // Authorization check: If logged in as Doctor, ensure this appointment belongs to req.user._id
        if (
            req.user.role === "Doctor" &&
            appointment.doctor.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({ message: "Not authorized to update this appointment" });
        }

        // Define valid status transitions
        const validTransitions = {
            Pending: ["Confirmed", "Cancelled"],
            Confirmed: ["Completed", "Cancelled"],
            Completed: [],
            Cancelled: [],
        };

        const currentStatus = appointment.status;

        // Prevent invalid status changes
        if (status && status !== currentStatus) {
            const allowed = validTransitions[currentStatus] || [];
            if (!allowed.includes(status)) {
                return res.status(400).json({
                    message: `Invalid status change: Cannot transition from '${currentStatus}' to '${status}'.`,
                });
            }
            appointment.status = status;
        }

        if (notes !== undefined) {
            appointment.notes = notes;
        }

        const updatedAppointment = await appointment.save();

        const populatedAppointment = await Appointment.findById(updatedAppointment._id)
            .populate("patient", "fullName email phone gender dob")
            .populate("doctor", "fullName specialization department");

        // Send Email Notification on status update (non-blocking)
        if (populatedAppointment && populatedAppointment.patient?.email && status) {
            sendAppointmentEmail(
                populatedAppointment,
                populatedAppointment.patient.email,
                populatedAppointment.patient.fullName,
                status
            ).catch((err) => console.error("Appointment status email error:", err.message));
        }

        res.json(populatedAppointment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Delete appointment
 * @route   DELETE /api/appointments/:id
 * @access  Private (Admin/Receptionist)
 */
export const deleteAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);

        if (appointment) {
            await appointment.deleteOne();
            res.json({ message: "Appointment removed successfully" });
        } else {
            res.status(404).json({ message: "Appointment not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
