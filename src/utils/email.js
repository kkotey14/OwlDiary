import emailjs from "@emailjs/browser";

export const SendStudentACKEmail = async (name, email) => {
    console.log("Sending student email...");
    await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_ACK_EMAILJS_TEMPLATE_ID,
        {
            email: email,
            name: name,
            signup_message:
                "Thank you for registering for the SCSU Owl Diary for class WGS150.",
            pending_message:
                "Your account is currently pending review by Dr. Sarah Reeves. You will receive a follow-up email once your access has been approved or if further information is required.",
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
    );
};

export const SendAdminACKEmail = async (student) => {
    await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_ACK_EMAILJS_TEMPLATE_ID,
        {
            //change to reevess1@southernct.edu when production ready
            email: "Owl-Diary@outlook.com",
            name: "Sarah Reeves",
            student: student,
            signup_message: "",
            pending_message: `New user ${student} has signed up and is awaiting approval please navigate to your student management page to review their account.`,
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
    );
};

export const SendApprovalEmail = async (name, email) => {
    await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_APPROVAL_EMAILJS_TEMPLATE_ID,
        {
            email: email,
            name: name,
            descision_type: "approved",
            descision_inform:
                "Your Owl Diary account request has been approved!!",
            descision_message:
                "You now have full access to the Owl Diary platform for WGS150. You can log in using the credentials you created during registration and begin writing and sharing your diary entries.",
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
    );
};

export const SendRejectionEmail = async (name, email) => {
    await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_APPROVAL_EMAILJS_TEMPLATE_ID,
        {
            email: email,
            name: name,
            descision_type: "denied",
            descision_inform:
                "Your Owl Diary account request could not be approved.",
            descision_message:
                "We regret to inform you that your account registration for the SCSU Owl Diary has been rejected by Dr. Sarah Reeves. For more information regarding this decision, please contact the administrator.",
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
    );
};
