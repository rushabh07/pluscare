import Billing from "../models/billingModel.js";

// @desc    Create a new billing invoice
// @route   POST /api/billing
// @access  Private (Admin, Receptionist)
export const createBilling = async (req, res) => {
    try {
        const { patient, appointment, items, tax, discount, paymentMethod, notes } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: "Billing must include at least one item." });
        }

        const subTotal = items.reduce((sum, item) => {
            item.total = item.quantity * item.unitPrice;
            return sum + item.total;
        }, 0);

        const totalAmount = subTotal + (tax || 0) - (discount || 0);

        const billing = await Billing.create({
            patient,
            appointment,
            items,
            subTotal,
            tax: tax || 0,
            discount: discount || 0,
            totalAmount,
            paymentMethod,
            notes,
            createdBy: req.user._id,
        });

        res.status(201).json(billing);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Get all billing records
// @route   GET /api/billing
// @access  Private (Admin, Receptionist)
export const getAllBilling = async (req, res) => {
    try {
        const bills = await Billing.find()
            .populate("patient", "name email")
            .populate("appointment", "date status")
            .populate("createdBy", "name")
            .sort({ createdAt: -1 });

        res.json(bills);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Get billing records for a specific patient
// @route   GET /api/billing/patient/:patientId
// @access  Private (Admin, Receptionist, the Patient themselves)
export const getBillingByPatient = async (req, res) => {
    try {
        const bills = await Billing.find({ patient: req.params.patientId })
            .populate("appointment", "date status")
            .sort({ createdAt: -1 });

        res.json(bills);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Get a single billing record by ID
// @route   GET /api/billing/:id
// @access  Private
export const getBillingById = async (req, res) => {
    try {
        const bill = await Billing.findById(req.params.id)
            .populate("patient", "name email phone")
            .populate("appointment", "date status")
            .populate("createdBy", "name");

        if (!bill) {
            return res.status(404).json({ message: "Invoice not found." });
        }

        res.json(bill);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Update payment status of a billing record
// @route   PUT /api/billing/:id/pay
// @access  Private (Admin, Receptionist)
export const updatePaymentStatus = async (req, res) => {
    try {
        const { paymentStatus, paymentMethod } = req.body;

        const bill = await Billing.findById(req.params.id);
        if (!bill) {
            return res.status(404).json({ message: "Invoice not found." });
        }

        bill.paymentStatus = paymentStatus || bill.paymentStatus;
        bill.paymentMethod = paymentMethod || bill.paymentMethod;

        if (paymentStatus === "Paid") {
            bill.paidAt = new Date();
        }

        await bill.save();
        res.json({ message: "Payment status updated.", bill });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Delete a billing record
// @route   DELETE /api/billing/:id
// @access  Private (Admin only)
export const deleteBilling = async (req, res) => {
    try {
        const bill = await Billing.findByIdAndDelete(req.params.id);
        if (!bill) {
            return res.status(404).json({ message: "Invoice not found." });
        }
        res.json({ message: "Invoice deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
